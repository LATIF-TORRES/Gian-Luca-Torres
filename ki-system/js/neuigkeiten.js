/* Version, „Das ist neu“ für bestehende Kunden und Hinweis auf Updates. */

var APP_VERSION = "4.5"; // muss mit version.json übereinstimmen
// Hier steht die neueste Version. Die Windows-Version prüft das einmal am Tag.
var VERSION_URL = "https://raw.githubusercontent.com/LATIF-TORRES/Gian-Luca-Torres/claude/epic-hypatia-7apja5/ki-system/version.json";
var DOWNLOAD_URL = "https://github.com/LATIF-TORRES/Gian-Luca-Torres/raw/claude/epic-hypatia-7apja5/ki-system/download/A-und-T-Windows.zip";

var NEUIGKEITEN = [
  { besitzer: true, titel: "Selbstständiger Handel: Order wird wirklich aufgegeben", text: "Schrieb die KI „Kaufen“, ohne die Order aufzugeben, passierte nichts. Jetzt hakt A&T in diesem Fall einmal nach, damit die Order wirklich ausgeführt wird, oder die KI schreibt ausdrücklich „Keine Order“. Im Protokoll steht, wenn sie trotzdem nicht gehandelt hat." },
  { besitzer: true, titel: "Finnhub-Schlüssel testen", text: "Im Depot unter Einstellungen gibt es „Schlüssel testen“. A&T sagt dir jetzt genau, was nicht stimmt: falscher Schlüssel, keine Verbindung oder Limit. Beim Einfügen werden Leerzeichen automatisch entfernt. Liefert Finnhub keine Kurse, überspringt der selbstständige Handel die Runde mit dem Grund im Protokoll, statt die KI zu fragen." },
  { besitzer: true, titel: "Gemini-Fehler behoben", text: "Mit Gemini kam im Besitzer-Modus die Meldung „enum[0]: cannot be empty“. Das ist behoben." },
  { titel: "Freischalten einfacher", text: "Der Besitzer-Code funktioniert jetzt auch mit Kleinbuchstaben oder Leerzeichen. Gibst du versehentlich einen anderen Schlüssel ein, sagt A&T dir, wo er hingehört." },
  { besitzer: true, titel: "Halal-Liste: jetzt 3624 Aktien aus 51 Ländern", text: "Neu dabei: 381 Aktien aus Saudi-Arabien (nur die, die mindestens 2 von 3 Scharia-Gelehrten als konform einstufen: Al Rajhi Capital, Dr. Mohammed Al-Osaimi, Albilad Capital), die 100 Aktien des türkischen Beteiligungsindex BIST Katılım 100 und 284 Aktien aus Bangladesch (Scharia-Liste von Islami Bank Securities). Die Liste wird beim nächsten Start automatisch ergänzt." },
  { besitzer: true, titel: "Weltweite Halal-Liste: 2885 Aktien aus 50 Ländern", text: "Die Halal-Liste kommt jetzt aus 13 geprüften Quellen: Halal-Fonds von SP Funds und iShares (USA, Welt, Schwellenländer) und die offiziellen Scharia-Listen von Malaysia, Indonesien, Pakistan, Ägypten, Nigeria und Südafrika. Dabei sind grosse und ganz kleine Firmen aus Asien (China, Japan, Indien, Taiwan, Korea, Malaysia, Indonesien …), Afrika, dem Nahen Osten, Europa und Amerika. Im Depot siehst du sie nach Region und Land und kannst suchen. Handelbar im Übungs-Depot sind vorerst die Aktien an der US-Börse (auch TSMC, Alibaba, Infosys, Gold Fields usw.), die anderen folgen mit der IBKR-Verbindung. Russische Aktien sind wegen Sanktionen gesperrt." },
  { besitzer: true, titel: "Eigener Fonds: A&T Welt-Halal-Fonds", text: "Im Depot verteilst du einen Betrag mit einem Klick auf 10 bis 30 Halal-Aktien aus Asien, Amerika, Europa, Afrika und Ozeanien." },
  { besitzer: true, titel: "Bruchteile und Scanner", text: "Du kannst Bruchteile kaufen (z. B. 0.05 Aktien), damit reichen auch 100 $ für teure Aktien. Der Scanner sucht laufend die Aktien mit der meisten Bewegung; die KI handelt selbstständig nur bei hohen Chancen." },
  { besitzer: true, titel: "Halal-Liste mit einem Klick", text: "Im Depot unter Halal-Liste: „Startliste übernehmen“ nimmt die 24 grössten Aktien des schariakonformen Fonds HLAL auf (Stand 3. November 2026). A&T prüft zusätzlich die Branche. Mehrere Kürzel kannst du auch mit Komma auf einmal eingeben. Ist deine Liste leer, übernimmt A&T die Startliste beim Start von selbst." },
  { besitzer: true, titel: "Nachziehender Stop, für jede Aktie angepasst", text: "Jede Position bekommt einen Stop nach ihrer üblichen Tagesschwankung (höchstens dein Höchstverlust, Standard 3 %). Der Stop zieht mit dem Höchstkurs nach, rückt bei genug Gewinn auf den Kaufkurs, und beim Gewinnziel (mindestens 8 %) wird die Hälfte gesichert. Der Rest läuft weiter." },
  { besitzer: true, titel: "Selbstständiger Handel", text: "Im Depot kannst du einschalten, dass A&T alle 15, 30 oder 60 Minuten selbst eine Handelsrunde macht, solange A&T offen ist und die US-Börse offen hat. Gehandelt wird nur bei hoher Zuversicht. Stop-Loss und Gewinnziel setzt das Programm selbst um. Alles steht im Protokoll." },
  { titel: "Besser auf kleinen Handys", text: "Die Bereiche oben passen jetzt auch auf schmale Bildschirme, ohne dass etwas abgeschnitten wird." },
  { besitzer: true, titel: "Übungs-Depot: die KI handelt für dich", text: "Neuer Bereich „Depot“: echte Kurse, Spielgeld. Die Rolle „Halal-Trader“ analysiert Aktien und handelt selbst, bis zu deinem Tageslimit sofort, darüber nur mit deiner Freigabe. Halal ist fest eingebaut: nur Aktien von deiner Halal-Liste, kein Hebel, keine Leerverkäufe. Für Kurse brauchst du einen kostenlosen Schlüssel von finnhub.io." },
  { besitzer: true, titel: "Überweisungen vorbereiten (Revolut)", text: "Sag dem Mentor, wem du wie viel überweisen willst. Er prüft die IBAN und legt alles unter „Geld → Überweisungen“ zum Kopieren bereit. Senden musst du in der Revolut-App, weil Revolut für Privatkonten keine Schnittstelle anbietet." },
  { titel: "Klüger und direkter", text: "A&T denkt jetzt wie ein erfahrener Unternehmer: prüft Nachfrage, Marge und Konkurrenz, sagt offen, wenn eine Idee schwach ist, nennt konkrete Anbieter und Preise und antwortet ohne unnötige Warnhinweise. Neue Gespräche nutzen das sofort." },
  { titel: "Gründlich-Modus bei der lokalen KI", text: "Stellst du im Mentor unten „Gründlich“ ein, denkt die lokale KI vor der Antwort nach. Das dauert länger, die Antworten werden aber besser." },
  { titel: "Grösseres Modell für starke PCs", text: "Hat dein PC 32 GB Arbeitsspeicher oder mehr, lädt „A&T - Lokale KI einrichten“ (Startmenü) jetzt das grössere Modell qwen3:14b. A&T nimmt automatisch das beste vorhandene Modell." },
  { titel: "Updates kommen von selbst", text: "A&T aktualisiert sich beim Start automatisch, wenn du es über die Verknüpfung auf dem Desktop oder im Startmenü öffnest." },
  { titel: "KI ohne Limit auf deinem PC", text: "A&T kann auf deinem eigenen PC rechnen: kostenlos, ohne Tageslimit, ohne Konto. Unter Windows: „A&T - Lokale KI einrichten“ im Startmenü oder „Lokale KI installieren.cmd“ im A&T-Ordner." },
  { titel: "Sadaqa-Vorschlag statt „Reinigung“", text: "Im Geldbuch gibt es keine „Reinigung“ mehr, sondern einen Sadaqa-Vorschlag (wählbar unter „Ich“). Es wird nie etwas abgezogen." },
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
    $("#neu-liste").innerHTML = NEUIGKEITEN.filter(function (n) { return !n.besitzer || istBesitzer(); }).map(function (n) {
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
