# 🇩🇪 Hallo Deutsch! – Deutschkurs für Englisch- und Französischsprachige

Eine Web-App, mit der Erwachsene von null an Deutsch lernen (Niveau A1).
Die Erklärungen sind auf **Englisch oder Französisch**, die Lernenden wählen selbst.
Der Kurs ist ein **Wochen-Abo für 9.99 €**. Das Geld geht über **Stripe** direkt auf dein Bankkonto.

## Was die App kann

| Bereich | Inhalt |
| --- | --- |
| Kurs | 12 Einheiten, 48 Lektionen, 144 Wörter, 74 Sätze, 12 Grammatik-Tipps |
| Hören | Jedes Wort und jeder Satz wird vorgelesen, auch langsam (🐢) |
| Sprechen | Die Lernenden sprechen ins Mikrofon, die App prüft die Aussprache |
| Bilder | „Was ist auf dem Bild? Schreibe es auf Deutsch.“ |
| Tippen | Mit Tasten für ä, ö, ü. Kleine Tippfehler werden verziehen und erklärt |
| Spiele | Paare finden, Sätze aus Wörtern bauen, Lückensätze, 60-Sekunden-Spiel |
| Motivation | XP-Punkte, Tage in Folge (🔥), Konfetti, Töne |
| Wiederholen | „Fehler wiederholen“ übt genau die Wörter, die falsch waren |
| Zugang | Konto mit E-Mail oder Google. Lektion 1 ist gratis, danach Abo |
| Support | Knopf „Hilfe auf WhatsApp“, nur für Zahlende sichtbar |
| Schutz | Seite ist nicht bei Google auffindbar. Kursinhalt bekommt nur, wer bezahlt |

### Die Einheiten (A1)

1. Hallo! – Begrüssen, sich vorstellen, du/Sie
2. Zahlen – 0–20, Alter, Verb *sein*
3. Familie – der/die/das, mein/meine, *haben*
4. Essen und Trinken – bestellen, *einen/eine/ein*
5. Farben und Kleidung – Plural
6. Zuhause – Wohnung, *Wo ist …?*
7. Stadt und Verkehr – Weg fragen, *mit dem Zug*
8. Zeit und Tage – Uhrzeit, Wochentage, Verb an Position 2
9. Einkaufen – Preise, bezahlen, *können*
10. Arbeit und Berufe – Beruf nennen, *-in*, Verbendungen
11. Körper und Gesundheit – beim Arzt, *tut weh*
12. Freizeit und Wetter – Hobbys mit *gern*, Wetter

Jede Einheit hat 4 Lektionen: **Neue Wörter 1**, **Neue Wörter 2**, **Sätze**, **Hören und Sprechen**.
Eine Lektion dauert etwa 5 Minuten.

---

## Sofort ausprobieren (Demo, ohne Einrichtung)

Du brauchst nur Python (ist auf Mac schon installiert).

```bash
cd deutsch-app
python3 -m http.server 8080
```

Öffne im Browser **http://localhost:8080/web/**.
Mit **http://localhost:8080/web/?unlock** sind alle Lektionen offen.

Im Demo-Modus gibt es kein Login und keine Zahlung. Der Fortschritt bleibt nur in diesem Browser.
Zum Sprechen am besten **Chrome** oder **Safari** nehmen.

---

## Online stellen mit Bezahlung (einmal einrichten, ca. 1 Stunde)

Du brauchst: ein Google-Konto, eine Kreditkarte (für Firebase) und dein Bankkonto (IBAN für Stripe).

### Schritt 1: Firebase-Projekt anlegen

1. Gehe auf <https://console.firebase.google.com> → **Projekt hinzufügen** → Name z. B. `hallo-deutsch`.
2. Links **Build → Authentication** → **Jetzt starten** → **E-Mail/Passwort** aktivieren. Danach auch **Google** aktivieren.
3. Links **Build → Firestore Database** → **Datenbank erstellen** → Standort **europe-west6 (Zürich)** → **Produktionsmodus**.
4. Unten links **Upgrade** → Tarif **Blaze** wählen. Das braucht es für die Cloud Functions.
   Für einen kleinen Kurs bleibt es fast immer im Gratis-Kontingent (0 €). Setze trotzdem ein Budget-Limit, z. B. 5 €.

