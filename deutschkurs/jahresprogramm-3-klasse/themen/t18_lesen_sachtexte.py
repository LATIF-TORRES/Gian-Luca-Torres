from werkzeug import Lesetext, RichtigFalsch, Saetze, Schreiben, Tabelle

NR = "18"
TITEL = "Lesen: Sachtexte verstehen"
BEREICH = "Lesen"
LERNZIELE = ["Du liest einen Sachtext und findest wichtige Informationen.",
             "Du füllst einen Steckbrief aus.",
             "Du beantwortest Fragen in ganzen Sätzen."]

LESEN = "Lies den Sachtext genau. Du darfst ihn zweimal lesen."


def uebung(stufe):
    if stufe == 1:
        return [
            Lesetext("Lesen", LESEN, "Der Igel", [
                "Der Igel ist ein kleines Tier. Er hat viele Stacheln auf dem Rücken. "
                "Ein Igel hat etwa 7000 Stacheln.",
                "Am Tag schläft der Igel. In der Nacht sucht er Futter. Er frisst Käfer, Würmer und Schnecken.",
                "Wenn Gefahr kommt, rollt sich der Igel zu einer Kugel zusammen. Dann sieht man nur noch Stacheln.",
                "Im Winter macht der Igel einen Winterschlaf. Er schläft in einem Nest aus Blättern.",
            ]),
            Tabelle("Steckbrief",
                    "Fülle den Steckbrief aus. Die Antworten stehen im Text.",
                    ["Frage", "Antwort"],
                    [["Was hat der Igel auf dem Rücken?", "{Stacheln}"],
                     ["Wie viele Stacheln hat er?", "{etwa 7000}"],
                     ["Wann sucht er Futter?", "{in der Nacht}"],
                     ["Was frisst er?", "{Käfer, Würmer, Schnecken}"],
                     ["Wo schläft er im Winter?", "{in einem Nest aus Blättern}"]],
                    breiten=[1.2, 1]),
            RichtigFalsch("Richtig oder falsch?",
                          "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                          [("Der Igel schläft am Tag.", True, ""),
                           ("Der Igel frisst Äpfel.", False, "Er frisst Käfer, Würmer und Schnecken."),
                           ("Bei Gefahr rollt sich der Igel zusammen.", True, "")]),
            Schreiben("Fragen zum Text",
                      "Beantworte die Frage. Schreibe einen ganzen Satz.",
                      [("Was macht der Igel im Winter?", "Der Igel macht im Winter einen Winterschlaf.")],
                      spalten=0, linien=1, pro_item=2),
        ]
    return [
        Lesetext("Lesen", LESEN, "Bienen – kleine Tiere, grosse Arbeit", [
            "Bienen leben in grossen Gruppen zusammen. Eine Gruppe nennt man Bienenvolk. "
            "Im Sommer leben in einem Bienenstock bis zu 50 000 Bienen.",
            "In jedem Volk gibt es eine Königin. Sie ist grösser als die anderen Bienen und legt alle Eier. "
            "An einem Tag kann sie bis zu 2000 Eier legen.",
            "Die meisten Bienen sind Arbeiterinnen. Sie haben viele Aufgaben: Sie putzen den Stock, "
            "füttern die jungen Bienen und bauen Waben aus Wachs. Die älteren Arbeiterinnen fliegen hinaus "
            "und sammeln Nektar und Blütenstaub.",
            "Aus dem Nektar machen die Bienen Honig. Für ein Glas Honig müssen die Bienen viele tausend "
            "Blüten besuchen.",
            "Bienen sind sehr wichtig für uns Menschen. Wenn sie von Blüte zu Blüte fliegen, tragen sie "
            "Blütenstaub mit. So können Äpfel, Kirschen und viele andere Früchte wachsen.",
        ]),
        Tabelle("Steckbrief",
                "Fülle den Steckbrief aus.",
                ["Frage", "Antwort"],
                [["Wie heisst eine Gruppe von Bienen?", "{ein Bienenvolk}"],
                 ["Wie viele Bienen leben im Sommer in einem Stock?", "{bis zu 50 000}"],
                 ["Wer legt die Eier?", "{die Königin}"],
                 ["Woraus bauen die Bienen Waben?", "{aus Wachs}"],
                 ["Woraus machen die Bienen Honig?", "{aus Nektar}"]],
                breiten=[1.5, 1]),
        RichtigFalsch("Richtig oder falsch?",
                      "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                      [("Die Königin ist kleiner als die Arbeiterinnen.", False, "Sie ist grösser."),
                       ("Die Königin kann an einem Tag bis zu 2000 Eier legen.", True, ""),
                       ("Junge Arbeiterinnen sammeln Nektar.", False, "Die älteren sammeln Nektar."),
                       ("Ohne Bienen wachsen weniger Früchte.", True, "")]),
        Schreiben("Fragen zum Text",
                  "Beantworte die Fragen. Schreibe ganze Sätze.",
                  [("Nenne zwei Aufgaben der Arbeiterinnen im Stock.",
                    "Sie putzen den Stock und füttern die jungen Bienen."),
                   ("Warum sind Bienen wichtig für uns Menschen?",
                    "Sie tragen Blütenstaub von Blüte zu Blüte, so können Früchte wachsen.")],
                  spalten=0, linien=2, pro_item=2),
        Saetze("Wörter erklären",
               "Was bedeutet das Wort? Kreise die richtige Erklärung ein.",
               ["Wabe:\t<*Zimmer aus Wachs für Honig und Eier|ein Bienenstachel>",
                "Nektar:\t<*süsser Saft in Blüten|ein Teil vom Bienenstock>"],
               tab=27 * 2.835),
    ]


