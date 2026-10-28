from werkzeug import Merkkasten, Saetze, Schreiben, Tabelle

NR = "16"
TITEL = "Verlängern und Ableiten"
BEREICH = "Rechtschreibung"
LERNZIELE = ["Du findest mit dem Verlängern heraus: d oder t, b oder p, g oder k am Wortende.",
             "Du findest mit dem Ableiten heraus: ä oder e, äu oder eu.",
             "Du wendest die Tricks beim Schreiben an."]

MERK = Merkkasten("Merkkasten: Zwei Tricks", [
    "# Trick 1: Verlängern",
    "Am Wortende hört man d oder t, b oder p, g oder k nicht genau.",
    "Verlängere das Wort. Dann hörst du es:",
    "> Hund → Hunde (d) · Brot → Brote (t) · Korb → Körbe (b) · Zwerg → Zwerge (g)",
    "# Trick 2: Ableiten",
    "Gibt es ein verwandtes Wort mit a oder au? Dann schreibst du ä oder äu.",
    "> Äpfel ← Apfel · Bäume ← Baum · Hände ← Hand",
    "! Kein verwandtes Wort mit a/au? Dann schreibst du e oder eu: Bett, Feuer.",
])

# (Wort mit Lücke, Verlängerung)
VERL_1 = [("Hun{d}", "Hunde"), ("Kor{b}", "Körbe"), ("Ber{g}", "Berge"), ("Bro{t}", "Brote"),
          ("Wal{d}", "Wälder"), ("Zwer{g}", "Zwerge")]
VERL_2 = [("Kin{d}", "Kinder"), ("Die{b}", "Diebe"), ("Ta{g}", "Tage"), ("Han{d}", "Hände"),
          ("Zel{t}", "Zelte"), ("run{d}", "runde"), ("lie{b}", "liebe"), ("Wer{k}", "Werke")]
# (Wort mit Lücke, verwandtes Wort mit a/au oder „–“)
ABL_1 = [("B{äu}me", "Baum"), ("H{ä}nde", "Hand"), ("{Ä}pfel", "Apfel"), ("M{äu}se", "Maus"),
         ("Gl{ä}ser", "Glas"), ("H{äu}ser", "Haus")]
ABL_2 = [("l{ä}nger", "lang"), ("B{e}tt", "–"), ("F{eu}er", "–"), ("tr{ä}umen", "Traum"),
         ("K{ä}lte", "kalt"), ("h{eu}te", "–"), ("w{ä}rmer", "warm"), ("L{äu}fer", "laufen")]


def zeilen(daten, offen_hilfe):
    return [[w, "{" + h + "}" if offen_hilfe else h] for w, h in daten]


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Tabelle("Verlängern",
                    "Verlängere das Wort. Dann hörst du den Buchstaben. Setze ihn in die Lücke.",
                    ["Wort", "verlängert"], zeilen(VERL_1, False),
                    beispiel=["Bil{d}", "Bilder"], woerter=["d", "t", "b", "g"],
                    hilfe="Lies das verlängerte Wort laut. Was hörst du?"),
            Tabelle("Ableiten",
                    "Setze ä oder äu ein. Das verwandte Wort hilft dir.",
                    ["Wort", "verwandtes Wort"], zeilen(ABL_1, False),
                    woerter=["ä", "äu", "Ä"]),
            Saetze("Welcher Buchstabe?",
                   "Kreise den richtigen Buchstaben ein.",
                   ["der Mun<*d|t>\t(die Münder)", "der Zu<*g|k>\t(die Züge)",
                    "das Kal<*b|p>\t(die Kälber)", "das Bro<d|*t>\t(die Brote)"],
                   tab=50 * 2.835, hilfe="Das Wort in Klammern ist schon verlängert."),
        ]
    return [
        MERK,
        Tabelle("Verlängern",
                "Verlängere das Wort. Schreibe den fehlenden Buchstaben ein und das verlängerte Wort daneben.",
                ["Wort", "verlängert"], zeilen(VERL_2, True),
                beispiel=["Bil{d}", "Bilder"]),
        Tabelle("Ableiten",
                "Setze ä, e, äu oder eu ein. Schreibe das verwandte Wort daneben. Gibt es keins, mache einen Strich.",
                ["Wort", "verwandtes Wort"], zeilen(ABL_2, True)),
        Saetze("Fehler-Detektiv",
               "In jedem Satz ist ein Fehler. Streiche das falsche Wort durch. Schreibe es richtig.",
               ["Der [Hunt] bellt laut. → {Hund}",
                "Im [Walt] wohnt ein Fuchs. → {Wald}",
                "Die [Heuser] sind hoch. → {Häuser}",
                "Wir waschen die [Hende]. → {Hände}"],
               mark="durch", min_gap=24 * 2.835, punkte=4),
        Schreiben("Trick erklären",
                  "Erkläre in einem Satz, wie du weisst, dass man „Zwerg“ mit g schreibt.",
                  [("", "Ich verlängere das Wort: Zwerge. Dann höre ich das g.")],
                  spalten=0, linien=2, nummern=False, pro_item=2),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Tabelle("Verlängern",
                    "Verlängere das Wort. Setze den Buchstaben in die Lücke.",
                    ["Wort", "verlängert"], zeilen([("Fel{d}", "Felder"), ("Sie{b}", "Siebe"),
                                                   ("Ta{g}", "Tage")], False),
                    woerter=["d", "b", "g"]),
            Tabelle("Ableiten",
                    "Setze ä oder äu ein. Das verwandte Wort hilft dir.",
                    ["Wort", "verwandtes Wort"],
                    zeilen([("Z{äu}ne", "Zaun"), ("B{ä}lle", "Ball"), ("D{ä}cher", "Dach")], False),
                    woerter=["ä", "äu"]),
        ]
    return [
        Tabelle("Verlängern",
                "Setze den Buchstaben ein und schreibe das verlängerte Wort daneben.",
                ["Wort", "verlängert"], zeilen([("Ran{d}", "Ränder"), ("gel{b}", "gelbe"),
                                               ("Zwei{g}", "Zweige")], True)),
        Tabelle("Ableiten",
                "Setze ä, e, äu oder eu ein. Schreibe das verwandte Wort daneben oder einen Strich.",
                ["Wort", "verwandtes Wort"], zeilen([("S{ä}tze", "Satz"), ("N{e}st", "–"),
                                                    ("R{äu}ber", "rauben"), ("n{eu}", "–")], True)),
        Saetze("Fehler-Detektiv",
               "Streiche das falsche Wort durch. Schreibe es richtig.",
               ["Das [Pferdt] frisst Heu. → {Pferd}", "Die [Beume] sind grün. → {Bäume}"],
               mark="durch", min_gap=24 * 2.835, punkte=2),
    ]
