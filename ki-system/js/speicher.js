/* Speichert alles im Browser (localStorage). Nichts geht an einen Server. */

var SPEICHER_SCHLUESSEL = "torres-ki-v1";

function leererZustand() {
  return {
    einstellungen: {
      name: "", kiName: "TORRES", waehrung: "CHF", ziel: 0, warum: "",
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
  try {
    return new Intl.NumberFormat("de-CH", { style: "currency", currency: w, maximumFractionDigits: 2 }).format(betrag || 0);
  } catch (e) {
    return w + " " + (Math.round((betrag || 0) * 100) / 100);
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

function buchungEintragen(art, betrag, quelle, datum) {
  betrag = Number(betrag);
  if (!(betrag > 0)) return "Betrag fehlt oder ist ungültig.";
  if (art !== "ein" && art !== "aus") return "Art muss \"ein\" oder \"aus\" sein.";
  var d = /^\d{4}-\d{2}-\d{2}$/.test(datum || "") ? datum : heuteISO();
  Z.buchungen.push({ id: neueId(), art: art, betrag: Math.round(betrag * 100) / 100, quelle: String(quelle || "Ohne Angabe").trim(), datum: d });
  speichern();
  return (art === "ein" ? "Einnahme " : "Ausgabe ") + geld(betrag) + " eingetragen (" + d.split("-").reverse().join(".") + ").";
}

/* --- Auswertungen --- */

function monatsZahlen(jahrMonat) {
  var ym = jahrMonat || heuteISO().slice(0, 7);
  var ein = 0, aus = 0, quellen = {};
  Z.buchungen.forEach(function (b) {
    if (b.datum.slice(0, 7) !== ym) return;
    if (b.art === "ein") {
      ein += b.betrag;
      quellen[b.quelle] = (quellen[b.quelle] || 0) + b.betrag;
    } else {
      aus += b.betrag;
    }
  });
  return { ein: ein, aus: aus, saldo: ein - aus, quote: ein > 0 ? (ein - aus) / ein : 0, quellen: quellen };
}

function kontextFuerKi() {
  var e = Z.einstellungen, m = monatsZahlen();
  var teile = [];
  teile.push("Heute ist " + new Date().toLocaleDateString("de-CH", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ".");
  if (e.name) teile.push("Die Person heisst " + e.name + ".");
  teile.push("Währung: " + e.waehrung + ".");
  if (e.ziel) teile.push("Monatsziel Einnahmen: " + geld(e.ziel) + ".");
  if (e.warum) teile.push("Wofür sie Geld verdienen will: " + e.warum);
  teile.push("Dieser Monat bisher: Einnahmen " + geld(m.ein) + ", Ausgaben " + geld(m.aus) + ", Saldo " + geld(m.saldo) + ".");
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
