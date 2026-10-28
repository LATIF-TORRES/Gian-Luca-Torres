from werkzeug import Merkkasten, Saetze, Schreiben, Sortieren, Tabelle

NR = "02"
TITEL = "Begleiter: der, die, das"
BEREICH = "Grammatik"
LERNZIELE = ["Du setzt den richtigen Begleiter (Artikel) vor ein Nomen.",
             "Du kennst bestimmte (der, die, das) und unbestimmte (ein, eine) Begleiter.",
             "Du weisst: In der Mehrzahl heisst der Begleiter die."]

MERK = Merkkasten("Merkkasten: Begleiter (Artikel)", [
    "Vor einem Nomen steht oft ein Begleiter. Man nennt ihn auch Artikel.",
    "# Bestimmte Begleiter: der, die, das",
    "> der Hund · die Katze · das Pferd",
    "# Unbestimmte Begleiter: ein, eine",
    "> ein Hund · eine Katze · ein Pferd",
    "Mehrzahl: Der Begleiter heisst immer die.",
    "> der Hund → die Hunde · das Pferd → die Pferde",
    "! Lerne jedes Nomen immer mit seinem Begleiter.",
])

# Nomen mit Begleiter: daraus werden Aufgaben und Lösungen gebaut
GRUPPEN_1 = {"der": ["Tisch", "Ball", "Mond", "Fisch"],
             "die": ["Sonne", "Tasche", "Blume", "Uhr"],
             "das": ["Auto", "Bett", "Ei", "Haus"]}
GRUPPEN_2 = {"der": ["Löffel", "Schrank", "Regen", "Käse", "Rucksack"],
             "die": ["Gabel", "Brille", "Wolke", "Treppe", "Jacke"],
             "das": ["Messer", "Fenster", "Brot", "Kissen", "Velo"]}


def mischen(gruppen):
    """Wörter reihum aus den Gruppen ziehen, damit sie gemischt erscheinen."""
    lists = list(gruppen.values())
    out = []
    for i in range(max(len(v) for v in lists)):
        for k, v in enumerate(lists):
            j = (i + k) % len(lists)
            if i < len(lists[j]) and lists[j][i] not in out:
                out.append(lists[j][i])
    return out


def sortieren(gruppen, titel, anweisung):
    return Sortieren(titel, anweisung, mischen(gruppen),
                     {a: [f"{a} {w}" for w in gruppen[a]] for a in ("der", "die", "das")})


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            sortieren(GRUPPEN_1, "der, die oder das?",
                      "Schreibe jedes Nomen mit Begleiter in die richtige Spalte."),
            Saetze("Den Begleiter einkreisen",
                   "Kreise den richtigen Begleiter ein.",
                   ["<*der|die|das> Löwe", "<der|*die|das> Maus", "<der|die|*das> Schaf",
                    "<*der|die|das> Hut", "<der|*die|das> Puppe", "<der|die|*das> Buch"],
                   hilfe="Sprich leise: der Löwe, die Löwe, das Löwe. Was klingt richtig?"),
            Saetze("ein oder eine?",
                   "Schreibe ein oder eine in die Lücke.",
                   ["Ich sehe {eine} Katze.", "Ich sehe {ein} Pferd.", "Ich sehe {ein} Schaf.",
                    "Mama kauft {eine} Banane.", "Papa liest {ein} Buch."],
                   woerter=["ein", "eine"],
                   erklaerung="die → eine (die Katze → eine Katze). der und das → ein."),
            Schreiben("Mehrzahl: immer die",
                      "Schreibe die Mehrzahl mit dem Begleiter die.",
                      [("der Stuhl", "die Stühle"), ("das Bild", "die Bilder"),
                       ("die Lampe", "die Lampen"), ("der Schuh", "die Schuhe")],
                      spalten=2, beispiel=("das Ei", "die Eier"), breit=26 * 2.835),
        ]
    return [
        MERK,
        sortieren(GRUPPEN_2, "der, die oder das?",
                  "Schreibe jedes Nomen mit Begleiter in die richtige Spalte."),
        Tabelle("Bestimmt und unbestimmt",
                "Fülle die Tabelle aus.",
                ["bestimmter Begleiter", "unbestimmter Begleiter", "Mehrzahl"],
                [["der Igel", "{ein Igel}", "{die Igel}"],
                 ["{die Ente}", "eine Ente", "{die Enten}"],
                 ["das Zelt", "{ein Zelt}", "{die Zelte}"],
                 ["{der Zug}", "ein Zug", "{die Züge}"],
                 ["die Nacht", "{eine Nacht}", "{die Nächte}"]],
                beispiel=["der Hund", "ein Hund", "die Hunde"]),
        Saetze("Begleiter im Text",
               "Setze der, die, das, ein oder eine ein.",
               ["Gestern hat {ein} Vogel in unserem Garten gesungen.",
                "{Der} Vogel war klein und braun.",
                "Es war {ein} Spatz.",
                "Dann kam {eine} Katze.",
                "{Die} Katze wollte den Vogel fangen.",
                "Aber {der} Vogel flog schnell weg."],
               min_gap=16 * 2.835,
               erklaerung="Zuerst ein/eine (neu im Text), dann der/die/das (schon bekannt)."),
        Saetze("Wörter mit zwei Bedeutungen",
               "Setze den richtigen Begleiter ein. Schau auf die Bedeutung.",
               ["{Der} See ist kalt. Wir baden darin.",
                "{Die} See ist das Meer.",
                "{Der} Leiter von der Schule heisst Herr Huber.",
                "{Die} Leiter steht am Baum."],
               erklaerung="der See (Bergsee) · die See (Meer) · der Leiter (Chef) · die Leiter (zum Klettern)"),
    ]