def test(stufe):
    if stufe == 1:
        return [
            Lesetext("Lesen", LESEN, "Das Eichhörnchen", [
                "Das Eichhörnchen lebt im Wald und in Parks. Es hat ein rotbraunes Fell und einen buschigen Schwanz.",
                "Eichhörnchen können sehr gut klettern und springen. Sie fressen Nüsse, Samen und Pilze.",
                "Im Herbst vergraben sie Nüsse im Boden. Im Winter suchen sie die Nüsse wieder. "
                "Manche Nüsse finden sie nicht mehr. Daraus wachsen neue Bäume.",
            ]),
            Tabelle("Steckbrief",
                    "Fülle den Steckbrief aus.",
                    ["Frage", "Antwort"],
                    [["Wo lebt das Eichhörnchen?", "{im Wald und in Parks}"],
                     ["Welche Farbe hat sein Fell?", "{rotbraun}"],
                     ["Was frisst es?", "{Nüsse, Samen, Pilze}"]],
                    breiten=[1.2, 1]),
            RichtigFalsch("Richtig oder falsch?",
                          "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                          [("Eichhörnchen können gut klettern.", True, ""),
                           ("Im Frühling vergraben sie Nüsse.", False, "Im Herbst.")]),
            Schreiben("Frage zum Text",
                      "Beantworte die Frage. Schreibe einen ganzen Satz.",
                      [("Was passiert mit den Nüssen, die das Eichhörnchen nicht mehr findet?",
                        "Aus den Nüssen wachsen neue Bäume.")],
                      spalten=0, linien=1, pro_item=2),
        ]
    return [
        Lesetext("Lesen", LESEN, "Wie entsteht Regen?", [
            "Wasser ist immer unterwegs. Die Sonne wärmt das Wasser in Meeren, Seen und Flüssen. "
            "Dabei wird ein Teil des Wassers zu Wasserdampf. Den Dampf kann man nicht sehen. "
            "Er steigt mit der warmen Luft nach oben.",
            "Hoch oben ist die Luft kalt. Dort wird der Wasserdampf wieder zu winzigen Wassertröpfchen. "
            "Viele Tröpfchen zusammen bilden eine Wolke.",
            "In der Wolke stossen die Tröpfchen zusammen und werden immer grösser und schwerer. "
            "Wenn sie zu schwer sind, fallen sie als Regen auf die Erde. Ist es sehr kalt, fällt Schnee.",
            "Das Regenwasser fliesst in Bäche, Flüsse und Seen und schliesslich ins Meer. "
            "Dann beginnt alles wieder von vorne. Das nennt man den Wasserkreislauf.",
        ]),
        Saetze("Die richtige Reihenfolge",
               "Bringe die Schritte in die richtige Reihenfolge. Schreibe die Zahlen 1 bis 4 auf die Linien.",
               ["{3}  Viele Tröpfchen bilden eine Wolke.",
                "{1}  Die Sonne wärmt das Wasser.",
                "{4}  Schwere Tropfen fallen als Regen.",
                "{2}  Wasserdampf steigt nach oben."],
               min_gap=10 * 2.835),
        RichtigFalsch("Richtig oder falsch?",
                      "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                      [("Wasserdampf kann man gut sehen.", False, "Man kann ihn nicht sehen."),
                       ("Hoch oben ist die Luft kalt.", True, ""),
                       ("Wenn es sehr kalt ist, fällt Schnee.", True, "")]),
        Schreiben("Fragen zum Text",
                  "Beantworte die Fragen. Schreibe ganze Sätze.",
                  [("Wann fallen die Tropfen aus der Wolke?", "Die Tropfen fallen, wenn sie zu schwer sind."),
                   ("Was ist der Wasserkreislauf?",
                    "Das Wasser steigt auf, bildet Wolken, regnet ab und fliesst ins Meer – immer wieder.")],
                  spalten=0, linien=2, pro_item=2),
    ]
