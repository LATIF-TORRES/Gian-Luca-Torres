"""Erzeugt das Übungsblatt und das Lösungsblatt zu Nomen, Verben und Adjektiven (3. Klasse).

Aufruf:  python3 wortarten_pdf.py
Ausgabe: wortarten-uebungsblatt.pdf (2 Seiten), wortarten-loesungsblatt.pdf (1 Seite)
"""
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("Sans", f"{FONT_DIR}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Sans-Bold", f"{FONT_DIR}/DejaVuSans-Bold.ttf"))

OUT_DIR = Path(__file__).parent
PAGE_W, PAGE_H = A4
L, R = 16 * mm, PAGE_W - 16 * mm
W = R - L

INK = HexColor("#1d2433")
MUTED = HexColor("#5a6478")
LINE = HexColor("#9aa5ba")
SOFT = HexColor("#f1f4f8")
ACCENT = HexColor("#2b4fd8")
RED = HexColor("#c8281c")

# ---------- Inhalt ----------
WORDS = ["hund", "rennen", "gross", "schule", "lachen", "rot",
         "apfel", "schlafen", "lustig", "baum", "schreiben", "kalt",
         "lehrerin", "springen", "schnell", "fenster", "essen", "müde"]
SORTED = {
    "Nomen": ["Hund", "Schule", "Apfel", "Baum", "Lehrerin", "Fenster"],
    "Verben": ["rennen", "lachen", "schlafen", "schreiben", "springen", "essen"],
    "Adjektive": ["gross", "rot", "lustig", "kalt", "schnell", "müde"],
}

STORY = ("Am Samstag geht Lena mit ihrem kleinen Bruder in den Wald. Die Sonne scheint hell. "
         "Ein brauner Hase hüpft über den Weg. Lena lacht laut. Ihr Bruder sammelt grüne Blätter. "
         "Dann essen die Kinder ein feines Picknick.")
STORY_SOL = {
    "Nomen": ["Samstag", "Lena", "Bruder", "Wald", "Sonne", "Hase", "Weg", "Lena", "Bruder",
              "Blätter", "Kinder", "Picknick"],
    "Verben": ["geht", "scheint", "hüpft", "lacht", "sammelt", "essen"],
    "Adjektive": ["kleinen", "hell", "brauner", "laut", "grüne", "feines"],
}

LOWER = [("die katze trinkt warme milch.", "Die Katze trinkt warme Milch.", 2),
         ("im garten wächst ein grosser baum.", "Im Garten wächst ein grosser Baum.", 2),
         ("mein freund hat einen roten ball.", "Mein Freund hat einen roten Ball.", 2),
         ("am morgen putzt lea ihre zähne.", "Am Morgen putzt Lea ihre Zähne.", 3)]

VERB_GAPS = [("Der Vogel", "hoch in der Luft.", "fliegt"),
             ("Die Kinder", "im Schwimmbad.", "schwimmen / baden / spielen"),
             ("Mama", "einen Kuchen.", "backt / isst / schneidet"),
             ("Der Hund", "laut.", "bellt")]
ADJ_GAPS = [("der", "Elefant", "grosse / graue / dicke"),
            ("die", "Suppe", "heisse / feine / warme"),
            ("das", "Auto", "schnelle / rote / neue"),
            ("der", "Mond", "helle / runde / gelbe")]

ODD = [(["Tisch", "Haus", "laufen", "Katze"], "laufen", "Verb"),
       (["singen", "malen", "Blume", "tanzen"], "Blume", "Nomen"),
       (["klein", "weich", "lesen", "süss"], "lesen", "Verb"),
       (["Auto", "fröhlich", "Schuh", "Brot"], "fröhlich", "Adjektiv")]

POINTS = [18, 24, 9, 8, 8]
TOTAL = sum(POINTS)

MERK = [
    ("Nomen", "Namenwörter",
     ["Menschen, Tiere, Pflanzen", "und Dinge.", "Man schreibt sie gross."],
     "Trick: der, die oder das passt davor.", "der Hund · die Blume · das Haus"),
    ("Verben", "Tunwörter",
     ["Sie sagen, was jemand", "tut oder was passiert."],
     "Trick: ich, du oder er passt davor.", "ich renne · du lachst · er isst"),
    ("Adjektive", "Wiewörter",
     ["Sie sagen, wie etwas", "ist oder aussieht."],
     "Trick: der … Hund. Wie ist der Hund?", "gross · rot · lustig · müde"),
]


