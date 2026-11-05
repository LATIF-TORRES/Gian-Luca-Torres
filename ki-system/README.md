# A&T · Amanah & Tijara

> **A&T** steht für **Amanah** (arabisch: Vertrauen) und **Tijara** (arabisch: Handel): Geld verdienen durch ehrlichen Handel, mit Geld als anvertrautem Gut. Im Freihändig-Modus hört A&T auf „Hey A&T“, „Amanah“ oder „Tijara“. Den Namen kannst du unter **Ich → Name deines Assistenten** ändern.

Eine Web-App für Browser und Handy. Ein KI-Mentor (Claude) hilft dir, gezielt und ehrlich mehr Geld zu verdienen, **ausschliesslich halal**. Er orientiert sich an den Prinzipien der reichsten Unternehmer und Investoren der Welt und an Händlern aus der islamischen Geschichte.

## Halal-Modus (immer an)

| Regel | Was das in der App heisst |
| --- | --- |
| Kein Riba (Zins) | Kein Zinseszins-Rechner, keine Zins-Sparkonten, Anleihen, Kredite oder Kreditkarten mit Zinsen. Stattdessen ein Sparziel-Rechner nur mit eigenem Geld |
| Kein Maysir (Glücksspiel) | Keine Wetten, Lotto, Hebel-Trading, CFDs oder Optionen |
| Kein übermässiges Gharar | Keine Verträge mit grosser Unklarheit, nichts verkaufen, was man nicht besitzt |
| Keine verbotenen Branchen | Kein Alkohol, Schweinefleisch, Glücksspiel, Zinsbanken, Pornografie, Drogen, Tabak, Betrug |
| Erlaubte Wege | Eigene Arbeit, Handel (auch Murabaha), Partnerschaften mit geteiltem Gewinn und Verlust (Musharaka, Mudaraba), Vermietung (Ijara), Sukuk, geprüfte schariakonforme Aktien und Fonds, physisches Gold |
| Zakat und Sadaqa | Zakat-Rechner (2,5 % über dem Nisab von 85 g Gold), der Mentor erinnert an Zakat und Sadaqa |

- Die Regeln stehen fest im Auftrag an die KI und liegen zusätzlich jeder Frage bei, auch in älteren Gesprächen.
- Fragst du nach etwas Verbotenem, erklärt der Mentor freundlich, warum es nicht geht, und schlägt eine erlaubte Alternative vor.
- Neue Rolle **Halal-Prüfer**: Er prüft eine Idee, einen Job oder ein Produkt und antwortet mit „Halal“, „Zweifelhaft“ oder „Haram“, jeweils mit Begründung und Alternative.
- Bei Vorbildern mit verbotenen Geschäftsfeldern (z. B. Alkohol bei LVMH, Banken bei Buffett) steht ein Halal-Hinweis: Du übernimmst nur das Prinzip.
- Wo die Gelehrten verschiedener Meinung sind (z. B. Krypto), sagt der Mentor das offen. Er gibt keine Fatwa und verweist auf einen Gelehrten.

## KI ohne Limit: lokal auf deinem PC

