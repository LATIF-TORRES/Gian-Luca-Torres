from werkzeug import Merkkasten, Saetze, Schreiben, Sortieren, Tabelle

NR = "03"
TITEL = "Verben"
BEREICH = "Grammatik"
LERNZIELE = ["Du erkennst Verben (Tunwörter).",
             "Du kennst die Grundform eines Verbs.",
             "Du passt das Verb an die Person an (ich spiele, du spielst …)."]

MERK = Merkkasten("Merkkasten: Verben (Tunwörter)", [
    "Verben sagen, was jemand tut oder was passiert.",
    "> rennen · lachen · schlafen · regnen",
    "! Verben schreibt man klein.",
    "Trick: ich, du oder er passt davor (ich renne, du lachst).",
    "",
    "# Grundform und Personalform",
    "Die Grundform endet auf -en oder -n: spielen, lachen, wandern.",
    "Im Satz verändert sich das Verb. Es passt sich der Person an:",
    "> ich spiele · du spielst · er/sie/es spielt",
    "> wir spielen · ihr spielt · sie spielen",
])

PERSONEN = ["ich", "du", "er/sie/es", "wir", "ihr", "sie"]
ENDUNGEN = ["e", "st", "t", "en", "t", "en"]


def formen(stamm):
    """Regelmässige Personalformen aus dem Wortstamm berechnen."""
    out = []
    for e in ENDUNGEN:
        # Stamm auf -t/-d: du arbeitest, er arbeitet
        if stamm[-1] in "td" and e in ("st", "t"):
            e = "e" + e
        out.append(stamm + e)
    return out


