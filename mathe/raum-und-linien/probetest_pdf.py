"""Probetest Mathe 4. Klasse: Raum und Bewegung & Linien (Vorbereitung Lernzielkontrolle), Version 2.

Aufruf:  python3 probetest_pdf.py
Ausgabe: probetest-raum-linien.pdf (5 Seiten)
         probetest-raum-linien-loesungen.pdf (5 Seiten: dieselben Seiten, Lösungen farbig eingezeichnet)

Fast alle Aufgaben sind Zeichenaufgaben auf Häuschenpapier (1 Häuschen = 5 mm) oder mit dem Geodreieck.
Alle Lösungen (Flächen, Umfänge, Würfelzahlen, rechte Winkel, Parallelen, Senkrechte) werden aus
denselben Daten berechnet, aus denen auch die Aufgaben gezeichnet werden.
Wichtig beim Drucken: Grösse 100 %, sonst stimmen die Längen nicht.
"""
import math

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from linien_uebungen_pdf import BOX_W, COLORS, draw_box, gen_box
from zeichnen import (CELL, FIG, FIG_FILL, GRID, INK, L, LINE, MUTED, OUT_DIR, PAGE_H, R, RED, SOFT, W,
                      building, cell_shape, ctext, grid, header, hline, line_through, polygon, right_corners,
                      right_mark, rot, text, wrapped)

SOL = HexColor("#d0342c")          # Lösungsfarbe
SOL_FILL = HexColor("#fbe3e1")
SOL2 = HexColor("#0f8a6a")
TILE2 = HexColor("#fde7c8")

# ---------- Daten ----------
GOALS = [
    "Ich kann Umfang, Fläche, Gerade, Strecke, parallel, senkrecht, rechter Winkel erklären.",
    "Ich kann Flächeninhalt und Umfang auf Häuschenpapier bestimmen und Figuren vergleichen.",
    "Ich kann Figuren mit einem bestimmten Umfang und einer bestimmten Fläche zeichnen.",
    "Ich kann bestimmen, aus wie vielen Holzwürfeln ein Gebäude besteht.",
    "Ich kann bestimmen, wie viele Holzwürfel es für einen grossen Würfel braucht.",
    "Ich kann angefangene Parkettierungen fortsetzen.",
    "Ich kann Parallelen und Senkrechte mit dem Geodreieck erkennen und zeichnen.",
    "Ich kann rechte Winkel erkennen und das richtige Symbol einzeichnen.",
]

SHAPES = {  # Aufgabe 2, Häuschen-Koordinaten (x nach rechts, y nach oben)
    "A": [(x, y) for x in range(4) for y in range(3)],
    "B": [(x, y) for x in range(6) for y in range(2)],
    "C": [(0, 0), (0, 1), (0, 2), (0, 3), (1, 0), (2, 0), (3, 0)],
    "D": [(1, 0), (0, 1), (1, 1), (2, 1), (1, 2)],
}
SHAPE_POS = {"A": 1, "B": 8, "C": 17, "D": 26}

# Aufgabe 3: Felder (Startspalte, Breite in Häuschen) und je eine Musterlösung (Häuschen relativ zum Feld)
DRAW_FIELDS = [
    ("a", "Rechteck mit dem Umfang 12 Häuschenlängen", 0, 12, 0,
     [[(x, y) for x in range(1, 5) for y in range(2, 4)]], {"U": 12}),
    ("b", "Zwei verschiedene Figuren mit dem Flächeninhalt 8 Häuschen", 12, 12, 0,
     [[(x, y) for x in range(1, 3) for y in range(1, 5)],
      [(5, 1), (6, 1), (7, 1), (8, 1), (5, 2), (5, 3), (5, 4), (6, 4)]], {"F": 8}),
    ("c", "Figur mit 9 Häuschen und dem kleinsten möglichen Umfang", 24, 11, 0,
     [[(x, y) for x in range(3, 6) for y in range(2, 5)]], {"F": 9, "U": 12}),
    ("d", "Gleich viel Fläche wie Figur A (Aufgabe 2), aber Umfang 16", 0, 18, 1,
     [[(x, y) for x in range(2, 8) for y in range(2, 4)]], {"F": 12, "U": 16}),
    ("e", "Quadrat mit dem Umfang 16 Häuschenlängen", 18, 17, 1,
     [[(x, y) for x in range(5, 9) for y in range(1, 5)]], {"U": 16}),
]

