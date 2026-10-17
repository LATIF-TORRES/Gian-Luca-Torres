"""10 Übungsaufgaben „Linien“ (parallel, senkrecht, Strecken messen, zeichnen) im Stil von
Mathematik 4 Primarstufe A 9.1–9.3, mit separatem Lösungsblatt (gleiche Seiten, Lösung farbig eingezeichnet).

Aufruf:  python3 linien_uebungen_pdf.py
Ausgabe: linien-10-aufgaben.pdf, linien-10-aufgaben-loesungen.pdf (je 4 Seiten)

Die Linien werden zufällig, aber reproduzierbar (feste Startwerte) erzeugt und geprüft:
- Linien, die NICHT zusammengehören, sind mindestens 12° von parallel entfernt
  (in den Senkrecht-Aufgaben zusätzlich mindestens 12° von senkrecht).
- Parallele Linien haben mindestens 6 mm Abstand, senkrechte Paare kreuzen sich im Feld.
Wichtig beim Drucken: Grösse 100 %, sonst stimmen die Längen in Aufgabe 7 und 8 nicht.
"""
import math
import random

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from probetest_pdf import (FIG, INK, L, MUTED, OUT_DIR, PAGE_H, R, SOFT, W, ctext, header, hline,
                           right_mark, text, wrapped)
from reportlab.lib.colors import white

COLORS = [HexColor("#d0342c"), HexColor("#1f6fd6"), HexColor("#0f8a6a"), HexColor("#e08a00")]
BOX_W = (W - 2 * 4 * mm) / 3
BOX_H = 52  # in mm (Feldhöhe)
INSET = 3   # mm Rand im Feld


# ---------- Geometrie ----------
def clip(px, py, deg, w, h):
    """Schneidet die Gerade durch (px, py) mit Richtung deg auf das Rechteck [INSET, w-INSET] × [INSET, h-INSET]."""
    dx, dy = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    t0, t1 = -1e9, 1e9
    for p, d, lo, hi in ((px, dx, INSET, w - INSET), (py, dy, INSET, h - INSET)):
        if abs(d) < 1e-9:
            if not lo <= p <= hi:
                return None
            continue
        a, b = (lo - p) / d, (hi - p) / d
        t0, t1 = max(t0, min(a, b)), min(t1, max(a, b))
    if t1 - t0 < 1:
        return None
    return (px + t0 * dx, py + t0 * dy), (px + t1 * dx, py + t1 * dy)


def ang_diff(a, b):
    d = abs(a - b) % 180
    return min(d, 180 - d)


def seg_dist_parallel(l1, l2):
    """Abstand zweier paralleler Geraden (Richtung von l1)."""
    (x1, y1), _ = l1["seg"]
    (x2, y2), _ = l2["seg"]
    a = math.radians(l1["deg"])
    return abs(-(x2 - x1) * math.sin(a) + (y2 - y1) * math.cos(a))


def intersection(s1, s2):
    (x1, y1), (x2, y2) = s1
    (x3, y3), (x4, y4) = s2
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(den) < 1e-9:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den
    return t, u, (x1 + t * (x2 - x1), y1 + t * (y2 - y1))


def make_line(rng, px, py, deg, w, h, group):
    s = clip(px, py, deg, w, h)
    if not s:
        return None
    (ax, ay), (bx, by) = s
    length = math.hypot(bx - ax, by - ay)
    t0, t1 = rng.uniform(0, 0.15), rng.uniform(0, 0.15)
    a = (ax + (bx - ax) * t0, ay + (by - ay) * t0)
    b = (bx - (bx - ax) * t1, by - (by - ay) * t1)
    if length * (1 - t0 - t1) < 26:
        return None
    return {"seg": (a, b), "deg": deg % 180, "group": group}


