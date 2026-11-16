/* Lokale KI über Ollama: läuft auf dem eigenen PC. Kostenlos, ohne Limit, ohne Konto, privat. */

var OLLAMA_URL = "http://127.0.0.1:11434";
// Bevorzugte Modelle (das erste vorhandene wird genommen). Alle können Werkzeuge nutzen.
// Hermes (Nous Research) zuerst: wer es installiert, will es nutzen.
var LOKAL_BEVORZUGT = ["hermes3:8b", "hermes3:3b", "hermes3", "qwen3:14b", "qwen3:8b", "qwen3:4b", "qwen3", "qwen2.5:7b", "llama3.1:8b", "qwen2.5:3b", "llama3.2"];

async function lokalModelle(wartezeit) {
  var steuerung = new AbortController();
  var uhr = setTimeout(function () { steuerung.abort(); }, wartezeit || 2500);
  try {
    var antwort = await fetch(OLLAMA_URL + "/api/tags", { signal: steuerung.signal });
    if (!antwort.ok) throw new Error("http " + antwort.status);
    var daten = await antwort.json();
    return (daten.models || []).map(function (m) { return m.name; })
      .filter(function (n) { return !/embed/i.test(n); });
  } finally {
    clearTimeout(uhr);
  }
}

function lokalStandardModell(namen) {
  for (var i = 0; i < LOKAL_BEVORZUGT.length; i++) {
    var w = LOKAL_BEVORZUGT[i];
    var treffer = namen.filter(function (n) { return n === w || n === w + ":latest" || n.indexOf(w + ":") === 0; })[0];
    if (treffer) return treffer;
  }
  return namen[0] || "";
}

// Prüft, ob die lokale KI läuft. Gibt {ok, modelle, modell} zurück.
async function lokalPruefen() {
  try {
    var namen = await lokalModelle();
    return { ok: true, modelle: namen, modell: lokalStandardModell(namen) };
  } catch (e) {
    return { ok: false, modelle: [], modell: "" };
  }
}

function lokalWerkzeuge() {
  return eigeneWerkzeuge().map(function (w) {
    return { type: "function", function: { name: w.name, description: w.description, parameters: w.input_schema } };
  });
}

// Ohne interne Felder (_anzeige) an Ollama schicken.
function lokalVerlauf(chat) {
  return [{ role: "system", content: chat.system }].concat(chat.nachrichten.map(function (n) {
    var m = { role: n.role, content: n.content || "" };
    if (n.tool_calls) m.tool_calls = n.tool_calls;
    if (n.tool_name) m.tool_name = n.tool_name;
    return m;
  }));
}

async function lokalAnfrage(koerper, signal, cb) {
  var antwort = await fetch(OLLAMA_URL + "/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(koerper),
    signal: signal
  });
  if (!antwort.ok) {
    var text = "";
    try { text = (await antwort.json()).error || ""; } catch (e) {}
    var f = new Error(text || ("HTTP " + antwort.status));
    f.status = antwort.status;
    throw f;
  }
  var leser = antwort.body.getReader(), dekoder = new TextDecoder(), puffer = "";
  var inhalt = "", aufrufe = [], grund = "";
  for (;;) {
    var stueck = await leser.read();
    if (stueck.done) break;
    puffer += dekoder.decode(stueck.value, { stream: true });
    var zeilen = puffer.split("\n");
    puffer = zeilen.pop();
    zeilen.forEach(function (z) {
      if (!z.trim()) return;
      var d;
      try { d = JSON.parse(z); } catch (e) { return; }
      if (d.error) { var f = new Error(d.error); f.status = 500; throw f; }
      var m = d.message || {};
      if (m.thinking) cb.status("denkt nach …");
      if (m.content) { inhalt += m.content; cb.text(m.content); }
      if (m.tool_calls) { aufrufe = aufrufe.concat(m.tool_calls); cb.status("speichert …"); }
      if (d.done) grund = d.done_reason || "stop";
    });
  }
  return { inhalt: inhalt, aufrufe: aufrufe, grund: grund };
}

function lokalFehlerText(e) {
  if (e && e.name === "AbortError") return "Abgebrochen.";
  if (e instanceof TypeError) return "Die lokale KI antwortet nicht. Ist Ollama gestartet? Unter Windows: Doppelklick auf „Lokale KI installieren.cmd“ im A&T-Ordner, oder Ollama im Startmenü öffnen.";
  if (/not found|pull/i.test(e.message)) return "Das lokale Modell fehlt. Starte „Lokale KI installieren.cmd“ noch einmal oder wähle unter „Ich“ ein anderes Modell.";
  return "Fehler der lokalen KI: " + e.message;
}

function antwortLokal(chat, cb) {
  var steuerung = new AbortController();
  var gestoppt = false;

  (async function () {
    var e = Z.einstellungen;
    try {
      var modell = e.lokalModell;
      if (!modell) {
        var p = await lokalPruefen();
        if (!p.ok) throw new TypeError("offline");
        if (!p.modell) throw new Error("model not found");
        modell = e.lokalModell = p.modell;
        speichern();
      }
      var mitWerkzeugen = e.lokalOhneWerkzeuge !== modell;
      // „Gründlich“ lässt das Modell vorher nachdenken: langsamer, aber klüger.
      var mitDenken = e.tiefe === "high";

      for (var runde = 0; runde < 6 && !gestoppt; runde++) {
        var koerper = {
          model: modell,
          messages: lokalVerlauf(chat),
          stream: true,
          think: mitDenken,
          options: { num_ctx: mitDenken ? 12288 : 8192 }
        };
        if (mitWerkzeugen) koerper.tools = lokalWerkzeuge();
        var erg;
        try {
          cb.status("denkt nach …");
          erg = await lokalAnfrage(koerper, steuerung.signal, cb);
        } catch (f) {
          // Ältere Modelle kennen „think“ oder Werkzeuge nicht: dann ohne.
          if (/think/i.test(f.message) && koerper.think !== undefined) { delete koerper.think; mitDenken = undefined; }
          if (/does not support tools/i.test(f.message) && mitWerkzeugen) { mitWerkzeugen = false; e.lokalOhneWerkzeuge = modell; speichern(); }
          if (/think|does not support tools/i.test(f.message)) { runde--; continue; }
          throw f;
        }
        // Manche Modelle schreiben trotz „think: false“ ein <think>-Stück: nicht speichern.
        var sauber = erg.inhalt.replace(/<think>[\s\S]*?<\/think>\s*/g, "");
        var nachricht = { role: "assistant", content: sauber };
        if (erg.aufrufe.length) nachricht.tool_calls = erg.aufrufe;
        chat.nachrichten.push(nachricht);
        speichern();
        if (erg.grund === "length") { cb.text("\n\n_Die Antwort war zu lang und wurde abgeschnitten. Schreib „weiter“._"); break; }
        if (!erg.aufrufe.length) break;

        for (var ai = 0; ai < erg.aufrufe.length; ai++) {
          var fn = erg.aufrufe[ai].function || {};
          var args = fn.arguments;
          if (typeof args === "string") { try { args = JSON.parse(args); } catch (x) { args = null; } }
          var r = await werkzeugAusfuehren(fn.name, args || {});
          cb.werkzeug(fn.name, r.text);
          chat.nachrichten.push({ role: "tool", content: r.text, tool_name: fn.name });
        }
        speichern();
      }
      cb.fertig();
    } catch (f) {
      cb.fehler(lokalFehlerText(f));
    }
  })();

  return { stoppen: function () { gestoppt = true; steuerung.abort(); } };
}
