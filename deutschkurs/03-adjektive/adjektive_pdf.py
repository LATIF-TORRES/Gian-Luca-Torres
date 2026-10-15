"""Erzeugt das Übungsblatt und das Lösungsblatt zu Adjektiven und ihrer Steigerung (3. Klasse).

Aufruf:  python3 adjektive_pdf.py
Ausgabe: adjektive-uebungsblatt.pdf (2 Seiten), adjektive-loesungsblatt.pdf (1 Seite)
"""
from pathlib import Path

from reportlab.lib.colors import HexColor, white
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
ACCENT = HexColor("#0f8a6a")
STEP = [HexColor("#c9ece0"), HexColor("#8fd6bd"), HexColor("#3fae8a")]
RED = HexColor("#c8281c")

# ---------- Inhalt ----------
FIND = [("Die alte Katze schläft auf dem warmen Sofa.", ["alte", "warmen"]),
        ("Mein Bruder hat einen neuen Velohelm.", ["neuen"]),
        ("Der Apfel ist süss und saftig.", ["süss", "saftig"]),
        ("Im dunklen Wald ist es still.", ["dunklen", "still"]),
        ("Lisa trägt eine blaue Jacke.", ["blaue"])]

OPPOSITES = [("gross", "klein"), ("warm", "kalt"), ("schnell", "langsam"), ("laut", "leise"),
             ("hell", "dunkel"), ("nass", "trocken"), ("schwer", "leicht"), ("alt", "jung / neu")]

# (Grundform, Vergleichsform, Höchstform); None = Lücke, die das Kind ausfüllt
STEIGERUNG = [("schnell", "schneller", "am schnellsten"),
              ("lang", "länger", "am längsten"),
              ("warm", "wärmer", "am wärmsten"),
              ("alt", "älter", "am ältesten"),
              ("dick", "dicker", "am dicksten"),
              ("hoch", "höher", "am höchsten"),
              ("gut", "besser", "am besten"),
              ("viel", "mehr", "am meisten")]
GIVEN = [0, 0, 0, 0, 1, 0, 0, 0]  # welche Spalte vorgegeben ist (0 = Grundform, 1 = Vergleichsform)

KIDS = [("Tim", "1,30 m"), ("Mia", "1,25 m"), ("Ben", "1,40 m")]
KIDS_GAPS = [("Mia ist", "als Tim.", "kleiner"),
             ("Ben ist", "als Mia.", "grösser"),
             ("Ben ist", ".", "am grössten"),
             ("Mia ist", ".", "am kleinsten")]

WIE_ALS = [("Lea ist so alt", "Nico.", "wie"),
           ("Ein Elefant ist schwerer", "eine Maus.", "als"),
           ("Mein Velo ist schneller", "dein Trottinett.", "als"),
           ("Der Tee ist so heiss", "die Suppe.", "wie")]

MISTAKES = [("Das ist das guteste Eis der Welt.", "guteste", "beste"),
            ("Mein Turm ist höcher als deiner.", "höcher", "höher"),
            ("Der Hund rennt am schnellste.", "am schnellste", "am schnellsten"),
            ("Opa ist älter wie Oma.", "wie", "als")]

POINTS = [8, 8, 16, 4, 4, 4]  # Index: 0 finden, 1 Gegenteil, 2 Treppe, 3 Grössen, 4 wie/als, 5 Fehler
TOTAL = sum(POINTS)


# ---------- Hilfen ----------
def text(c, x, y, s, size=10.5, font="Sans", color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, s)


def ctext(c, x, y, s, size=10.5, font="Sans", color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawCentredString(x, y, s)


def wrapped(c, x, y, s, width, size=10.5, font="Sans", leading=None, color=INK):
    leading = leading or size * 1.35
    for ln in simpleSplit(s, font, size, width):
        text(c, x, y, ln, size, font, color)
        y -= leading
    return y


def hline(c, x0, x1, y, color=LINE, width=0.6):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x0, y, x1, y)


def width(s, size=11, font="Sans"):
    return pdfmetrics.stringWidth(s, font, size)


def task_head(c, y, nr, title, points, instruction):
    c.setFillColor(INK)
    c.circle(L + 3.4 * mm, y + 1.3 * mm, 3.4 * mm, stroke=0, fill=1)
    ctext(c, L + 3.4 * mm, y - 0.2 * mm, str(nr), 10, "Sans-Bold", white)
    text(c, L + 9 * mm, y, title, 12.5, "Sans-Bold")
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


def smiley(c, cx, cy, mood):
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


