/* Verbindung zu Claude (Anthropic API) direkt aus dem Browser, mit dem eigenen Schlüssel. */

var SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.135.0/+esm";

// Preise in US-Dollar pro 1 Million Tokens (Eingabe, Ausgabe, Cache-Lesen).
var PREISE = {
  "claude-opus-5-5": { ein: 4, aus: 20, cache: 0.2 },
  "claude-sonnet-5-5": { ein: 2, aus: 10, cache: 0.2 },
  "claude-haiku-5-5": { ein: 0.1, aus: 0.5, cache: 0.01 }
};
var PREIS_WEBSUCHE = 0.01; // 10 US-Dollar pro 1000 Suchen

var EIGENE_WERKZEUGE = [
  {
    name: "merken",
    description: "Speichert eine bleibende Tatsache über die Person im Gedächtnis (Ziel, Fähigkeit, Startkapital, verfügbare Zeit, Wohnort, laufendes Projekt, Vorliebe). Ein kurzer Satz pro Aufruf. Nicht für einmalige Kleinigkeiten.",
    input_schema: {
      type: "object",
      properties: { text: { type: "string", description: "Die Tatsache als kurzer Satz, z. B. 'Kann gut Videos schneiden.'" } },
      required: ["text"],
      additionalProperties: false
    },
    eager_input_streaming: true
  },
  {
    name: "aufgabe_anlegen",
    description: "Legt eine konkrete Aufgabe in der Aufgabenliste der Person an. Nutze es, wenn ihr einen klaren nächsten Schritt vereinbart. Höchstens 3 Aufgaben pro Antwort.",
    input_schema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Aufgabe mit Verb am Anfang, z. B. 'Schreibe 5 Cafés im Quartier an.'" },
        wichtig: { type: "boolean", description: "true, wenn es die eine wichtigste Aufgabe für heute ist." }
      },
      required: ["text", "wichtig"],
      additionalProperties: false
    },
    eager_input_streaming: true
  },
  {
    name: "buchung_eintragen",
    description: "Trägt eine Einnahme oder Ausgabe ins Geldbuch der Person ein. Nur wenn die Person einen echten Betrag nennt.",
    input_schema: {
      type: "object",
      properties: {
        art: { type: "string", enum: ["ein", "aus"], description: "ein = Einnahme, aus = Ausgabe" },
        betrag: { type: "number", description: "Betrag in der Währung der Person, positiv" },
        quelle: { type: "string", description: "Woher oder wofür, z. B. 'Nachhilfe' oder 'Werbung'" },
        datum: { type: "string", description: "Datum im Format JJJJ-MM-TT; heute, wenn nicht genannt" }
      },
      required: ["art", "betrag", "quelle", "datum"],
      additionalProperties: false
    },
    eager_input_streaming: true
  }
];

function werkzeugeFuer(modell) {
  // Die Liste bleibt in einem Gespräch immer gleich, sonst verfällt das Nachdenken früherer Antworten.
  var suche = modell === "claude-haiku-5-5"
    ? { type: "web_search_20250305", name: "web_search", max_uses: 5 }
    : { type: "web_search_20260209", name: "web_search", max_uses: 5 };
  return EIGENE_WERKZEUGE.concat([suche]);
}

function werkzeugAusfuehren(name, input) {
  if (!input || typeof input !== "object") return { fehler: true, text: "Eingabe fehlt oder ist unvollständig." };
  if (name === "merken") {
    if (typeof input.text !== "string" || !input.text.trim()) return { fehler: true, text: "Feld 'text' fehlt." };
    return { text: merken(input.text) };
  }
  if (name === "aufgabe_anlegen") {
    if (typeof input.text !== "string" || !input.text.trim()) return { fehler: true, text: "Feld 'text' fehlt." };
    return { text: aufgabeAnlegen(input.text, input.wichtig === true) };
  }
  if (name === "buchung_eintragen") {
    var antwort = buchungEintragen(input.art, input.betrag, input.quelle, input.datum);
    return { text: antwort, fehler: /fehlt|ungültig|muss/.test(antwort) };
  }
  return { fehler: true, text: "Unbekanntes Werkzeug: " + name };
}

var _sdk = null;
async function sdkLaden() {
  if (!_sdk) _sdk = await import(SDK_URL);
  return _sdk;
}

