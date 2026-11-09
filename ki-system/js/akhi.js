/*
 * Akhi: der Sprach-Assistent von A&T im Jarvis-Stil.
 * Eigenes Dashboard (Vollbild), Weckwort „Hey Akhi“, Männerstimme, Gesprächsmodus,
 * Wissens-Bibliothek, Dokumente (als PDF speicherbar), Checklisten, Aufgaben nach Bereichen, Businessplan-Formular.
 * Nutzt dieselbe KI wie der Mentor (lokal, Gemini oder Claude).
 */

var AKHI_AUFTRAG = [
  "Rolle: Du bist AKHI, der persönliche Business-Assistent von A&T, wie Jarvis: ein erfahrener, ruhiger, loyaler Bruder mit tiefem Wissen in Strategie, Finanzen, Marketing, Verkauf, Social Media, E-Commerce, Reselling, Digistore24, Affiliate, KI-Werkzeugen, Automatisierung (Zapier, Make, n8n, Schnittstellen, Webhooks, MCP-Konnektoren), Gründung und Steuern in der Schweiz und islamischem Wirtschaftsrecht.",
  "Du wirst oft per Stimme benutzt: Beginne jede Antwort mit 1 bis 3 kurzen, gesprochenen Sätzen ohne Aufzählungszeichen und ohne Markdown, die direkt antworten. Danach, durch eine Leerzeile getrennt, bei Bedarf Details als klare Schritte.",
  "Sei konkret wie ein Unternehmensberater: Zahlen, Werkzeuge mit Namen, Kosten, Zeitplan, nächster Schritt. Keine Floskeln. Wenn Wissen veraltet sein könnte (Gebühren, Gesetze), sag es in einem Halbsatz.",
  "Werkzeuge: wissen_nachschlagen für Grundlagen aus der Bibliothek (Themen: " + (typeof wissenThemen === "function" ? wissenThemen() : "") + "). " +
  "dokument_erstellen, wenn die Person einen Plan, ein Konzept, ein Formular, eine Vorlage, einen Vertragsentwurf, einen Text oder ein PDF will: vollständig, gut gegliedert in Markdown, druckfertig. " +
  "checkliste_erstellen für Abläufe zum Abhaken. aufgabe_anlegen mit Bereich für konkrete nächste Schritte. merken für Bleibendes über die Person.",
  "Sag nach einem Werkzeug kurz, was du angelegt hast und wo es steht (im Akhi-Dashboard unter Dokumente, Checklisten oder Aufgaben)."
].join("\n");

var AKHI_WERKZEUGE = [
  {
    name: "wissen_nachschlagen",
    description: "Liest eine Anleitung aus der A&T-Bibliothek (mit Checkliste). Themen: businessplan, marketing, digistore24, reselling, socialmedia, ki-systeme, gruenden-ch, halal-business, verkauf, produktivitaet.",
    input_schema: { type: "object", properties: { thema: { type: "string", description: "Thema oder Stichwort, z. B. digistore24" } }, required: ["thema"], additionalProperties: false },
    eager_input_streaming: true
  },
  {
    name: "dokument_erstellen",
    description: "Speichert ein fertiges Dokument (Businessplan, Marketingplan, Formular, Vorlage, Konzept, Angebot, Skript) für die Person. Sie kann es im Akhi-Dashboard lesen und als PDF speichern. Inhalt vollständig in Markdown mit Überschriften, Listen und Tabellen.",
    input_schema: { type: "object", properties: {
      titel: { type: "string", description: "Titel des Dokuments" },
      art: { type: "string", enum: ["Businessplan", "Marketingplan", "Formular", "Vorlage", "Konzept", "Anleitung", "Text"], description: "Art" },
      inhalt: { type: "string", description: "Vollständiger Inhalt in Markdown" }
    }, required: ["titel", "art", "inhalt"], additionalProperties: false },
    eager_input_streaming: true
  },
  {
    name: "checkliste_erstellen",
    description: "Legt eine Checkliste zum Abhaken im Akhi-Dashboard an.",
    input_schema: { type: "object", properties: {
      titel: { type: "string", description: "Titel der Checkliste" },
      punkte: { type: "array", items: { type: "string" }, description: "Einzelne Schritte, je mit Verb am Anfang" }
    }, required: ["titel", "punkte"], additionalProperties: false },
    eager_input_streaming: true
  }
];

