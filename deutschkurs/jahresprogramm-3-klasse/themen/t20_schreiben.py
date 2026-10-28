from werkzeug import Freitext, Merkkasten, Saetze, Schreiben, Wortkarten

NR = "20"
TITEL = "Schreiben: Eine Geschichte erzählen"
BEREICH = "Schreiben"
LERNZIELE = ["Du planst eine Geschichte: Einleitung, Hauptteil, Schluss.",
             "Du verwendest verschiedene Satzanfänge.",
             "Du schreibst eine eigene Geschichte in der Vergangenheit."]

MERK = Merkkasten("Merkkasten: So baust du eine Geschichte", [
    "# 1. Einleitung",
    "Wer? Wo? Wann?  –  An einem Samstag spielte Lea im Garten.",
    "# 2. Hauptteil",
    "Was passiert? Hier wird es spannend!  –  Plötzlich hörte sie ein lautes Krachen.",
    "# 3. Schluss",
    "Wie geht es aus?  –  Am Abend war Lea müde, aber glücklich.",
    "! Geschichten schreibt man in der Vergangenheit: ging, sah, rief.",
    "Abwechslung bei den Satzanfängen: Zuerst · Dann · Plötzlich · Danach · Zum Schluss",
])

SATZANFAENGE = ["Zuerst", "Dann", "Plötzlich", "Danach", "Auf einmal", "Zum Schluss", "Am Abend"]


