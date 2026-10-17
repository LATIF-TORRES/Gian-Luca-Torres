"""Probetest Mathe 4. Klasse: Raum und Bewegung & Linien (Vorbereitung Lernzielkontrolle).

Aufruf:  python3 probetest_pdf.py
Ausgabe: probetest-raum-linien.pdf (3 Seiten), probetest-raum-linien-loesungen.pdf (2 Seiten)

Alle Lösungen (Flächen, Umfänge, Würfelzahlen, rechte Winkel, parallel/senkrecht) werden aus
denselben Daten berechnet, aus denen die Figuren gezeichnet werden.
Wichtig beim Drucken: Grösse 100 %, sonst stimmen die Längen in Aufgabe 7 nicht.
"""
import math
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
CELL = 5 * mm  # Häuschen

INK = HexColor("#1d2433")
MUTED = HexColor("#5a6478")
LINE = HexColor("#9aa5ba")
GRID = HexColor("#c4d3ea")
SOFT = HexColor("#f1f4f8")
FIG = HexColor("#2b4fd8")
FIG_FILL = HexColor("#e4eaff")
RED = HexColor("#c8281c")
WOOD = (HexColor("#e9c99a"), HexColor("#f4dcb6"), HexColor("#c99b62"))  # vorne, oben, rechts
WOOD_EDGE = HexColor("#8a6236")

# ---------- Daten ----------
TERMS = [("Umfang", "die Länge des ganzen Randes rund um eine Figur"),
         ("Flächeninhalt", "wie viel Platz eine Figur innen bedeckt (z. B. Anzahl Häuschen)"),
         ("Gerade", "eine gerade Linie ohne Anfang und ohne Ende"),
         ("Strecke", "eine gerade Linie mit Anfang und Ende (zwei Endpunkte)"),
         ("parallel", "zwei Geraden haben überall den gleichen Abstand und treffen sich nie"),
         ("senkrecht", "zwei Geraden kreuzen sich und bilden dabei einen rechten Winkel"),
         ("rechter Winkel", "eine Ecke wie beim Blatt Papier, Zeichen: Bogen mit Punkt")]
DEF_ORDER = [3, 5, 0, 6, 2, 4, 1]  # Reihenfolge der Erklärungen A–G (gemischt)

SHAPES = {  # Häuschen-Koordinaten (x nach rechts, y nach oben)
    "A": [(x, y) for x in range(4) for y in range(3)],
    "B": [(x, y) for x in range(6) for y in range(2)],
    "C": [(0, 0), (0, 1), (0, 2), (0, 3), (1, 0), (2, 0), (3, 0)],
    "D": [(1, 0), (0, 1), (1, 1), (2, 1), (1, 2)],
}
SHAPE_POS = {"A": 1, "B": 8, "C": 17, "D": 25}  # Startspalte im Raster


def area(cells):
    return len(cells)


def perimeter(cells):
    s = set(cells)
    return sum(1 for (x, y) in cells for d in ((1, 0), (-1, 0), (0, 1), (0, -1))
               if (x + d[0], y + d[1]) not in s)


BUILDINGS = {  # Würfel (x nach rechts, y nach hinten, z nach oben)
    "a": [(0, 0, 0), (1, 0, 0), (1, 0, 1), (2, 0, 0), (2, 0, 1), (2, 0, 2)],
    "b": [(0, 0, 0), (1, 0, 0), (0, 1, 0), (1, 1, 0), (0, 1, 1)],
    "c": [(x, y, 0) for x in range(3) for y in range(2)] + [(x, 1, 1) for x in range(3)],
    "d": [(x, y, z) for x in range(2) for y in range(2) for z in range(2) if (x, y, z) != (1, 0, 1)],
}
CUBE_TASK = [(0, 0, 0), (1, 0, 0), (0, 1, 0), (1, 1, 0), (0, 1, 1), (1, 1, 1)]  # Aufgabe 5

LINE_PAIRS = {"A": (20, 20, "parallel"), "B": (-30, 60, "senkrecht"),
              "C": (10, 78, "keins"), "D": (15, 105, "senkrecht")}  # Winkel der zwei Geraden in Grad

SEGMENTS_CM = [6.0, 4.5]

