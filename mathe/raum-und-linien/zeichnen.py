"""Gemeinsame Zeichen-Hilfen für die Mathe-Blätter (Häuschenpapier, Würfel, Linien, Winkel)."""
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


