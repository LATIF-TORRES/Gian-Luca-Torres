/* Version, „Das ist neu“ für bestehende Kunden und Hinweis auf Updates. */

var APP_VERSION = "3.0";
// Hier steht die neueste Version. Die Windows-Version prüft das einmal am Tag.
var VERSION_URL = "https://raw.githubusercontent.com/LATIF-TORRES/Gian-Luca-Torres/claude/epic-hypatia-7apja5/ki-system/version.json";
var DOWNLOAD_URL = "https://github.com/LATIF-TORRES/Gian-Luca-Torres/raw/claude/epic-hypatia-7apja5/ki-system/download/A-und-T-Windows.zip";

var NEUIGKEITEN = [
  { titel: "KI ohne Limit auf deinem PC", text: "Neu kann A&T auf deinem eigenen PC rechnen: kostenlos, ohne Tageslimit, ohne Konto. Unter Windows: Doppelklick auf „Lokale KI installieren.cmd“ im A&T-Ordner. A&T findet die lokale KI danach selbst." },
  { titel: "Gemini zuverlässiger", text: "Bei Google-Limits zeigt A&T jetzt den echten Grund, wartet kurz statt abzubrechen und lässt Modelle ohne Gratis-Kontingent weg." },
  { titel: "Sadaqa-Vorschlag statt „Reinigung“", text: "Im Geldbuch gibt es keine „Reinigung“ mehr. Stattdessen zeigt A&T einen Sadaqa-Vorschlag (wählbar unter „Ich“). Das ist nur ein Vorschlag, es wird nie etwas abgezogen. Frühere Reinigungs-Einträge stehen jetzt als normale Ausgaben im Geldbuch." },
  { titel: "Deine Daten bleiben", text: "Gespräche, Gedächtnis, Aufgaben und Geldbuch sind unverändert da. Du musst nichts neu einrichten." }
];

function versionNeuer(a, b) { // ist a neuer als b?
  var x = String(a).split(".").map(Number), y = String(b).split(".").map(Number);
  for (var i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
  }
  return false;
}

var Neuigkeiten = (function () {
  var $ = function (s) { return document.querySelector(s); };

  function zeigen() {
    $("#neu-version").textContent = "Version " + APP_VERSION;
    $("#neu-liste").innerHTML = NEUIGKEITEN.map(function (n) {
      return "<li><strong>" + n.titel.replace(/</g, "&lt;") + "</strong><br><span class='leise'>" + n.text.replace(/</g, "&lt;") + "</span></li>";
    }).join("");
    $("#neuigkeiten").classList.remove("versteckt");
    document.body.classList.add("gesperrt");
  }
  function schliessen() {
    Z.einstellungen.gesehenVersion = APP_VERSION;
    speichern();
    $("#neuigkeiten").classList.add("versteckt");
    document.body.classList.remove("gesperrt");
  }
  $("#neu-ok").onclick = schliessen;

  // Bestehende Kunden sehen das einmal pro Version. Neue Kunden bekommen den Einrichtungs-Assistenten.
  function beimStart() {
    var e = Z.einstellungen;
    if (!e.eingerichtet) { e.gesehenVersion = APP_VERSION; speichern(); return; }
    if (e.gesehenVersion !== APP_VERSION) zeigen();
  }

  // Windows-Version (Datei auf dem PC): einmal am Tag nach Updates schauen.
  // Online (GitHub Pages) kommt die neue Version von selbst.
  function updatePruefen(sofort) {
    if (location.protocol !== "file:") return Promise.resolve(null);
    var e = Z.einstellungen;
    if (!sofort && e.updateGeprueft === heuteISO()) return Promise.resolve(e.updateVersion || null);
    return fetch(VERSION_URL + "?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      e.updateGeprueft = heuteISO();
      e.updateVersion = d && d.version && versionNeuer(d.version, APP_VERSION) ? d.version : "";
      speichern();
      return e.updateVersion || null;
    }).catch(function () { return null; });
  }

  return { beimStart: beimStart, zeigen: zeigen, updatePruefen: updatePruefen };
})();
