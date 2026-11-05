/*
 * Übungs-Depot (Spielgeld, echte Kurse von Finnhub) und vorbereitete Überweisungen.
 * Die Halal-Regeln für den Handel stehen hier im Programm, nicht nur im Auftrag an die KI:
 *  - nur Aktien von der Halal-Liste, die die Person selbst bestätigt hat
 *  - nur eigenes Geld (kein Hebel, kein Kredit), keine Leerverkäufe
 *  - Branchen wie Banken, Versicherungen, Alkohol, Tabak, Glücksspiel werden blockiert
 * Die KI handelt automatisch bis zum Tageslimit; darüber wartet die Order auf Freigabe.
 */

// SHA-256 des Besitzer-Codes. Der Code selbst steht nirgends im Programm.
var BESITZER_HASH = "c67da2576ce17843d0803fd0d5b0ae96b3db7cab9f146f3be12372b9ea3d4eaa";

// Kleine SHA-256-Funktion (funktioniert auch, wenn crypto.subtle fehlt, z. B. bei file://).
function sha256(text) {
  var K = [], H = [], i, j, isPrime = function (n) { for (var f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
  for (var n = 2, c = 0; c < 64; n++) if (isPrime(n)) { if (c < 8) H[c] = (Math.pow(n, 1 / 2) * 4294967296) | 0; K[c++] = (Math.pow(n, 1 / 3) * 4294967296) | 0; }
  var bytes = unescape(encodeURIComponent(text)), w = [], l = bytes.length * 8;
  for (i = 0; i < bytes.length; i++) w[i >> 2] |= bytes.charCodeAt(i) << ((3 - i) % 4) * 8;
  w[l >> 5] |= 0x80 << (24 - l % 32);
  w[((l + 64 >> 9) << 4) + 15] = l;
  for (j = 0; j < w.length; j += 16) {
    var a = H.slice(0), W = [];
    for (i = 0; i < 64; i++) {
      if (i < 16) W[i] = w[j + i] | 0;
      else {
        var x = W[i - 15], y = W[i - 2];
        W[i] = (((x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3)) + W[i - 7] + ((y >>> 17 | y << 15) ^ (y >>> 19 | y << 13) ^ (y >>> 10)) + W[i - 16]) | 0;
      }
      var e = a[4], t1 = a[7] + ((e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7)) + ((e & a[5]) ^ (~e & a[6])) + K[i] + W[i];
      var b = a[0], t2 = ((b >>> 2 | b << 30) ^ (b >>> 13 | b << 19) ^ (b >>> 22 | b << 10)) + ((b & a[1]) ^ (b & a[2]) ^ (a[1] & a[2]));
      a = [(t1 + t2) | 0].concat(a.slice(0, 7));
      a[4] = (a[4] + t1) | 0;
    }
    for (i = 0; i < 8; i++) H[i] = (H[i] + a[i]) | 0;
  }
  return H.map(function (v) { return ("00000000" + (v >>> 0).toString(16)).slice(-8); }).join("");
}
function besitzerCodePruefen(code) {
  return sha256(String(code || "").trim().toUpperCase()) === BESITZER_HASH;
}

var FINNHUB_URL = "https://finnhub.io/api/v1/";
var BRANCHE_VERBOTEN = /bank|insurance|tobacco|casino|gambling|brewer|distill|wine|spirit|alcohol|financial services|mortgage|lending|consumer finance|capital markets|adult/i;
var BRANCHE_PRUEFEN = /beverage|media|hotel|restaurant|leisure|entertainment|food|real estate|reit|diversified/i;

function leeresDepot() {
  return { start: 10000, bargeld: 10000, positionen: {}, orders: [], halalListe: [], offen: [],
    tageslimit: 500, finnhubSchluessel: "", hinweisGesehen: false };
}
function depot() {
  if (!Z.depot || typeof Z.depot !== "object") Z.depot = leeresDepot();
  var d = Z.depot, leer = leeresDepot();
  Object.keys(leer).forEach(function (k) { if (d[k] === undefined) d[k] = leer[k]; });
  return d;
}
function usd(n) {
  var x = Number(n) || 0;
  return (x < -0.004 ? "−" : "") + "$" + Math.abs(x).toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function symbolSauber(s) { return String(s || "").trim().toUpperCase().replace(/[^A-Z0-9.\-]/g, ""); }

/* ---------- Kurse und Firmendaten (Finnhub) ---------- */

var _kursCache = {};
async function finnhub(pfad) {
  var k = depot().finnhubSchluessel;
  if (!k) throw new Error("Für echte Kurse fehlt der kostenlose Finnhub-Schlüssel (Depot → Einstellungen).");
  var r = await fetch(FINNHUB_URL + pfad + (pfad.indexOf("?") === -1 ? "?" : "&") + "token=" + encodeURIComponent(k));
  if (r.status === 401 || r.status === 403) throw new Error("Der Finnhub-Schlüssel stimmt nicht oder darf diese Daten nicht abrufen.");
  if (r.status === 429) throw new Error("Finnhub-Limit kurz erreicht. In einer Minute geht es wieder.");
  if (!r.ok) throw new Error("Finnhub antwortet nicht (" + r.status + ").");
  return r.json();
}
async function kursHolen(symbol, frisch) {
  symbol = symbolSauber(symbol);
  var c = _kursCache[symbol];
  if (!frisch && c && Date.now() - c.zeit < 15000) return c;
  var q = await finnhub("quote?symbol=" + encodeURIComponent(symbol));
  if (!q || !(q.c > 0)) throw new Error("Kein Kurs für „" + symbol + "“ gefunden. Stimmt das Kürzel (z. B. AAPL)?");
  c = { symbol: symbol, kurs: q.c, aenderung: q.dp, hoch: q.h, tief: q.l, vortag: q.pc, zeit: Date.now() };
  schwankungMerken(symbol, q);
  _kursCache[symbol] = c;
  return c;
}
async function firmaHolen(symbol) {
  var p = await finnhub("stock/profile2?symbol=" + encodeURIComponent(symbolSauber(symbol)));
  if (!p || !p.name) throw new Error("Keine Firma zum Kürzel „" + symbolSauber(symbol) + "“ gefunden.");
  var branche = p.finnhubIndustry || "";
  return { name: p.name, branche: branche, land: p.country || "",
    verboten: BRANCHE_VERBOTEN.test(branche), pruefen: BRANCHE_PRUEFEN.test(branche) };
}

/* ---------- Schwankung pro Aktie (für den individuellen Stop) ---------- */

// Tagesspanne in % = (Hoch − Tief) / Vortagesschluss. Pro Tag der grösste Wert, die letzten 15 Tage.
function schwankungMerken(symbol, q) {
  if (!(q.h > 0 && q.l > 0 && q.pc > 0)) return;
  var d = depot();
  if (!d.schwankung) d.schwankung = {};
  var tage = d.schwankung[symbol] || (d.schwankung[symbol] = {});
  var heute = heuteISO(), spanne = Math.round((q.h - q.l) / q.pc * 10000) / 100;
  if (!(tage[heute] >= spanne)) tage[heute] = spanne;
  var daten = Object.keys(tage).sort();
  while (daten.length > 15) delete tage[daten.shift()];
}
// Übliche Tagesschwankung in %: Schnitt der letzten bis zu 10 Tage, mindestens die heutige Spanne.
function schwankung(symbol) {
  var tage = (depot().schwankung || {})[symbolSauber(symbol)] || {}, heute = heuteISO();
  var frueher = Object.keys(tage).filter(function (t) { return t !== heute; }).sort().slice(-10).map(function (t) { return tage[t]; });
  var schnitt = frueher.length ? frueher.reduce(function (a, b) { return a + b; }, 0) / frueher.length : 0;
  var v = Math.max(schnitt, tage[heute] || 0);
  return v > 0 ? v : 2; // ohne Daten: 2 % als vorsichtige Annahme
}
function begrenzt(x, min, max) { return Math.min(max, Math.max(min, x)); }
// Individuelle Schutzwerte einer Aktie (alles in %).
function schutzWerte(symbol) {
  var a = autoEinstellungen(), v = schwankung(symbol);
  var abstand = begrenzt(1.5 * v, 1.5, Math.max(1.5, a.stop));   // Start-Stop unter dem Kaufkurs
  var nachziehen = begrenzt(v, 1.2, abstand);                    // Abstand zum Höchstkurs
  var ziel = Math.max(a.ziel, 2.5 * abstand);                    // Gewinnziel: Hälfte sichern
  return { schwankung: v, abstand: abstand, nachziehen: nachziehen, ziel: ziel };
}

/* ---------- Halal-Liste ---------- */

function aufHalalListe(symbol) {
  symbol = symbolSauber(symbol);
  return depot().halalListe.filter(function (h) { return h.symbol === symbol; })[0] || null;
}

/* ---------- Orders ---------- */

function heuteAutomatisch() {
  var heute = heuteISO();
  return depot().orders.filter(function (o) { return (o.quelle === "ki" || o.quelle === "auto") && o.zeit.slice(0, 10) === heute; })
    .reduce(function (s, o) { return s + o.wert; }, 0);
}

// Prüft alle festen Regeln. Gibt einen Fehlertext zurück oder null.
function orderRegeln(symbol, seite, anzahl, kurs) {
  var d = depot();
  // Kaufen nur von der Halal-Liste. Verkaufen (aussteigen) geht immer, auch wenn eine Aktie von der Liste entfernt wurde.
  if (seite === "kauf" && !aufHalalListe(symbol)) return "„" + symbol + "“ ist nicht auf deiner Halal-Liste. Nur geprüfte Aktien dürfen gekauft werden.";
  if (seite !== "kauf" && seite !== "verkauf") return "Seite muss kauf oder verkauf sein.";
  if (!(anzahl >= 1) || Math.floor(anzahl) !== anzahl) return "Anzahl muss eine ganze Zahl ab 1 sein.";
  var wert = kurs * anzahl;
  if (seite === "kauf" && wert > d.bargeld + 0.005) return "Nicht genug Geld: " + usd(wert) + " nötig, " + usd(d.bargeld) + " vorhanden. Kauf auf Kredit (Hebel) ist nicht erlaubt.";
  var pos = d.positionen[symbol];
  if (seite === "verkauf" && (!pos || pos.anzahl < anzahl)) return "Du besitzt nur " + (pos ? pos.anzahl : 0) + " " + symbol + ". Leerverkäufe sind nicht erlaubt.";
  return null;
}

function orderBuchen(symbol, seite, anzahl, kurs, quelle, begruendung) {
  var d = depot(), wert = Math.round(kurs * anzahl * 100) / 100;
  var pos = d.positionen[symbol] || { anzahl: 0, einstand: 0 };
  if (seite === "kauf") {
    pos.einstand = (pos.einstand * pos.anzahl + wert) / (pos.anzahl + anzahl);
    pos.anzahl += anzahl;
    pos.hoch = Math.max(pos.hoch || 0, kurs);
    pos.teilVerkauft = false;
    delete pos.stopKurs;
    d.bargeld -= wert;
  } else {
    pos.anzahl -= anzahl;
    d.bargeld += wert;
  }
  d.bargeld = Math.round(d.bargeld * 100) / 100;
  if (pos.anzahl > 0) d.positionen[symbol] = pos; else delete d.positionen[symbol];
  var o = { id: neueId(), zeit: new Date().toISOString(), symbol: symbol, seite: seite, anzahl: anzahl, kurs: kurs, wert: wert, quelle: quelle, begruendung: begruendung || "" };
  d.orders.push(o);
  if (d.orders.length > 500) d.orders.shift();
  speichern();
  return o;
}

// quelle: "ki" (zählt zum Tageslimit) oder "ich" (vom Menschen ausgelöst oder freigegeben)
async function orderAufgeben(symbol, seite, anzahl, quelle, begruendung) {
  symbol = symbolSauber(symbol);
  anzahl = Number(anzahl);
  var k = await kursHolen(symbol);
  var fehler = orderRegeln(symbol, seite, anzahl, k.kurs);
  if (fehler) return { fehler: true, text: fehler };
  var d = depot(), wert = k.kurs * anzahl;
  if ((quelle === "ki" || quelle === "auto") && heuteAutomatisch() + wert > d.tageslimit) {
    d.offen.push({ id: neueId(), zeit: new Date().toISOString(), symbol: symbol, seite: seite, anzahl: anzahl, kurs: k.kurs, begruendung: begruendung || "" });
    speichern();
    return { text: "Order über dem Tageslimit (" + usd(d.tageslimit) + "): " + seite + " " + anzahl + " " + symbol + " zu etwa " + usd(k.kurs) + " wartet im Depot auf die Freigabe der Person. Nicht ausgeführt." };
  }
  var o = orderBuchen(symbol, seite, anzahl, k.kurs, quelle, begruendung);
  return { text: "Übungs-Depot: " + (seite === "kauf" ? "Gekauft " : "Verkauft ") + anzahl + " " + symbol + " zu " + usd(o.kurs) + " = " + usd(o.wert) + ". Bargeld jetzt " + usd(depot().bargeld) + "." };
}

async function depotText() {
  var d = depot(), zeilen = [], gesamt = d.bargeld;
  var syms = Object.keys(d.positionen);
  for (var i = 0; i < syms.length; i++) {
    var p = d.positionen[syms[i]], kurs = p.einstand;
    try { kurs = (await kursHolen(syms[i])).kurs; } catch (e) {}
    var wert = kurs * p.anzahl;
    gesamt += wert;
    var sb = stopBerechnen(syms[i], p);
    zeilen.push(syms[i] + ": " + p.anzahl + " Stück, Einstand " + usd(p.einstand) + ", Kurs " + usd(kurs) + ", Wert " + usd(wert) + ", Ergebnis " + usd(wert - p.einstand * p.anzahl) +
      ", Stop " + usd(p.stopKurs || sb.stop) + " (Tagesschwankung ca. " + sb.werte.schwankung.toFixed(1) + " %" + (p.teilVerkauft ? ", Hälfte schon gesichert" : "") + ")");
  }
  return "Übungs-Depot (Spielgeld, USD). Bargeld " + usd(d.bargeld) + ". Gesamtwert " + usd(gesamt) + " (Start " + usd(d.start) + ", Ergebnis " + usd(gesamt - d.start) + ").\n" +
    (zeilen.length ? zeilen.join("\n") : "Keine Positionen.") +
    "\nHalal-Liste: " + (d.halalListe.map(function (h) { return h.symbol; }).join(", ") || "leer") +
    ". Heute automatisch gehandelt: " + usd(heuteAutomatisch()) + " von " + usd(d.tageslimit) + " Tageslimit.";
}

function depotKurzFuerKi() {
  var d = depot();
  return "Übungs-Depot (Spielgeld, USD): Bargeld " + usd(d.bargeld) + ", Positionen: " +
    (Object.keys(d.positionen).map(function (s) { return d.positionen[s].anzahl + " " + s; }).join(", ") || "keine") +
    ". Halal-Liste: " + (d.halalListe.map(function (h) { return h.symbol; }).join(", ") || "leer") +
    ". Tageslimit automatisch: " + usd(d.tageslimit) + ", heute schon: " + usd(heuteAutomatisch()) + "." +
    (d.offen.length ? " Wartet auf Freigabe: " + d.offen.length + " Order(s)." : "") +
    (d.finnhubSchluessel ? "" : " Für echte Kurse fehlt noch der Finnhub-Schlüssel.");
}

/* ---------- Überweisungen (Revolut privat: keine Schnittstelle, darum vorbereiten) ---------- */

function ibanSauber(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function ibanGueltig(iban) {
  iban = ibanSauber(iban);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  var umgestellt = iban.slice(4) + iban.slice(0, 4), rest = 0;
  for (var i = 0; i < umgestellt.length; i++) {
    var c = umgestellt[i], ziffern = /[A-Z]/.test(c) ? String(c.charCodeAt(0) - 55) : c;
    for (var j = 0; j < ziffern.length; j++) rest = (rest * 10 + Number(ziffern[j])) % 97;
  }
  return rest === 1;
}
function ibanSchoen(iban) { return ibanSauber(iban).replace(/(.{4})/g, "$1 ").trim(); }

function ueberweisungVorbereiten(empfaenger, iban, betrag, waehrung, zweck) {
  empfaenger = String(empfaenger || "").trim();
  betrag = Math.round(Number(betrag) * 100) / 100;
  waehrung = String(waehrung || "CHF").toUpperCase();
  if (!empfaenger) return { fehler: true, text: "Empfänger fehlt." };
  if (!ibanGueltig(iban)) return { fehler: true, text: "Die IBAN „" + iban + "“ ist ungültig (Prüfziffer stimmt nicht). Bitte nochmal genau prüfen." };
  if (!(betrag > 0)) return { fehler: true, text: "Betrag fehlt oder ist ungültig." };
  if (!/^[A-Z]{3}$/.test(waehrung)) return { fehler: true, text: "Währung muss ein Code wie CHF oder EUR sein." };
  Z.ueberweisungen = Z.ueberweisungen || [];
  Z.ueberweisungen.push({ id: neueId(), datum: heuteISO(), empfaenger: empfaenger, iban: ibanSauber(iban), betrag: betrag,
    waehrung: waehrung, zweck: String(zweck || "").trim(), status: "vorbereitet" });
  speichern();
  return { text: "Überweisung vorbereitet (nicht ausgeführt): " + betrag.toFixed(2) + " " + waehrung + " an " + empfaenger + ", IBAN " + ibanSchoen(iban) +
    ". Revolut hat für Privatkonten keine Schnittstelle: Die Person muss sie in der Revolut-App selbst senden. Die Daten stehen unter Geld → Überweisungen zum Kopieren bereit." };
}

/* ---------- Werkzeuge für die KI ---------- */

var DEPOT_WERKZEUGE = [
  {
    name: "kurs_abfragen",
    description: "Holt den aktuellen Kurs einer US-Aktie (Kürzel wie AAPL) in USD.",
    input_schema: { type: "object", properties: { symbol: { type: "string", description: "Börsenkürzel, z. B. AAPL" } }, required: ["symbol"], additionalProperties: false },
    eager_input_streaming: true
  },
  {
    name: "halal_pruefen",
    description: "Prüft eine Aktie: Steht sie auf der Halal-Liste der Person? Welche Branche hat die Firma, ist die Branche verboten? Nur die Person kann Aktien zur Halal-Liste hinzufügen (im Depot).",
    input_schema: { type: "object", properties: { symbol: { type: "string", description: "Börsenkürzel" } }, required: ["symbol"], additionalProperties: false },
    eager_input_streaming: true
  },
  {
    name: "depot_anzeigen",
    description: "Zeigt das Übungs-Depot: Bargeld, Positionen mit aktuellen Kursen, Ergebnis, Halal-Liste, Tageslimit.",
    input_schema: { type: "object", properties: { mit_kursen: { type: "boolean", description: "true = aktuelle Kurse holen" } }, required: ["mit_kursen"], additionalProperties: false },
    eager_input_streaming: true
  },
  {
    name: "order_aufgeben",
    description: "Kauft oder verkauft Aktien im Übungs-Depot (Spielgeld) zum aktuellen Kurs. Nur Aktien von der Halal-Liste, nur mit vorhandenem Geld, keine Leerverkäufe. Bis zum Tageslimit wird sofort ausgeführt, darüber wartet die Order auf die Freigabe der Person. Nur handeln, wenn die Person das will.",
    input_schema: { type: "object", properties: {
      symbol: { type: "string", description: "Börsenkürzel" },
      seite: { type: "string", enum: ["kauf", "verkauf"] },
      anzahl: { type: "integer", description: "Anzahl Aktien, ganze Zahl ab 1" },
      begruendung: { type: "string", description: "Kurze Begründung der Order" }
    }, required: ["symbol", "seite", "anzahl", "begruendung"], additionalProperties: false },
    eager_input_streaming: true
  },
  {
    name: "ueberweisung_vorbereiten",
    description: "Bereitet eine Überweisung vor (Revolut). Führt sie NICHT aus: Die Person sendet sie selbst in der Revolut-App. Die IBAN wird geprüft.",
    input_schema: { type: "object", properties: {
      empfaenger: { type: "string", description: "Name des Empfängers" },
      iban: { type: "string", description: "IBAN des Empfängers" },
      betrag: { type: "number", description: "Betrag, positiv" },
      waehrung: { type: "string", description: "Währungscode, z. B. CHF oder EUR" },
      zweck: { type: "string", description: "Zahlungszweck / Mitteilung" }
    }, required: ["empfaenger", "iban", "betrag", "waehrung", "zweck"], additionalProperties: false },
    eager_input_streaming: true
  }
];

async function depotWerkzeug(name, input) {
  if (!istBesitzer()) return null; // Kunden: diese Werkzeuge gibt es nicht
  try {
    if (name === "kurs_abfragen") {
      var k = await kursHolen(input.symbol);
      return { text: k.symbol + ": " + usd(k.kurs) + " (heute " + (k.aenderung >= 0 ? "+" : "") + (Math.round(k.aenderung * 100) / 100) + " %, Hoch " + usd(k.hoch) + ", Tief " + usd(k.tief) + ")" };
    }
    if (name === "halal_pruefen") {
      var s = symbolSauber(input.symbol), eintrag = aufHalalListe(s), text = s + ": ";
      text += eintrag ? "steht auf der Halal-Liste (bestätigt am " + eintrag.datum + "). " : "steht NICHT auf der Halal-Liste, darf also nicht gehandelt werden. ";
      try {
        var f = await firmaHolen(s);
        text += "Firma: " + f.name + ", Branche: " + (f.branche || "unbekannt") + ". " +
          (f.verboten ? "Diese Branche ist nicht halal." : f.pruefen ? "Branche genau prüfen (Produkte, Einnahmen)." : "Branche an sich unproblematisch; Schulden- und Zinsquote trotzdem prüfen (z. B. mit Zoya oder Musaffa).");
      } catch (e) { text += "Firmendaten nicht verfügbar: " + e.message; }
      return { text: text };
    }
    if (name === "depot_anzeigen") return { text: input.mit_kursen === false ? depotKurzFuerKi() : await depotText() };
    if (name === "order_aufgeben") {
      if (!AUTO.laeuft) return await orderAufgeben(input.symbol, input.seite, Number(input.anzahl), "ki", input.begruendung);
      // Selbstständige Runde: feste Grenzen im Programm
      var a = autoEinstellungen();
      if (AUTO.orders >= 1) return { fehler: true, text: "Pro selbstständiger Runde ist nur eine Order erlaubt." };
      if (autoTradesHeute() >= a.maxTrades) return { fehler: true, text: "Höchstzahl selbstständiger Trades für heute (" + a.maxTrades + ") erreicht." };
      var r = await orderAufgeben(input.symbol, input.seite, Number(input.anzahl), "auto", "[Auto] " + (input.begruendung || ""));
      if (!r.fehler) AUTO.orders++;
      return r;
    }
    if (name === "ueberweisung_vorbereiten") return ueberweisungVorbereiten(input.empfaenger, input.iban, input.betrag, input.waehrung, input.zweck);
  } catch (e) {
    return { fehler: true, text: e.message };
  }
  return null;
}

/* ---------- Selbstständiger Handel ---------- */

var AUTO = { laeuft: false, orders: 0, letzteRegel: 0 };

function autoEinstellungen() {
  var d = depot();
  if (!d.auto) d.auto = {};
  var std = { an: false, intervall: 30, stop: 3, ziel: 8, maxTrades: 3, letzte: 0, protokoll: [], schutzVersion: 2 };
  if (d.auto.ziel === 5 && !d.auto.schutzVersion) d.auto.ziel = 8; // alter Standard → neuer Standard
  Object.keys(std).forEach(function (k) { if (d.auto[k] === undefined) d.auto[k] = std[k]; });
  return d.auto;
}
function autoTradesHeute() {
  var heute = heuteISO();
  return depot().orders.filter(function (o) { return o.quelle === "auto" && o.zeit.slice(0, 10) === heute; }).length;
}
// US-Börse (New York) offen? Mo bis Fr, 9:30 bis 16:00 Ortszeit. Feiertage sind nicht berücksichtigt.
function boerseOffen(jetzt) {
  var teile = {};
  new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
    .formatToParts(jetzt || new Date()).forEach(function (t) { teile[t.type] = t.value; });
  if (teile.weekday === "Sat" || teile.weekday === "Sun") return false;
  var min = (Number(teile.hour) % 24) * 60 + Number(teile.minute);
  return min >= 570 && min < 960;
}
function autoNotiz(text) {
  var a = autoEinstellungen();
  a.protokoll.push({ zeit: new Date().toISOString(), text: text });
  if (a.protokoll.length > 60) a.protokoll.splice(0, a.protokoll.length - 60);
  speichern();
}

// Schutz jeder Position: entscheidet das Programm, nicht die KI.
//  1. Start-Stop: 1,5 × übliche Tagesschwankung unter dem Kaufkurs, höchstens der eingestellte Höchstverlust
//  2. Nachziehender Stop: wandert mit dem Höchstkurs, Abstand = 1 × Tagesschwankung
//  3. Ohne Verlust: ab Gewinn = Start-Abstand liegt der Stop mindestens beim Kaufkurs
//  4. Gewinnziel: Hälfte verkaufen, Rest läuft mit halbem Abstand weiter
function stopBerechnen(symbol, p) {
  var w = schutzWerte(symbol);
  var hoch = Math.max(p.hoch || p.einstand, p.einstand);
  var stop = p.einstand * (1 - w.abstand / 100);
  var abstandNach = p.teilVerkauft ? w.nachziehen / 2 : w.nachziehen;
  stop = Math.max(stop, hoch * (1 - abstandNach / 100));
  if (hoch >= p.einstand * (1 + w.abstand / 100)) stop = Math.max(stop, p.einstand * 1.002); // +0,2 % deckt Gebühren
  return { stop: Math.round(stop * 100) / 100, werte: w, abstandNach: abstandNach };
}

async function regelnPruefen() {
  var d = depot(), syms = Object.keys(d.positionen), meldungen = [];
  for (var i = 0; i < syms.length; i++) {
    var sym = syms[i], p = d.positionen[sym], k;
    try { k = (await kursHolen(sym, true)).kurs; } catch (e) { continue; }
    p.hoch = Math.max(p.hoch || p.einstand, k);
    var s = stopBerechnen(sym, p), r;
    // Gewinnziel erreicht: Hälfte sichern (bei 1 Aktie: Stop enger ziehen)
    if (!p.teilVerkauft && k >= p.einstand * (1 + s.werte.ziel / 100)) {
      p.teilVerkauft = true;
      var haelfte = Math.floor(p.anzahl / 2);
      if (haelfte >= 1) {
        r = await orderAufgeben(sym, "verkauf", haelfte, "regel", "Gewinnziel +" + s.werte.ziel.toFixed(1) + " %: Hälfte gesichert");
        meldungen.push(sym + " Gewinnziel: " + r.text + " Rest läuft mit nachziehendem Stop weiter.");
      } else {
        meldungen.push(sym + " Gewinnziel erreicht: Stop wird enger nachgezogen.");
      }
      p = d.positionen[sym];
      if (!p) continue;
      s = stopBerechnen(sym, p);
    }
    p.stopKurs = s.stop;
    if (k <= s.stop) {
      var gewinn = s.stop >= p.einstand;
      r = await orderAufgeben(sym, "verkauf", p.anzahl, "regel",
        (gewinn ? "Nachziehender Stop: Gewinn gesichert" : "Stop-Loss") + " bei " + usd(k) + " (Stop " + usd(s.stop) + ")");
      meldungen.push(sym + " " + (gewinn ? "nachziehender Stop" : "Stop-Loss") + ": " + r.text);
    }
  }
  speichern();
  meldungen.forEach(autoNotiz);
  return meldungen;
}

function autoFrage() {
  var a = autoEinstellungen();
  return "Selbstständige Handelsrunde (" + new Date().toLocaleString("de-CH") + "). " +
    "Hol mit kurs_abfragen die Kurse der Aktien auf der Halal-Liste und schau mit depot_anzeigen ins Depot. " +
    "Handle NUR, wenn du die Gewinnchance als hoch einschätzt: Zuversicht mindestens 8 von 10 und ein konkreter Grund aus den Kursdaten. " +
    "Nichtstun ist die Regel und völlig in Ordnung. Höchstens eine Order, höchstens 20 % des Bargelds. " +
    "Das Programm schützt jede Position selbst: individueller Stop nach Schwankung (höchstens " + a.stop + " % Verlust), nachziehender Stop, ab " + a.ziel + " % Gewinn wird die Hälfte gesichert. " +
    "Schreib zum Schluss genau eine Zeile: „Entscheidung: … | Zuversicht: x/10 | Grund: …“.";
}

async function autoRunde(test) {
  var a = autoEinstellungen();
  if (AUTO.laeuft || !istBesitzer()) return;
  if (!test && !a.an) return;
  if (!test && !boerseOffen()) return;
  AUTO.laeuft = true; AUTO.orders = 0;
  a.letzte = Date.now(); speichern();
  try {
    if (!depot().finnhubSchluessel) { autoNotiz("Übersprungen: Finnhub-Schlüssel fehlt."); return; }
    if (!depot().halalListe.length) { autoNotiz("Übersprungen: Halal-Liste ist leer."); return; }
    await regelnPruefen();
    if (autoTradesHeute() >= a.maxTrades) { autoNotiz("Höchstzahl Trades für heute erreicht. Nur Stop-Loss und Gewinnziel geprüft."); return; }
    if (!hatSchluessel()) { autoNotiz("Übersprungen: keine KI verbunden."); return; }
    var e = Z.einstellungen;
    var chat = { id: "auto", anbieter: e.anbieter, modus: "trader", system: grundauftrag(e.kiName || STANDARD_NAME), nachrichten: [], kosten: 0 };
    var kontext = "<kontext>\n" + HALAL_ERINNERUNG + "\n" + MODI.trader.auftrag + "\n" + kontextFuerKi() + "\n</kontext>";
    var frage = autoFrage();
    if (chat.anbieter === "gemini") chat.nachrichten.push({ role: "user", parts: [{ text: kontext }, { text: frage }] });
    else if (chat.anbieter === "lokal") chat.nachrichten.push({ role: "user", content: kontext + "\n\n" + frage });
    else chat.nachrichten.push({ role: "user", content: [{ type: "text", text: kontext }, { type: "text", text: frage }] });
    var text = "", aktionen = [], fehler = "";
    await new Promise(function (fertig) {
      antwortHolen(chat, {
        text: function (t) { text += t; }, status: function () {}, quelle: function () {},
        werkzeug: function (name, ergebnis) { if (name === "order_aufgeben") aktionen.push(ergebnis); },
        fertig: fertig, fehler: function (f) { fehler = f; fertig(); }
      });
    });
    if (fehler) { autoNotiz("Fehler: " + fehler); return; }
    var zeile = (text.match(/Entscheidung:[^\n]*/) || [""])[0] || text.replace(/\s+/g, " ").slice(-200);
    autoNotiz((aktionen.length ? aktionen.join(" ") + " " : "Keine Order. ") + zeile.trim());
  } catch (f) {
    autoNotiz("Fehler: " + (f && f.message ? f.message : f));
  } finally {
    AUTO.laeuft = false;
    if (typeof Depot !== "undefined" && document.querySelector("#tab-depot.aktiv")) Depot.zeigen();
  }
}

// Läuft, solange A&T offen ist: jede Minute prüfen, ob eine Runde fällig ist.
function autoTakt() {
  if (!istBesitzer()) return;
  var a = autoEinstellungen();
  if (!boerseOffen() || !depot().finnhubSchluessel) return;
  if (a.an && Date.now() - a.letzte >= a.intervall * 60000) { autoRunde(false); return; }
  // Schutz (Stop, nachziehender Stop, Gewinnziel) für alle Positionen alle 2 Minuten
  if (!AUTO.laeuft && Object.keys(depot().positionen).length && Date.now() - AUTO.letzteRegel >= 120000) {
    AUTO.letzteRegel = Date.now();
    regelnPruefen().catch(function () {});
  }
}

/* ---------- Oberfläche: Depot-Tab und Überweisungen ---------- */

var Depot = (function () {
  var $ = function (s) { return document.querySelector(s); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function meldung(t) {
    var el = $("#toast"); el.textContent = t; el.classList.add("sichtbar");
    clearTimeout(meldung._t); meldung._t = setTimeout(function () { el.classList.remove("sichtbar"); }, 3000);
  }
  var kurse = {};

  async function kurseLaden() {
    var syms = Object.keys(depot().positionen).concat(depot().offen.map(function (o) { return o.symbol; }));
    for (var i = 0; i < syms.length; i++) {
      try { kurse[syms[i]] = (await kursHolen(syms[i])).kurs; } catch (e) { }
    }
  }

  function zeigen() {
    var d = depot();
    $("#depot-hinweis").classList.toggle("versteckt", d.hinweisGesehen);
    $("#d-finnhub").value = d.finnhubSchluessel || "";
    $("#d-limit").value = d.tageslimit;
    $("#d-start").value = d.start;
    var wertPos = 0;
    var syms = Object.keys(d.positionen);
    syms.forEach(function (s) { wertPos += (kurse[s] || d.positionen[s].einstand) * d.positionen[s].anzahl; });
    var gesamt = d.bargeld + wertPos, erg = gesamt - d.start;
    $("#depot-kacheln").innerHTML =
      "<div class='karte kachel'><div class='leise klein-text'>Gesamtwert (Spielgeld)</div><div class='gross'>" + usd(gesamt) + "</div><div class='leise klein-text'>Start " + usd(d.start) + "</div></div>" +
      "<div class='karte kachel'><div class='leise klein-text'>Ergebnis</div><div class='gross " + (erg >= 0 ? "plus" : "minus") + "'>" + usd(erg) + "</div><div class='leise klein-text'>" + (d.start ? (erg / d.start * 100).toFixed(2).replace("-", "−") + " %" : "") + "</div></div>" +
      "<div class='karte kachel'><div class='leise klein-text'>Bargeld</div><div class='gross'>" + usd(d.bargeld) + "</div><div class='leise klein-text'>Heute automatisch: " + usd(heuteAutomatisch()) + " von " + usd(d.tageslimit) + "</div></div>";

    var ul = $("#depot-positionen");
    ul.innerHTML = syms.length ? "" : "<li class='leise'>Noch keine Aktien. Kaufe unten oder sag dem Mentor, was er tun soll.</li>";
    syms.forEach(function (s) {
      var p = d.positionen[s], k = kurs(s, p), w = k * p.anzahl, e = w - p.einstand * p.anzahl;
      var li = document.createElement("li"); li.className = "buchung";
      var sb = stopBerechnen(s, p), stopK = p.stopKurs || sb.stop;
      li.innerHTML = "<span class='datum'><strong>" + esc(s) + "</strong></span><span class='wachsen'>" + p.anzahl + " × " + usd(k) + "<br><span class='leise klein-text'>Einstand " + usd(p.einstand) +
        " · Stop " + usd(stopK) + (stopK >= p.einstand ? " (ohne Verlust)" : "") + (p.teilVerkauft ? " · Hälfte gesichert" : "") +
        "<br>Schwankung ca. " + sb.werte.schwankung.toFixed(1) + " %/Tag · Ziel +" + sb.werte.ziel.toFixed(1) + " %</span></span><strong class='" + (e >= 0 ? "plus" : "minus") + "'>" + usd(w) + "<br><span class='klein-text'>" + (e >= 0 ? "+" : "") + usd(e) + "</span></strong>";
      ul.appendChild(li);
    });

    var off = $("#depot-offen");
    $("#depot-offen-karte").classList.toggle("versteckt", !d.offen.length);
    off.innerHTML = "";
    d.offen.forEach(function (o) {
      var li = document.createElement("li");
      li.innerHTML = "<span class='wachsen'><strong>" + (o.seite === "kauf" ? "Kauf " : "Verkauf ") + o.anzahl + " " + esc(o.symbol) + "</strong> zu ca. " + usd(o.kurs) + " = " + usd(o.kurs * o.anzahl) +
        (o.begruendung ? "<br><span class='leise klein-text'>" + esc(o.begruendung) + "</span>" : "") + "</span>" +
        "<button class='knopf klein'>Ausführen</button><button class='mini' title='Ablehnen'>✕</button>";
      var k = li.querySelectorAll("button");
      k[0].onclick = async function () {
        this.disabled = true;
        d.offen = d.offen.filter(function (x) { return x !== o; }); speichern();
        try { var r = await orderAufgeben(o.symbol, o.seite, o.anzahl, "ich", o.begruendung); meldung(r.text); } catch (e) { meldung(e.message); }
        zeigen();
      };
      k[1].onclick = function () { d.offen = d.offen.filter(function (x) { return x !== o; }); speichern(); meldung("Order abgelehnt."); zeigen(); };
      off.appendChild(li);
    });

    var sel = $("#o-symbol");
    sel.innerHTML = d.halalListe.length ? d.halalListe.map(function (h) { return "<option>" + esc(h.symbol) + "</option>"; }).join("") : "<option value=''>Zuerst Halal-Liste füllen</option>";

    var hl = $("#halal-liste");
    hl.innerHTML = d.halalListe.length ? "" : "<li class='leise'>Noch leer. Nur Aktien auf dieser Liste können gehandelt werden.</li>";
    d.halalListe.forEach(function (h) {
      var li = document.createElement("li");
      li.innerHTML = "<span class='wachsen'><strong>" + esc(h.symbol) + "</strong> " + esc(h.name || "") + "<br><span class='leise klein-text'>" + esc(h.branche || "Branche unbekannt") + " · bestätigt " + esc(h.datum) + "</span></span><button class='mini' title='Entfernen'>✕</button>";
      li.querySelector("button").onclick = function () { d.halalListe = d.halalListe.filter(function (x) { return x !== h; }); speichern(); zeigen(); };
      hl.appendChild(li);
    });

    var a = autoEinstellungen();
    $("#auto-an").checked = !!a.an;
    $("#auto-intervall").value = String(a.intervall);
    $("#auto-stop").value = a.stop;
    $("#auto-ziel").value = a.ziel;
    $("#auto-max").value = a.maxTrades;
    var offen = boerseOffen();
    $("#auto-status").textContent = (a.an ? "An" : "Aus") + " · US-Börse " + (offen ? "offen" : "geschlossen (offen Mo bis Fr, 15:30 bis 22:00 Schweizer Zeit)") +
      " · Heute selbstständig: " + autoTradesHeute() + " von " + a.maxTrades + " Trades" +
      (a.an && offen ? " · nächste Runde in etwa " + Math.max(0, Math.ceil((a.letzte + a.intervall * 60000 - Date.now()) / 60000)) + " Min." : "") +
      (Z.einstellungen.anbieter === "gemini" ? " · Tipp: Mit Gemini verbraucht jede Runde Gratis-Anfragen, die lokale KI hat kein Limit." : "");
    var pl = $("#auto-protokoll");
    var eintraege = a.protokoll.slice(-12).reverse();
    pl.innerHTML = eintraege.length ? "" : "<li class='leise'>Noch keine Runde.</li>";
    eintraege.forEach(function (x) {
      var li = document.createElement("li"); li.className = "buchung";
      li.innerHTML = "<span class='leise datum'>" + esc(new Date(x.zeit).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })) + "</span><span class='wachsen klein-text'>" + esc(x.text) + "</span>";
      pl.appendChild(li);
    });

    var ol = $("#depot-orders");
    var letzte = d.orders.slice(-15).reverse();
    ol.innerHTML = letzte.length ? "" : "<li class='leise'>Noch keine Orders.</li>";
    letzte.forEach(function (o) {
      var li = document.createElement("li"); li.className = "buchung";
      li.innerHTML = "<span class='leise datum'>" + esc(o.zeit.slice(5, 10).split("-").reverse().join(".")) + "</span><span class='wachsen'>" + (o.seite === "kauf" ? "Kauf " : "Verkauf ") + o.anzahl + " " + esc(o.symbol) + " · " + ({ ki: "<em class='marke-klein mittel'>KI</em>", auto: "<em class='marke-klein mittel'>Auto</em>", regel: "<em class='marke-klein schlecht'>Stop/Ziel</em>" }[o.quelle] || "<em class='marke-klein gut'>du</em>") +
        (o.begruendung ? "<br><span class='leise klein-text'>" + esc(o.begruendung) + "</span>" : "") + "</span><strong>" + usd(o.wert) + "</strong>";
      ol.appendChild(li);
    });
  }
  function kurs(s, p) { return kurse[s] || p.einstand; }

  function verbinden() {
    $("#auto-an").onchange = function () {
      var a = autoEinstellungen();
      if (this.checked && !confirm("Selbstständigen Handel einschalten? A&T handelt dann ohne Rückfrage bis zu deinem Tageslimit, solange A&T offen ist.")) { this.checked = false; return; }
      a.an = this.checked; if (a.an) a.letzte = 0; speichern();
      autoNotiz(a.an ? "Selbstständiger Handel eingeschaltet." : "Selbstständiger Handel ausgeschaltet.");
      zeigen();
    };
    $("#auto-intervall").onchange = function () { autoEinstellungen().intervall = Number(this.value) || 30; speichern(); zeigen(); };
    $("#auto-stop").onchange = function () { autoEinstellungen().stop = Math.min(50, Math.max(0.5, parseFloat(this.value) || 3)); speichern(); zeigen(); };
    $("#auto-ziel").onchange = function () { autoEinstellungen().ziel = Math.min(100, Math.max(0.5, parseFloat(this.value) || 5)); speichern(); zeigen(); };
    $("#auto-max").onchange = function () { autoEinstellungen().maxTrades = Math.min(20, Math.max(0, parseInt(this.value, 10) || 0)); speichern(); zeigen(); };
    $("#auto-jetzt").onclick = async function () {
      this.disabled = true; meldung("Runde läuft …");
      await autoRunde(true);
      this.disabled = false; meldung("Runde fertig. Siehe Protokoll."); zeigen();
    };
    setInterval(autoTakt, 60000);
    $("#depot-hinweis-ok").onclick = function () { depot().hinweisGesehen = true; speichern(); zeigen(); };
    $("#d-finnhub").onchange = function () { depot().finnhubSchluessel = this.value.trim(); _kursCache = {}; speichern(); meldung("Finnhub-Schlüssel gespeichert."); aktualisieren(); };
    $("#d-limit").onchange = function () { depot().tageslimit = Math.max(0, parseFloat(this.value) || 0); speichern(); zeigen(); };
    $("#d-zuruecksetzen").onclick = function () {
      var start = Math.max(100, parseFloat($("#d-start").value) || 10000);
      if (!confirm("Übungs-Depot mit " + usd(start) + " Spielgeld neu starten? Positionen und Orders werden gelöscht, die Halal-Liste bleibt.")) return;
      var d = depot(); d.start = start; d.bargeld = start; d.positionen = {}; d.orders = []; d.offen = []; speichern(); zeigen();
    };
    $("#d-aktualisieren").onclick = aktualisieren;
    $("#order-form").onsubmit = async function (ev) {
      ev.preventDefault();
      var knopf = this.querySelector("button"); knopf.disabled = true;
      try {
        var r = await orderAufgeben($("#o-symbol").value, $("#o-seite").value, Number($("#o-anzahl").value), "ich", "von Hand");
        meldung(r.text);
      } catch (e) { meldung(e.message); }
      knopf.disabled = false;
      await kurseLaden(); zeigen();
    };
    var gefunden = null;
    $("#halal-form").onsubmit = async function (ev) {
      ev.preventDefault();
      var s = symbolSauber($("#h-symbol").value), info = $("#h-info");
      gefunden = null;
      $("#h-bestaetigen").classList.add("versteckt");
      if (!s) return;
      if (aufHalalListe(s)) { info.textContent = s + " ist schon auf der Liste."; return; }
      info.className = "klein-text leise"; info.textContent = "Prüfe " + s + " …";
      try {
        var f = await firmaHolen(s);
        if (f.verboten) { info.className = "klein-text minus"; info.textContent = f.name + " (" + f.branche + "): Diese Branche ist nicht halal. Kann nicht aufgenommen werden."; return; }
        gefunden = { symbol: s, name: f.name, branche: f.branche };
        info.className = "klein-text";
        info.textContent = f.name + " · Branche: " + (f.branche || "unbekannt") + (f.pruefen ? " · Achtung: Branche genau prüfen." : "") +
          " Prüfe Schulden, Zinseinnahmen und Produkte (z. B. mit Zoya oder Musaffa) und bestätige dann.";
        $("#h-bestaetigen").classList.remove("versteckt");
      } catch (e) { info.className = "klein-text minus"; info.textContent = e.message; }
    };
    $("#h-bestaetigen").onclick = function () {
      if (!gefunden) return;
      gefunden.datum = heuteISO();
      depot().halalListe.push(gefunden); speichern();
      $("#h-info").textContent = gefunden.symbol + " aufgenommen.";
      $("#h-symbol").value = ""; gefunden = null; this.classList.add("versteckt");
      zeigen();
    };
  }
  async function aktualisieren() { await kurseLaden(); zeigen(); }

  /* Überweisungen im Geld-Tab */
  function ueberweisungenZeigen() {
    var liste = (Z.ueberweisungen || []).slice().reverse();
    var box = $("#ueberweisungen");
    $("#ueberweisungen-karte").classList.toggle("versteckt", !liste.length);
    box.innerHTML = "";
    liste.slice(0, 15).forEach(function (u) {
      var li = document.createElement("li");
      var felder = [["Empfänger", u.empfaenger], ["IBAN", ibanSchoen(u.iban)], ["Betrag", u.betrag.toFixed(2)], ["Mitteilung", u.zweck]];
      li.className = "ueberweisung" + (u.status === "erledigt" ? " erledigt" : "");
      li.innerHTML = "<div class='wachsen'><strong>" + esc(u.betrag.toFixed(2) + " " + u.waehrung) + " an " + esc(u.empfaenger) + "</strong> <em class='marke-klein " + (u.status === "erledigt" ? "gut'>gesendet" : "mittel'>vorbereitet") + "</em>" +
        "<div class='kopierfelder'>" + felder.filter(function (f) { return f[1]; }).map(function (f) {
          return "<button class='chip kopierfeld' data-wert='" + esc(String(f[1]).replace(/ /g, f[0] === "IBAN" ? "" : " ")) + "'>" + esc(f[0]) + ": " + esc(f[1]) + " 📋</button>";
        }).join("") + "</div></div>" +
        (u.status === "erledigt" ? "" : "<button class='knopf klein'>In Revolut gesendet</button>") + "<button class='mini' title='Löschen'>✕</button>";
      li.querySelectorAll(".kopierfeld").forEach(function (b) {
        b.onclick = function () {
          var t = b.dataset.wert;
          if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(function () { meldung("Kopiert: " + t); });
          else { var x = document.createElement("textarea"); x.value = t; document.body.appendChild(x); x.select(); try { document.execCommand("copy"); meldung("Kopiert: " + t); } catch (e) {} x.remove(); }
        };
      });
      var knoepfe = li.querySelectorAll(":scope > button");
      if (u.status !== "erledigt") {
        knoepfe[0].onclick = function () {
          u.status = "erledigt"; speichern();
          if (u.waehrung === (Z.einstellungen.waehrung || "CHF")) buchungEintragen("aus", u.betrag, "Überweisung an " + u.empfaenger, heuteISO());
          meldung("Als gesendet markiert" + (u.waehrung === (Z.einstellungen.waehrung || "CHF") ? " und im Geldbuch als Ausgabe eingetragen." : "."));
          if (window.geldNeuZeigen) window.geldNeuZeigen(); else ueberweisungenZeigen();
        };
      }
      knoepfe[knoepfe.length - 1].onclick = function () {
        Z.ueberweisungen = Z.ueberweisungen.filter(function (x) { return x !== u; }); speichern(); ueberweisungenZeigen();
      };
      box.appendChild(li);
    });
  }

  return { zeigen: function () { zeigen(); aktualisieren(); }, verbinden: verbinden, ueberweisungenZeigen: ueberweisungenZeigen };
})();