BUILDINGS = {  # Würfel (x nach rechts, y nach hinten, z nach oben)
    "a": [(0, 0, 0), (1, 0, 0), (1, 0, 1), (2, 0, 0), (2, 0, 1), (2, 0, 2)],
    "b": [(0, 0, 0), (1, 0, 0), (0, 1, 0), (1, 1, 0), (0, 1, 1)],
    "c": [(x, y, 0) for x in range(3) for y in range(2)] + [(x, 1, 1) for x in range(3)],
    "d": [(x, y, z) for x in range(2) for y in range(2) for z in range(2) if (x, y, z) != (1, 0, 1)],
}
CUBE_TASK = [(0, 0, 0), (1, 0, 0), (0, 1, 0), (1, 1, 0), (0, 1, 1), (1, 1, 1)]

SEGMENTS_CM = [5.5, 7.0, 3.8]
RECT_CM = (6, 3)

RIGHT_FIGS = [  # Punkte in mm (gegen den Uhrzeigersinn) und Drehung in Grad
    ([(0, 0), (30, 0), (30, 18), (0, 18)], 25),
    ([(0, 0), (26, 0), (0, 32)], -15),
    ([(0, 0), (36, 0), (36, 22), (12, 22)], 0),
    ([(0, 0), (30, 0), (30, 26), (8, 32)], 10),
]
TWO_RIGHT = [(0, 0), (40, 0), (40, 22), (14, 22)]  # Musterlösung Aufgabe 8b

POINTS = {1: 8, 2: 10, 3: 10, 4: 4, 5: 7, 6: 5, 7: 8, 8: 6}
TOTAL = sum(POINTS.values())


def area(cells):
    return len(cells)


def perimeter(cells):
    s = set(cells)
    return sum(1 for (x, y) in cells for d in ((1, 0), (-1, 0), (0, 1), (0, -1)) if (x + d[0], y + d[1]) not in s)


def fmt_cm(v):
    return f"{v:g}".replace(".", ",") + " cm"


# ---------- Zeichen-Hilfen für diese Seite ----------
def task_head(c, y, nr, title, instruction, goal):
    c.setFillColor(INK)
    c.circle(L + 3.4 * mm, y + 1.3 * mm, 3.4 * mm, stroke=0, fill=1)
    ctext(c, L + 3.4 * mm, y - 0.2 * mm, str(nr), 10, "Sans-Bold", white)
    text(c, L + 9 * mm, y, title, 12, "Sans-Bold")
    text(c, R - 22 * mm, y, f"____ / {POINTS[nr]} P.", 9.5, "Sans", MUTED)
    y = wrapped(c, L + 9 * mm, y - 5.5 * mm, instruction, W - 9 * mm, 9.5)
    text(c, L + 9 * mm, y, f"Lernziel: {goal}", 7, "Sans", MUTED)
    return y - 5 * mm


def answer(c, x, y, width, sol, value, size=10):
    """Antwortlinie; im Lösungsblatt steht die Lösung in Rot darauf."""
    hline(c, x, x + width, y - 0.8 * mm)
    if sol:
        text(c, x + 1 * mm, y + 0.3 * mm, value, size, "Sans-Bold", SOL)


def field(c, x, y_top, w, h, label=None):
    c.setStrokeColor(HexColor("#d5dce7"))
    c.setLineWidth(0.7)
    c.roundRect(x, y_top - h, w, h, 2 * mm, stroke=1, fill=0)
    if label:
        text(c, x + 2 * mm, y_top - 4.5 * mm, label, 9.5, "Sans-Bold", FIG)


def seg(c, a, b, color=INK, width=1.2, ticks=True):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(*a, *b)
    if ticks:
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        nx, ny = -math.sin(ang), math.cos(ang)
        for p in (a, b):
            c.line(p[0] - 1.6 * mm * nx, p[1] - 1.6 * mm * ny, p[0] + 1.6 * mm * nx, p[1] + 1.6 * mm * ny)


