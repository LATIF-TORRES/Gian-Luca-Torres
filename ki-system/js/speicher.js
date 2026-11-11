/* Speichert alles im Browser (localStorage). Nichts geht an einen Server. */

// Der alte Schlüssel bleibt, damit bereits gespeicherte Daten erhalten bleiben.
var SPEICHER_SCHLUESSEL = "torres-ki-v1";
var STANDARD_NAME = "A&T";
var VOLLER_NAME = "Amanah & Tijara";

function leererZustand() {
  return {
    einstellungen: {
      eingerichtet: false, besitzer: false,
      name: "", kiName: STANDARD_NAME, waehrung: "CHF", ziel: 0, warum: "",
      anbieter: "gemini", anbieterManuell: false, lokalModell: "", geminiSchluessel: "", geminiModell: "",
      schluessel: "", modell: "claude-opus-5-5", sprache: "de-CH",
      weckwort: false, sadaqaProzent: 5, websuche: true, vorlesen: false, tiefe: "medium"
    },
    gedaechtnis: [],   // {id, text, datum}
    aufgaben: [],      // {id, text, erledigt, wichtig, datum}
    buchungen: [],     // {id, art: "ein"|"aus", betrag, quelle, datum}
    chats: [],         // {id, titel, modus, nachrichten: [API-Nachrichten], kosten}
    depot: null,       // Übungs-Depot, siehe depot.js
    ueberweisungen: [],// vorbereitete Überweisungen (Revolut)
    dokumente: [],     // Akhi: {id, titel, art, inhalt (Markdown oder Text), datum}
    checklisten: [],   // Akhi: {id, titel, punkte: [{text, erledigt}], datum}
    businessplan: {},  // Akhi: Businessplan-Formular
    akhiChat: null,    // Akhi: eigenes Gespräch
    lernen: null,      // Lernen: Regeln, Rückblicke, Rückmeldungen (lernen.js)
    aktiverChat: null
  };
}

var Z = (function laden() {
  var z = leererZustand();
  var roh = null;
  try {
    roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
    if (roh) {
      var gespeichert = JSON.parse(roh);
      Object.keys(z).forEach(function (k) {
        if (gespeichert[k] !== undefined) z[k] = gespeichert[k];
      });
      z.einstellungen = Object.assign(leererZustand().einstellungen, gespeichert.einstellungen || {});
      // Wer schon einen Claude-Schlüssel hatte, bleibt bei Claude.
      if (!(gespeichert.einstellungen || {}).anbieter && z.einstellungen.schluessel) z.einstellungen.anbieter = "claude";
      // Wer die App schon benutzt, braucht den Einrichtungs-Assistenten nicht.
      if (!(gespeichert.einstellungen || {}).hasOwnProperty("eingerichtet") &&
          (z.einstellungen.name || z.einstellungen.schluessel || z.einstellungen.geminiSchluessel)) z.einstellungen.eingerichtet = true;
      // Die frühere Buchungsart „Reinigung“ gibt es nicht mehr: als normale Ausgabe behalten.
      z.buchungen.forEach(function (b) { if (b.art === "reinigung") b.art = "aus"; });
      if (z.einstellungen.kiName === "TORRES") z.einstellungen.kiName = STANDARD_NAME; // alter Arbeitstitel
    }
  } catch (e) {
    // Gespeicherte Daten nicht lesbar: Kopie aufheben, damit nichts endgültig verloren geht.
    try { if (roh) localStorage.setItem(SPEICHER_SCHLUESSEL + "-kopie-" + Date.now(), roh); } catch (e2) {}
  }
  // Hauptdaten fehlen oder sind kaputt, aber die kleine Basis-Sicherung ist da: Einstellungen und Schlüssel zurückholen.
  if (!z.einstellungen.eingerichtet) {
    try {
      var basis = JSON.parse(localStorage.getItem(SPEICHER_SCHLUESSEL + "-basis") || "null");
      if (basis && basis.einstellungen && basis.einstellungen.eingerichtet) {
        z.einstellungen = Object.assign(leererZustand().einstellungen, basis.einstellungen);
        if (basis.finnhubSchluessel) { z.depot = z.depot || {}; if (!z.depot.finnhubSchluessel) z.depot.finnhubSchluessel = basis.finnhubSchluessel; }
      }
    } catch (e) {}
  }
  return z;
})();

