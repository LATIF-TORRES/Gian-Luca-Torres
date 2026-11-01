/* Kostenlose KI: Google Gemini (Gratis-Stufe von Google AI Studio), direkt aus dem Browser. */

var GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/";

// Wandelt die Werkzeuge (JSON-Schema) in das Format von Gemini um.
function geminiSchema(s) {
  var t = { type: String(s.type || "string").toUpperCase() };
  if (s.description) t.description = s.description;
  if (s.enum) t.enum = s.enum;
  if (s.properties) {
    t.properties = {};
    Object.keys(s.properties).forEach(function (k) { t.properties[k] = geminiSchema(s.properties[k]); });
  }
  if (s.required) t.required = s.required;
  return t;
}
var GEMINI_FUNKTIONEN = EIGENE_WERKZEUGE.map(function (w) {
  return { name: w.name, description: w.description, parameters: geminiSchema(w.input_schema) };
});

// Holt die Liste der Modelle, die mit diesem Schlüssel Text erzeugen können.
// Die Namen ändern sich oft, darum fragen wir Google statt sie fest einzutragen.
async function geminiModelleLaden(schluessel) {
  var antwort = await fetch(GEMINI_URL + "models?pageSize=200&key=" + encodeURIComponent(schluessel));
  if (!antwort.ok) throw new Error(antwort.status === 400 || antwort.status === 403 ? "schluessel" : "netz");
  var daten = await antwort.json();
  var liste = (daten.models || []).filter(function (m) {
    var n = m.name.toLowerCase();
    return (m.supportedGenerationMethods || []).indexOf("generateContent") !== -1 &&
      n.indexOf("flash") !== -1 &&
      !/image|tts|audio|live|embed|vision|thinking-exp|robotics|computer/.test(n);
  }).map(function (m) {
    var v = (m.name.match(/(\d+(?:\.\d+)?)/) || [0, "0"])[1];
    return {
      id: m.name.replace(/^models\//, ""),
      titel: m.displayName || m.name,
      version: parseFloat(v),
      lite: /lite/i.test(m.name),
      vorschau: /preview|exp/i.test(m.name),
      latest: /latest/i.test(m.name)
    };
  });
  // Neueste zuerst, stabile vor Vorschau-Versionen.
  liste.sort(function (a, b) {
    return (b.version - a.version) || (a.vorschau - b.vorschau) || (a.latest - b.latest) || (a.lite - b.lite);
  });
  return liste;
}

// Standard: neuestes stabiles „Flash-Lite“ (meist die meisten Gratis-Anfragen pro Tag).
function geminiStandardModell(liste) {
  var stabil = liste.filter(function (m) { return !m.vorschau; });
  var basis = stabil.length ? stabil : liste;
  return (basis.filter(function (m) { return m.lite; })[0] || basis[0] || {}).id || "";
}

// Gespeicherte Nachrichten ohne interne Felder (z. B. _quellen) an Gemini schicken.
function geminiVerlauf(nachrichten) {
  return nachrichten.map(function (n) { return { role: n.role, parts: n.parts }; });
}

// Fügt gestreamte Teile zusammen. Teile mit Signatur oder Denk-Teile bleiben unverändert.
function teilAnhaengen(parts, teil) {
  var letzter = parts[parts.length - 1];
  var schlicht = function (p) { return p && typeof p.text === "string" && !p.thought && !p.thoughtSignature && Object.keys(p).length === 1; };
  if (schlicht(teil) && schlicht(letzter)) letzter.text += teil.text;
  else parts.push(JSON.parse(JSON.stringify(teil)));
}

async function geminiAnfrage(modell, schluessel, koerper, signal, cb) {
  var antwort = await fetch(GEMINI_URL + "models/" + encodeURIComponent(modell) + ":streamGenerateContent?alt=sse&key=" + encodeURIComponent(schluessel), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(koerper),
    signal: signal
  });
  if (!antwort.ok) {
    var text = "";
    try { text = (await antwort.json()).error.message || ""; } catch (e) {}
    var f = new Error(text || ("HTTP " + antwort.status));
    f.status = antwort.status;
    throw f;
  }
  var leser = antwort.body.getReader(), dekoder = new TextDecoder(), puffer = "";
  var parts = [], quellen = [], grund = "", sperre = "";
  for (;;) {
    var stueck = await leser.read();
    if (stueck.done) break;
    puffer += dekoder.decode(stueck.value, { stream: true });
    var zeilen = puffer.split(/\r?\n/);
    puffer = zeilen.pop();
    zeilen.forEach(function (z) {
      if (z.indexOf("data:") !== 0) return;
      var d;
      try { d = JSON.parse(z.slice(5)); } catch (e) { return; }
      if (d.promptFeedback && d.promptFeedback.blockReason) sperre = d.promptFeedback.blockReason;
      var k = (d.candidates || [])[0];
      if (!k) return;
      ((k.content && k.content.parts) || []).forEach(function (p) {
        teilAnhaengen(parts, p);
        if (typeof p.text === "string" && !p.thought) cb.text(p.text);
        if (p.thought) cb.status("denkt nach …");
        if (p.functionCall) cb.status("speichert …");
      });
      var g = k.groundingMetadata;
      if (g && g.groundingChunks) {
        cb.status("sucht im Web …");
        g.groundingChunks.forEach(function (c) {
          if (c.web && c.web.uri && !quellen.some(function (q) { return q.url === c.web.uri; })) {
            quellen.push({ title: c.web.title || c.web.uri, url: c.web.uri });
          }
        });
      }
      if (k.finishReason) grund = k.finishReason;
    });
  }
  return { parts: parts, quellen: quellen, grund: grund, sperre: sperre };
}

