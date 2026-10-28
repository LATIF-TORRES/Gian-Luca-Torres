from werkzeug import Merkkasten, Saetze, Schreiben, Sortieren

NR = "15"
TITEL = "Lange Selbstlaute: ie, h, aa, ee, oo"
BEREICH = "Rechtschreibung"
LERNZIELE = ["Du schreibst ein langes i meistens als ie.",
             "Du kennst Wörter mit h nach langem Selbstlaut: Kuh, fahren.",
             "Du kennst Wörter mit doppeltem Selbstlaut: Boot, Meer, Haar."]

MERK = Merkkasten("Merkkasten: Lang gesprochen", [
    "# Langes i → meistens ie",
    "> Biene · Brief · Tier · lieb · spielen",
    "Kurzes i → nur i:  Kind · Fisch · Bild",
    "! Ausnahmen merken: Igel, Tiger, Kino, mir, dir, wir",
    "# Dehnungs-h",
    "Manchmal zeigt ein h, dass der Selbstlaut lang ist. Man hört das h nicht.",
    "> Kuh · Zahn · fahren · Uhr · Ohr · Huhn",
    "# Doppelter Selbstlaut",
    "> aa: Haar, Saal · ee: Meer, Tee, Schnee · oo: Boot, Zoo, Moos",
])

IE_I_1 = [("B{ie}ne", "ie"), ("K{i}nd", "i"), ("T{ie}r", "ie"), ("F{i}sch", "i"),
          ("Br{ie}f", "ie"), ("B{i}ld", "i"), ("sp{ie}len", "ie"), ("L{ie}d", "ie")]
IE_I_2 = ["W{ie}se", "R{i}ng", "F{ie}ber", "Z{ie}ge", "Z{i}mmer", "fl{ie}gen", "Sp{ie}gel", "w{i}ld",
          "D{ie}b", "T{i}nte"]


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Saetze("ie oder i?",
                   "Sprich das Wort langsam. Setze ie oder i ein.",
                   [w for w, _ in IE_I_1], woerter=["ie", "i"],
                   hilfe="Hörst du ein langes i? Dann schreibe ie."),
            Saetze("Wörter mit h",
                   "Setze das h ein. Man hört es nicht, aber man schreibt es.",
                   ["Ku{h}", "Za{h}n", "U{h}r", "O{h}r", "fa{h}ren", "Hu{h}n"],
                   woerter=["h"]),
            Saetze("aa, ee oder oo?",
                   "Setze aa, ee oder oo ein.",
                   ["B{oo}t", "M{ee}r", "H{aa}r", "T{ee}", "Z{oo}", "Schn{ee}"],
                   woerter=["aa", "ee", "oo"]),
            Schreiben("Merkwörter",
                      "Schreibe jedes Wort zweimal ab. Sprich dabei leise mit.",
                      [("Biene", "Biene  Biene"), ("Zahn", "Zahn  Zahn"), ("Boot", "Boot  Boot")],
                      spalten=1),
        ]
    return [
        MERK,
        Saetze("ie oder i?",
               "Setze ie oder i ein.",
               IE_I_2, erklaerung="Langes i → ie. Kurzes i (Ring, Zimmer, wild, Tinte) → i."),
        Sortieren("Wörtersammlung",
                  "Schreibe die Wörter in die richtige Spalte.",
                  ["Mehl", "Zoo", "Bier", "Sohn", "Fee", "Riese", "Saal", "Stuhl", "Knie"],
                  {"ie": ["Bier", "Riese", "Knie"], "h": ["Mehl", "Sohn", "Stuhl"],
                   "aa / ee / oo": ["Zoo", "Fee", "Saal"]}),
        Saetze("Fehler-Detektiv",
               "In jedem Satz ist ein Wort falsch geschrieben. Streiche es durch. Schreibe es richtig auf die Linie.",
               ["Die [Bine] fliegt zur Blume. → {Biene}",
                "Wir [faren] mit dem Zug. → {fahren}",
                "Das [Bot] schaukelt auf dem See. → {Boot}",
                "Ich habe ein [Tir] gesehen. → {Tier}"],
               mark="durch", min_gap=24 * 2.835, punkte=4),
        Schreiben("Sätze mit Merkwörtern",
                  "Schreibe mit jedem Wort einen Satz.",
                  [("spielen:", "Wir spielen im Garten."), ("Uhr:", "Die Uhr zeigt acht Uhr."),
                   ("Schnee:", "Im Winter liegt viel Schnee.")],
                  spalten=1),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Saetze("ie oder i?",
                   "Setze ie oder i ein.",
                   ["T{ie}r", "K{i}nd", "Br{ie}f", "B{i}ld"], woerter=["ie", "i"]),
            Saetze("Wörter mit h",
                   "Setze das h ein.",
                   ["Ku{h}", "U{h}r", "Za{h}n"], woerter=["h"]),
            Saetze("aa, ee oder oo?",
                   "Setze aa, ee oder oo ein.",
                   ["B{oo}t", "T{ee}", "H{aa}r"], woerter=["aa", "ee", "oo"]),
        ]
    return [
        Saetze("ie oder i?",
               "Setze ie oder i ein.",
               ["L{ie}be", "F{i}nger", "sch{ie}f", "W{i}nd", "R{ie}se", "St{i}ft"]),
        Sortieren("Wörtersammlung",
                  "Schreibe die Wörter in die richtige Spalte.",
                  ["Sieb", "Bahn", "Meer", "Dieb", "Ohr", "Moos"],
                  {"ie": ["Sieb", "Dieb"], "h": ["Bahn", "Ohr"], "aa / ee / oo": ["Meer", "Moos"]}),
        Saetze("Fehler-Detektiv",
               "Streiche das falsche Wort durch. Schreibe es richtig auf die Linie.",
               ["Der [Zan] wackelt. → {Zahn}", "Wir [spilen] Fussball. → {spielen}"],
               mark="durch", min_gap=24 * 2.835, punkte=2),
    ]