def uebung(stufe):
    if stufe == 1:
        return [
            MERK,
            Saetze("Gute Satzanfänge",
                   "Setze passende Satzanfänge aus dem Kasten ein. Jeder Satzanfang passt einmal.",
                   ["{Zuerst} ging Tom in den Wald.", "{Plötzlich} sah er einen Fuchs.",
                    "{Danach} rannte der Fuchs weg.", "{Zum Schluss} ging Tom nach Hause."],
                   woerter=["Zuerst", "Plötzlich", "Danach", "Zum Schluss"], min_gap=30 * 2.835,
                   erklaerung="Andere Reihenfolgen sind auch richtig, wenn die Geschichte Sinn ergibt."),
            Wortkarten("Sätze für eine Geschichte",
                       "Ordne die Wortkarten. Schreibe den Satz auf die Linie.",
                       ["Am Morgen schien die Sonne.", "Plötzlich bellte ein Hund."], seed=21),
            Freitext("Meine Geschichte",
                     "Schreibe eine kurze Geschichte mit dem Titel „Der Ball im Baum“. "
                     "Schreibe mindestens vier Sätze. Die Satzanfänge im Kasten helfen dir.",
                     linien=7, satzanfaenge=SATZANFAENGE,
                     checkliste=["Ich habe einen Titel.", "Jeder Satz beginnt gross und endet mit einem Punkt.",
                                 "Ich habe verschiedene Satzanfänge."],
                     beispiel="Der Ball im Baum. Am Samstag spielte Mia mit ihrem Bruder im Garten. "
                              "Plötzlich flog der Ball in den Apfelbaum. Mia holte eine Leiter. "
                              "Zum Schluss hatten die Kinder ihren Ball wieder."),
        ]
    return [
        MERK,
        Saetze("Wörter für sagen",
               "Ersetze „sagen“ durch ein besseres Wort. Jedes Wort aus dem Kasten passt einmal.",
               ["„Hilfe!“, {schrie} die Frau.", "„Wie spät ist es?“, {fragte} Ben.",
                "„Pst, das Baby schläft“, {flüsterte} Mama.", "„Ich habe gewonnen!“, {jubelte} Lara."],
               woerter=["schrie", "fragte", "flüsterte", "jubelte"], min_gap=28 * 2.835),
        Schreiben("Einleitung, Hauptteil, Schluss",
                  "Lies die Sätze. Schreibe auf die Linie, ob der Satz zur Einleitung, zum Hauptteil oder zum Schluss gehört.",
                  [("Am Montag ging Nina mit ihrer Oma in den Zoo.", "Einleitung"),
                   ("Plötzlich war der Affe aus dem Käfig verschwunden!", "Hauptteil"),
                   ("Müde, aber glücklich fuhren sie am Abend nach Hause.", "Schluss")],
                  spalten=0, linien=1),
        Schreiben("Einen Schluss erfinden",
                  "Lies den Anfang. Schreibe einen passenden Schluss mit zwei Sätzen.",
                  [("Leo fand im Park einen kleinen, nassen Hund. Der Hund zitterte und hatte kein Halsband.",
                    "Leo nahm den Hund mit nach Hause und gab ihm Wasser. Am nächsten Tag fand er die Besitzerin.")],
                  spalten=0, linien=2, nummern=False, pro_item=2),
        Freitext("Meine Geschichte",
                 "Schreibe eine Geschichte zu den drei Wörtern: Schlüssel – Gewitter – Freundin. "
                 "Plane zuerst: Wer? Wo? Wann? Was passiert? Wie endet es? Schreibe in der Vergangenheit.",
                 linien=11,
                 checkliste=["Meine Geschichte hat Einleitung, Hauptteil und Schluss.",
                             "Ich habe alle drei Wörter verwendet.", "Ich schreibe in der Vergangenheit.",
                             "Ich habe verschiedene Satzanfänge."],
                 beispiel="Das Gewitter. An einem heissen Sommertag spielte ich mit meiner Freundin Sara im Wald. "
                          "Plötzlich wurde der Himmel dunkel und es donnerte laut. Wir rannten zu Saras Haus. "
                          "Aber Sara hatte ihren Schlüssel verloren! Zum Glück kam ihr Vater nach Hause. "
                          "Am Abend tranken wir heisse Schokolade und lachten über unser Abenteuer.",
                 erklaerung="Bewertung siehe Kontrollliste. Die Mustergeschichte ist nur ein Beispiel."),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Saetze("Gute Satzanfänge",
                   "Setze passende Satzanfänge aus dem Kasten ein.",
                   ["{Zuerst} packte Lisa ihren Rucksack.", "{Dann} fuhr sie mit dem Velo los.",
                    "{Plötzlich} hatte das Velo einen Platten."],
                   woerter=["Zuerst", "Dann", "Plötzlich"], min_gap=26 * 2.835,
                   erklaerung="Zuerst steht am Anfang. Plötzlich passt zum Platten (etwas Unerwartetes)."),
            Freitext("Meine Geschichte",
                     "Schreibe eine kurze Geschichte mit dem Titel „Ein Tag im Schnee“. "
                     "Schreibe mindestens vier Sätze.",
                     linien=7, satzanfaenge=SATZANFAENGE, punkte=8,
                     checkliste=["Ich habe vier Sätze geschrieben.",
                                 "Jeder Satz beginnt gross und endet mit einem Punkt.",
                                 "Ich habe verschiedene Satzanfänge."],
                     beispiel="Ein Tag im Schnee. Am Morgen lag viel Schnee. Zuerst baute ich einen Schneemann. "
                              "Dann fuhr ich mit dem Schlitten den Hügel hinunter. Am Abend trank ich heissen Tee.",
                     erklaerung="Bewertung: 4 Sätze (4 P.), Grossschreibung und Punkte (2 P.), "
                                "verschiedene Satzanfänge (2 P.)."),
        ]
    return [
        Schreiben("Einleitung, Hauptteil, Schluss",
                  "Schreibe auf die Linie: Einleitung, Hauptteil oder Schluss.",
                  [("Plötzlich brach das Eis unter Jonas.", "Hauptteil"),
                   ("Im Januar ging Jonas mit seiner Schwester zum Weiher.", "Einleitung"),
                   ("Seitdem gehen die beiden nur noch auf die Eisbahn.", "Schluss")],
                  spalten=0, linien=1),
        Freitext("Meine Geschichte",
                 "Schreibe eine Geschichte mit dem Titel „Das verschwundene Pausenbrot“. "
                 "Schreibe in der Vergangenheit und verwende wörtliche Rede.",
                 linien=11, punkte=12,
                 checkliste=["Einleitung, Hauptteil und Schluss", "Vergangenheit",
                             "mindestens ein Satz mit wörtlicher Rede", "verschiedene Satzanfänge"],
                 beispiel="Das verschwundene Pausenbrot. Am Dienstag freute sich Tim auf sein Pausenbrot. "
                          "Doch in der Pause war die Box leer! „Wer hat mein Brot gegessen?“, rief Tim. "
                          "Alle suchten im Schulzimmer. Plötzlich sah Lea Krümel unter dem Pult. "
                          "Dort sass der Klassenhamster und kaute zufrieden. Alle lachten, und Tim bekam "
                          "die Hälfte von Leas Brot.",
                 erklaerung="Bewertung: Aufbau (3 P.), Vergangenheit (3 P.), wörtliche Rede (3 P.), "
                            "Satzanfänge und Rechtschreibung (3 P.)."),
    ]
