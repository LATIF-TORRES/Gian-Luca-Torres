"""Zusatz-Übungsblatt 4. Klasse: Flächeninhalt mit halben Häuschen und fehlende Würfel bis zum grossen Würfel.

Aufruf:  python3 zusatz_halbe_haeuschen_wuerfel_pdf.py
Ausgabe: zusatz-halbe-haeuschen-wuerfel.pdf (3 Seiten)
         zusatz-halbe-haeuschen-wuerfel-loesungen.pdf (3 Seiten: dieselben Seiten, Lösung farbig eingezeichnet)

Alle Lösungen werden aus denselben Daten berechnet, aus denen die Figuren gezeichnet werden:
- Flächen: Jede Figur wird mit jedem Häuschen geschnitten. So zählt das Programm ganze und halbe Häuschen exakt.
- Würfel: Anzahl der Würfel, Grösse des kleinsten passenden grossen Würfels und fehlende Würfel.
"""
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from zeichnen import (CELL, FIG, FIG_FILL, INK, L, MUTED, OUT_DIR, PAGE_H, R, SOFT, W, building, ctext, grid,
                      header, hline, text, wrapped)

SOL = HexColor("#d0342c")
WHOLE = HexColor("#cfe0ff")   # Lösung: ganze Häuschen
HALF = HexColor("#ffd59a")    # Lösung: halbe Häuschen

# ---------- Daten ----------
# Figuren: Ecken auf Kreuzungen der Häuschenlinien (x nach rechts, y nach oben), schräge Seiten nur 45°
FIGURES = {
    "A": [(0, 0), (4, 0), (0, 4)],
    "B": [(0, 0), (4, 0), (4, 3), (2, 5), (0, 3)],
    "C": [(0, 0), (3, 0), (5, 2), (2, 2)],
    "D": [(1, 0), (3, 0), (4, 1), (4, 3), (3, 4), (1, 4), (0, 3), (0, 1)],
    "E": [(0, 0), (6, 0), (4, 2), (2, 2)],
    "F": [(3, 0), (6, 3), (3, 6), (0, 3)],
}
FIG_POS = {"A": (1, 1), "B": (8, 1), "C": (15, 1), "D": (23, 1), "E": (2, 9), "F": (12, 9)}
GRID1 = (35, 16)  # Spalten, Reihen für Aufgabe 1

DRAW_TASKS = [  # Aufgabe 3: Musterlösung und geforderte Werte
    ("a", "Zeichne ein Dreieck mit dem Flächeninhalt 8 Häuschen. Die Ecken liegen auf den Kreuzungen der Häuschenlinien.",
     [(1, 1), (5, 1), (1, 5)], {"area": 8}),
    ("b", "Zeichne eine Figur aus genau 5 ganzen und 2 halben Häuschen. Schreibe den Flächeninhalt auf.",
     [(1, 2), (6, 2), (7, 3), (0, 3)], {"whole": 5, "half": 2}),
]

TARGET_BUILDINGS = {  # Aufgabe 4: Ziel ist der Würfel 3 × 3 × 3
    "a": [(x, y, 0) for x in range(3) for y in range(3)],
    "b": [(x, y, 0) for x in range(3) for y in range(3)] + [(x, 2, 1) for x in range(3)],
    "c": [(x, y, z) for x in range(3) for y in range(3) for z in range(2)],
    "d": [(x, y, z) for x in range(3) for y in range(3) for z in range(3) if not (y == 0 and z == 2)],
}
MIN_BUILDINGS = {  # Aufgabe 5: kleinster passender Würfel
    "a": [(0, 0, 0), (1, 0, 0), (0, 1, 0)],
    "b": [(0, 0, 0), (1, 0, 0), (2, 0, 0)],
    "c": [(0, 0, 0), (1, 0, 0), (0, 1, 0), (0, 1, 1)],
}
WORD_TASKS = [
    ("a) Ein grosser Würfel ist 4 Würfel lang, 4 Würfel breit und 4 Würfel hoch. Wie viele Holzwürfel braucht man?",
     "4 · 4 · 4 = 64 Holzwürfel"),
    ("b) Mia hat 20 Holzwürfel. Sie will einen grossen Würfel bauen: 3 lang, 3 breit und 3 hoch. "
     "Wie viele Holzwürfel fehlen ihr noch?", "27 − 20 = 7 Holzwürfel"),
    ("c) Tim hat 10 Holzwürfel. Er baut einen grossen Würfel: 2 lang, 2 breit und 2 hoch. "
     "Wie viele Holzwürfel bleiben übrig?", "10 − 8 = 2 Holzwürfel"),
]