def note(c, x, y, s, size=8, color=SOL):
    text(c, x, y, s, size, "Sans", color)


def tiles_bricks(cols, rows):
    """Mauer: Ziegel 2×1, jede zweite Reihe um 1 versetzt. (x, y, w, h) in Häuschen, y von oben."""
    out = []
    for r in range(rows):
        x = -(r % 2)
        while x < cols:
            x0, x1 = max(x, 0), min(x + 2, cols)
            out.append((x0, r, x1 - x0, 1, (x + r) % 4 < 2))
            x += 2
    return out


def tiles_towers(cols, rows):
    """Turm-Muster: zwei Quadrate 2×2 übereinander, daneben ein Balken 1×4. Periode 3 Häuschen."""
    out = []
    k = 0
    while 3 * k < cols:
        x = 3 * k
        out.append((x, 0, min(2, cols - x), 2, True))
        out.append((x, 2, min(2, cols - x), 2, False))
        if x + 2 < cols:
            out.append((x + 2, 0, 1, 4, k % 2 == 0))
        k += 1
    return out


def draw_tiles(c, x0, y_top, tiles, upto, sol):
    for (x, y, w, h, alt) in tiles:
        given = x + w <= upto
        if not given and not sol:
            continue
        if given:
            c.setFillColor(FIG_FILL if alt else TILE2)
            c.setStrokeColor(FIG)
        else:
            c.setFillColor(SOL_FILL if alt else white)
            c.setStrokeColor(SOL)
        c.setLineWidth(1.2)
        c.rect(x0 + x * CELL, y_top - (y + h) * CELL, w * CELL, h * CELL, stroke=1, fill=1)


def fig_points(i, ox, oy):
    pts, deg = RIGHT_FIGS[i]
    pts = rot(pts, deg)
    minx = min(x for x, _ in pts)
    miny = min(y for _, y in pts)
    return [(ox + (x - minx) * mm, oy + (y - miny) * mm) for x, y in pts]


