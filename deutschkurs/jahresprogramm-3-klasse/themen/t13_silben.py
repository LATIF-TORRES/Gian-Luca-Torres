from werkzeug import Merkkasten, Saetze, Schreiben, Silben

NR = "13"
TITEL = "Silben und Trennen"
BEREICH = "Rechtschreibung"
LERNZIELE = ["Du zerlegst Wörter in Silben (Silbenbögen).",
             "Du zählst die Silben eines Wortes.",
             "Du trennst Wörter am Zeilenende richtig."]

MERK = Merkkasten("Merkkasten: Silben", [
    "Wenn du ein Wort langsam sprichst und dazu klatschst, hörst du die Silben.",
    "> Ba – na – ne  (3 Silben)  ·  Ro – se  (2 Silben)  ·  Hund  (1 Silbe)",
    "Jede Silbe hat einen Selbstlaut (a, e, i, o, u) oder Umlaut (ä, ö, ü) oder au, ei, eu.",
    "# Trennen am Zeilenende",
    "Man trennt nach Silben: Fens-ter, Tel-ler, Zu-cker, Kat-ze",
    "! Ein einzelner Buchstabe wird nicht abgetrennt: Igel (nicht I-gel), Ofen (nicht O-fen).",
    "! ck und sch bleiben zusammen: Zu-cker, Ta-sche.",
])

# Silben mit Bindestrich: Aufgaben (Wort, Silben, Anzahl) werden daraus berechnet
SILBEN_1 = ["Ro-se", "Ba-na-ne", "Hund", "Ta-fel", "Scho-ko-la-de", "Ball", "Au-to", "Kro-ko-dil"]
SILBEN_2 = ["Schmet-ter-ling", "Ka-ra-wa-ne", "Tel-ler", "Zu-cker", "Fens-ter", "Gi-raf-fe",
            "Wal", "Ap-fel-baum", "Ta-sche", "Kin-der-gar-ten"]


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Silben("Silbenbögen",
                   "Sprich das Wort langsam und klatsche. Zeichne unter jede Silbe einen Bogen. "
                   "Schreibe das Wort getrennt auf die Linie. Schreibe die Anzahl Silben ins Kästchen.",
                   SILBEN_1),
            Saetze("Silben zusammensetzen",
                   "Setze die Silben zusammen. Schreibe das Wort auf die Linie.",
                   ["Mau + er = {Mauer}", "Blu + me = {Blume}", "Ha + se = {Hase}",
                    "Pa + pa + gei = {Papagei}"],
                   min_gap=30 * 2.835),
        ]
    return [
        MERK,
        Silben("Silbenbögen",
               "Zeichne die Silbenbögen. Schreibe das Wort getrennt auf. Schreibe die Anzahl Silben ins Kästchen.",
               SILBEN_2),
        Schreiben("Trennen am Zeilenende",
                  "Das Wort passt nicht mehr auf die Zeile. Trenne es einmal mit einem Strich.",
                  [("Wolke", "Wol-ke"), ("Sonne", "Son-ne"), ("Brücke", "Brü-cke"), ("Flasche", "Fla-sche"),
                   ("Garten", "Gar-ten"), ("Kissen", "Kis-sen")],
                  spalten=2, breit=24 * 2.835,
                  erklaerung="ck und sch bleiben zusammen: Brü-cke, Fla-sche."),
        Saetze("Kann man das trennen?",
               "Kreise ein: Darf man das Wort so trennen?",
               ["O-fen\t<ja|*nein>", "Ta-sche\t<*ja|nein>", "Zuc-ker\t<ja|*nein>",
                "Lam-pe\t<*ja|nein>", "E-sel\t<ja|*nein>"],
               tab=34 * 2.835,
               erklaerung="Ofen und Esel trennt man nicht (ein Buchstabe allein). Richtig: Zu-cker."),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Silben("Silbenbögen",
                   "Zeichne die Silbenbögen. Schreibe das Wort getrennt auf. Schreibe die Anzahl Silben ins Kästchen.",
                   ["Ka-ter", "Mond", "To-ma-te", "Lö-we"], punkte=8,
                   erklaerung="Pro Wort 1 Punkt für die Bögen/Trennung und 1 Punkt für die Anzahl."),
            Saetze("Silben zusammensetzen",
                   "Setze die Silben zusammen. Schreibe das Wort auf die Linie.",
                   ["Na + se = {Nase}", "Ki + no = {Kino}", "Ap + fel = {Apfel}"], min_gap=30 * 2.835),
        ]
    return [
        Silben("Silbenbögen",
               "Zeichne die Silbenbögen. Schreibe das Wort getrennt auf. Schreibe die Anzahl Silben ins Kästchen.",
               ["Re-gen-bo-gen", "Wur-zel", "Ham-mer", "E-le-fant"], punkte=8,
               erklaerung="Pro Wort 1 Punkt für die Bögen/Trennung und 1 Punkt für die Anzahl. "
                          "Elefant hat 3 Silben. Am Zeilenende trennt man aber nur Ele-fant."),
        Schreiben("Trennen am Zeilenende",
                  "Trenne das Wort einmal mit einem Strich.",
                  [("Decke", "De-cke"), ("Tasse", "Tas-se"), ("Fische", "Fi-sche"), ("Kerze", "Ker-ze")],
                  spalten=2, breit=24 * 2.835),
    ]
