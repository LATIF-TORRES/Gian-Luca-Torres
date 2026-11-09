/*
 * Echtgeld mit Yuh, halbautomatisch.
 * Yuh hat keine Schnittstelle: A&T entscheidet wie im Übungs-Depot, gibt die Order aber nicht selbst auf.
 * Stattdessen entsteht ein Vorschlag (Order-Karte). Die Person kauft oder verkauft in der Yuh-App und
 * bestätigt in A&T. Danach überwacht A&T die echte Position (Stop, nachziehender Stop, Gewinnziel)
 * und schlägt den Verkauf vor. Es fliesst nie Geld ohne die Person.
 * Halal-Regeln wie im Übungs-Depot: nur Halal-Liste, nur eigenes Geld, keine Leerverkäufe.
 */

var YUH = { letzte: 0 };

function yuh() {
  var d = depot();
  if (!d.yuh || typeof d.yuh !== "object") d.yuh = {};
  var std = { an: false, bargeld: 0, positionen: {}, vorschlaege: [], verlauf: [], nichtVerfuegbar: [] };
  Object.keys(std).forEach(function (k) { if (d.yuh[k] === undefined) d.yuh[k] = std[k]; });
  return d.yuh;
}
function yuhAn() { return istBesitzer() && yuh().an; }

/* ---------- Benachrichtigen (Handy und Laptop) ---------- */
function yuhMelden(titel, text) {
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      var opt = { body: text, tag: "a-und-t-" + titel, icon: "a-und-t-192.png", renotify: true };
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
        navigator.serviceWorker.getRegistration().then(function (reg) {
          if (reg && reg.showNotification) reg.showNotification(titel, opt); else new Notification(titel, opt);
        }).catch(function () { try { new Notification(titel, opt); } catch (e) {} });
      } else new Notification(titel, opt);
    }
  } catch (e) {}
  if (navigator.vibrate) try { navigator.vibrate([200, 100, 200]); } catch (e) {}
  var el = document.querySelector("#toast");
  if (el) { el.textContent = titel + ": " + text; el.classList.add("sichtbar"); setTimeout(function () { el.classList.remove("sichtbar"); }, 6000); }
}
async function yuhBenachrichtigungenErlauben() {
  if (typeof Notification === "undefined") return "Dieser Browser kann keine Benachrichtigungen. Auf dem iPhone: A&T erst über Teilen → „Zum Home-Bildschirm“ hinzufügen und von dort öffnen.";
  var p = await Notification.requestPermission();
  if (p === "granted") { yuhMelden("A&T", "Benachrichtigungen sind an."); return "Benachrichtigungen sind an."; }
  return "Benachrichtigungen sind blockiert. Erlaube sie in den Browser-Einstellungen für diese Seite.";
}

/* ---------- Vorschläge ---------- */
var YUH_GUELTIG_MIN = 30; // Kaufvorschläge verfallen nach 30 Minuten (Kurs ändert sich)

function yuhOffen() {
  var y = yuh(), jetzt = Date.now(), geaendert = false;
  y.vorschlaege.forEach(function (v) {
    if (v.status === "offen" && v.seite === "kauf" && jetzt - Date.parse(v.zeit) > YUH_GUELTIG_MIN * 60000) { v.status = "abgelaufen"; geaendert = true; }
  });
  if (y.vorschlaege.length > 100) { y.vorschlaege.splice(0, y.vorschlaege.length - 100); geaendert = true; }
  if (geaendert) speichern();
  return y.vorschlaege.filter(function (v) { return v.status === "offen"; });
}
function yuhVorschlaegeHeute(quelle) {
  var heute = heuteISO();
  return yuh().vorschlaege.filter(function (v) { return v.zeit.slice(0, 10) === heute && v.seite === "kauf" && (!quelle || v.quelle === quelle); }).length;
}