def test(stufe):
    if stufe == 1:
        return [
            sortieren({"der": ["Hase", "Turm"], "die": ["Kuh", "Nase"], "das": ["Schiff", "Glas"]},
                      "der, die oder das?",
                      "Schreibe jedes Nomen mit Begleiter in die richtige Spalte."),
            Saetze("Den Begleiter einkreisen",
                   "Kreise den richtigen Begleiter ein.",
                   ["<der|*die|das> Tür", "<*der|die|das> Wurm", "<der|die|*das> Bein", "<der|*die|das> Hose"]),
            Saetze("ein oder eine?",
                   "Schreibe ein oder eine in die Lücke.",
                   ["Das ist {ein} Haus.", "Das ist {eine} Biene.", "Das ist {ein} Baum.", "Das ist {eine} Tasse."],
                   woerter=["ein", "eine"]),
            Schreiben("Mehrzahl: immer die",
                      "Schreibe die Mehrzahl mit dem Begleiter die.",
                      [("der Stern", "die Sterne"), ("das Kleid", "die Kleider")],
                      spalten=2, breit=26 * 2.835),
        ]
    return [
        sortieren({"der": ["Teppich", "Pinsel", "Kamm"], "die": ["Kerze", "Mauer", "Schere"],
                   "das": ["Sofa", "Zimmer", "Seil"]},
                  "der, die oder das?",
                  "Schreibe jedes Nomen mit Begleiter in die richtige Spalte."),
        Tabelle("Bestimmt, unbestimmt, Mehrzahl",
                "Fülle die Tabelle aus.",
                ["bestimmter Begleiter", "unbestimmter Begleiter", "Mehrzahl"],
                [["der Kuchen", "{ein Kuchen}", "{die Kuchen}"],
                 ["{die Gans}", "eine Gans", "{die Gänse}"],
                 ["das Rad", "{ein Rad}", "{die Räder}"]]),
        Saetze("Begleiter im Text",
               "Setze der, die, das, ein oder eine ein.",
               ["Im Wald steht {ein} altes Haus.",
                "{Das} Haus ist alt und dunkel.",
                "Dort wohnt {eine} Hexe.",
                "{Die} Hexe hat {eine} schwarze Katze.",
                "{Die} Katze heisst Mimi."],
               min_gap=16 * 2.835,
               erklaerung="Zuerst ein/eine (neu im Text), dann der/die/das (schon bekannt)."),
    ]