# ---------- Übungsblatt ----------
def merkkasten(c, y):
    bh = 58 * mm
    c.setFillColor(SOFT)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.roundRect(L, y - bh, W, bh, 3 * mm, stroke=1, fill=1)
    x = L + 5 * mm
    text(c, x, y - 8 * mm, "Merkkasten: Adjektive (Wiewörter)", 12.5, "Sans-Bold")
    yy = y - 15 * mm
    for ln in ["Adjektive sagen, wie etwas ist:", "gross, rot, weich, lustig, kalt …",
               "Man schreibt sie klein.", "",
               "Mit Adjektiven kann man vergleichen.", "Das nennt man Steigerung."]:
        if ln:
            text(c, x, yy, ln, 9.5, "Sans-Bold" if ln.startswith("Man schreibt") else "Sans")
        yy -= 4.6 * mm
    yy -= 1 * mm
    text(c, x, yy, "Gleich:", 9, "Sans-Bold")
    text(c, x + 16 * mm, yy, "Lea ist so gross wie Nico.", 9)
    text(c, x, yy - 4.6 * mm, "Anders:", 9, "Sans-Bold")
    text(c, x + 16 * mm, yy - 4.6 * mm, "Lea ist grösser als Nico.", 9)

    # Treppe: drei Stufen der Steigerung
    sx, base = L + 101 * mm, y - bh + 7 * mm
    sw = 25 * mm
    labels = [("Grundform", "gross"), ("Vergleichsform", "grösser"), ("Höchstform", "am grössten")]
    for i, (lbl, word) in enumerate(labels):
        h = (9 + i * 7.5) * mm
        c.setFillColor(STEP[i])
        c.rect(sx + i * sw, base, sw, h, stroke=0, fill=1)
        ctext(c, sx + i * sw + sw / 2, base + h - 6 * mm, word, 9.5, "Sans-Bold",
              white if i == 2 else INK)
        ctext(c, sx + i * sw + sw / 2, base - 4.5 * mm, lbl, 7.5, "Sans", MUTED)
    text(c, sx, y - 8 * mm, "Achtung, Ausnahmen:", 8.5, "Sans-Bold", RED)
    text(c, sx, y - 12.5 * mm, "gut – besser – am besten", 8.5)
    text(c, sx, y - 16.5 * mm, "viel – mehr – am meisten", 8.5)
    text(c, sx, y - 20.5 * mm, "Oft mit Umlaut: alt – älter, warm – wärmer", 8, "Sans", MUTED)
    return y - bh - 8 * mm


def aufgabe1(c, y):
    y = task_head(c, y, 1, "Adjektive finden", POINTS[0],
                  "Unterstreiche alle Adjektive. Tipp: Es sind 8.")
    for s, _ in FIND:
        text(c, L + 9 * mm, y - 1 * mm, s, 12)
        y -= 8.5 * mm
    return y - 4 * mm


def aufgabe2(c, y):
    y = task_head(c, y, 2, "Das Gegenteil", POINTS[1],
                  "Schreibe zu jedem Adjektiv das Gegenteil.")
    colw = (W - 9 * mm) / 2
    for i, (a, _) in enumerate(OPPOSITES):
        col, row = i % 2, i // 2
        x = L + 9 * mm + col * colw
        yy = y - 1 * mm - row * 9 * mm
        text(c, x, yy, a, 12)
        text(c, x + 22 * mm, yy, "↔", 11, "Sans", MUTED)
        hline(c, x + 30 * mm, x + colw - 8 * mm, yy - 0.8 * mm)
    return y - 1 * mm - 4 * 9 * mm


def aufgabe3(c, y):
    y = task_head(c, y, 4, "Die Steigerungs-Treppe", POINTS[2],
                  "Fülle die Tabelle aus. Die erste Zeile ist ein Beispiel.")
    cols = ["Grundform", "Vergleichsform", "Höchstform"]
    cw = (W - 9 * mm) / 3
    x0 = L + 9 * mm
    rh = 8.2 * mm
    c.setFillColor(SOFT)
    c.rect(x0, y - rh + 2 * mm, W - 9 * mm, rh, stroke=0, fill=1)
    for i, h in enumerate(cols):
        text(c, x0 + i * cw + 3 * mm, y - 3.5 * mm, h, 10, "Sans-Bold")
    y -= rh + 1 * mm
    rows = [("klein", "kleiner", "am kleinsten")] + STEIGERUNG
    for r, words in enumerate(rows):
        yy = y - r * rh
        for i, w in enumerate(words):
            x = x0 + i * cw + 3 * mm
            if r == 0:
                text(c, x, yy - 1 * mm, w, 11, "Sans", ACCENT)
            elif GIVEN[r - 1] == i:
                text(c, x, yy - 1 * mm, w, 11, "Sans-Bold")
            else:
                if i == 2:
                    text(c, x, yy - 1 * mm, "am", 11, "Sans", MUTED)
                    hline(c, x + 8 * mm, x + cw - 6 * mm, yy - 1.8 * mm)
                else:
                    hline(c, x, x + cw - 6 * mm, yy - 1.8 * mm)
        hline(c, x0, R, yy - rh + 3.5 * mm, SOFT, 0.6)
    return y - len(rows) * rh - 4 * mm


