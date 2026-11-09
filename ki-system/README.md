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

## Übungs-Depot und Überweisungen (nur im Besitzer-Modus)

**Selbstständiger Handel (ab 3.5):** Im Depot einschaltbar. Solange A&T offen ist und die US-Börse offen hat, macht A&T alle 15, 30 oder 60 Minuten eine Handelsrunde mit der gewählten KI (am besten die lokale, wegen des fehlenden Limits). Fest im Programm: höchstens 1 Order pro Runde, Höchstzahl Trades pro Tag, Tageslimit, Halal-Liste für Käufe. Den Schutz jeder Position setzt das Programm selbst um (ab 3.6, alle 2 Minuten mit frischen Kursen, auch für Käufe von Hand): Der Start-Stop beträgt 1,5 × die übliche Tagesschwankung der Aktie (Schnitt der letzten 10 Tage), höchstens der eingestellte Höchstverlust (Standard 3 %). Der nachziehende Stop folgt dem Höchstkurs mit 1 × Tagesschwankung Abstand. Ab einem Gewinn so gross wie der Start-Abstand liegt der Stop mindestens beim Kaufkurs (+0,2 % für Gebühren). Beim Gewinnziel (mindestens 8 % oder 2,5 × Start-Abstand) wird die Hälfte verkauft, der Rest läuft mit halbem Abstand weiter. Jede Runde steht im Protokoll. Verkaufen (aussteigen) ist immer erlaubt, auch wenn eine Aktie von der Halal-Liste entfernt wurde.

