/*
 * Wissens-Bibliothek für Akhi: praxisnahe Anleitungen mit Checklisten.
 * Akhi liest daraus mit dem Werkzeug wissen_nachschlagen; die Person blättert im Akhi-Dashboard.
 * Zahlen (Gebühren, Grenzen) ändern sich: Sie sind als Richtwerte markiert, Stand 2026.
 * Ausrichtung: Schweiz zuerst, halal (keine Zinsen, keine Täuschung, keine verbotenen Produkte).
 */

var WISSEN = [
  {
    id: "cashflow", titel: "Automatisierter Cashflow", symbol: "💸", bereich: "Strategie",
    kurz: "Das System hinter regelmässigen Einnahmen, die immer weniger Zeit brauchen.",
    text: [
      "## Das Ziel",
      "Einnahmen, die jeden Monat wiederkommen (wiederkehrend) und möglichst wenig von deiner Zeit abhängen (automatisiert). Nicht „passiv ohne Arbeit“, sondern: einmal aufbauen, dann pflegen.",
      "## Die 5 Stufen",
      "1. **Angebot**: ein Problem, das Menschen bezahlen. Erst verkaufen, dann automatisieren. Ohne verkaufbares Angebot ist jede Automatisierung wertlos.",
      "2. **Kanal**: ein verlässlicher Weg zu Kunden (Inhalte auf 1 Plattform, Suchmaschine, Marktplatz, Empfehlungen, Werbung erst später).",
      "3. **Verkauf ohne dich**: Verkaufsseite, Bezahlung, Lieferung und Willkommens-E-Mails laufen automatisch (Digistore24, Shop, Mitgliederbereich).",
      "4. **Wiederkehr**: Abo, Mitgliedschaft, Nachfüllprodukt, Wartungsvertrag, Retainer, Vermietung. Ein Kunde zahlt jeden Monat statt einmal.",
      "5. **Skalierung**: Was funktioniert, verdoppeln (mehr Inhalte, Partner/Affiliates, Werbung mit klarer Rendite, zweites Produkt für dieselben Kunden).",
      "## Modelle im Vergleich",
      "| Modell | Start | Automatisierbar | Wiederkehrend |",
      "|---|---|---|---|",
      "| Digitales Produkt (Kurs, Vorlagen) | tief | hoch | mit Mitgliedschaft |",
      "| Affiliate mit eigenen Inhalten | sehr tief | hoch | teilweise (Abo-Produkte) |",
      "| Mitgliedschaft / Community | tief | mittel | ja |",
      "| Dienstleistung mit Retainer | tief | mittel (Vorlagen, KI) | ja |",
      "| KI-Automatisierungs-Agentur | tief | mittel | ja (Wartung) |",
      "| Print-on-Demand / Shop | mittel | hoch | nein (ausser Nachkauf) |",
      "| Reselling | tief | tief | nein |",
      "| Vermietung (Ijara) | hoch | mittel | ja |",
      "## Zielrechnung",
      "Ziel 3'000 CHF pro Monat wiederkehrend, zum Beispiel:",
      "- 100 Mitglieder × 30 CHF, oder",
      "- 6 Retainer-Kunden × 500 CHF, oder",
      "- 60 Verkäufe × 50 CHF Gewinn (dann aber jeden Monat neue Käufer nötig).",
      "Rechne rückwärts: Wie viele Kunden brauchst du? Wie viele Interessenten pro Kunde (meist 20 bis 100)? Wie viele Inhalte oder Gespräche bringen so viele Interessenten?",
      "## Automatisierungs-Bausteine",
      "Bezahlung (Digistore24, Stripe, Payrexx mit TWINT) → Zugang (Mitgliederbereich, Download) → E-Mails (Brevo, MailerLite) → Übersicht (Google Sheets, Notion) → Benachrichtigung aufs Handy (Make, Zapier, n8n) → monatliche Auswertung mit KI.",
      "## Wochenroutine (5 Stunden reichen am Anfang)",
      "- 2 h Inhalte für den Kanal.",
      "- 1 h Kundenkontakt und Verkauf.",
      "- 1 h Produkt verbessern.",
      "- 1 h Zahlen prüfen und eine Sache automatisieren.",
      "## Kennzahlen",
      "MRR (wiederkehrender Umsatz pro Monat), Kündigungsrate, Kosten pro neuem Kunden, Gewinn pro Kunde, Zeit pro Woche. Ziel: MRR steigt, Stunden sinken.",
      "## Halal",
      "Keine Zinsen (auch nicht auf Kundengeldern), keine verbotenen Produkte, ehrliche Werbung, Abos klar und leicht kündbar."
    ],
    checkliste: ["Angebot mit 3 zahlenden Kunden bestätigt", "Hauptkanal gewählt", "Bezahlung und Lieferung automatisiert", "Wiederkehrendes Element eingebaut (Abo, Retainer, Mitgliedschaft)", "Zielrechnung rückwärts gemacht", "Wochenroutine im Kalender", "MRR-Tabelle angelegt"]
  },
  {
    id: "digitale-produkte", titel: "Digitale Produkte und Online-Kurse", symbol: "🎓", bereich: "Produkt",
    kurz: "Kurs, E-Book, Vorlagen, Mitgliedschaft: bauen, bepreisen, verkaufen.",
    text: [
      "## Arten",
      "- **Vorlagen und Tools** (Notion-, Canva-, Excel-Vorlagen): schnell gebaut, gut für den Start.",
      "- **E-Book oder Leitfaden**: Wissen kompakt, Einstiegspreis.",
      "- **Online-Kurs**: Videos mit Ergebnis-Versprechen, höherer Preis.",
      "- **Mitgliedschaft**: monatlich, laufend neue Inhalte oder Community. Bester Weg zu wiederkehrendem Cashflow.",
      "## Vorgehen",
      "1. Problem wählen, das du gelöst hast oder sehr gut kannst.",
      "2. **Vorverkauf**: Angebot beschreiben und verkaufen, bevor alles fertig ist (Lieferdatum nennen, sonst Geld zurück). So testest du die Nachfrage.",
      "3. Minimalversion bauen (z. B. 5 Videos à 10 Minuten plus Arbeitsblatt).",
      "4. Mit den ersten Käufern verbessern, Erfolgsgeschichten sammeln.",
      "5. Automatisieren: Verkaufsseite, Bezahlung, Zugang, E-Mail-Folge.",
      "## Plattformen (Gebühren als Richtwerte, aktuell prüfen)",
      "- **Digistore24**: Marktplatz mit Affiliates, übernimmt die MWST.",
      "- **Gumroad, Lemon Squeezy**: einfach, prozentuale Gebühr.",
      "- **Kurs-Plattformen** (z. B. Kajabi, Teachable, Elopage): Kurs plus Mitgliederbereich, Monatsgebühr.",
      "## Preis",
      "Am Ergebnis orientieren, nicht am Aufwand. Einstieg 19 bis 49 CHF, Kurs 97 bis 497 CHF, Mitgliedschaft 15 bis 49 CHF pro Monat. Teste zwei Preise.",
      "## Halal",
      "Nur nützliches, erlaubtes Wissen; Versprechen realistisch; Rückgabe fair."
    ],
    checkliste: ["Problem und Zielgruppe festgelegt", "Angebot im Vorverkauf getestet", "Minimalversion gebaut", "Verkaufsseite mit Ergebnis und Garantie", "Zugang und E-Mails automatisiert", "Ersten 10 Käufer befragt"]
  },
  {
    id: "email-funnel", titel: "E-Mail-Liste und Verkaufstrichter", symbol: "📧", bereich: "Marketing",
    kurz: "Kontakte sammeln, Vertrauen aufbauen, automatisch verkaufen.",
    text: [
      "## Warum E-Mail",
      "Follower gehören der Plattform, E-Mail-Kontakte gehören dir. E-Mails verkaufen auch, während du schläfst.",
      "## Aufbau",
      "1. **Lead-Magnet**: kostenloses, sehr konkretes Geschenk (Checkliste, Vorlage, Mini-Kurs).",
      "2. **Anmeldeseite**: ein Versprechen, ein Feld (E-Mail), ein Knopf.",
      "3. **Willkommens-Folge (5 E-Mails, automatisch)**:",
      "- Tag 0: Geschenk ausliefern, kurz vorstellen.",
      "- Tag 1: der grösste Fehler deiner Zielgruppe und wie man ihn vermeidet.",
      "- Tag 3: eine Erfolgsgeschichte.",
      "- Tag 5: dein Angebot mit klarem Nutzen.",
      "- Tag 7: Antworten auf Einwände, letzte Erinnerung.",
      "4. **Wöchentliche E-Mail** mit Nutzen, ab und zu ein Angebot.",
      "## Werkzeuge",
      "Brevo, MailerLite (Gratis-Stufen), für Fortgeschrittene ActiveCampaign. Doppelte Bestätigung (Double-Opt-in) einschalten, Abmeldelink in jede E-Mail (Datenschutz).",
      "## Kennzahlen",
      "Öffnungsrate, Klickrate, Verkäufe pro 100 Kontakte. Grobe Regel: 1 bis 3 Verkäufe pro 100 Kontakte bei einem passenden Angebot."
    ],
    checkliste: ["Lead-Magnet erstellt", "Anmeldeseite online", "5 Willkommens-E-Mails automatisiert", "Double-Opt-in und Abmeldelink", "Wöchentliche E-Mail im Kalender"]
  },
  {
    id: "ecommerce", titel: "Online-Shop und Print-on-Demand", symbol: "🛒", bereich: "Handel",
    kurz: "Shopify, Print-on-Demand, Lager, Versand, Zoll und MWST.",
    text: [
      "## Modelle",
      "- **Eigenes Lager**: Ware kaufen, lagern, versenden. Volle Kontrolle, Kapital nötig.",
      "- **Print-on-Demand** (z. B. Printful, Printify, Gelato): Produkt wird erst nach der Bestellung hergestellt. Kein Lager.",
      "- **Dropshipping**: siehe Halal-Hinweis unten.",
      "## Shop",
      "Shopify (einfach, Monatsgebühr), WooCommerce (WordPress, günstiger, mehr Technik), Wix. Zahlung mit TWINT über Payrexx, Stripe oder SumUp.",
      "## Erfolgsfaktoren",
      "Nische mit Leidenschaft (z. B. islamische Kalligrafie, Sportlerinnen-Bekleidung mit Hijab, Geschenke), starke Fotos, klare Rückgaberegeln, schneller Versand, Bewertungen echter Kunden.",
      "## Schweiz",
      "Import aus dem Ausland: Zoll und MWST bei der Einfuhr einplanen. Versand mit der Post. Ab 100'000 CHF Umsatz MWST-Pflicht.",
      "## Halal-Hinweis",
      "- **Print-on-Demand** wird von vielen als Istisna (Herstellung auf Bestellung) gesehen und ist dann erlaubt, wenn Produkt, Preis und Lieferzeit klar beschrieben sind.",
      "- **Dropshipping**: Verkauf von Ware, die du noch nicht besitzt, sehen viele Gelehrte kritisch. Erlaubte Wege: als Vermittler mit offener Provision (Wakala), die Ware zuerst selbst kaufen, oder Salam mit voller Vorauszahlung und genauer Beschreibung.",
      "- Keine verbotenen Motive oder Produkte, keine gefälschten Marken."
    ],
    checkliste: ["Modell gewählt (Lager, Print-on-Demand, Wakala)", "Nische und 10 Produkte festgelegt", "Shop mit TWINT eingerichtet", "Versand und Rückgabe geregelt", "Impressum und Datenschutz", "Erste Werbung mit kleinem Budget getestet"]
  },
  {
    id: "dienstleistung", titel: "Dienstleistung, Freelancing und Agentur", symbol: "🧰", bereich: "Verkauf",
    kurz: "Mit einer Fähigkeit starten und daraus wiederkehrende Aufträge machen.",
    text: [
      "## Schnellster Weg zum ersten Geld",
      "Eine Fähigkeit verkaufen, die Firmen brauchen: Videoschnitt, Social-Media-Betreuung, Webseiten, Texte, KI-Automatisierungen, Buchhaltung, Grafik, Übersetzungen.",
      "## Plattformen (Gebühren als Richtwerte)",
      "Fiverr (rund 20 % Gebühr), Upwork, Malt; in der Schweiz auch direkt KMU im Quartier ansprechen.",
      "## Vom Stundenlohn zum Cashflow",
      "1. **Produktisieren**: feste Pakete statt Stunden (z. B. „12 Kurzvideos pro Monat für 690 CHF“).",
      "2. **Retainer**: monatliche Betreuung statt Einzelaufträge.",
      "3. **Vorlagen und KI**: wiederkehrende Arbeit mit Vorlagen, Checklisten und KI beschleunigen.",
      "4. **Team**: Teilaufgaben an Freelancer abgeben, du verkaufst und prüfst.",
      "## KI-Automatisierungs-Agentur",
      "KMU brauchen Hilfe mit KI: Kundenanfragen automatisch beantworten, Offerten erstellen, Termine buchen, Daten übertragen. Angebot: Einrichtung (einmalig) plus Wartung (monatlich). Werkzeuge: Make oder n8n, Claude über die Schnittstelle (für einfache Aufgaben Haiku, für anspruchsvolle Opus), Google Workspace.",
      "## Kunden gewinnen",
      "20 passende Firmen pro Woche persönlich anschreiben, mit einem konkreten Verbesserungsvorschlag. Erste 3 Kunden günstiger gegen Erfolgsgeschichte.",
      "## Halal",
      "Nur für erlaubte Branchen arbeiten (keine Werbung für Alkohol, Glücksspiel, Zinsprodukte). Klare schriftliche Offerte, faire Zahlungsziele."
    ],
    checkliste: ["Fähigkeit und Paket festgelegt", "Preis pro Paket und Retainer", "Profil auf einer Plattform", "20 Firmen pro Woche angeschrieben", "Vorlagen für wiederkehrende Arbeit", "Erste Erfolgsgeschichte gesammelt"]
  },
  {
    id: "youtube-content", titel: "YouTube und Content-Business", symbol: "🎬", bereich: "Marketing",
    kurz: "Kanal aufbauen, auch ohne Gesicht, und halal monetarisieren.",
    text: [
      "## Kanal-Arten",
      "Mit Gesicht (Vertrauen), ohne Gesicht (Bildschirm, Hände, Animation, KI-Sprecher), Tutorials, Erklärvideos, Produktvergleiche.",
      "## Ablauf",
      "1. Nische mit Suchnachfrage (Fragen, die Menschen bei YouTube eintippen).",
      "2. 30 Video-Ideen als Titel, die eine Frage beantworten.",
      "3. Skript mit KI vorschreiben, selbst überarbeiten (eigene Erfahrung macht den Unterschied).",
      "4. Aufnehmen, schneiden (CapCut, DaVinci Resolve), Vorschaubild mit klarem Versprechen.",
      "5. 1 langes Video pro Woche plus 3 Shorts daraus.",
      "## Monetarisierung",
      "- **Eigene Produkte** und Dienstleistungen (am meisten Gewinn).",
      "- **Affiliate-Links** zu passenden Produkten.",
      "- **Sponsoring** von halal Firmen, deutlich gekennzeichnet.",
      "- **Werbeeinnahmen** (YouTube-Partnerprogramm): Du kontrollierst nicht, welche Werbung gezeigt wird; über die Zulässigkeit sind Gelehrte uneinig. Mit Werbefiltern im Konto verbotene Kategorien ausschliessen, im Zweifel auf Produkte und Sponsoring setzen.",
      "## Ton",
      "Nasheed (ohne Instrumente), Stimme oder Naturgeräusche statt Musik.",
      "## Kennzahlen",
      "Klickrate des Vorschaubilds, durchschnittliche Wiedergabedauer, Abonnenten pro Video, Verkäufe über den Link."
    ],
    checkliste: ["Nische mit Suchnachfrage", "30 Titel-Ideen", "Erstes Video veröffentlicht", "Wochenrhythmus festgelegt", "Monetarisierung halal geplant", "Link zum eigenen Angebot in jeder Beschreibung"]
  },
  {
    id: "amazon-kdp", titel: "Bücher und Amazon KDP", symbol: "📚", bereich: "Produkt",
    kurz: "E-Books, Taschenbücher und Low-Content-Bücher selbst veröffentlichen.",
    text: [
      "## Was ist KDP?",
      "Kindle Direct Publishing: Amazon druckt auf Bestellung und verkauft weltweit. Du lädst Inhalt und Umschlag hoch.",
      "## Arten",
      "- Sachbücher und Ratgeber (Wissen, Anleitungen).",
      "- Low-Content: Notizbücher, Planer, Journale, Arbeitshefte (wenig Text, gute Gestaltung).",
      "- Kinderbücher (z. B. islamische Geschichten, Duas für Kinder).",
      "## Einnahmen (Richtwerte, auf kdp.amazon.com prüfen)",
      "E-Book: bis 70 % des Preises in einer bestimmten Preisspanne. Taschenbuch: rund 60 % des Preises minus Druckkosten.",
      "## Erfolgsfaktoren",
      "Nische mit Nachfrage und wenig guter Konkurrenz, professioneller Umschlag, Titel mit Suchbegriffen, Serie statt Einzelbuch.",
      "## Halal",
      "Inhalt erlaubt und nützlich, keine Täuschung mit Fake-Bewertungen, Urheberrechte achten (eigene Texte, lizenzierte Bilder)."
    ],
    checkliste: ["Nische recherchiert", "Inhalt erstellt und korrigiert", "Umschlag gestaltet", "Titel und Schlagwörter", "Veröffentlicht", "Zweites Buch der Serie geplant"]
  },
  {
    id: "investieren-halal", titel: "Halal investieren", symbol: "📈", bereich: "Finanzen",
    kurz: "Überschüsse anlegen: Scharia-Fonds, Aktien, Gold, Sukuk, Immobilien.",
    text: [
      "## Reihenfolge",
      "1. Zins-Schulden abbauen.",
      "2. Notgroschen (3 bis 6 Monatsausgaben) auf einem Konto ohne Zinsen.",
      "3. In dein Business investieren (oft die höchste Rendite).",
      "4. Langfristig anlegen.",
      "## Möglichkeiten",
      "- **Scharia-konforme Fonds und ETFs** (z. B. von iShares, SP Funds, Wahed): breit gestreut, geprüft, günstig.",
      "- **Einzelaktien**: nur geprüfte (Zoya, Musaffa), mit Reinigung kleiner unerlaubter Einnahmeanteile.",
      "- **Gold und Silber**: physisch oder voll gedeckt; beim Kauf sofortige Übergabe (Hand in Hand) beachten.",
      "- **Sukuk**: islamische Anleihen mit Beteiligung an echten Werten statt Zinsen.",
      "- **Immobilien**: Vermietung (Ijara), Beteiligungen, Scharia-REITs.",
      "## Was meiden",
      "Zins-Sparkonten, normale Anleihen, Hebel, Optionen, CFDs, Daytrading auf Kredit, „garantierte“ Renditen (oft Betrug).",
      "## Schweiz",
      "Säule 3a: Konto-Lösungen zahlen Zinsen. Prüfe Wertschriften-Lösungen mit schariakonformen Fonds; gibt es keine passende, ist 3a ungeeignet. Steuervorteil nicht über die Halal-Regeln stellen.",
      "## Zakat",
      "Auf Aktien und Fonds: je nach Methode auf den Marktwert oder auf den Anteil zakatpflichtiger Firmenwerte. Gold und Bargeld über dem Nisab: 2,5 % pro Mondjahr."
    ],
    checkliste: ["Zins-Schulden abgebaut oder Plan dafür", "Notgroschen ohne Zinsen", "Investition ins eigene Business geprüft", "Scharia-Fonds oder geprüfte Aktien ausgewählt", "Zakat-Termin festgelegt"]
  },
  {
    id: "immobilien-halal", titel: "Immobilien und Vermietung halal", symbol: "🏠", bereich: "Finanzen",
    kurz: "Mieteinnahmen ohne Zinskredit: Wege und Regeln in der Schweiz.",
    text: [
      "## Wege ohne Zinskredit",
      "- **Eigenkapital**: sparen, klein anfangen (z. B. Parkplatz, Lager, Studio).",
      "- **Partnerschaft (Musharaka)**: mehrere legen zusammen, Miete nach Anteil.",
      "- **Abnehmende Musharaka**: du kaufst einem Partner (oder einer islamischen Bank) Anteile nach und nach ab und zahlst für seinen Anteil Miete.",
      "- **Ijara**: Bank kauft und vermietet an dich mit Kaufoption.",
      "- **Scharia-REITs**: Anteile an Immobilienfonds, schon mit kleinen Beträgen.",
      "## Kleine Einstiege",
      "Parkplätze, Lagerräume, Velo- und Gerätevermietung, möblierte Untermiete (nur mit schriftlicher Zustimmung des Vermieters), Ferienwohnung (Gemeinde-Regeln und Kurtaxe prüfen).",
      "## Rechnung",
      "Netto-Rendite = (Jahresmiete − Kosten − Leerstand) ÷ Kaufpreis. Rechne mit Unterhalt, Verwaltung, Versicherung, Steuern.",
      "## Halal",
      "Miete ist erlaubt. Keine Vermietung für verbotene Zwecke. Keine Verzugszinsen in Mietverträgen; Kautionen auf einem Konto ohne Zinsen, wo möglich."
    ],
    checkliste: ["Weg ohne Zinskredit gewählt", "Kleinen Einstieg geprüft", "Netto-Rendite gerechnet", "Verträge ohne Verzugszinsen", "Steuern und Gemeinde-Regeln geprüft"]
  },
  {
    id: "preise-kennzahlen", titel: "Preise und Kennzahlen", symbol: "📊", bereich: "Finanzen",
    kurz: "Richtig bepreisen und das Business mit wenigen Zahlen steuern.",
    text: [
      "## Preis festlegen",
      "- **Am Wert orientieren**: Was spart oder bringt dein Angebot dem Kunden? Ein Bruchteil davon ist dein Preis.",
      "- **3 Pakete**: Basis, Standard (die meisten wählen sie), Premium.",
      "- **Abo statt Einmalpreis**, wo es Sinn ergibt.",
      "- **Nie unter Kosten**: Preis ≥ variable Kosten + Anteil Fixkosten + Gewinn.",
      "## Die wichtigsten Zahlen",
      "- **Umsatz** und **Gewinn** pro Monat.",
      "- **MRR**: wiederkehrender Umsatz pro Monat.",
      "- **Kündigungsrate**: Anteil der Abo-Kunden, die pro Monat kündigen.",
      "- **CAC**: Kosten, um einen Kunden zu gewinnen.",
      "- **LTV**: Gewinn pro Kunde über die ganze Zeit. Gesund: LTV mindestens 3 × CAC.",
      "- **Marge**: Gewinn ÷ Umsatz.",
      "- **Cash-Reichweite**: Wie viele Monate reicht das Geld bei den aktuellen Kosten?",
      "## Cashflow-Plan",
      "Jeden Monat: erwartete Einnahmen und Ausgaben der nächsten 3 Monate. So siehst du Engpässe früh.",
      "## Halal",
      "Keine Zinsen auf Zahlungsverzug. Stattdessen: Vorauszahlung, Anzahlung, klare Zahlungsziele, freundliche Mahnung."
    ],
    checkliste: ["Preis am Wert berechnet", "3 Pakete definiert", "Kennzahlen-Tabelle angelegt", "Cashflow-Plan für 3 Monate", "Zahlungsbedingungen ohne Verzugszins"]
  },
  {
    id: "recht-online-ch", titel: "Online-Recht Schweiz: Impressum, Datenschutz, Rechnungen", symbol: "⚖️", bereich: "Recht und Admin",
    kurz: "Pflichtangaben im Online-Handel, Datenschutz, QR-Rechnung, Mahnwesen ohne Zinsen.",
    text: [
      "## Impressum",
      "Wer online verkauft, muss klar angeben, wer er ist: Name oder Firma, Adresse, E-Mail (Gesetz gegen unlauteren Wettbewerb, UWG).",
      "## Datenschutz",
      "Seit 1. September 2023 gilt das neue Datenschutzgesetz (revDSG): Datenschutzerklärung auf der Webseite (welche Daten, wofür, welche Dienste wie Google oder Brevo), nur nötige Daten sammeln. Für Kunden in der EU gilt zusätzlich die DSGVO.",
      "## Rechnungen",
      "Die QR-Rechnung ist in der Schweiz Standard. Angaben: Rechnungssteller, Kunde, Datum, Leistung, Betrag, Zahlungsfrist, bei MWST-Pflicht die MWST-Nummer und der Satz. Banking-Apps und Buchhaltungsprogramme (z. B. Bexio) erstellen sie.",
      "## AGB",
      "Kurz und klar: Leistung, Preis, Zahlung, Lieferung, Rückgabe, Haftung, Gerichtsstand. Keine Verzugszinsen aufnehmen.",
      "## Mahnwesen halal",
      "1. Freundliche Erinnerung nach Fälligkeit.",
      "2. Zweite Mahnung mit neuer Frist.",
      "3. Persönliches Gespräch, Ratenplan ohne Aufschlag.",
      "4. Erst danach Betreibung. Keine Verzugszinsen verlangen.",
      "Vorbeugen: Vorauszahlung oder Anzahlung bei Neukunden.",
      "Hinweis: Das ist eine Übersicht, keine Rechtsberatung. Bei grösseren Verträgen eine Fachperson beiziehen."
    ],
    checkliste: ["Impressum online", "Datenschutzerklärung nach revDSG", "QR-Rechnung eingerichtet", "AGB ohne Verzugszinsen", "Mahnablauf festgelegt"]
  },
  {
    id: "ki-praxis", titel: "KI im Business: 15 Automatisierungen", symbol: "🤖", bereich: "Systeme",
    kurz: "Konkrete KI-Einsätze, die Zeit sparen und Umsatz bringen, mit Werkzeugen.",
    text: [
      "## Gute Anweisungen (Prompts)",
      "Rolle, Ziel, Zielgruppe, Beispiele, Format, Länge. Beispiel: „Du bist Texter für Schweizer KMU. Schreib 3 Betreffzeilen für eine E-Mail an Coiffeur-Salons, die KI-Terminbuchung anbieten. Max. 6 Wörter, Du-Form.“",
      "## 15 Automatisierungen",
      "1. Kundenanfragen per E-Mail vorsortieren und Antworten vorschlagen.",
      "2. Offerten aus einer kurzen Notiz erstellen.",
      "3. Termine automatisch buchen und bestätigen (Calendly, Cal.com).",
      "4. Neue Käufer in E-Mail-Liste und Tabelle eintragen.",
      "5. Social-Media-Beiträge aus einem langen Video schneiden (CapCut, Opus Clip).",
      "6. Blogartikel aus Kundenfragen schreiben lassen und überarbeiten.",
      "7. Produktbeschreibungen für den Shop erzeugen.",
      "8. Rechnungen und Belege automatisch ablegen.",
      "9. Monatlicher Zahlenbericht mit Kommentar der KI.",
      "10. Chat-Assistent auf der Webseite mit deinen FAQ.",
      "11. Bewertungen auswerten und Verbesserungen ableiten.",
      "12. Lead-Listen recherchieren und persönliche Erstnachrichten entwerfen.",
      "13. Besprechungen zusammenfassen und Aufgaben verteilen.",
      "14. Übersetzungen für neue Märkte.",
      "15. Konkurrenz beobachten (Preise, neue Angebote).",
      "## Werkzeuge",
      "Make, Zapier oder n8n als Verbindung; Claude über die Schnittstelle (Gemini als Gratis-Alternative); Google Workspace oder Microsoft 365; für Claude mit Werkzeugzugriff MCP-Konnektoren.",
      "## Regeln",
      "KI-Ergebnisse immer prüfen (Fakten, Zahlen, Ton). Keine vertraulichen Kundendaten in Gratis-KIs. Schlüssel geheim halten."
    ],
    checkliste: ["3 zeitfressende Aufgaben notiert", "Erste Automatisierung gebaut", "Prompt-Vorlagen gespeichert", "Prüfschritt für KI-Ergebnisse festgelegt", "Datenschutz geklärt"]
  },
  {
    id: "businessplan", titel: "Businessplan", symbol: "📘", bereich: "Strategie",
    kurz: "Aufbau eines klaren Businessplans, Kapitel für Kapitel, mit Finanzplan.",
    text: [
      "## Wozu ein Businessplan?",
      "Er zwingt dich, die Idee durchzurechnen, bevor du Geld und Zeit investierst. Für Partner, Investoren (Beteiligung, kein Kredit) und für dich selbst als Kompass.",
      "## Aufbau (10 Kapitel)",
      "1. **Zusammenfassung**: Idee in 5 Sätzen, Zielgruppe, Umsatzziel in 12 Monaten, was du brauchst. Zuletzt schreiben.",
      "2. **Problem und Lösung**: Welches konkrete Problem hat wer? Wie löst dein Angebot es besser, schneller oder günstiger?",
      "3. **Angebot und Preise**: Produkte oder Dienstleistungen, Preis, Marge pro Verkauf. Faustregel: Marge mindestens 50 % bei digitalen Produkten, 30 % bei Handelsware.",
      "4. **Zielgruppe**: Eine Kundin oder einen Kunden genau beschreiben (Alter, Ort, Problem, wo sie online sind, was sie schon ausgeben).",
      "5. **Markt und Konkurrenz**: 3 bis 5 Konkurrenten mit Preis, Stärken, Schwächen. Wo ist deine Lücke?",
      "6. **Marketing und Verkauf**: Kanäle (Social Media, Empfehlungen, Marktplätze, Werbung), Verkaufsprozess, Ziel-Kennzahlen.",
      "7. **Organisation**: Wer macht was? Rechtsform, Partner, Lieferanten, Werkzeuge.",
      "8. **Finanzplan**: Startkosten, feste Kosten pro Monat, variable Kosten pro Verkauf, Umsatzplan 12 Monate, Gewinnschwelle.",
      "9. **Risiken**: Die 3 grössten Risiken und was du dagegen tust.",
      "10. **Meilensteine**: Was ist nach 30, 90 und 365 Tagen erreicht?",
      "## Finanzplan einfach rechnen",
      "- **Deckungsbeitrag pro Verkauf** = Preis − variable Kosten (Einkauf, Versand, Gebühren).",
      "- **Gewinnschwelle (Verkäufe pro Monat)** = feste Kosten pro Monat ÷ Deckungsbeitrag.",
      "- Beispiel: Fixkosten 300 CHF, Preis 49 CHF, variable Kosten 9 CHF → Deckungsbeitrag 40 CHF → 300 ÷ 40 = 7,5 → ab 8 Verkäufen pro Monat Gewinn.",
      "## Finanzierung halal",
      "Kein verzinster Kredit, kein Leasing mit Zinsen, keine Kreditkarten-Schulden. Stattdessen: eigenes Geld, klein starten und Gewinne reinvestieren, Partner mit Gewinnbeteiligung (Musharaka oder Mudaraba), Vorauszahlung durch Kunden, Crowdfunding mit Belohnungen (kein Zins-Crowdlending)."
    ],
    checkliste: ["Problem und Zielgruppe in je 2 Sätzen aufgeschrieben", "3 Konkurrenten mit Preisen verglichen", "Preis und Marge pro Verkauf berechnet", "Fixkosten pro Monat aufgelistet", "Gewinnschwelle berechnet", "3 grösste Risiken mit Gegenmassnahme", "Meilensteine für 30, 90 und 365 Tage", "Halal-Prüfung: Produkt, Finanzierung, Werbung"]
  },
  {
    id: "marketing", titel: "Marketing", symbol: "📣", bereich: "Marketing",
    kurz: "Positionierung, Kundenreise, Inhalte, Werbung und Kennzahlen.",
    text: [
      "## Positionierung zuerst",
      "Ein Satz: „Ich helfe [Zielgruppe], [Ergebnis] zu erreichen, ohne [typisches Problem].“ Je enger, desto leichter verkaufst du.",
      "## Kundenreise (Funnel)",
      "1. **Aufmerksamkeit**: kurze Videos, Beiträge, Empfehlungen. Ziel: Reichweite.",
      "2. **Interesse**: kostenloses Geschenk gegen E-Mail (Checkliste, Mini-Kurs, Vorlage). Ziel: Kontakte sammeln.",
      "3. **Vertrauen**: E-Mails mit Nutzen, Kundenergebnisse, Antworten auf Einwände.",
      "4. **Kauf**: klares Angebot, ein Preis, ein Knopf, Garantie.",
      "5. **Wiederkauf und Empfehlung**: Nachfassen, Zusatzangebot, Empfehlungsbonus.",
      "## Angebot, das sich verkauft",
      "Klares Ergebnis, Zeitrahmen, Bonus, Garantie. Echte Knappheit ist erlaubt (begrenzte Plätze), erfundene Knappheit oder gefälschte Bewertungen sind Täuschung und nicht halal.",
      "## Inhalte-Plan (Content)",
      "- 3 Themen-Säulen: Wissen (Tipps), Beweis (Ergebnisse, Vorher/Nachher), Persönlich (Geschichte, Werte).",
      "- 1 Idee → viele Formate: Video, Karussell, Story, E-Mail, Blog.",
      "- Regelmässig vor perfekt: lieber 4 Beiträge pro Woche über 3 Monate als 20 in einer Woche.",
      "## Werbung (Ads)",
      "Erst schalten, wenn ein Beitrag organisch gut läuft und das Angebot verkauft. Mit kleinem Budget testen (z. B. 5 bis 10 CHF pro Tag), nur Gewinner skalieren.",
      "## Kennzahlen",
      "- **Konversion** = Käufe ÷ Besucher.",
      "- **CAC** (Kosten pro Kunde) = Werbekosten ÷ neue Kunden.",
      "- **LTV** (Wert pro Kunde) = durchschnittlicher Umsatz pro Kunde über die ganze Zeit. Gesund: LTV mindestens 3 × CAC.",
      "## Halal im Marketing",
      "Keine Lügen, keine übertriebenen Einkommensversprechen, keine freizügigen oder verbotenen Inhalte. Statt Musik: Nasheed (ohne Instrumente), deine Stimme, ein Sprecher oder Naturgeräusche. Gute Quellen: lizenzfreie Nasheed-Sammlungen und eigene Aufnahmen; Rechte immer prüfen."
    ],
    checkliste: ["Positionierungssatz geschrieben", "Kostenloses Geschenk (Lead-Magnet) erstellt", "E-Mail-Liste eingerichtet", "3 Themen-Säulen festgelegt", "Inhalte für 2 Wochen geplant", "Angebot mit Garantie formuliert", "Kennzahlen-Tabelle angelegt (Besucher, Kontakte, Käufe)"]
  },
  {
    id: "digistore24", titel: "Digistore24", symbol: "💳", bereich: "Verkauf",
    kurz: "Digitale Produkte verkaufen oder als Affiliate vermitteln.",
    text: [
      "## Was ist Digistore24?",
      "Ein deutscher Marktplatz und Zahlungsabwickler für digitale Produkte: Online-Kurse, E-Books, Mitgliederbereiche, Software, Coachings. Digistore24 tritt als Wiederverkäufer auf: Er kassiert, stellt Rechnungen, kümmert sich um die Mehrwertsteuer in den Ländern der Käufer und zahlt dir aus.",
      "## Zwei Wege",
      "**1. Als Anbieter (Vendor):** Du erstellst ein eigenes Produkt und verkaufst es über Digistore24.",
      "- Produkt anlegen, Preis, Bezahlseite, Verkaufsseite (eigene Webseite, verlinkt auf die Digistore-Bestellseite).",
      "- Digistore24 prüft das Produkt vor der Freigabe (Impressum, Datenschutz, keine falschen Versprechen).",
      "- Gebühr pro Verkauf: Richtwert 7,9 % + 1 € (aktuell auf digistore24.com prüfen).",
      "- Du kannst eine Provision für Affiliates festlegen (oft 30 bis 50 %), dann verkaufen andere für dich.",
      "**2. Als Affiliate (Vermittler):** Du empfiehlst fremde Produkte mit deinem Link und bekommst Provision.",
      "- Kostenlos registrieren, im Marktplatz Produkte suchen, Link holen.",
      "- Gute Produkte erkennst du an: echter Nutzen, faire Rückgabequote, seriöser Anbieter, Verkaufsseite ohne Übertreibung.",
      "- Verbreiten über eigene Inhalte (YouTube, TikTok, Blog, E-Mail-Liste), nicht über Spam.",
      "## Schritt für Schritt (Anbieter)",
      "1. Problem der Zielgruppe wählen, das du lösen kannst.",
      "2. Kleines Produkt bauen (z. B. Mini-Kurs mit 5 Videos oder Vorlagen-Paket).",
      "3. Verkaufsseite mit Ergebnis, Inhalt, Preis, Garantie.",
      "4. Bei Digistore24 als Anbieter registrieren, Produkt anlegen, Freigabe abwarten.",
      "5. Erste 10 Käufer über Netzwerk und Inhalte, Feedback sammeln, verbessern.",
      "6. Affiliate-Provision anbieten, Partner suchen.",
      "## Halal-Prüfung",
      "- Provision für Vermittlung ist grundsätzlich erlaubt (Ju'ala, Wakala), wenn das Produkt selbst halal ist.",
      "- Nicht bewerben: Zins-Trading-Kurse, Forex mit Hebel, Krypto-Glücksspiel, „schnell reich“-Versprechen, Dating, unzüchtige Inhalte.",
      "- Ehrlich: Wenn du ein Produkt bewirbst, sag, dass du Provision bekommst (in vielen Ländern auch Pflicht).",
      "## Steuern Schweiz",
      "Einnahmen aus Digistore24 sind Einkommen aus selbständiger Tätigkeit: in der Steuererklärung angeben, bei regelmässigen Einnahmen als Selbständige(r) bei der AHV-Ausgleichskasse anmelden."
    ],
    checkliste: ["Rolle gewählt: Anbieter oder Affiliate", "Produkt oder Partnerprodukt halal geprüft", "Konto bei Digistore24 eröffnet", "Impressum und Datenschutz auf der Webseite", "Verkaufsseite oder Inhalte-Plan fertig", "Erste 10 Verkäufe als Ziel gesetzt", "Einnahmen im Geldbuch erfasst"]
  },
  {
    id: "reselling", titel: "Reselling", symbol: "🔁", bereich: "Handel",
    kurz: "Günstig einkaufen, teurer verkaufen: Quellen, Plattformen, Preise, Halal-Regeln.",
    text: [
      "## Prinzip",
      "Ware unter Marktwert einkaufen, aufbereiten und mit Gewinn verkaufen. Klassischer Handel (Tijara), halal, solange du ehrlich bist und die Ware wirklich besitzt.",
      "## Einkaufsquellen",
      "- Flohmärkte, Brockenhäuser, Haushaltsauflösungen, Räumungsverkäufe.",
      "- Marktplätze mit Fehlbewertungen (falsche Titel, schlechte Fotos): Ricardo, Tutti, Vinted, Facebook Marketplace.",
      "- Ausverkauf und Outlets (Retail-Arbitrage), Restposten von Firmen.",
      "## Verkaufsplattformen (Schweiz)",
      "- **Ricardo**: Auktionen und Festpreis, grosse Reichweite, Verkaufsgebühr.",
      "- **Tutti**: Kleinanzeigen, meist gebührenfrei, lokale Abholung.",
      "- **Vinted**: Kleidung und Mode, Käufer zahlt die Gebühr.",
      "- **eBay**: international, gut für Sammlerstücke.",
      "Gebühren ändern sich: vor dem Start auf der Plattform prüfen.",
      "## Was sich lohnt",
      "Markenkleidung, Sneakers, Elektronik (Konsolen, Kameras), Werkzeug, Möbel-Klassiker, Sammlerkarten, Bücher in Serie. Faustregel: Einkauf höchstens ein Drittel des sicheren Verkaufspreises.",
      "## Preis finden",
      "Bei Ricardo und eBay nach **verkauften** Artikeln suchen, nicht nach Angeboten. Der Durchschnitt der letzten Verkäufe ist dein realistischer Preis.",
      "## Ablauf",
      "1. Nische wählen (eine Kategorie, die du verstehst).",
      "2. Startbudget festlegen (z. B. 200 CHF), nur eigenes Geld.",
      "3. Einkaufen, reinigen, gute Fotos bei Tageslicht, ehrliche Beschreibung mit Mängeln.",
      "4. Verkaufen, Gewinn notieren, reinvestieren.",
      "5. Ab Regelmässigkeit: Lager, Versandmaterial, Buchhaltung, AHV-Anmeldung als Selbständige(r).",
      "## Halal-Regeln im Handel",
      "- **Nur verkaufen, was du besitzt** und übergeben kannst. Dropshipping, bei dem du verkaufst, bevor du die Ware besitzt, sehen viele Gelehrte kritisch. Erlaubte Wege: als Vermittler gegen festgelegte Provision (Wakala) arbeiten oder erst einkaufen, dann verkaufen.",
      "- **Mängel offenlegen**: Verschweigen ist Betrug (Ghisch).",
      "- **Keine Fälschungen**, keine verbotenen Waren (Alkohol, Glücksspiel, unzüchtige Artikel).",
      "- Ein fairer Gewinn ist erlaubt, Ausnutzen von Notlagen nicht."
    ],
    checkliste: ["Nische gewählt", "Startbudget aus eigenem Geld festgelegt", "Verkaufte Preise recherchiert", "Erste 5 Artikel eingekauft", "Fotos und ehrliche Beschreibung mit Mängeln", "Gewinn pro Artikel notiert", "Nur Ware verkauft, die ich besitze"]
  },
  {
    id: "socialmedia", titel: "Social Media", symbol: "📱", bereich: "Marketing",
    kurz: "TikTok, Instagram, YouTube, LinkedIn: Strategie, Formate, Routine.",
    text: [
      "## Plattform wählen",
      "- **TikTok**: schnellste Reichweite, kurze Videos, junge Zielgruppe.",
      "- **Instagram**: Reels für Reichweite, Stories für Vertrauen, Profil als Schaufenster.",
      "- **YouTube**: Shorts für Reichweite, lange Videos für Vertrauen und Suche. Inhalte leben jahrelang.",
      "- **LinkedIn**: Geschäftskunden, Dienstleistungen, Beratung.",
      "- **Pinterest**: Produkte, Vorlagen, Rezepte, lange Lebensdauer.",
      "Starte mit 1 Hauptplattform und verteile dieselben Videos auf 2 weitere.",
      "## Aufbau eines Videos",
      "1. **Hook (erste 2 Sekunden)**: Frage, Behauptung oder Ergebnis zeigen.",
      "2. **Inhalt**: ein Gedanke, kurz, mit Untertiteln.",
      "3. **Handlungsaufforderung**: folgen, kommentieren, Link im Profil.",
      "## Routine",
      "- 1 Stunde pro Woche planen: 10 Ideen notieren.",
      "- 2 Stunden pro Woche drehen (mehrere Videos am Stück).",
      "- Täglich 15 Minuten: posten, Kommentare beantworten.",
      "## Wachstum messen",
      "Zuschauerbindung (wie viele schauen bis zum Ende), Speicherungen, Profilbesuche, Link-Klicks. Was gut läuft: neue Version davon machen.",
      "## Vom Follower zum Kunden",
      "Link im Profil → kostenloses Geschenk → E-Mail-Liste → Angebot. Follower gehören der Plattform, E-Mail-Kontakte gehören dir.",
      "## Halal",
      "Keine Freizügigkeit, keine Lügen für Klicks, Privatsphäre anderer achten. Für den Ton: Nasheed (ohne Instrumente), Stimme oder Naturgeräusche statt Musik. Viele Videos wirken mit klarer Sprache und Untertiteln ohnehin stärker."
    ],
    checkliste: ["Hauptplattform gewählt", "Profil mit klarem Satz und Link", "10 Video-Ideen notiert", "3 Videos gedreht", "Wochenroutine im Kalender", "Link zum kostenlosen Geschenk im Profil", "Nach 4 Wochen Zahlen ausgewertet"]
  },
  {
    id: "ki-systeme", titel: "KI-Systeme und Konnektoren", symbol: "🧠", bereich: "Systeme",
    kurz: "Welche KI wofür, wie man Werkzeuge verbindet (Zapier, Make, n8n, Schnittstellen, MCP).",
    text: [
      "## Welche KI wofür",
      "- **Claude** (Anthropic) ist die Haupt-KI von A&T: am stärksten bei Strategie, Texten, Analysen, langen Dokumenten, Programmieren und beim Arbeiten mit Werkzeugen. Modelle: Opus 5.5 (am klügsten), Sonnet 5.5 (schnell und günstiger), Haiku 5.5 (sehr günstig). Nutzung über claude.ai (Abo) oder über einen eigenen API-Schlüssel von platform.claude.com (bezahlt pro Nutzung, Richtwert: wenige Rappen pro Antwort).",
      "- **Gemini** (Google): gratis zum Einstieg, gut verbunden mit Google-Diensten.",
      "- **Lokale KI** (Ollama mit Qwen oder Llama): kostenlos, ohne Limit, Daten bleiben auf deinem PC.",
      "- Bilder: Midjourney, Ideogram. Video: CapCut (Schnitt mit KI), HeyGen oder Synthesia (Avatare). Stimme: ElevenLabs.",
      "## Was ist ein Konnektor?",
      "Eine Verbindung zwischen zwei Programmen, damit Daten automatisch fliessen. Beispiel: neue Bestellung → Kunde in die E-Mail-Liste → Rechnung → Aufgabe für den Versand.",
      "## Bausteine",
      "- **Schnittstelle (API)**: Ein Programm bietet Befehle an, die andere Programme nutzen können (mit Schlüssel).",
      "- **Webhook**: Ein Programm meldet ein Ereignis sofort an eine Adresse (z. B. „neue Zahlung“).",
      "- **Automatisierer**: Zapier (einfach, teurer), Make (günstiger, flexibel), n8n (kostenlos selbst betreiben, für Fortgeschrittene).",
      "- **MCP (Model Context Protocol)**: offener Standard von Anthropic, mit dem Claude direkt auf Werkzeuge zugreift (Gmail, Google Drive, Notion, Shop, Kalender). In Claude heissen sie Konnektoren. So kann die KI nicht nur schreiben, sondern handeln.",
      "## Typische Systeme für ein kleines Online-Business",
      "- **Webseite und Shop**: Shopify, WooCommerce, Wix; für digitale Produkte Digistore24, Gumroad oder Lemon Squeezy.",
      "- **Zahlung Schweiz**: TWINT und Karten über Payrexx, SumUp, Stripe oder Datatrans.",
      "- **E-Mail-Marketing**: Brevo, MailerLite (Gratis-Stufen).",
      "- **Kundenverwaltung (CRM)**: HubSpot (gratis), Notion, Airtable.",
      "- **Termine**: Calendly, Cal.com.",
      "- **Buchhaltung Schweiz**: Bexio, Banana, Run my Accounts.",
      "## Beispiel-Automatisierung",
      "1. Kunde kauft über Digistore24.",
      "2. Webhook an Make.",
      "3. Make trägt den Kunden in Brevo ein (Willkommens-E-Mails) und in Google Sheets (Übersicht).",
      "4. Make schickt dir eine Nachricht aufs Handy.",
      "5. Einmal im Monat fasst eine KI die Verkäufe zusammen und schlägt nächste Schritte vor.",
      "## Sicherheit",
      "Schlüssel (API-Keys) wie Passwörter behandeln: nie öffentlich posten, nie in Chats teilen, regelmässig erneuern. Zwei-Faktor-Anmeldung überall einschalten."
    ],
    checkliste: ["Haupt-KI gewählt", "Shop oder Verkaufsplattform gewählt", "Zahlungsanbieter mit TWINT eingerichtet", "E-Mail-Tool eingerichtet", "Erste Automatisierung gebaut (z. B. Käufer → E-Mail-Liste)", "Zwei-Faktor-Anmeldung überall an", "Schlüssel sicher aufbewahrt"]
  },
  {
    id: "gruenden-ch", titel: "Gründen in der Schweiz", symbol: "🇨🇭", bereich: "Recht und Finanzen",
    kurz: "Rechtsform, Anmeldungen, AHV, MWST, Buchhaltung, Steuern.",
    text: [
      "## Rechtsform",
      "- **Einzelfirma**: einfachster Start, keine Mindestkapital, du haftest mit deinem Privatvermögen. Ins Handelsregister ab 100'000 CHF Umsatz pro Jahr (freiwillig früher).",
      "- **GmbH**: 20'000 CHF Stammkapital, Haftung auf das Firmenvermögen beschränkt, Gründung mit Notar.",
      "- **AG**: 100'000 CHF Aktienkapital (mindestens 50'000 einbezahlt), für grössere Vorhaben.",
      "## Anmeldungen",
      "- **AHV**: Als Selbständige(r) bei der kantonalen Ausgleichskasse anmelden, sobald du regelmässig selbständig verdienst. Sie prüft, ob du als selbständig anerkannt wirst.",
      "- **MWST**: Pflicht ab 100'000 CHF Umsatz pro Jahr weltweit (Richtwert, bei der ESTV prüfen).",
      "- **Handelsregister**: siehe Rechtsform.",
      "- Bewilligungen je nach Branche (Lebensmittel, Gastro, Transport).",
      "## Buchhaltung",
      "Bis 500'000 CHF Umsatz reicht eine einfache Buchhaltung: Einnahmen, Ausgaben und Vermögen. Belege 10 Jahre aufbewahren. Geschäftliches und Privates auf getrennten Konten.",
      "## Steuern",
      "Gewinn der Einzelfirma ist Teil deines Einkommens. Rücklagen bilden: Faustregel 20 bis 30 % des Gewinns für Steuern und AHV zur Seite legen.",
      "## Halal-Finanzierung",
      "Keine Zinskredite. Eigenes Geld, Partner mit Gewinnbeteiligung, Vorauszahlungen, Belohnungs-Crowdfunding. Geschäftskonto möglichst ohne Zinsen; erhaltene Zinsen nicht behalten, sondern ohne Belohnungsabsicht weitergeben."
    ],
    checkliste: ["Rechtsform gewählt", "Geschäftskonto eröffnet (getrennt von privat)", "AHV-Anmeldung als Selbständige(r) geprüft", "Belege-Ablage eingerichtet", "Rücklage für Steuern (20 bis 30 %)", "MWST-Grenze im Blick", "Branchen-Bewilligungen geprüft"]
  },
  {
    id: "halal-business", titel: "Halal-Business", symbol: "☪️", bereich: "Strategie",
    kurz: "Die Regeln für erlaubten Erwerb, kurz und praktisch.",
    text: [
      "## Grundsatz",
      "Im Handel ist alles erlaubt, ausser was ausdrücklich verboten ist.",
      "## Verboten",
      "- **Riba (Zinsen)**: weder zahlen noch nehmen. Gilt für Kredite, Kreditkarten-Raten, Zins-Sparkonten, Anleihen.",
      "- **Maysir (Glücksspiel)**: Wetten, Lotterien, Glücksspiel-ähnliche Spekulation.",
      "- **Gharar (übermässige Unsicherheit)**: Verträge, bei denen Ware, Preis oder Lieferung unklar sind.",
      "- **Verbotene Produkte**: Alkohol, Schweinefleisch, Glücksspiel, Unzucht, Drogen, Betrug.",
      "- **Betrug und Täuschung**: Mängel verschweigen, falsche Bewertungen, falsche Versprechen.",
      "## Erlaubte Modelle",
      "- **Handel (Bai')**: kaufen und mit Gewinn verkaufen.",
      "- **Murabaha**: Verkauf mit offen genanntem Aufschlag.",
      "- **Musharaka**: gemeinsames Kapital, Gewinn und Verlust nach Anteil.",
      "- **Mudaraba**: einer gibt Kapital, der andere Arbeit; Gewinn nach Vereinbarung, Verlust trägt der Kapitalgeber.",
      "- **Ijara**: Vermietung.",
      "- **Wakala und Ju'ala**: Vermittlung gegen Provision oder Erfolgsprämie.",
      "- **Salam und Istisna**: Vorauszahlung für später gelieferte oder herzustellende Ware, mit genauer Beschreibung.",
      "## Aktien",
      "Erlaubt bei halal Geschäftstätigkeit und tiefen Zins-Schulden (gängige Grenze: unter 33 % der Marktkapitalisierung), mit Reinigung kleiner unerlaubter Einnahmeanteile. Prüfen mit Zoya oder Musaffa.",
      "## Zakat",
      "2,5 % pro Mondjahr auf Vermögen über dem Nisab (Wert von 85 g Gold). Der Zakat-Rechner unter „Geld“ hilft."
    ],
    checkliste: ["Produkt halal geprüft", "Finanzierung ohne Zinsen", "Verträge klar (Ware, Preis, Lieferung)", "Werbung ehrlich", "Zakat-Termin notiert"]
  },
  {
    id: "verkauf", titel: "Verkaufen und Kundengespräche", symbol: "🤝", bereich: "Verkauf",
    kurz: "Erstgespräch, Einwände, Abschluss, Nachfassen.",
    text: [
      "## Erstgespräch (20 Minuten)",
      "1. **Situation**: „Wie läuft es gerade bei …?“",
      "2. **Problem**: „Was stört dich daran am meisten?“",
      "3. **Folgen**: „Was kostet dich das im Monat (Zeit, Geld, Nerven)?“",
      "4. **Ziel**: „Wie sähe es ideal aus?“",
      "5. **Angebot**: nur dann vorstellen, wenn es wirklich passt. Preis klar nennen.",
      "## Einwände",
      "- „Zu teuer“: Nutzen gegen Preis rechnen, kleineres Paket anbieten.",
      "- „Ich überlege es mir“: „Was müsste klar sein, damit du entscheiden kannst?“",
      "- „Keine Zeit“: Aufwand zeigen, der wegfällt.",
      "## Nachfassen",
      "Nach 2 Tagen, nach 1 Woche, nach 1 Monat freundlich nachfragen. Die meisten Verkäufe entstehen beim Nachfassen.",
      "## Halal",
      "Kein Druck mit Lügen, kein Verschweigen, Rückgaberecht fair regeln."
    ],
    checkliste: ["Gesprächsleitfaden ausgedruckt", "Preis und Pakete klar", "Antworten auf 3 Einwände vorbereitet", "Nachfass-Termine im Kalender"]
  },
  {
    id: "produktivitaet", titel: "Aufgabenbereiche und Wochenplan", symbol: "🗂️", bereich: "Organisation",
    kurz: "Business in Bereiche teilen, Woche planen, dranbleiben.",
    text: [
      "## Die 6 Bereiche jedes Business",
      "1. **Produkt**: Angebot bauen und verbessern.",
      "2. **Marketing**: Aufmerksamkeit und Kontakte.",
      "3. **Verkauf**: Gespräche, Angebote, Abschlüsse.",
      "4. **Finanzen**: Geldbuch, Rücklagen, Preise.",
      "5. **Recht und Admin**: Anmeldungen, Verträge, Ablage.",
      "6. **Systeme**: Werkzeuge, Automatisierungen, KI.",
      "## Wochenplan",
      "- Montag: Woche planen, 3 wichtigste Ergebnisse festlegen.",
      "- Dienstag bis Donnerstag: Produkt, Marketing, Verkauf.",
      "- Freitag: Finanzen, Admin, Rückblick.",
      "- Täglich: die eine wichtigste Aufgabe zuerst.",
      "## Regel",
      "Jede Aufgabe beginnt mit einem Verb und ist in unter 2 Stunden erledigt. Grössere Aufgaben teilen."
    ],
    checkliste: ["3 Wochenziele festgelegt", "Aufgaben den 6 Bereichen zugeordnet", "Fester Termin für den Wochenrückblick"]
  }
];

