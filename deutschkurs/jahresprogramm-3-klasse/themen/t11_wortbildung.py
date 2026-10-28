from werkzeug import Merkkasten, Saetze, Schreiben, Sortieren, Tabelle

NR = "11"
TITEL = "Wortfamilien und zusammengesetzte Wörter"
BEREICH = "Grammatik"
LERNZIELE = ["Du setzt zwei Nomen zu einem neuen Nomen zusammen.",
             "Du weisst: Der Begleiter richtet sich nach dem letzten Wort.",
             "Du findest Wörter aus derselben Wortfamilie."]

MERK = Merkkasten("Merkkasten: Wörter bauen", [
    "# Zusammengesetzte Nomen",
    "Aus zwei Wörtern wird ein neues Nomen.",
    "> der Schnee + der Mann = der Schneemann",
    "> das Haus + die Tür = die Haustür",
    "! Der Begleiter richtet sich nach dem letzten Wort.",
    "> das Haus + der Schlüssel = der Hausschlüssel",
    "# Wortfamilien",
    "Wörter mit dem gleichen Wortstamm gehören zu einer Familie.",
    "> fahren · die Fahrt · der Fahrer · das Fahrrad · abfahren",
])

# (Bestimmungswort, Grundwort, zusammengesetztes Wort) – der Begleiter kommt vom Grundwort
ZUSAMMEN = [("der Schnee", "der Ball", "der Schneeball"),
            ("das Haus", "die Tür", "die Haustür"),
            ("der Apfel", "der Baum", "der Apfelbaum"),
            ("die Hand", "der Schuh", "der Handschuh"),
            ("der Fuss", "der Ball", "der Fussball"),
            ("die Schule", "die Tasche", "die Schultasche"),
            ("das Wasser", "die Flasche", "die Wasserflasche"),
            ("der Regen", "der Schirm", "der Regenschirm")]

FAMILIEN = {"spielen": ["der Spieler", "das Spielzeug", "verspielt"],
            "malen": ["der Maler", "die Malerei", "bemalen"],
            "backen": ["der Bäcker", "die Bäckerei", "das Backblech"]}
FAMILIEN_2 = {"fahren": ["der Fahrer", "die Fahrt", "abfahren", "das Fahrrad"],
              "lesen": ["das Lesebuch", "der Leser", "vorlesen", "lesbar"],
              "schreiben": ["die Schrift", "der Schreiber", "abschreiben", "das Schreibheft"]}


def zeilen(ws):
    rows = []
    for a, b, c in ws:
        rows.append([a, b, "{" + c + "}"])
    return rows


