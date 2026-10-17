"""Erklärblatt zu Aufgabe 7 des Probetests (parallel, senkrecht, Strecken messen) mit gezeichneter Lösung.

Aufruf:  python3 aufgabe7_erklaerung.py
Ausgabe: aufgabe7-erklaerung.pdf (2 Seiten)
Die Geraden, Punkte und Strecken haben dieselben Werte wie im Probetest (probetest_pdf.py).
"""
import math

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from zeichnen import (FIG, INK, L, MUTED, OUT_DIR, PAGE_H, R, SOFT, W,
                           ctext, header, line_through, right_mark, text, wrapped)

# Werte aus der ersten Version des Probetests (Aufgabe 7 dort)
LINE_PAIRS = {"A": (20, 20, "parallel"), "B": (-30, 60, "senkrecht"),
              "C": (10, 78, "keins"), "D": (15, 105, "senkrecht")}
SEGMENTS_CM = [6.0, 4.5]

PAR = HexColor("#c8281c")    # Parallele: rot
SEN = HexColor("#0f8a6a")    # Senkrechte: grün
NOTE = HexColor("#b4561a")


def pt(cx, cy, deg, d):
    a = math.radians(deg)
    return cx + d * math.cos(a), cy + d * math.sin(a)


def gap_marker(c, p_on_1, deg, dist, color):
    """Gestrichelter Abstandspfeil senkrecht zur Richtung deg, Länge dist."""
    n = math.radians(deg + 90)
    x0, y0 = p_on_1
    x1, y1 = x0 + dist * math.cos(n), y0 + dist * math.sin(n)
    c.setStrokeColor(color)
    c.setLineWidth(0.8)
    c.setDash(1.5, 1.5)
    c.line(x0, y0, x1, y1)
    c.setDash()
    for (x, y) in ((x0, y0), (x1, y1)):
        c.setFillColor(color)
        c.circle(x, y, 0.6 * mm, stroke=0, fill=1)


def merkbox(c, y):
    bh = 38 * mm
    c.setFillColor(SOFT)
    c.setStrokeColor(HexColor("#9aa5ba"))
    c.setLineWidth(0.8)
    c.roundRect(L, y - bh, W, bh, 3 * mm, stroke=1, fill=1)
    half = W / 2
    # parallel
    text(c, L + 5 * mm, y - 8 * mm, "parallel", 12.5, "Sans-Bold", PAR)
    for i, s in enumerate(["Zwei Geraden haben überall den gleichen", "Abstand. Sie treffen sich nie.",
                           "Wie die Schienen einer Eisenbahn."]):
        text(c, L + 5 * mm, y - 14 * mm - i * 4.4 * mm, s, 9.5)
    ox, oy = L + 5 * mm, y - 32 * mm
    line_through(c, ox + 32 * mm, oy + 5 * mm, 0, 30 * mm, PAR, 1.2)
    line_through(c, ox + 32 * mm, oy - 1 * mm, 0, 30 * mm, PAR, 1.2)
    for k in range(3):
        gap_marker(c, (ox + 12 * mm + k * 20 * mm, oy - 1 * mm), 0, 6 * mm, MUTED)
    # senkrecht
    x = L + half + 3 * mm
    text(c, x, y - 8 * mm, "senkrecht", 12.5, "Sans-Bold", SEN)
    for i, s in enumerate(["Zwei Geraden kreuzen sich und bilden", "einen rechten Winkel (Zeichen: Bogen",
                           "mit Punkt). Wie ein Fensterkreuz."]):
        text(c, x, y - 14 * mm - i * 4.4 * mm, s, 9.5)
    cx, cy = x + 74 * mm, y - 26 * mm
    line_through(c, cx, cy, 0, 9 * mm, SEN, 1.2)
    line_through(c, cx, cy, 90, 9 * mm, SEN, 1.2)
    right_mark(c, (cx, cy), (cx + 1, cy), (cx, cy + 1), color=SEN)
    return y - bh - 8 * mm


