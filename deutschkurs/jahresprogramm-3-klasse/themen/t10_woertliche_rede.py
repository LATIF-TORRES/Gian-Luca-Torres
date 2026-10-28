from werkzeug import Merkkasten, Saetze, Schreiben

NR = "10"
TITEL = "Wörtliche Rede"
BEREICH = "Grammatik"
LERNZIELE = ["Du erkennst, was jemand wörtlich sagt.",
             "Du setzt Anführungszeichen „ “ und den Doppelpunkt.",
             "Du verwendest verschiedene Wörter für „sagen“."]
LERNZIELE_2 = ["Du setzt Anführungszeichen „ “ und den Doppelpunkt.",
               "Du verwendest verschiedene Wörter für „sagen“.",
               "Du schreibst selbst Sätze in wörtlicher Rede."]

MERK = Merkkasten("Merkkasten: Wörtliche Rede", [
    "Was jemand genau sagt, steht zwischen Anführungszeichen.",
    "Unten beginnt die Rede: „   Oben hört sie auf: “",
    "# Begleitsatz vorne",
    "> Mia ruft: „Komm schnell!“",
    "Nach dem Begleitsatz steht ein Doppelpunkt. Die Rede beginnt gross.",
    "# Wörter für sagen",
    "> rufen · fragen · antworten · flüstern · schreien · erzählen · erklären · lachen",
])

WORTFELD = ["fragt", "ruft", "flüstert", "antwortet", "schreit", "erklärt"]


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Saetze("Was sagt jemand?",
                   "Unterstreiche, was die Person wörtlich sagt.",
                   ["Tim sagt: „[Ich habe Hunger.]“",
                    "Mama ruft: „[Das Essen ist fertig!]“",
                    "Lea fragt: „[Kommst du mit?]“",
                    "Opa sagt: „[Heute ist es kalt.]“"],
                   punkte=4, hilfe="Die Rede steht zwischen den Zeichen „ und “."),
            Saetze("Zeichen setzen",
                   "Setze den Doppelpunkt und die Anführungszeichen in die Lücken.",
                   ["Ben sagt{:} {„}Ich bin müde.{“}",
                    "Die Lehrerin ruft{:} {„}Ruhe bitte!{“}",
                    "Nina fragt{:} {„}Wo ist mein Ball?{“}"],
                   hilfe="Zuerst kommt der Doppelpunkt. Dann unten „ – die Rede – oben “."),
            Saetze("Ein anderes Wort für sagen",
                   "Setze ein passendes Wort aus dem Kasten ein.",
                   ["Lara {fragt}: „Wie spät ist es?“",
                    "Der Junge {ruft}: „Hallo, warte auf mich!“",
                    "Mia {flüstert}: „Pst, das Baby schläft.“"],
                   woerter=["fragt", "ruft", "flüstert"], min_gap=22 * 2.835),
        ]
    return [
        MERK,
        Saetze("Zeichen setzen",
               "Setze Doppelpunkt und Anführungszeichen.",
               ["Der Kapitän ruft{:} {„}Alle Mann an Deck!{“}",
                "Lisa fragt ihre Mutter{:} {„}Darf ich heute zu Anna?{“}",
                "Der Arzt sagt{:} {„}Du musst im Bett bleiben.{“}",
                "Die Kinder schreien{:} {„}Juhui, es schneit!{“}"]),
        Saetze("Ein anderes Wort für sagen",
               "Setze ein passendes Wort aus dem Kasten ein. Jedes Wort passt nur einmal.",
               ["Der Lehrer {erklärt}: „Ein Dreieck hat drei Ecken.“",
                "Tim {antwortet}: „Ja, das weiss ich.“",
                "Der Mann {schreit}: „Hilfe, Feuer!“",
                "Anna {fragt}: „Wo wohnst du?“",
                "Der Opa {flüstert}: „Pst, ich verrate dir ein Geheimnis.“",
                "Das Kind {ruft}: „Mama, komm schnell!“"],
               woerter=WORTFELD, min_gap=22 * 2.835),
        Schreiben("Sprechblasen aufschreiben",
                  "Schreibe die Sätze als wörtliche Rede. Verwende ein passendes Wort für sagen.",
                  [("Pia – Ich habe heute Geburtstag!", "Pia ruft: „Ich habe heute Geburtstag!“"),
                   ("Leo – Wann beginnt der Film?", "Leo fragt: „Wann beginnt der Film?“"),
                   ("Mama – Zieh deine Jacke an!", "Mama ruft: „Zieh deine Jacke an!“")],
                  spalten=0, linien=1, pro_item=2,
                  erklaerung="1 Punkt für die Zeichen, 1 Punkt für ein passendes Wort statt sagen."),
        Schreiben("Ein kleines Gespräch",
                  "Schreibe ein Gespräch mit vier Sätzen in wörtlicher Rede. Zwei Kinder treffen sich auf dem Pausenplatz.",
                  [("", "Noah fragt: „Spielst du mit mir Fangen?“"),
                   ("", "Ella antwortet: „Ja, gern!“"),
                   ("", "Noah ruft: „Du bist dran!“"),
                   ("", "Ella lacht: „Ich krieg dich!“")],
                  spalten=0, linien=1, nummern=False,
                  erklaerung="Beispiel. Achte auf Doppelpunkt, Anführungszeichen und Grossbuchstaben."),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Saetze("Was sagt jemand?",
                   "Unterstreiche, was die Person wörtlich sagt.",
                   ["Papa sagt: „[Wir gehen jetzt.]“", "Ali fragt: „[Hast du einen Stift?]“"], punkte=2),
            Saetze("Zeichen setzen",
                   "Setze den Doppelpunkt und die Anführungszeichen in die Lücken.",
                   ["Mia ruft{:} {„}Ich komme!{“}", "Oma fragt{:} {„}Willst du Tee?{“}"]),
            Saetze("Ein anderes Wort für sagen",
                   "Setze ein passendes Wort aus dem Kasten ein.",
                   ["Der Junge {fragt}: „Wo ist das WC?“", "Die Frau {ruft}: „Halt, Stopp!“"],
                   woerter=["fragt", "ruft"], min_gap=22 * 2.835),
        ]
    return [
        Saetze("Zeichen setzen",
               "Setze Doppelpunkt und Anführungszeichen.",
               ["Der Bus-Chauffeur sagt{:} {„}Bitte einsteigen!{“}",
                "Jana fragt{:} {„}Wer hat meine Brille gesehen?{“}"]),
        Saetze("Ein anderes Wort für sagen",
               "Setze ein passendes Wort aus dem Kasten ein.",
               ["Der Junge {antwortet}: „Ich heisse Jonas.“", "Die Lehrerin {erklärt}: „So rechnet man.“",
                "Das Mädchen {flüstert}: „Ich habe ein Geheimnis.“"],
               woerter=["antwortet", "erklärt", "flüstert"], min_gap=22 * 2.835),
        Schreiben("Sprechblasen aufschreiben",
                  "Schreibe die Sätze als wörtliche Rede. Verwende ein passendes Wort für sagen.",
                  [("Tom – Wo ist mein Velo?", "Tom fragt: „Wo ist mein Velo?“"),
                   ("Lena – Achtung, ein Auto!", "Lena ruft: „Achtung, ein Auto!“")],
                  spalten=0, linien=1, pro_item=2),
    ]
