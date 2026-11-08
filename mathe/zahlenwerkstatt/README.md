# Zahlenwerkstatt

Eine Lernplattform für Mathematik in der 3., 4. und 5. Klasse. Die Kinder üben mit Zahlen in sieben Spielen.
Die Inhalte passen zum Lehrplan 21 (Mathematik, Zyklus 2).

## Starten

Doppelklicke auf `index.html`. Die App läuft im Browser, auf dem Computer, Tablet oder Handy.
Sie braucht keine Installation. Nur die Schriften werden aus dem Internet geladen. Ohne Internet erscheint eine Ersatzschrift.

## Klassen und Stufen

Jede Klasse hat drei Stufen. Der Zahlenraum steigt von Stufe zu Stufe:

| Klasse | Stufe 1: Einstieg | Stufe 2: Sicher | Stufe 3: Königsdisziplin |
| --- | --- | --- | --- |
| 3. Klasse | bis 1'000 | bis 100'000 | bis 1'000'000 |
| 4. Klasse | bis 100'000 | bis 1'000'000 | bis 1'000'000, schwer |
| 5. Klasse | bis 1'000'000 | bis 1 Milliarde | bis 1 Milliarde, dazu Dezimalzahlen und Brüche |

In der 3. Klasse rechnen die Kinder mit grossen Zahlen vereinfacht: Sie lesen und legen Zahlen (Stellenwerttafel mit Spalte M),
ordnen sie am Zahlenstrahl, rechnen mit runden Zahlen (300'000 + 200'000) und ergänzen in Schritten bis 1'000'000
(zuerst bis zum nächsten Hunderttausender, dann bis 1'000'000). Das Einmaleins bleibt in allen Stufen dabei.

In der 4. Klasse kommen nicht runde Zahlen bis 1'000'000 dazu (345'600 + 120'300, 7 × 30'000, 240'000 : 8).
In der 5. Klasse geht es bis 1 Milliarde (Millionen, Milliarden, Stellenwerttafel bis HM), dazu Dezimalzahlen, Brüche und Teilbarkeit.

Alle Stufen sind immer offen. So kann die Lehrperson jedem Kind die passende Stufe geben.

## Die sieben Spiele

| Spiel | Was geübt wird | Lehrplan 21 |
| --- | --- | --- |
| Kopfrechnen-Rallye | 90 Sekunden Kopfrechnen: plus, minus, mal, geteilt, ergänzen; in der 5. Klasse auch Dezimalzahlen und Bruchteile | MA.1.A.3 |
| Zahlenstrahl | Zahlen auf dem Zahlenstrahl finden, auch Dezimalzahlen | MA.1.A.2 |
| Stellenwert-Werkstatt | Zahlen mit Plättchen legen (E bis HM), Zahlwörter lesen, bündeln (14 H = 1 T und 4 H) | MA.1.A.1 |
| Zahlenmauern | Fehlende Steine ausrechnen, auch von oben nach unten (Umkehraufgaben) | MA.1.B.1 |
| Zahlenjagd | Alle Zahlen finden, die zu einer Regel passen: gerade, grösser als, gerundet, teilbar | MA.1.A.2, MA.1.B.1 |
| Im Dorfladen | Mit Schweizer Münzen und Noten genau bezahlen, Rückgeld ausrechnen, mit möglichst wenig Stück bezahlen | MA.3.A.1 |
| Rechen-Memory | Rechnung und Ergebnis finden; Zahlwort und Zahl; in der 5. Klasse Dezimalzahl und Bruch | MA.1.A.3 |

Für jedes Spiel gibt es bis zu 3 Sterne. Am Ende zeigt die App, was das Kind noch üben kann.
Mit 2 Sternen in jedem Spiel einer Stufe bekommt das Kind ein Abzeichen.

## Hinweise

- Alle Aufgaben werden zufällig erzeugt. Jede Lösung rechnet das Programm aus denselben Zahlen aus, aus denen die Aufgabe entsteht.
- Geldbeträge sind immer auf 5 Rappen gerundet. Die Münzen sind im richtigen Grössenverhältnis gezeichnet.
- Zahlen ab 1000 stehen mit Apostroph (30'400), Geld mit „Fr.“ (Fr. 13.40).
- Die Sterne werden nur im Browser auf diesem Gerät gespeichert. Es werden keine Daten verschickt.

## Dateien

- `index.html` – die Seite
- `styles.css` – Aussehen (Häuschenpapier, helles und dunkles Design)
- `js/util.js` – Zahlenformat, Zahlwörter, Tastenfeld, Ton, Speicher
- `js/aufgaben.js` – alle Aufgaben-Generatoren pro Klasse und Stufe
- `js/spiele.js` – die sieben Spiele
- `js/app.js` – Startseite, Übersicht, Auswertung
- `pruefen.js` – prüft mit Node.js tausende Aufgaben pro Klasse und Stufe (`node pruefen.js`)