def gen_box(seed, kind, groups, sizes, distract):
    """kind 'par': groups = Anzahl Parallelen-Gruppen; kind 'perp': groups = Anzahl senkrechter Paare."""
    w, h = BOX_W / mm, BOX_H
    rng = random.Random(seed)
    for _ in range(20000):
        lines = []
        ok = True
        base = [rng.uniform(0, 180) for _ in range(groups)]
        for g, theta in enumerate(base):
            if kind == "par":
                cx, cy = rng.uniform(0.3 * w, 0.7 * w), rng.uniform(0.3 * h, 0.7 * h)
                n = math.radians(theta + 90)
                offs = [0]
                for _ in range(sizes[g] - 1):
                    offs.append(offs[-1] + rng.uniform(7, 14) * rng.choice((1, 1)))
                shift = -offs[-1] / 2
                for o in offs:
                    ln = make_line(rng, cx + (o + shift) * math.cos(n), cy + (o + shift) * math.sin(n), theta, w, h, g)
                    if not ln:
                        ok = False
                    lines.append(ln)
            else:
                cx, cy = rng.uniform(0.28 * w, 0.72 * w), rng.uniform(0.28 * h, 0.72 * h)
                for d in (theta, theta + 90):
                    ln = make_line(rng, cx, cy, d, w, h, g)
                    if not ln:
                        ok = False
                    lines.append(ln)
        for k in range(distract):
            ln = make_line(rng, rng.uniform(0.2 * w, 0.8 * w), rng.uniform(0.2 * h, 0.8 * h),
                           rng.uniform(0, 180), w, h, None)
            if not ln:
                ok = False
            lines.append(ln)
        if not ok:
            continue
        # Prüfen
        for i in range(len(lines)):
            for j in range(i + 1, len(lines)):
                a, b = lines[i], lines[j]
                same = a["group"] is not None and a["group"] == b["group"]
                d = ang_diff(a["deg"], b["deg"])
                if kind == "par":
                    if same and seg_dist_parallel(a, b) < 6:
                        ok = False
                    if not same and d < 12:
                        ok = False
                else:
                    if not same and (d < 12 or abs(d - 90) < 12):
                        ok = False
                    if same:
                        hit = intersection(a["seg"], b["seg"])
                        if not hit or not (0.12 < hit[0] < 0.88 and 0.12 < hit[1] < 0.88):
                            ok = False
                if not ok:
                    break
            if not ok:
                break
        if ok:
            rng.shuffle(lines)
            return lines
    raise RuntimeError(f"Kein gültiges Feld für Startwert {seed}")


# ---------- Aufgaben ----------
TASKS = [
    dict(nr=1, kind="par", title="Welche zwei Geraden sind parallel zueinander?",
         hint="Färbe sie mit derselben Farbe.", groups=1, sizes=[2], distract=2),
    dict(nr=2, kind="par", title="Welche Geraden sind parallel zueinander?",
         hint="Färbe zusammengehörende Geraden mit derselben Farbe. In jedem Feld gibt es 2 Paare.",
         groups=2, sizes=[2, 2], distract=1),
    dict(nr=3, kind="par", title="Welche Geraden sind parallel zueinander?",
         hint="Färbe sie mit derselben Farbe. In jedem Feld gibt es 3 Gruppen. Eine Gruppe hat 3 Geraden!",
         groups=3, sizes=[3, 2, 2], distract=1),
    dict(nr=4, kind="perp", title="Welche zwei Geraden stehen senkrecht zueinander?",
         hint="Färbe sie mit derselben Farbe und zeichne den rechten Winkel ein.", groups=1, sizes=None, distract=2),
    dict(nr=5, kind="perp", title="Welche Geraden stehen senkrecht zueinander?",
         hint="Färbe jedes Paar mit einer eigenen Farbe. In jedem Feld gibt es 2 Paare.", groups=2, sizes=None, distract=1),
    dict(nr=6, kind="perp", title="Welche Geraden stehen senkrecht zueinander?",
         hint="Färbe jedes Paar mit einer eigenen Farbe. In jedem Feld gibt es 3 Paare.", groups=3, sizes=None, distract=1),
]
MEASURE = [
    dict(nr=7, title="Miss die Länge der Strecken mit dem Geodreieck und notiere sie.",
         hint="Die Längen sind ganze oder halbe Zentimeter.", cms=[(11, 2), (3, 9), (7.5, 4), (5.5, 6.5)]),
    dict(nr=8, title="Miss die Länge der Strecken auf den Millimeter genau.",
         hint="Schreibe z. B. 3 cm 7 mm oder 3,7 cm.", cms=[(1.6, 10.3), (8.4, 3.7), (4.8, 7.1), (6.2, 5.9)]),
]
DRAW = [
    dict(nr=9, kind="par", title="Zeichne zu den beiden Geraden je vier parallele Geraden.",
         hint="Hilfslinie des Geodreiecks auf die Gerade legen, verschieben, zeichnen."),
    dict(nr=10, kind="perp", title="Zeichne zu den beiden Geraden je vier Senkrechte.",
         hint="Mittellinie des Geodreiecks auf die Gerade legen, verschieben, entlang der langen Kante zeichnen."),
]


