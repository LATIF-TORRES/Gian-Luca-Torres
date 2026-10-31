/* Sprechen und Zuhören mit den Bordmitteln des Browsers (keine Downloads nötig). */

var Stimme = (function () {
  var Erkennung = window.SpeechRecognition || window.webkitSpeechRecognition;
  var erkennung = null, hoertZu = false, weckModus = false, beiText = null, beiZustand = null;

  function verfuegbar() { return !!Erkennung; }

  function neueErkennung(dauerhaft) {
    var r = new Erkennung();
    r.lang = Z.einstellungen.sprache || "de-CH";
    r.interimResults = false;
    r.continuous = !!dauerhaft;
    return r;
  }

  // Einmal zuhören und den Text zurückgeben.
  function einmal(fertig) {
    if (!verfuegbar()) return fertig(null, "Dieser Browser kann nicht zuhören. Nimm Chrome, Edge oder Safari.");
    stoppen();
    erkennung = neueErkennung(false);
    hoertZu = true;
    zustand();
    erkennung.onresult = function (ev) {
      var t = Array.prototype.map.call(ev.results, function (r) { return r[0].transcript; }).join(" ");
      fertig(t.trim());
    };
    erkennung.onerror = function (ev) {
      if (ev.error === "not-allowed") fertig(null, "Bitte erlaube das Mikrofon für diese Seite.");
    };
    erkennung.onend = function () { hoertZu = false; zustand(); if (weckModus) weckStarten(); };
    try { erkennung.start(); } catch (e) { hoertZu = false; zustand(); }
  }

  // Freihändig: hört dauerhaft und reagiert auf „Hey <Name>“.
  function weckStarten() {
    if (!verfuegbar() || !weckModus || hoertZu) return;
    erkennung = neueErkennung(true);
    erkennung.onresult = function (ev) {
      var letztes = ev.results[ev.results.length - 1];
      if (!letztes.isFinal) return;
      var t = letztes[0].transcript.trim();
      var name = (Z.einstellungen.kiName || "TORRES").toLowerCase();
      var klein = t.toLowerCase();
      var stelle = klein.indexOf(name);
      if (stelle === -1) return;
      var rest = t.slice(stelle + name.length).replace(/^[\s,.:!?]+/, "").trim();
      if (beiText) beiText(rest, true);
    };
    erkennung.onend = function () { if (weckModus && !hoertZu) setTimeout(weckStarten, 400); };
    try { erkennung.start(); } catch (e) { /* läuft schon */ }
  }

  function weckwort(an) {
    weckModus = !!an && verfuegbar();
    if (weckModus) weckStarten(); else stoppen();
  }

  function stoppen() {
    if (erkennung) { try { erkennung.onend = null; erkennung.abort(); } catch (e) {} }
    erkennung = null;
    hoertZu = false;
    zustand();
  }

  function zustand() { if (beiZustand) beiZustand(hoertZu); }

  function vorlesen(markdown) {
    if (!("speechSynthesis" in window)) return;
    var text = String(markdown || "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[#*_>`|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text.slice(0, 4000));
    u.lang = Z.einstellungen.sprache || "de-CH";
    var passend = window.speechSynthesis.getVoices().filter(function (v) { return v.lang && v.lang.slice(0, 2) === u.lang.slice(0, 2); });
    if (passend.length) u.voice = passend[0];
    window.speechSynthesis.speak(u);
  }

  function stumm() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }

  return {
    verfuegbar: verfuegbar, einmal: einmal, weckwort: weckwort, stoppen: stoppen,
    vorlesen: vorlesen, stumm: stumm,
    beiText: function (f) { beiText = f; }, beiZustand: function (f) { beiZustand = f; }
  };
})();