# ---------- Hilfen ----------
def text(c, x, y, s, size=10.5, font="Sans", color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, s)


def wrapped(c, x, y, s, width, size=10.5, font="Sans", leading=None, color=INK):
    leading = leading or size * 1.35
    lines = simpleSplit(s, font, size, width)
    for ln in lines:
        text(c, x, y, ln, size, font, color)
        y -= leading
    return y


def hline(c, x0, x1, y, color=LINE, width=0.6):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x0, y, x1, y)


def task_head(c, y, nr, title, points, instruction):
    """Aufgabenkopf mit Nummernkreis und Punktefeld; gibt die neue y-Position zurück."""
    c.setFillColor(INK)
    c.circle(L + 3.4 * mm, y + 1.3 * mm, 3.4 * mm, stroke=0, fill=1)
    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Sans-Bold", 10)
    c.drawCentredString(L + 3.4 * mm, y - 0.2 * mm, str(nr))
    text(c, L + 9 * mm, y, title, 12.5, "Sans-Bold")
    if points:
        text(c, R - 24 * mm, y, f"____ / {points} P.", 10, "Sans", MUTED)
    return wrapped(c, L + 9 * mm, y - 6 * mm, instruction, W - 9 * mm, 10, color=MUTED) - 2 * mm


def header(c, title, sub, name_fields=True):
    text(c, L, PAGE_H - 20 * mm, title, 18, "Sans-Bold")
    text(c, L, PAGE_H - 26.5 * mm, sub, 10, "Sans", MUTED)
    if name_fields:
        text(c, R - 72 * mm, PAGE_H - 18 * mm, "Name:", 10)
        hline(c, R - 59 * mm, R, PAGE_H - 18.6 * mm)
        text(c, R - 72 * mm, PAGE_H - 26 * mm, "Datum:", 10)
        hline(c, R - 59 * mm, R, PAGE_H - 26.6 * mm)
    hline(c, L, R, PAGE_H - 31 * mm, INK, 1)


# ---------- Übungsblatt ----------
def merkkasten(c, y):
    gap = 4 * mm
    bw = (W - 2 * gap) / 3
    bh = 50 * mm
    for i, (name, de, rule, trick, ex) in enumerate(MERK):
        x = L + i * (bw + gap)
        c.setFillColor(SOFT)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.8)
        c.roundRect(x, y - bh, bw, bh, 3 * mm, stroke=1, fill=1)
        # Farbkästchen zum Ausmalen
        c.setFillColor(HexColor("#ffffff"))
        c.setStrokeColor(INK)
        c.rect(x + bw - 10 * mm, y - 10 * mm, 6.5 * mm, 6.5 * mm, stroke=1, fill=1)
        text(c, x + bw - 20.5 * mm, y - 12.8 * mm, "meine Farbe", 6, "Sans", MUTED)
        text(c, x + 3.5 * mm, y - 8 * mm, name, 13, "Sans-Bold")
        text(c, x + 3.5 * mm, y - 12.8 * mm, de, 8.5, "Sans", MUTED)
        yy = y - 19 * mm
        for ln in rule:
            text(c, x + 3.5 * mm, yy, ln, 8.5)
            yy -= 4 * mm
        yy = wrapped(c, x + 3.5 * mm, yy - 1 * mm, trick, bw - 7 * mm, 8, "Sans-Bold", 3.8 * mm)
        text(c, x + 3.5 * mm, y - bh + 4 * mm, ex, 7.5, "Sans", ACCENT)
    return y - bh - 7 * mm