RIGHT_FIGS = [  # Punkte in mm, gegen den Uhrzeigersinn
    [(0, 0), (30, 0), (30, 18), (0, 18)],
    [(0, 0), (26, 0), (0, 32)],
    [(0, 0), (36, 0), (36, 22), (12, 22)],
    [(0, 0), (30, 0), (30, 26), (8, 32)],
]
RIGHT_ROT = [25, -15, 0, 10]

POINTS = {1: 7, 2: 10, 3: 6, 4: 4, 5: 3, 6: 2, 7: 8, 8: 4}
TOTAL = sum(POINTS.values())


# ---------- Geometrie-Hilfen ----------
def rot(pts, deg, cx=0, cy=0):
    a = math.radians(deg)
    return [(cx + (x - cx) * math.cos(a) - (y - cy) * math.sin(a),
             cy + (x - cx) * math.sin(a) + (y - cy) * math.cos(a)) for x, y in pts]


def right_corners(pts):
    out = []
    n = len(pts)
    for i in range(n):
        p, a, b = pts[i], pts[i - 1], pts[(i + 1) % n]
        v1 = (a[0] - p[0], a[1] - p[1])
        v2 = (b[0] - p[0], b[1] - p[1])
        cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (math.hypot(*v1) * math.hypot(*v2))
        if abs(cos) < 1e-6:
            out.append(i)
    return out


# ---------- Zeichen-Hilfen ----------
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


def task_head(c, y, nr, title, instruction, goal):
    c.setFillColor(INK)
    c.circle(L + 3.4 * mm, y + 1.3 * mm, 3.4 * mm, stroke=0, fill=1)
    ctext(c, L + 3.4 * mm, y - 0.2 * mm, str(nr), 10, "Sans-Bold", white)
    text(c, L + 9 * mm, y, title, 12, "Sans-Bold")
    text(c, R - 24 * mm, y, f"____ / {POINTS[nr]} P.", 10, "Sans", MUTED)
    y = wrapped(c, L + 9 * mm, y - 5.5 * mm, instruction, W - 9 * mm, 9.5, color=INK)
    text(c, L + 9 * mm, y, f"Lernziel: {goal}", 7.5, "Sans", MUTED)
    return y - 5 * mm


def header(c, title, sub, name_fields=True):
    text(c, L, PAGE_H - 20 * mm, title, 17, "Sans-Bold")
    text(c, L, PAGE_H - 26.5 * mm, sub, 9.5, "Sans", MUTED)
    if name_fields:
        text(c, R - 66 * mm, PAGE_H - 18 * mm, "Name:", 10)
        hline(c, R - 53 * mm, R, PAGE_H - 18.6 * mm)
        text(c, R - 66 * mm, PAGE_H - 26 * mm, "Datum:", 10)
        hline(c, R - 53 * mm, R, PAGE_H - 26.6 * mm)
    hline(c, L, R, PAGE_H - 31 * mm, INK, 1)


def grid(c, x, y_top, cols, rows):
    c.setStrokeColor(GRID)
    c.setLineWidth(0.35)
    for i in range(cols + 1):
        c.line(x + i * CELL, y_top, x + i * CELL, y_top - rows * CELL)
    for j in range(rows + 1):
        c.line(x, y_top - j * CELL, x + cols * CELL, y_top - j * CELL)


def cell_shape(c, cells, x0, y0, stroke=FIG, fill=FIG_FILL):
    """Figur aus Häuschen; (x0, y0) = linke untere Ecke von Häuschen (0, 0)."""
    s = set(cells)
    c.setFillColor(fill)
    for (x, y) in cells:
        c.rect(x0 + x * CELL, y0 + y * CELL, CELL, CELL, stroke=0, fill=1)
    c.setStrokeColor(stroke)
    c.setLineWidth(1.3)
    for (x, y) in cells:
        X, Y = x0 + x * CELL, y0 + y * CELL
        if (x, y - 1) not in s: c.line(X, Y, X + CELL, Y)
        if (x, y + 1) not in s: c.line(X, Y + CELL, X + CELL, Y + CELL)
        if (x - 1, y) not in s: c.line(X, Y, X, Y + CELL)
        if (x + 1, y) not in s: c.line(X + CELL, Y, X + CELL, Y + CELL)


