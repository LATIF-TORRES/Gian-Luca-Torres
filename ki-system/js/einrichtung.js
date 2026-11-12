/* Einrichtungs-Assistent: führt beim ersten Start in 4 Schritten durch Name, Ziel, Profil und Schlüssel. */

var Einrichtung = (function () {
  var $ = function (s) { return document.querySelector(s); };
  var schritt = 0, ANZAHL = 4, beiFertig = null;

  // Ersetzt einen Profil-Eintrag im Gedächtnis (gleicher Anfang = gleicher Eintrag).
  function profilSetzen(anfang, wert) {
    Z.gedaechtnis = Z.gedaechtnis.filter(function (g) { return g.text.indexOf(anfang) !== 0; });
    if (wert) Z.gedaechtnis.push({ id: neueId(), text: anfang + wert, datum: heuteISO() });
  }
  function profilLesen(anfang) {
    var g = Z.gedaechtnis.filter(function (x) { return x.text.indexOf(anfang) === 0; })[0];
    return g ? g.text.slice(anfang.length) : "";
  }

  var PROFIL = {
    faehig: "Fähigkeiten: ",
    zeit: "Verfügbare Zeit pro Woche in Stunden: ",
    kapital: "Startkapital: ",
    ort: "Wohnort: "
  };

  function zeigen() {
    document.querySelectorAll("#einrichtung .schritt").forEach(function (el) {
      el.classList.toggle("aktiv", Number(el.dataset.schritt) === schritt);
    });
    document.querySelectorAll("#ein-punkte i").forEach(function (p, i) { p.classList.toggle("an", i <= schritt); });
    $("#ein-zurueck").style.visibility = schritt === 0 ? "hidden" : "visible";
    $("#ein-weiter").textContent = schritt === ANZAHL - 1 ? "Fertig" : "Weiter";
    if (schritt === 3) {
      var info = $("#ein-lokal");
      lokalPruefen().then(function (p) {
        if (p.ok && p.modelle.length) {
          info.className = "klein-text plus";
          info.textContent = "✓ Lokale KI auf deinem PC gefunden (" + p.modell + "). A&T läuft damit unbegrenzt und kostenlos. Du brauchst keinen Schlüssel und kannst gleich auf „Fertig“ tippen.";
          Z.einstellungen.anbieter = "lokal";
          Z.einstellungen.lokalModell = Z.einstellungen.lokalModell || p.modell;
          speichern();
        } else {
          info.className = "klein-text leise";
          info.textContent = "Unbegrenzt und kostenlos: die lokale KI auf deinem PC. Unter Windows richtest du sie mit „Lokale KI installieren.cmd“ im A&T-Ordner ein. Das geht auch später.";
        }
      });
    }
    var feld = document.querySelector("#einrichtung .schritt.aktiv input");
    if (feld) setTimeout(function () { feld.focus(); }, 60);
  }

  function sichern() {
    var e = Z.einstellungen;
    if (schritt === 0) {
      e.name = $("#ein-name").value.trim();
    } else if (schritt === 1) {
      e.ziel = Math.max(0, parseFloat($("#ein-ziel").value) || 0);
      e.waehrung = $("#ein-waehrung").value;
      e.warum = $("#ein-warum").value.trim();
    } else if (schritt === 2) {
      profilSetzen(PROFIL.faehig, $("#ein-faehig").value.trim());
      var zeit = parseFloat($("#ein-zeit").value);
      profilSetzen(PROFIL.zeit, isFinite(zeit) && $("#ein-zeit").value !== "" ? String(zeit) : "");
      var kap = parseFloat($("#ein-kapital").value);
      profilSetzen(PROFIL.kapital, isFinite(kap) && $("#ein-kapital").value !== "" ? geld(kap) : "");
      profilSetzen(PROFIL.ort, $("#ein-ort").value.trim());
    } else if (schritt === 3) {
      var k = $("#ein-schluessel").value.replace(/\s/g, "");
      if (/^sk-ant-/.test(k)) { // Claude-Schlüssel
        e.schluessel = k; e.anbieter = "claude"; e.anbieterManuell = true;
      } else if (k && k !== e.geminiSchluessel) {
        e.geminiSchluessel = k;
        e.geminiModell = "";
        _geminiListe = null;
      }
      if (k && !/^sk-ant-/.test(k) && e.anbieter !== "lokal" && e.anbieter !== "claude") e.anbieter = "gemini";
    }
    speichern();
  }

  function fertig() {
    sichern();
    Z.einstellungen.eingerichtet = true;
    speichern();
    $("#einrichtung").classList.add("versteckt");
    document.body.classList.remove("gesperrt");
    if (beiFertig) beiFertig();
  }

  function start(callback) {
    beiFertig = callback;
    var e = Z.einstellungen;
    schritt = 0;
    $("#ein-name").value = e.name || "";
    $("#ein-ziel").value = e.ziel || "";
    $("#ein-waehrung").value = e.waehrung || "CHF";
    $("#ein-warum").value = e.warum || "";
    $("#ein-faehig").value = profilLesen(PROFIL.faehig);
    $("#ein-zeit").value = profilLesen(PROFIL.zeit);
    $("#ein-kapital").value = "";
    $("#ein-ort").value = profilLesen(PROFIL.ort);
    $("#ein-schluessel").value = e.schluessel || e.geminiSchluessel || "";
    $("#ein-test-ergebnis").textContent = "";
    $("#einrichtung").classList.remove("versteckt");
    document.body.classList.add("gesperrt");
    zeigen();
  }

  $("#ein-weiter").onclick = function () {
    if (schritt < ANZAHL - 1) { sichern(); schritt++; zeigen(); } else fertig();
  };
  $("#ein-zurueck").onclick = function () { sichern(); schritt = Math.max(0, schritt - 1); zeigen(); };
  $("#ein-spaeter").onclick = fertig;
  $("#einrichtung").addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" && ev.target.tagName === "INPUT" && ev.target.id !== "ein-schluessel") { ev.preventDefault(); $("#ein-weiter").click(); }
    if (ev.key === "Escape") fertig();
  });

  $("#ein-testen").onclick = function () {
    var k = $("#ein-schluessel").value.trim();
    var aus = $("#ein-test-ergebnis");
    if (!k) { aus.textContent = "Füge zuerst den Schlüssel ein."; return; }
    var knopf = this;
    knopf.disabled = true;
    aus.className = "leise klein-text";
    aus.textContent = "Teste …";
    k = k.replace(/\s/g, "");
    if (/^sk-ant-/.test(k)) { // Claude
      sdkLaden().then(function (sdk) {
        return new sdk.default({ apiKey: k, dangerouslyAllowBrowser: true, maxRetries: 1 }).models.retrieve(Z.einstellungen.modell || "claude-opus-5-5");
      }).then(function () {
        Z.einstellungen.schluessel = k; Z.einstellungen.anbieter = "claude"; Z.einstellungen.anbieterManuell = true;
        if (!Z.einstellungen.modell) Z.einstellungen.modell = "claude-opus-5-5";
        speichern();
        aus.className = "klein-text plus";
        aus.textContent = "✓ Mit Claude verbunden. Tippe auf „Fertig“.";
      }).catch(function (f) {
        aus.className = "klein-text minus";
        aus.textContent = f && f.status === 401 ? "Dieser Schlüssel funktioniert nicht. Kopiere ihn nochmal ganz." : "Prüfung fehlgeschlagen: " + (f && f.message ? f.message : "keine Verbindung");
      }).then(function () { knopf.disabled = false; });
      return;
    }
    geminiSchluesselTesten(k).then(function (liste) {
      if (!liste.length) throw new Error("leer");
      Z.einstellungen.geminiSchluessel = k;
      Z.einstellungen.geminiModell = geminiStandardModell(liste);
      if (Z.einstellungen.anbieter !== "lokal") Z.einstellungen.anbieter = "gemini";
      speichern();
      aus.className = "klein-text plus";
      aus.textContent = "✓ Verbunden. " + liste.length + " kostenlose Modelle gefunden. Tippe auf „Fertig“.";
    }).catch(function (f) {
      aus.className = "klein-text minus";
      aus.textContent = f.message === "schluessel" ? "Dieser Schlüssel funktioniert nicht. Kopiere ihn nochmal ganz." :
        f.message === "leer" ? "Der Schlüssel funktioniert, aber es wurde kein passendes Gratis-Modell gefunden." :
        "Keine Verbindung zu Google. Prüfe dein Internet.";
    }).then(function () { knopf.disabled = false; });
  };

  return { start: start };
})();