def aufgabe1(c, y):
    y = task_head(c, y, 1, "Wörter sortieren", POINTS[0],
                  "Schreibe jedes Wort in die richtige Spalte. Achtung: Hier sind alle Wörter "
                  "klein geschrieben. Schreibe die Nomen gross!")
    # Wörterkasten
    box_h = 15 * mm
    c.setStrokeColor(LINE)
    c.setDash(2, 2)
    c.roundRect(L, y - box_h, W, box_h, 2 * mm, stroke=1, fill=0)
    c.setDash()
    cw = W / 9
    for i, w in enumerate(WORDS):
        col, row = i % 9, i // 9
        c.setFillColor(INK)
        c.setFont("Sans", 10.5)
        c.drawCentredString(L + cw * (col + 0.5), y - 6 * mm - row * 5.5 * mm, w)
    y -= box_h + 6 * mm
    # Tabelle
    colw = W / 3
    for i, name in enumerate(SORTED):
        x = L + i * colw
        text(c, x + 2 * mm, y, name, 11, "Sans-Bold")
        for k in range(6):
            hline(c, x + 2 * mm, x + colw - 4 * mm, y - 8 * mm - k * 7.5 * mm)
    return y - 8 * mm - 5 * 7.5 * mm - 9 * mm


def aufgabe2(c, y):
    y = task_head(c, y, 2, "Wörter-Detektiv im Text", POINTS[1],
                  "Male im Text alle Nomen, Verben und Adjektive in deinen drei Farben an "
                  "(siehe Merkkasten). Tipp: Es sind 12 Nomen, 6 Verben und 6 Adjektive.")
    box_top = y + 1 * mm
    yy = wrapped(c, L + 5 * mm, y - 6 * mm, STORY, W - 10 * mm, 13, "Sans", 9.5 * mm)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.roundRect(L, yy + 3 * mm, W, box_top - yy - 3 * mm, 3 * mm, stroke=1, fill=0)
    y = yy - 4 * mm
    text(c, L, y, "Ich habe gefunden:", 10)
    for i, name in enumerate(SORTED):
        x = L + 38 * mm + i * 45 * mm
        hline(c, x, x + 10 * mm, y - 0.6 * mm)
        text(c, x + 12 * mm, y, name, 10)
    return y - 10 * mm


def aufgabe3(c, y):
    y = task_head(c, y, 3, "Nomen schreibt man gross", POINTS[2],
                  "Hier hat jemand alles klein geschrieben. Schreibe die Sätze richtig ab. "
                  "Denk an die Nomen und an den Satzanfang!")
    for low, _, _ in LOWER:
        text(c, L + 9 * mm, y - 2 * mm, low, 11)
        hline(c, L + 9 * mm, R, y - 11 * mm)
        y -= 15 * mm
    return y - 2 * mm


def aufgabe4(c, y):
    y = task_head(c, y, 4, "Was passt?", POINTS[3],
                  "a) Setze ein passendes Verb ein.   b) Setze ein passendes Adjektiv ein.")
    text(c, L + 9 * mm, y - 1 * mm, "a)", 10.5, "Sans-Bold")
    for i, (a, b, _) in enumerate(VERB_GAPS):
        yy = y - 1 * mm - i * 8.5 * mm
        text(c, L + 16 * mm, yy, a, 11)
        x0 = L + 16 * mm + pdfmetrics.stringWidth(a, "Sans", 11) + 2 * mm
        hline(c, x0, x0 + 32 * mm, yy - 0.8 * mm)
        text(c, x0 + 34 * mm, yy, b, 11)
    y -= 4 * 8.5 * mm + 4 * mm
    text(c, L + 9 * mm, y, "b)", 10.5, "Sans-Bold")
    for i, (art, noun, _) in enumerate(ADJ_GAPS):
        col, row = i % 2, i // 2
        x = L + 16 * mm + col * 82 * mm
        yy = y - row * 9 * mm
        text(c, x, yy, art, 11)
        x0 = x + pdfmetrics.stringWidth(art, "Sans", 11) + 2 * mm
        hline(c, x0, x0 + 32 * mm, yy - 0.8 * mm)
        text(c, x0 + 34 * mm, yy, noun, 11)
    return y - 9 * mm - 10 * mm