function wissenFinden(begriff) {
  var b = String(begriff || "").toLowerCase().trim();
  if (!b) return null;
  return WISSEN.filter(function (w) { return w.id === b; })[0] ||
    WISSEN.filter(function (w) { return (w.titel + " " + w.kurz + " " + w.id).toLowerCase().indexOf(b) !== -1; })[0] ||
    WISSEN.filter(function (w) { return w.text.join(" ").toLowerCase().indexOf(b) !== -1; })[0] || null;
}
function wissenAlsText(w) {
  return "# " + w.titel + "\n\n" + w.text.join("\n") + "\n\n## Checkliste\n" + w.checkliste.map(function (c) { return "- [ ] " + c; }).join("\n");
}
function wissenThemen() { return WISSEN.map(function (w) { return w.id + " (" + w.titel + ")"; }).join(", "); }

/* ---------- Automatisches Fachwissen: passende Module zu einer Frage finden ---------- */
// Stichwörter → Modul. So bekommt auch eine einfache KI das geprüfte Wissen mit, ohne selbst nachschlagen zu müssen.
var WISSEN_STICHWORTE = {
  "cashflow": /cashflow|passiv|wiederkehr|abo\b|abonnement|mitgliedschaft|automatisiert|monatlich verdienen|nebeneinkommen|einkommen aufbauen/,
  "digitale-produkte": /online.?kurs|\bkurs\b|e.?book|vorlage|template|digitales produkt|membership|gumroad|kajabi/,
  "email-funnel": /e.?mail|newsletter|funnel|trichter|lead.?magnet|brevo|mailerlite/,
  "ecommerce": /shop|shopify|woocommerce|print.?on.?demand|printful|printify|dropship|onlineshop|e.?commerce/,
  "dienstleistung": /freelanc|fiverr|upwork|agentur|dienstleistung|kunden gewinnen|akquise|retainer/,
  "youtube-content": /youtube|kanal|video|shorts|content|faceless/,
  "amazon-kdp": /\bkdp\b|amazon|buch|bücher|notizbuch|selfpublish/,
  "investieren-halal": /aktie|etf|invest|anlegen|sparen|gold|silber|sukuk|säule 3a|3a|fonds|vermögen/,
  "immobilien-halal": /immobil|miete|vermiet|wohnung|haus kaufen|airbnb|hypothek|eigenheim/,
  "preise-kennzahlen": /preis|kennzahl|marge|kalkul|gewinnschwelle|break.?even|ltv|cac|mrr|kündigungsrate/,
  "recht-online-ch": /impressum|datenschutz|dsgvo|revdsg|agb|qr.?rechnung|rechnung|mahnung|betreibung/,
  "ki-praxis": /automatisier|prompt|ki.?agentur|chatbot|ki einsetzen|ki nutzen/,
  "ki-systeme": /zapier|make\.com|\bmake\b|n8n|webhook|schnittstelle|\bapi\b|mcp|konnektor|claude|gemini|welche ki/,
  "businessplan": /businessplan|geschäftsplan|business.?plan|geschäftsidee|idee prüfen|finanzplan/,
  "marketing": /marketing|werbung|ads|positionierung|zielgruppe|kunden finden|reichweite/,
  "digistore24": /digistore|affiliate|provision|vermittl/,
  "reselling": /resell|wiederverkauf|flohmarkt|brockenhaus|ricardo|tutti|vinted|sneaker|arbitrage/,
  "socialmedia": /tiktok|instagram|reels|social media|linkedin|pinterest|follower/,
  "gruenden-ch": /gründ|firma|einzelfirma|gmbh|handelsregister|ahv|mwst|mehrwertsteuer|selbständig|selbstständig|steuer|buchhaltung/,
  "halal-business": /halal|haram|zins|riba|islam|scharia|sharia|zakat|gharar|maysir/,
  "verkauf": /verkauf|verkaufen|einwand|abschluss|kundengespräch|akquise|offerte/,
  "produktivitaet": /woche planen|wochenplan|aufgaben|priorit|zeitmanagement|routine|fokus/
};
function wissenPassend(frage, anzahl) {
  var f = String(frage || "").toLowerCase();
  if (f.length < 12) return [];
  var treffer = WISSEN.map(function (w) {
    var punkte = 0, re = WISSEN_STICHWORTE[w.id];
    if (re) { var m = f.match(new RegExp(re.source, "g")); if (m) punkte += 3 * m.length; }
    if (f.indexOf(w.titel.toLowerCase()) !== -1) punkte += 5;
    return { w: w, punkte: punkte };
  }).filter(function (t) { return t.punkte >= 3; }).sort(function (a, b) { return b.punkte - a.punkte; });
  return treffer.slice(0, anzahl || 2).map(function (t) { return t.w; });
}
// Kontext-Block für die KI (gekürzt, damit es schnell und günstig bleibt)
function wissenKontext(frage) {
  var liste = wissenPassend(frage, 2);
  if (!liste.length) return "";
  return "\n<wissen>\nGeprüftes Fachwissen aus der A&T-Bibliothek zur Frage (nutze es, wenn es passt; Zahlen sind Richtwerte, nenne Abweichungen, wenn du Aktuelleres weisst):\n" +
    liste.map(function (w) { return wissenAlsText(w).slice(0, 3500); }).join("\n\n") + "\n</wissen>";
}
