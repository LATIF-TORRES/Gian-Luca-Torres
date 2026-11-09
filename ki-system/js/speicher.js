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
    aktiverChat: null
  };
}

var Z = (function laden() {
  var z = leererZustand();
  try {
    var roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
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
  } catch (e) { /* privates Fenster o. ä.: dann ohne Speicher */ }
  return z;
})();

function speichern() {
  try {
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(Z));
  } catch (e) {
    // Speicher voll: älteste Gespräche entfernen und nochmal versuchen.
    if (Z.chats.length > 1) {
      Z.chats.shift();
      speichern();
    }
  }
}

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
    teile.push("Was du über die Person weisst:\n" + Z.gedaechtnis.map(function (g) { return "- " + g.text; }).join("\n"));
  }
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
