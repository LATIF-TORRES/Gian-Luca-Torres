from werkzeug import Merkkasten, Saetze, Schreiben, Sortieren

NR = "14"
TITEL = "Doppelte Mitlaute, ck und tz"
BEREICH = "Rechtschreibung"
LERNZIELE = ["Du hörst, ob ein Selbstlaut kurz oder lang ist.",
             "Nach einem kurzen Selbstlaut schreibst du oft zwei Mitlaute: Sonne, Teller.",
             "Du schreibst ck und tz richtig: Zucker, Katze."]

MERK = Merkkasten("Merkkasten: Kurz gesprochen – doppelt geschrieben", [
    "Sprich das Wort langsam. Ist der Selbstlaut (a, e, i, o, u) kurz oder lang?",
    "> kurz: Kamm, Sonne  ·  lang: Name, Rose",
    "Nach einem kurzen Selbstlaut hörst du oft nur einen Mitlaut – du schreibst aber zwei:",
    "> ll, mm, nn, ss, tt, ff, pp, rr:  Ball, Kamm, Sonne, Tasse, Bett, Schiff",
    "! Statt kk schreibt man ck: Zucker, Rock.  Statt zz schreibt man tz: Katze, Platz.",
    "Kurzer Selbstlaut + zwei verschiedene Mitlaute: kein Doppel: Hund, Kind, Lampe.",
])

# Wort mit Lücke; in den geschweiften Klammern steht die Lösung
DOPPEL_1 = ["Ba{ll}", "So{nn}e", "Ta{ss}e", "Be{tt}", "Ka{mm}", "Schi{ff}", "Te{ll}er", "Pu{pp}e"]
DOPPEL_2 = ["Mu{tt}er", "Ki{ss}en", "Ho{ff}nung", "Kla{pp}e", "Sche{rr}e", "Wo{ll}e",
            "Schwi{mm}bad", "Spi{nn}e", "Ro{ll}er"]
CK_TZ_1 = ["Zu{ck}er", "Ka{tz}e", "Ro{ck}", "Pla{tz}", "Ja{ck}e", "Mü{tz}e"]
CK_TZ_2 = ["Bä{ck}er", "Hi{tz}e", "Schne{ck}e", "Spi{tz}e", "Brü{ck}e", "Wi{tz}", "Glo{ck}e", "Pfü{tz}e"]


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Saetze("Kurz oder lang?",
                   "Sprich das Wort langsam. Kreise ein: Ist der Selbstlaut kurz oder lang?",
                   ["Hund\t<*kurz|lang>", "Hase\t<kurz|*lang>", "Kamm\t<*kurz|lang>",
                    "Rose\t<kurz|*lang>", "Bett\t<*kurz|lang>", "Name\t<kurz|*lang>"],
                   tab=30 * 2.835, hilfe="Ein kurzer Selbstlaut klingt wie ein schneller Klatsch."),
            Saetze("Doppelte Mitlaute",
                   "Setze den doppelten Mitlaut ein.",
                   DOPPEL_1, woerter=["ll", "nn", "ss", "tt", "mm", "ff", "pp"]),
            Saetze("ck oder tz?",
                   "Setze ck oder tz ein.",
                   CK_TZ_1, woerter=["ck", "tz"]),
            Schreiben("Abschreiben und merken",
                      "Schreibe jedes Wort zweimal ab. Sprich dabei leise mit.",
                      [("Sonne", "Sonne  Sonne"), ("Zucker", "Zucker  Zucker"), ("Katze", "Katze  Katze")],
                      spalten=1),
        ]
    return [
        MERK,
        Sortieren("Kurz oder lang?",
                  "Sprich die Wörter langsam. Schreibe sie in die richtige Spalte.",
                  ["Sonne", "Hose", "Fell", "Rabe", "Kanne", "Tal", "Mitte", "Ofen"],
                  {"kurzer Selbstlaut": ["Sonne", "Fell", "Kanne", "Mitte"],
                   "langer Selbstlaut": ["Hose", "Rabe", "Tal", "Ofen"]}),
        Saetze("Doppelte Mitlaute",
               "Setze den doppelten Mitlaut ein.",
               DOPPEL_2),
        Saetze("ck oder tz?",
               "Setze ck oder tz ein.",
               CK_TZ_2),
        Saetze("Doppelt oder nicht?",
               "Finde in jeder Reihe das falsch geschriebene Wort. Streiche es durch. Schreibe es richtig auf die Linie.",
               ["Hund · [Kinnd] · Lampe → {Kind}",
                "Teller · [Kaze] · Puppe → {Katze}",
                "Rock · [Zuker] · Jacke → {Zucker}",
                "Wolle · Sonne · [Rosse] → {Rose}"],
               mark="durch", min_gap=24 * 2.835, punkte=4,
               erklaerung="Kind: zwei verschiedene Mitlaute (n, d) – kein Doppel. Rose: langes o – kein Doppel."),
        Schreiben("Reimwörter",
                  "Finde ein Reimwort, das am Ende gleich geschrieben wird.",
                  [("Katze", "Tatze / Matratze"), ("Ball", "Stall / Knall"), ("Socke", "Glocke / Locke"),
                   ("Wanne", "Kanne / Tanne")],
                  spalten=2, breit=22 * 2.835),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Saetze("Kurz oder lang?",
                   "Kreise ein: Ist der Selbstlaut kurz oder lang?",
                   ["Sonne\t<*kurz|lang>", "Nase\t<kurz|*lang>", "Tasse\t<*kurz|lang>"],
                   tab=30 * 2.835),
            Saetze("Doppelte Mitlaute",
                   "Setze den doppelten Mitlaut ein.",
                   ["Mu{tt}er", "Wo{ll}e", "Ka{nn}e", "Ri{ff}"], woerter=["tt", "ll", "nn", "ff"]),
            Saetze("ck oder tz?",
                   "Setze ck oder tz ein.",
                   ["Bä{ck}er", "Spi{tz}e", "So{ck}e", "Ta{tz}e"], woerter=["ck", "tz"]),
        ]
    return [
        Sortieren("Kurz oder lang?",
                  "Schreibe die Wörter in die richtige Spalte.",
                  ["Mann", "Hut", "Rose", "Hütte", "Schiff", "Igel"],
                  {"kurzer Selbstlaut": ["Mann", "Hütte", "Schiff"], "langer Selbstlaut": ["Hut", "Rose", "Igel"]}),
        Saetze("Doppelte Mitlaute",
               "Setze den doppelten Mitlaut ein.",
               ["Ki{ss}en", "Su{pp}e", "Bri{ll}e", "Wa{ss}er"]),
        Saetze("ck oder tz?",
               "Setze ck oder tz ein.",
               ["Schne{ck}e", "Pfü{tz}e", "Lü{ck}e", "Ka{tz}e"]),
        Saetze("Doppelt oder nicht?",
               "Finde in jeder Reihe das falsch geschriebene Wort. Streiche es durch. Schreibe es richtig.",
               ["Lampe · [Bet] · Ball → {Bett}", "Tasse · [Haase] · Kamm → {Hase}"],
               mark="durch", min_gap=24 * 2.835, punkte=2),
    ]