# ---------- Berechnung ----------
def clip(poly, x0, y0, x1, y1):
    """Sutherland-Hodgman: Teil des Polygons im Rechteck [x0,x1] × [y0,y1]."""
    def cut(pts, inside, inter):
        out = []
        for i in range(len(pts)):
            a, b = pts[i - 1], pts[i]
            if inside(b):
                if not inside(a):
                    out.append(inter(a, b))
                out.append(b)
            elif inside(a):
                out.append(inter(a, b))
        return out

    def ix(a, b, x):
        t = (x - a[0]) / (b[0] - a[0])
        return (x, a[1] + t * (b[1] - a[1]))

    def iy(a, b, y):
        t = (y - a[1]) / (b[1] - a[1])
        return (a[0] + t * (b[0] - a[0]), y)

    pts = list(poly)
    for inside, inter in ((lambda p: p[0] >= x0, lambda a, b: ix(a, b, x0)),
                          (lambda p: p[0] <= x1, lambda a, b: ix(a, b, x1)),
                          (lambda p: p[1] >= y0, lambda a, b: iy(a, b, y0)),
                          (lambda p: p[1] <= y1, lambda a, b: iy(a, b, y1))):
        if not pts:
            break
        pts = cut(pts, inside, inter)
    return pts


def poly_area(pts):
    return abs(sum(pts[i - 1][0] * pts[i][1] - pts[i][0] * pts[i - 1][1] for i in range(len(pts)))) / 2


def count_cells(poly):
    """Gibt (ganze, halbe, Stücke) zurück. Stücke = Liste (Zelle, Teilpolygon, Art)."""
    xs, ys = [p[0] for p in poly], [p[1] for p in poly]
    whole = half = 0
    pieces = []
    for cx in range(min(xs), max(xs)):
        for cy in range(min(ys), max(ys)):
            part = clip(poly, cx, cy, cx + 1, cy + 1)
            a = poly_area(part) if len(part) >= 3 else 0
            if abs(a - 1) < 1e-9:
                whole += 1
                pieces.append((part, "whole"))
            elif abs(a - 0.5) < 1e-9:
                half += 1
                pieces.append((part, "half"))
            else:
                assert a < 1e-9, f"Häuschen ({cx},{cy}) ist weder ganz noch halb: {a}"
    assert abs(whole + half / 2 - poly_area(poly)) < 1e-9
    return whole, half, pieces


def fmt(v):
    return f"{v:g}"


def cube_info(cubes):
    n = max(max(c[i] for c in cubes) + 1 for i in range(3))
    return len(cubes), n, n ** 3 - len(cubes)


# ---------- Zeichnen ----------
def task_head(c, y, nr, title, instruction):
    c.setFillColor(INK)
    c.circle(L + 3.4 * mm, y + 1.3 * mm, 3.4 * mm, stroke=0, fill=1)
    ctext(c, L + 3.4 * mm, y - 0.2 * mm, str(nr), 10, "Sans-Bold", white)
    text(c, L + 9 * mm, y, title, 12, "Sans-Bold")
    y -= 5.5 * mm
    for part in instruction.split("  "):
        y = wrapped(c, L + 9 * mm, y, part.strip(), W - 9 * mm, 9.5) - 0.8 * mm
    return y - 3 * mm


def answer(c, x, y, width, sol, value, size=10):
    hline(c, x, x + width, y - 0.8 * mm)
    if sol:
        text(c, x + 1 * mm, y + 0.3 * mm, value, size, "Sans-Bold", SOL)


def merkkasten(c, y, h, title, lines):
    c.setFillColor(SOFT)
    c.setStrokeColor(HexColor("#9aa5ba"))
    c.setLineWidth(0.8)
    c.roundRect(L, y - h, W, h, 3 * mm, stroke=1, fill=1)
    text(c, L + 4 * mm, y - 6.5 * mm, title, 11.5, "Sans-Bold")
    yy = y - 12 * mm
    for ln in lines:
        text(c, L + 4 * mm, yy, ln, 9.5)
        yy -= 4.7 * mm