def task_head(c, y, nr, title, hint):
    c.setFillColor(INK)
    c.circle(L + 3.4 * mm, y + 1.3 * mm, 3.4 * mm, stroke=0, fill=1)
    ctext(c, L + 3.4 * mm, y - 0.2 * mm, str(nr), 10, "Sans-Bold", white)
    text(c, L + 9 * mm, y, title, 11.5, "Sans-Bold")
    return wrapped(c, L + 9 * mm, y - 5.5 * mm, hint, W - 9 * mm, 9, color=MUTED) - 2 * mm


def draw_box(c, x0, y_top, lines, kind, solution, label):
    y0 = y_top - BOX_H * mm
    c.setStrokeColor(HexColor("#e1e6ee"))
    c.setLineWidth(0.6)
    c.roundRect(x0, y0, BOX_W, BOX_H * mm, 2 * mm, stroke=1, fill=0)
    text(c, x0 + 2 * mm, y_top - 4.5 * mm, label, 10, "Sans-Bold", MUTED)
    P = lambda p: (x0 + p[0] * mm, y0 + p[1] * mm)
    for ln in lines:
        a, b = ln["seg"]
        col = INK
        width = 0.9
        if solution and ln["group"] is not None:
            col, width = COLORS[ln["group"]], 2.2
        c.setStrokeColor(col)
        c.setLineWidth(width)
        c.line(*P(a), *P(b))
    if solution and kind == "perp":
        groups = {}
        for ln in lines:
            if ln["group"] is not None:
                groups.setdefault(ln["group"], []).append(ln)
        for g, (l1, l2) in groups.items():
            _, _, s = intersection(l1["seg"], l2["seg"])
            sp = P(s)
            d1 = (math.cos(math.radians(l1["deg"])), math.sin(math.radians(l1["deg"])))
            d2 = (math.cos(math.radians(l2["deg"])), math.sin(math.radians(l2["deg"])))
            right_mark(c, sp, (sp[0] + d1[0], sp[1] + d1[1]), (sp[0] + d2[0], sp[1] + d2[1]),
                       r=2.8 * mm, color=COLORS[g])


def pages_lines(c, solution, first_page_header):
    tasks_by_page = [TASKS[:3], TASKS[3:]]
    for p, tasks in enumerate(tasks_by_page):
        first_page_header(c, p)
        y = PAGE_H - 39 * mm
        for t in tasks:
            y = task_head(c, y, t["nr"], t["title"], t["hint"])
            for k, lbl in enumerate("abc"):
                seed = t["nr"] * 100 + k
                lines = gen_box(seed, t["kind"], t["groups"], t["sizes"], t["distract"])
                draw_box(c, L + k * (BOX_W + 4 * mm), y, lines, t["kind"], solution, lbl)
            y -= BOX_H * mm + 9 * mm
        c.showPage()


def page_measure(c, solution, page_header):
    page_header(c, 2)
    y = PAGE_H - 39 * mm
    for t in MEASURE:
        y = task_head(c, y, t["nr"], t["title"], t["hint"])
        rng = random.Random(t["nr"])
        items = []  # jede Zeile: zwei Strecken nebeneinander
        for row, pair in enumerate(t["cms"]):
            x = L + 4 * mm
            for cm in pair:
                items.append((row, x, cm))
                x += max(cm * 10, 44) * mm + 8 * mm  # Platz für die Antwortlinie bei kurzen Strecken
            assert items[-1][1] + items[-1][2] * 10 * mm <= R, f"Zeile {row} zu lang"
        for row, x, cm in items:
            yy = y - 6 * mm - row * 15 * mm
            tilt = math.radians(rng.uniform(-3, 3))
            length = cm * 10 * mm
            x2, y2 = x + length * math.cos(tilt), yy + length * math.sin(tilt)
            c.setStrokeColor(INK); c.setLineWidth(0.9)
            c.line(x, yy, x2, y2)
            for (ex, ey) in ((x, yy), (x2, y2)):
                nx, ny = -math.sin(tilt), math.cos(tilt)
                c.line(ex - 1.6 * mm * nx, ey - 1.6 * mm * ny, ex + 1.6 * mm * nx, ey + 1.6 * mm * ny)
            lx = x + 2 * mm
            if solution:
                lab = f"{cm:g}".replace(".", ",") + " cm"
                if t["nr"] == 8:
                    lab += f"  ({int(cm)} cm {round((cm % 1) * 10)} mm)"
                text(c, lx, yy - 6.5 * mm, lab, 10, "Sans-Bold", COLORS[0])
            else:
                hline(c, lx, lx + 22 * mm, yy - 7 * mm)
                text(c, lx + 23 * mm, yy - 6.6 * mm, "cm", 9, "Sans", MUTED)
        y -= 4 * 15 * mm + 10 * mm
    text(c, L, 12 * mm, "Drucken in Originalgrösse (100 %), damit die Längen stimmen.", 7.5, "Sans", MUTED)
    c.showPage()