def building(c, cubes, x0, y0, s=6.5 * mm):
    """Würfelgebäude in Kavalierperspektive; (x0, y0) = linke untere vordere Ecke."""
    dx, dy = s * 0.42, s * 0.36
    c.setLineWidth(0.6)
    c.setStrokeColor(WOOD_EDGE)
    for (x, y, z) in sorted(cubes, key=lambda k: (-k[1], k[2], k[0])):
        X = x0 + x * s + y * dx
        Y = y0 + z * s + y * dy
        c.setFillColor(WOOD[0])
        c.rect(X, Y, s, s, stroke=1, fill=1)
        p = c.beginPath()  # oben
        p.moveTo(X, Y + s); p.lineTo(X + dx, Y + s + dy); p.lineTo(X + s + dx, Y + s + dy)
        p.lineTo(X + s, Y + s); p.close()
        c.setFillColor(WOOD[1]); c.drawPath(p, stroke=1, fill=1)
        p = c.beginPath()  # rechts
        p.moveTo(X + s, Y); p.lineTo(X + s + dx, Y + dy); p.lineTo(X + s + dx, Y + s + dy)
        p.lineTo(X + s, Y + s); p.close()
        c.setFillColor(WOOD[2]); c.drawPath(p, stroke=1, fill=1)


def line_through(c, cx, cy, deg, half, color=INK, width=0.9):
    a = math.radians(deg)
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(cx - half * math.cos(a), cy - half * math.sin(a), cx + half * math.cos(a), cy + half * math.sin(a))


def right_mark(c, p, a, b, r=3.2 * mm, color=RED):
    """Rechter-Winkel-Zeichen (Bogen mit Punkt) bei Ecke p zwischen den Richtungen zu a und b."""
    a1 = math.degrees(math.atan2(a[1] - p[1], a[0] - p[0]))
    a2 = math.degrees(math.atan2(b[1] - p[1], b[0] - p[0]))
    start = a1
    extent = (a2 - a1) % 360
    if extent > 180:
        start, extent = a2, 360 - extent
    c.setStrokeColor(color)
    c.setLineWidth(0.9)
    c.arc(p[0] - r, p[1] - r, p[0] + r, p[1] + r, start, extent)
    mid = math.radians(start + extent / 2)
    c.setFillColor(color)
    c.circle(p[0] + 0.45 * r * math.cos(mid), p[1] + 0.45 * r * math.sin(mid), 0.35 * mm, stroke=0, fill=1)


def polygon(c, pts, marks=False):
    p = c.beginPath()
    p.moveTo(*pts[0])
    for q in pts[1:]:
        p.lineTo(*q)
    p.close()
    c.setStrokeColor(INK)
    c.setLineWidth(1)
    c.drawPath(p, stroke=1, fill=0)
    if marks:
        for i in right_corners(pts):
            right_mark(c, pts[i], pts[i - 1], pts[(i + 1) % len(pts)])


def fig_points(i, ox, oy):
    pts = rot(RIGHT_FIGS[i], RIGHT_ROT[i])
    minx = min(x for x, _ in pts)
    miny = min(y for _, y in pts)
    return [(ox + (x - minx) * mm, oy + (y - miny) * mm) for x, y in pts]


def brick_cells(cols, rows):
    """Mauer-Parkett: Ziegel 2×1, jede zweite Reihe um 1 Häuschen versetzt."""
    bricks = []
    for r in range(rows):
        x = -(r % 2)
        while x < cols:
            bricks.append((max(x, 0), r, min(x + 2, cols) - max(x, 0)))
            x += 2
    return bricks


def draw_bricks(c, x0, y_top, cols, rows, upto):
    for (x, r, w) in brick_cells(cols, rows):
        if x >= upto:
            continue
        w = min(w, upto - x)
        c.setFillColor(FIG_FILL if (x + r) % 4 < 2 else HexColor("#fde7c8"))
        c.setStrokeColor(FIG)
        c.setLineWidth(1.1)
        c.rect(x0 + x * CELL, y_top - (r + 1) * CELL, w * CELL, CELL, stroke=1, fill=1)