def draw_poly(c, poly, x0, y0, sol):
    """x0, y0 = Papierkoordinate der Kreuzung (0, 0)."""
    P = lambda p: (x0 + p[0] * CELL, y0 + p[1] * CELL)
    if sol:
        for part, kind in count_cells(poly)[2]:
            path = c.beginPath()
            path.moveTo(*P(part[0]))
            for q in part[1:]:
                path.lineTo(*P(q))
            path.close()
            c.setFillColor(WHOLE if kind == "whole" else HALF)
            c.drawPath(path, stroke=0, fill=1)
    path = c.beginPath()
    path.moveTo(*P(poly[0]))
    for q in poly[1:]:
        path.lineTo(*P(q))
    path.close()
    c.setStrokeColor(SOL if sol else FIG)
    c.setLineWidth(1.4)
    if sol:
        c.drawPath(path, stroke=1, fill=0)
    else:
        c.setFillColor(FIG_FILL)
        c.drawPath(path, stroke=1, fill=1)


def legend(c, x, y):
    for i, (col, lbl) in enumerate(((WHOLE, "ganzes Häuschen"), (HALF, "halbes Häuschen"))):
        c.setFillColor(col)
        c.rect(x + i * 45 * mm, y - 1 * mm, 4 * mm, 4 * mm, stroke=0, fill=1)
        text(c, x + i * 45 * mm + 5.5 * mm, y, lbl, 8.5, "Sans", SOL)


# ---------- Seiten ----------
def page1(c, sol):
    header(c, "Zusatzblatt Mathe", "Halbe Häuschen und grosse Würfel · 4. Klasse · Seite 1", name_fields=not sol)
    y = PAGE_H - 37 * mm
    merkkasten(c, y, 41 * mm, "Merke: Flächen mit halben Häuschen", [
        "Manche Figuren haben schräge Seiten. Eine schräge Linie von Ecke zu Ecke",
        "teilt ein Häuschen in zwei gleich grosse Hälften (Bild rechts).",
        "2 halbe Häuschen sind zusammen 1 ganzes Häuschen.",
        "So zählst du: 1. ganze Häuschen zählen  2. halbe Häuschen zählen",
        "3. Anzahl halbe Häuschen durch 2 teilen  4. alles zusammenzählen",
        "Beispiel: 6 ganze und 4 halbe Häuschen:  6 + 4 : 2 = 6 + 2 = 8 Häuschen",
    ])
    # kleines Bild: ein Häuschen mit Diagonale
    bx, by = R - 26 * mm, y - 26 * mm
    s = 14 * mm
    c.setFillColor(HALF)
    p = c.beginPath(); p.moveTo(bx, by); p.lineTo(bx + s, by); p.lineTo(bx, by + s); p.close()
    c.drawPath(p, stroke=0, fill=1)
    c.setStrokeColor(INK); c.setLineWidth(0.9)
    c.rect(bx, by, s, s, stroke=1, fill=0)
    c.line(bx + s, by, bx, by + s)
    ctext(c, bx + s / 2, by - 4 * mm, "1 halbes Häuschen", 7, "Sans", MUTED)
    y -= 41 * mm + 8 * mm

    y = task_head(c, y, 1, "Flächeninhalt bestimmen",
                  "Bestimme bei jeder Figur den Flächeninhalt. Schreibe unter die Figur: wie viele ganze Häuschen, "
                  "wie viele halbe Häuschen und den ganzen Flächeninhalt.")
    cols, rows = GRID1
    grid(c, L, y, cols, rows)
    base_y = y - rows * CELL
    data = {}
    for name, poly in FIGURES.items():
        gx, gy = FIG_POS[name]
        top = max(p[1] for p in poly)
        oy = base_y + (rows - gy - top) * CELL
        ox = L + gx * CELL
        draw_poly(c, poly, ox, oy, sol)
        text(c, ox, oy + top * CELL + 1.5 * mm, name, 10.5, "Sans-Bold", FIG)
        data[name] = count_cells(poly)[:2]
    y -= rows * CELL + 6 * mm
    cw = W / 3
    for i, name in enumerate(FIGURES):
        col, row = i % 3, i // 3
        x, yy = L + col * cw, y - row * 17 * mm
        whole, half = data[name]
        area = whole + half / 2
        text(c, x, yy, f"{name}:", 10, "Sans-Bold", FIG)
        text(c, x + 6 * mm, yy, "ganze", 8.5, "Sans", MUTED); answer(c, x + 16 * mm, yy, 9 * mm, sol, str(whole))
        text(c, x + 27 * mm, yy, "halbe", 8.5, "Sans", MUTED); answer(c, x + 37 * mm, yy, 9 * mm, sol, str(half))
        text(c, x + 6 * mm, yy - 6.5 * mm, "Flächeninhalt", 8.5, "Sans", MUTED)
        answer(c, x + 27 * mm, yy - 6.5 * mm, 14 * mm, sol, fmt(area))
        text(c, x + 42 * mm, yy - 6.2 * mm, "Häuschen", 8.5, "Sans", MUTED)
        if sol:
            text(c, x + 6 * mm, yy - 11.5 * mm, f"{whole} + {half} : 2 = {whole} + {fmt(half / 2)} = {fmt(area)}",
                 7.5, "Sans", SOL)
    if sol:
        legend(c, L, y - 2 * 17 * mm)
    c.showPage()
    return {n: d[0] + d[1] / 2 for n, d in data.items()}