function fehlerText(sdk, e) {
  var A = sdk.default || sdk;
  if (e && e.name === "AbortError") return "Abgebrochen.";
  if (A.APIUserAbortError && e instanceof A.APIUserAbortError) return "Abgebrochen.";
  if (A.AuthenticationError && e instanceof A.AuthenticationError) return "Der API-Schlüssel stimmt nicht. Prüfe ihn unter „Ich“.";
  if (A.PermissionDeniedError && e instanceof A.PermissionDeniedError) return "Dein Schlüssel darf dieses Modell nicht nutzen. Wähle unter „Ich“ ein anderes Modell.";
  if (A.NotFoundError && e instanceof A.NotFoundError) return "Modell nicht gefunden. Wähle unter „Ich“ ein anderes Modell.";
  if (A.RateLimitError && e instanceof A.RateLimitError) return "Zu viele Anfragen oder kein Guthaben mehr. Warte kurz oder lade Guthaben auf platform.claude.com auf.";
  if (A.BadRequestError && e instanceof A.BadRequestError) return "Die Anfrage wurde abgelehnt: " + (e.message || "");
  if (A.InternalServerError && e instanceof A.InternalServerError) return "Anthropic hat gerade Probleme. Versuch es gleich nochmal.";
  if (A.APIConnectionError && e instanceof A.APIConnectionError) return "Keine Verbindung. Prüfe dein Internet.";
  if (A.APIError && e instanceof A.APIError) return "Fehler von Anthropic: " + (e.message || e.status);
  return "Unerwarteter Fehler: " + (e && e.message ? e.message : e);
}

/*
 * Führt eine Antwort aus, inklusive Werkzeug-Runden.
 * chat.nachrichten wird nur hinten ergänzt, nie verändert.
 * cb: { text(delta), status(text), quelle({title,url}), werkzeug(name, ergebnis), fertig(), fehler(text) }
 */
function antwortHolen(chat, cb) {
  var abbruch = { gestoppt: false, stream: null };

  (async function () {
    var sdk;
    try {
      sdk = await sdkLaden();
    } catch (e) {
      cb.fehler("Die KI-Bibliothek konnte nicht geladen werden. Prüfe dein Internet.");
      return;
    }
    var Anthropic = sdk.default;
    var e = Z.einstellungen;
    var client = new Anthropic({ apiKey: e.schluessel, dangerouslyAllowBrowser: true, maxRetries: 2 });
    var modell = e.modell;
    var betas = ["thinking-binding-controls-2026-08-01"];
    var extra = {};
    if (modell !== "claude-haiku-5-5") {
      betas.push("server-side-fallback-2026-07-01");
      extra.fallbacks = "default";
    }

    try {
      for (var runde = 0; runde < 8 && !abbruch.gestoppt; runde++) {
        var stream = client.beta.messages.stream(Object.assign({
          model: modell,
          max_tokens: 32000,
          thinking: { type: "adaptive", block_binding: { prefix_mismatch_behavior: "drop_block" } },
          output_config: { effort: e.tiefe || "medium" },
          cache_control: { type: "ephemeral" },
          system: chat.system,
          tools: werkzeugeFuer(modell),
          messages: chat.nachrichten,
          betas: betas
        }, extra));
        abbruch.stream = stream;

        for await (var ev of stream) {
          if (ev.type === "content_block_start") {
            var b = ev.content_block;
            if (b.type === "thinking") cb.status("denkt nach …");
            else if (b.type === "server_tool_use") cb.status("sucht im Web …");
            else if (b.type === "tool_use") cb.status("speichert …");
            else if (b.type === "text") cb.status("schreibt …");
            if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
              b.content.forEach(function (r) { if (r.url) cb.quelle({ title: r.title || r.url, url: r.url }); });
            }
          } else if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            cb.text(ev.delta.text);
          }
        }

        var msg = await stream.finalMessage();
        chat.nachrichten.push({ role: "assistant", content: msg.content });
        kostenZaehlen(chat, msg);
        speichern();

        if (msg.stop_reason === "refusal") {
          cb.text("\n\n_Diese Anfrage hat das Modell abgelehnt. Formuliere sie bitte anders._");
          break;
        }
        if (msg.stop_reason === "pause_turn") continue;
        if (msg.stop_reason === "max_tokens") {
          cb.text("\n\n_Die Antwort war zu lang und wurde abgeschnitten. Schreib „weiter“._");
          break;
        }
        if (msg.stop_reason !== "tool_use") break;

        var ergebnisse = [];
        msg.content.forEach(function (block) {
          if (block.type !== "tool_use") return;
          var erg = werkzeugAusfuehren(block.name, block.input);
          cb.werkzeug(block.name, erg.text);
          ergebnisse.push({ type: "tool_result", tool_use_id: block.id, content: erg.text, is_error: !!erg.fehler });
        });
        if (!ergebnisse.length) break;
        chat.nachrichten.push({ role: "user", content: ergebnisse });
        speichern();
      }
      cb.fertig();
    } catch (err) {
      cb.fehler(fehlerText(sdk, err));
    }
  })();

  return {
    stoppen: function () {
      abbruch.gestoppt = true;
      if (abbruch.stream) abbruch.stream.abort();
    }
  };
}

function kostenZaehlen(chat, msg) {
  var u = msg.usage || {};
  var p = PREISE[msg.model] || PREISE[Z.einstellungen.modell] || PREISE["claude-opus-5-5"];
  var ein = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) * 1.25;
  var dollar = ein * p.ein / 1e6 + (u.cache_read_input_tokens || 0) * p.cache / 1e6 + (u.output_tokens || 0) * p.aus / 1e6;
  var suchen = (u.server_tool_use && u.server_tool_use.web_search_requests) || 0;
  dollar += suchen * PREIS_WEBSUCHE;
  chat.kosten = (chat.kosten || 0) + dollar;
}
