from werkzeug import Merkkasten, Saetze, Schreiben

NR = "12"
TITEL = "Abc und Wörterbuch"
BEREICH = "Rechtschreibung"
LERNZIELE = ["Du kannst das Abc auswendig.",
             "Du ordnest Wörter nach dem Abc – auch nach dem 2. Buchstaben.",
             "Du findest Wörter schnell im Wörterbuch."]

ABC = "abcdefghijklmnopqrstuvwxyz"

MERK = Merkkasten("Merkkasten: Das Abc", [
    "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z",
    "Im Wörterbuch stehen alle Wörter nach dem Abc geordnet.",
    "# Gleicher erster Buchstabe?",
    "Dann schaust du auf den 2. Buchstaben, dann auf den 3. …",
    "> Ball · Baum · Bein · Blume  (a – a – e – l)",
    "> Ball · Baum: l kommt vor u.",
    "! Umlaute ordnet man wie a, o, u: Äpfel steht bei Apfel.",
])


def abc_key(w):
    """Schlüssel für die Abc-Ordnung (ä wie a, ö wie o, ü wie u, Gross/klein egal)."""
    w = w.lower()
    for a, b in (("ä", "a"), ("ö", "o"), ("ü", "u"), ("ß", "ss")):
        w = w.replace(a, b)
    return w


def ordnen(woerter):
    return ", ".join(sorted(woerter, key=abc_key))


def nachbarn(buchstaben):
    """Lücken für Vorgänger und Nachfolger im Abc, z. B. „{c} d {e}“."""
    out = []
    for b in buchstaben:
        i = ABC.index(b)
        out.append(f"{{{ABC[i - 1]}}}  {b}  {{{ABC[i + 1]}}}")
    return out


def vorher(paare):
    """Auswahl „<*A|B>“: das Wort, das im Wörterbuch zuerst kommt, wird aus dem Abc berechnet."""
    out = []
    for a, b in paare:
        first = min(a, b, key=abc_key)
        out.append("<" + "|".join(("*" if w == first else "") + w for w in (a, b)) + ">")
    return out


LISTEN_1 = [["Hund", "Apfel", "Katze", "Ente"],
            ["Sonne", "Mond", "Baum", "Zug"],
            ["rot", "gelb", "blau", "weiss"]]
LISTEN_2 = [["Banane", "Birne", "Brot", "Beere", "Butter"],
            ["Schaf", "Sonne", "Stein", "Salat", "Suppe"],
            ["Maus", "Mama", "Mantel", "Mai", "Mauer"],
            ["fahren", "fallen", "fangen", "falten", "fassen"]]


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Saetze("Welcher Buchstabe fehlt?",
                   "Schreibe die fehlenden Buchstaben in die Lücken.",
                   nachbarn("dhmrw"), min_gap=8 * 2.835,
                   hilfe="Sag das Abc leise auf."),
            Schreiben("Nach dem Abc ordnen",
                      "Schreibe die Wörter nach dem Abc geordnet auf.",
                      [(", ".join(l), ordnen(l)) for l in LISTEN_1],
                      spalten=0, linien=1, pro_item=1,
                      hilfe="Schau auf den ersten Buchstaben."),
            Saetze("Vorne oder hinten im Wörterbuch?",
                   "Kreise ein: Steht das Wort vorne, in der Mitte oder hinten im Wörterbuch?",
                   ["Affe\t<*vorne|Mitte|hinten>", "Nase\t<vorne|*Mitte|hinten>",
                    "Zebra\t<vorne|Mitte|*hinten>", "Kuh\t<vorne|*Mitte|hinten>",
                    "Brot\t<*vorne|Mitte|hinten>", "Wolke\t<vorne|Mitte|*hinten>"],
                   tab=30 * 2.835,
                   erklaerung="vorne: A–F · Mitte: G–Q · hinten: R–Z"),
        ]
    return [
        MERK,
        Saetze("Vorgänger und Nachfolger",
               "Schreibe den Buchstaben vor und nach dem Buchstaben in der Mitte.",
               nachbarn("fkpux"), min_gap=8 * 2.835),
        Schreiben("Nach dem 2. Buchstaben ordnen",
                  "Alle Wörter beginnen gleich. Ordne sie nach dem 2. (oder 3.) Buchstaben.",
                  [(", ".join(l), ordnen(l)) for l in LISTEN_2],
                  spalten=0, linien=1),
        Saetze("Wer steht vorher?",
                "Kreise das Wort ein, das im Wörterbuch zuerst kommt.",
                vorher([("Tasche", "Tasse"), ("Winter", "Wind"), ("Kerze", "Kern"), ("Insel", "Igel")]),
                erklaerung="Tasche/Tasse: c vor s · Wind/Winter: d vor t · "
                           "Kern/Kerze: n vor z · Igel/Insel: g vor n"),
        Schreiben("Wörterbuch-Detektiv",
                  "Suche die Wörter im Wörterbuch. Schreibe die Seitenzahl auf.",
                  [("Krokodil", ""), ("Gurke", ""), ("Pinsel", ""), ("Vulkan", "")],
                  spalten=2, pro_item=1,
                  erklaerung="Die Seitenzahl hängt vom Wörterbuch ab. Kontrolle durch die Lehrperson."),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Saetze("Welcher Buchstabe fehlt?",
                   "Schreibe die fehlenden Buchstaben in die Lücken.",
                   nachbarn("glt"), min_gap=8 * 2.835),
            Schreiben("Nach dem Abc ordnen",
                      "Schreibe die Wörter nach dem Abc geordnet auf.",
                      [(", ".join(l), ordnen(l)) for l in (["Tiger", "Esel", "Luchs", "Bär"],
                                                           ["Velo", "Auto", "Schiff", "Bus"])],
                      spalten=0, linien=1, pro_item=2,
                      erklaerung="2 Punkte pro Reihe, 1 Punkt bei einem Fehler."),
        ]
    return [
        Saetze("Vorgänger und Nachfolger",
               "Schreibe den Buchstaben vor und nach dem Buchstaben in der Mitte.",
               nachbarn("eis"), min_gap=8 * 2.835),
        Schreiben("Nach dem 2. Buchstaben ordnen",
                  "Ordne die Wörter nach dem Abc.",
                  [(", ".join(l), ordnen(l)) for l in (["Kuh", "Kiste", "Kamel", "Krone", "Keks"],
                                                       ["Hose", "Hand", "Hexe", "Hut", "Himmel"],
                                                       ["Tante", "Tanne", "Tag", "Taxi", "Tafel"])],
                  spalten=0, linien=1, pro_item=2),
        Saetze("Wer steht vorher?",
               "Kreise das Wort ein, das im Wörterbuch zuerst kommt.",
               vorher([("Bach", "Bauch"), ("Rose", "Rock"), ("Hunger", "Hund")])),
    ]
