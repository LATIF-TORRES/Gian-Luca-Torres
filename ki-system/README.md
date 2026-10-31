# TORRES · Dein KI-System für Geld und Erfolg

> „TORRES“ ist nur ein Arbeitstitel. Den endgültigen Namen suchen wir noch gemeinsam (Ideen am Ende). In der App änderst du den Namen unter **Ich → Name deines Assistenten**. Er hört dann auch auf „Hey <Name>“.

Eine Web-App für Browser und Handy. Ein KI-Mentor (Claude) hilft dir, gezielt und ehrlich mehr Geld zu verdienen. Er orientiert sich an den Prinzipien der reichsten Unternehmer und Investoren der Welt.

## Was die App kann

| Bereich | Was du dort machst |
| --- | --- |
| **Heute** | Monatsziel mit Fortschritt, „die eine Sache heute“, Aufgabenliste, Schnellstart-Fragen |
| **Mentor** | Chat mit Claude in 6 Rollen: Stratege, Verkäufer, Rechner, Vermögen, Spiegel der Reichsten, Coach. Mit Web-Suche (mit Quellen), Spracheingabe, Vorlesen und Kostenanzeige |
| **Vorbilder** | 12 Vorbilder (Buffett, Bezos, Musk, Gates, Arnault, Huang, Ellison, Zuckerberg, Page/Brin, Ortega, Slim, Bloomberg): je ein Prinzip, eine Übung und der Knopf „Auf mich anwenden“ |
| **Geld** | Einnahmen und Ausgaben, Sparquote, woher dein Geld kommt, Zinseszins-Rechner, Stundensatz-Rechner |
| **Ich** | Name, Ziel, API-Schlüssel, Modell, Sprache, Freihändig-Modus, Gedächtnis ansehen und löschen, Sicherung |

Der Mentor **handelt selbst**:
- Er merkt sich Wichtiges über dich (Werkzeug `merken`).
- Er legt Aufgaben an (Werkzeug `aufgabe_anlegen`).
- Er trägt Einnahmen und Ausgaben ein, wenn du sie nennst (Werkzeug `buchung_eintragen`).

Unter „Ich“ siehst und löschst du alles, was er gespeichert hat.

## Starten

1. Öffne `ki-system/index.html` im Browser (Chrome, Edge oder Safari). Eine Installation braucht es nicht.
2. Hol dir auf [platform.claude.com](https://platform.claude.com) unter „API Keys“ einen Schlüssel und trag ihn unter **Ich** ein.
3. Auf dem Handy: Seite öffnen, dann „Zum Home-Bildschirm“. Am einfachsten geht das über GitHub Pages: Repository-Einstellungen → Pages → Branch wählen. Die App liegt dann unter `…/ki-system/`.

Alle Daten bleiben in deinem Browser. Der Schlüssel geht nur direkt an Anthropic, nie in eine Sicherungsdatei.

### Kosten

Du zahlst pro Antwort bei Anthropic, kein Abo. Die App zeigt die ungefähren Kosten pro Gespräch an.

| Modell | Eingabe / Ausgabe pro 1 Mio. Tokens | Eine typische Antwort |
| --- | --- | --- |
| Claude Opus 5.5 (Standard) | $4 / $20 | etwa 2 bis 10 Rappen |
| Claude Sonnet 5.5 | $2 / $10 | etwa halb so viel |
| Claude Haiku 5.5 | $0.10 / $0.50 | weniger als 1 Rappen |

Die Web-Suche kostet zusätzlich etwa 1 Cent pro Suche.

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

## Was TORRES besser macht

| Problem bei Packstart oder Jarvis | Lösung in TORRES |
| --- | --- |
| Installation, 3 GB, nur Desktop | Läuft sofort im Browser, auch auf dem Handy |
| Pakete kosten extra | Alle Rollen, Rechner und Vorbilder sind gratis dabei |
| Kein klares Ziel | Ein Ziel: mehr Geld verdienen, mit Monatsziel, Geldbuch und „die eine Sache heute“ |
| Jarvis-Apps vergessen alles | Gedächtnis, das du siehst und löschst |
| Assistent redet nur | Der Mentor legt Aufgaben an, bucht Einnahmen und merkt sich Fakten |
| Antworten ohne Belege | Web-Suche mit Quellenliste |
| Unklare Kosten | Kostenanzeige pro Gespräch |
| „Schnell reich“-Versprechen anderer Tools | Ehrliche Zahlen, Risiken und Zeitrahmen, Warnung vor Betrugsmaschen |
| Nur ein Name | Name frei wählbar, Weckwort „Hey <Name>“ |

## Technik

- Reines HTML, CSS und JavaScript, ohne Build-Schritt.
- Claude über das offizielle Anthropic-SDK (`@anthropic-ai/sdk`, geladen von jsDelivr), direkt aus dem Browser mit deinem Schlüssel.
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
| `js/stimme.js` | Sprechen, Zuhören, Weckwort |
| `js/app.js` | Oberfläche |

## Namensideen

| Name | Idee dahinter |
| --- | --- |
| **TORRES** | Dein Familienname. Als Abkürzung: **T**atkräftiger **O**nline-**R**atgeber für **R**eichtum, **E**rfolg und **S**trategie |
| **MIDAS** | Alles, was er berührt, wird zu Gold |
| **AURUM** | Lateinisch für Gold |
| **KAIROS** | Griechisch für „der richtige Moment“ |
| **ATLAS** | Trägt die Last und zeigt den Weg |
| **VENTURA** | „Das Kommende“, auch das Wort für Wagnis und Firma |
| **MAGNAT** | Der grosse Unternehmer |

Keine Anlage-, Steuer- oder Rechtsberatung. Entscheidungen triffst du selbst.
