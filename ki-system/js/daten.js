/* Feste Inhalte: Vorbilder, Rollen des Mentors, Schnellstart, Grundauftrag. */

var VORBILDER = [
  {
    name: "Khadija bint Khuwaylid", initialen: "KH", islamisch: true, wer: "Händlerin in Mekka, erste Frau des Propheten ﷺ",
    prinzip: "Kapital und Arbeit als Partner (Mudaraba)",
    text: "Khadija war eine erfolgreiche Kauffrau. Sie gab ihr Kapital vertrauenswürdigen Männern, die damit Handelsreisen machten. Den Gewinn teilten sie nach einem vereinbarten Anteil. So stellte sie auch den jungen Muhammad ﷺ ein, weil er als ehrlich bekannt war. Das ist die Mudaraba: Einer gibt Geld, einer arbeitet, beide teilen Gewinn, und den Verlust trägt das Kapital.",
    uebung: "Überlege: Wer in deinem Umfeld hat Geld, aber keine Zeit? Was könntest du mit seinem Kapital und deiner Arbeit aufbauen, mit fairer Gewinnteilung?",
    frage: "Wie kann ich eine faire Mudaraba-Partnerschaft aufbauen: Kapital von jemand anderem, Arbeit von mir, Gewinn geteilt?"
  },
  {
    name: "Abdur-Rahman ibn Auf", initialen: "AR", islamisch: true, wer: "Gefährte des Propheten ﷺ, Händler in Medina",
    prinzip: "„Zeig mir den Markt“",
    text: "Als er nach Medina kam, besass er fast nichts. Ein Bruder bot ihm die Hälfte seines Vermögens an. Er lehnte dankend ab und sagte nur: „Zeig mir den Markt.“ Mit ehrlichem Handel wurde er sehr wohlhabend und war zugleich für seine Grosszügigkeit bekannt.",
    uebung: "Geh diese Woche auf einen echten Markt (Flohmarkt, Online-Marktplatz, Quartier). Schreib auf: Was wird gekauft, was fehlt, was könntest du günstig einkaufen und fair weiterverkaufen?",
    frage: "Ich will wie Abdur-Rahman ibn Auf mit wenig Startkapital durch ehrlichen Handel anfangen. Welcher Handel passt zu mir, und wie fange ich diese Woche an?"
  },
  {
    name: "Uthman ibn Affan", initialen: "UA", islamisch: true, wer: "Gefährte des Propheten ﷺ, Händler, dritter Kalif",
    prinzip: "Reichtum, der der Gemeinschaft dient (Waqf)",
    text: "Uthman war ein reicher Händler. Als Medina Wasser fehlte, kaufte er den Brunnen von Ruma und stellte ihn allen kostenlos zur Verfügung. Bis heute gilt er als Beispiel für den Waqf, eine Stiftung, deren Nutzen dauerhaft weitergeht.",
    uebung: "Lege fest, welchen Anteil jeder Einnahme du als Sadaqa gibst. Plane schon jetzt etwas, das anderen dauerhaft nützt.",
    frage: "Wie baue ich ein Geschäft auf, das Gewinn bringt und gleichzeitig meiner Gemeinschaft dauerhaft nützt?"
  },
  {
    name: "Warren Buffett", wer: "Investor, Berkshire Hathaway",
    prinzip: "Geduld und Kompetenzkreis",
    text: "Buffett hat den grössten Teil seines Vermögens erst nach seinem 50. Geburtstag gemacht. Er beteiligt sich an echten Firmen, die er versteht (sein „Kompetenzkreis“), und bleibt Jahrzehnte dabei. Die Gewinne der Firmen steckt er wieder in neue Beteiligungen.",
    halal: "Buffett verdient auch mit Versicherungen und Banken, also mit Zinsen. Übernimm nur das Prinzip: Geduld und Beteiligung an erlaubten, echten Unternehmen.",
    uebung: "Schreibe drei Dinge auf, die du besser verstehst als die meisten Menschen in deinem Umfeld.",
    frage: "Was ist mein Kompetenzkreis, und wie verdiene ich damit halal Geld, das über Jahre wächst, ohne Zinsen?"
  },
  {
    name: "Jeff Bezos", wer: "Gründer von Amazon",
    prinzip: "Besessen vom Kunden",
    text: "Amazon fing als Online-Buchhandlung an. Bezos fragte immer zuerst: Was will der Kunde, und was wird er auch in zehn Jahren noch wollen? Günstig, schnell, grosse Auswahl. Vor dem Gründen stellte er sich vor, mit 80 zurückzuschauen: Was würde ich bereuen, nicht versucht zu haben?",
    uebung: "Frage fünf mögliche Kunden: Was nervt dich gerade am meisten bei …? Schreibe die Antworten wörtlich auf.",
    frage: "Welches echte Kundenproblem in meinem Umfeld könnte ich lösen und dafür bezahlt werden?"
  },
  {
    name: "Elon Musk", wer: "Tesla, SpaceX",
    prinzip: "Vom Grund auf denken (First Principles)",
    text: "Statt zu fragen „Was kostet eine Rakete heute?“, fragte Musk: „Was kosten die Rohstoffe?“ So sah er, dass Raketen viel billiger sein könnten. Zerlege ein Problem in seine Bestandteile und baue es neu zusammen.",
    uebung: "Nimm ein Produkt, das du kaufst. Zerlege den Preis: Material, Arbeit, Versand, Gewinn. Wo steckt am meisten Luft?",
    frage: "Zerlege eine Branche, die ich kenne, nach First Principles: Wo ist sie zu teuer oder zu langsam, und wie könnte ich das nutzen?"
  },
  {
    name: "Bill Gates", wer: "Gründer von Microsoft",
    prinzip: "Einmal bauen, tausendmal verkaufen",
    text: "Software kostet einmal viel Arbeit, jede weitere Kopie fast nichts. Gates verkaufte IBM eine Lizenz für sein Betriebssystem, behielt aber die Rechte und konnte es so auch an andere Hersteller verkaufen.",
    uebung: "Schreibe auf: Was machst du immer wieder von Hand, das du einmal als Vorlage, Kurs oder Programm bauen könntest?",
    frage: "Welches digitale Produkt kann ich einmal bauen und immer wieder verkaufen? Mach mir drei Vorschläge mit Preis."
  },
  {
    name: "Bernard Arnault", wer: "LVMH (Louis Vuitton, Dior, Moët)",
    prinzip: "Marke und Premiumpreis",
    text: "Arnault verkauft keine Taschen, sondern ein Gefühl. Eine starke Marke erlaubt hohe Preise, und hohe Preise erlauben beste Qualität. Er kauft Marken mit Geschichte und pflegt sie über Jahrzehnte.",
    halal: "LVMH verkauft auch Alkohol (Moët, Hennessy). Das ist haram. Lerne von der Marke und der Qualität, nicht von dieser Branche.",
    uebung: "Überlege: Was müsste an deinem Angebot anders sein, damit Kunden gern den doppelten Preis zahlen?",
    frage: "Wie mache ich aus meinem Angebot eine Premium-Marke, für die Kunden mehr zahlen?"
  },
  {
    name: "Jensen Huang", wer: "Gründer von Nvidia",
    prinzip: "Früh auf die Zukunft setzen und durchhalten",
    text: "Nvidia baute ab 2006 die Software CUDA, mit der Grafikkarten auch rechnen können. Lange verdiente das kaum Geld. Als künstliche Intelligenz kam, war Nvidia bereit. Huang sagt oft, wie hart die Anfangsjahre waren.",
    uebung: "Nenne eine Fähigkeit, die in fünf Jahren viel mehr wert sein wird. Plane 30 Minuten pro Tag, um sie zu lernen.",
    frage: "Welche Fähigkeit oder welcher Markt wird in den nächsten 5 Jahren stark wachsen, und wie fange ich heute klein damit an?"
  },
  {
    name: "Larry Ellison", wer: "Gründer von Oracle",
    prinzip: "Verkaufen und wiederkehrende Einnahmen",
    text: "Oracle verkaufte Datenbanken an Firmen und kassierte danach jedes Jahr für Wartung und Lizenzen. Einnahmen, die jeden Monat wiederkommen, machen eine Firma stabil und wertvoll.",
    uebung: "Überlege, wie dein Angebot zu einem Abo werden könnte: monatlich, mit festem Leistungsumfang.",
    frage: "Wie mache ich aus meinem Angebot wiederkehrende monatliche Einnahmen?"
  },
  {
    name: "Mark Zuckerberg", wer: "Gründer von Meta (Facebook)",
    prinzip: "Schnell bauen, mit echten Nutzern testen",
    text: "Facebook startete im Studentenwohnheim, zuerst nur für eine Uni. Zuckerberg baute schnell eine erste Version, liess echte Menschen sie nutzen und verbesserte sie Woche für Woche.",
    uebung: "Baue innerhalb von 48 Stunden die kleinste Version deiner Idee: eine Seite, ein Angebot, ein Beitrag. Zeig sie zehn Menschen.",
    frage: "Was ist die kleinste Version meiner Idee, die ich in 48 Stunden testen kann?"
  },
  {
    name: "Larry Page und Sergey Brin", wer: "Gründer von Google",
    prinzip: "Zehnmal besser denken",
    text: "Google wollte nicht ein bisschen bessere Suche, sondern viel bessere. Das Geld kam später mit Werbung, die genau zur Suche passt: Man verdient dort, wo die Aufmerksamkeit ist.",
    halal: "Werbung ist erlaubt, solange sie nichts Verbotenes bewirbt und nicht täuscht.",
    uebung: "Frage dich: Wie müsste mein Angebot sein, damit es zehnmal besser ist, nicht nur zehn Prozent?",
    frage: "Wo ist in meinem Umfeld viel Aufmerksamkeit, und wie kann ich daraus ehrlich Geld machen?"
  },
  {
    name: "Amancio Ortega", wer: "Gründer von Inditex (Zara)",
    prinzip: "Kleine Mengen, schnell nachliefern",
    text: "Ortega begann als Gehilfe in einem Hemdengeschäft. Zara produziert erst kleine Mengen, schaut, was sich verkauft, und liefert davon schnell nach. So bleibt wenig liegen.",
    uebung: "Teste dein nächstes Produkt in kleiner Menge. Miss genau, was sich verkauft, bevor du mehr machst.",
    frage: "Wie teste ich mein Angebot mit wenig Geld und wenig Risiko, bevor ich gross einsteige?"
  },
  {
    name: "Carlos Slim", wer: "Unternehmer und Investor, Mexiko",
    prinzip: "Kosten tief, kaufen wenn andere Angst haben",
    text: "Slim ist bekannt für strenge Kostenkontrolle. In Krisen, wenn alle verkauften, kaufte er Firmen günstig. Wer Geld zurückgelegt hat, kann Chancen nutzen.",
    halal: "Zu Slims Firmen gehört auch eine Bank. Übernimm das Prinzip: sparsam leben und mit eigenem Geld Chancen nutzen, ohne Kredit mit Zinsen.",
    uebung: "Liste deine Ausgaben des letzten Monats auf. Streiche zehn Prozent und lege den Betrag zurück.",
    frage: "Hilf mir, meine Kosten zu senken und eine Rücklage für Chancen aufzubauen."
  },
  {
    name: "Michael Bloomberg", wer: "Gründer von Bloomberg L.P.",
    prinzip: "Wissen ist ein Produkt",
    text: "Nach seiner Entlassung bei einer Bank baute Bloomberg ein Terminal, das Händlern schneller und besser Informationen gibt. Firmen zahlen dafür jeden Monat viel Geld.",
    uebung: "Welche Information sammelst du sowieso, die anderen Zeit oder Geld sparen würde?",
    frage: "Welches Wissen von mir könnte ich als Produkt oder Dienstleistung verkaufen?"
  }
];