# ---------- Seiten ----------
def page1(c, sol):
    header(c, "Probetest Mathe", "Raum und Bewegung & Linien · 4. Klasse · Seite 1",
           name_fields=not sol)
    y = PAGE_H - 37 * mm
    text(c, L, y, "Du brauchst: Bleistift, Farbstifte (rot und blau), Geodreieck.  1 Häuschen = 5 mm.", 9, "Sans", MUTED)
    y -= 8 * mm

    y = task_head(c, y, 1, "Begriffe zeichnen und erklären",
                  "Zeichne in jedes Feld, was verlangt ist. Erkläre danach die zwei Begriffe in eigenen Worten.",
                  "Ich kann die Begriffe erklären.")
    bw, bh, gap = 17 * CELL, 6 * CELL, W - 34 * CELL
    boxes = [("a) eine Strecke AB, die 4 cm lang ist", 0, 0), ("b) eine Gerade g", 1, 0),
             ("c) zwei Geraden, die parallel sind", 0, 1), ("d) zwei senkrechte Geraden, mit Zeichen", 1, 1)]
    for lbl, col, row in boxes:
        bx = L + col * (bw + gap)
        by = y - row * (bh + 10 * mm) - 4.5 * mm
        text(c, bx, by + 1.5 * mm, lbl, 9, "Sans-Bold")
        grid(c, bx, by, 17, 6)
        if not sol:
            continue
        P = lambda gx, gy: (bx + gx * CELL, by - 6 * CELL + gy * CELL)
        if lbl.startswith("a"):
            a, b = P(4, 3), P(12, 3)
            seg(c, a, b, SOL, 1.6)
            text(c, a[0] - 3 * mm, a[1] + 2 * mm, "A", 9.5, "Sans-Bold", SOL)
            text(c, b[0] + 1 * mm, b[1] + 2 * mm, "B", 9.5, "Sans-Bold", SOL)
            note(c, a[0] - 8 * mm, a[1] - 5 * mm, "8 Häuschen = 4 cm, mit zwei Endpunkten")
        elif lbl.startswith("b"):
            seg(c, P(0, 1.5), P(17, 4.5), SOL, 1.6, ticks=False)
            text(c, P(14.5, 4.6)[0], P(14.5, 4.6)[1], "g", 10, "Sans-Bold", SOL)
            note(c, P(0.5, 0.4)[0], P(0.5, 0.4)[1], "ohne Anfang und Ende: geht über das Feld hinaus")
        elif lbl.startswith("c"):
            seg(c, P(2, 4), P(15, 4), SOL, 1.6, ticks=False)
            seg(c, P(2, 2), P(15, 2), SOL, 1.6, ticks=False)
            for gx in (4, 8, 12):
                c.setDash(1.5, 1.5); seg(c, P(gx, 2), P(gx, 4), MUTED, 0.7, ticks=False); c.setDash()
            note(c, P(2, 0.6)[0], P(2, 0.6)[1], "überall gleicher Abstand (2 Häuschen)")
        else:
            seg(c, P(2, 2.5), P(15, 2.5), SOL, 1.6, ticks=False)
            seg(c, P(8.5, 0.3), P(8.5, 5.7), SOL, 1.6, ticks=False)
            q = P(8.5, 2.5)
            right_mark(c, q, (q[0] + 1, q[1]), (q[0], q[1] + 1), r=3 * mm, color=SOL)
    y -= 2 * (bh + 10 * mm) + 2 * mm
    for i, (term, expl) in enumerate([("Umfang", "Der Umfang ist die Länge des ganzen Randes rund um eine Figur."),
                                      ("Flächeninhalt", "Der Flächeninhalt sagt, wie viel Fläche die Figur innen bedeckt (Anzahl Häuschen).")]):
        yy = y - i * 13 * mm
        text(c, L, yy, f"e) {term} ist …", 9.5, "Sans-Bold")
        hline(c, L + 32 * mm, R, yy - 0.8 * mm)
        hline(c, L, R, yy - 7.8 * mm)
        if sol:
            text(c, L + 1 * mm, yy - 7 * mm, expl, 8.5, "Sans-Bold", SOL)
    y -= 2 * 13 * mm + 3 * mm

    y = task_head(c, y, 2, "Flächeninhalt und Umfang bestimmen",
                  "Schreibe bei jeder Figur den Flächeninhalt (F, in Häuschen) und den Umfang (U, in Häuschenlängen) auf. "
                  "Beantworte dann die Fragen.",
                  "Ich kann Flächeninhalt und Umfang bestimmen und Figuren vergleichen.")
    cols, rows = 35, 7
    grid(c, L, y, cols, rows)
    base = y - rows * CELL + CELL
    for name, cells in SHAPES.items():
        x0 = L + SHAPE_POS[name] * CELL
        cell_shape(c, cells, x0, base)
        text(c, x0, y - 3.8 * mm, name, 10.5, "Sans-Bold", FIG)
        if sol:  # Umfang rot nachfahren
            cell_shape(c, cells, x0, base, stroke=SOL, fill=FIG_FILL)
    y -= rows * CELL + 6 * mm
    cw = W / 4
    data = {n: (area(s), perimeter(s)) for n, s in SHAPES.items()}
    for i, name in enumerate(SHAPES):
        x = L + i * cw
        text(c, x, y, f"{name}:", 10, "Sans-Bold", FIG)
        text(c, x + 6 * mm, y, "F =", 9, "Sans", MUTED)
        answer(c, x + 13 * mm, y, 13 * mm, sol, str(data[name][0]))
        text(c, x + 6 * mm, y - 6.5 * mm, "U =", 9, "Sans", MUTED)
        answer(c, x + 13 * mm, y - 6.5 * mm, 13 * mm, sol, str(data[name][1]))
    y -= 15 * mm
    same_a = [n for n in data if sum(data[m][0] == data[n][0] for m in data) == 2]
    same_p = [n for n in data if sum(data[m][1] == data[n][1] for m in data) == 2]
    biggest_p = max(data, key=lambda n: data[n][1])
    assert len(same_a) == 2 and len(same_p) == 2
    qs = [("Welche zwei Figuren haben den gleichen Flächeninhalt?", " und ".join(same_a)),
          ("Welche zwei Figuren haben den gleichen Umfang?", " und ".join(same_p))]
    for q, a in qs:
        text(c, L + 9 * mm, y, q, 9.5)
        answer(c, R - 30 * mm, y, 30 * mm, sol, a)
        y -= 7 * mm
    if sol:
        note(c, L + 9 * mm, y, "Tipp: Den Umfang zählt man am Rand entlang (rot), den Flächeninhalt innen (Häuschen).")
    c.showPage()


