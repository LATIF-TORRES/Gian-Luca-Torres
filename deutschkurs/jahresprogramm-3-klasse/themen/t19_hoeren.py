from werkzeug import Merkkasten, RichtigFalsch, Saetze, Schreiben, Tabelle, vorlesetexte

NR = "19"
TITEL = "Hören: Zuhören und verstehen"
BEREICH = "Hören"
LERNZIELE = ["Du hörst aufmerksam zu.",
             "Du merkst dir wichtige Informationen und machst Notizen.",
             "Du beantwortest Fragen zu einem gehörten Text."]

# Die Vorlesetexte stehen nur im Blatt für die Lehrperson. Aufgaben und Lösungen beziehen sich darauf.
TEXT_U1 = ("Paulas Geburtstag", "Übung · Stufe 1", [
    "Heute ist Paulas Geburtstag. Sie wird neun Jahre alt.",
    "Am Nachmittag kommen vier Freundinnen zu Besuch. Mama hat einen Schokoladenkuchen gebacken. "
    "Auf dem Kuchen stehen neun Kerzen.",
    "Paula bekommt ein Buch und ein rotes Velo. Über das Velo freut sie sich am meisten.",
    "Zuerst spielen die Kinder Verstecken im Garten. Dann essen sie Kuchen und trinken Sirup. "
    "Um sechs Uhr gehen alle nach Hause.",
])
TEXT_U2 = ("Der Schulausflug", "Übung · Stufe 2", [
    "Am Dienstag macht die Klasse 3b einen Ausflug. Um halb acht treffen sich alle Kinder beim Bahnhof. "
    "Frau Keller, die Lehrerin, zählt die Kinder. Es sind zweiundzwanzig. Ein Kind fehlt, weil es krank ist.",
    "Die Klasse fährt mit dem Zug nach Luzern. Die Fahrt dauert eine Stunde. Von Luzern aus fahren sie "
    "mit dem Schiff über den See. Auf dem Schiff essen die Kinder ihr Znüni.",
    "Danach wandern sie zu einer Feuerstelle im Wald. Dort braten sie Würste über dem Feuer. "
    "Leon hat seine Wurst vergessen. Seine Freundin Ayla teilt ihre Wurst mit ihm.",
    "Am Nachmittag beginnt es leicht zu regnen. Die Kinder ziehen ihre Regenjacken an. "
    "Um fünf Uhr sind alle wieder müde, aber glücklich zurück beim Bahnhof.",
])
TEXT_T1 = ("Der neue Hund", "Lernkontrolle · Stufe 1", [
    "Familie Berger hat einen neuen Hund. Er heisst Fips. Fips ist klein und hat braunes Fell.",
    "Fips ist zwei Jahre alt. Er spielt gern mit einem gelben Ball. Am liebsten frisst er Fleisch.",
    "Jeden Morgen geht Tim mit Fips spazieren. Am Abend schläft Fips in seinem Körbchen in der Küche.",
])
TEXT_T2 = ("Im Hallenbad", "Lernkontrolle · Stufe 2", [
    "Am Mittwochnachmittag geht Noah mit seinem Onkel ins Hallenbad. Der Eintritt kostet für Kinder "
    "vier Franken. Noah zieht seine grüne Badehose an.",
    "Zuerst duschen die beiden. Dann springt Noah vom Einmeterbrett. Sein Onkel schwimmt zehn Längen. "
    "Noah übt Tauchen. Er holt einen blauen Ring vom Boden.",
    "Nach zwei Stunden haben beide Hunger. Im Bistro isst Noah eine Portion Pommes frites. "
    "Um vier Uhr fahren sie mit dem Bus nach Hause.",
])

ANLEITUNG = Merkkasten("So geht es", [
    "Deine Lehrperson liest dir einen Text zweimal vor.",
    "- Beim ersten Mal hörst du nur gut zu.",
    "- Beim zweiten Mal darfst du Notizen machen.",
    "- Danach löst du die Aufgaben.",
])