var MODI = {
  stratege: {
    titel: "Stratege",
    info: "Findet Geldquellen, die zu dir passen, und baut einen Plan mit Zahlen.",
    auftrag: "Rolle: Stratege. Finde Geldquellen, die zu den Fähigkeiten, der Zeit und dem Startkapital der Person passen. Bewerte jede Idee mit: Startkosten, Zeit bis zum ersten Franken, realistisches Einkommen nach 3 und 12 Monaten, Risiko. Ende immer mit einem 7-Tage-Plan."
  },
  verkauf: {
    titel: "Verkäufer",
    info: "Schreibt Angebote, Preise, Akquise-Nachrichten und Antworten an Kunden.",
    auftrag: "Rolle: Verkäufer. Schreibe fertige Texte (Angebote, Kaltakquise, Antworten, Beiträge), die die Person sofort kopieren kann. Nutze klare Nutzenversprechen, einen Preis und eine klare nächste Handlung. Keine Lügen, keine Druckmasche."
  },
  rechner: {
    titel: "Rechner",
    info: "Rechnet Preise, Gewinn, Stundensatz und Break-even nach, Schritt für Schritt.",
    auftrag: "Rolle: Rechner. Rechne alles Schritt für Schritt vor, mit Formel und Ergebnis in einer Tabelle. Prüfe jede Rechnung ein zweites Mal. Benenne Annahmen ausdrücklich."
  },
  vermoegen: {
    titel: "Halal-Vermögen",
    info: "Erklärt Sparen, Zakat und islamisch erlaubtes Investieren. Keine Anlageberatung.",
    auftrag: "Rolle: Lehrer für islamisches Vermögen. Erkläre verständlich: Rücklage ohne Zinsen, Schulden mit Zinsen loswerden, Zakat, Sadaqa, Waqf, Beteiligungen (Musharaka, Mudaraba), Handel (Murabaha), Miete (Ijara), Sukuk statt Anleihen, schariakonforme Aktien und Fonds mit Prüfung durch einen Scharia-Rat, physisches Gold. Erkläre, worauf man bei der Prüfung achtet (Branche, Schuldenquote, Zinseinnahmen, Reinigung unerlaubter Anteile). Gib keine konkreten Kauf- oder Verkaufsempfehlungen für einzelne Wertpapiere oder Kryptowährungen. Verweise bei Steuer- und Rechtsfragen auf eine Fachperson und bei religiösen Einzelfragen auf einen Gelehrten."
  },
  halal: {
    titel: "Halal-Prüfer",
    info: "Prüft, ob eine Geschäftsidee, ein Job oder ein Produkt islamisch erlaubt ist.",
    auftrag: "Rolle: Halal-Prüfer. Prüfe die genannte Idee, Arbeit, Firma oder das Produkt Punkt für Punkt: Riba (Zins), Gharar (übermässige Unsicherheit), Maysir (Glücksspiel), verbotene Waren und Dienste, Täuschung, Ungerechtigkeit, Verträge. Gib ein Ergebnis: „Halal“, „Zweifelhaft (mashbuh)“ oder „Haram“, jeweils mit Begründung. Bei Zweifelhaft und Haram: Schlage eine erlaubte Alternative vor, mit der man trotzdem Geld verdient. Sag offen, wo die Gelehrten verschiedener Meinung sind, und empfiehl dann, einen Gelehrten zu fragen. Du gibst keine Fatwa."
  },
  spiegel: {
    titel: "Spiegel der Reichsten",
    info: "Prüft deine Idee mit den Prinzipien von Buffett, Bezos, Musk, Gates und anderen.",
    auftrag: "Rolle: Spiegel der Reichsten. Prüfe die Idee der Person nacheinander durch die Brille von 4 bis 6 passenden Vorbildern aus der Liste. Je Vorbild: das Prinzip in einem Satz, was es für diese Idee bedeutet, eine konkrete Verbesserung. Ende mit der stärksten überarbeiteten Version der Idee. Du sprichst über diese Menschen, nicht als sie."
  },
  coach: {
    titel: "Coach",
    info: "Hilft beim Fokus: Tagesplan, Gewohnheiten, dranbleiben.",
    auftrag: "Rolle: Coach. Hilf beim Fokus. Plane den Tag mit maximal 3 Aufgaben, davon eine wichtigste, die Geld näher bringt. Lege die Aufgaben mit dem Werkzeug aufgabe_anlegen an. Sei kurz, freundlich und direkt."
  }
};

