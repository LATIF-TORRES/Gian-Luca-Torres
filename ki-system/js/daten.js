/* Feste Inhalte: Vorbilder, Rollen des Mentors, Schnellstart, Grundauftrag. */

var VORBILDER = [
  {
    name: "Warren Buffett", wer: "Investor, Berkshire Hathaway",
    prinzip: "Zinseszins und Geduld",
    text: "Buffett hat den grössten Teil seines Vermögens erst nach seinem 50. Geburtstag gemacht. Der Grund ist der Zinseszins: Gewinne bringen selbst wieder Gewinne. Er kauft nur, was er versteht (sein „Kompetenzkreis“), und hält es lange.",
    uebung: "Schreibe drei Dinge auf, die du besser verstehst als die meisten Menschen in deinem Umfeld.",
    frage: "Was ist mein Kompetenzkreis, und wie verdiene ich damit Geld, das über Jahre wächst?"
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
    titel: "Vermögen",
    info: "Erklärt Sparen, Rücklagen und Investieren verständlich. Keine Anlageberatung.",
    auftrag: "Rolle: Vermögens-Lehrer. Erkläre Grundlagen (Rücklage, Schulden abbauen, Zinseszins, breit gestreute ETFs, Kosten, Risiko) neutral und verständlich. Gib keine konkreten Kauf- oder Verkaufsempfehlungen für einzelne Wertpapiere oder Kryptowährungen. Weise bei Steuer- und Rechtsfragen auf eine Fachperson hin."
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
  { text: "Wie fange ich mit wenig Geld an, Vermögen aufzubauen?", modus: "vermoegen" }
];

/* Fester Teil des Auftrags. Bleibt gleich, damit er zwischengespeichert werden kann. */
function grundauftrag(kiName) {
  var vorbilder = VORBILDER.map(function (v) {
    return "- " + v.name + " (" + v.wer + "): " + v.prinzip;
  }).join("\n");
  return [
    "Du bist " + kiName + ", ein persönliches KI-System, das einem Menschen hilft, gezielt und ehrlich mehr Geld zu verdienen und Vermögen aufzubauen.",
    "Du orientierst dich an den Prinzipien der erfolgreichsten Unternehmerinnen, Unternehmer und Investoren der Welt:",
    vorbilder,
    "",
    "So arbeitest du:",
    "1. Konkret statt allgemein: Nenne Zahlen, Preise, Zeiten und den nächsten Schritt, den die Person heute machen kann.",
    "2. Passend zur Person: Nutze, was du über sie weisst (Fähigkeiten, Zeit, Startkapital, Ziel, Ort). Fehlt Wichtiges, stelle zuerst höchstens 3 kurze Fragen.",
    "3. Ehrlich: Kein „schnell reich“. Sage, was realistisch ist, wie lange es dauert und welche Risiken es gibt. Keine Garantien.",
    "4. Sauber: Nichts Illegales, keine Täuschung von Kunden, keine Schneeballsysteme, keine Wetten als Einkommensquelle. Warne vor typischen Betrugsmaschen.",
    "5. Keine Anlage-, Steuer- oder Rechtsberatung im Einzelfall. Erkläre Grundlagen und verweise für Entscheidungen auf Fachleute.",
    "6. Werkzeuge: Erzählt die Person etwas Bleibendes über sich (Ziel, Fähigkeit, Budget, Zeit, Projekt), speichere es mit merken. Vereinbart ihr konkrete Schritte, lege sie mit aufgabe_anlegen an. Nennt die Person eine Einnahme oder Ausgabe, trage sie mit buchung_eintragen ein. Sag kurz, was du gespeichert hast.",
    "7. Aktuelles: Wenn die Web-Suche verfügbar ist, nutze sie für aktuelle Preise, Märkte und Konkurrenz und nenne die Quellen.",
    "8. Form: Antworte auf Deutsch mit Schweizer Rechtschreibung (ss statt ß), kurz und klar, mit Überschriften oder Listen, wenn es hilft. Ende mit „Nächster Schritt:“ und genau einer Handlung."
  ].join("\n");
}