# ---------- Probetest ----------
def page1(c):
    header(c, "Probetest Mathe", "Raum und Bewegung & Linien · 4. Klasse · Seite 1")
    y = PAGE_H - 37 * mm
    text(c, L, y, "Du brauchst: Bleistift, Farbstift, Geodreieck.", 9.5, "Sans", MUTED)
    y -= 9 * mm

    y = task_head(c, y, 1, "Begriffe erklären",
                  "Welche Erklärung passt zu welchem Begriff? Schreibe den richtigen Buchstaben ins Kästchen.",
                  "Ich kann die Begriffe erklären.")
    for i, (term, _) in enumerate(TERMS):
        yy = y - i * 7.6 * mm
        c.setStrokeColor(INK); c.setLineWidth(0.7)
        c.rect(L + 9 * mm, yy - 1.6 * mm, 6 * mm, 6 * mm, stroke=1, fill=0)
        text(c, L + 18 * mm, yy, term, 10.5, "Sans-Bold")
        d = TERMS[DEF_ORDER[i]][1]
        text(c, L + 52 * mm, yy, f"{chr(65 + i)}", 10, "Sans-Bold", FIG)
        wrapped(c, L + 58 * mm, yy, d, R - L - 58 * mm, 9.5)
    y -= len(TERMS) * 7.6 * mm + 4 * mm

    y = task_head(c, y, 2, "Flächeninhalt und Umfang",
                  "Bestimme bei jeder Figur den Flächeninhalt (Häuschen) und den Umfang (Häuschenlängen). "
                  "Beantworte dann die Fragen.",
                  "Ich kann Flächeninhalt und Umfang bestimmen und Figuren vergleichen.")
    cols, rows = 35, 7
    grid(c, L, y, cols, rows)
    base = y - rows * CELL + CELL
    for name, cells in SHAPES.items():
        x0 = L + SHAPE_POS[name] * CELL
        cell_shape(c, cells, x0, base)
        text(c, x0, y - 3.8 * mm, name, 10.5, "Sans-Bold", FIG)
    y -= rows * CELL + 7 * mm
    cw = W / 4
    for i, name in enumerate(SHAPES):
        x = L + i * cw
        text(c, x, y, f"{name}:", 10, "Sans-Bold", FIG)
        text(c, x + 6 * mm, y, "Fläche", 8.5, "Sans", MUTED)
        hline(c, x + 17 * mm, x + 27 * mm, y - 0.6 * mm)
        text(c, x + 6 * mm, y - 6 * mm, "Umfang", 8.5, "Sans", MUTED)
        hline(c, x + 17 * mm, x + 27 * mm, y - 6.6 * mm)
    y -= 15 * mm
    for q in ("Welche zwei Figuren haben den gleichen Flächeninhalt?",
              "Welche zwei Figuren haben den gleichen Umfang?"):
        text(c, L + 9 * mm, y, q, 10)
        text(c, R - 38 * mm, y, "___  und  ___", 10)
        y -= 7 * mm
    y -= 4 * mm
    y = task_head(c, y, 3, "Figuren zeichnen",
                  "a) Zeichne ein Rechteck mit dem Umfang 12 Häuschenlängen.   b) Zeichne eine Figur mit "
                  "dem Flächeninhalt 10 Häuschen.   c) Zeichne eine Figur mit dem Flächeninhalt 9 Häuschen "
                  "und einem möglichst kleinen Umfang.",
                  "Ich kann Figuren mit einem gewissen Umfang und einer gewissen Fläche zeichnen.")
    grid(c, L, y, 35, 8)
    for k, lbl in enumerate("abc"):
        text(c, L + (k * 12 + 0.3) * CELL, y - 4 * mm, f"{lbl})", 10, "Sans-Bold", FIG)
        if k:
            c.setStrokeColor(LINE); c.setLineWidth(0.8); c.setDash(2, 2)
            c.line(L + k * 12 * CELL - 0.5 * CELL, y, L + k * 12 * CELL - 0.5 * CELL, y - 8 * CELL)
            c.setDash()
    y -= 9 * CELL + 9 * mm

    c.showPage()