// Erstellt einen Kauf- oder Verkaufsvorschlag. Prüft die Halal-Regeln wie bei einer echten Order.
async function yuhVorschlag(symbol, seite, anzahl, grund, zuversicht, quelle) {
  var y = yuh();
  symbol = symbolSauber(symbol);
  anzahl = Math.floor(Number(anzahl) * 10000) / 10000;
  if (seite !== "kauf" && seite !== "verkauf") return { fehler: true, text: "Seite muss kauf oder verkauf sein." };
  if (istGesperrt(symbol)) return { fehler: true, text: "„" + symbol + "“ ist wegen Sanktionen gesperrt." };
  if (seite === "kauf" && !aufHalalListe(symbol)) return { fehler: true, text: "„" + symbol + "“ ist nicht auf der Halal-Liste. Nur geprüfte Aktien." };
  if (seite === "kauf" && y.nichtVerfuegbar.indexOf(symbol) !== -1) return { fehler: true, text: "„" + symbol + "“ gibt es laut der Person bei Yuh nicht. Nimm eine andere Aktie." };
  if (!kursMoeglich(symbol)) return { fehler: true, text: keinKursText(symbol) };
  if (!(anzahl > 0)) return { fehler: true, text: "Anzahl muss grösser als 0 sein (Bruchteile erlaubt)." };
  if (yuhOffen().some(function (v) { return v.symbol === symbol && v.seite === seite; })) return { fehler: true, text: "Für " + symbol + " wartet schon ein " + seite + "-Vorschlag auf die Person." };
  var k = await kursHolen(symbol, true), betrag = Math.round(k.kurs * anzahl * 100) / 100;
  if (betrag < 1) return { fehler: true, text: "Eine Order muss mindestens 1 $ wert sein." };
  if (seite === "kauf") {
    if (!(y.bargeld > 0)) return { fehler: true, text: "Bei Yuh ist kein verfügbares Geld eingetragen (Depot → Echtgeld mit Yuh)." };
    if (betrag > y.bargeld + 0.005) return { fehler: true, text: "Zu wenig Geld bei Yuh: " + usd(betrag) + " nötig, " + usd(y.bargeld) + " verfügbar. Kein Kredit, kein Hebel." };
    if (betrag > y.bargeld * 0.2 + 0.01) return { fehler: true, text: "Zu gross: höchstens 20 % des Yuh-Geldes pro Order (" + usd(y.bargeld * 0.2) + "). Nimm eine kleinere Anzahl (Bruchteile erlaubt)." };
  } else {
    var pos = y.positionen[symbol];
    if (!pos || pos.anzahl < anzahl - 0.00005) return { fehler: true, text: "Bei Yuh sind nur " + (pos ? anzahlText(pos.anzahl) : 0) + " " + symbol + " eingetragen. Leerverkäufe gehen nicht." };
  }
  var w = schutzWerte(symbol), h = aufHalalListe(symbol) || {};
  var v = { id: neueId(), zeit: new Date().toISOString(), symbol: symbol, name: h.name || "", seite: seite, anzahl: anzahl, kurs: k.kurs, betrag: betrag,
    stop: seite === "kauf" ? Math.round(k.kurs * (1 - w.abstand / 100) * 100) / 100 : null,
    ziel: seite === "kauf" ? Math.round(k.kurs * (1 + w.ziel / 100) * 100) / 100 : null,
    grund: String(grund || "").slice(0, 300), zuversicht: zuversicht || null, quelle: quelle || "ki", status: "offen" };
  y.vorschlaege.push(v);
  speichern();
  yuhMelden(seite === "kauf" ? "Kaufen in Yuh: " + symbol : "Verkaufen in Yuh: " + symbol,
    anzahlText(anzahl) + " Stück für etwa " + usd(betrag) + (v.stop ? ", Stop " + usd(v.stop) : "") + ". " + v.grund);
  if (typeof Depot !== "undefined" && document.querySelector("#tab-depot.aktiv")) Depot.zeigen();
  return { text: "Echtgeld-Vorschlag an die Person geschickt (NICHT ausgeführt): " + seite + " " + anzahlText(anzahl) + " " + symbol + " für etwa " + usd(betrag) +
    ". Sie gibt die Order selbst in der Yuh-App auf und bestätigt dann in A&T." + (seite === "kauf" ? " Kaufen innerhalb von " + YUH_GUELTIG_MIN + " Minuten, sonst verfällt der Vorschlag." : "") };
}

