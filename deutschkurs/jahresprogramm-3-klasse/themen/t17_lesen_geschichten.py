from werkzeug import Lesetext, RichtigFalsch, Saetze, Schreiben

NR = "17"
TITEL = "Lesen: Geschichten verstehen"
BEREICH = "Lesen"
LERNZIELE = ["Du liest eine Geschichte genau.",
             "Du findest Antworten im Text und schreibst sie in ganzen Sätzen.",
             "Du bringst die Ereignisse in die richtige Reihenfolge."]

LESEN = "Lies den Text genau. Du darfst ihn zweimal lesen."


def reihenfolge(saetze):
    """saetze in richtiger Reihenfolge; angezeigt wird eine feste Mischung, die Lösung ist die Nummer."""
    order = [2, 0, 3, 1, 4, 5][:len(saetze)]
    return [f"{{{k + 1}}}  {saetze[k]}" for k in order]


def uebung(stufe):
    if stufe == 1:
        return [
            Lesetext("Lesen", LESEN, "Wo ist der Turnschuh?", [
                "Heute hat Ben Turnen. Er packt seine Turnsachen ein. Aber ein Turnschuh fehlt.",
                "Ben sucht unter dem Bett. Da ist nur ein alter Socken. Er sucht im Schrank. "
                "Da sind nur Pullover.",
                "Dann hört Ben ein Geräusch im Garten. Er schaut aus dem Fenster. "
                "Sein Hund Bello liegt auf der Wiese. Bello kaut auf etwas Blauem.",
                "„Bello, das ist mein Turnschuh!“, ruft Ben. Er rennt in den Garten. "
                "Der Schuh ist nass, aber nicht kaputt. Ben lacht und nimmt den Schuh mit.",
            ]),
            RichtigFalsch("Richtig oder falsch?",
                          "Lies die Sätze. Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                          [("Ben hat heute Turnen.", True, ""),
                           ("Unter dem Bett findet Ben den Turnschuh.", False, "Unter dem Bett ist ein Socken."),
                           ("Bellos Turnschuh ist blau.", True, ""),
                           ("Der Schuh ist kaputt.", False, "Der Schuh ist nass, aber nicht kaputt.")]),
            Schreiben("Fragen zum Text",
                      "Beantworte die Fragen. Schreibe ganze Sätze.",
                      [("Was fehlt Ben?", "Ben fehlt ein Turnschuh."),
                       ("Wo sucht Ben zuerst?", "Ben sucht zuerst unter dem Bett."),
                       ("Wer hat den Turnschuh?", "Der Hund Bello hat den Turnschuh.")],
                      spalten=0, linien=1, pro_item=2),
            Saetze("Die richtige Reihenfolge",
                   "Schreibe die Zahlen 1 bis 4 auf die Linien. 1 bekommt das, was zuerst passiert.",
                   reihenfolge(["Ben packt seine Turnsachen ein.", "Ben sucht im Schrank.",
                                "Ben sieht Bello im Garten.", "Ben holt den nassen Schuh."]),
                   min_gap=10 * 2.835),
        ]
    return [
        Lesetext("Lesen", LESEN, "Das Geheimnis im Estrich", [
            "Es regnete schon den ganzen Tag. Mila und ihr Bruder Jonas langweilten sich. "
            "„Lass uns in den Estrich gehen“, schlug Mila vor. Dort oben waren sie noch nie allein gewesen.",
            "Die Treppe knarrte bei jedem Schritt. Im Estrich roch es nach Staub und altem Holz. "
            "Durch ein kleines Fenster fiel ein bisschen Licht. In einer Ecke stand eine grosse, "
            "braune Holzkiste mit einem rostigen Schloss.",
            "Jonas rüttelte am Deckel. Plötzlich sprang das Schloss auf. In der Kiste lagen ein alter Hut, "
            "ein Fotoalbum und ein Brief. Auf dem Umschlag stand: „Für meine Enkel“.",
            "Mila öffnete den Brief vorsichtig. Er war von Grossvater. Er schrieb: „Wenn ihr diesen Brief "
            "findet, schaut unter die dritte Treppenstufe.“ Die Kinder rannten zur Treppe. Unter der dritten "
            "Stufe fanden sie eine kleine Dose. Darin lagen zwei glänzende Murmeln und ein Zettel: "
            "„Neugierige Kinder sind die besten Kinder.“",
            "Am Abend erzählten Mila und Jonas alles ihrer Mutter. Sie lächelte. „Euer Grossvater hat "
            "Rätsel geliebt“, sagte sie.",
        ]),
        RichtigFalsch("Richtig oder falsch?",
                      "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                      [("Es war ein sonniger Tag.", False, "Es regnete den ganzen Tag."),
                       ("Die Kiste war aus Holz.", True, ""),
                       ("Jonas öffnete den Brief.", False, "Mila öffnete den Brief."),
                       ("Der Brief war von Grossvater.", True, ""),
                       ("In der Dose lagen drei Murmeln.", False, "Es waren zwei Murmeln.")]),
        Schreiben("Fragen zum Text",
                  "Beantworte die Fragen. Schreibe ganze Sätze.",
                  [("Warum gehen die Kinder in den Estrich?",
                    "Sie gehen in den Estrich, weil es regnet und sie sich langweilen."),
                   ("Wie riecht es im Estrich?", "Im Estrich riecht es nach Staub und altem Holz."),
                   ("Was lag in der Kiste? Nenne drei Dinge.",
                    "In der Kiste lagen ein alter Hut, ein Fotoalbum und ein Brief."),
                   ("Was steht auf dem Zettel in der Dose?",
                    "Auf dem Zettel steht: „Neugierige Kinder sind die besten Kinder.“")],
                  spalten=0, linien=1, pro_item=2),
        Saetze("Die richtige Reihenfolge",
               "Schreibe die Zahlen 1 bis 5 auf die Linien.",
               reihenfolge(["Mila und Jonas langweilen sich.", "Die Kinder gehen in den Estrich.",
                            "Jonas öffnet die Kiste.", "Die Kinder finden die Dose unter der Treppe.",
                            "Die Kinder erzählen alles der Mutter."]),
               min_gap=10 * 2.835),
        Schreiben("Deine Meinung",
                  "Schreibe zwei Sätze: Was würdest du gerne in einer alten Kiste finden?",
                  [("", "Ich würde gerne eine Schatzkarte finden. Dann könnte ich einen Schatz suchen.")],
                  spalten=0, linien=2, nummern=False, pro_item=2,
                  erklaerung="Eigene Antworten. Bewertet werden ganze Sätze, die zur Frage passen."),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Lesetext("Lesen", LESEN, "Kiki ist weg", [
                "Lina hat eine Katze. Sie heisst Kiki. Kiki ist schwarz und hat weisse Pfoten.",
                "Am Montag ist Kiki nicht da. Lina ruft: „Kiki, Kiki!“ Aber Kiki kommt nicht. "
                "Lina sucht im Garten und in der Garage.",
                "Am Abend hört Lina ein leises Miau. Es kommt aus dem Wäschekorb. "
                "Da liegt Kiki. Sie schläft auf den warmen Tüchern. Lina ist froh.",
            ]),
            RichtigFalsch("Richtig oder falsch?",
                          "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                          [("Kiki ist eine Katze.", True, ""),
                           ("Kiki ist weiss mit schwarzen Pfoten.", False, "Sie ist schwarz mit weissen Pfoten."),
                           ("Lina sucht im Garten.", True, "")]),
            Schreiben("Fragen zum Text",
                      "Beantworte die Fragen. Schreibe ganze Sätze.",
                      [("Wie heisst die Katze?", "Die Katze heisst Kiki."),
                       ("Wo findet Lina die Katze?", "Lina findet die Katze im Wäschekorb.")],
                      spalten=0, linien=1, pro_item=2),
            Saetze("Die richtige Reihenfolge",
                   "Schreibe die Zahlen 1 bis 3 auf die Linien.",
                   ["{2}  Lina sucht in der Garage.", "{3}  Lina hört ein Miau.", "{1}  Kiki ist nicht da."],
                   min_gap=10 * 2.835),
        ]
    return [
        Lesetext("Lesen", LESEN, "Leos Drachen", [
            "Im Herbst bastelte Leo mit seinem Vater einen Drachen. Sie nahmen zwei lange Holzstäbe, "
            "rotes Papier und eine lange Schnur. Auf den Drachen malte Leo ein lachendes Gesicht.",
            "Am Samstag war es endlich windig. Leo und sein Vater gingen auf den Hügel hinter dem Dorf. "
            "Leo rannte los, und der Drache stieg hoch in den Himmel. „Er fliegt!“, rief Leo.",
            "Plötzlich kam ein starker Windstoss. Die Schnur riss, und der Drache flog davon. Er landete "
            "in einem hohen Baum. Leo war traurig.",
            "Da kam ein Bauer mit einer langen Leiter. Er holte den Drachen vom Baum. Leo bedankte sich. "
            "Zu Hause klebte er den Drachen wieder zusammen. Am nächsten Tag flog er noch höher.",
        ]),
        RichtigFalsch("Richtig oder falsch?",
                      "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                      [("Der Drache war aus blauem Papier.", False, "Er war aus rotem Papier."),
                       ("Leo und sein Vater gingen auf einen Hügel.", True, ""),
                       ("Die Schnur riss wegen eines Windstosses.", True, ""),
                       ("Der Drache landete im See.", False, "Er landete in einem Baum.")]),
        Schreiben("Fragen zum Text",
                  "Beantworte die Fragen. Schreibe ganze Sätze.",
                  [("Was brauchten Leo und sein Vater für den Drachen?",
                    "Sie brauchten zwei Holzstäbe, rotes Papier und eine Schnur."),
                   ("Warum war Leo traurig?", "Leo war traurig, weil der Drache in einem Baum landete."),
                   ("Wer half Leo?", "Ein Bauer mit einer langen Leiter half Leo.")],
                  spalten=0, linien=1, pro_item=2),
        Saetze("Die richtige Reihenfolge",
               "Schreibe die Zahlen 1 bis 4 auf die Linien.",
               reihenfolge(["Leo bastelt einen Drachen.", "Der Drache steigt in den Himmel.",
                            "Die Schnur reisst.", "Ein Bauer holt den Drachen vom Baum."]),
               min_gap=10 * 2.835),
    ]