def page2(c, sol):
    header(c, "Probetest Mathe", "Raum und Bewegung & Linien · Seite 2", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 3, "Figuren zeichnen",
                  "Zeichne die Figuren auf das Häuschenpapier, jede in ihr eigenes Feld. Zeichne genau auf den Linien.",
                  "Ich kann Figuren mit einem bestimmten Umfang und einer bestimmten Fläche zeichnen.")
    rows = 9
    for lbl, desc, col0, wcols, row, sols, need in DRAW_FIELDS:
        fx = L + col0 * CELL
        fy = y - row * (rows * CELL + 9 * mm) - 6 * mm
        wrapped(c, fx, fy + 4 * mm, f"{lbl}) {desc}", wcols * CELL - 1 * mm, 8, "Sans-Bold", leading=3.4 * mm)
        grid(c, fx, fy, wcols, rows)
        c.setStrokeColor(INK); c.setLineWidth(0.8)
        c.rect(fx, fy - rows * CELL, wcols * CELL, rows * CELL, stroke=1, fill=0)
        if sol:
            infos = []
            for cells in sols:
                assert all(0 <= x < wcols and 0 <= yy < rows for x, yy in cells), lbl
                cell_shape(c, cells, fx, fy - rows * CELL, stroke=SOL, fill=SOL_FILL)
                a, p = area(cells), perimeter(cells)
                for k, v in need.items():
                    assert (a if k == "F" else p) == v, (lbl, k, a, p)
                infos.append(f"F={a} U={p}")
            note(c, fx + 1.5 * mm, fy - rows * CELL + 1.5 * mm, "  ·  ".join(infos), 7.5)
    y -= 2 * (rows * CELL + 9 * mm) + 4 * mm
    if sol:
        y = wrapped(c, L, y + 2 * mm, "Es gibt mehrere richtige Lösungen. a) auch 5 × 1 oder 3 × 3.  b) jede Figur mit 8 Häuschen.  "
                    "d) auch 3 × 4 hat F = 12, aber U = 14; richtig sind z. B. 6 × 2 oder eine andere Form mit F = 12 und U = 16.",
                    W, 8, color=SOL) - 2 * mm

    y = task_head(c, y, 4, "Parkett fortsetzen",
                  "Zeichne die Muster genau weiter, bis das Häuschenpapier voll ist. Male die Platten wie im Muster an.",
                  "Ich kann angefangene Parkettierungen fortsetzen.")
    for lbl, tiles, upto in (("a)", tiles_bricks(34, 4), 9), ("b)", tiles_towers(34, 4), 6)):
        text(c, L, y - 4 * mm, lbl, 10, "Sans-Bold", FIG)
        gx = L + 8 * mm
        grid(c, gx, y, 34, 4)
        draw_tiles(c, gx, y, tiles, upto, sol)
        y -= 4 * CELL + 6 * mm
    c.showPage()


