from werkzeug import Merkkasten, Saetze, Schreiben, Tabelle, Verbinden

NR = "05"
TITEL = "Adjektive"
BEREICH = "Grammatik"
LERNZIELE = ["Du erkennst Adjektive (Wiewörter).",
             "Du findest das Gegenteil eines Adjektivs.",
             "Du steigerst Adjektive: gross – grösser – am grössten."]

MERK = Merkkasten("Merkkasten: Adjektive (Wiewörter)", [
    "Adjektive sagen, wie etwas ist.",
    "> der rote Ball · die süsse Birne · Der Tee ist heiss.",
    "! Adjektive schreibt man klein.",
    "Trick: Frage „Wie ist …?“ – Wie ist der Ball? rot.",
    "",
    "# Steigerung: mit Adjektiven vergleichen",
    "> gross – grösser – am grössten",
    "Gleich: Lea ist so gross wie Nico.  Anders: Lea ist grösser als Nico.",
    "! Ausnahmen: gut – besser – am besten · viel – mehr – am meisten",
])

# (Grundform, Vergleichsform, Höchstform)
STEIGERUNG = {
    "klein": ("kleiner", "am kleinsten"), "schnell": ("schneller", "am schnellsten"),
    "lang": ("länger", "am längsten"), "warm": ("wärmer", "am wärmsten"),
    "alt": ("älter", "am ältesten"), "hoch": ("höher", "am höchsten"),
    "gut": ("besser", "am besten"), "viel": ("mehr", "am meisten"),
    "laut": ("lauter", "am lautesten"), "kalt": ("kälter", "am kältesten"),
    "jung": ("jünger", "am jüngsten"), "stark": ("stärker", "am stärksten"),
    "gross": ("grösser", "am grössten"), "nah": ("näher", "am nächsten"),
    "dick": ("dicker", "am dicksten"), "hell": ("heller", "am hellsten"),
}

GEGENTEIL = [("gross", "klein"), ("warm", "kalt"), ("schnell", "langsam"), ("laut", "leise"),
             ("hell", "dunkel"), ("nass", "trocken"), ("schwer", "leicht"), ("voll", "leer"),
             ("dick", "dünn"), ("hart", "weich"), ("früh", "spät"), ("lang", "kurz")]