def teil_a(c, y):
    text(c, L, y, "a) Parallel, senkrecht oder keins?", 13, "Sans-Bold")
    y = wrapped(c, L, y - 6 * mm, "So prüfst du mit dem Geodreieck: Lege die Mittellinie (die Linie von der 0 zur Spitze) "
                "auf eine Gerade. Liegt die andere Gerade genau auf der langen Kante, sind sie senkrecht. "
                "Liegt die andere Gerade genau auf einer der Hilfslinien (den Linien parallel zur langen Kante), "
                "sind sie parallel.", W, 9.5) - 3 * mm
    bw = W / 4
    explain = {
        "parallel": ["Gleicher Abstand", "→ parallel (p)"],
        "senkrecht": ["Rechter Winkel", "→ senkrecht (s)"],
        "keins": ["Kein rechter Winkel", "→ keins (–)"],
    }
    for i, (name, (a1, a2, kind)) in enumerate(LINE_PAIRS.items()):
        cx, cy = L + i * bw + bw / 2, y - 22 * mm
        c.setFillColor(SOFT)
        c.roundRect(L + i * bw + 1.5 * mm, y - 52 * mm, bw - 3 * mm, 52 * mm, 2.5 * mm, stroke=0, fill=1)
        text(c, L + i * bw + 4 * mm, y - 5 * mm, f"{name})", 11, "Sans-Bold", FIG)
        col = PAR if kind == "parallel" else SEN if kind == "senkrecht" else NOTE
        if kind == "parallel":
            p1 = (cx, cy + 4 * mm)
            line_through(c, *p1, a1, 16 * mm, col, 1.2)
            line_through(c, cx, cy - 4 * mm, a2, 16 * mm, col, 1.2)
            # Abstand an zwei Stellen messen: Lot von Gerade 2 auf Gerade 1
            n = math.radians(a1 + 90)
            d = 8 * mm * math.cos(math.radians(a1))  # senkrechter Abstand der beiden Geraden
            for t in (-9 * mm, 9 * mm):
                bx, by = pt(cx, cy - 4 * mm, a1, t)
                gap_marker(c, (bx, by), a1, d, MUTED)
        else:
            p1 = (cx - 2 * mm, cy)
            p2 = (cx + 2 * mm, cy + 1 * mm)
            line_through(c, *p1, a1, 16 * mm, col, 1.2)
            line_through(c, *p2, a2, 13 * mm, col, 1.2)
            # Schnittpunkt berechnen
            d1 = (math.cos(math.radians(a1)), math.sin(math.radians(a1)))
            d2 = (math.cos(math.radians(a2)), math.sin(math.radians(a2)))
            det = d1[0] * (-d2[1]) - d1[1] * (-d2[0])
            t = ((p2[0] - p1[0]) * (-d2[1]) - (p2[1] - p1[1]) * (-d2[0])) / det
            sx, sy = p1[0] + t * d1[0], p1[1] + t * d1[1]
            if kind == "senkrecht":
                right_mark(c, (sx, sy), (sx + d1[0], sy + d1[1]), (sx + d2[0], sy + d2[1]), color=col)
            else:
                ang = (a2 - a1) % 180
                r = 4 * mm
                c.setStrokeColor(col); c.setLineWidth(0.9)
                c.arc(sx - r, sy - r, sx + r, sy + r, a1, ang)
                text(c, sx + 5 * mm, sy - 1 * mm, f"{ang}°", 7.5, "Sans", col)
        for k, s in enumerate(explain[kind]):
            ctext(c, cx, y - 42 * mm - k * 4.2 * mm, s, 9, "Sans-Bold" if k else "Sans", col if k else INK)
    return y - 60 * mm


def teil_b(c, y):
    text(c, L, y, "b) Parallele durch P und Senkrechte durch Q zeichnen", 13, "Sans-Bold")
    y -= 6 * mm
    # Zeichnung (gleiche Lage wie im Probetest)
    gx, gy, gdeg = L + 60 * mm, y - 26 * mm, 12
    a = math.radians(gdeg)
    line_through(c, gx, gy, gdeg, 45 * mm, INK, 1)
    text(c, gx + 44 * mm * math.cos(a) + 1 * mm, gy + 44 * mm * math.sin(a) - 3 * mm, "g", 10, "Sans-Bold")
    px, py = gx - 25 * mm, gy + 14 * mm
    qx, qy = gx + 22 * mm * math.cos(a), gy + 22 * mm * math.sin(a)
    # Parallele durch P
    line_through(c, px + 20 * mm * math.cos(a), py + 20 * mm * math.sin(a), gdeg, 45 * mm, PAR, 1.4)
    # Abstand an zwei Stellen gleich
    dist = (py - gy) * math.cos(a) - (px - gx) * math.sin(a)
    for t in (-30 * mm, 30 * mm):
        fx, fy = pt(gx, gy, gdeg, t)
        gap_marker(c, (fx, fy), gdeg, dist, MUTED)
    # Senkrechte durch Q
    line_through(c, qx, qy, gdeg + 90, 24 * mm, SEN, 1.4)
    right_mark(c, (qx, qy), (qx + math.cos(a), qy + math.sin(a)),
               (qx + math.cos(a + math.pi / 2), qy + math.sin(a + math.pi / 2)), color=SEN)
    for (x, yv, lbl) in ((px, py, "P"), (qx, qy, "Q")):
        c.setFillColor(INK); c.circle(x, yv, 0.9 * mm, stroke=0, fill=1)
        text(c, x - 4.5 * mm, yv + 1.8 * mm, lbl, 10.5, "Sans-Bold")
    # Legende
    lx = L + 122 * mm
    text(c, lx, y - 6 * mm, "Lösung:", 10, "Sans-Bold")
    c.setStrokeColor(PAR); c.setLineWidth(1.4); c.line(lx, y - 12 * mm, lx + 8 * mm, y - 12 * mm)
    text(c, lx + 10 * mm, y - 13 * mm, "Parallele durch P", 9.5, "Sans", PAR)
    c.setStrokeColor(SEN); c.line(lx, y - 19 * mm, lx + 8 * mm, y - 19 * mm)
    text(c, lx + 10 * mm, y - 20 * mm, "Senkrechte durch Q", 9.5, "Sans", SEN)
    c.setStrokeColor(MUTED); c.setLineWidth(0.8); c.setDash(1.5, 1.5)
    c.line(lx, y - 26 * mm, lx + 8 * mm, y - 26 * mm); c.setDash()
    text(c, lx + 10 * mm, y - 27 * mm, "gleicher Abstand", 9.5, "Sans", MUTED)
    y -= 58 * mm

    steps = [
        ("So zeichnest du die Parallele durch P", PAR, [
            "1. Lege das Geodreieck so hin, dass eine Hilfslinie (eine der dünnen Linien, die parallel",
            "    zur langen Kante sind) genau auf der Geraden g liegt.",
            "2. Schiebe das Geodreieck vorsichtig, ohne es zu drehen, bis die lange Kante durch P geht.",
            "3. Zeichne entlang der langen Kante eine Linie durch P. Fertig!",
            "Kontrolle: Der Abstand zu g ist links und rechts gleich gross."]),
        ("So zeichnest du die Senkrechte durch Q", SEN, [
            "1. Lege die Mittellinie des Geodreiecks (von der 0 zur Spitze) genau auf die Gerade g.",
            "2. Schiebe das Geodreieck entlang von g, bis die lange Kante genau durch Q geht.",
            "3. Zeichne entlang der langen Kante eine Linie durch Q.",
            "4. Zeichne beim Kreuzungspunkt das Zeichen für den rechten Winkel ein (Bogen mit Punkt)."]),
    ]
    for title, col, lines in steps:
        text(c, L, y, title, 11, "Sans-Bold", col)
        y -= 5.5 * mm
        for s in lines:
            text(c, L + 2 * mm, y, s, 9.5, "Sans", MUTED if s.startswith("Kontrolle") else INK)
            y -= 4.8 * mm
        y -= 4 * mm
    return y


