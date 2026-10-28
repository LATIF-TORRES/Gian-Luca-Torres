from werkzeug import Merkkasten, Saetze, Schreiben

NR = "09"
TITEL = "Das Komma"
BEREICH = "Grammatik"
LERNZIELE = ["Du setzt Kommas bei Aufzählungen.",
             "Du weisst: Vor „und“ und „oder“ steht in einer Aufzählung kein Komma.",
             "Du setzt ein Komma vor aber, weil und dass."]

MERK = Merkkasten("Merkkasten: Das Komma  ,", [
    "# Aufzählung",
    "Zählt man mehrere Dinge auf, trennt man sie mit einem Komma.",
    "> Ich kaufe Brot, Milch, Käse und Eier.",
    "! Vor „und“ und „oder“ steht kein Komma.",
    "# Komma vor aber, weil und dass",
    "> Ich möchte spielen, aber ich muss lernen.",
    "> Ich bleibe zu Hause, weil ich krank bin.",
    "> Ich weiss, dass du kommst.",
])

AUFZ_1 = [("Im Korb sind Äpfel", ["Birnen", "Bananen"], "und", "Kirschen"),
          ("Ich mag rot", ["blau"], "und", "grün"),
          ("Wir brauchen Papier", ["Schere", "Leim"], "und", "Farben"),
          ("Lea hat einen Hund", ["eine Katze"], "und", "einen Hasen")]
AUFZ_2 = [("Am Morgen wasche ich mich", ["putze die Zähne", "ziehe mich an"], "und", "frühstücke"),
          ("Im Zoo sehen wir Affen", ["Löwen", "Zebras", "Giraffen"], "und", "Pinguine"),
          ("Möchtest du Saft", ["Wasser"], "oder", "Tee"),
          ("Zum Geburtstag wünsche ich mir ein Buch", ["ein Spiel"], "oder", "einen Ball")]


def aufzaehlung(rows, leer_vor_und=False):
    """Aufzählungen mit Komma-Lücken direkt hinter jedem Glied.

    leer_vor_und: auch vor und/oder eine Lücke, die leer bleiben muss.
    """
    out = []
    for start, mitte, und, ende in rows:
        s = start + "{,}"
        for k, m in enumerate(mitte):
            s += " " + m + ("{,}" if k < len(mitte) - 1 else "")
        out.append(s + ("{ }" if leer_vor_und else "") + f" {und} {ende}" + ("?" if start.startswith("Möchtest") else "."))
    return out


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Saetze("Kommas in Aufzählungen",
                   "Setze die fehlenden Kommas in die Lücken.",
                   aufzaehlung(AUFZ_1), hilfe="Vor „und“ steht kein Komma."),
            Schreiben("Mein Znüni",
                      "Schreibe einen Satz mit einer Aufzählung: Was ist in deiner Znünibox?",
                      [("In meiner Znünibox sind …", "In meiner Znünibox sind ein Brot, ein Apfel und Nüsse.")],
                      spalten=0, linien=2, nummern=False, pro_item=2,
                      erklaerung="Kommas zwischen den Dingen, vor „und“ kein Komma."),
            Saetze("aber oder weil?",
                   "Schreibe aber oder weil in die Lücke. Das Komma ist schon da.",
                   ["Ich gehe ins Bett, {weil} ich müde bin.",
                    "Ich möchte Eis, {aber} ich habe kein Geld.",
                    "Tom lacht, {weil} der Clown lustig ist."],
                   woerter=["aber", "weil"], min_gap=16 * 2.835),
        ]
    return [
        MERK,
        Saetze("Kommas in Aufzählungen",
               "Setze die fehlenden Kommas. Achtung: Nicht in jede Lücke kommt ein Komma.",
               aufzaehlung(AUFZ_2, leer_vor_und=True),
               erklaerung="Vor und/oder steht kein Komma."),
        Schreiben("Komma vor aber, weil, dass",
                  "Verbinde die zwei Sätze mit dem Wort in Klammern. Setze das Komma.",
                  [("Ich will raus. Es regnet. (aber)", "Ich will raus, aber es regnet."),
                   ("Mia ist froh. Sie hat Ferien. (weil)", "Mia ist froh, weil sie Ferien hat."),
                   ("Ich hoffe es. Du kommst. (dass)", "Ich hoffe, dass du kommst.")],
                  spalten=0, linien=1, pro_item=2,
                  erklaerung="Bei weil und dass rückt das Verb ans Ende: weil sie Ferien hat."),
        Saetze("Komma oder nicht?",
               "Setze ein Komma, wo eines fehlt. Wo keines hingehört, bleibt die Lücke leer.",
               ["Ich lese{,} weil ich Bücher mag.",
                "Wir essen Pizza{ } und trinken Saft.",
                "Ich weiss{,} dass du recht hast.",
                "Der Hund ist alt{,} aber er rennt noch schnell.",
                "Kommst du mit{ } oder bleibst du hier?"],
               erklaerung="Vor und/oder steht kein Komma. Vor weil, dass, aber steht ein Komma.",
               punkte=5),
        Schreiben("Meine Lieblingsdinge",
                  "Schreibe zu jedem Thema einen Satz mit einer Aufzählung von mindestens drei Dingen.",
                  [("Lieblingsessen:", "Ich esse gern Pizza, Spaghetti und Pommes."),
                   ("Hobbys:", "Ich spiele Fussball, schwimme und lese gern.")],
                  spalten=1, pro_item=2),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Saetze("Kommas in Aufzählungen",
                   "Setze die fehlenden Kommas in die Lücken.",
                   aufzaehlung([("Ich habe einen Stift", ["ein Heft"], "und", "ein Buch"),
                                ("Im Garten wachsen Rosen", ["Tulpen", "Nelken"], "und", "Lilien")])),
            Saetze("aber oder weil?",
                   "Schreibe aber oder weil in die Lücke.",
                   ["Ich ziehe eine Jacke an, {weil} es kalt ist.",
                    "Der Kuchen ist fein, {aber} er ist sehr süss."],
                   woerter=["aber", "weil"], min_gap=16 * 2.835),
        ]
    return [
        Saetze("Kommas in Aufzählungen",
               "Setze die fehlenden Kommas.",
               aufzaehlung([("Wir packen Zelt", ["Schlafsack", "Taschenlampe"], "und", "Essen"),
                            ("Im Herbst sind die Blätter gelb", ["orange"], "oder", "rot")])),
        Schreiben("Komma vor aber, weil, dass",
                  "Verbinde die zwei Sätze mit dem Wort in Klammern. Setze das Komma.",
                  [("Ich lache. Der Film ist lustig. (weil)", "Ich lache, weil der Film lustig ist."),
                   ("Ich weiss es. Du hast Geburtstag. (dass)", "Ich weiss, dass du Geburtstag hast.")],
                  spalten=0, linien=1, pro_item=2),
        Saetze("Komma oder nicht?",
               "Setze ein Komma, wo eines fehlt. Wo keines hingehört, bleibt die Lücke leer.",
               ["Ich bin müde{,} aber ich kann nicht schlafen.", "Lea singt{ } und Tim tanzt.",
                "Wir bleiben drinnen{,} weil es stürmt."], punkte=3),
    ]
