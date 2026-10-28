from werkzeug import Merkkasten, Saetze, Schreiben, Wortkarten

NR = "08"
TITEL = "Satzbau und Satzglieder"
BEREICH = "Grammatik"
LERNZIELE = ["Du bildest aus Wörtern einen richtigen Satz.",
             "Du stellst Satzglieder um (Umstellprobe).",
             "Du findest das Subjekt (Wer?) und das Verb im Satz."]

MERK = Merkkasten("Merkkasten: Sätze bauen", [
    "Ein Satz besteht aus Satzgliedern. Ein Satzglied kann ein Wort oder mehrere Wörter sein.",
    "# Die Umstellprobe",
    "Man kann Satzglieder umstellen. Der Sinn bleibt gleich.",
    "> Lisa | spielt | im Garten.  →  Im Garten | spielt | Lisa.",
    "! Das Verb steht im Aussagesatz immer an zweiter Stelle.",
    "# Subjekt und Verb",
    "Subjekt: Wer oder was tut etwas?  →  Lisa",
    "Verb (Prädikat): Was tut Lisa?  →  spielt",
])

KARTEN_1 = ["Der Hund bellt laut.", "Ich esse einen Apfel.", "Die Sonne scheint hell.",
            "Wir spielen im Park."]
KARTEN_2 = ["Am Montag schreiben wir einen Test.", "Meine Oma backt einen feinen Kuchen.",
            "Im Winter fahren viele Kinder Ski.", "Warum ist der Himmel blau?"]


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Wortkarten("Wortkarten ordnen",
                       "Ordne die Wortkarten zu einem Satz. Schreibe den Satz auf die Linie.",
                       KARTEN_1,
                       hilfe="Das Wort mit dem Grossbuchstaben kommt zuerst. Der Punkt kommt am Schluss."),
            Saetze("Wer tut etwas?",
                   "Unterstreiche, wer etwas tut (das Subjekt).",
                   ["[Der Vogel] singt.", "[Mama] kocht.", "Heute regnet [es].",
                    "[Die Kinder] lachen.", "Im Stall schläft [das Pferd]."],
                   hilfe="Frage: Wer singt? Wer kocht?"),
            Saetze("Das Verb finden",
                   "Kreise das Verb ein.",
                   ["Tim [rennt] schnell.", "Wir [bauen] eine Hütte.", "Die Katze [trinkt] Milch.",
                    "Im Herbst [fallen] die Blätter."],
                   mark="kreis"),
        ]
    return [
        MERK,
        Wortkarten("Wortkarten ordnen",
                   "Ordne die Wortkarten zu einem Satz. Schreibe den Satz auf die Linie.",
                   KARTEN_2),
        Schreiben("Die Umstellprobe",
                  "Stelle die Satzglieder um. Beginne mit dem Wort in Klammern.",
                  [("Wir gehen morgen ins Kino. (Morgen)", "Morgen gehen wir ins Kino."),
                   ("Der Igel schläft im Winter. (Im Winter)", "Im Winter schläft der Igel."),
                   ("Lena liest am Abend ein Buch. (Am Abend)", "Am Abend liest Lena ein Buch.")],
                  spalten=0, linien=1,
                  erklaerung="Das Verb bleibt an zweiter Stelle."),
        Saetze("Satzglieder trennen",
               "Trenne die Satzglieder mit einem Strich. Mache die Umstellprobe, wenn du unsicher bist.",
               ["Der Bauer | füttert | die Kühe.",
                "Am Nachmittag | spielen | die Kinder | Fussball.",
                "Meine Tante | wohnt | in Genf."],
               erklaerung="Satzglieder: Wer? (Subjekt) · Verb · Wen/Was? · Wann? · Wo?", abstand=3),
        Saetze("Subjekt und Verb",
               "Unterstreiche das Subjekt rot und das Verb blau.",
               ["[Der kleine Hund:0] [bellt:1].",
                "Im Garten [blühen:1] [viele Blumen:0].",
                "[Ich:0] [besuche:1] morgen meinen Freund.",
                "Gestern [sammelte:1] [Opa:0] Pilze."],
               legende=["Subjekt (Wer?)", "Verb"],
               erklaerung="Die Wörter zu einem Subjekt (z. B. „Der kleine Hund“) zählen zusammen 1 Punkt."),
        Schreiben("Sätze verlängern",
                  "Mach den Satz länger. Schreibe noch Wann? und Wo? dazu.",
                  [("Der Hund schläft.", "Am Mittag schläft der Hund in seinem Korb."),
                   ("Wir spielen.", "Nach der Schule spielen wir auf dem Pausenplatz.")],
                  spalten=0, linien=1,
                  erklaerung="Viele Lösungen sind richtig. Es braucht eine Zeitangabe und eine Ortsangabe."),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Wortkarten("Wortkarten ordnen",
                       "Ordne die Wortkarten zu einem Satz. Schreibe den Satz auf die Linie.",
                       ["Die Katze schläft.", "Ich male ein Bild.", "Der Bus kommt spät."], seed=13),
            Saetze("Wer tut etwas?",
                   "Unterstreiche, wer etwas tut (das Subjekt).",
                   ["[Der Bäcker] backt Brot.", "[Lina] schwimmt.", "Im Wald wohnt [ein Fuchs]."]),
            Saetze("Das Verb finden",
                   "Kreise das Verb ein.",
                   ["Der Ball [fliegt].", "Papa [liest] die Zeitung.", "Wir [singen] ein Lied."],
                   mark="kreis"),
        ]
    return [
        Wortkarten("Wortkarten ordnen",
                   "Ordne die Wortkarten zu einem Satz. Schreibe den Satz auf die Linie.",
                   ["Nach der Schule essen wir Zvieri.", "Mein Bruder spielt gern Fussball."], seed=13),
        Schreiben("Die Umstellprobe",
                  "Stelle die Satzglieder um. Beginne mit dem Wort in Klammern.",
                  [("Die Kinder baden im Sommer im See. (Im Sommer)", "Im Sommer baden die Kinder im See."),
                   ("Ich putze am Abend die Zähne. (Am Abend)", "Am Abend putze ich die Zähne.")],
                  spalten=0, linien=1),
        Saetze("Subjekt und Verb",
               "Unterstreiche das Subjekt rot und das Verb blau.",
               ["[Die Feuerwehr:0] [kommt:1] schnell.",
                "Am Morgen [krähen:1] [die Hähne:0].",
                "[Wir:0] [fahren:1] mit dem Zug."],
               legende=["Subjekt (Wer?)", "Verb"]),
    ]