def aufgabe4(c, y):
    y = task_head(c, y, 5, "Wer ist am grössten?", POINTS[3],
                  "Schau die Grössen an und ergänze die Sätze.")
    # kleine Messlatte
    bx = L + 9 * mm
    for i, (n, h) in enumerate(KIDS):
        x = bx + i * 24 * mm
        hval = float(h.split()[0].replace(",", "."))
        bar = (hval - 1.0) * 60 * mm
        c.setFillColor(STEP[i])
        c.rect(x, y - 28 * mm, 14 * mm, bar, stroke=0, fill=1)
        ctext(c, x + 7 * mm, y - 28 * mm + bar + 1.5 * mm, h, 8.5, "Sans", MUTED)
        ctext(c, x + 7 * mm, y - 32.5 * mm, n, 10, "Sans-Bold")
    tx = L + 85 * mm
    for i, (a, b, _) in enumerate(KIDS_GAPS):
        yy = y - 4 * mm - i * 8 * mm
        text(c, tx, yy, a, 11)
        x0 = tx + width(a) + 2 * mm
        hline(c, x0, x0 + 30 * mm, yy - 0.8 * mm)
        text(c, x0 + 31 * mm, yy, b, 11)
    return y - 42 * mm


def gap_rows(c, y, rows, gap_w):
    for i, (a, b, _) in enumerate(rows):
        yy = y - 1 * mm - i * 8 * mm
        text(c, L + 9 * mm, yy, a, 11)
        x0 = L + 9 * mm + width(a) + 2 * mm
        hline(c, x0, x0 + gap_w, yy - 0.8 * mm)
        text(c, x0 + gap_w + 2 * mm, yy, b, 11)
    return y - 1 * mm - len(rows) * 8 * mm


def aufgabe5(c, y):
    y = task_head(c, y, 3, "wie oder als?", POINTS[4],
                  "Gleich gross → wie.  Unterschiedlich → als.  Setze das richtige Wort ein.")
    return gap_rows(c, y, WIE_ALS, 14 * mm) - 3 * mm


def aufgabe6(c, y):
    y = task_head(c, y, 6, "Fehler-Detektiv", POINTS[5],
                  "In jedem Satz ist ein Fehler. Streiche das falsche Wort durch und schreibe es richtig auf die Linie.")
    for i, (s, _, _) in enumerate(MISTAKES):
        yy = y - 1 * mm - i * 8.5 * mm
        text(c, L + 9 * mm, yy, s, 11)
        text(c, L + 112 * mm, yy, "→", 11, "Sans", MUTED)
        hline(c, L + 119 * mm, R, yy - 0.8 * mm)
    return y - 1 * mm - 4 * 8.5 * mm - 4 * mm


def footer(c, y):
    text(c, L, y, "Bonus:", 11, "Sans-Bold", ACCENT)
    wrapped(c, L + 16 * mm, y, "Vergleiche dich mit jemandem aus deiner Familie. Schreibe zwei Sätze, "
            "z. B.: Ich bin kleiner als mein Bruder.", W - 16 * mm, 10)
    hline(c, L, R, y - 13 * mm)
    hline(c, L, R, y - 22 * mm)
    bx, bw, bh, by = R - 62 * mm, 62 * mm, 13 * mm, 9 * mm
    c.setStrokeColor(INK)
    c.setLineWidth(1)
    c.roundRect(bx, by, bw, bh, 3 * mm, stroke=1, fill=0)
    text(c, bx + 4 * mm, by + 5 * mm, f"Total:  ______ / {TOTAL} Punkte", 11, "Sans-Bold")
    text(c, L, by + 5 * mm, "So ging es mir:", 11)
    for k, mood in enumerate((1, 0, -1)):
        smiley(c, L + 40 * mm + k * 12 * mm, by + 6.5 * mm, mood)