function akhiDaten() {
  if (!Array.isArray(Z.dokumente)) Z.dokumente = [];
  if (!Array.isArray(Z.checklisten)) Z.checklisten = [];
  if (!Z.businessplan || typeof Z.businessplan !== "object") Z.businessplan = {};
  return Z;
}

function akhiWerkzeug(name, input) {
  akhiDaten();
  if (name === "wissen_nachschlagen") {
    var w = wissenFinden(input.thema);
    return w ? { text: wissenAlsText(w) } : { text: "Kein Eintrag gefunden. Vorhandene Themen: " + wissenThemen() + ". Antworte aus deinem eigenen Wissen." };
  }
  if (name === "dokument_erstellen") {
    var titel = String(input.titel || "").trim(), inhalt = String(input.inhalt || "").trim();
    if (!titel || !inhalt) return { fehler: true, text: "Titel und Inhalt fehlen." };
    Z.dokumente.push({ id: neueId(), titel: titel.slice(0, 120), art: input.art || "Text", inhalt: inhalt, datum: heuteISO() });
    if (Z.dokumente.length > 60) Z.dokumente.shift();
    speichern();
    if (typeof Akhi !== "undefined") Akhi.neuZeichnen();
    return { text: "Dokument „" + titel + "“ gespeichert (Akhi → Dokumente, dort auch als PDF)." };
  }
  if (name === "checkliste_erstellen") {
    var punkte = (Array.isArray(input.punkte) ? input.punkte : String(input.punkte || "").split(/\n|;/)).map(function (p) { return String(p).replace(/^[-*\d.\s\[\]]+/, "").trim(); }).filter(Boolean);
    if (!punkte.length) return { fehler: true, text: "Keine Punkte angegeben." };
    Z.checklisten.push({ id: neueId(), titel: String(input.titel || "Checkliste").slice(0, 100), punkte: punkte.slice(0, 40).map(function (p) { return { text: p, erledigt: false }; }), datum: heuteISO() });
    speichern();
    if (typeof Akhi !== "undefined") Akhi.neuZeichnen();
    return { text: "Checkliste „" + input.titel + "“ mit " + punkte.length + " Punkten angelegt (Akhi → Checklisten)." };
  }
  return null;
}