def page3(c, sol):
    header(c, "Probetest Mathe", "Raum und Bewegung & Linien · Seite 3", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 5, "Holzwürfel",
                  "a) Aus wie vielen Holzwürfeln besteht jedes Gebäude? Achtung: Die Einheit heisst Würfel, nicht Häuschen!  "
                  "b) Beantworte die Fragen zum grossen Würfel.",
                  "Ich kann Holzwürfel zählen und bestimmen, wie viele es für einen grossen Würfel braucht.")
    bw = W / 4
    for i, (name, cubes) in enumerate(BUILDINGS.items()):
        x = L + i * bw
        text(c, x + 2 * mm, y, f"{name})", 10, "Sans-Bold", FIG)
        building(c, cubes, x + 8 * mm, y - 32 * mm)
        answer(c, x + 6 * mm, y - 38 * mm, 12 * mm, sol, str(len(cubes)))
        text(c, x + 19.5 * mm, y - 37.6 * mm, "Würfel", 9.5)
    y -= 46 * mm
    text(c, L, y, "b)", 10, "Sans-Bold", FIG)
    building(c, CUBE_TASK, L + 12 * mm, y - 26 * mm)
    qs = [("Wie viele Würfel fehlen beim Gebäude links, bis es ein Würfel 2 × 2 × 2 ist?",
           f"{8 - len(CUBE_TASK)} Würfel"),
          ("Wie viele Holzwürfel braucht man für einen Würfel mit 2 Würfeln an jeder Kante?", "2 · 2 · 2 = 8"),
          ("Wie viele Holzwürfel braucht man für einen Würfel mit 3 Würfeln an jeder Kante?", "3 · 3 · 3 = 27")]
    for i, (q, a) in enumerate(qs):
        yy = y - 2 * mm - i * 10.5 * mm
        wrapped(c, L + 45 * mm, yy, q, 100 * mm, 9.5, leading=4.2 * mm)
        answer(c, R - 26 * mm, yy, 26 * mm, sol, a, 9.5)
    if sol:
        # gestrichelt: die fehlenden Würfel
        missing = [(x, y_, z) for x in range(2) for y_ in range(2) for z in range(2) if (x, y_, z) not in CUBE_TASK]
        note(c, L, y - 34 * mm, f"Es fehlen die Würfel vorne oben ({len(missing)} Stück). Schicht für Schicht: 4 + 4 = 8.", 8)
    y -= 42 * mm

    y = task_head(c, y, 6, "Parallel und senkrecht erkennen",
                  "a) Färbe Geraden, die parallel sind, mit derselben Farbe (2 Paare).  b) und c) Färbe Geraden, die senkrecht "
                  "zueinander stehen, mit derselben Farbe und zeichne das Zeichen für den rechten Winkel ein.",
                  "Ich kann Parallelen und Senkrechte mit dem Geodreieck erkennen.")
    specs = [("a", 951, "par", 2, [2, 2], 1), ("b", 952, "perp", 2, None, 1), ("c", 953, "perp", 1, None, 2)]
    for k, (lbl, seed, kind, groups, sizes, distract) in enumerate(specs):
        lines = gen_box(seed, kind, groups, sizes, distract)
        draw_box(c, L + k * (BOX_W + 4 * mm), y, lines, kind, sol, lbl)
    c.showPage()


