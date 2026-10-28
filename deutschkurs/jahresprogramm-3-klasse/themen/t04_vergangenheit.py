from werkzeug import Merkkasten, Saetze, Schreiben, Sortieren, Tabelle

NR = "04"
TITEL = "Gegenwart und Vergangenheit"
BEREICH = "Grammatik"
LERNZIELE = ["Du erkennst, ob ein Satz in der Gegenwart oder in der Vergangenheit steht.",
             "Du bildest die Vergangenheit (Präteritum): ich spielte, ich ging.",
             "Du bildest das Perfekt: ich habe gespielt, ich bin gegangen."]

MERK = Merkkasten("Merkkasten: Zeitformen", [
    "Am Verb sieht man, wann etwas passiert.",
    "# Gegenwart (Präsens): jetzt",
    "> Ich spiele. Ich gehe.",
    "# Vergangenheit (Präteritum): früher – so schreibt man Geschichten",
    "> Ich spielte. Ich ging.",
    "# Perfekt: früher – so erzählt man mündlich",
    "> Ich habe gespielt. Ich bin gegangen.",
    "Viele Verben bekommen ein -te: spielen → spielte.",
    "! Einige Verben ändern sich ganz: gehen → ging, sehen → sah, essen → ass.",
])

# (Grundform, Gegenwart er/sie, Präteritum er/sie, Perfekt er/sie)
VERBEN = {
    "spielen": ("spielt", "spielte", "hat gespielt"),
    "lachen": ("lacht", "lachte", "hat gelacht"),
    "malen": ("malt", "malte", "hat gemalt"),
    "kochen": ("kocht", "kochte", "hat gekocht"),
    "baden": ("badet", "badete", "hat gebadet"),
    "tanzen": ("tanzt", "tanzte", "hat getanzt"),
    "gehen": ("geht", "ging", "ist gegangen"),
    "sehen": ("sieht", "sah", "hat gesehen"),
    "essen": ("isst", "ass", "hat gegessen"),
    "schreiben": ("schreibt", "schrieb", "hat geschrieben"),
    "fahren": ("fährt", "fuhr", "ist gefahren"),
    "trinken": ("trinkt", "trank", "hat getrunken"),
    "laufen": ("läuft", "lief", "ist gelaufen"),
    "finden": ("findet", "fand", "hat gefunden"),
    "kommen": ("kommt", "kam", "ist gekommen"),
    "singen": ("singt", "sang", "hat gesungen"),
    "schlafen": ("schläft", "schlief", "hat geschlafen"),
    "fliegen": ("fliegt", "flog", "ist geflogen"),
    "lesen": ("liest", "las", "hat gelesen"),
    "springen": ("springt", "sprang", "ist gesprungen"),
}