def page2(c, sol, areas):
    header(c, "Zusatzblatt Mathe", "Halbe Häuschen und grosse Würfel · Seite 2", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 2, "Flächen vergleichen",
                  "Schau die Figuren A bis F aus Aufgabe 1 an. Beantworte die Fragen.")
    same = [n for n in areas if sum(areas[m] == areas[n] for m in areas) == 2]
    assert len(same) == 2, same
    biggest = max(areas, key=areas.get)
    assert sum(areas[n] == areas[biggest] for n in areas) == 1
    smallest = min(areas, key=areas.get)
    assert sum(areas[n] == areas[smallest] for n in areas) == 1
    for q, a in (("a) Welche zwei Figuren haben den gleichen Flächeninhalt?", f"{same[0]} und {same[1]}"),
                 ("b) Welche Figur hat den grössten Flächeninhalt?", f"{biggest} ({fmt(areas[biggest])} Häuschen)"),
                 ("c) Welche Figur hat den kleinsten Flächeninhalt?", f"{smallest} ({fmt(areas[smallest])} Häuschen)")):
        text(c, L + 9 * mm, y, q, 9.5)
        answer(c, R - 42 * mm, y, 42 * mm, sol, a, 9.5)
        y -= 8 * mm
    y -= 6 * mm

    y = task_head(c, y, 3, "Figuren mit halben Häuschen zeichnen",
                  "  ".join(f"{t[0]}) {t[1]}" for t in DRAW_TASKS))
    fw = 17
    for k, (lbl, desc, poly, need) in enumerate(DRAW_TASKS):
        fx = L + k * (fw * CELL + 3 * CELL)
        text(c, fx, y, f"{lbl})", 10, "Sans-Bold", FIG)
        grid(c, fx, y - 2 * mm, fw, 8)
        whole, half, _ = count_cells(poly)
        if "area" in need:
            assert whole + half / 2 == need["area"]
        else:
            assert (whole, half) == (need["whole"], need["half"])
        if sol:
            draw_poly(c, poly, fx, y - 2 * mm - 8 * CELL, True)
            text(c, fx + 1 * mm, y - 2 * mm - 8 * CELL - 4.5 * mm,
                 f"Beispiel: {whole} ganze + {half} halbe = {fmt(whole + half / 2)} Häuschen", 8, "Sans", SOL)
        if lbl == "b":
            text(c, fx, y - 2 * mm - 8 * CELL - 10 * mm, "Flächeninhalt:", 9.5)
            answer(c, fx + 25 * mm, y - 2 * mm - 8 * CELL - 10 * mm, 14 * mm, sol, fmt(whole + half / 2))
            text(c, fx + 40 * mm, y - 2 * mm - 8 * CELL - 9.6 * mm, "Häuschen", 9.5)
    y -= 2 * mm + 8 * CELL + 20 * mm
    if sol:
        y = wrapped(c, L, y + 6 * mm, "Es gibt viele richtige Lösungen. Wichtig: a) Das Dreieck hat genau 8 Häuschen. "
                    "b) Die Figur hat genau 5 ganze und 2 halbe Häuschen, also 5 + 1 = 6 Häuschen.", W, 8.5, color=SOL)
        y -= 4 * mm

    merkkasten(c, y, 34 * mm, "Merke: Ein grosser Würfel", [
        "Ein grosser Würfel ist gleich lang, gleich breit und gleich hoch.",
        "2 lang, 2 breit, 2 hoch:   2 · 2 · 2 = 8 Würfel",
        "3 lang, 3 breit, 3 hoch:   3 · 3 · 3 = 27 Würfel",
        "Fehlende Würfel = Würfel vom grossen Würfel − Würfel vom Gebäude",
    ])
    building(c, [(x, y_, z) for x in range(2) for y_ in range(2) for z in range(2)], R - 48 * mm, y - 27 * mm, s=5 * mm)
    ctext(c, R - 41 * mm, y - 31 * mm, "8 Würfel", 7.5, "Sans", MUTED)
    building(c, [(x, y_, z) for x in range(3) for y_ in range(3) for z in range(3)], R - 25 * mm, y - 27 * mm, s=5 * mm)
    ctext(c, R - 14 * mm, y - 31 * mm, "27 Würfel", 7.5, "Sans", MUTED)
    c.showPage()