def uebung(stufe):
    if stufe == 1:
        return [
            ANLEITUNG,
            Saetze("Was hast du gehört?",
                   "Kreise die richtige Antwort ein.",
                   ["Paula wird <acht|*neun|zehn> Jahre alt.",
                    "Es kommen <drei|*vier|fünf> Freundinnen.",
                    "Mama backt einen <Apfelkuchen|*Schokoladenkuchen>.",
                    "Paula bekommt ein <blaues|*rotes> Velo."]),
            RichtigFalsch("Richtig oder falsch?",
                          "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                          [("Paula bekommt ein Buch.", True, ""),
                           ("Die Kinder spielen Fussball.", False, "Sie spielen Verstecken."),
                           ("Die Kinder trinken Sirup.", True, "")]),
            Schreiben("Fragen zum Text",
                      "Beantworte die Frage. Schreibe einen ganzen Satz.",
                      [("Worüber freut sich Paula am meisten?", "Paula freut sich am meisten über das Velo."),
                       ("Wann gehen alle nach Hause?", "Alle gehen um sechs Uhr nach Hause.")],
                      spalten=0, linien=1, pro_item=2),
        ]
    return [
        ANLEITUNG,
        Tabelle("Notizen",
                "Schreibe die Informationen in die Tabelle.",
                ["Frage", "Antwort"],
                [["Wann ist der Ausflug?", "{am Dienstag}"],
                 ["Wie viele Kinder sind dabei?", "{zweiundzwanzig (22)}"],
                 ["Wohin fährt die Klasse mit dem Zug?", "{nach Luzern}"],
                 ["Womit fahren sie über den See?", "{mit dem Schiff}"],
                 ["Was braten sie im Wald?", "{Würste}"]],
                breiten=[1.5, 1]),
        RichtigFalsch("Richtig oder falsch?",
                      "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                      [("Die Lehrerin heisst Frau Keller.", True, ""),
                       ("Die Zugfahrt dauert zwei Stunden.", False, "Sie dauert eine Stunde."),
                       ("Leon hat seine Wurst vergessen.", True, ""),
                       ("Am Nachmittag scheint die Sonne.", False, "Es regnet leicht.")]),
        Schreiben("Fragen zum Text",
                  "Beantworte die Fragen. Schreibe ganze Sätze.",
                  [("Warum fehlt ein Kind?", "Ein Kind fehlt, weil es krank ist."),
                   ("Wie hilft Ayla ihrem Freund Leon?", "Ayla teilt ihre Wurst mit Leon."),
                   ("Wie fühlen sich die Kinder am Ende?", "Die Kinder sind müde, aber glücklich.")],
                  spalten=0, linien=1, pro_item=2),
    ]


def test(stufe):
    if stufe == 1:
        return [
            ANLEITUNG,
            Saetze("Was hast du gehört?",
                   "Kreise die richtige Antwort ein.",
                   ["Der Hund heisst <*Fips|Fritz|Felix>.",
                    "Fips hat <schwarzes|*braunes|weisses> Fell.",
                    "Fips ist <*zwei|drei|vier> Jahre alt.",
                    "Fips spielt mit einem <roten|*gelben> Ball."]),
            RichtigFalsch("Richtig oder falsch?",
                          "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                          [("Fips ist ein grosser Hund.", False, "Fips ist klein."),
                           ("Am liebsten frisst Fips Fleisch.", True, "")]),
            Schreiben("Frage zum Text",
                      "Beantworte die Frage. Schreibe einen ganzen Satz.",
                      [("Wo schläft Fips?", "Fips schläft in seinem Körbchen in der Küche.")],
                      spalten=0, linien=1, pro_item=2),
        ]
    return [
        ANLEITUNG,
        Tabelle("Notizen",
                "Schreibe die Informationen in die Tabelle.",
                ["Frage", "Antwort"],
                [["Mit wem geht Noah ins Hallenbad?", "{mit seinem Onkel}"],
                 ["Was kostet der Eintritt für Kinder?", "{vier Franken}"],
                 ["Welche Farbe hat Noahs Badehose?", "{grün}"],
                 ["Was holt Noah beim Tauchen?", "{einen blauen Ring}"]],
                breiten=[1.5, 1]),
        RichtigFalsch("Richtig oder falsch?",
                      "Schreibe R (richtig) oder F (falsch) ins Kästchen.",
                      [("Noah geht am Mittwoch ins Hallenbad.", True, ""),
                       ("Der Onkel schwimmt zwanzig Längen.", False, "Er schwimmt zehn Längen."),
                       ("Sie fahren mit dem Bus nach Hause.", True, "")]),
        Schreiben("Fragen zum Text",
                  "Beantworte die Fragen. Schreibe ganze Sätze.",
                  [("Was machen die beiden zuerst?", "Zuerst duschen die beiden."),
                   ("Was isst Noah im Bistro?", "Noah isst eine Portion Pommes frites.")],
                  spalten=0, linien=1, pro_item=2),
    ]


def extra(folder):
    path = folder / f"{NR}-hoeren-vorlesetexte-lehrperson.pdf"
    n = vorlesetexte(path, TITEL, BEREICH, NR, [TEXT_U1, TEXT_U2, TEXT_T1, TEXT_T2])
    return [(path, n)]