def page4(c, sol):
    header(c, "Probetest Mathe", "Raum und Bewegung & Linien · Seite 4", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 7, "Mit dem Geodreieck zeichnen und messen",
                  "a) Zeichne zur Geraden g eine Parallele durch den Punkt P und eine Senkrechte durch den Punkt Q.  "
                  f"b) Zeichne ein Rechteck mit den Seiten {RECT_CM[0]} cm und {RECT_CM[1]} cm. Zeichne in alle Ecken das Zeichen "
                  "für den rechten Winkel.  c) Miss die Strecken genau.",
                  "Ich kann Parallelen und Senkrechte mit dem Geodreieck zeichnen.")
    # a)
    fh = 62 * mm
    field(c, L, y, W, fh, "a)")
    gx, gy, gdeg = L + 85 * mm, y - 38 * mm, 14
    a = math.radians(gdeg)
    line_through(c, gx, gy, gdeg, 70 * mm, INK, 1.1)
    text(c, gx + 70 * mm * math.cos(a) - 4 * mm, gy + 70 * mm * math.sin(a) - 5 * mm, "g", 11, "Sans-Bold")
    px, py = gx - 30 * mm, gy + 16 * mm
    qx, qy = gx + 30 * mm * math.cos(a), gy + 30 * mm * math.sin(a)
    if sol:
        line_through(c, px + 25 * mm * math.cos(a), py + 25 * mm * math.sin(a), gdeg, 68 * mm, SOL, 1.6)
        dist = (py - gy) * math.cos(a) - (px - gx) * math.sin(a)
        for t in (-50 * mm, 45 * mm):
            fx, fy = gx + t * math.cos(a), gy + t * math.sin(a)
            c.setStrokeColor(MUTED); c.setLineWidth(0.7); c.setDash(1.5, 1.5)
            c.line(fx, fy, fx - dist * math.sin(a), fy + dist * math.cos(a)); c.setDash()
        line_through(c, qx, qy, gdeg + 90, 26 * mm, SOL2, 1.6)
        right_mark(c, (qx, qy), (qx + math.cos(a), qy + math.sin(a)),
                   (qx - math.sin(a), qy + math.cos(a)), r=3.4 * mm, color=SOL2)
        note(c, L + 3 * mm, y - fh + 3 * mm, "rot: Parallele durch P (überall gleicher Abstand, gestrichelt)   "
             "grün: Senkrechte durch Q mit Zeichen für den rechten Winkel", 7.5, SOL)
    for (x, yv, lbl) in ((px, py, "P"), (qx, qy, "Q")):
        c.setFillColor(INK); c.circle(x, yv, 0.9 * mm, stroke=0, fill=1)
        text(c, x - 4.5 * mm, yv + 2 * mm, lbl, 10.5, "Sans-Bold")
    y -= fh + 5 * mm
    # b)
    bw_, bh_ = 100 * mm, 52 * mm
    field(c, L, y, bw_, bh_, "b)")
    if sol:
        rx, ry = L + 20 * mm, y - 44 * mm
        pts = [(rx, ry), (rx + RECT_CM[0] * 10 * mm, ry), (rx + RECT_CM[0] * 10 * mm, ry + RECT_CM[1] * 10 * mm),
               (rx, ry + RECT_CM[1] * 10 * mm)]
        p = c.beginPath(); p.moveTo(*pts[0])
        for q in pts[1:]:
            p.lineTo(*q)
        p.close()
        c.setStrokeColor(SOL); c.setLineWidth(1.5); c.drawPath(p, stroke=1, fill=0)
        for i in range(4):
            right_mark(c, pts[i], pts[i - 1], pts[(i + 1) % 4], r=3 * mm, color=SOL)
        ctext(c, rx + 30 * mm, ry - 4 * mm, f"{RECT_CM[0]} cm", 8.5, "Sans-Bold", SOL)
        text(c, rx + 61.5 * mm, ry + 14 * mm, f"{RECT_CM[1]} cm", 8.5, "Sans-Bold", SOL)
    # c)
    cx0 = L + bw_ + 6 * mm
    text(c, cx0, y - 4.5 * mm, "c)", 9.5, "Sans-Bold", FIG)
    for i, cm in enumerate(SEGMENTS_CM):
        yy = y - 12 * mm - i * 14 * mm
        seg(c, (cx0, yy), (cx0 + cm * 10 * mm, yy), INK, 1)
        answer(c, cx0, yy - 6.5 * mm, 20 * mm, sol, fmt_cm(cm), 9.5)
        if not sol:
            text(c, cx0 + 21 * mm, yy - 6.1 * mm, "cm", 9, "Sans", MUTED)
    y -= bh_ + 8 * mm
    if sol:
        y = wrapped(c, L, y + 3 * mm, "So geht's: Parallele = eine Hilfslinie des Geodreiecks auf g legen und bis P verschieben. "
                    "Senkrechte = die Mittellinie (von der 0 zur Spitze) auf g legen und verschieben, bis die lange Kante durch Q geht. "
                    "Messen = die 0 an den Anfang der Strecke legen und am Ende ablesen.", W, 8.5, color=SOL)
    c.showPage()