Jede KI im Internet (Google, OpenAI, Anthropic) begrenzt die Gratis-Nutzung. Bei manchen Google-Konten gibt es für einzelne Modelle sogar gar kein Gratis-Kontingent (Meldung „limit: 0“). **Wirklich unbegrenzt und kostenlos geht es nur, wenn die KI auf deinem eigenen PC läuft.** A&T nutzt dafür das kostenlose Programm [Ollama](https://ollama.com) mit dem freien Modell Qwen3.

- **Windows:** Doppelklick auf **Lokale KI installieren.cmd** im A&T-Ordner. Das Skript installiert Ollama, erlaubt A&T den Zugriff und lädt je nach Arbeitsspeicher `qwen3:8b` (ab 16 GB) oder `qwen3:4b` (einmalig etwa 2,5 bis 5 GB).
- A&T findet die lokale KI beim Start automatisch und nutzt sie, solange du unter **Ich** nichts anderes gewählt hast.
- Ohne Limit, ohne Konto, ohne Schlüssel, ohne Kosten. Deine Fragen verlassen den PC nicht.
- Mit 16 GB Arbeitsspeicher läuft es gut, mit 8 GB langsamer. Die lokale KI ist etwas weniger klug als Claude.
- Auf dem Handy geht das nicht. Dort bleibt Gemini (mit Limit).
- Hinweis: Damit A&T aus dem Browser zugreifen kann, setzt das Skript `OLLAMA_ORIGINS=*`. So dürfen Webseiten in deinem Browser die lokale KI ansprechen.

**Gemini verbessert:** A&T zeigt jetzt die echte Meldung von Google. Modelle ohne Gratis-Kontingent werden dauerhaft übersprungen. Beim Minutenlimit wartet A&T die von Google genannte Zeit, statt alle Modelle hintereinander zu probieren. Die Web-Suche wird weggelassen, wenn sie ein eigenes Limit hat.

## Neu in Version 2

- **Einrichtungs-Assistent** beim ersten Start: Name, Ziel, Fähigkeiten, Zeit, Startkapital, Wohnort und der kostenlose Schlüssel mit „Testen“-Knopf. Später erneut unter **Ich → Einrichtung wiederholen**.
- **Mehr Gratis-Nutzung:** Hat ein Gemini-Modell sein Limit erreicht, wechselt A&T selbst zum nächsten Gratis-Modell und merkt sich das für den Tag.
- **Halal-Geldbuch:** Jede Einnahme hat einen Halal-Status (halal, zweifelhaft, nicht halal). Fürs Monatsziel zählt nur Erlaubtes. Dazu ein **Sadaqa-Vorschlag**: A&T zeigt, wie viel du von deinen Einnahmen als Sadaqa zur Seite legen könntest (1 %, 2,5 %, 5 % oder 10 %, wählbar unter **Ich**, oder aus). Das ist nur ein Vorschlag. Es wird nie etwas abgezogen. Im Geldbuch steht nur, was du selbst einträgst.
- **Bessere Ideen-Bewertung:** Jede Geschäftsidee bekommt eine Tabelle mit Halal-Ampel, Startkosten, Zeit bis zum ersten Geld, Einkommen nach 3 und 12 Monaten, Risiko und „Passt zu dir“.
- **Chat-Komfort:** Antworten kopieren (z. B. fertige Kundennachrichten), Gespräche löschen. Fehler behoben, wenn nach einem Abbruch erneut gefragt wird.
- **Zuverlässiger:** Die Anzeige-Bibliotheken liegen direkt in der App. Auf GitHub Pages ist A&T als App installierbar (Handy und PC) und startet schneller.

## Was die App kann

| Bereich | Was du dort machst |
| --- | --- |
| **Heute** | Monatsziel mit Fortschritt, „die eine Sache heute“, Aufgabenliste, Schnellstart-Fragen |
| **Mentor** | Chat mit Claude in 7 Rollen: Stratege, Verkäufer, Rechner, Halal-Vermögen, Halal-Prüfer, Spiegel der Reichsten, Coach. Mit Web-Suche (mit Quellen), Spracheingabe, Vorlesen und Kostenanzeige |
| **Vorbilder** | 3 Vorbilder aus der islamischen Geschichte (Khadija, Abdur-Rahman ibn Auf, Uthman ibn Affan) und 12 heutige (Buffett, Bezos, Musk, Gates, Arnault, Huang, Ellison, Zuckerberg, Page/Brin, Ortega, Slim, Bloomberg): je ein Prinzip, eine Übung und der Knopf „Auf mich anwenden“ |
| **Geld** | Einnahmen und Ausgaben, Sparquote, woher dein Geld kommt, Sparziel-Rechner ohne Zinsen, Zakat-Rechner, Stundensatz-Rechner |
| **Ich** | Name, Ziel, API-Schlüssel, Modell, Sprache, Freihändig-Modus, Gedächtnis ansehen und löschen, Sicherung |

Der Mentor **handelt selbst**:
- Er merkt sich Wichtiges über dich (Werkzeug `merken`).
- Er legt Aufgaben an (Werkzeug `aufgabe_anlegen`).
- Er trägt Einnahmen und Ausgaben ein, wenn du sie nennst (Werkzeug `buchung_eintragen`).

Unter „Ich“ siehst und löschst du alles, was er gespeichert hat.

## Download für Windows

**[A-und-T-Windows.zip herunterladen](https://github.com/LATIF-TORRES/Gian-Luca-Torres/raw/claude/epic-hypatia-7apja5/ki-system/download/A-und-T-Windows.zip)** (etwa 70 KB, Windows 10 und 11)

1. ZIP herunterladen, Rechtsklick → „Alle extrahieren“.
2. Doppelklick auf **Installieren.cmd**. A&T kommt auf den Desktop und ins Startmenü und öffnet sich in einem eigenen Fenster (Microsoft Edge im App-Modus). Adminrechte braucht es nicht.
3. In A&T unter **Ich** den kostenlosen Gemini-Schlüssel eintragen.

Ohne Installieren: Doppelklick auf **A-und-T starten.cmd**. Die Skripte sind nicht von Microsoft signiert, darum kann Windows einmal nachfragen. Dann auf „Ausführen“ bzw. „Weitere Informationen → Trotzdem ausführen“ klicken.

Das Paket wird mit `python3 windows/paket-bauen.py` gebaut. Nach jeder Änderung an der App neu bauen und die ZIP einchecken.

## Starten (kostenlos)

1. **Online stellen (gratis, einmalig):** Auf GitHub im Repository auf **Settings → Pages**. Bei „Source“ wählst du „Deploy from a branch“, dann den Branch `claude/epic-hypatia-7apja5` und den Ordner `/ (root)`, und tippst auf **Save**. Nach 1 bis 2 Minuten läuft die App unter **https://latif-torres.github.io/Gian-Luca-Torres/ki-system/**. Du kannst sie auch ohne Internet-Adresse nutzen: einfach `ki-system/index.html` im Browser öffnen.
2. **Kostenlosen KI-Schlüssel holen:** Geh auf [aistudio.google.com](https://aistudio.google.com), melde dich mit deinem Google-Konto an und tipp auf „Get API key“. Du brauchst keine Kreditkarte.
3. In der App unter **Ich** den Schlüssel bei „Gemini-Schlüssel“ einfügen. Die App sucht das passende Gratis-Modell selbst.
4. Auf dem Handy: die Adresse öffnen, dann „Zum Home-Bildschirm“. Jetzt sieht A&T aus wie eine App.

Alle Daten bleiben in deinem Browser. Schlüssel gehen nur direkt an Google oder Anthropic, nie in eine Sicherungsdatei.

### Kosten

| Anbieter | Kosten | Gut zu wissen |
| --- | --- | --- |
| **Google Gemini (Standard)** | **kostenlos** | Tageslimit an Anfragen. Ist es erreicht, geht es am nächsten Tag weiter. Bei der Gratis-Stufe darf Google die Eingaben zur Verbesserung seiner Dienste nutzen, darum keine geheimen Daten eingeben. Die Modelle „Flash-Lite“ haben meist mehr Gratis-Anfragen pro Tag, die „Flash“-Modelle sind klüger. |
| Claude (wahlweise) | pro Antwort, bei Opus 5.5 etwa 2 bis 10 Rappen | Am klügsten und hält sich am zuverlässigsten an die Regeln. Schlüssel auf [platform.claude.com](https://platform.claude.com), Guthaben vorher aufladen. |
| GitHub Pages | kostenlos | Für öffentliche Repositories |

Den Anbieter wechselst du unter **Ich → KI-Anbieter**. Ein Gespräch bleibt beim Anbieter, mit dem es begonnen hat. Nach einem Wechsel beginnt ein neues Gespräch.

Ohne KI und immer gratis: Geldbuch, Monatsziel, Aufgaben, Vorbilder, Sparziel-, Zakat- und Stundensatz-Rechner.

## Analyse: Packstart (packstart.de)

Packstart ist eine Desktop-App für Mac, Windows und Linux. Der Assistent heisst **James**. Stand: Beta 3.0, Oktober 2026.

**Stärken**
- James selbst ist gratis und läuft mit dem eigenen Claude-, ChatGPT- oder Gemini-Konto.
- „Pakete“ mit fertigen Skills, Agenten, Abläufen und Widgets (z. B. ADHS-Kalender, Buchhaltung ordnen, Finanzen, Creator).
- Gedächtnis über Wochen, das man einsehen und löschen kann.
- 9 Sprachen, Stimme, Team-Funktion, Aufgaben „morgen früh“ erledigen, Word/Excel/PowerPoint.
- Ehrliche Hinweise: keine Steuer-, Rechts- oder Anlageberatung.

**Schwächen**
- Nur Desktop: Installation mit fast 3 GB, mindestens 8 GB Arbeitsspeicher. Aufs Handy nur über Telegram oder WhatsApp.
- Nicht von Apple notarisiert, Windows warnt vor „unbekanntem Herausgeber“.
- Die nützlichen Teile kosten extra: 9,99 € pro Paket, 49,99 € für 13 Pakete, Finanzen 24,99 €. Dazu das eigene KI-Abo.
- Breit statt fokussiert: viele Themen, aber kein durchgehendes Ziel.
- Ab 18 Jahren, noch Beta.

## Analyse: „Jarvis“-KI-Systeme

| System | Was es ist | Stärke | Schwäche |
| --- | --- | --- | --- |
| J.A.R.V.I.S. (Iron Man) | Vorbild aller Sprachassistenten | Spricht, hört, handelt, kennt seinen Nutzer | Fiktion |
| Microsoft JARVIS / HuggingGPT (2023) | Forschung: ein Sprachmodell verteilt Aufgaben an viele Fach-Modelle | Gute Idee „ein Chef, viele Spezialisten“ | Kein Produkt für Endnutzer |
| Google „Project Jarvis“ (später Project Mariner) | Agent, der im Chrome-Browser klickt und tippt | Erledigt Aufgaben auf Webseiten | Nur Google-Welt, langsam, eingeschränkt verfügbar |
| Jarvis.ai (heute Jasper) | KI-Texter für Marketing | Gute Werbetexte | Teures Abo, nur Texte |
| Zuckerbergs Jarvis (2016) | Privates Smart-Home-Projekt | Steuerung per Stimme | Nie veröffentlicht |
| Open-Source- und App-Store-„Jarvis“ | Viele Hobby-Sprachassistenten für PC und Handy | Gratis, Stimme, oft mit Weckwort | Meist ohne Gedächtnis, ohne Ziel, oft unsicher oder veraltet |

## Was A&T besser macht

| Problem bei Packstart oder Jarvis | Lösung in A&T |
| --- | --- |
| Installation, 3 GB, nur Desktop | Läuft sofort im Browser, auch auf dem Handy |
| Pakete kosten extra | Alles gratis: App, Hosting über GitHub Pages und KI über die Gratis-Stufe von Gemini |
| Kein klares Ziel | Ein Ziel: mehr Geld verdienen, mit Monatsziel, Geldbuch und „die eine Sache heute“ |
| Jarvis-Apps vergessen alles | Gedächtnis, das du siehst und löschst |
| Assistent redet nur | Der Mentor legt Aufgaben an, bucht Einnahmen und merkt sich Fakten |
| Antworten ohne Belege | Web-Suche mit Quellenliste |
| Unklare Kosten | Kostenanzeige pro Gespräch |
| „Schnell reich“-Versprechen anderer Tools | Ehrliche Zahlen, Risiken und Zeitrahmen, Warnung vor Betrugsmaschen |
| Nur ein Name | Name frei wählbar, Weckwort „Hey <Name>“ |

## Technik

- Reines HTML, CSS und JavaScript, ohne Build-Schritt.
- Kostenlos: Google Gemini über die REST-Schnittstelle (Streaming, eigene Werkzeuge, Google-Suche mit Quellen). Die Modellliste wird bei Google abgefragt, weil sich die Modellnamen oft ändern.
- Wahlweise Claude über das offizielle Anthropic-SDK (`@anthropic-ai/sdk`, geladen von jsDelivr), direkt aus dem Browser mit deinem Schlüssel.
- Standardmodell Claude Opus 5.5 mit adaptivem Denken. Lehnt das Modell eine Anfrage ab, springt automatisch ein anderes Modell ein (`fallbacks: "default"`).
- Der Gesprächsverlauf wird nur hinten ergänzt, nie verändert. So bleiben Zwischenspeicher und das Nachdenken früherer Antworten gültig.
- Stimme über die Web Speech API des Browsers.

| Datei | Inhalt |
| --- | --- |
| `index.html` | Seitenaufbau |
| `css/style.css` | Aussehen (hell und dunkel) |
| `js/daten.js` | Vorbilder, Rollen, Schnellstart, Grundauftrag an die KI |
| `js/speicher.js` | Speichern im Browser, Gedächtnis, Aufgaben, Geldbuch |
| `js/ki.js` | Verbindung zu Claude, Werkzeuge, Kosten |
| `js/gemini.js` | Kostenlose Verbindung zu Google Gemini |
| `js/lokal.js` | Lokale KI über Ollama (ohne Limit) |
| `windows/` | Start- und Installationsskript, Symbol, Bauskript für das Windows-Paket |
| `download/A-und-T-Windows.zip` | Fertiges Windows-Paket |
| `js/stimme.js` | Sprechen, Zuhören, Weckwort |
| `js/app.js` | Oberfläche |

## Der Name

Gewählt: **A&T = Amanah & Tijara**, Vertrauen und Handel. Der frühere Arbeitstitel war TORRES.

Keine Anlage-, Steuer- oder Rechtsberatung. Entscheidungen triffst du selbst.