### Schritt 2: Firebase-Werte in die App eintragen

1. In Firebase: Zahnrad ⚙️ → **Projekteinstellungen** → unten **Meine Apps** → Symbol **</>** (Web) → Name `web` → **App registrieren**.
2. Du siehst einen Block `firebaseConfig = { apiKey: "…", … }`.
3. Öffne die Datei `web/js/config.js` und kopiere die sechs Werte hinein (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
4. Kopiere die Datei `.firebaserc.example` nach `.firebaserc` und ersetze `DEINE-FIREBASE-PROJEKT-ID` durch deine Projekt-ID.

### Schritt 3: Stripe einrichten (dahin geht das Geld)

1. Konto erstellen auf <https://dashboard.stripe.com/register>. Stripe fragt nach deinen Angaben und deiner **IBAN**. Dorthin zahlt Stripe automatisch aus.
2. **Produktkatalog → Produkt hinzufügen**:
   - Name: `Hallo Deutsch! – Deutschkurs A1`
   - Preis: **9.99 EUR**, **Wiederkehrend**, Abrechnungszeitraum **Wöchentlich**
   - Speichern. Kopiere die **Preis-ID** (beginnt mit `price_…`).
3. **Entwickler → API-Schlüssel** → kopiere den **Geheimschlüssel** (beginnt mit `sk_live_…`, zum Testen `sk_test_…`).
4. **Einstellungen → Billing → Kundenportal** → **Aktivieren**. Erlaube „Abo kündigen“ und „Zahlungsmethode ändern“. Damit können die Lernenden selbst kündigen.
5. **Einstellungen → Zahlungsmethoden**: Karten, Apple Pay und Google Pay einschalten.
   (TWINT geht bei Stripe nur für Einmalzahlungen, nicht für Wochen-Abos.)

> 💡 Tipp: Mache zuerst alles im **Testmodus** (Schalter oben rechts in Stripe). Testkarte: `4242 4242 4242 4242`, beliebiges Datum in der Zukunft, beliebiger CVC. Wenn alles klappt, wiederholst du Schritt 3 und 5 im Live-Modus.

### Schritt 4: Hochladen (Deploy)

Einmal installieren:

```bash
npm install -g firebase-tools
firebase login
```

Dann im Ordner `deutsch-app`:

```bash
cd functions && npm install && cd ..

# Geheime Schlüssel speichern (werden nie ins Repo geschrieben)
firebase functions:secrets:set STRIPE_SECRET_KEY        # sk_… einfügen
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET    # vorerst "x" eingeben, kommt in Schritt 5

firebase deploy
```

Beim ersten `firebase deploy` fragt Firebase nach:
- `STRIPE_PRICE_ID` → deine `price_…`
- `WHATSAPP_NUMBER` → deine Nummer **nur mit Ziffern**, mit Ländervorwahl, ohne `+` und ohne Leerzeichen, z. B. `41791234567`

Diese Werte landen in `functions/.env.<projekt-id>`. Die Datei wird nicht ins Repo hochgeladen.

Am Ende steht da: **Hosting URL: https://hallo-deutsch.web.app**. Das ist dein Link.

### Schritt 5: Stripe mit der App verbinden (Webhook)

1. In Stripe: **Entwickler → Webhooks → Endpunkt hinzufügen**.
2. URL: `https://DEIN-PROJEKT.web.app/api/stripe-webhook`
3. Ereignisse auswählen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
4. Speichern → **Signaturgeheimnis anzeigen** (beginnt mit `whsec_…`) → kopieren.
5. Im Terminal:

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET    # whsec_… einfügen
firebase deploy --only functions
```

### Schritt 6: Testen und teilen

1. Öffne deinen Link, erstelle ein Konto und mache Lektion 1 (gratis).
2. Danach erscheint die Bezahlseite → mit der Testkarte bezahlen.
3. Nach ein paar Sekunden ist der ganze Kurs offen, und im Profil erscheint „Hilfe auf WhatsApp“.
4. Teile den Link (z. B. per WhatsApp oder Instagram). Wer den Link hat, kann ein Konto machen. Lernen über Lektion 1 hinaus geht aber nur mit Abo.

---

## So funktioniert die Bezahlung

```
Lernende/r ──► „Jetzt abonnieren“ ──► Stripe-Bezahlseite ──► bezahlt
                                                  │
                         Stripe meldet: Abo aktiv ▼
                         Cloud Function speichert Status in Firestore (customers/{uid})
                                                  │
App fragt „Kurs laden“ ──► Cloud Function prüft Status ──► ganzer Kurs (oder nur Gratis-Lektion)
```

- Jede Woche bucht Stripe automatisch 9.99 € ab.
- Wenn jemand kündigt oder nicht mehr zahlt, ist der Kurs automatisch wieder gesperrt.
- Kündigen: Profil → „Abo verwalten oder kündigen“ (Stripe-Kundenportal).
- Deine Einnahmen siehst du im Stripe-Dashboard. Stripe behält pro Zahlung eine Gebühr (je nach Land und Karte etwa 1.5–3 % plus ein paar Rappen). Die genauen Preise stehen auf stripe.com/pricing.
- Wer zahlt und wann, siehst du in Stripe unter **Kunden**.

## Was du noch brauchst, bevor du verkaufst

Wenn du online etwas verkaufst, brauchst du auf der Seite in der Regel ein **Impressum**, **AGB** und eine **Datenschutzerklärung**.
Das kann ich nicht für dich rechtlich prüfen. Lass das kurz von einer Fachperson anschauen. Die Links kannst du danach in Stripe unter **Einstellungen → Öffentliche Angaben** eintragen. Dann erscheinen sie auch auf der Bezahlseite.

## Inhalte ändern oder erweitern

Alle Wörter, Sätze und Tipps stehen in **`functions/content/course.js`**.

- Ein Wort: `w('der Apfel', 'the apple', 'la pomme', '🍎')`
- Ein Satz: `s('Ich trinke Wasser.', 'I drink water.', "Je bois de l'eau.")`
- Jede Einheit braucht **12 Wörter** (Lektion 1 = Wörter 1–6, Lektion 2 = Wörter 7–12).
- Für neue Niveaus (A2, B1) einfach weitere Einheiten anhängen.

Nach jeder Änderung: `npm test` (prüft alle Lektionen) und dann `firebase deploy`.

## Ordner

```
deutsch-app/
├── web/                     Die App (wird auf Firebase Hosting veröffentlicht)
│   ├── index.html
│   ├── styles.css
│   └── js/
│       ├── config.js        ⚙️ Deine Firebase-Werte und der angezeigte Preis
│       ├── app.js           Anmeldung, Lernpfad, Bezahlseite, Profil
│       ├── player.js        Alle Übungsarten
│       ├── lessons.js       Stellt die Übungen einer Lektion zusammen
│       ├── speech.js        Vorlesen und Spracherkennung
│       ├── store.js         Fortschritt (XP, Serie, Fehler)
│       ├── i18n.js          Texte auf Englisch und Französisch
│       ├── backend.js       Verbindung zu Firebase
│       ├── fx.js            Töne und Konfetti
│       └── util.js          Antworten prüfen
├── functions/               Server (Cloud Functions)
│   ├── index.js             Stripe-Abo, Webhook, Kurs nur für Zahlende
│   └── content/course.js    📚 Der ganze Kursinhalt
├── test/core.test.js        Tests (npm test)
├── firebase.json
└── firestore.rules          Wer darf was in der Datenbank
```

## Gut zu wissen

- **Sprechen** funktioniert in Chrome (Android, Computer) und Safari (iPhone, Mac). In Firefox fehlt die Spracherkennung. Dort gibt es stattdessen Hörübungen.
- **Vorlesen** nutzt die deutsche Stimme des Geräts. Auf fast allen Handys ist eine vorhanden.
- **„Ich kann gerade nicht sprechen“** schaltet die Sprechübungen für 15 Minuten aus (z. B. im Zug).
- Die App lässt sich auf dem Handy über „Zum Home-Bildschirm“ wie eine App speichern.