def familien_woerter(fam):
    out = []
    for i in range(max(len(v) for v in fam.values())):
        for v in fam.values():
            if i < len(v):
                out.append(v[i])
    return out


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Tabelle("Zwei Wörter – ein Wort",
                    "Setze die zwei Nomen zusammen. Schreibe das neue Nomen mit Begleiter.",
                    ["1. Wort", "2. Wort", "neues Nomen"], zeilen(ZUSAMMEN[2:6]),
                    beispiel=list(ZUSAMMEN[0]),
                    hilfe="Der Begleiter vom 2. Wort ist auch der Begleiter vom neuen Wort."),
            Saetze("Welcher Begleiter?",
                   "Kreise den richtigen Begleiter ein.",
                   ["<der|*die|das> Haustür", "<*der|die|das> Regenschirm",
                    "<der|*die|das> Wasserflasche", "<*der|die|das> Fussball"],
                   erklaerung="die Tür → die Haustür · der Schirm → der Regenschirm"),
            Sortieren("Wortfamilien",
                      "Schreibe jedes Wort in die Spalte seiner Wortfamilie.",
                      familien_woerter(FAMILIEN), FAMILIEN,
                      hilfe="Suche den gleichen Wortteil: spiel, mal, back."),
        ]
    return [
        MERK,
        Tabelle("Zwei Wörter – ein Wort",
                "Setze die zwei Nomen zusammen. Schreibe das neue Nomen mit Begleiter.",
                ["1. Wort", "2. Wort", "neues Nomen"], zeilen(ZUSAMMEN[1:]),
                beispiel=["der Mond", "das Licht", "das Mondlicht"],
                erklaerung="Bei die Schule + die Tasche fällt das e weg: die Schultasche."),
        Schreiben("Wörter zerlegen",
                  "Zerlege das Wort in zwei Nomen. Schreibe beide mit Begleiter.",
                  [("das Vogelnest", "der Vogel + das Nest"), ("die Tischlampe", "der Tisch + die Lampe"),
                   ("der Kinderwagen", "die Kinder + der Wagen"), ("das Zahnrad", "der Zahn + das Rad")],
                  spalten=1, pro_item=2),
        Sortieren("Wortfamilien",
                  "Schreibe jedes Wort in die Spalte seiner Wortfamilie.",
                  familien_woerter(FAMILIEN_2), FAMILIEN_2),
        Schreiben("Eigene Wortfamilie",
                  "Schreibe zu jedem Wort zwei Wörter aus der gleichen Familie.",
                  [("springen:", "der Sprung, der Springbrunnen"), ("singen:", "der Sänger, der Gesang"),
                   ("bauen:", "der Bau, die Baustelle")],
                  spalten=1, pro_item=2,
                  erklaerung="Viele Lösungen sind richtig, z. B. Sprung, Springer, abspringen."),
        Schreiben("Lange Wörter erfinden",
                  "Erfinde aus drei Nomen ein langes Wort. Schreibe es mit Begleiter.",
                  [("Schule + Haus + Tür", "die Schulhaustür"), ("Apfel + Saft + Flasche", "die Apfelsaftflasche")],
                  spalten=1),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Tabelle("Zwei Wörter – ein Wort",
                    "Setze die zwei Nomen zusammen. Schreibe das neue Nomen mit Begleiter.",
                    ["1. Wort", "2. Wort", "neues Nomen"],
                    zeilen([("der Sand", "die Burg", "die Sandburg"), ("das Bett", "die Decke", "die Bettdecke"),
                            ("die Blume", "der Topf", "der Blumentopf")]),
                    beispiel=list(ZUSAMMEN[0])),
            Saetze("Welcher Begleiter?",
                   "Kreise den richtigen Begleiter ein.",
                   ["<der|*die|das> Schultasche", "<*der|die|das> Apfelbaum"]),
            Sortieren("Wortfamilien",
                      "Schreibe die Wörter in die richtige Spalte.",
                      ["der Maler", "der Bäcker", "bemalen", "die Bäckerei"],
                      {"malen": ["der Maler", "bemalen"], "backen": ["der Bäcker", "die Bäckerei"]}),
        ]
    return [
        Tabelle("Zwei Wörter – ein Wort",
                "Setze die zwei Nomen zusammen. Schreibe das neue Nomen mit Begleiter.",
                ["1. Wort", "2. Wort", "neues Nomen"],
                zeilen([("der Winter", "die Jacke", "die Winterjacke"), ("das Auto", "der Reifen", "der Autoreifen"),
                        ("die Erde", "die Beere", "die Erdbeere")])),
        Schreiben("Wörter zerlegen",
                  "Zerlege das Wort in zwei Nomen. Schreibe beide mit Begleiter.",
                  [("der Hundekorb", "der Hund + der Korb"), ("die Gartenbank", "der Garten + die Bank")],
                  spalten=1, pro_item=2),
        Sortieren("Wortfamilien",
                  "Schreibe die Wörter in die richtige Spalte.",
                  ["die Fahrt", "der Leser", "abfahren", "vorlesen", "der Fahrer", "das Lesebuch"],
                  {"fahren": ["die Fahrt", "abfahren", "der Fahrer"],
                   "lesen": ["der Leser", "vorlesen", "das Lesebuch"]}),
    ]