def uebungsblatt():
    out = OUT_DIR / "adjektive-uebungsblatt.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Übungsblatt: Adjektive und Steigerung (3. Klasse)")
    header(c, "Adjektive und Steigerung", "Übungsblatt Deutsch · 3. Klasse · Seite 1")
    y = merkkasten(c, PAGE_H - 36 * mm)
    y = aufgabe1(c, y)
    y = aufgabe2(c, y) - 6 * mm
    aufgabe5(c, y)          # „wie oder als?“ ist Aufgabe 3
    c.showPage()

    header(c, "Adjektive und Steigerung", "Übungsblatt Deutsch · 3. Klasse · Seite 2", name_fields=False)
    y = aufgabe3(c, PAGE_H - 38 * mm)   # Treppe = Aufgabe 4
    y = aufgabe4(c, y)                  # Grössen = Aufgabe 5
    y = aufgabe6(c, y)
    footer(c, y)
    c.showPage()
    c.save()
    print(out)


# ---------- Lösungsblatt ----------
def loesungsblatt():
    out = OUT_DIR / "adjektive-loesungsblatt.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Lösungsblatt: Adjektive und Steigerung (3. Klasse)")
    header(c, "Lösungen: Adjektive und Steigerung", "Für die Lehrperson · 3. Klasse", name_fields=False)
    y = PAGE_H - 40 * mm

    def head(nr, title, pts, note=""):
        nonlocal y
        text(c, L, y, f"{nr}. {title}", 11.5, "Sans-Bold")
        text(c, R - 20 * mm, y, f"{pts} P.", 10, "Sans-Bold", RED)
        y -= 5 * mm
        if note:
            y = wrapped(c, L, y, note, W, 8.5, color=MUTED) - 1 * mm

    head(1, "Adjektive finden", POINTS[0], "1 Punkt pro Adjektiv. „still“ zählt als Adjektiv (Wie ist es im Wald?).")
    for s, adj in FIND:
        text(c, L, y, s, 10)
        text(c, L + 100 * mm, y, ", ".join(adj), 10, color=RED)
        y -= 4.8 * mm
    y -= 3 * mm

    head(2, "Das Gegenteil", POINTS[1], "1 Punkt pro passendem Gegenteil.")
    for i, (a, b) in enumerate(OPPOSITES):
        col, row = i % 2, i // 2
        text(c, L + col * 90 * mm, y - row * 4.8 * mm, f"{a}  ↔", 10)
        text(c, L + col * 90 * mm + 25 * mm, y - row * 4.8 * mm, b, 10, color=RED)
    y -= 4 * 4.8 * mm + 3 * mm

    head(3, "wie oder als?", POINTS[4])
    for a, b, sol in WIE_ALS:
        text(c, L, y, f"{a} ", 10)
        x = L + width(a + " ", 10)
        text(c, x, y, sol, 10, "Sans-Bold", RED)
        text(c, x + width(sol + " ", 10, "Sans-Bold"), y, b, 10)
        y -= 4.8 * mm
    y -= 3 * mm

    head(4, "Die Steigerungs-Treppe", POINTS[2], "1 Punkt pro Lücke (8 Zeilen × 2 Lücken). "
         "Fehlender Umlaut (z. B. „langer“): kein Punkt, Umlaut besprechen.")
    for i, (a, b, s) in enumerate(STEIGERUNG):
        col, row = i % 2, i // 2
        x = L + col * 90 * mm
        text(c, x, y - row * 4.8 * mm, f"{a} – {b} – {s}", 10, color=RED)
    y -= 4 * 4.8 * mm + 3 * mm

    head(5, "Wer ist am grössten?", POINTS[3], "Tim 1,30 m · Mia 1,25 m · Ben 1,40 m")
    for a, b, sol in KIDS_GAPS:
        text(c, L, y, f"{a} ", 10)
        x = L + width(a + " ", 10)
        text(c, x, y, sol, 10, "Sans-Bold", RED)
        rest = "." if b == "." else " " + b
        text(c, x + width(sol, 10, "Sans-Bold"), y, rest, 10)
        y -= 4.8 * mm
    y -= 3 * mm

    head(6, "Fehler-Detektiv", POINTS[5])
    for s, wrong, right in MISTAKES:
        text(c, L, y, s, 10)
        text(c, L + 100 * mm, y, f"{wrong}  →  {right}", 10, color=RED)
        y -= 4.8 * mm
    y -= 4 * mm

    text(c, L, y, f"Total: {TOTAL} Punkte", 11.5, "Sans-Bold")
    text(c, L, y - 6 * mm, "Vorschlag Bewertung:  sehr gut ab 40 P.  ·  gut ab 33 P.  ·  genügend ab 26 P.  ·  "
         "noch üben unter 26 P.", 9.5, "Sans", MUTED)
    c.showPage()
    c.save()
    print(out)


if __name__ == "__main__":
    uebungsblatt()
    loesungsblatt()