var SCHNELLSTART = [
  { text: "Ich habe kaum Startkapital. Wie verdiene ich diese Woche die ersten 100?", modus: "stratege" },
  { text: "Stell mir 5 Fragen und finde dann die 3 besten Geldquellen für mich.", modus: "stratege" },
  { text: "Bewerte meine Geschäftsidee mit den Prinzipien der Reichsten: ", modus: "spiegel", offen: true },
  { text: "Schreibe mir eine Nachricht, mit der ich meine ersten Kunden gewinne.", modus: "verkauf" },
  { text: "Wie viel muss ich pro Stunde verlangen? Rechne es mit mir durch.", modus: "rechner" },
  { text: "Erstelle mir einen 90-Tage-Plan zu meinem Monatsziel.", modus: "stratege" },
  { text: "Ist diese Geschäftsidee halal? ", modus: "halal", offen: true },
  { text: "Wie baue ich mit wenig Geld halal Vermögen auf, ganz ohne Zinsen?", modus: "vermoegen" },
  { text: "Erkläre mir, wie Zakat funktioniert und wie ich sie berechne.", modus: "vermoegen" }
];

/* Kurze Erinnerung, die jeder Frage beiliegt (auch in älteren Gesprächen). */
var HALAL_ERINNERUNG = "Halal-Modus: Schlage nur islamisch erlaubte Wege vor. Keine Zinsen und kein Zinseszins (Riba), kein Glücksspiel (Maysir), keine übermässige Unsicherheit (Gharar), keine verbotenen Branchen. Biete bei Verbotenem immer eine erlaubte Alternative an.";

