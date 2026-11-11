/*
 * Lernen: A&T wird Tag für Tag besser.
 *  - Täglicher Rückblick: Einmal pro Tag liest die KI die neuen Gespräche (Mentor und Akhi) und speichert
 *    neue Fakten über die Person, Regeln, wie sie unterstützt werden will, und eine kurze Zusammenfassung.
 *  - Rückmeldungen: 👍/👎 bei Antworten. Ein 👎 mit Begründung wird sofort eine Regel.
 *  - Bei jeder Frage gehen die gelernten Regeln und die Rückblicke der letzten Tage mit (kontextFuerKi).
 * Alles liegt nur auf dem Gerät und ist unter „Ich“ sichtbar und löschbar.
 */

var LERN_MAX_REGELN = 20, LERN_MAX_RUECKBLICKE = 14, LERN_MAX_TEXT = 15000;

function lernDaten() {
  if (!Z.lernen || typeof Z.lernen !== "object") Z.lernen = {};
  var l = Z.lernen;
  if (!Array.isArray(l.regeln)) l.regeln = [];
  if (!Array.isArray(l.rueckblicke)) l.rueckblicke = [];
  if (!Array.isArray(l.feedback)) l.feedback = [];
  if (!l.stand || typeof l.stand !== "object") l.stand = { datum: "", verarbeitet: {} };
  if (!l.stand.verarbeitet) l.stand.verarbeitet = {};
  return l;
}

function regelHinzufuegen(text, quelle) {
  var l = lernDaten();
  text = String(text || "").replace(/\s+/g, " ").trim().slice(0, 200);
  if (!text) return false;
  var klein = text.toLowerCase();
  if (l.regeln.some(function (r) { return r.text.toLowerCase() === klein; })) return false;
  l.regeln.push({ id: neueId(), text: text, datum: heuteISO(), quelle: quelle || "" });
  while (l.regeln.length > LERN_MAX_REGELN) l.regeln.shift();
  return true;
}

// 👍/👎 zu einer Antwort. notiz: was besser sein soll (optional).
function rueckmeldung(gut, frage, antwort, notiz) {
  var l = lernDaten();
  notiz = String(notiz || "").trim();
  l.feedback.push({ datum: heuteISO(), gut: !!gut, frage: String(frage || "").slice(0, 300), antwort: String(antwort || "").slice(0, 300), notiz: notiz.slice(0, 300) });
  if (l.feedback.length > 60) l.feedback.splice(0, l.feedback.length - 60);
  var neu = !gut && notiz ? regelHinzufuegen(notiz, "Rückmeldung") : false;
  speichern();
  return gut ? "Danke! A&T merkt sich, was gut war." : neu ? "Verstanden. Ab jetzt gilt: „" + notiz + "“" : "Danke. A&T lernt beim nächsten Rückblick daraus.";
}

// Für jede Frage: gelernte Regeln und die letzten Rückblicke (kurz gehalten)
function lernKontext() {
  var l = lernDaten(), teile = [];
  if (l.regeln.length) teile.push("So will die Person unterstützt werden (gelernt, unbedingt beachten):\n" + l.regeln.map(function (r) { return "- " + r.text; }).join("\n"));
  var rb = l.rueckblicke.slice(-5);
  if (rb.length) teile.push("Rückblick auf die letzten Gespräche (nutze das für Kontinuität, knüpf an offene Punkte an):\n" +
    rb.map(function (r) { return "- " + r.datum.split("-").reverse().join(".") + ": " + r.text.slice(0, 350); }).join("\n"));
  return teile.join("\n");
}

/* ---------- Gespräche lesbar machen (alle Anbieter) ---------- */
function ohneKontext(t) {
  return String(t || "").replace(/<kontext>[\s\S]*?<\/kontext>\s*/g, "").split("<rat_der_kis>")[0].trim();
}
function nachrichtZeile(n) {
  var rolle = n.role === "user" ? "Person" : (n.role === "assistant" || n.role === "model") ? "KI" : null;
  if (!rolle) return "";
  var text = "";
  if (Array.isArray(n.parts)) text = n.parts.map(function (p) { return p.text || ""; }).join("\n");
  else if (typeof n.content === "string") text = n.role === "user" ? (n._anzeige || n.content) : n.content;
  else if (Array.isArray(n.content)) text = n.content.filter(function (b) { return b.type === "text"; }).map(function (b) { return b.text; }).join("\n");
  text = ohneKontext(text);
  if (!text || /^<kontext>/.test(text)) return "";
  return rolle + ": " + text.slice(0, 1500);
}
// Neue Nachrichten seit dem letzten Rückblick, aus Mentor-Gesprächen und Akhi
function neueGespraeche() {
  var l = lernDaten(), chats = (Z.chats || []).slice();
  if (Z.akhiChat) chats.push(Z.akhiChat);
  var zeilen = [], neuStand = {};
  chats.forEach(function (c) {
    if (!c || !Array.isArray(c.nachrichten)) return;
    var id = c.id || "?", ab = l.stand.verarbeitet[id] || 0;
    if (ab > c.nachrichten.length) ab = 0; // Gespräch wurde neu begonnen
    var neu = c.nachrichten.slice(ab).map(nachrichtZeile).filter(Boolean);
    if (neu.length) zeilen.push("## Gespräch „" + (c.titel || "Akhi") + "“\n" + neu.join("\n"));
    neuStand[id] = c.nachrichten.length;
  });
  var text = zeilen.join("\n\n");
  if (text.length > LERN_MAX_TEXT) text = text.slice(-LERN_MAX_TEXT); // die neuesten Teile behalten
  return { text: text, anzahl: (text.match(/\n(Person|KI): /g) || []).length, stand: neuStand };
}