def aufgabe5(c, y):
    y = task_head(c, y, 5, "Wer passt nicht in die Reihe?", POINTS[4],
                  "In jeder Reihe ist ein Wort eine andere Wortart. Kreise es ein und schreibe "
                  "die Wortart dazu.")
    for i, (row, _, _) in enumerate(ODD):
        yy = y - 2 * mm - i * 9.5 * mm
        text(c, L + 9 * mm, yy, f"{i + 1}.", 11, "Sans-Bold")
        for k, w in enumerate(row):
            text(c, L + 17 * mm + k * 27 * mm, yy, w, 11.5)
        text(c, L + 127 * mm, yy, "→", 11, "Sans", MUTED)
        hline(c, L + 134 * mm, R, yy - 0.8 * mm)
    return y - 2 * mm - 4 * 9.5 * mm - 4 * mm


def bonus_and_total(c, y):
    text(c, L, y, "Bonus:", 11, "Sans-Bold", ACCENT)
    wrapped(c, L + 16 * mm, y, "Schreibe einen eigenen Satz mit einem Nomen, einem Verb und einem "
            "Adjektiv. Male die drei Wörter in deinen Farben an.", W - 16 * mm, 10)
    hline(c, L, R, y - 13 * mm)
    hline(c, L, R, y - 22 * mm)
    # Punkte
    bx, bw, bh = R - 62 * mm, 62 * mm, 13 * mm
    by = 9 * mm
    c.setStrokeColor(INK)
    c.setLineWidth(1)
    c.roundRect(bx, by, bw, bh, 3 * mm, stroke=1, fill=0)
    text(c, bx + 4 * mm, by + 5 * mm, f"Total:  ______ / {TOTAL} Punkte", 11, "Sans-Bold")
    text(c, L, by + 5 * mm, "So ging es mir:", 11, "Sans")
    for k, mood in enumerate((1, 0, -1)):
        smiley(c, L + 40 * mm + k * 12 * mm, by + 6.5 * mm, mood)


def smiley(c, cx, cy, mood):
    """Gesicht zum Ankreuzen: mood 1 = froh, 0 = neutral, -1 = traurig."""
    r = 4 * mm
    c.setStrokeColor(INK)
    c.setLineWidth(0.8)
    c.circle(cx, cy, r, stroke=1, fill=0)
    c.setFillColor(INK)
    c.circle(cx - 1.4 * mm, cy + 1.1 * mm, 0.45 * mm, stroke=0, fill=1)
    c.circle(cx + 1.4 * mm, cy + 1.1 * mm, 0.45 * mm, stroke=0, fill=1)
    if mood == 0:
        c.line(cx - 1.6 * mm, cy - 1.5 * mm, cx + 1.6 * mm, cy - 1.5 * mm)
    else:
        p = c.beginPath()
        mid = cy - 1.5 * mm - mood * 0.9 * mm
        p.moveTo(cx - 1.8 * mm, cy - 1.5 * mm)
        p.curveTo(cx - 0.8 * mm, mid, cx + 0.8 * mm, mid, cx + 1.8 * mm, cy - 1.5 * mm)
        c.drawPath(p, stroke=1, fill=0)


def uebungsblatt():
    out = OUT_DIR / "wortarten-uebungsblatt.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Übungsblatt: Nomen, Verben, Adjektive (3. Klasse)")
    header(c, "Nomen, Verben, Adjektive", "Übungsblatt Deutsch · 3. Klasse · Seite 1")
    y = PAGE_H - 38 * mm
    text(c, L, y, "Merkkasten", 11, "Sans-Bold")
    text(c, L + 29 * mm, y, "Male das Kästchen oben rechts in einer Farbe an. Mit dieser Farbe "
         "arbeitest du in Aufgabe 2.", 8.5, "Sans", MUTED)
    y = merkkasten(c, y - 4 * mm)
    y = aufgabe1(c, y)
    aufgabe2(c, y)
    c.showPage()

    header(c, "Nomen, Verben, Adjektive", "Übungsblatt Deutsch · 3. Klasse · Seite 2", name_fields=False)
    y = PAGE_H - 40 * mm
    y = aufgabe3(c, y)
    y = aufgabe4(c, y)
    y = aufgabe5(c, y)
    bonus_and_total(c, y)
    c.showPage()
    c.save()
    print(out)