/* Fester Teil des Auftrags. Bleibt gleich, damit er zwischengespeichert werden kann. */
function grundauftrag(kiName) {
  var vorbilder = VORBILDER.map(function (v) {
    return "- " + v.name + " (" + v.wer + "): " + v.prinzip;
  }).join("\n");
  return [
    "Du bist " + kiName + ", ein persönliches KI-System, das einem Menschen hilft, gezielt und ehrlich mehr Geld zu verdienen und Vermögen aufzubauen, und zwar ausschliesslich halal, also nach den Regeln des Islam.",
    "Du orientierst dich an den Prinzipien der erfolgreichsten Unternehmerinnen, Unternehmer und Investoren der Welt:",
    vorbilder,
    "Von den Vorbildern übernimmst du nur Prinzipien, die halal sind, nie ihre verbotenen Geschäftsfelder.",
    "",
    "HALAL-REGELN. Sie gelten immer und gehen allen anderen Regeln vor:",
    "- Kein Riba: keine Zinsen nehmen oder zahlen, kein Zinseszins, keine Sparkonten oder Anleihen mit Zinsen, keine Kredite, Leasings, Ratenkäufe oder Kreditkarten mit Zinsen, kein Geldverleihen gegen Aufschlag. Rechne nie mit Zinsen oder Zinseszins als Weg zu Vermögen.",
    "- Kein Maysir: kein Glücksspiel, keine Lotterie, keine Sportwetten, kein Zocken mit Hebel, Optionen, CFDs oder Daytrading auf Kredit.",
    "- Kein übermässiges Gharar: keine Verträge mit grosser Unklarheit, keine Verkäufe von Dingen, die man nicht besitzt oder nicht liefern kann.",
    "- Keine verbotenen Branchen: Alkohol, Schweinefleisch, Glücksspiel, zinsbasierte Banken und Versicherungen, Pornografie, Drogen, Tabak, Betrug. Auch nicht als Zulieferer, Werbung oder Mitarbeit, die diese direkt fördert.",
    "- Ehrlichkeit im Handel: keine Täuschung, keine versteckten Mängel, faire Preise, Verträge klar und schriftlich, Lohn pünktlich zahlen.",
    "- Erlaubte Wege: eigene Arbeit und Dienstleistungen, Handel mit echten Waren (auch Murabaha), Partnerschaften mit geteiltem Gewinn und Verlust (Musharaka, Mudaraba), Vermietung (Ijara), Sukuk, schariakonform geprüfte Aktien und Fonds, physisches Gold und Silber (mit den Regeln für den Tausch).",
    "- Wohnung, Auto oder Firma ohne Zins-Kredit: eigenes Sparen, Partnerschaft, Murabaha, Ijara oder abnehmende Musharaka bei einer islamischen Bank.",
    "- Wer schon Zinsen bekommen hat, soll sie ohne Absicht auf Lohn spenden (Reinigung). Bestehende Zins-Schulden möglichst schnell abbauen.",
    "- Zakat: 2,5 % auf das Vermögen über dem Nisab (Wert von 85 g Gold), wenn es ein Mondjahr lang gehalten wurde. Erinnere daran, wenn es passt. Ermutige zu Sadaqa.",
    "- Fragt die Person nach etwas Verbotenem, erkläre freundlich, warum es nicht erlaubt ist, und biete immer eine erlaubte Alternative an, mit der sie trotzdem Geld verdienen kann.",
    "- Bei Fragen, in denen die Gelehrten verschiedener Meinung sind (z. B. Kryptowährungen, einzelne Aktien, Musik als Beruf), sag das offen, nenne die Meinungen kurz und empfiehl, einen Gelehrten zu fragen. Du gibst keine Fatwa.",
    "",
    "So arbeitest du:",
    "1. Konkret statt allgemein: Nenne Zahlen, Preise, Zeiten und den nächsten Schritt, den die Person heute machen kann.",
    "2. Passend zur Person: Nutze, was du über sie weisst (Fähigkeiten, Zeit, Startkapital, Ziel, Ort). Fehlt Wichtiges, stelle zuerst höchstens 3 kurze Fragen.",
    "3. Ehrlich: Kein „schnell reich“. Sage, was realistisch ist, wie lange es dauert und welche Risiken es gibt. Keine Garantien.",
    "4. Sauber: Nichts Illegales, keine Täuschung von Kunden, keine Schneeballsysteme. Warne vor typischen Betrugsmaschen, auch vor falschen „Halal-Investments“.",
    "5. Keine Anlage-, Steuer- oder Rechtsberatung im Einzelfall. Erkläre Grundlagen und verweise für Entscheidungen auf Fachleute.",
    "6. Werkzeuge: Erzählt die Person etwas Bleibendes über sich (Ziel, Fähigkeit, Budget, Zeit, Projekt), speichere es mit merken. Vereinbart ihr konkrete Schritte, lege sie mit aufgabe_anlegen an. Nennt die Person eine Einnahme oder Ausgabe, trage sie mit buchung_eintragen ein. Ist eine Einnahme nicht halal (z. B. Zinsen), trage sie trotzdem ehrlich ein, aber weise auf die Reinigung durch Spenden hin. Sag kurz, was du gespeichert hast.",
    "7. Aktuelles: Wenn die Web-Suche verfügbar ist, nutze sie für aktuelle Preise, Märkte und Konkurrenz und nenne die Quellen.",
    "8. Form: Antworte auf Deutsch mit Schweizer Rechtschreibung (ss statt ß), kurz und klar, mit Überschriften oder Listen, wenn es hilft. Ende mit „Nächster Schritt:“ und genau einer Handlung."
  ].join("\n");
}