def page3(c, sol):
    header(c, "Zusatzblatt Mathe", "Halbe Häuschen und grosse Würfel · Seite 3", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 4, "Wie viele Würfel fehlen bis 3 × 3 × 3?",
                  "Alle Gebäude sind ohne Lücken gebaut: Unter jedem Würfel steht ein Würfel.  "
                  "Zähle zuerst die Würfel im Gebäude. Rechne dann: Wie viele Würfel fehlen noch, bis das Gebäude ein "
                  "grosser Würfel ist (3 lang, 3 breit, 3 hoch = 27 Würfel)?")
    bw = W / 4
    for i, (name, cubes) in enumerate(TARGET_BUILDINGS.items()):
        x = L + i * bw
        n, _, _ = cube_info(cubes)
        assert all(0 <= v < 3 for cu in cubes for v in cu)
        text(c, x + 2 * mm, y, f"{name})", 10, "Sans-Bold", FIG)
        building(c, cubes, x + 6 * mm, y - 36 * mm, s=6 * mm)
        text(c, x + 2 * mm, y - 43 * mm, "Würfel:", 9)
        answer(c, x + 17 * mm, y - 43 * mm, 12 * mm, sol, str(n))
        text(c, x + 2 * mm, y - 50 * mm, "Es fehlen:", 9)
        answer(c, x + 20 * mm, y - 50 * mm, 12 * mm, sol, str(27 - n))
        if sol:
            text(c, x + 2 * mm, y - 55 * mm, f"27 − {n} = {27 - n}", 8, "Sans", SOL)
    y -= 64 * mm

    y = task_head(c, y, 5, "Der kleinste grosse Würfel",
                  "Das Gebäude soll ein grosser Würfel werden. Es sollen so wenig Würfel wie möglich dazukommen.  "
                  "Überlege zuerst: Passt das Gebäude in einen Würfel 2 × 2 × 2?  Oder braucht es einen Würfel 3 × 3 × 3?  "
                  "Schreibe dann auf, welcher grosse Würfel es wird und wie viele Würfel fehlen.")
    bw = W / 3
    for i, (name, cubes) in enumerate(MIN_BUILDINGS.items()):
        x = L + i * bw
        n, size, missing = cube_info(cubes)
        text(c, x + 2 * mm, y, f"{name})", 10, "Sans-Bold", FIG)
        building(c, cubes, x + 10 * mm, y - 26 * mm, s=6.5 * mm)
        text(c, x + 2 * mm, y - 33 * mm, "Grosser Würfel:", 9)
        answer(c, x + 28 * mm, y - 33 * mm, 22 * mm, sol, f"{size} × {size} × {size}")
        text(c, x + 2 * mm, y - 40 * mm, "Es fehlen:", 9)
        answer(c, x + 20 * mm, y - 40 * mm, 12 * mm, sol, str(missing))
        if sol:
            text(c, x + 2 * mm, y - 45 * mm, f"{size ** 3} − {n} = {missing}", 8, "Sans", SOL)
    y -= 54 * mm

    y = task_head(c, y, 6, "Rechnen mit Würfeln", "Lies jede Aufgabe genau. Schreibe die Rechnung und das Ergebnis auf.")
    for q, a in WORD_TASKS:
        y = wrapped(c, L + 9 * mm, y, q, W - 9 * mm, 9.5) - 1 * mm
        answer(c, L + 9 * mm, y - 2 * mm, 80 * mm, sol, a, 9.5)
        y -= 10 * mm
    c.showPage()


def build(sol):
    name = "zusatz-halbe-haeuschen-wuerfel-loesungen.pdf" if sol else "zusatz-halbe-haeuschen-wuerfel.pdf"
    out = OUT_DIR / name
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Zusatzblatt: Halbe Häuschen und grosse Würfel" + (" – Lösungen" if sol else ""))
    c.setViewerPreference("PrintScaling", "None")
    areas = page1(c, sol)
    page2(c, sol, areas)
    page3(c, sol)
    c.save()
    print(out, areas)


if __name__ == "__main__":
    build(False)
    build(True)
