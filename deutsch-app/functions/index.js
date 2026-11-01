// Cloud Functions für „Hallo Deutsch!“
//
// getCourse       – liefert den Kurs. Mit aktivem Abo alles, sonst nur die Gratis-Lektion.
// createCheckout  – startet die Stripe-Bezahlseite für das Wochen-Abo.
// createPortal    – öffnet das Stripe-Kundenportal (Abo kündigen, Karte ändern, Rechnungen).
// stripeWebhook   – Stripe meldet hier jede Änderung am Abo. Speichert den Status in Firestore.
//
// Der Abo-Status steht in Firestore unter customers/{uid}. Nur diese Functions dürfen ihn schreiben.

import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { defineSecret, defineString } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { COURSE, trialCourse } from './content/course.js';

initializeApp();
const db = getFirestore();

// Zürich. Muss mit functionsRegion in web/js/config.js und mit firebase.json übereinstimmen.
setGlobalOptions({ region: 'europe-west6', maxInstances: 10 });

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
const STRIPE_PRICE_ID = defineString('STRIPE_PRICE_ID', { description: 'Stripe-Preis-ID des Wochen-Abos (price_…)' });
const WHATSAPP_NUMBER = defineString('WHATSAPP_NUMBER', { default: '', description: 'WhatsApp-Nummer nur mit Ziffern und Ländervorwahl, z. B. 41791234567' });

// Diese Status geben Zugang zum ganzen Kurs.
const ACTIVE = ['active', 'trialing'];

const stripe = () => new Stripe(STRIPE_SECRET_KEY.value());

function requireUser(req) {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Bitte zuerst anmelden.');
  return req.auth.uid;
}

// Nur Adressen der eigenen App als Rücksprung erlauben.
function returnUrl(origin, req) {
  const host = req.rawRequest?.headers?.origin;
  try {
    const u = new URL(origin);
    if (host && u.origin !== host) throw new Error('origin');
    return u.origin + u.pathname;
  } catch {
    throw new HttpsError('invalid-argument', 'Ungültige Adresse.');
  }
}

async function isPremium(uid) {
  const snap = await db.doc(`customers/${uid}`).get();
  return snap.exists && ACTIVE.includes(snap.data().status);
}

export const getCourse = onCall(async (req) => {
  const uid = requireUser(req);
  const premium = await isPremium(uid);
  return {
    premium,
    course: premium ? COURSE : trialCourse(),
    whatsapp: premium ? WHATSAPP_NUMBER.value().replace(/\D/g, '') : '',
  };
});

async function getOrCreateCustomer(uid, email) {
  const ref = db.doc(`customers/${uid}`);
  const snap = await ref.get();
  if (snap.exists && snap.data().stripeCustomerId) return snap.data().stripeCustomerId;
  const customer = await stripe().customers.create({ email, metadata: { uid } });
  await ref.set({ stripeCustomerId: customer.id, email: email || null, createdAt: FieldValue.serverTimestamp() }, { merge: true });
  return customer.id;
}

export const createCheckout = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (req) => {
  const uid = requireUser(req);
  const base = returnUrl(req.data?.origin, req);
  if (await isPremium(uid)) {
    // Schon Abo: direkt ins Kundenportal
    const snap = await db.doc(`customers/${uid}`).get();
    const portal = await stripe().billingPortal.sessions.create({ customer: snap.data().stripeCustomerId, return_url: base });
    return { url: portal.url };
  }
  const customer = await getOrCreateCustomer(uid, req.auth.token.email);
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer,
    client_reference_id: uid,
    line_items: [{ price: STRIPE_PRICE_ID.value(), quantity: 1 }],
    subscription_data: { metadata: { uid } },
    allow_promotion_codes: true,
    success_url: `${base}?checkout=success`,
    cancel_url: `${base}?checkout=cancel`,
  });
  return { url: session.url };
});

export const createPortal = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (req) => {
  const uid = requireUser(req);
  const base = returnUrl(req.data?.origin, req);
  const snap = await db.doc(`customers/${uid}`).get();
  const customer = snap.exists ? snap.data().stripeCustomerId : null;
  if (!customer) throw new HttpsError('failed-precondition', 'Kein Abo gefunden.');
  const portal = await stripe().billingPortal.sessions.create({ customer, return_url: base });
  return { url: portal.url };
});

// Findet den Benutzer zu einem Stripe-Kunden.
async function uidFor(obj) {
  if (obj.metadata?.uid) return obj.metadata.uid;
  if (obj.client_reference_id) return obj.client_reference_id;
  const customerId = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id;
  if (!customerId) return null;
  const q = await db.collection('customers').where('stripeCustomerId', '==', customerId).limit(1).get();
  if (!q.empty) return q.docs[0].id;
  const c = await stripe().customers.retrieve(customerId);
  return c.metadata?.uid || null;
}

async function saveSubscription(sub) {
  const uid = await uidFor(sub);
  if (!uid) return console.warn('Kein Benutzer für Abo', sub.id);
  await db.doc(`customers/${uid}`).set(
    {
      stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      subscriptionId: sub.id,
      status: sub.status,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

export const stripeWebhook = onRequest({ secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] }, async (req, res) => {
  let event;
  try {
    event = stripe().webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET.value());
  } catch (e) {
    console.warn('Webhook-Signatur ungültig', e.message);
    return res.status(400).send('Bad signature');
  }
  try {
    const obj = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
        if (obj.subscription) await saveSubscription(await stripe().subscriptions.retrieve(obj.subscription));
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
        // Immer den aktuellen Stand holen, falls Ereignisse in falscher Reihenfolge kommen.
        await saveSubscription(await stripe().subscriptions.retrieve(obj.id));
        break;
      default:
        break;
    }
    res.json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});