function geminiFehlerText(e) {
  if (e && e.name === "AbortError") return "Abgebrochen.";
  if (e.status === 400 && /api key/i.test(e.message)) return "Der Gemini-Schlüssel stimmt nicht. Prüfe ihn unter „Ich“.";
  if (e.status === 403) return "Dein Gemini-Schlüssel darf dieses Modell nicht nutzen. Wähle unter „Ich“ ein anderes Modell.";
  if (e.status === 404) return "Dieses Gemini-Modell gibt es nicht mehr. Tipp unter „Ich“ auf „Modelle laden“.";
  if (e.status === 429) return "Das kostenlose Tageslimit von Gemini ist erreicht. Morgen geht es wieder, oder wähle unter „Ich“ ein anderes Gemini-Modell.";
  if (e.status >= 500) return "Google hat gerade Probleme. Versuch es gleich nochmal.";
  if (e instanceof TypeError) return "Keine Verbindung. Prüfe dein Internet.";
  return "Fehler von Gemini: " + (e.message || e.status);
}

function antwortGemini(chat, cb) {
  var steuerung = new AbortController();
  var gestoppt = false;

  (async function () {
    var e = Z.einstellungen;
    var modell = e.geminiModell;
    try {
      if (!modell) {
        var liste = await geminiModelleLaden(e.geminiSchluessel);
        modell = e.geminiModell = geminiStandardModell(liste);
        speichern();
        if (!modell) throw Object.assign(new Error("Kein passendes Modell gefunden."), { status: 404 });
      }
      var mitSuche = e.websuche !== false;

      for (var runde = 0; runde < 6 && !gestoppt; runde++) {
        var koerper = {
          systemInstruction: { parts: [{ text: chat.system }] },
          contents: geminiVerlauf(chat.nachrichten),
          tools: [{ functionDeclarations: GEMINI_FUNKTIONEN }].concat(mitSuche ? [{ google_search: {} }] : []),
          generationConfig: { maxOutputTokens: 8192 }
        };
        var erg;
        try {
          erg = await geminiAnfrage(modell, e.geminiSchluessel, koerper, steuerung.signal, cb);
        } catch (f) {
          // Manche Modelle erlauben Web-Suche und eigene Werkzeuge nicht zusammen: dann ohne Suche.
          if (f.status === 400 && mitSuche && !/api key/i.test(f.message)) {
            mitSuche = false;
            runde--;
            continue;
          }
          throw f;
        }

        if (erg.sperre || erg.grund === "SAFETY" || erg.grund === "PROHIBITED_CONTENT") {
          cb.text("\n\n_Diese Anfrage hat Gemini abgelehnt. Formuliere sie bitte anders._");
          break;
        }
        if (!erg.parts.length) {
          cb.text("_Keine Antwort erhalten. Versuch es nochmal._");
          break;
        }
        var nachricht = { role: "model", parts: erg.parts };
        if (erg.quellen.length) nachricht._quellen = erg.quellen;
        chat.nachrichten.push(nachricht);
        speichern();
        erg.quellen.forEach(cb.quelle);

        if (erg.grund === "MAX_TOKENS") {
          cb.text("\n\n_Die Antwort war zu lang und wurde abgeschnitten. Schreib „weiter“._");
          break;
        }
        var aufrufe = erg.parts.filter(function (p) { return p.functionCall; });
        if (!aufrufe.length) break;

        var antworten = aufrufe.map(function (p) {
          var fc = p.functionCall;
          var r = werkzeugAusfuehren(fc.name, fc.args || {});
          cb.werkzeug(fc.name, r.text);
          var fr = { name: fc.name, response: r.fehler ? { error: r.text } : { result: r.text } };
          if (fc.id) fr.id = fc.id;
          return { functionResponse: fr };
        });
        chat.nachrichten.push({ role: "user", parts: antworten });
        speichern();
      }
      cb.fertig();
    } catch (f) {
      cb.fehler(geminiFehlerText(f));
    }
  })();

  return { stoppen: function () { gestoppt = true; steuerung.abort(); } };
}