def zeile(verb, offen):
    """Tabellenzeile: Grundform | Gegenwart | Vergangenheit | Perfekt. offen: Spalten mit Lücke."""
    werte = [verb, *[f"er {x}" for x in VERBEN[verb]]]
    return [("{" + w + "}") if k in offen else w for k, w in enumerate(werte)]


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Saetze("Jetzt oder früher?",
                   "Kreise ein: Ist der Satz jetzt (Gegenwart) oder früher (Vergangenheit)?",
                   ["Ich spiele Fussball.\t<*jetzt|früher>",
                    "Gestern regnete es.\t<jetzt|*früher>",
                    "Die Katze schläft.\t<*jetzt|früher>",
                    "Wir gingen in den Zoo.\t<jetzt|*früher>",
                    "Mama lachte laut.\t<jetzt|*früher>",
                    "Der Hund bellt.\t<*jetzt|früher>"]),
            Tabelle("Verben mit -te",
                    "Schreibe die Vergangenheit. Hänge -te an.",
                    ["jetzt", "früher"],
                    [["er malt", "{er malte}"], ["er kocht", "{er kochte}"],
                     ["er lacht", "{er lachte}"], ["er tanzt", "{er tanzte}"]],
                    beispiel=["er spielt", "er spielte"], breiten=[1, 1.4]),
            Saetze("Verben, die sich ändern",
                   "Schreibe das passende Verb aus dem Kasten in die Lücke.",
                   ["Gestern {ging} ich in den Wald.", "Ich {sah} ein Reh.",
                    "Danach {ass} ich ein Brot.", "Am Abend {schlief} ich sofort ein."],
                   woerter=True, min_gap=18 * 2.835,
                   erklaerung="gehen → ging, sehen → sah, essen → ass, schlafen → schlief."),
            Schreiben("Was hast du gemacht?",
                      "Schreibe den Satz im Perfekt. Die Wörter in Klammern helfen dir.",
                      [("Ich spielte. (habe … gespielt)", "Ich habe gespielt."),
                       ("Ich lachte. (habe … gelacht)", "Ich habe gelacht."),
                       ("Ich ging. (bin … gegangen)", "Ich bin gegangen.")],
                      spalten=0, linien=1),
        ]
    return [
        MERK,
        Saetze("Zeitform erkennen",
               "Kreise die richtige Zeitform ein.",
               ["Wir fuhren ans Meer.\t<Gegenwart|*Vergangenheit|Perfekt>",
                "Lea hat ein Bild gemalt.\t<Gegenwart|Vergangenheit|*Perfekt>",
                "Der Zug kommt.\t<*Gegenwart|Vergangenheit|Perfekt>",
                "Ich trank einen Tee.\t<Gegenwart|*Vergangenheit|Perfekt>",
                "Ihr seid gerannt.\t<Gegenwart|Vergangenheit|*Perfekt>"],
               hilfe="Perfekt hat zwei Teile: habe/bin … gemacht."),
        Tabelle("Verben in drei Zeitformen",
                "Fülle die Tabelle aus.",
                ["Grundform", "Gegenwart", "Vergangenheit", "Perfekt"],
                [zeile("lachen", {2, 3}), zeile("schreiben", {1, 2, 3}), zeile("fahren", {1, 2, 3}),
                 zeile("trinken", {1, 2, 3}), zeile("laufen", {1, 2, 3}), zeile("finden", {1, 2, 3})],
                beispiel=zeile("gehen", set()), breiten=[1, 1, 1.1, 1.5],
                erklaerung="Bei gehen, fahren, laufen: ist … (Bewegung von einem Ort zum anderen)."),
        Saetze("Eine Geschichte in der Vergangenheit",
               "Setze das Verb in der Vergangenheit (Präteritum) ein.",
               ["Am Montag {kam|kommen} ein neues Kind in die Klasse.",
                "Es {hiess|heissen} Amir.",
                "Amir {sprach|sprechen} schon gut Deutsch.",
                "In der Pause {spielten|spielen} wir zusammen.",
                "Nach der Schule {lief|laufen} ich mit Amir nach Hause."],
               min_gap=24 * 2.835),
        Schreiben("Vom Präteritum ins Perfekt",
                  "Schreibe die Sätze im Perfekt.",
                  [("Ich las ein Buch.", "Ich habe ein Buch gelesen."),
                   ("Wir sangen ein Lied.", "Wir haben ein Lied gesungen."),
                   ("Der Vogel flog weg.", "Der Vogel ist weggeflogen."),
                   ("Du fandest den Schlüssel.", "Du hast den Schlüssel gefunden.")],
                  spalten=0, linien=1),
        Schreiben("Mein Wochenende",
                  "Schreibe drei Sätze über dein letztes Wochenende. Schreibe in der Vergangenheit.",
                  [("", "Am Samstag spielte ich mit meinem Bruder."),
                   ("", "Wir bauten eine Hütte im Wald."),
                   ("", "Am Sonntag besuchte ich meine Oma.")],
                  spalten=0, linien=1,
                  erklaerung="Beispiel. Achte darauf, dass alle Verben in der Vergangenheit stehen."),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Saetze("Jetzt oder früher?",
                   "Kreise ein: Ist der Satz jetzt (Gegenwart) oder früher (Vergangenheit)?",
                   ["Der Hund spielte.\t<jetzt|*früher>", "Ich lese.\t<*jetzt|früher>",
                    "Wir kochten Suppe.\t<jetzt|*früher>", "Es schneit.\t<*jetzt|früher>"]),
            Tabelle("Verben mit -te",
                    "Schreibe die Vergangenheit. Hänge -te an.",
                    ["jetzt", "früher"],
                    [["er baut", "{er baute}"], ["er holt", "{er holte}"], ["er sagt", "{er sagte}"]],
                    beispiel=["er spielt", "er spielte"], breiten=[1, 1.4]),
            Saetze("Verben, die sich ändern",
                   "Schreibe das passende Verb aus dem Kasten in die Lücke.",
                   ["Gestern {trank} ich Milch.", "Wir {gingen} nach Hause.", "Ich {sah} einen Fuchs."],
                   woerter=True, min_gap=18 * 2.835),
            Schreiben("Was hast du gemacht?",
                      "Schreibe den Satz im Perfekt. Die Wörter in Klammern helfen dir.",
                      [("Ich malte. (habe … gemalt)", "Ich habe gemalt."),
                       ("Ich kam. (bin … gekommen)", "Ich bin gekommen.")],
                      spalten=0, linien=1),
        ]
    return [
        Saetze("Zeitform erkennen",
               "Kreise die richtige Zeitform ein.",
               ["Sie sang ein Lied.\t<Gegenwart|*Vergangenheit|Perfekt>",
                "Wir sind geschwommen.\t<Gegenwart|Vergangenheit|*Perfekt>",
                "Er liest.\t<*Gegenwart|Vergangenheit|Perfekt>",
                "Ich habe gelacht.\t<Gegenwart|Vergangenheit|*Perfekt>"]),
        Tabelle("Verben in drei Zeitformen",
                "Fülle die Tabelle aus.",
                ["Grundform", "Gegenwart", "Vergangenheit", "Perfekt"],
                [zeile("singen", {1, 2, 3}), zeile("schlafen", {1, 2, 3}), zeile("springen", {1, 2, 3})],
                beispiel=zeile("sehen", set()), breiten=[1, 1, 1.1, 1.5]),
        Saetze("Eine Geschichte in der Vergangenheit",
               "Setze das Verb in der Vergangenheit (Präteritum) ein.",
               ["Gestern {fand|finden} ich einen Igel.",
                "Er {schlief|schlafen} unter dem Busch.",
                "Ich {holte|holen} Papa.",
                "Wir {gaben|geben} dem Igel Wasser."],
               min_gap=22 * 2.835),
        Schreiben("Vom Präteritum ins Perfekt",
                  "Schreibe die Sätze im Perfekt.",
                  [("Ich ass eine Pizza.", "Ich habe eine Pizza gegessen."),
                   ("Wir fuhren nach Basel.", "Wir sind nach Basel gefahren.")],
                  spalten=0, linien=1, pro_item=2,
                  erklaerung="Je 1 Punkt für habe/bin und 1 Punkt für die Verbform."),
    ]
