/* Speichert alles im Browser (localStorage). Nichts geht an einen Server. */

// Der alte Schlüssel bleibt, damit bereits gespeicherte Daten erhalten bleiben.
var SPEICHER_SCHLUESSEL = "torres-ki-v1";
var STANDARD_NAME = "A&T";
var VOLLER_NAME = "Amanah & Tijara";

function leererZustand() {
  return {
    einstellungen: {
      eingerichtet: false,
      name: "", kiName: STANDARD_NAME, waehrung: "CHF", ziel: 0, warum: "",
      anbieter: "gemini", geminiSchluessel: "", geminiModell: "",
      schluessel: "", modell: "claude-opus-5-5", sprache: "de-CH",
      weckwort: false, websuche: true, vorlesen: false, tiefe: "medium"
    },
    gedaechtnis: [],   // {id, text, datum}
    aufgaben: [],      // {id, text, erledigt, wichtig, datum}
    buchungen: [],     // {id, art: "ein"|"aus", betrag, quelle, datum}
    chats: [],         // {id, titel, modus, nachrichten: [API-Nachrichten], kosten}
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

function aufgabeAnlegen(text, wichtig) {
  text = String(text || "").trim();
  if (!text) return "Keine Aufgabe angegeben.";
  if (wichtig) Z.aufgaben.forEach(function (a) { a.wichtig = false; });
  Z.aufgaben.push({ id: neueId(), text: text, erledigt: false, wichtig: !!wichtig, datum: heuteISO() });
  speichern();
  return "Aufgabe angelegt: " + text + (wichtig ? " (wichtigste heute)" : "");
}

var BUCHUNGSARTEN = {
  ein: "Einnahme",
  aus: "Ausgabe",
  sadaqa: "Sadaqa",
  reinigung: "Reinigung"
};
var HALAL_STATUS = { halal: "halal", zweifelhaft: "zweifelhaft", nicht_halal: "nicht halal" };

/*
 * art: ein = Einnahme, aus = Ausgabe, sadaqa = freiwillige Spende,
 *      reinigung = unerlaubtes Geld (z. B. Zinsen) ohne Absicht auf Lohn weggeben.
 * halal: nur bei Einnahmen: halal, zweifelhaft oder nicht_halal.
 */
function buchungEintragen(art, betrag, quelle, datum, halal) {
  betrag = Number(betrag);
  if (!(betrag > 0)) return "Betrag fehlt oder ist ungültig.";
  if (!BUCHUNGSARTEN[art]) return "Art muss ein, aus, sadaqa oder reinigung sein.";
  var d = /^\d{4}-\d{2}-\d{2}$/.test(datum || "") ? datum : heuteISO();
  var b = { id: neueId(), art: art, betrag: Math.round(betrag * 100) / 100, quelle: String(quelle || "Ohne Angabe").trim(), datum: d };
  if (art === "ein") b.halal = HALAL_STATUS[halal] ? halal : "halal";
  Z.buchungen.push(b);
  speichern();
  var text = BUCHUNGSARTEN[art] + " " + geld(betrag) + " eingetragen (" + d.split("-").reverse().join(".") + ")";
  if (b.halal === "nicht_halal") text += ". Diesen Betrag solltest du zur Reinigung weggeben";
  return text + ".";
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
      aus += b.betrag; // Ausgaben, Sadaqa und Reinigung verlassen die Kasse
      if (b.art === "sadaqa") sadaqa += b.betrag;
    }
  });
  return { ein: ein, einHalal: einHalal, aus: aus, sadaqa: sadaqa, saldo: ein - aus, quote: ein > 0 ? (ein - aus) / ein : 0, quellen: quellen };
}

// Reinigung über alle Monate: unerlaubte Einnahmen minus bereits weggegebene Beträge.
function reinigungStand() {
  var nichtHalal = 0, zweifelhaft = 0, gegeben = 0;
  Z.buchungen.forEach(function (b) {
    if (b.art === "ein" && b.halal === "nicht_halal") nichtHalal += b.betrag;
    if (b.art === "ein" && b.halal === "zweifelhaft") zweifelhaft += b.betrag;
    if (b.art === "reinigung") gegeben += b.betrag;
  });
  return { nichtHalal: nichtHalal, zweifelhaft: zweifelhaft, gegeben: gegeben, offen: Math.max(0, nichtHalal - gegeben) };
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
  var r = reinigungStand();
  if (r.offen > 0) teile.push("Noch zur Reinigung wegzugeben (unerlaubte Einnahmen): " + geld(r.offen) + ".");
  if (r.zweifelhaft > 0) teile.push("Einnahmen mit zweifelhaftem Halal-Status: " + geld(r.zweifelhaft) + ".");
  var q = Object.keys(m.quellen);
  if (q.length) teile.push("Einnahmequellen diesen Monat: " + q.map(function (k) { return k + " " + geld(m.quellen[k]); }).join(", ") + ".");
  if (Z.gedaechtnis.length) {
    teile.push("Was du über die Person weisst:\n" + Z.gedaechtnis.map(function (g) { return "- " + g.text; }).join("\n"));
  }
  var offen = Z.aufgaben.filter(function (a) { return !a.erledigt; });
  if (offen.length) {
    teile.push("Offene Aufgaben:\n" + offen.slice(-15).map(function (a) { return "- " + a.text + (a.wichtig ? " (wichtigste)" : ""); }).join("\n"));
  }
  return teile.join("\n");
}

function hatSchluessel() {
  var e = Z.einstellungen;
  return e.anbieter === "claude" ? !!e.schluessel : !!e.geminiSchluessel;
}