def page_draw(c, solution, page_header):
    page_header(c, 3)
    y = PAGE_H - 39 * mm
    fw, fh = W, 98 * mm
    base_lines = {9: [(55, 0.42, 0.5), (-38, 0.62, 0.5)], 10: [(-8, 0.5, 0.62), (52, 0.45, 0.4)]}
    for t in DRAW:
        y = task_head(c, y, t["nr"], t["title"], t["hint"])
        x0, y0 = L, y - fh
        c.setStrokeColor(HexColor("#e1e6ee")); c.setLineWidth(0.6)
        c.roundRect(x0, y0, fw, fh, 2 * mm, stroke=1, fill=0)
        wmm, hmm = fw / mm, fh / mm
        for gi, (deg, fx, fy) in enumerate(base_lines[t["nr"]]):
            px, py = fx * wmm, fy * hmm
            seg = clip(px, py, deg, wmm, hmm)
            (ax, ay), (bx, by) = seg
            k = 0.12
            a = (ax + (bx - ax) * k, ay + (by - ay) * k)
            b = (bx - (bx - ax) * k, by - (by - ay) * k)
            c.setStrokeColor(INK); c.setLineWidth(1.1)
            c.line(x0 + a[0] * mm, y0 + a[1] * mm, x0 + b[0] * mm, y0 + b[1] * mm)
            if not solution:
                continue
            col = COLORS[1 + gi]
            c.setStrokeColor(col); c.setLineWidth(1.2)
            if t["kind"] == "par":
                n = math.radians(deg + 90)
                for o in (-16, -8, 8, 16):
                    s2 = clip(px + o * math.cos(n), py + o * math.sin(n), deg, wmm, hmm)
                    if s2:
                        (cx1, cy1), (cx2, cy2) = s2
                        k2 = 0.1
                        c.line(x0 + (cx1 + (cx2 - cx1) * k2) * mm, y0 + (cy1 + (cy2 - cy1) * k2) * mm,
                               x0 + (cx2 - (cx2 - cx1) * k2) * mm, y0 + (cy2 - (cy2 - cy1) * k2) * mm)
            else:
                d = (math.cos(math.radians(deg)), math.sin(math.radians(deg)))
                nrm = (-d[1], d[0])
                for f in (0.2, 0.4, 0.6, 0.8):
                    qx, qy = a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f
                    half = 11
                    p1 = (x0 + (qx - half * nrm[0]) * mm, y0 + (qy - half * nrm[1]) * mm)
                    p2 = (x0 + (qx + half * nrm[0]) * mm, y0 + (qy + half * nrm[1]) * mm)
                    c.setStrokeColor(col); c.setLineWidth(1.2)
                    c.line(*p1, *p2)
                    q = (x0 + qx * mm, y0 + qy * mm)
                    right_mark(c, q, (q[0] + d[0], q[1] + d[1]), (q[0] + nrm[0], q[1] + nrm[1]), r=2.6 * mm, color=col)
        if solution:
            note = ("Abstände gleich, z. B. 8 mm und 16 mm auf beiden Seiten. Andere Abstände sind auch richtig."
                    if t["kind"] == "par" else
                    "Jede Senkrechte bildet mit der Geraden einen rechten Winkel. Wo genau sie liegen, ist frei.")
            text(c, x0 + 2 * mm, y0 + 2.5 * mm, note, 8, "Sans", COLORS[0])
        y = y0 - 9 * mm
    c.showPage()


def build(solution):
    name = "linien-10-aufgaben-loesungen.pdf" if solution else "linien-10-aufgaben.pdf"
    out = OUT_DIR / name
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Linien: 10 Aufgaben" + (" – Lösungen" if solution else ""))
    c.setViewerPreference("PrintScaling", "None")
    title = "Lösungen: Linien – 10 Aufgaben" if solution else "Linien: 10 Aufgaben"

    def page_header(cv, idx):
        sub = f"Mathematik 4. Klasse · parallel, senkrecht, messen · Seite {idx + 1}"
        header(cv, title, sub, name_fields=(idx == 0 and not solution))

    pages_lines(c, solution, page_header)
    page_measure(c, solution, page_header)
    page_draw(c, solution, page_header)
    c.save()
    print(out)


if __name__ == "__main__":
    build(False)
    build(True)