def page5(c, sol):
    header(c, "Probetest Mathe", "Raum und Bewegung & Linien · Seite 5", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 8, "Rechte Winkel",
                  "a) Prüfe mit dem Geodreieck alle Ecken. Zeichne bei jedem rechten Winkel das Zeichen ein (Bogen mit Punkt) "
                  "und schreibe darunter, wie viele rechte Winkel die Figur hat.  b) Zeichne mit dem Geodreieck ein Viereck mit "
                  "genau 2 rechten Winkeln.",
                  "Ich kann rechte Winkel erkennen und das richtige Symbol einzeichnen.")
    counts = []
    for i in range(len(RIGHT_FIGS)):
        ox = L + 6 * mm + i * (W / 4)
        pts = fig_points(i, ox, y - 42 * mm)
        polygon(c, pts, marks=False)
        if sol:
            c.setStrokeColor(SOL)
            for k in right_corners(pts):
                right_mark(c, pts[k], pts[k - 1], pts[(k + 1) % len(pts)], r=3.2 * mm, color=SOL)
        n = len(right_corners(pts))
        counts.append(n)
        answer(c, ox, y - 50 * mm, 10 * mm, sol, str(n))
        text(c, ox + 11 * mm, y - 49.6 * mm, "rechte Winkel", 8.5, "Sans", MUTED)
    y -= 58 * mm
    fh = 50 * mm
    field(c, L, y, W, fh, "b)")
    if sol:
        ox, oy = L + 60 * mm, y - 40 * mm
        pts = [(ox + x * mm, oy + yv * mm) for x, yv in TWO_RIGHT]
        assert len(right_corners(pts)) == 2
        p = c.beginPath(); p.moveTo(*pts[0])
        for q in pts[1:]:
            p.lineTo(*q)
        p.close()
        c.setStrokeColor(SOL); c.setLineWidth(1.5); c.drawPath(p, stroke=1, fill=0)
        for k in right_corners(pts):
            right_mark(c, pts[k], pts[k - 1], pts[(k + 1) % 4], r=3 * mm, color=SOL)
        note(c, L + 3 * mm, y - fh + 3 * mm, "z. B. ein Trapez mit zwei rechten Winkeln. Andere Vierecke mit genau 2 rechten "
             "Winkeln sind auch richtig (ein Rechteck hat 4!).", 7.5)
    y -= fh + 10 * mm

    # Selbsteinschätzung
    text(c, L, y, "Das kann ich schon", 12, "Sans-Bold")
    for k, h in enumerate(("gut", "fast", "üben")):
        ctext(c, R - 28.2 * mm + k * 10 * mm, y, h, 7.5, "Sans-Bold", MUTED)
    y -= 3 * mm
    rh = 7.4 * mm
    for i, g in enumerate(GOALS):
        yy = y - i * rh
        hline(c, L, R, yy - rh, LINE, 0.4)
        wrapped(c, L + 1 * mm, yy - 4.8 * mm, g, W - 34 * mm, 8)
        for k in range(3):
            c.setStrokeColor(INK); c.setLineWidth(0.6)
            c.rect(R - 30 * mm + k * 10 * mm, yy - 5.6 * mm, 3.6 * mm, 3.6 * mm, stroke=1, fill=0)
    bx, bw2, bh2, by = R - 66 * mm, 66 * mm, 11 * mm, 10 * mm
    c.setStrokeColor(INK); c.setLineWidth(1)
    c.roundRect(bx, by, bw2, bh2, 3 * mm, stroke=1, fill=0)
    text(c, bx + 4 * mm, by + 4 * mm, f"Total:  ______ / {TOTAL} Punkte", 11, "Sans-Bold")
    if sol:
        text(c, L, by + 8 * mm, f"Punkte: " + " · ".join(f"A{k} {v}" for k, v in POINTS.items()), 8, "Sans", MUTED)
        text(c, L, by + 3.5 * mm, f"Richtwert: ab {round(TOTAL * .9)} P. sehr gut · ab {round(TOTAL * .75)} P. gut · "
             f"ab {round(TOTAL * .6)} P. erreicht", 8, "Sans", MUTED)
    else:
        text(c, L, by + 4 * mm, "Drucken in Originalgrösse (100 %).", 7.5, "Sans", MUTED)
    c.showPage()
    return counts


def build(sol):
    name = "probetest-raum-linien-loesungen.pdf" if sol else "probetest-raum-linien.pdf"
    out = OUT_DIR / name
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Probetest Mathe: Raum und Bewegung & Linien" + (" – Lösungen" if sol else ""))
    c.setViewerPreference("PrintScaling", "None")
    page1(c, sol); page2(c, sol); page3(c, sol); page4(c, sol)
    counts = page5(c, sol)
    c.save()
    print(out, "· rechte Winkel:", counts)


if __name__ == "__main__":
    build(False)
    build(True)
