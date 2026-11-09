/*
 * Wissens-Bibliothek für Akhi: praxisnahe Anleitungen mit Checklisten.
 * Akhi liest daraus mit dem Werkzeug wissen_nachschlagen; die Person blättert im Akhi-Dashboard.
 * Zahlen (Gebühren, Grenzen) ändern sich: Sie sind als Richtwerte markiert, Stand 2026.
 * Ausrichtung: Schweiz zuerst, halal (keine Zinsen, keine Täuschung, keine verbotenen Produkte).
 */

var WISSEN = [
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
      "Keine Lügen, keine übertriebenen Einkommensversprechen, keine freizügigen oder verbotenen Inhalte. Musik ist unter Gelehrten umstritten: Im Zweifel nur Stimme, Naturgeräusche oder Nasheed ohne Instrumente."
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
      "Keine Freizügigkeit, keine Lügen für Klicks, Privatsphäre anderer achten. Musik: siehe Marketing."
    ],
    checkliste: ["Hauptplattform gewählt", "Profil mit klarem Satz und Link", "10 Video-Ideen notiert", "3 Videos gedreht", "Wochenroutine im Kalender", "Link zum kostenlosen Geschenk im Profil", "Nach 4 Wochen Zahlen ausgewertet"]
  },
  {
    id: "ki-systeme", titel: "KI-Systeme und Konnektoren", symbol: "🧠", bereich: "Systeme",
    kurz: "Welche KI wofür, wie man Werkzeuge verbindet (Zapier, Make, n8n, Schnittstellen, MCP).",
    text: [
      "## Welche KI wofür",
      "- **Claude** (Anthropic): Texte, Strategie, Programmieren, lange Dokumente.",
      "- **ChatGPT** (OpenAI): vielseitig, Bilder, Sprache.",
      "- **Gemini** (Google): gut verbunden mit Google-Diensten, Gratis-Stufe.",
      "- **Lokale KI** (Ollama mit Qwen oder Llama): kostenlos, ohne Limit, Daten bleiben auf deinem PC.",
      "- Bilder: Midjourney, DALL·E, Ideogram. Video: CapCut (Schnitt mit KI), HeyGen oder Synthesia (Avatare). Stimme: ElevenLabs.",
      "## Was ist ein Konnektor?",
      "Eine Verbindung zwischen zwei Programmen, damit Daten automatisch fliessen. Beispiel: neue Bestellung → Kunde in die E-Mail-Liste → Rechnung → Aufgabe für den Versand.",
      "## Bausteine",
      "- **Schnittstelle (API)**: Ein Programm bietet Befehle an, die andere Programme nutzen können (mit Schlüssel).",
      "- **Webhook**: Ein Programm meldet ein Ereignis sofort an eine Adresse (z. B. „neue Zahlung“).",
      "- **Automatisierer**: Zapier (einfach, teurer), Make (günstiger, flexibel), n8n (kostenlos selbst betreiben, für Fortgeschrittene).",
      "- **MCP (Model Context Protocol)**: offener Standard, mit dem KI-Assistenten wie Claude direkt auf Werkzeuge zugreifen (Gmail, Google Drive, Notion, Shop, Kalender). So kann die KI nicht nur schreiben, sondern handeln.",
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
