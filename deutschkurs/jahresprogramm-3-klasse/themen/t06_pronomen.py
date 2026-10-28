from werkzeug import Merkkasten, Saetze, Schreiben, Verbinden

NR = "06"
TITEL = "Pronomen"
BEREICH = "Grammatik"
LERNZIELE = ["Du kennst die Pronomen ich, du, er, sie, es, wir, ihr, sie.",
             "Du ersetzt ein Nomen durch das passende Pronomen.",
             "Du vermeidest Wiederholungen in einem Text."]

MERK = Merkkasten("Merkkasten: Pronomen (Fürwörter)", [
    "Pronomen stehen für ein Nomen. So muss man ein Wort nicht immer wiederholen.",
    "> Lena spielt. Sie lacht.  (Sie = Lena)",
    "# Die Pronomen",
    "Einzahl:  ich · du · er · sie · es",
    "Mehrzahl:  wir · ihr · sie",
    "> der Hund → er · die Katze → sie · das Pferd → es · die Kinder → sie",
    "! Der Begleiter hilft dir: der → er, die → sie, das → es.",
])

# Nomen → Pronomen; daraus werden die Aufgaben gebaut
PRONOMEN = {"der": "er", "die": "sie", "das": "es"}


def uebung(stufe):
    if stufe == 1:
        paare = [(n, PRONOMEN[n.split()[0]]) for n in ["der Vater", "die Mutter", "das Baby"]]
        return [
            MERK,
            Verbinden("Wer ist wer?",
                      "Verbinde jedes Nomen mit dem passenden Pronomen.",
                      paare + [("Tim und ich", "wir"), ("die Kinder", "sie")]),
            Saetze("Das passende Pronomen",
                   "Schreibe er, sie oder es in die Lücke.",
                   ["Der Hund bellt. {Er} hat Hunger.",
                    "Die Katze schläft. {Sie} ist müde.",
                    "Das Pferd rennt. {Es} ist schnell.",
                    "Opa liest. {Er} trägt eine Brille.",
                    "Mia singt. {Sie} singt schön."],
                   woerter=["Er", "Sie", "Es"], min_gap=14 * 2.835,
                   hilfe="der → er, die → sie, das → es. Am Satzanfang schreibt man gross."),
            Saetze("ich, du, wir oder ihr?",
                   "Kreise das richtige Pronomen ein.",
                   ["<*Ich|Du> heisse Lara.", "Wie heisst <ich|*du>?",
                    "<*Wir|Ihr> spielen zusammen.", "Kommt <wir|*ihr> mit?"],
                   erklaerung="Das Verb hilft: ich heisse, du heisst, wir spielen, ihr kommt."),
            Schreiben("Nicht immer dasselbe Wort",
                      "Schreibe den zweiten Satz mit einem Pronomen.",
                      [("Ben hat ein Velo. Ben fährt schnell.", "Er fährt schnell."),
                       ("Die Blume ist rot. Die Blume riecht gut.", "Sie riecht gut.")],
                      spalten=0, linien=1),
        ]
    return [
        MERK,
        Saetze("Das passende Pronomen",
               "Schreibe das passende Pronomen in die Lücke.",
               ["Der Lehrer kommt. {Er} begrüsst die Klasse.",
                "Die Kinder rufen laut. {Sie} freuen sich.",
                "Das Fenster ist offen. {Es} klappert im Wind.",
                "Lea und ich gehen in den Wald. {Wir} sammeln Pilze.",
                "Du und Nora seid schnell. {Ihr} gewinnt das Rennen.",
                "Die Sonne scheint. {Sie} ist warm."],
               min_gap=14 * 2.835,
               erklaerung="Lea und ich → wir. Du und Nora → ihr. Die Kinder → sie (Mehrzahl)."),
        Saetze("Wer ist gemeint?",
               "Lies die Sätze. Schreibe das Nomen, für das das Pronomen steht.",
               ["Der Fuchs sieht die Gans. Er hat Hunger. Er = {der Fuchs}",
                "Die Gans sieht den Fuchs. Sie rennt weg. Sie = {die Gans}",
                "Das Huhn gackert. Es ist laut. Es = {das Huhn}"],
               min_gap=26 * 2.835),
        Schreiben("Eine Geschichte verbessern",
                  "Hier kommt immer wieder „Max“ vor. Schreibe die Geschichte ab. "
                  "Ersetze Max zweimal durch er.",
                  [("Max geht in den Zoo. Max sieht einen Löwen. Max hat ein bisschen Angst. "
                    "Max geht schnell weiter.",
                    "Max geht in den Zoo. Er sieht einen Löwen. Er hat ein bisschen Angst. "
                    "Max geht schnell weiter.")],
                  spalten=0, linien=3, pro_item=2, nummern=False,
                  erklaerung="Auch richtig: andere Sätze mit er ersetzen. Max am Anfang bleibt, damit man weiss, wer gemeint ist."),
        Schreiben("Sätze mit Pronomen",
                  "Schreibe zu jedem Pronomen einen Satz über deine Familie oder deine Freunde.",
                  [("wir:", "Wir fahren am Sonntag in die Berge."),
                   ("sie (Einzahl):", "Meine Schwester ist zehn. Sie spielt Klavier."),
                   ("ihr:", "Ihr seid meine besten Freunde.")],
                  spalten=1),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Verbinden("Wer ist wer?",
                      "Verbinde jedes Nomen mit dem passenden Pronomen.",
                      [("der Bär", "er"), ("die Ente", "sie"), ("das Schaf", "es"), ("Papa und ich", "wir")]),
            Saetze("Das passende Pronomen",
                   "Schreibe er, sie oder es in die Lücke.",
                   ["Der Ball rollt. {Er} ist rund.", "Die Lampe brennt. {Sie} ist hell.",
                    "Das Kind lacht. {Es} ist fröhlich."],
                   woerter=["Er", "Sie", "Es"], min_gap=14 * 2.835),
            Schreiben("Nicht immer dasselbe Wort",
                      "Schreibe den zweiten Satz mit einem Pronomen.",
                      [("Lisa malt. Lisa malt ein Haus.", "Sie malt ein Haus.")],
                      spalten=0, linien=1, pro_item=2),
        ]
    return [
        Saetze("Das passende Pronomen",
               "Schreibe das passende Pronomen in die Lücke.",
               ["Der Zug fährt ab. {Er} ist voll.", "Die Vögel singen. {Sie} sitzen im Baum.",
                "Mein Freund und ich bauen ein Floss. {Wir} brauchen Holz.",
                "Das Wetter ist schön. {Es} ist warm."],
               min_gap=14 * 2.835),
        Saetze("Wer ist gemeint?",
               "Schreibe das Nomen, für das das Pronomen steht.",
               ["Die Maus sieht den Käse. Sie freut sich. Sie = {die Maus}",
                "Der Hund sucht den Knochen. Er gräbt im Garten. Er = {der Hund}"],
               min_gap=26 * 2.835),
        Schreiben("Eine Geschichte verbessern",
                  "Schreibe die Sätze ab. Ersetze das Nomen im zweiten und dritten Satz durch ein Pronomen.",
                  [("Die Katze sitzt am Fenster. Die Katze sieht einen Vogel. Die Katze springt auf.",
                    "Die Katze sitzt am Fenster. Sie sieht einen Vogel. Sie springt auf.")],
                  spalten=0, linien=2, pro_item=2, nummern=False),
    ]