def teil_c(c, y):
    text(c, L, y, "c) Strecken messen", 13, "Sans-Bold")
    y = wrapped(c, L, y - 6 * mm, "Lege die 0 des Geodreiecks genau an den Anfang der Strecke. Die Kante liegt genau auf der "
                "Strecke. Lies die Zahl am Ende der Strecke ab. Ein grosser Strich = 1 cm, ein kleiner Strich = 1 mm.",
                W, 9.5) - 6 * mm
    for i, cm in enumerate(SEGMENTS_CM):
        sx, yy = L + 8 * mm, y - i * 24 * mm
        c.setStrokeColor(INK); c.setLineWidth(1.2)
        c.line(sx, yy, sx + cm * 10 * mm, yy)
        for xe in (sx, sx + cm * 10 * mm):
            c.line(xe, yy - 1.5 * mm, xe, yy + 1.5 * mm)
        # Lineal darunter
        ry = yy - 3 * mm
        c.setFillColor(HexColor("#eef3fb")); c.setStrokeColor(FIG); c.setLineWidth(0.6)
        c.rect(sx - 3 * mm, ry - 9 * mm, 80 * mm, 9 * mm, stroke=1, fill=1)
        for m in range(0, 76):
            h = 3.5 * mm if m % 10 == 0 else 2.2 * mm if m % 5 == 0 else 1.3 * mm
            c.line(sx + m * mm, ry, sx + m * mm, ry - h)
            if m % 10 == 0:
                ctext(c, sx + m * mm, ry - 7.3 * mm, str(m // 10), 7, "Sans", FIG)
        # Ablesepfeil
        ex = sx + cm * 10 * mm
        c.setStrokeColor(PAR); c.setLineWidth(1)
        c.line(ex, yy + 3 * mm, ex, ry - 9.5 * mm)
        label = f"{cm:g}".replace(".", ",") + " cm"
        text(c, sx + 82 * mm, yy - 5 * mm, label, 14, "Sans-Bold", PAR)
        if cm % 1:
            text(c, sx + 82 * mm, yy - 10 * mm, f"{int(cm)} cm und 5 mm", 8.5, "Sans", MUTED)
    return y - 2 * 24 * mm


def main():
    out = OUT_DIR / "aufgabe7-erklaerung.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Aufgabe 7 erklärt: Parallel und senkrecht")
    c.setViewerPreference("PrintScaling", "None")
    header(c, "Aufgabe 7 erklärt: Parallel und senkrecht", "Probetest Raum und Bewegung & Linien · Lösung mit Zeichnungen · Seite 1",
           name_fields=False)
    y = merkbox(c, PAGE_H - 37 * mm)
    y = teil_a(c, y)
    teil_c(c, y - 4 * mm)
    c.showPage()
    header(c, "Aufgabe 7 erklärt: Parallel und senkrecht", "Seite 2", name_fields=False)
    teil_b(c, PAGE_H - 40 * mm)
    c.showPage()
    c.save()
    print(out)


if __name__ == "__main__":
    main()
