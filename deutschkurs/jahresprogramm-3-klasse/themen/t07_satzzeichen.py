from werkzeug import Merkkasten, Saetze, Schreiben

NR = "07"
TITEL = "Satzarten und Satzzeichen"
BEREICH = "Grammatik"
LERNZIELE = ["Du unterscheidest Aussagesatz, Fragesatz und Ausrufesatz.",
             "Du setzt am Satzende Punkt, Fragezeichen oder Ausrufezeichen.",
             "Du schreibst den Satzanfang gross."]

MERK = Merkkasten("Merkkasten: Satzarten", [
    "# Aussagesatz → Punkt  .",
    "> Ich wohne in Basel.",
    "# Fragesatz → Fragezeichen  ?",
    "> Wo wohnst du?  ·  Kommst du mit?",
    "Fragewörter: wer, wie, was, wo, wann, warum, woher, wohin",
    "# Ausrufesatz (Aufforderung, Ausruf) → Ausrufezeichen  !",
    "> Komm sofort her!  ·  Hilfe!  ·  Das ist ja toll!",
    "! Jeder Satz beginnt mit einem Grossbuchstaben.",
])

# (Satz ohne Zeichen, Zeichen); die Aufgaben und Lösungen werden daraus gebaut
SAETZE_1 = [("Wo ist mein Schuh", "?"), ("Ich habe Hunger", "."), ("Pass auf", "!"),
            ("Wie alt bist du", "?"), ("Der Hund schläft", "."), ("Hilfe", "!")]
SAETZE_2 = [("Wann beginnt das Konzert", "?"), ("Am Freitag haben wir Turnen", "."),
            ("Hör sofort auf damit", "!"), ("Hast du deine Hausaufgaben gemacht", "?"),
            ("Mein Opa wohnt in Luzern", "."), ("Was für eine Überraschung", "!"),
            ("Warum weint das Baby", "?"), ("Bitte schliess die Tür", "!")]
ART = {".": "Aussagesatz", "?": "Fragesatz", "!": "Ausrufesatz"}


def zeichen(saetze):
    return [f"{s}{{{z}}}" for s, z in saetze]


def art(saetze):
    return [s + z + "\t<" + "|".join(("*" if a == ART[z] else "") + a for a in ART.values()) + ">"
            for s, z in saetze]


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Saetze("Welches Zeichen fehlt?",
                   "Schreibe am Satzende einen Punkt, ein Fragezeichen oder ein Ausrufezeichen.",
                   zeichen(SAETZE_1), woerter=[".", "?", "!"],
                   hilfe="Lies den Satz laut. Fragst du? Rufst du?"),
            Saetze("Welche Satzart?",
                   "Kreise die richtige Satzart ein.",
                   art(SAETZE_1[:4]), tab=50 * 2.835),
            Saetze("Fragewörter",
                   "Schreibe das passende Fragewort in die Lücke.",
                   ["{Wo} wohnst du? – In Bern.", "{Wie} heisst du? – Ich heisse Ali.",
                    "{Wann} kommst du? – Um drei Uhr.", "{Was} isst du? – Eine Banane."],
                   woerter=True, min_gap=16 * 2.835),
            Schreiben("Gross am Anfang",
                      "Schreibe die Sätze richtig ab. Denke an den Grossbuchstaben und das Satzzeichen.",
                      [("wir spielen im garten", "Wir spielen im Garten."),
                       ("kommst du mit", "Kommst du mit?")],
                      spalten=0, linien=1, pro_item=2),
        ]
    return [
        MERK,
        Saetze("Welches Zeichen fehlt?",
               "Setze das richtige Satzzeichen.",
               zeichen(SAETZE_2), hilfe="Manche Sätze ohne Fragewort sind auch Fragen: Hast du …?"),
        Saetze("Welche Satzart?",
               "Kreise die richtige Satzart ein.",
               art(SAETZE_2[3:7]), tab=66 * 2.835),
        Schreiben("Aus einer Aussage wird eine Frage",
                  "Mach aus jedem Aussagesatz eine Frage.",
                  [("Du kommst morgen.", "Kommst du morgen?"),
                   ("Lena hat einen Hund.", "Hat Lena einen Hund?"),
                   ("Ihr spielt Fussball.", "Spielt ihr Fussball?")],
                  spalten=1, beispiel=("Tim ist krank.", "Ist Tim krank?"),
                  erklaerung="Das Verb rückt an den Anfang."),
        Schreiben("Fragen stellen",
                  "Schreibe zu jeder Antwort eine passende Frage mit einem Fragewort.",
                  [("Ich bin neun Jahre alt.", "Wie alt bist du?"),
                   ("Wir fahren nach Zürich.", "Wohin fahrt ihr?"),
                   ("Die Schule beginnt um acht Uhr.", "Wann beginnt die Schule?")],
                  spalten=0, linien=1),
        Schreiben("Ein Text ohne Zeichen",
                  "Hier fehlen alle Satzzeichen und Grossbuchstaben am Satzanfang. Schreibe den Text richtig ab.",
                  [("am morgen klingelt der wecker lina springt aus dem bett wo sind meine socken "
                    "schnell sie kommt sonst zu spät",
                    "Am Morgen klingelt der Wecker. Lina springt aus dem Bett. Wo sind meine Socken? "
                    "Schnell! Sie kommt sonst zu spät.")],
                  spalten=0, linien=4, pro_item=10, nummern=False,
                  erklaerung="5 Satzzeichen und 5 Grossbuchstaben. „Schnell.“ ist auch richtig."),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Saetze("Welches Zeichen fehlt?",
                   "Schreibe am Satzende einen Punkt, ein Fragezeichen oder ein Ausrufezeichen.",
                   zeichen([("Wer bist du", "?"), ("Ich male ein Bild", "."), ("Komm her", "!"),
                            ("Was machst du", "?")]), woerter=[".", "?", "!"]),
            Saetze("Fragewörter",
                   "Schreibe das passende Fragewort in die Lücke.",
                   ["{Wer} ist das? – Das ist Tom.", "{Wo} ist die Katze? – Im Garten."],
                   woerter=True, min_gap=16 * 2.835),
            Schreiben("Gross am Anfang",
                      "Schreibe die Sätze richtig ab.",
                      [("die sonne scheint", "Die Sonne scheint."), ("wie heisst du", "Wie heisst du?")],
                      spalten=0, linien=1, pro_item=2),
        ]
    return [
        Saetze("Welches Zeichen fehlt?",
               "Setze das richtige Satzzeichen.",
               zeichen([("Hast du meinen Ball gesehen", "?"), ("Morgen fahren wir ans Meer", "."),
                        ("Achtung, ein Auto", "!"), ("Wohin fliegt der Vogel", "?")])),
        Schreiben("Aus einer Aussage wird eine Frage",
                  "Mach aus jedem Aussagesatz eine Frage.",
                  [("Der Bus kommt bald.", "Kommt der Bus bald?"), ("Ihr habt Ferien.", "Habt ihr Ferien?")],
                  spalten=1),
        Schreiben("Ein Text ohne Zeichen",
                  "Schreibe den Text richtig ab. Setze Satzzeichen und Grossbuchstaben.",
                  [("es regnet tom holt seinen schirm wo sind seine stiefel",
                    "Es regnet. Tom holt seinen Schirm. Wo sind seine Stiefel?")],
                  spalten=0, linien=2, pro_item=6, nummern=False,
                  erklaerung="3 Satzzeichen und 3 Grossbuchstaben am Satzanfang."),
    ]
