/*
 * Rat der KIs: Akhi fragt Claude, Gemini, ChatGPT und die lokale KI gleichzeitig (ohne Werkzeuge),
 * prüft die Antworten kritisch gegeneinander und macht daraus die eine beste Antwort.
 * So nutzt A&T das Wissen aller Modelle und filtert ihre typischen Fehler (Erfindungen, Veraltetes,
 * nicht Halales, Widersprüche) heraus. Es werden nur KIs gefragt, für die ein Zugang eingerichtet ist.
 */

var RAT_ZEIT_MS = 90000;
var OPENAI_URL = "https://api.openai.com/v1/";

function ratSystem() {
  return "Du bist ein Spitzen-Experte für Unternehmertum, Finanzen, Marketing, Verkauf, E-Commerce, KI-Automatisierung, Schweizer Recht und Steuern sowie islamisches Wirtschaftsrecht. " +
    "Beantworte die Frage präzise, konkret und praxisnah (Zahlen, Werkzeuge mit Namen, Kosten, Zeitplan, Reihenfolge). Kennzeichne Unsicheres und Wissen, das veraltet sein könnte. Erfinde nichts. " +
    "Nur islamisch erlaubte Wege: keine Zinsen, kein Glücksspiel, keine übermässige Unsicherheit, keine verbotenen Branchen, ehrliche Werbung, Nasheed statt Musik. " +
    "Ziel der Person: ein regelmässiger, automatisierter Cashflow. Höchstens 500 Wörter, Deutsch.";
}

function ratTeilnehmer() {
  var e = Z.einstellungen, t = [];
  if (e.schluessel) t.push({ id: "claude", name: "Claude", frage: ratClaude });
  if (e.geminiSchluessel) t.push({ id: "gemini", name: "Gemini", frage: ratGemini });
  if (e.openaiSchluessel) t.push({ id: "chatgpt", name: "ChatGPT", frage: ratChatGPT });
  if (e.anbieter === "lokal" || e.lokalModell) t.push({ id: "lokal", name: "Lokale KI", frage: ratLokal });
  return t;
}

function mitZeitlimit(promise, ms) {
  return Promise.race([promise, new Promise(function (_, nein) { setTimeout(function () { nein(new Error("keine Antwort nach " + Math.round(ms / 1000) + " Sekunden")); }, ms); })]);
}

// Fragt alle verfügbaren KIs gleichzeitig. Ergebnis: [{name, text} | {name, fehler}]
async function ratFragen(frage, beiFortschritt) {
  var teil = ratTeilnehmer(), kontext = typeof kontextFuerKi === "function" ? kontextFuerKi() : "";
  var voll = (kontext ? "Über die Person:\n" + kontext + "\n\n" : "") + "Frage:\n" + frage;
  var fertig = 0;
  return Promise.all(teil.map(function (k) {
    return mitZeitlimit(k.frage(voll), RAT_ZEIT_MS).then(function (text) {
      fertig++; if (beiFortschritt) beiFortschritt(fertig, teil.length, k.name);
      return { name: k.name, text: String(text || "").trim() };
    }, function (f) {
      fertig++; if (beiFortschritt) beiFortschritt(fertig, teil.length, k.name);
      return { name: k.name, fehler: (f && f.message) || String(f) };
    });
  }));
}

// Baut die Anweisung für die Schlussantwort: kritisch prüfen, zusammenführen, beste Antwort geben.
function ratAuftrag(frage, antworten) {
  var gut = antworten.filter(function (a) { return a.text; });
  if (!gut.length) return frage;
  return frage + "\n\n<rat_der_kis>\n" + gut.map(function (a) { return "### Meinung von " + a.name + "\n" + a.text.slice(0, 6000); }).join("\n\n") + "\n</rat_der_kis>\n\n" +
    "Oben stehen Antworten anderer KIs auf dieselbe Frage. Prüfe sie wie ein strenger Gutachter: Übernimm, was stimmt und der Person wirklich hilft. " +
    "Verwirf Erfindungen, falsche oder veraltete Zahlen und Gesetze, nicht halale Vorschläge (Zinsen, Glücksspiel, Täuschung, Musik), Floskeln und Unwichtiges. " +
    "Löse Widersprüche mit der besten Begründung und ergänze, was alle übersehen haben. Gib dann EINE Antwort in deinem Stil, besser als jede einzelne. " +
    "Ganz am Ende eine kurze Zeile „Rat der KIs:“ mit den wichtigsten Unterschieden (falls es welche gab).";
}

/* ---------- Die einzelnen KIs (ohne Werkzeuge) ---------- */