def treppe(woerter, offen):
    """Tabellenzeilen Grundform | Vergleichsform | Höchstform; offen = Spalten mit Lücke."""
    rows = []
    for w in woerter:
        werte = [w, *STEIGERUNG[w]]
        rows.append(["{" + v + "}" if k in offen else v for k, v in enumerate(werte)])
    return rows


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Saetze("Adjektive finden",
                   "Unterstreiche das Adjektiv in jedem Satz.",
                   ["Der Ball ist [rot].", "Die Suppe ist [heiss].", "Ich habe eine [grosse] Katze.",
                    "Der Hund ist [müde].", "Das Eis ist [kalt].", "Mein Bruder ist [lustig]."],
                   hilfe="Frage: Wie ist …?"),
            Verbinden("Das Gegenteil",
                      "Verbinde jedes Adjektiv mit seinem Gegenteil. Zeichne einen Strich.",
                      GEGENTEIL[:6]),
            Tabelle("Die Steigerungs-Treppe",
                    "Fülle die Tabelle aus.",
                    ["Grundform", "Vergleichsform", "Höchstform"],
                    treppe(["schnell", "laut", "klein", "warm"], {1, 2}),
                    beispiel=["gross", "grösser", "am grössten"],
                    hilfe="Vergleichsform: -er anhängen. Höchstform: am … -sten oder -esten (am lautesten). "
                         "Manchmal kommt ein Umlaut dazu: warm → wärmer."),
            Saetze("wie oder als?",
                   "Schreibe wie oder als in die Lücke.",
                   ["Ein Elefant ist grösser {als} eine Maus.",
                    "Lea ist so alt {wie} Nico.",
                    "Mein Velo ist schneller {als} dein Trottinett.",
                    "Der Tee ist so heiss {wie} die Suppe."],
                   woerter=["wie", "als"], min_gap=14 * 2.835,
                   erklaerung="Gleich → so … wie. Unterschiedlich → …er als."),
        ]
    return [
        MERK,
        Saetze("Adjektive finden",
               "Unterstreiche alle Adjektive. Es sind #N.",
               ["Die [alte] Katze schläft auf dem [warmen] Sofa.",
                "Mein Bruder hat einen [neuen] Velohelm.",
                "Der Apfel ist [süss] und [saftig].",
                "Im [dunklen] Wald ist es [still].",
                "Lisa trägt eine [blaue] Jacke und [gelbe] Stiefel."],
               erklaerung="„still“ ist ein Adjektiv: Wie ist es im Wald? still."),
        Schreiben("Das Gegenteil",
                  "Schreibe zu jedem Adjektiv das Gegenteil.",
                  GEGENTEIL[4:], spalten=2, breit=24 * 2.835),
        Tabelle("Die Steigerungs-Treppe",
                "Fülle die Tabelle aus.",
                ["Grundform", "Vergleichsform", "Höchstform"],
                treppe(["lang", "alt", "kalt", "hoch", "gut", "viel"], {1, 2})
                + treppe(["jung"], {0, 2}),
                beispiel=["klein", "kleiner", "am kleinsten"],
                erklaerung="Oft kommt ein Umlaut dazu: lang → länger, alt → älter. hoch → höher."),
        Saetze("Fehler-Detektiv",
               "Finde in jedem Satz den Fehler. Streiche das falsche Wort durch. Schreibe es richtig auf die Linie.",
               ["Das ist das [guteste] Eis der Welt. → {beste}",
                "Mein Turm ist [höcher] als deiner. → {höher}",
                "Opa ist älter [wie] Oma. → {als}",
                "Der Hund rennt [am schnellste]. → {am schnellsten}"],
               mark="durch", min_gap=26 * 2.835, punkte=4),
        Schreiben("Vergleiche",
                  "Vergleiche die zwei Dinge. Schreibe einen Satz mit als.",
                  [("Velo und Auto (schnell):", "Ein Auto ist schneller als ein Velo."),
                   ("Maus und Pferd (gross):", "Ein Pferd ist grösser als eine Maus."),
                   ("Sommer und Winter (warm):", "Der Sommer ist wärmer als der Winter.")],
                  spalten=0, linien=1),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Saetze("Adjektive finden",
                   "Unterstreiche das Adjektiv in jedem Satz.",
                   ["Die Blume ist [gelb].", "Das ist ein [langer] Zug.", "Der Kuchen ist [süss].",
                    "Mein Hund ist [klein]."]),
            Verbinden("Das Gegenteil",
                      "Verbinde jedes Adjektiv mit seinem Gegenteil.",
                      [GEGENTEIL[k] for k in (6, 7, 9, 10)], seed=5),
            Tabelle("Die Steigerungs-Treppe",
                    "Fülle die Tabelle aus.",
                    ["Grundform", "Vergleichsform", "Höchstform"],
                    treppe(["stark", "dick", "hell"], {1, 2}),
                    beispiel=["klein", "kleiner", "am kleinsten"]),
            Saetze("wie oder als?",
                   "Schreibe wie oder als in die Lücke.",
                   ["Ich bin so gross {wie} du.", "Ein Hund ist schneller {als} eine Schnecke."],
                   woerter=["wie", "als"], min_gap=14 * 2.835),
        ]
    return [
        Saetze("Adjektive finden",
               "Unterstreiche alle Adjektive. Es sind #N.",
               ["Der [kleine] Hase frisst eine [frische] Karotte.",
                "Das Wasser im See ist [klar] und [kühl].",
                "Ein [lauter] Donner weckt das [müde] Baby."]),
        Schreiben("Das Gegenteil",
                  "Schreibe zu jedem Adjektiv das Gegenteil.",
                  [GEGENTEIL[k] for k in (1, 3, 8, 11)], spalten=2, breit=24 * 2.835),
        Tabelle("Die Steigerungs-Treppe",
                "Fülle die Tabelle aus.",
                ["Grundform", "Vergleichsform", "Höchstform"],
                treppe(["warm", "gross"], {1, 2}) + treppe(["gut"], {0, 2}) + treppe(["nah"], {0, 1})),
        Saetze("wie oder als?",
               "Schreibe wie oder als in die Lücke.",
               ["Der Berg ist höher {als} der Hügel.", "Tom rennt so schnell {wie} Ben.",
                "Heute ist es kälter {als} gestern."],
               min_gap=14 * 2.835),
    ]
