# Jahresprogramm Deutsch – 3. Klasse

20 Themen für das ganze Schuljahr (Lehrplan 21, Zyklus 2): Hören, Lesen, Schreiben, Grammatik
und Rechtschreibung. Jedes Thema gibt es in zwei Stufen:

- **★ Stufe 1 · Grundlagen** – für Förderschüler: grössere Schrift, weniger Aufgaben,
  Wörterkästen, Beispiele und Tipps.
- **★★ Stufe 2 · Standard** – Anforderungen der 3. Klasse.

Pro Thema und Stufe: **Übungsblatt** und **Lernkontrolle** (mit Punkten und Notenvorschlag),
jeweils mit **Lösungsblatt** (dieselben Seiten, Lösungen rot eingetragen).

| Nr | Thema | Bereich |
|----|-------|---------|
| 01 | Nomen | Grammatik |
| 02 | Begleiter: der, die, das | Grammatik |
| 03 | Verben | Grammatik |
| 04 | Gegenwart und Vergangenheit | Grammatik |
| 05 | Adjektive | Grammatik |
| 06 | Pronomen | Grammatik |
| 07 | Satzarten und Satzzeichen | Grammatik |
| 08 | Satzbau und Satzglieder | Grammatik |
| 09 | Das Komma | Grammatik |
| 10 | Wörtliche Rede | Grammatik |
| 11 | Wortfamilien und zusammengesetzte Wörter | Grammatik |
| 12 | Abc und Wörterbuch | Rechtschreibung |
| 13 | Silben und Trennen | Rechtschreibung |
| 14 | Doppelte Mitlaute, ck und tz | Rechtschreibung |
| 15 | Lange Selbstlaute: ie, h, aa, ee, oo | Rechtschreibung |
| 16 | Verlängern und Ableiten | Rechtschreibung |
| 17 | Lesen: Geschichten verstehen | Lesen |
| 18 | Lesen: Sachtexte verstehen | Lesen |
| 19 | Hören: Zuhören und verstehen (mit Vorlesetexten) | Hören |
| 20 | Schreiben: Eine Geschichte erzählen | Schreiben |

## Dateien

- `pdf/00-jahresplan.pdf` – Übersicht, Reihenfolge im Schuljahr, Klassenliste
- `pdf/<Nr>-<thema>/` – je 8 PDFs (Übung/Lernkontrolle × Stufe 1/2 × Kind/Lösungen)
- `pdf/sammelmappen/` – alle Blätter einer Stufe in einer Datei (für Kinder bzw. mit Lösungen)

## Neu erzeugen

```
python3 erzeugen.py          # alles
python3 erzeugen.py 05 09    # nur einzelne Themen
```

Inhalte stehen in `themen/tNN_*.py`, das Layout in `werkzeug.py`. Die Lösungen werden aus
denselben Daten gezeichnet wie die Aufgaben (Kurzschrift: `{Lücke}`, `[markieren]`,
`<a|*richtig|c>`, siehe `werkzeug.py`).