function rueckblickFaellig() {
  var l = lernDaten();
  return l.stand.datum !== heuteISO() && hatSchluessel() && neueGespraeche().anzahl >= 4;
}

var _lernLaeuft = false;
// Liest die neuen Gespräche und lernt daraus. erzwingen: auch mehrmals am Tag.
async function rueckblickMachen(erzwingen) {
  var l = lernDaten();
  if (_lernLaeuft) return { text: "Lernt schon …" };
  if (!hatSchluessel()) return { fehler: true, text: "Dafür braucht es eine verbundene KI." };
  var g = neueGespraeche();
  if (g.anzahl < 2) { if (erzwingen) { l.stand.datum = heuteISO(); speichern(); } return { text: "Noch keine neuen Gespräche zum Lernen." }; }
  if (!erzwingen && l.stand.datum === heuteISO()) return { text: "Heute schon gelernt." };
  _lernLaeuft = true;
  try {
    var fb = l.feedback.filter(function (f) { return !f.verarbeitet; });
    var auftrag = "Bekannte Fakten:\n" + (Z.gedaechtnis.map(function (x) { return "- " + x.text; }).join("\n") || "(keine)") +
      "\n\nBekannte Regeln:\n" + (l.regeln.map(function (r) { return "- " + r.text; }).join("\n") || "(keine)") +
      (fb.length ? "\n\nRückmeldungen der Person zu Antworten:\n" + fb.map(function (f) { return "- " + (f.gut ? "👍 gut" : "👎 schlecht") + ": Frage „" + f.frage + "“" + (f.notiz ? ", Anmerkung: " + f.notiz : ""); }).join("\n") : "") +
      "\n\nNeue Gespräche:\n" + g.text;
    var system = "Du bist das Lern-Modul der App A&T (Halal-Business-Mentor). Lies die neuen Gespräche und die Rückmeldungen. " +
      "Antworte NUR mit JSON in genau dieser Form: {\"fakten\": [..], \"regeln\": [..], \"zusammenfassung\": \"..\"}. " +
      "fakten: höchstens 6 neue, dauerhaft wichtige Tatsachen über die Person (Ziele, Fähigkeiten, Kapital, Zeit, Projekte, Entscheidungen, Fortschritte), je ein kurzer Satz, nichts schon Bekanntes, nichts Vorübergehendes, keine Passwörter oder Schlüssel. " +
      "regeln: höchstens 3 neue Regeln, wie die KI der Person künftig besser hilft (Stil, Länge, Format, Vorlieben, was sie nicht will), abgeleitet aus Rückmeldungen und Verhalten, je ein kurzer Satz im Imperativ; nur wenn klar erkennbar. " +
      "zusammenfassung: 2 bis 3 Sätze: Woran wurde gearbeitet, was wurde entschieden, was ist offen (nächster Schritt). Deutsch, Schweizer Rechtschreibung.";
    var antwort = await kiEinfach(system, auftrag);
    var json = (String(antwort).match(/\{[\s\S]*\}/) || [""])[0], d;
    try { d = JSON.parse(json); } catch (e) { throw new Error("Die KI hat kein lesbares Ergebnis geliefert."); }
    var neuF = 0, neuR = 0;
    (Array.isArray(d.fakten) ? d.fakten : []).slice(0, 6).forEach(function (f) { if (typeof f === "string" && f.trim() && !/sk-ant-|AIza|passwort/i.test(f) && merken(f) .indexOf("Gespeichert") === 0) neuF++; });
    (Array.isArray(d.regeln) ? d.regeln : []).slice(0, 3).forEach(function (r) { if (typeof r === "string" && regelHinzufuegen(r, "Rückblick")) neuR++; });
    if (d.zusammenfassung) {
      l.rueckblicke.push({ datum: heuteISO(), text: String(d.zusammenfassung).slice(0, 600) });
      while (l.rueckblicke.length > LERN_MAX_RUECKBLICKE) l.rueckblicke.shift();
    }
    fb.forEach(function (f) { f.verarbeitet = true; });
    Object.keys(g.stand).forEach(function (id) { l.stand.verarbeitet[id] = g.stand[id]; });
    l.stand.datum = heuteISO();
    speichern();
    return { text: "A&T hat gelernt: " + neuF + (neuF === 1 ? " neuer Fakt, " : " neue Fakten, ") + neuR + (neuR === 1 ? " neue Regel" : " neue Regeln") + (d.zusammenfassung ? ", Rückblick gespeichert." : "."), fakten: neuF, regeln: neuR };
  } catch (f) {
    return { fehler: true, text: "Lernen hat nicht geklappt: " + (f && f.message ? f.message : f) };
  } finally {
    _lernLaeuft = false;
  }
}

// Eine einfache Anfrage an die gewählte KI (ohne Werkzeuge), Ergebnis als Text
async function kiEinfach(system, text) {
  var a = Z.einstellungen.anbieter;
  if (a === "claude") return ratClaude(text, system);
  if (a === "lokal") return ratLokal(text, system);
  return ratGemini(text, system);
}

// Läuft im Hintergrund beim Start: einmal pro Tag lernen, wenn es Neues gibt
function lernenAutomatisch(melden) {
  try {
    if (!rueckblickFaellig()) return;
    rueckblickMachen(false).then(function (r) { if (r && !r.fehler && (r.fakten || r.regeln) && melden) melden(r.text); });
  } catch (e) { /* still weiter */ }
}