def page2(c):
    header(c, "Probetest: Raum und Bewegung & Linien", "Seite 2", name_fields=False)
    y = PAGE_H - 39 * mm
    y = task_head(c, y, 4, "Holzwürfel zählen",
                  "Aus wie vielen Holzwürfeln besteht jedes Gebäude? Achtung: Es sind Würfel, keine Häuschen!",
                  "Ich kann bestimmen, aus wie vielen Holzwürfeln ein Gebäude besteht.")
    bw = W / 4
    for i, (name, cubes) in enumerate(BUILDINGS.items()):
        x = L + i * bw
        text(c, x + 2 * mm, y, f"{name})", 10, "Sans-Bold", FIG)
        building(c, cubes, x + 8 * mm, y - 32 * mm)
        hline(c, x + 6 * mm, x + 18 * mm, y - 38 * mm)
        text(c, x + 19.5 * mm, y - 37.6 * mm, "Würfel", 9.5)
    y -= 47 * mm

    y = task_head(c, y, 5, "Einen grossen Würfel bauen",
                  "Beantworte die Fragen.",
                  "Ich kann bestimmen, wie viele Holzwürfel es für einen grossen Würfel braucht.")
    building(c, CUBE_TASK, L + 12 * mm, y - 24 * mm)
    qs = ["Wie viele Würfel fehlen beim Gebäude links, bis es ein grosser Würfel (2 × 2 × 2) ist?",
          "Wie viele Holzwürfel braucht man für einen Würfel mit 2 Würfeln an jeder Kante?",
          "Wie viele Holzwürfel braucht man für einen Würfel mit 3 Würfeln an jeder Kante?"]
    for i, q in enumerate(qs):
        yy = y - 2 * mm - i * 10.5 * mm
        wrapped(c, L + 45 * mm, yy, q, 105 * mm, 9.5, leading=4.2 * mm)
        hline(c, R - 14 * mm, R, yy - 0.6 * mm)
    y -= 36 * mm
    y = task_head(c, y, 6, "Parkett fortsetzen",
                  "Setze das Mauer-Muster bis zum Ende des Rasters fort.",
                  "Ich kann angefangene Parkettierungen fortsetzen.")
    grid(c, L, y, 34, 4)
    draw_bricks(c, L, y, 34, 4, upto=10)
    y -= 4 * CELL + 8 * mm

    c.showPage()


def page3(c):
    header(c, "Probetest: Raum und Bewegung & Linien", "Seite 3", name_fields=False)
    y = PAGE_H - 39 * mm
    y = task_head(c, y, 7, "Parallel und senkrecht",
                  "a) Prüfe mit dem Geodreieck: Sind die Geraden parallel (p), senkrecht (s) oder keins von beidem (–)? "
                  "b) Zeichne zur Geraden g eine Parallele durch P und eine Senkrechte durch Q. "
                  "c) Miss die Strecken.",
                  "Ich kann Parallelen und Senkrechte mit dem Geodreieck erkennen und zeichnen.")
    bw = W / 4
    for i, (name, (a1, a2, _)) in enumerate(LINE_PAIRS.items()):
        cx, cy = L + i * bw + bw / 2, y - 15 * mm
        text(c, L + i * bw + 2 * mm, y - 1 * mm, f"{name})", 10, "Sans-Bold", FIG)
        if a2 - a1 == 0 or LINE_PAIRS[name][2] == "parallel":
            line_through(c, cx, cy + 4 * mm, a1, 16 * mm)
            line_through(c, cx, cy - 4 * mm, a2, 16 * mm)
        else:
            line_through(c, cx - 2 * mm, cy, a1, 16 * mm)
            line_through(c, cx + 2 * mm, cy + 1 * mm, a2, 13 * mm)
        hline(c, cx - 4 * mm, cx + 4 * mm, y - 30 * mm)
    y -= 37 * mm
    # b) Gerade g mit P und Q
    text(c, L + 9 * mm, y, "b)", 10, "Sans-Bold", FIG)
    gx, gy, gdeg = L + 60 * mm, y - 20 * mm, 12
    line_through(c, gx, gy, gdeg, 45 * mm)
    a = math.radians(gdeg)
    text(c, gx + 44 * mm * math.cos(a) + 1 * mm, gy + 44 * mm * math.sin(a) - 3 * mm, "g", 10, "Sans-Bold")
    px, py = gx - 25 * mm, gy + 14 * mm
    qx, qy = gx + 22 * mm * math.cos(a), gy + 22 * mm * math.sin(a)
    for (x, yv, lbl) in ((px, py, "P"), (qx, qy, "Q")):
        c.setFillColor(INK); c.circle(x, yv, 0.8 * mm, stroke=0, fill=1)
        text(c, x + 1.5 * mm, yv + 1.5 * mm, lbl, 10, "Sans-Bold")
    # c) Strecken
    y -= 36 * mm
    text(c, L + 9 * mm, y, "c)", 10, "Sans-Bold", FIG)
    for i, cm in enumerate(SEGMENTS_CM):
        sx, yy = L + 16 * mm + i * 82 * mm, y - 4 * mm
        c.setStrokeColor(INK); c.setLineWidth(1)
        c.line(sx, yy, sx + cm * 10 * mm, yy)
        c.line(sx, yy - 1.5 * mm, sx, yy + 1.5 * mm)
        c.line(sx + cm * 10 * mm, yy - 1.5 * mm, sx + cm * 10 * mm, yy + 1.5 * mm)
        hline(c, sx, sx + 14 * mm, yy - 7 * mm)
        text(c, sx + 15 * mm, yy - 6.6 * mm, "cm", 9.5)
    y -= 20 * mm

    y = task_head(c, y, 8, "Rechte Winkel",
                  "Suche mit dem Geodreieck alle rechten Winkel und zeichne das Zeichen ein (Bogen mit Punkt).",
                  "Ich kann rechte Winkel erkennen und das richtige Symbol einzeichnen.")
    for i in range(len(RIGHT_FIGS)):
        polygon(c, fig_points(i, L + 6 * mm + i * (W / 4), y - 40 * mm))
    # Total
    bx, bw2, bh, by = R - 62 * mm, 62 * mm, 11 * mm, 9 * mm
    c.setStrokeColor(INK); c.setLineWidth(1)
    c.roundRect(bx, by, bw2, bh, 3 * mm, stroke=1, fill=0)
    text(c, bx + 4 * mm, by + 4 * mm, f"Total:  ______ / {TOTAL} Punkte", 11, "Sans-Bold")
    text(c, L, by + 4 * mm, "Drucken in Originalgrösse (100 %), damit die Längen stimmen.", 7.5, "Sans", MUTED)
    c.showPage()