# ---------- Lösungsblatt ----------
def loesungsblatt():
    out = OUT_DIR / "wortarten-loesungsblatt.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Lösungsblatt: Nomen, Verben, Adjektive (3. Klasse)")
    header(c, "Lösungen: Nomen, Verben, Adjektive", "Für die Lehrperson · 3. Klasse", name_fields=False)
    y = PAGE_H - 40 * mm

    def sol_head(nr, title, pts, note=""):
        nonlocal y
        text(c, L, y, f"{nr}. {title}", 11.5, "Sans-Bold")
        text(c, R - 20 * mm, y, f"{pts} P.", 10, "Sans-Bold", RED)
        y -= 5 * mm
        if note:
            y = wrapped(c, L, y, note, W, 8.5, color=MUTED) - 1 * mm

    sol_head(1, "Wörter sortieren", POINTS[0], "1 Punkt pro richtig einsortiertem Wort. "
             "Nomen klein geschrieben: Wort zählt, Hinweis zur Grossschreibung geben.")
    colw = W / 3
    for i, (name, words) in enumerate(SORTED.items()):
        x = L + i * colw
        text(c, x, y, name, 10, "Sans-Bold")
        for k, w in enumerate(words):
            text(c, x, y - 5 * mm - k * 4.6 * mm, w, 10, color=RED)
    y -= 5 * mm + 6 * 4.6 * mm + 4 * mm

    sol_head(2, "Wörter-Detektiv im Text", POINTS[1], "1 Punkt pro richtig markiertem Wort. "
             "„Lena“ und „Bruder“ kommen je zweimal vor. „hell“ und „laut“ zählen in der "
             "3. Klasse als Adjektive (Wiewörter: Wie scheint die Sonne? Wie lacht Lena?).")
    for name, words in STORY_SOL.items():
        text(c, L, y, f"{name} ({len(words)}):", 10, "Sans-Bold")
        y = wrapped(c, L + 30 * mm, y, ", ".join(words), W - 30 * mm, 10, color=RED) - 1.5 * mm
    y -= 2 * mm

    sol_head(3, "Nomen schreibt man gross", POINTS[2], "1 Punkt pro richtig gross geschriebenem "
             "Nomen. Der Satzanfang wird kontrolliert, gibt aber keinen Punkt.")
    for _, right, n in LOWER:
        text(c, L, y, right, 10.5, color=RED)
        text(c, R - 30 * mm, y, f"({n} Nomen)", 9, "Sans", MUTED)
        y -= 5 * mm
    y -= 3 * mm

    sol_head(4, "Was passt?", POINTS[3], "1 Punkt pro passendem Wort. Andere sinnvolle "
             "Lösungen sind auch richtig.")
    for a, b, sol in VERB_GAPS:
        text(c, L, y, f"a)  {a} … {b}", 10)
        text(c, L + 80 * mm, y, sol, 10, color=RED)
        y -= 4.8 * mm
    for art, noun, sol in ADJ_GAPS:
        text(c, L, y, f"b)  {art} … {noun}", 10)
        text(c, L + 80 * mm, y, sol, 10, color=RED)
        y -= 4.8 * mm
    y -= 3 * mm

    sol_head(5, "Wer passt nicht in die Reihe?", POINTS[4], "Je 1 Punkt für das richtige Wort "
             "und 1 Punkt für die richtige Wortart.")
    for i, (row, odd, kind) in enumerate(ODD):
        text(c, L, y, f"{i + 1}.  " + " – ".join(row), 10)
        text(c, L + 80 * mm, y, f"{odd}  →  {kind}", 10, color=RED)
        y -= 4.8 * mm
    y -= 4 * mm

    text(c, L, y, f"Total: {TOTAL} Punkte", 11.5, "Sans-Bold")
    y -= 6 * mm
    scale = [("sehr gut", 60), ("gut", 50), ("genügend", 40), ("noch üben", 0)]
    text(c, L, y, "Vorschlag Bewertung:  " + "   ·   ".join(
        f"{lbl} ab {p} P." if p else f"{lbl} unter 40 P." for lbl, p in scale), 9.5, "Sans", MUTED)
    c.showPage()
    c.save()
    print(out)


if __name__ == "__main__":
    uebungsblatt()
    loesungsblatt()