def konjugation(stamm, luecken):
    rows = []
    for k, (p, f) in enumerate(zip(PERSONEN, formen(stamm))):
        rows.append([p, "{" + f + "}" if k in luecken else f])
    return rows


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Saetze("Verben finden",
                   "Unterstreiche in jedem Satz das Verb.",
                   ["Der Hund [bellt].", "Die Kinder [lachen].", "Ich [male] ein Bild.",
                    "Mia [isst] einen Apfel.", "Wir [schwimmen] im See.", "Der Vogel [singt]."],
                   hilfe="Frage: Was tut jemand?"),
            Sortieren("Verb oder Nomen?",
                      "Schreibe die Verben in die linke Spalte. Schreibe die Nomen mit Begleiter in die rechte Spalte.",
                      ["laufen", "Hund", "lesen", "Tisch", "singen", "Baum", "kochen", "Katze"],
                      {"Verben": ["laufen", "lesen", "singen", "kochen"],
                       "Nomen mit Begleiter": ["der Hund", "der Tisch", "der Baum", "die Katze"]}),
            Tabelle("Das Verb spielen",
                    "Ergänze die Formen von spielen.",
                    ["Person", "spielen"], konjugation("spiel", {1, 2, 3, 4, 5})[1:],
                    beispiel=["ich", "spiele"], breiten=[1, 2],
                    hilfe="Die Endungen sind: -e, -st, -t, -en, -t, -en."),
            Saetze("Welche Endung passt?",
                   "Schreibe die richtige Endung in die Lücke.",
                   ["ich mal{e}", "du mal{st}", "er mal{t}", "wir mal{en}", "ihr mal{t}", "sie mal{en}"],
                   woerter=["e", "st", "t", "en"]),
            Schreiben("Was tun die Tiere?",
                      "Schreibe zu jedem Tier ein passendes Verb.",
                      [("Der Hund …", "bellt"), ("Die Katze …", "miaut"), ("Der Fisch …", "schwimmt"),
                       ("Die Kuh …", "muht"), ("Der Vogel …", "fliegt"), ("Das Pferd …", "galoppiert")],
                      spalten=2, erklaerung="Viele Verben passen, z. B. Der Hund rennt / bellt / schläft."),
        ]
    return [
        MERK,
        Saetze("Verben finden",
               "Unterstreiche alle Verben. Es sind #N.",
               ["Am Samstag [stehe] ich früh auf.",
                "Ich [ziehe] mich an und [esse] ein Müesli.",
                "Dann [fahre] ich mit dem Velo zu Oma.",
                "Oma [backt] einen Kuchen und ich [helfe] ihr.",
                "Wir [rühren] den Teig und [warten].",
                "Der Kuchen [riecht] fein."],
               erklaerung="„stehe … auf“ ist ein Verb (aufstehen); unterstrichen wird „stehe“."),
        Tabelle("Verben in allen Personen",
                "Fülle die Tabelle aus.",
                ["Person", "lachen", "arbeiten", "rennen"],
                [[p, "{" + a + "}", "{" + b + "}", "{" + c_ + "}"]
                 for p, a, b, c_ in zip(PERSONEN[1:], formen("lach")[1:], formen("arbeit")[1:],
                                        formen("renn")[1:])],
                beispiel=["ich", "lache", "arbeite", "renne"], breiten=[1.2, 1, 1, 1],
                erklaerung="Bei arbeiten kommt ein e dazu: du arbeitest, er arbeitet, ihr arbeitet."),
        Saetze("Das Verb passt sich an",
               "Setze das Verb in der richtigen Form ein.",
               ["Lina {spielt|spielen} Fussball.",
                "Wir {wohnen|wohnen} in Bern.",
                "Du {kaufst|kaufen} ein Brot.",
                "Ihr {hört|hören} Musik.",
                "Die Kinder {basteln|basteln} eine Laterne.",
                "Ich {suche|suchen} meinen Schuh."],
               min_gap=24 * 2.835),
        Schreiben("Grundform finden",
                  "Schreibe die Grundform des Verbs auf.",
                  [("er schreibt", "schreiben"), ("du trinkst", "trinken"), ("wir bauen", "bauen"),
                   ("sie tanzt", "tanzen"), ("ihr lernt", "lernen"), ("ich klettere", "klettern")],
                  spalten=2, beispiel=("du kommst", "kommen"), breit=26 * 2.835),
        Schreiben("Sätze mit Verben",
                  "Schreibe zu jedem Verb einen ganzen Satz.",
                  [("schwimmen:", "Im Sommer schwimme ich im See."),
                   ("lesen:", "Meine Schwester liest ein Buch."),
                   ("klettern:", "Der Affe klettert auf den Baum.")],
                  spalten=1, erklaerung="Viele Sätze sind richtig. Das Verb muss zur Person passen."),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Saetze("Verben finden",
                   "Unterstreiche in jedem Satz das Verb.",
                   ["Die Katze [schläft].", "Ich [trinke] Tee.", "Der Ball [rollt].", "Wir [tanzen]."]),
            Sortieren("Verb oder Nomen?",
                      "Schreibe die Verben in die linke Spalte. Schreibe die Nomen mit Begleiter in die rechte Spalte.",
                      ["springen", "Haus", "malen", "Sonne"],
                      {"Verben": ["springen", "malen"], "Nomen mit Begleiter": ["das Haus", "die Sonne"]}),
            Tabelle("Das Verb kochen",
                    "Ergänze die Formen von kochen.",
                    ["Person", "kochen"], konjugation("koch", {1, 2, 3, 4, 5})[1:],
                    beispiel=["ich", "koche"], breiten=[1, 2]),
        ]
    return [
        Saetze("Verben finden",
               "Unterstreiche alle Verben. Es sind #N.",
               ["Tim [wacht] auf und [gähnt].",
                "Er [putzt] die Zähne.",
                "Dann [packt] er seine Tasche und [läuft] zur Schule.",
                "Dort [wartet] schon seine Freundin."]),
        Tabelle("Verben in allen Personen",
                "Fülle die Tabelle aus.",
                ["Person", "fragen", "finden"],
                [[p, "{" + a + "}", "{" + b + "}"]
                 for p, a, b in zip(PERSONEN[1:], formen("frag")[1:], formen("find")[1:])],
                beispiel=["ich", "frage", "finde"], breiten=[1.2, 1, 1]),
        Saetze("Das Verb passt sich an",
               "Setze das Verb in der richtigen Form ein.",
               ["Du {malst|malen} ein Bild.",
                "Papa {kocht|kochen} Spaghetti.",
                "Ihr {singt|singen} ein Lied.",
                "Wir {lernen|lernen} Deutsch."],
               min_gap=22 * 2.835),
        Schreiben("Grundform finden",
                  "Schreibe die Grundform des Verbs auf.",
                  [("sie lacht", "lachen"), ("du rufst", "rufen"), ("er baut", "bauen"), ("ihr holt", "holen")],
                  spalten=2, breit=24 * 2.835),
    ]