def probetest():
    out = OUT_DIR / "probetest-raum-linien.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Probetest Mathe 4. Klasse: Raum und Bewegung & Linien")
    c.setViewerPreference("PrintScaling", "None")
    page1(c); page2(c); page3(c)
    c.save()
    print(out)


# ---------- Lösungen ----------
def loesungen():
    out = OUT_DIR / "probetest-raum-linien-loesungen.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Lösungen Probetest: Raum und Bewegung & Linien")
    header(c, "Lösungen: Probetest Raum und Bewegung & Linien", "Für Eltern / Lehrperson · Seite 1", name_fields=False)
    y = PAGE_H - 40 * mm

    def head(nr, title, note=""):
        nonlocal y
        text(c, L, y, f"{nr}. {title}", 11.5, "Sans-Bold")
        text(c, R - 18 * mm, y, f"{POINTS[nr]} P.", 10, "Sans-Bold", RED)
        y -= 5 * mm
        if note:
            y = wrapped(c, L, y, note, W, 8.5, color=MUTED) - 1 * mm

    head(1, "Begriffe erklären", "1 Punkt pro richtigem Buchstaben.")
    for i, (term, _) in enumerate(TERMS):
        letter = chr(65 + DEF_ORDER.index(i))
        text(c, L, y, term, 9.5)
        text(c, L + 32 * mm, y, letter, 9.5, "Sans-Bold", RED)
        y -= 4.4 * mm
    y -= 3 * mm

    head(2, "Flächeninhalt und Umfang", "Je 1 Punkt pro Fläche und Umfang (8 P.) und je 1 Punkt pro Frage (2 P.).")
    data = {n: (area(s), perimeter(s)) for n, s in SHAPES.items()}
    for n, (a, p) in data.items():
        text(c, L, y, f"{n}:  Fläche {a} Häuschen  ·  Umfang {p} Häuschenlängen", 9.5, color=RED)
        y -= 4.4 * mm
    same_a = [n for n in data if sum(1 for m in data if data[m][0] == data[n][0]) == 2]
    same_p = [n for n in data if sum(1 for m in data if data[m][1] == data[n][1]) == 2]
    assert len(same_a) == 2 and len(same_p) == 2, (same_a, same_p)
    text(c, L, y, f"Gleicher Flächeninhalt: {same_a[0]} und {same_a[1]}   ·   Gleicher Umfang: {same_p[0]} und {same_p[1]}",
         9.5, "Sans-Bold", RED)
    y -= 8 * mm

    head(3, "Figuren zeichnen", "Je 2 Punkte. Es gibt mehrere richtige Lösungen, bitte nachzählen.")
    for s in ["a) 4 × 2 oder 5 × 1 oder 3 × 3 (alle haben den Umfang 12 Häuschenlängen).",
              "b) jede Figur mit genau 10 Häuschen, z. B. 5 × 2 oder 10 × 1.",
              "c) das Quadrat 3 × 3: Fläche 9, Umfang 12. Andere Figuren mit 9 Häuschen haben einen grösseren Umfang."]:
        y = wrapped(c, L, y, s, W, 9.5, color=RED) - 1 * mm
    y -= 3 * mm

    head(4, "Holzwürfel zählen", "1 Punkt pro Gebäude. Die Einheit ist „Würfel“, nicht „Häuschen“.")
    text(c, L, y, "   ·   ".join(f"{n}) {len(b)} Würfel" for n, b in BUILDINGS.items()), 9.5, "Sans-Bold", RED)
    y -= 8 * mm

    head(5, "Einen grossen Würfel bauen", "1 Punkt pro Frage.")
    for s in [f"Es fehlen {8 - len(CUBE_TASK)} Würfel (das Gebäude hat {len(CUBE_TASK)}, der Würfel 2 × 2 × 2 hat 8).",
              "2 × 2 × 2 = 8 Würfel", "3 × 3 × 3 = 27 Würfel"]:
        text(c, L, y, s, 9.5, color=RED)
        y -= 4.4 * mm
    c.showPage()

    header(c, "Lösungen: Probetest Raum und Bewegung & Linien", "Seite 2", name_fields=False)
    y = PAGE_H - 40 * mm
    head(6, "Parkett fortsetzen", "2 Punkte, wenn das Muster bis zum Ende richtig weitergeht (Ziegel 2 lang, Reihen versetzt).")
    grid(c, L, y, 34, 4)
    draw_bricks(c, L, y, 34, 4, upto=34)
    y -= 4 * CELL + 8 * mm

    head(7, "Parallel und senkrecht", "a) 1 Punkt pro Paar (4 P.)  ·  b) je 1 Punkt für Parallele und Senkrechte (2 P.)  ·  "
         "c) je 1 Punkt, ± 1 mm ist in Ordnung (2 P.).")
    res = []
    for n, (a1, a2, expected) in LINE_PAIRS.items():
        d = abs(a2 - a1) % 180
        kind = "parallel (p)" if d == 0 else "senkrecht (s)" if d == 90 else "keins (–)"
        assert kind.startswith(expected[:4]) or (expected == "keins" and kind.startswith("keins")), (n, kind)
        res.append(f"{n}) {kind}")
    text(c, L, y, "a)  " + "   ·   ".join(res), 9.5, "Sans-Bold", RED)
    y -= 5 * mm
    text(c, L, y, "b)  Kontrolle mit dem Geodreieck: Parallele hat überall gleichen Abstand zu g, Senkrechte bildet bei Q einen rechten Winkel.",
         8.5, "Sans", RED)
    y -= 5 * mm
    text(c, L, y, "c)  " + "   ·   ".join(f"{str(cm).replace('.0', '').replace('.', ',')} cm" for cm in SEGMENTS_CM),
         9.5, "Sans-Bold", RED)
    y -= 10 * mm

    head(8, "Rechte Winkel", "1 Punkt pro Figur, wenn alle rechten Winkel (und keine falschen) eingezeichnet sind.")
    counts = []
    for i in range(len(RIGHT_FIGS)):
        pts = fig_points(i, L + 6 * mm + i * (W / 4), y - 40 * mm)
        polygon(c, pts, marks=True)
        counts.append(len(right_corners(pts)))
    y -= 47 * mm
    text(c, L, y, "Anzahl rechte Winkel:   " + "   ·   ".join(f"Figur {i + 1}: {n}" for i, n in enumerate(counts)),
         9.5, "Sans-Bold", RED)
    y -= 12 * mm
    text(c, L, y, f"Total: {TOTAL} Punkte", 11.5, "Sans-Bold")
    text(c, L, y - 6 * mm, "Richtwert: ab 39 P. sehr gut  ·  ab 32 P. gut  ·  ab 26 P. erreicht  ·  darunter: Thema nochmals üben",
         9, "Sans", MUTED)
    c.showPage()
    c.save()
    print(out)
    return counts


if __name__ == "__main__":
    probetest()
    print("rechte Winkel pro Figur:", loesungen())