// Kompakt speichern: Der Hintergrund-Kontext (Depot, Wissen, Regeln) wird bei jeder Frage neu gebaut
// und muss nicht in jeder alten Nachricht mitgespeichert werden. Die Halal-Liste steckt schon in der App
// (halal-welt.js), gespeichert wird nur, was die Person selbst ergänzt oder geändert hat.
var KONTEXT_KURZ = "<kontext>(gekürzt)</kontext>";
function halalKompakt(liste) {
  var w = typeof welt === "function" ? welt() : {}, quellen = [], e = [];
  liste.forEach(function (h) {
    var qi = quellen.indexOf(h.quelle || ""); if (qi < 0) { qi = quellen.length; quellen.push(h.quelle || ""); }
    var ww = w[h.symbol], extra = null;
    Object.keys(h).forEach(function (k) {
      if (k === "symbol" || k === "datum" || k === "quelle") return;
      if (ww && ((k === "name" && h[k] === ww[1]) || (k === "land" && h[k] === ww[2]) || (k === "q" && h[k] === ww[3]))) return;
      if (k === "branche" && !h[k]) return;
      (extra = extra || {})[k] = h[k];
    });
    e.push(extra ? [h.symbol, h.datum || "", qi, extra] : [h.symbol, h.datum || "", qi]);
  });
  return { q: quellen, e: e };
}
function speicherText() {
  return JSON.stringify(Z, function (k, v) {
    if (typeof v === "string" && v.indexOf("<kontext>") !== -1) {
      if (k === "text" && v.indexOf("<kontext>") === 0 && v.indexOf("</kontext>") === v.length - 10) return KONTEXT_KURZ;
      if (k === "content" || k === "text") return v.replace(/<kontext>[\s\S]*?<\/kontext>/g, KONTEXT_KURZ);
    }
    if (k === "depot" && v && Array.isArray(v.halalListe) && v.halalListe.length > 50) {
      var kopie = {}; Object.keys(v).forEach(function (x) { if (x !== "halalListe") kopie[x] = v[x]; });
      kopie.halalListe = []; kopie.halalKompakt = halalKompakt(v.halalListe);
      return kopie;
    }
    return v;
  });
}
// Das Wichtigste (Einstellungen, Schlüssel, Freischaltung) zusätzlich klein und getrennt sichern.
function basisSichern() {
  try {
    var d = Z.depot || {};
    localStorage.setItem(SPEICHER_SCHLUESSEL + "-basis", JSON.stringify({ einstellungen: Z.einstellungen, finnhubSchluessel: d.finnhubSchluessel || "", zeit: Date.now() }));
  } catch (e) {}
}
var SPEICHER_PROBLEM = null;
function speichern() {
  basisSichern();
  for (var versuch = 0; versuch < 12; versuch++) {
    try {
      localStorage.setItem(SPEICHER_SCHLUESSEL, speicherText());
      SPEICHER_PROBLEM = null;
      return true;
    } catch (e) {
      // Speicher voll: zuerst alte Nachrichten kürzen, dann älteste Gespräche entfernen. Einstellungen bleiben immer.
      if (!platzSchaffen()) break;
    }
  }
  SPEICHER_PROBLEM = "voll";
  if (typeof toast === "function") toast("Achtung: Der Speicher im Browser ist voll. Lösche unter Ich ein paar Dokumente oder Gespräche.");
  return false;
}
function platzSchaffen() {
  var ak = Z.akhiChat;
  if (ak && ak.nachrichten && ak.nachrichten.length > 20) { ak.nachrichten = ak.nachrichten.slice(-20); kopfSauber(ak); return true; }
  if (Z.chats.length > 3) { Z.chats.shift(); return true; }
  var lang = Z.chats.filter(function (c) { return c.nachrichten && c.nachrichten.length > 10; })[0];
  if (lang) { lang.nachrichten = lang.nachrichten.slice(-10); kopfSauber(lang); return true; }
  if (Z.chats.length > 1) { Z.chats.shift(); return true; }
  if (ak && ak.nachrichten && ak.nachrichten.length > 4) { ak.nachrichten = ak.nachrichten.slice(-4); kopfSauber(ak); return true; }
  if (Z.dokumente && Z.dokumente.length > 5) { Z.dokumente.shift(); return true; }
  return false;
}
// Ein Verlauf muss mit einer Nachricht der Person beginnen.
function kopfSauber(c) { while (c.nachrichten.length && c.nachrichten[0].role !== "user") c.nachrichten.shift(); }

function neueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function heuteISO() {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function geld(betrag) {
  var w = Z.einstellungen.waehrung || "CHF";
  var n = Number(betrag) || 0;
  var minus = n < -0.004 ? "−" : ""; // „−CHF 660.50“ statt „CHF-660.50“
  try {
    return minus + new Intl.NumberFormat("de-CH", { style: "currency", currency: w, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n));
  } catch (e) {
    return minus + w + " " + Math.abs(Math.round(n * 100) / 100).toFixed(2);
  }
}

/* --- Aktionen, die auch die KI über Werkzeuge auslösen kann --- */

function merken(text) {
  text = String(text || "").trim();
  if (!text) return "Nichts zu merken.";
  var schon = Z.gedaechtnis.some(function (g) { return g.text.toLowerCase() === text.toLowerCase(); });
  if (schon) return "War schon gespeichert.";
  Z.gedaechtnis.push({ id: neueId(), text: text, datum: heuteISO() });
  speichern();
  return "Gespeichert: " + text;
}

function aufgabeAnlegen(text, wichtig, bereich) {
  text = String(text || "").trim();
  if (!text) return "Keine Aufgabe angegeben.";
  if (wichtig) Z.aufgaben.forEach(function (a) { a.wichtig = false; });
  Z.aufgaben.push({ id: neueId(), text: text, erledigt: false, wichtig: !!wichtig, datum: heuteISO(), bereich: bereich || "" });
  speichern();
  return "Aufgabe angelegt: " + text + (bereich ? " (" + bereich + ")" : "") + (wichtig ? " (wichtigste heute)" : "");
}

var BUCHUNGSARTEN = {
  ein: "Einnahme",
  aus: "Ausgabe",
  sadaqa: "Sadaqa"
};
var HALAL_STATUS = { halal: "halal", zweifelhaft: "zweifelhaft", nicht_halal: "nicht halal" };

/*
 * art: ein = Einnahme, aus = Ausgabe, sadaqa = Sadaqa, die die Person selbst gegeben hat.
 * halal: nur bei Einnahmen: halal, zweifelhaft oder nicht_halal.
 * Es wird nie automatisch etwas abgezogen: Hier steht nur, was die Person selbst einträgt.
 */
function buchungEintragen(art, betrag, quelle, datum, halal) {
  betrag = Number(betrag);
  if (!(betrag > 0)) return "Betrag fehlt oder ist ungültig.";
  if (!BUCHUNGSARTEN[art]) return "Art muss ein, aus oder sadaqa sein.";
  var d = /^\d{4}-\d{2}-\d{2}$/.test(datum || "") ? datum : heuteISO();
  var b = { id: neueId(), art: art, betrag: Math.round(betrag * 100) / 100, quelle: String(quelle || "Ohne Angabe").trim(), datum: d };
  if (art === "ein") b.halal = HALAL_STATUS[halal] ? halal : "halal";
  Z.buchungen.push(b);
  speichern();
  return BUCHUNGSARTEN[art] + " " + geld(betrag) + " eingetragen (" + d.split("-").reverse().join(".") + ").";
}

/* --- Auswertungen --- */

function monatsZahlen(jahrMonat) {
  var ym = jahrMonat || heuteISO().slice(0, 7);
  var ein = 0, einHalal = 0, aus = 0, sadaqa = 0, quellen = {};
  Z.buchungen.forEach(function (b) {
    if (b.datum.slice(0, 7) !== ym) return;
    if (b.art === "ein") {
      ein += b.betrag;
      if (b.halal !== "nicht_halal") einHalal += b.betrag; // fürs Monatsziel zählt nur Erlaubtes
      quellen[b.quelle] = (quellen[b.quelle] || 0) + b.betrag;
    } else {
      aus += b.betrag; // selbst eingetragene Ausgaben und gegebene Sadaqa
      if (b.art === "sadaqa") sadaqa += b.betrag;
    }
  });
  return { ein: ein, einHalal: einHalal, aus: aus, sadaqa: sadaqa, saldo: ein - aus, quote: ein > 0 ? (ein - aus) / ein : 0, quellen: quellen };
}

// Sadaqa-Vorschlag: nur eine Empfehlung, wie viel man zur Seite legen könnte. Es wird nichts abgezogen.
function sadaqaVorschlag(jahrMonat) {
  var m = monatsZahlen(jahrMonat);
  var prozent = Number(Z.einstellungen.sadaqaProzent) || 0;
  var vorschlag = Math.round(m.einHalal * prozent) / 100;
  return { prozent: prozent, vorschlag: vorschlag, gegeben: m.sadaqa, einnahmen: m.einHalal };
}

function kontextFuerKi() {
  var e = Z.einstellungen, m = monatsZahlen();
  var teile = [];
  teile.push("Heute ist " + new Date().toLocaleDateString("de-CH", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ".");
  if (e.name) teile.push("Die Person heisst " + e.name + ".");
  teile.push("Währung: " + e.waehrung + ".");
  if (e.ziel) teile.push("Monatsziel Einnahmen: " + geld(e.ziel) + ".");
  if (e.warum) teile.push("Wofür sie Geld verdienen will: " + e.warum);
  teile.push("Dieser Monat bisher: Einnahmen " + geld(m.ein) + ", Ausgaben " + geld(m.aus) + " (davon Sadaqa " + geld(m.sadaqa) + "), Saldo " + geld(m.saldo) + ".");
  var sv = sadaqaVorschlag();
  if (sv.prozent > 0) teile.push("Sadaqa-Vorschlag diesen Monat (freiwillig, nur ein Vorschlag): " + sv.prozent + " % der Einnahmen = " + geld(sv.vorschlag) + ", selbst eingetragen gegeben: " + geld(sv.gegeben) + ".");
  var q = Object.keys(m.quellen);
  if (q.length) teile.push("Einnahmequellen diesen Monat: " + q.map(function (k) { return k + " " + geld(m.quellen[k]); }).join(", ") + ".");
  if (Z.gedaechtnis.length) {
    teile.push("Was du über die Person weisst:\n" + Z.gedaechtnis.slice(-40).map(function (g) { return "- " + g.text; }).join("\n"));
  }
  if (typeof lernKontext === "function") { var lk = lernKontext(); if (lk) teile.push(lk); }
  if (istBesitzer() && typeof depotKurzFuerKi === "function") teile.push(depotKurzFuerKi());
  var offen = Z.aufgaben.filter(function (a) { return !a.erledigt; });
  if (offen.length) {
    teile.push("Offene Aufgaben:\n" + offen.slice(-15).map(function (a) { return "- " + a.text + (a.wichtig ? " (wichtigste)" : ""); }).join("\n"));
  }
  return teile.join("\n");
}

function hatSchluessel() {
  var e = Z.einstellungen;
  if (e.anbieter === "lokal") return true; // braucht keinen Schlüssel
  return e.anbieter === "claude" ? !!e.schluessel : !!e.geminiSchluessel;
}

// Besitzer-Modus: Depot und Überweisungen gibt es nur für den Besitzer, Kunden sehen sie nicht.
function istBesitzer() { return Z.einstellungen.besitzer === true; }