async function ratClaude(text) {
  var e = Z.einstellungen, sdk = await sdkLaden(), Anthropic = sdk.default;
  var client = new Anthropic({ apiKey: e.schluessel, dangerouslyAllowBrowser: true, maxRetries: 1 });
  var modell = e.modell || "claude-opus-5-5";
  var p = { model: modell, max_tokens: 16000, output_config: { effort: "medium" }, system: ratSystem(), messages: [{ role: "user", content: text }] };
  if (modell !== "claude-haiku-5-5") { p.betas = ["server-side-fallback-2026-07-01"]; p.fallbacks = "default"; }
  var m = await client.beta.messages.stream(p).finalMessage();
  if (m.stop_reason === "refusal") throw new Error("Claude hat die Frage abgelehnt.");
  return m.content.filter(function (b) { return b.type === "text"; }).map(function (b) { return b.text; }).join("\n");
}

async function ratGemini(text) {
  var e = Z.einstellungen, modell = e.geminiModell || "gemini-2.5-flash";
  var r = await fetch(GEMINI_URL + "models/" + encodeURIComponent(modell) + ":generateContent?key=" + encodeURIComponent(e.geminiSchluessel), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: ratSystem() }] }, contents: [{ role: "user", parts: [{ text: text }] }] })
  });
  if (!r.ok) throw new Error(r.status === 429 ? "Gemini-Tageslimit erreicht" : "Gemini antwortet nicht (" + r.status + ")");
  var d = await r.json(), teile = (((d.candidates || [])[0] || {}).content || {}).parts || [];
  return teile.map(function (x) { return x.text || ""; }).join("");
}

var _openaiModell = null;
async function openaiModellWahl(schluessel) {
  var e = Z.einstellungen;
  if (e.openaiModell) return e.openaiModell;
  if (_openaiModell) return _openaiModell;
  try {
    var r = await fetch(OPENAI_URL + "models", { headers: { Authorization: "Bearer " + schluessel } });
    if (r.status === 401) throw new Error("schluessel");
    var ids = ((await r.json()).data || []).map(function (m) { return m.id; });
    // Neuestes allgemeines GPT-Modell (ohne mini, nano, audio, Bilder, Suche, Vorschau-Kennungen mit Datum)
    var passend = ids.filter(function (id) { return /^gpt-\d+(\.\d+)?o?$/.test(id); }).sort(function (a, b) {
      return parseFloat(b.replace(/[^\d.]/g, "")) - parseFloat(a.replace(/[^\d.]/g, ""));
    });
    _openaiModell = passend[0] || (ids.indexOf("gpt-4o") !== -1 ? "gpt-4o" : ids.filter(function (id) { return /^gpt-/.test(id); })[0]) || "gpt-4o";
  } catch (f) {
    if (f.message === "schluessel") throw new Error("Der OpenAI-Schlüssel stimmt nicht.");
    _openaiModell = "gpt-4o";
  }
  return _openaiModell;
}
async function ratChatGPT(text) {
  var e = Z.einstellungen, modell = await openaiModellWahl(e.openaiSchluessel);
  var r = await fetch(OPENAI_URL + "chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + e.openaiSchluessel },
    body: JSON.stringify({ model: modell, messages: [{ role: "system", content: ratSystem() }, { role: "user", content: text }] })
  });
  if (r.status === 401) throw new Error("Der OpenAI-Schlüssel stimmt nicht.");
  if (r.status === 429) throw new Error("OpenAI-Limit oder kein Guthaben");
  if (!r.ok) throw new Error("ChatGPT antwortet nicht (" + r.status + ")");
  var d = await r.json();
  return ((d.choices || [])[0] || {}).message ? d.choices[0].message.content : "";
}

async function ratLokal(text) {
  var e = Z.einstellungen, modell = e.lokalModell;
  if (!modell) modell = lokalStandardModell(await lokalModelle());
  if (!modell) throw new Error("Lokale KI nicht gefunden");
  var koerper = { model: modell, stream: false, think: false, messages: [{ role: "system", content: ratSystem() }, { role: "user", content: text }] };
  var r = await fetch(OLLAMA_URL + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(koerper) });
  if (!r.ok && /think/i.test(await r.clone().text())) { // ältere Modelle kennen „think“ nicht
    delete koerper.think;
    r = await fetch(OLLAMA_URL + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(koerper) });
  }
  if (!r.ok) throw new Error("Lokale KI antwortet nicht (" + r.status + ")");
  var d = await r.json();
  return ((d.message && d.message.content) || "").replace(/<think>[\s\S]*?<\/think>\s*/g, "");
}