/* ---------- Drucken / PDF (funktioniert auch auf dem Handy: Drucken → Als PDF sichern) ---------- */
function alsPdf(titel, markdown) {
  var box = document.getElementById("druck");
  if (!box) { box = document.createElement("div"); box.id = "druck"; document.body.appendChild(box); }
  var html = window.marked ? marked.parse(String(markdown || "")) : String(markdown || "").replace(/</g, "&lt;").replace(/\n/g, "<br>");
  if (window.DOMPurify) html = DOMPurify.sanitize(html);
  box.innerHTML = "<div class='druck-kopf'>A&amp;T · Amanah &amp; Tijara · " + new Date().toLocaleDateString("de-CH") + "</div><h1>" +
    String(titel || "").replace(/</g, "&lt;") + "</h1>" + html;
  document.body.classList.add("druckt");
  var alt = document.title; document.title = String(titel || "A&T").replace(/[\\/:*?"<>|]/g, "-");
  setTimeout(function () {
    window.print();
    setTimeout(function () { document.body.classList.remove("druckt"); document.title = alt; }, 500);
  }, 50);
}

/* ---------- Businessplan-Formular ---------- */
var BP_FELDER = [
  ["idee", "Geschäftsidee in 3 Sätzen"], ["problem", "Problem der Kunden"], ["loesung", "Deine Lösung"],
  ["zielgruppe", "Zielgruppe (wer genau?)"], ["angebot", "Angebot und Preise"], ["konkurrenz", "Konkurrenz und deine Lücke"],
  ["marketing", "Marketing und Verkauf (Kanäle)"], ["organisation", "Organisation, Rechtsform, Partner"],
  ["risiken", "Die 3 grössten Risiken und Gegenmassnahmen"], ["meilensteine", "Meilensteine (30, 90, 365 Tage)"], ["halal", "Halal-Prüfung (Produkt, Finanzierung, Werbung)"]
];
var BP_ZAHLEN = [["start", "Startkosten (CHF)"], ["fix", "Fixkosten pro Monat (CHF)"], ["preis", "Preis pro Verkauf (CHF)"], ["variabel", "Variable Kosten pro Verkauf (CHF)"], ["ziel", "Umsatzziel pro Monat (CHF)"]];

function bpRechnung(bp) {
  var n = function (k) { return Math.max(0, parseFloat(String(bp[k] || "").replace(/[’' ]/g, "").replace(",", ".")) || 0); };
  var db = n("preis") - n("variabel");
  var schwelle = db > 0 ? Math.ceil(n("fix") / db) : null;
  var verkaeufeZiel = n("preis") > 0 ? Math.ceil(n("ziel") / n("preis")) : null;
  var gewinnZiel = verkaeufeZiel !== null ? Math.round(verkaeufeZiel * db - n("fix")) : null;
  var monateStart = gewinnZiel > 0 && n("start") > 0 ? Math.ceil(n("start") / gewinnZiel) : null;
  return { db: db, schwelle: schwelle, verkaeufeZiel: verkaeufeZiel, gewinnZiel: gewinnZiel, monateStart: monateStart };
}
function bpMarkdown(bp) {
  var r = bpRechnung(bp), chf = function (x) { return (Math.round(x * 100) / 100).toLocaleString("de-CH") + " CHF"; };
  var teile = BP_FELDER.map(function (f) { return "## " + f[1] + "\n" + (String(bp[f[0]] || "").trim() || "_noch offen_"); });
  teile.push("## Finanzplan\n| Posten | Wert |\n|---|---|\n" + BP_ZAHLEN.map(function (z) { return "| " + z[1] + " | " + (bp[z[0]] || "–") + " |"; }).join("\n") +
    "\n| Deckungsbeitrag pro Verkauf | " + chf(r.db) + " |" +
    "\n| Gewinnschwelle | " + (r.schwelle !== null ? r.schwelle + " Verkäufe pro Monat" : "–") + " |" +
    "\n| Verkäufe für das Umsatzziel | " + (r.verkaeufeZiel !== null ? r.verkaeufeZiel + " pro Monat" : "–") + " |" +
    "\n| Gewinn beim Umsatzziel | " + (r.gewinnZiel !== null ? chf(r.gewinnZiel) + " pro Monat" : "–") + " |" +
    "\n| Startkosten zurück nach | " + (r.monateStart !== null ? r.monateStart + (r.monateStart === 1 ? " Monat" : " Monaten") : "–") + " |");
  return teile.join("\n\n");
}

/* ---------- Männerstimme ---------- */
var MANN_STIMMEN = /conrad|killian|florian|stefan|jan\b|markus|yannick|viktor|martin|reed|helmut|bernd|ralf|klaus|hans|männlich|male|\bmann\b/i;
function akhiStimmen() {
  if (!("speechSynthesis" in window)) return [];
  return speechSynthesis.getVoices().filter(function (v) { return /^de/i.test(v.lang); });
}
function akhiStimme() {
  var alle = akhiStimmen(), gewuenscht = Z.einstellungen.akhiStimme;
  if (gewuenscht) { var g = alle.filter(function (v) { return v.name === gewuenscht; })[0]; if (g) return { stimme: g, tiefer: false }; }
  var maenner = alle.filter(function (v) { return MANN_STIMMEN.test(v.name); });
  var ch = maenner.filter(function (v) { return /CH/i.test(v.lang); });
  var natuerlich = maenner.filter(function (v) { return /natural|online|neural|premium|enhanced/i.test(v.name); });
  var wahl = natuerlich[0] || ch[0] || maenner[0];
  if (wahl) return { stimme: wahl, tiefer: false };
  return { stimme: alle[0] || null, tiefer: true }; // keine Männerstimme installiert: tiefer sprechen
}
// Spricht nur den gesprochenen Teil (bis zur ersten Liste oder Überschrift, höchstens ~700 Zeichen).
function akhiSprechteil(text) {
  var t = String(text || "").replace(/```[\s\S]*?```/g, " ");
  var stop = t.search(/\n\s*(#|[-*] |\d+\. |\|)/);
  if (stop > 40) t = t.slice(0, stop);
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[#*_>`|]/g, " ").replace(/\s+/g, " ").trim();
  if (t.length > 700) { var ende = t.lastIndexOf(".", 700); t = t.slice(0, ende > 200 ? ende + 1 : 700); }
  return t;
}
function akhiSprechen(text, fertig) {
  if (!("speechSynthesis" in window) || !text) { if (fertig) fertig(); return; }
  speechSynthesis.cancel();
  var s = akhiStimme(), u = new SpeechSynthesisUtterance(text);
  u.lang = (s.stimme && s.stimme.lang) || "de-DE";
  if (s.stimme) u.voice = s.stimme;
  u.pitch = s.tiefer ? 0.7 : 0.95; u.rate = 1.02;
  var fertigEinmal = false, ende = function () { if (!fertigEinmal) { fertigEinmal = true; if (fertig) fertig(); } };
  u.onend = ende; u.onerror = ende;
  speechSynthesis.speak(u);
  // Manche Browser melden das Ende nicht: Sicherheitszeit nach Textlänge
  setTimeout(function () { if (!speechSynthesis.speaking) ende(); }, Math.max(4000, text.length * 90));
}

/* ---------- Dashboard ---------- */
var Akhi = (function () {
  var $ = function (s) { return document.querySelector(s); };
  var laeuft = null, gespraech = false, zustand = "bereit", ansicht = null;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function md(t) { var h = window.marked ? marked.parse(String(t || "")) : esc(t); return window.DOMPurify ? DOMPurify.sanitize(h) : h; }
  function toastAkhi(t) { var el = $("#toast"); el.textContent = t; el.classList.add("sichtbar"); clearTimeout(toastAkhi._t); toastAkhi._t = setTimeout(function () { el.classList.remove("sichtbar"); }, 3000); }

  function setZustand(z, text) {
    zustand = z;
    var k = $("#akhi-kern"); if (k) k.className = "akhi-kern " + z;
    var s = $("#akhi-status"); if (s) s.textContent = text || { bereit: "Bereit. Sag „Hey Akhi“ oder tipp auf den Kern.", hoert: "Ich höre …", denkt: "Ich denke nach …", spricht: "Akhi spricht …" }[z] || "";
  }

  function oeffnen() {
    akhiDaten();
    $("#akhi").classList.remove("versteckt");
    document.body.classList.add("akhi-offen");
    try { sessionStorage.setItem("aundt-akhi", "1"); } catch (e) {}
    zeichnen();
    setZustand(laeuft ? "denkt" : "bereit");
  }
  function schliessen() {
    gespraech = false;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    $("#akhi").classList.add("versteckt");
    document.body.classList.remove("akhi-offen");
    try { sessionStorage.removeItem("aundt-akhi"); } catch (e) {}
  }
  function offen() { return !$("#akhi").classList.contains("versteckt"); }

  /* Uhr und Statuswerte */
  function uhr() {
    var u = $("#akhi-uhr"); if (!u || !offen()) return;
    var d = new Date();
    u.innerHTML = "<span class='akhi-zeit'>" + d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }) + "</span><span>" + d.toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long" }) + "</span>";
  }
  function werte() {
    var e = Z.einstellungen, m = typeof monatsZahlen === "function" ? monatsZahlen() : null;
    var offenA = Z.aufgaben.filter(function (a) { return !a.erledigt; }).length;
    var zeilen = [];
    if (m) zeilen.push(["Einnahmen Monat", geld(m.ein) + (e.ziel ? " von " + geld(e.ziel) : "")]);
    zeilen.push(["Offene Aufgaben", String(offenA)]);
    zeilen.push(["Dokumente", String(Z.dokumente.length)]);
    zeilen.push(["Checklisten", String(Z.checklisten.length)]);
    if (istBesitzer() && typeof depot === "function") {
      var d = depot(), wert = d.bargeld;
      Object.keys(d.positionen).forEach(function (s) { wert += d.positionen[s].einstand * d.positionen[s].anzahl; });
      zeilen.push(["Übungs-Depot", usd(wert)]);
      zeilen.push(["US-Börse", boerseOffen() ? "offen" : "geschlossen"]);
      if (typeof yuhAn === "function" && yuhAn()) zeilen.push(["Yuh-Vorschläge", String(yuhOffen().length)]);
    }
    zeilen.push(["KI", { lokal: "Lokal", gemini: "Gemini", claude: "Claude" }[e.anbieter] || "–"]);
    $("#akhi-werte").innerHTML = zeilen.map(function (z) { return "<div class='akhi-wert'><span>" + esc(z[0]) + "</span><strong>" + esc(z[1]) + "</strong></div>"; }).join("");
  }

  function zeichnen() {
    if (!offen()) return;
    uhr(); werte();
    // Module (Bibliothek)
    $("#akhi-module").innerHTML = WISSEN.map(function (w) {
      return "<button class='akhi-modul' data-id='" + w.id + "'><span class='akhi-symbol'>" + w.symbol + "</span><span><strong>" + esc(w.titel) + "</strong><small>" + esc(w.bereich) + "</small></span></button>";
    }).join("") + "<button class='akhi-modul' data-id='bp-formular'><span class='akhi-symbol'>📝</span><span><strong>Businessplan-Formular</strong><small>Ausfüllen, rechnen, PDF</small></span></button>";
    document.querySelectorAll(".akhi-modul").forEach(function (b) { b.onclick = function () { b.dataset.id === "bp-formular" ? formularZeigen() : wissenZeigen(b.dataset.id); }; });
    // Dokumente
    var dl = $("#akhi-dokumente");
    dl.innerHTML = Z.dokumente.length ? "" : "<li class='leise klein-text'>Noch keine. Sag z. B. „Hey Akhi, erstelle mir einen Businessplan für Reselling.“</li>";
    Z.dokumente.slice().reverse().forEach(function (d) {
      var li = document.createElement("li");
      li.innerHTML = "<button class='akhi-link'>📄 " + esc(d.titel) + "<small> · " + esc(d.art) + " · " + esc(d.datum) + "</small></button><button class='mini' title='PDF'>PDF</button><button class='mini' title='Löschen'>✕</button>";
      var k = li.querySelectorAll("button");
      k[0].onclick = function () { dokumentZeigen(d); };
      k[1].onclick = function () { alsPdf(d.titel, d.inhalt); };
      k[2].onclick = function () { if (confirm("„" + d.titel + "“ löschen?")) { Z.dokumente = Z.dokumente.filter(function (x) { return x !== d; }); speichern(); zeichnen(); } };
      dl.appendChild(li);
    });
    // Checklisten
    var cl = $("#akhi-checklisten"); cl.innerHTML = Z.checklisten.length ? "" : "<li class='leise klein-text'>Noch keine. Öffne ein Modul und tipp „Checkliste übernehmen“.</li>";
    Z.checklisten.slice().reverse().forEach(function (c) {
      var fertig = c.punkte.filter(function (p) { return p.erledigt; }).length;
      var li = document.createElement("li"); li.className = "akhi-checkliste";
      li.innerHTML = "<div class='zeile-oben'><strong>" + esc(c.titel) + "</strong><small>" + fertig + "/" + c.punkte.length + "</small><button class='mini' title='PDF'>PDF</button><button class='mini' title='Löschen'>✕</button></div>" +
        c.punkte.map(function (p, i) { return "<label class='haken'><input type='checkbox' data-i='" + i + "'" + (p.erledigt ? " checked" : "") + "> <span>" + esc(p.text) + "</span></label>"; }).join("");
      li.querySelectorAll("input").forEach(function (cb) { cb.onchange = function () { c.punkte[cb.dataset.i].erledigt = cb.checked; speichern(); zeichnen(); }; });
      var kn = li.querySelectorAll(".zeile-oben button");
      kn[0].onclick = function () { alsPdf(c.titel, c.punkte.map(function (p) { return "- " + (p.erledigt ? "☑ " : "☐ ") + p.text; }).join("\n")); };
      kn[1].onclick = function () { if (confirm("Checkliste löschen?")) { Z.checklisten = Z.checklisten.filter(function (x) { return x !== c; }); speichern(); zeichnen(); } };
      cl.appendChild(li);
    });
    // Aufgaben nach Bereichen
    var gruppen = {};
    Z.aufgaben.filter(function (a) { return !a.erledigt; }).forEach(function (a) { var b = a.bereich || "Allgemein"; (gruppen[b] = gruppen[b] || []).push(a); });
    var al = $("#akhi-aufgaben"), namen = Object.keys(gruppen);
    al.innerHTML = namen.length ? "" : "<li class='leise klein-text'>Keine offenen Aufgaben.</li>";
    namen.forEach(function (b) {
      var li = document.createElement("li");
      li.innerHTML = "<strong class='akhi-bereich'>" + esc(b) + "</strong>" + gruppen[b].map(function (a) { return "<label class='haken'><input type='checkbox' data-id='" + a.id + "'> <span>" + (a.wichtig ? "⭐ " : "") + esc(a.text) + "</span></label>"; }).join("");
      li.querySelectorAll("input").forEach(function (cb) { cb.onchange = function () { var a = Z.aufgaben.filter(function (x) { return x.id === cb.dataset.id; })[0]; if (a) { a.erledigt = true; speichern(); zeichnen(); } }; });
      al.appendChild(li);
    });
    // Stimmen-Auswahl
    var sel = $("#akhi-stimme-wahl"), st = akhiStimmen(), aktuell = akhiStimme();
    sel.innerHTML = "<option value=''>Automatisch (Männerstimme)</option>" + st.map(function (v) { return "<option" + (Z.einstellungen.akhiStimme === v.name ? " selected" : "") + ">" + esc(v.name) + "</option>"; }).join("");
    $("#akhi-stimme-info").textContent = aktuell.stimme ? "Stimme: " + aktuell.stimme.name + (aktuell.tiefer ? " (keine Männerstimme gefunden, spricht tiefer)" : "") : "Dieser Browser hat keine deutsche Stimme.";
    $("#akhi-weck").checked = !!Z.einstellungen.weckwort;
    $("#akhi-gespraech").checked = Z.einstellungen.akhiGespraech !== false;
  }

  /* Ansichten im Arbeitsbereich */
  function arbeit(html) { var a = $("#akhi-arbeit"); a.innerHTML = html; a.classList.remove("versteckt"); a.scrollIntoView({ behavior: "smooth", block: "start" }); return a; }
  function wissenZeigen(id) {
    var w = wissenFinden(id); if (!w) return;
    var a = arbeit("<div class='akhi-ansicht-kopf'><h2>" + w.symbol + " " + esc(w.titel) + "</h2><div><button class='knopf klein' data-a='pdf'>Als PDF</button> <button class='knopf klein zart' data-a='cl'>Checkliste übernehmen</button> <button class='knopf klein zart' data-a='frag'>Mit Akhi besprechen</button> <button class='mini' data-a='zu'>✕</button></div></div>" +
      "<div class='md'>" + md(w.text.join("\n")) + "</div><h3>Checkliste</h3><ul>" + w.checkliste.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>");
    a.querySelector("[data-a=pdf]").onclick = function () { alsPdf(w.titel, wissenAlsText(w).replace(/^# .*\n/, "")); };
    a.querySelector("[data-a=cl]").onclick = function () { akhiWerkzeug("checkliste_erstellen", { titel: w.titel, punkte: w.checkliste }); toastAkhi("Checkliste „" + w.titel + "“ angelegt."); };
    a.querySelector("[data-a=frag]").onclick = function () { fragen("Erkläre mir " + w.titel + " Schritt für Schritt für meine Situation und sag mir den ersten konkreten Schritt."); };
    a.querySelector("[data-a=zu]").onclick = function () { a.classList.add("versteckt"); };
  }
  function dokumentZeigen(d) {
    var a = arbeit("<div class='akhi-ansicht-kopf'><h2>📄 " + esc(d.titel) + "</h2><div><button class='knopf klein' data-a='pdf'>Als PDF</button> <button class='knopf klein zart' data-a='kopie'>Text kopieren</button> <button class='mini' data-a='zu'>✕</button></div></div><div class='md'>" + md(d.inhalt) + "</div>");
    a.querySelector("[data-a=pdf]").onclick = function () { alsPdf(d.titel, d.inhalt); };
    a.querySelector("[data-a=kopie]").onclick = function () { if (navigator.clipboard) navigator.clipboard.writeText(d.inhalt).then(function () { toastAkhi("Kopiert."); }); };
    a.querySelector("[data-a=zu]").onclick = function () { a.classList.add("versteckt"); };
  }
  function formularZeigen() {
    var bp = akhiDaten().businessplan;
    var a = arbeit("<div class='akhi-ansicht-kopf'><h2>📝 Businessplan-Formular</h2><div><button class='knopf klein' data-a='pdf'>Als PDF</button> <button class='knopf klein zart' data-a='akhi'>Akhi ausarbeiten lassen</button> <button class='mini' data-a='zu'>✕</button></div></div>" +
      "<p class='leise klein-text'>Wird automatisch gespeichert. Die Zahlen rechnet A&amp;T sofort durch.</p><form class='formular' id='bp-form'>" +
      BP_FELDER.map(function (f) { return "<label>" + esc(f[1]) + "<textarea rows='3' data-k='" + f[0] + "'>" + esc(bp[f[0]] || "") + "</textarea></label>"; }).join("") +
      "<h3>Finanzplan</h3><div class='raster zwei'>" + BP_ZAHLEN.map(function (z) { return "<label>" + esc(z[1]) + "<input inputmode='decimal' data-k='" + z[0] + "' value='" + esc(bp[z[0]] || "") + "'></label>"; }).join("") + "</div>" +
      "<div id='bp-rechnung' class='akhi-rechnung'></div></form>");
    function rechnen() {
      var r = bpRechnung(bp);
      $("#bp-rechnung").innerHTML = "<div>Deckungsbeitrag pro Verkauf: <strong>" + (Math.round(r.db * 100) / 100) + " CHF</strong></div>" +
        "<div>Gewinnschwelle: <strong>" + (r.schwelle !== null ? r.schwelle + " Verkäufe pro Monat" : "Preis muss über den variablen Kosten liegen") + "</strong></div>" +
        (r.verkaeufeZiel !== null ? "<div>Für dein Umsatzziel: <strong>" + r.verkaeufeZiel + " Verkäufe</strong>, Gewinn <strong>" + r.gewinnZiel + " CHF</strong> pro Monat</div>" : "") +
        (r.monateStart !== null ? "<div>Startkosten zurück nach <strong>" + r.monateStart + (r.monateStart === 1 ? " Monat" : " Monaten") + "</strong></div>" : "");
    }
    a.querySelectorAll("[data-k]").forEach(function (f) { f.oninput = function () { bp[f.dataset.k] = f.value; speichern(); rechnen(); }; });
    rechnen();
    a.querySelector("[data-a=pdf]").onclick = function () { alsPdf("Businessplan" + (bp.idee ? ": " + String(bp.idee).split(/[.\n]/)[0].slice(0, 60) : ""), bpMarkdown(bp)); };
    a.querySelector("[data-a=akhi]").onclick = function () {
      fragen("Hier ist mein Businessplan-Entwurf. Prüfe ihn kritisch wie ein Investor, ergänze fehlende Teile, korrigiere die Zahlen wenn nötig und speichere eine vollständige, saubere Fassung mit dokument_erstellen (Art Businessplan). Sag mir dann die 3 wichtigsten Verbesserungen.\n\n" + bpMarkdown(bp));
    };
    a.querySelector("[data-a=zu]").onclick = function () { a.classList.add("versteckt"); };
  }

  /* Gespräch mit der KI */
  function akhiChat() {
    var e = Z.einstellungen, c = Z.akhiChat;
    if (!c || c.anbieter !== e.anbieter || c.nachrichten.length > 40) {
      c = Z.akhiChat = { id: "akhi", anbieter: e.anbieter, modus: "akhi", system: grundauftrag("Akhi"), nachrichten: [], kosten: 0, titel: "Akhi" };
    }
    return c;
  }
  function fragen(text) {
    text = String(text || "").trim();
    if (!text || laeuft) return;
    if (!hatSchluessel()) { antwortZeigen("Ich brauche zuerst eine KI-Verbindung. Unter „Ich“ trägst du den kostenlosen Gemini-Schlüssel ein, oder auf dem Laptop die lokale KI.", true); return; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    var c = akhiChat();
    var kontext = "<kontext>\n" + HALAL_ERINNERUNG + "\n" + AKHI_AUFTRAG + "\n" + kontextFuerKi() + "\n</kontext>";
    // Abgebrochene Frage am Ende entfernen (Anbieter erwarten abwechselnd Person und KI)
    var letzte = c.nachrichten[c.nachrichten.length - 1];
    if (letzte && letzte.role === "user") c.nachrichten.pop();
    if (c.anbieter === "gemini") c.nachrichten.push({ role: "user", parts: [{ text: kontext }, { text: text }] });
    else if (c.anbieter === "lokal") c.nachrichten.push({ role: "user", content: kontext + "\n\n" + text, _anzeige: text });
    else c.nachrichten.push({ role: "user", content: [{ type: "text", text: kontext }, { type: "text", text: text }] });
    $("#akhi-du").textContent = "„" + text.slice(0, 200) + (text.length > 200 ? " …" : "") + "“";
    $("#akhi-aktionen").innerHTML = "";
    setZustand("denkt");
    var gesamt = "";
    laeuft = antwortHolen(c, {
      text: function (d) { gesamt += d; $("#akhi-antwort").innerHTML = md(gesamt); },
      status: function (s) { setZustand("denkt", s); },
      quelle: function () {},
      werkzeug: function (name, erg) { var sp = document.createElement("span"); sp.textContent = erg; $("#akhi-aktionen").appendChild(sp); zeichnen(); },
      fertig: function () { laeuft = null; speichern(); zeichnen(); antwortZeigen(gesamt, false); },
      fehler: function (t) { laeuft = null; antwortZeigen("Fehler: " + t, true); }
    });
  }
  function antwortZeigen(text, fehler) {
    $("#akhi-antwort").innerHTML = md(text);
    var sprech = akhiSprechteil(text);
    if (!sprech) { setZustand("bereit"); return; }
    setZustand("spricht");
    akhiSprechen(sprech, function () {
      setZustand("bereit");
      // Gesprächsmodus: danach direkt wieder zuhören (nicht nach Fehlern)
      if (!fehler && gespraech && offen() && Z.einstellungen.akhiGespraech !== false) setTimeout(zuhoeren, 300);
    });
  }
  function zuhoeren() {
    if (!Stimme.verfuegbar()) { toastAkhi("Dieser Browser kann nicht zuhören. Nimm Chrome, Edge oder Safari."); return; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    gespraech = true;
    setZustand("hoert");
    Stimme.einmal(function (text, fehler) {
      if (fehler) { setZustand("bereit"); gespraech = false; return toastAkhi(fehler); }
      if (!text) { setZustand("bereit"); gespraech = false; return; }
      if (/^(danke|stopp|stop|tschüss|ciao|ende|das wars|das war's)\b/i.test(text.trim())) { gespraech = false; antwortZeigen("Gern geschehen. Ich bin da, wenn du mich brauchst.", true); return; }
      fragen(text);
    });
    setTimeout(function () { if (zustand === "hoert" && !Stimme.hoert()) setZustand("bereit"); }, 9000);
  }
  // Weckwort „Hey Akhi …“ (aus stimme.js)
  function weck(rest) {
    oeffnen();
    gespraech = true;
    if (rest && rest.length > 2) fragen(rest);
    else antwortZeigen("Ja, Akhi hier. Wie kann ich helfen?", false);
  }

  function verbinden() {
    $("#akhi-zu").onclick = schliessen;
    $("#akhi-kern").onclick = function () { if (laeuft) return; if (zustand === "spricht") { speechSynthesis.cancel(); setZustand("bereit"); return; } zuhoeren(); };
    $("#akhi-form").onsubmit = function (ev) { ev.preventDefault(); var t = $("#akhi-eingabe").value; $("#akhi-eingabe").value = ""; gespraech = false; fragen(t); };
    $("#akhi-mikro").onclick = zuhoeren;
    $("#akhi-weck").onchange = function () {
      if (this.checked && !Stimme.verfuegbar()) { this.checked = false; return toastAkhi("Dieser Browser kann nicht zuhören."); }
      Z.einstellungen.weckwort = this.checked; speichern(); Stimme.weckwort(this.checked);
      var w = document.querySelector("#e-weckwort"); if (w) w.checked = this.checked;
      toastAkhi(this.checked ? "Sag „Hey Akhi“, solange A&T offen ist." : "„Hey Akhi“ aus.");
    };
    $("#akhi-gespraech").onchange = function () { Z.einstellungen.akhiGespraech = this.checked; speichern(); };
    $("#akhi-stimme-wahl").onchange = function () { Z.einstellungen.akhiStimme = this.value; speichern(); zeichnen(); akhiSprechen("Salam, ich bin Akhi."); };
    $("#akhi-stimme-test").onclick = function () { akhiSprechen("Salam aleikum. Ich bin Akhi, dein Business-Assistent. Was bauen wir heute?"); };
    document.querySelectorAll("[data-akhi-frage]").forEach(function (b) { b.onclick = function () { gespraech = false; fragen(b.dataset.akhiFrage); }; });
    document.querySelectorAll(".akhi-oeffnen").forEach(function (b) { b.onclick = oeffnen; });
    if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = function () { if (offen()) zeichnen(); };
    setInterval(function () { if (offen()) { uhr(); werte(); } }, 30000);
    try { if (sessionStorage.getItem("aundt-akhi") === "1") oeffnen(); } catch (e) {}
  }

  return { oeffnen: oeffnen, schliessen: schliessen, weck: weck, fragen: fragen, verbinden: verbinden, neuZeichnen: zeichnen };
})();
