"""Deutsch «Bildlich ausmalen»: Übungsblatt und Lernkontrolle mit Lösungsblättern.

Aufruf:  python3 bildlich_ausmalen_pdf.py
Ausgabe:
  bildlich-ausmalen-uebungsblatt.pdf   / bildlich-ausmalen-uebungsblatt-loesungen.pdf   (Thema: der Hund, die Katze)
  bildlich-ausmalen-lernkontrolle.pdf  / bildlich-ausmalen-lernkontrolle-loesungen.pdf  (Thema: das Pferd)

Lernziele (Blatt der Lehrperson):
  1. Zu einem Nomen mindestens 10 Nomen, Verben, Adjektive und Textbausteine sammeln
  2. Mit diesen Wörtern einen Text mit ganzen Sätzen schreiben
  3. Die Sätze bildlich ausmalen (Die Kuh frisst Gras. → Auf der Weide frisst die Kuh viel Gras.)
  4. Möglichst viele verschiedene, interessante Wörter verwenden
  5. Rechtschreibung: Nomen und Satzanfänge gross, am Satzende ein Punkt

Das Übungsblatt steigert sich: Stufe 1 (leicht), Stufe 2 (mittel), Königsdisziplin.
Aufgaben mit eindeutiger Lösung werden aus denselben Daten berechnet wie die Aufgabe.
Bei freien Aufgaben zeigt das Lösungsblatt ein Beispiel und sagt, wann eine Lösung richtig ist.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "vorlagen"))

from blatt import (FIG, INK, L, MUTED, PAGE_H, R, SOL, W, answer, build_pdf, checkbox, footer_note,  # noqa: E402
                   header, hline, merkkasten, mm, pdfmetrics, split_lines, task_head, text, word_bank, wrap,
                   write_lines)

OUT_DIR = Path(__file__).parent
SUB = "Deutsch · Bildlich ausmalen"
GOALS = {1: "Wörter sammeln", 2: "Text mit ganzen Sätzen", 3: "Sätze ausmalen", 4: "interessante Wörter",
         5: "Rechtschreibung"}
COLS = ["Nomen", "Verben", "Adjektive", "Textbausteine"]
LINE_GAP = 10 * mm


def goal(*nums):
    return "Lernziel " + ", ".join(f"{n} ({GOALS[n]})" for n in nums)


def word_table(c, y, rows, sol, content=None, size=9):
    """Tabelle mit den 4 Spalten Nomen, Verben, Adjektive, Textbausteine (letzte Spalte breiter)."""
    x0 = L + 9 * mm
    share = [0.22, 0.22, 0.22, 0.34]
    xs = [x0 + sum(share[:k]) * (W - 9 * mm) for k in range(5)]
    for k, h in enumerate(COLS):
        text(c, xs[k] + 1 * mm, y, h, 9.5, "Sans-Bold", FIG)
    y -= 2.5 * mm
    hline(c, x0, R, y, INK, 0.8)
    content = content or {}
    for r in range(rows):
        yy = y - (r + 1) * 9 * mm + 0.8 * mm
        for k, col in enumerate(COLS):
            vals = content.get(col, [])
            val = vals[r] if r < len(vals) else ""
            width = xs[k + 1] - xs[k] - 4 * mm
            assert pdfmetrics.stringWidth(val, "Sans-Bold", size) < width - 1 * mm, val
            answer(c, xs[k] + 1 * mm, yy, width, sol, val, size)
    return y - rows * 9 * mm - 8 * mm


def wrong_text(sentences):
    """Text ohne Grossbuchstaben und ohne Punkte."""
    return " ".join(s.rstrip(".").lower() for s in sentences)


def count_caps(sentences):
    return sum(1 for s in sentences for w_ in s.split() if w_[0].isupper())


def text_lines(c, y, s, width, n, sol, size=10.5):
    """Schreiblinien; im Lösungsblatt der Text s, auf die Linien verteilt."""
    lines = split_lines(s, width - 2 * mm, size, "Sans-Bold") if sol else []
    assert len(lines) <= n, (s, len(lines), n)
    return write_lines(c, L + 9 * mm, y, width, n, LINE_GAP, lines, size)


def note(c, y, s, x=L + 9 * mm):
    return wrap(c, x, y, s, R - x, 8.5, color=SOL) - 1.5 * mm


# ===========================================================================
# Übungsblatt (Thema der Hund, Königsdisziplin die Katze)
# ===========================================================================
U_SORT = {
    "Nomen": ["der Knochen", "die Leine", "das Fell", "der Schwanz"],
    "Verben": ["bellen", "rennen", "schnüffeln", "fressen"],
    "Adjektive": ["treu", "flauschig", "laut", "verspielt"],
    "Textbausteine": ["den Ball holen", "Gassi gehen", "an der Leine ziehen", "mit dem Schwanz wedeln"],
}
U_SORT_ORDER = ["bellen", "der Knochen", "treu", "den Ball holen", "rennen", "flauschig", "die Leine",
                "Gassi gehen", "laut", "schnüffeln", "das Fell", "an der Leine ziehen", "verspielt", "fressen",
                "der Schwanz", "mit dem Schwanz wedeln"]
assert sorted(U_SORT_ORDER) == sorted(w_ for v in U_SORT.values() for w_ in v)

U_FIX = ["Der Hund Bello wohnt in Basel.", "Jeden Morgen holt er die Zeitung.",
         "Am Nachmittag spielt er mit seinem Ball."]
U_FIX_NOUNS = ["Hund", "Bello", "Basel", "Morgen", "Zeitung", "Nachmittag", "Ball"]
assert all(any(n in s.split(" ") or n + "." in s.split(" ") for s in U_FIX) for n in U_FIX_NOUNS)

U_PAINT = [  # (Satz, Fragen, Hilfswörter, Beispiel)
    ("Der Hund bellt.", "Wann? Wie?", ["in der Nacht", "laut"], "In der Nacht bellt der Hund laut."),
    ("Der Hund rennt.", "Wo? Wie?", ["über die Wiese", "schnell"], "Der Hund rennt schnell über die Wiese."),
    ("Der Hund frisst.", "Was? Wo?", ["einen Knochen", "in seinem Korb"], "Der Hund frisst in seinem Korb einen Knochen."),
    ("Der Hund schläft.", "Wo? Wann?", [], "Am Abend schläft der müde Hund auf dem weichen Sofa."),
]
U_BETTER = [  # (Satz, langweiliges Wort, besseres Wort aus dem Kasten)
    ("Der Hund geht schnell über die Wiese.", "geht", "flitzt"),
    ("Der Hund macht laut.", "macht", "bellt"),
    ("Der Hund isst einen Knochen.", "isst", "frisst"),
    ("Der Hund hat ein schönes Fell.", "schönes", "glänzendes"),
]
U_CAT_WORDS = {
    "Nomen": ["die Pfote", "die Maus", "das Fell", "die Krallen"],
    "Verben": ["schnurren", "klettern", "jagen", "schleichen"],
    "Adjektive": ["weich", "neugierig", "flink", "getigert"],
    "Textbausteine": ["Milch schlecken", "Mäuse fangen", "auf den Baum klettern", "in der Sonne liegen"],
}
U_CAT_TEXT = ("Unsere Katze Mimi hat ein weiches, getigertes Fell. Am Morgen schleckt sie in der Küche ihre Milch. "
              "Danach schleicht sie leise durch den Garten. Neugierig klettert sie auf den hohen Baum. "
              "Am Nachmittag liegt sie faul in der warmen Sonne und schnurrt.")
CHECK = ["Ich habe mindestens 10 Wörter gesammelt.", "Ich habe mindestens 5 ganze Sätze geschrieben.",
         "Meine Sätze sind ausgemalt: Man sieht ein Bild im Kopf.", "Ich habe interessante Wörter verwendet.",
         "Nomen und Satzanfänge schreibe ich gross. Am Satzende steht ein Punkt."]


def u_page1(c, sol):
    header(c, "Übungsblatt Deutsch", SUB + " · Seite 1", name_fields=not sol)
    y = PAGE_H - 37 * mm
    y = merkkasten(c, y, "Merke: Sätze bildlich ausmalen", [
        "Ein ausgemalter Satz ist so genau, dass man ein Bild im Kopf sieht. Frage dich: Wo? Wann? Wie? Was?",
        "**Die Kuh frisst Gras.  →  Auf der Weide frisst die Kuh viel Gras.",
        "Nomen: Namen für Dinge, Tiere und Menschen. Sie haben einen Begleiter: der Hund, die Leine, das Fell.",
        "Verben: Was tut jemand? bellen, rennen.     Adjektive: Wie ist etwas? treu, laut.",
        "Textbausteine: Wörter, die zusammengehören: Gras fressen, Fliegen vertreiben, Milch geben.",
    ])
    y = task_head(c, y, 1, "Wörter zum Thema «der Hund» sortieren",
                  "Schreibe jedes Wort aus dem Kasten in die richtige Spalte. In jede Spalte gehören genau 4 Wörter.",
                  goal(1), level=1)
    y = word_bank(c, L + 9 * mm, y, U_SORT_ORDER, W - 9 * mm) - 6 * mm
    y = word_table(c, y, 4, sol, U_SORT, 9)

    y = task_head(c, y - 2 * mm, 2, "Gross oder klein?",
                  "In diesem Text ist alles klein geschrieben, und die Punkte fehlen.  "
                  f"a) Unterstreiche alle Nomen. Es sind {len(U_FIX_NOUNS)} Nomen.  "
                  f"b) Schreibe den Text richtig ab. Nomen und Satzanfänge schreibst du gross. Am Ende von jedem Satz "
                  f"setzt du einen Punkt. Der Text hat {len(U_FIX)} Sätze.", goal(5), level=1)
    y = draw_wrong_text(c, y, U_FIX, U_FIX_NOUNS, sol)
    y = text_lines(c, y - 3 * mm, " ".join(U_FIX), W - 9 * mm, 3, sol)
    footer_note(c, sol, 1, y)
    c.showPage()


def draw_wrong_text(c, y, sentences, nouns, sol, size=11.5):
    """Der falsche Text gross gedruckt; im Lösungsblatt sind die Nomen rot unterstrichen."""
    noun_set = {n.lower() for n in nouns}
    x = L + 9 * mm
    sp = pdfmetrics.stringWidth(" ", "Sans", size)
    found = 0
    for w_ in wrong_text(sentences).split(" "):
        ww = pdfmetrics.stringWidth(w_, "Sans", size)
        if x + ww > R:
            x = L + 9 * mm
            y -= 7.5 * mm
        text(c, x, y, w_, size)
        if sol and w_ in noun_set:
            found += 1
            c.setStrokeColor(SOL)
            c.setLineWidth(1.4)
            c.line(x, y - 1.3 * mm, x + ww, y - 1.3 * mm)
        x += ww + sp
    if sol:
        assert found == len(nouns), (found, nouns)
    return y - 9 * mm


def u_page2(c, sol):
    header(c, "Übungsblatt Deutsch", SUB + " · Seite 2", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 3, "Sätze ausmalen",
                  "Male den Satz aus. Beantworte dafür die Fragen. Schreibe den neuen Satz auf die Linie.  "
                  "Bei a), b) und c) helfen dir Wörter. Bei d) findest du eigene Wörter.", goal(3), level=2)
    for i, (s, q, helpers, ex) in enumerate(U_PAINT):
        lbl = f"{'abcd'[i]})  {s}"
        text(c, L + 9 * mm, y, lbl, 11, "Sans-Bold")
        info = f"Fragen: {q}" + (f"     Hilfe: {', '.join(helpers)}" if helpers else "     Hilfe: keine")
        text(c, L + 9 * mm + pdfmetrics.stringWidth(lbl, "Sans-Bold", 11) + 5 * mm, y, info, 9, "Sans", MUTED)
        for h in helpers:
            assert h.lower() in ex.lower(), (h, ex)
        y = write_lines(c, L + 15 * mm, y - 9 * mm, W - 15 * mm, 1, LINE_GAP, [ex] if sol else [], 10.5) - 2 * mm
    if sol:
        y = note(c, y + 4 * mm, "Das sind Beispiele. Richtig ist jeder ganze Satz, der die Fragen beantwortet, "
                 "mit grossem Anfang und Punkt am Ende. Die Wörter dürfen auch anders stehen: "
                 "«Der Hund bellt laut in der Nacht.»")
    y -= 4 * mm

    y = task_head(c, y, 4, "Interessante Wörter",
                  "Das fett gedruckte Wort ist langweilig. Ersetze es durch ein besseres Wort aus dem Kasten. "
                  "Schreibe den ganzen Satz neu auf. Jedes Wort im Kasten passt genau einmal.", goal(4), level=2)
    y = word_bank(c, L + 9 * mm, y, sorted(b for _, _, b in U_BETTER), W - 9 * mm) - 7 * mm
    for i, (s, boring, better) in enumerate(U_BETTER):
        assert s.count(boring) == 1
        pre, post = s.split(boring)
        x = L + 9 * mm
        lbl = f"{'abcd'[i]})  {pre}"
        text(c, x, y, lbl, 10.5)
        x += pdfmetrics.stringWidth(lbl, "Sans", 10.5)
        text(c, x, y, boring, 10.5, "Sans-Bold")
        x += pdfmetrics.stringWidth(boring, "Sans-Bold", 10.5)
        text(c, x, y, post, 10.5)
        y = write_lines(c, L + 15 * mm, y - 8.5 * mm, W - 15 * mm, 1, LINE_GAP,
                        [pre + better + post] if sol else [], 10.5) - 2 * mm
    footer_note(c, sol, 2, y)
    c.showPage()


def u_page3(c, sol):
    header(c, "Übungsblatt Deutsch", SUB + " · Seite 3", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 5, "Dein eigener Text: «die Katze»",
                  "a) Sammle mindestens 10 Wörter zum Thema «die Katze». Schreibe in jede Spalte mindestens 2 Wörter.  "
                  "Ideen: Wie sieht die Katze aus? Was macht sie? Wo ist sie? Was frisst sie?  "
                  "b) Schreibe mit deinen Wörtern einen Text mit mindestens 5 ganzen Sätzen. Male jeden Satz aus.  "
                  "c) Lies deinen Text noch einmal. Mache ein Häkchen, wenn es stimmt.", goal(1, 2, 3, 4, 5), level=3)
    text(c, L + 9 * mm, y, "a)", 10, "Sans-Bold", FIG)
    y = word_table(c, y - 6 * mm, 4, sol, U_CAT_WORDS, 9)
    text(c, L + 9 * mm, y, "b)", 10, "Sans-Bold", FIG)
    y = text_lines(c, y - 6 * mm, U_CAT_TEXT, W - 9 * mm, 8, sol) - 2 * mm
    text(c, L + 9 * mm, y, "c)", 10, "Sans-Bold", FIG)
    for k, item in enumerate(CHECK):
        checkbox(c, L + 16 * mm, y)
        text(c, L + 22 * mm, y, item, 9.5)
        y -= 6.5 * mm
    if sol:
        y = note(c, y, "Wörter und Text sind ein Beispiel. Viele Lösungen sind richtig, wenn die Punkte der "
                 "Checkliste stimmen.")
    footer_note(c, sol, 3, y)
    c.showPage()


# ===========================================================================
# Lernkontrolle (Thema das Pferd)
# ===========================================================================
T_WORDS = {
    "Nomen": ["die Mähne", "der Sattel", "der Stall", "das Heu"],
    "Verben": ["galoppieren", "wiehern", "springen", "fressen"],
    "Adjektive": ["stark", "schnell", "braun", "elegant"],
    "Textbausteine": ["Heu fressen", "über die Weide galoppieren", "mit dem Schweif wedeln", "laut wiehern"],
}
T_FIX = ["Das Pferd Luna steht im Stall.", "Am Morgen frisst es Heu."]
T_FIX_NOUNS = ["Pferd", "Luna", "Stall", "Morgen", "Heu"]
T_PAINT = [("Das Pferd galoppiert.", "Wo? Wie?", "Das Pferd galoppiert schnell über die grüne Weide."),
           ("Das Pferd wiehert.", "Wann? Wie?", "Am Morgen wiehert das Pferd fröhlich im Stall."),
           ("Das Pferd frisst.", "Was? Wo?", "Im Stall frisst das hungrige Pferd frisches Heu.")]
T_TEXT = ("Mein Pferd heisst Luna und hat eine lange, braune Mähne. Am Morgen frisst Luna im Stall frisches Heu. "
          "Danach lege ich ihr den Sattel auf den Rücken. Zusammen galoppieren wir schnell über die Weide. "
          "Mit dem Schweif vertreibt Luna die lästigen Fliegen. Am Abend wiehert sie leise in ihrem Stall.")
T_RASTER = [("Mindestens 6 ganze Sätze", 2), ("Die Sätze sind bildlich ausgemalt", 2),
            ("Viele verschiedene, interessante Wörter", 2), ("Mindestens 5 Wörter aus Aufgabe 1 verwendet", 2),
            ("Nomen und Satzanfänge gross, Punkt am Satzende", 2)]
T_POINTS = {1: 10, 2: count_caps(T_FIX) + len(T_FIX), 3: 2 * len(T_PAINT), 4: sum(p for _, p in T_RASTER)}
T_TOTAL = sum(T_POINTS.values())


def t_page1(c, sol):
    header(c, "Lernkontrolle Deutsch", SUB + " · Seite 1", name_fields=not sol)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 1, "Wörter sammeln: «das Pferd»",
                  "Sammle mindestens 10 Wörter zum Thema «das Pferd». Schreibe in jede Spalte mindestens 2 Wörter.  "
                  "Schreibe bei den Nomen den Begleiter dazu (der, die, das).", goal(1), points=T_POINTS[1])
    y = word_table(c, y, 4, sol, T_WORDS, 9)
    if sol:
        y = note(c, y + 2 * mm, "Beispiele. 1 Punkt pro passendes Wort in der richtigen Spalte, höchstens 10 Punkte.")

    y = task_head(c, y - 2 * mm, 2, "Gross oder klein?",
                  "Schreibe den Text richtig ab. Nomen und Satzanfänge schreibst du gross. Am Ende von jedem Satz "
                  f"setzt du einen Punkt. Der Text hat {len(T_FIX)} Sätze.", goal(5), points=T_POINTS[2])
    y = draw_wrong_text(c, y, T_FIX, T_FIX_NOUNS, False)
    y = text_lines(c, y - 3 * mm, " ".join(T_FIX), W - 9 * mm, 2, sol)
    if sol:
        y = note(c, y + 3 * mm, f"1 Punkt pro richtigen Grossbuchstaben ({count_caps(T_FIX)}) und pro Punkt "
                 f"({len(T_FIX)}).")

    y = task_head(c, y - 2 * mm, 3, "Sätze ausmalen",
                  "Male den Satz aus. Beantworte dafür die Fragen. Schreibe den neuen Satz auf die Linie.", goal(3),
                  points=T_POINTS[3])
    for i, (s, q, ex) in enumerate(T_PAINT):
        lbl = f"{'abc'[i]})  {s}"
        text(c, L + 9 * mm, y, lbl, 11, "Sans-Bold")
        text(c, L + 9 * mm + pdfmetrics.stringWidth(lbl, "Sans-Bold", 11) + 5 * mm, y, f"Fragen: {q}", 9, "Sans", MUTED)
        y = write_lines(c, L + 15 * mm, y - 9 * mm, W - 15 * mm, 1, LINE_GAP, [ex] if sol else [], 10.5) - 2 * mm
    if sol:
        y = note(c, y + 4 * mm, "Beispiele. Je 2 Punkte: 1 Punkt, wenn beide Fragen beantwortet sind. 1 Punkt für einen "
                 "ganzen Satz mit grossem Anfang und Punkt.")
    footer_note(c, sol, 1, y)
    c.showPage()


def t_page2(c, sol):
    header(c, "Lernkontrolle Deutsch", SUB + " · Seite 2", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 4, "Text schreiben: «das Pferd»",
                  "Schreibe einen Text über ein Pferd. Schreibe mindestens 6 ganze Sätze.  "
                  "Verwende mindestens 5 Wörter aus Aufgabe 1. Male deine Sätze aus.  "
                  "Achte auf die Rechtschreibung: Nomen und Satzanfänge gross, am Satzende ein Punkt.",
                  goal(2, 3, 4, 5), points=T_POINTS[4])
    y = text_lines(c, y - 2 * mm, T_TEXT, W - 9 * mm, 11, sol) - 3 * mm

    text(c, L + 9 * mm, y, "Darauf achtet die Lehrperson", 10, "Sans-Bold")
    y -= 6.5 * mm
    for item, p in T_RASTER:
        text(c, L + 9 * mm, y, "•  " + item, 9.5)
        text(c, R - 30 * mm, y, f"___ / {p} P.", 9.5, "Sans", MUTED)
        y -= 6 * mm
    if sol:
        y = note(c, y, "Der Text oben ist ein Beispiel. Pro Zeile im Raster: 2 P. = erfüllt, 1 P. = teilweise, "
                 "0 P. = nicht erfüllt.")
    y -= 4 * mm
    c.setStrokeColor(INK)
    c.setLineWidth(1)
    c.roundRect(R - 66 * mm, y - 9 * mm, 66 * mm, 13 * mm, 3 * mm, stroke=1, fill=0)
    text(c, R - 62 * mm, y - 3.6 * mm, f"Total:  _____ / {T_TOTAL} Punkte", 11.5, "Sans-Bold")
    if sol:
        yy = y
        for ln in [f"Punkte: Aufgabe 1: {T_POINTS[1]} · 2: {T_POINTS[2]} · 3: {T_POINTS[3]} · 4: {T_POINTS[4]}",
                   f"Richtwert: ab {round(T_TOTAL * 0.9)} P. sehr gut · ab {round(T_TOTAL * 0.78)} P. gut",
                   f"ab {round(T_TOTAL * 0.62)} P. Lernziele erreicht"]:
            text(c, L, yy, ln, 8, "Sans", SOL)
            yy -= 4.2 * mm
    footer_note(c, sol, 2, y - 9 * mm)
    c.showPage()


def build():
    for stem, title, pages in [("bildlich-ausmalen-uebungsblatt", "Übungsblatt Deutsch: Bildlich ausmalen",
                                [u_page1, u_page2, u_page3]),
                               ("bildlich-ausmalen-lernkontrolle", "Lernkontrolle Deutsch: Bildlich ausmalen",
                                [t_page1, t_page2])]:
        for sol in (False, True):
            build_pdf(OUT_DIR / (stem + ("-loesungen" if sol else "") + ".pdf"), title, pages, sol)


if __name__ == "__main__":
    build()