**Weltweite Halal-Liste (ab 4.0, erweitert in 4.1):** 3624 Aktien aus 51 Ländern in `js/halal-welt.js` (erzeugt, nicht von Hand ändern). Quellen: die Halal-Fonds SPUS, SPWO, SPTE, SPRE (SP Funds), ISUS, ISWD, ISEM (iShares) sowie die offiziellen Scharia-Listen von Malaysia (Securities Commission, Mai 2026), Indonesien (OJK, Juni 2026), Pakistan (KMI All Share, Dezember 2025), Ägypten (EGX 33 Shariah), Nigeria (NGX Lotus Islamic) und Südafrika (JSE Shari'ah Top 40); ab 4.1 auch Saudi-Arabien (Argaam: Urteile von Al Rajhi Capital, Dr. Mohammed Al-Osaimi, Albilad Capital, aufgenommen bei mindestens 2 von 3), Türkei (BIST Katılım 100) und Bangladesch (Islami Bank Securities, ohne Fonds und Anleihen). Gleiche Firmen an zwei Börsen werden einmal geführt (US-Börse bevorzugt). Für Besitzer wird die Liste automatisch übernommen; selbst entfernte Aktien kommen nicht zurück. Kürzel mit Börsen-Endung wie bei Yahoo (7203.T, 0700.HK, 600519.SS, 1155.KL, TLKM.JK, ENGRO.KA). Kurse und Handel im Übungs-Depot gibt es vorerst nur für Aktien an der US-Börse (407, auch ADRs wie TSM, BABA, GFI); die anderen zeigen, ob IBKR die Börse anbietet (Einschätzung, vor Echthandel prüfen). Russische Aktien sind gesperrt (Sanktionen). Der Scanner fragt nur Aktien mit Kurs ab. Die KI sucht mit `halal_liste_suchen`.

**Eigener Fonds (ab 4.0):** „A&T Welt-Halal-Fonds“ im Depot verteilt einen Betrag auf 10 bis 30 Aktien: Asien 35 %, Amerika 30 %, Europa 20 %, Afrika 10 %, Ozeanien 5 % (grösste Fondsgewichte zuerst, nur Aktien mit Kurs). Der Nahe Osten kommt mit der IBKR-Verbindung dazu.

Kunden sehen davon nichts: kein Depot-Tab, keine Rolle „Halal-Trader“, keine Überweisungen. Auch die KI bekommt diese Werkzeuge und Anweisungen nicht. Freischalten: **Ich → Daten**, 5-mal auf die Versionsnummer tippen, Besitzer-Code eingeben. Im Programm steht nur der SHA-256-Hash des Codes (`BESITZER_HASH` in `js/depot.js`), nicht der Code selbst. Ausschalten geht unter **Ich**, die Depot-Daten bleiben dabei gespeichert.


- **Depot-Tab:** Spielgeld (Start 10 000 USD, einstellbar) mit echten US-Kursen von [Finnhub](https://finnhub.io) (kostenloser Schlüssel, nur für privaten Gebrauch).
- **Die KI handelt selbst** (Rolle „Halal-Trader“, Werkzeug `order_aufgeben`): bis zum Tageslimit sofort, darüber landet die Order unter „Wartet auf deine Freigabe“.
- **Halal fest im Programm** (`js/depot.js`), nicht nur im Auftrag an die KI: nur Aktien von der Halal-Liste, die du selbst bestätigt hast. Banken, Versicherungen, Alkohol, Tabak und Glücksspiel werden über die Branche automatisch blockiert. Gekauft wird nur mit vorhandenem Geld (kein Hebel), Leerverkäufe gehen nicht. Bruchteile bis 0,0001 Aktien sind erlaubt (mindestens 1 $ pro Order).
- **Überweisungen:** Revolut hat für Privatkonten keine Schnittstelle. Die KI bereitet Überweisungen vor (`ueberweisung_vorbereiten`) und prüft die IBAN-Prüfziffer. Unter **Geld → Überweisungen** kopierst du die Felder und sendest in der Revolut-App. „In Revolut gesendet“ trägt die Ausgabe ins Geldbuch ein.
- **Echtes Geld:** kommt erst mit einem Broker mit Schnittstelle dazu (z. B. Interactive Brokers oder Alpaca), automatische Überweisungen nur mit Revolut Business (Business-API). An Kunden weitergegeben wäre automatischer Handel bewilligungspflichtig (FINMA/MiFID).

## Für bestehende Kunden und Updates

- **Version:** steht in `js/neuigkeiten.js` (`APP_VERSION`) und in `version.json`. Bei jedem neuen Paket beide erhöhen und die Liste `NEUIGKEITEN` anpassen.
- **„Das ist neu“:** Kunden, die A&T schon eingerichtet haben, sehen nach einem Update einmal ein Fenster mit den Änderungen. Neue Kunden sehen stattdessen den Einrichtungs-Assistenten. Später jederzeit unter **Ich → Was ist neu?**
- **Automatische Updates (ab 3.1):** Die Verknüpfung auf Desktop und Startmenü startet A&T über `starten.ps1`. Das Skript prüft bei jedem Start `version.json`. Gibt es eine höhere Version, lädt es die ZIP herunter, ersetzt die App-Dateien in `%LOCALAPPDATA%\A-und-T\app` und startet dann. Ohne Internet startet einfach die vorhandene Version. Protokoll: `%LOCALAPPDATA%\A-und-T\update.log`. Wichtig: Jeder Push mit höherer Version landet automatisch bei allen Kunden.
- **Ein neues Update veröffentlichen:** Version in `js/neuigkeiten.js` und `version.json` erhöhen (Format `3.2`), `NEUIGKEITEN` ergänzen, `python3 windows/paket-bauen.py` ausführen (prüft, dass beide Versionen gleich sind), committen und pushen.
- **Kunden mit Version 3.0 oder älter** haben das automatische Update noch nicht. Sie laden die ZIP einmal neu und starten **Installieren.cmd**. Danach geht es von selbst.
- **Update-Hinweis:** Die Windows-Version schaut einmal am Tag in `version.json` nach. Ist dort eine höhere Version eingetragen, erscheint auf der Startseite ein Download-Knopf. Die Online-Version (GitHub Pages) aktualisiert sich von selbst.
- **Daten bleiben:** Gespräche, Gedächtnis, Aufgaben und Geldbuch bleiben bei jedem Update erhalten. Alte Einträge werden bei Bedarf umgestellt (z. B. „Reinigung“ → Ausgabe). Niemand wird ungefragt auf einen anderen KI-Anbieter umgestellt. Nur wenn eine lokale KI gefunden wird und man vorher nichts selbst gewählt hat, nutzt A&T sie.

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

## AKHI: Sprach-Assistent im Jarvis-Stil (ab 5.0)

Leuchtender Knopf „AKHI“ unten rechts (im Mentor oben rechts) oder Weckwort „Hey Akhi“ (wenn „Hey Akhi hören“ an ist). Eigenes Vollbild-Dashboard (`js/akhi.js`, Stile am Ende von `css/style.css`):

- **Stimme**: Männerstimme (automatisch gewählt, z. B. „Microsoft Conrad“ in Edge, sonst tiefer gestellt; wählbar), Gesprächsmodus (hört nach der Antwort wieder zu, „danke“ beendet). Gesprochen wird nur der kurze Anfang der Antwort, Details stehen im Text.
- **Wissen** (`js/wissen.js`): Businessplan, Marketing, Digistore24, Reselling, Social Media, KI-Systeme und Konnektoren, Gründen in der Schweiz, Halal-Business, Verkauf, Aufgabenbereiche, je mit Checkliste. Gebühren und Grenzen sind als Richtwerte markiert.
- **Werkzeuge der KI** (für alle, nicht nur Besitzer): `wissen_nachschlagen`, `dokument_erstellen` (Markdown, als PDF speicherbar), `checkliste_erstellen`; `aufgabe_anlegen` hat jetzt einen Bereich.
- **Businessplan-Formular** mit Finanzrechnung (Deckungsbeitrag, Gewinnschwelle, Verkäufe fürs Umsatzziel, Rückzahlung der Startkosten).
- **PDF**: Drucken nur des Dokuments (`#druck`, Druck-CSS) → im Druckdialog „Als PDF speichern“, auch auf dem Handy.

### Ab 5.1
- **Speichern als** PDF, Word (.docx, selbst erzeugt in `js/export.js`, ohne Bibliothek), Word 97 (.doc), Text, Markdown: bei Dokumenten, Checklisten, Modulen und Businessplan-Formular.
- **Hochladen** (`js/import.js`): PDF (pdf.js 4.10.38 von jsDelivr, braucht Internet), Word (.docx), OpenDocument (.odt), Text, Markdown, CSV; bis 60'000 Zeichen; „Akhi analysieren lassen“. Alte .doc-Dateien: als .docx oder PDF speichern.
- **Rat der KIs** (`js/rat.js`): fragt alle eingerichteten KIs parallel ohne Werkzeuge (Claude über das SDK mit `effort: medium` und `fallbacks: "default"`, Gemini, ChatGPT über die OpenAI-Schnittstelle mit eigenem Schlüssel, lokale KI), Akhi prüft die Antworten und gibt eine zusammengeführte beste Antwort. Mindestens 2 KIs nötig.
- **Bibliothek**: 22 Module, neu u. a. Automatisierter Cashflow, Digitale Produkte, E-Mail-Funnel, Online-Shop und Print-on-Demand, Dienstleistung und Agentur, YouTube, Amazon KDP, Halal investieren, Immobilien halal, Preise und Kennzahlen, Online-Recht Schweiz, KI-Praxis.
- **Auftrag**: Mission „regelmässiger, automatisierter Cashflow“, gezielt zuerst die Frage beantworten, typische KI-Fehler vermeiden, Nasheed statt Musik.
- **Fehler behoben**: Akhis Dokumente, Checklisten, Formular und Verlauf gingen beim Neuladen verloren (fehlten in `leererZustand`).