// Person bestätigt: in Yuh gekauft oder verkauft (mit dem tatsächlichen Kurs und der Anzahl aus Yuh)
function yuhBestaetigen(id, anzahl, kurs) {
  var y = yuh(), v = y.vorschlaege.filter(function (x) { return x.id === id; })[0];
  if (!v || v.status !== "offen") return "Vorschlag nicht mehr offen.";
  anzahl = Math.floor(Number(anzahl) * 10000) / 10000; kurs = Number(kurs);
  if (!(anzahl > 0) || !(kurs > 0)) return "Anzahl und Kurs müssen grösser als 0 sein.";
  var wert = Math.round(anzahl * kurs * 100) / 100;
  if (v.seite === "kauf") {
    var p = y.positionen[v.symbol] || { anzahl: 0, einstand: 0, seit: heuteISO() };
    p.einstand = (p.einstand * p.anzahl + wert) / (p.anzahl + anzahl);
    p.anzahl = Math.round((p.anzahl + anzahl) * 10000) / 10000;
    p.hoch = Math.max(p.hoch || 0, kurs); p.teilVerkauft = false; p.signal = null;
    y.positionen[v.symbol] = p;
    y.bargeld = Math.max(0, Math.round((y.bargeld - wert) * 100) / 100);
  } else {
    var q = y.positionen[v.symbol];
    if (!q) return "Diese Position ist nicht mehr eingetragen.";
    anzahl = Math.min(anzahl, q.anzahl);
    var ergebnis = Math.round((kurs - q.einstand) * anzahl * 100) / 100;
    y.verlauf.push({ zeit: new Date().toISOString(), symbol: v.symbol, anzahl: anzahl, einstand: q.einstand, verkauf: kurs, ergebnis: ergebnis, grund: v.grund });
    if (y.verlauf.length > 200) y.verlauf.shift();
    q.anzahl = Math.round((q.anzahl - anzahl) * 10000) / 10000;
    if (v.grund.indexOf("Gewinnziel") === 0) q.teilVerkauft = true;
    q.signal = null;
    if (q.anzahl <= 0.00005) delete y.positionen[v.symbol];
    y.bargeld = Math.round((y.bargeld + wert) * 100) / 100;
  }
  v.status = "erledigt"; v.ausgefuehrt = { anzahl: anzahl, kurs: kurs };
  speichern();
  return (v.seite === "kauf" ? "Gekauft eingetragen: " : "Verkauft eingetragen: ") + anzahlText(anzahl) + " " + v.symbol + " zu " + usd(kurs) + ". A&T überwacht die Position.";
}
function yuhAblehnen(id, nichtBeiYuh) {
  var y = yuh(), v = y.vorschlaege.filter(function (x) { return x.id === id; })[0];
  if (!v) return;
  v.status = "abgelehnt";
  if (nichtBeiYuh && y.nichtVerfuegbar.indexOf(v.symbol) === -1) y.nichtVerfuegbar.push(v.symbol);
  var p = y.positionen[v.symbol];
  if (p && v.seite === "verkauf") p.signal = null; // später erneut prüfen
  speichern();
}

/* ---------- Echte Positionen überwachen (alle 2 Minuten, solange A&T offen ist) ---------- */
async function yuhPruefen() {
  var y = yuh(), syms = Object.keys(y.positionen), meldungen = [];
  for (var i = 0; i < syms.length; i++) {
    var sym = syms[i], p = y.positionen[sym], k;
    try { k = (await kursHolen(sym, true)).kurs; } catch (e) { continue; }
    p.letzterKurs = k;
    p.hoch = Math.max(p.hoch || p.einstand, k);
    if (p.signal) continue; // Vorschlag wartet schon
    var s = stopBerechnen(sym, p);
    p.stopKurs = s.stop;
    if (k <= s.stop) {
      var gewinn = s.stop >= p.einstand;
      var r = await yuhVorschlag(sym, "verkauf", p.anzahl, (gewinn ? "Nachziehender Stop: Gewinn sichern" : "Stop-Loss: Verlust begrenzen") + " (Kurs " + usd(k) + ", Stop " + usd(s.stop) + ")", null, "regel");
      if (!r.fehler) { p.signal = "stop"; meldungen.push(sym + " Stop"); }
    } else if (!p.teilVerkauft && k >= p.einstand * (1 + s.werte.ziel / 100)) {
      var haelfte = Math.floor(p.anzahl / 2 * 10000) / 10000;
      if (haelfte * k >= 1) {
        var r2 = await yuhVorschlag(sym, "verkauf", haelfte, "Gewinnziel +" + s.werte.ziel.toFixed(1) + " % erreicht: Hälfte sichern", null, "regel");
        if (!r2.fehler) { p.signal = "ziel"; meldungen.push(sym + " Ziel"); }
      } else p.teilVerkauft = true;
    }
  }
  speichern();
  return meldungen;
}

/* ---------- Für die KI ---------- */
function yuhKurzFuerKi() {
  if (!yuhAn()) return "";
  var y = yuh(), pos = Object.keys(y.positionen);
  return " ECHTGELD-MODUS (Yuh) ist AN: Jede Order mit order_aufgeben wird NICHT ausgeführt, sondern als Vorschlag an die Person geschickt; sie kauft selbst in der Yuh-App. " +
    "Verfügbar bei Yuh: " + usd(y.bargeld) + " (höchstens 20 % pro Order). Echte Positionen: " +
    (pos.map(function (s) { return anzahlText(y.positionen[s].anzahl) + " " + s + " (Einstand " + usd(y.positionen[s].einstand) + ")"; }).join(", ") || "keine") + "." +
    (y.nichtVerfuegbar.length ? " Gibt es bei Yuh nicht: " + y.nichtVerfuegbar.join(", ") + "." : "") +
    " Echtes Geld: sei vorsichtig, nenne Grund und Risiko.";
}
