"""Erzeugt stundenrapport-nachhilfe.pdf: A4 quer, 2 Seiten mit je 3 Lektionen.

Aufruf:  python3 stundenrapport_pdf.py
"""
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

OUT = Path(__file__).with_name("stundenrapport-nachhilfe.pdf")
PAGES = 2
ROWS_PER_PAGE = 3

PAGE_W, PAGE_H = landscape(A4)
LEFT = 12 * mm
RIGHT = PAGE_W - 12 * mm

INK = HexColor("#1f2329")
MUTED = HexColor("#4a4f57")
GRID = HexColor("#5c6470")
LINE = HexColor("#6b717a")
HEAD_FILL = HexColor("#dfe5ee")
NR_FILL = HexColor("#eef1f5")

# Spaltenbreiten wie im Original, auf die Tabellenbreite skaliert.
COLS = [("Nr.", "", 7.6), ("Datum", "", 24.9), ("Zeit", "", 29.7), ("Dauer", "", 18.5),
        ("Behandelte Themen und Bemerkungen", "", 96.0),
        ("Hausaufgaben", "nächste Schritte", 40.5),
        ("Mitarbeit", "Zutreffendes\nankreuzen", 26.9),
        ("Bestätigung", "Unterschrift Elternteil", 28.9)]
_scale = (RIGHT - LEFT) / (sum(c[2] for c in COLS) * mm)
COL_W = [c[2] * mm * _scale for c in COLS]
COL_X = [LEFT + sum(COL_W[:i]) for i in range(len(COLS) + 1)]

HEAD_H = 11 * mm
ROW_H = 43 * mm


def field(c, label, x, y, x_end):
    c.setFillColor(INK)
    c.setFont("Helvetica", 9.5)
    c.drawString(x, y, label)
    lx = x + c.stringWidth(label, "Helvetica", 9.5) + 2 * mm
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(lx, y - 0.5 * mm, x_end, y - 0.5 * mm)


def page_header(c):
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(LEFT + 2 * mm, PAGE_H - 20 * mm, "Stundenrapport Nachhilfeunterricht")
    mid = LEFT + (RIGHT - LEFT) * 0.515
    field(c, "Lehrperson:", LEFT + 2 * mm, PAGE_H - 29 * mm, mid - 18 * mm)
    field(c, "Auftraggeber/in:", LEFT + 2 * mm, PAGE_H - 37 * mm, mid - 18 * mm)
    field(c, "Schüler/in:", mid, PAGE_H - 29 * mm, RIGHT - 2 * mm)
    field(c, "Zeitraum (Monat/Jahr):", mid, PAGE_H - 37 * mm, RIGHT - 2 * mm)


def table_head(c, top):
    c.setFillColor(HEAD_FILL)
    c.rect(LEFT, top - HEAD_H, RIGHT - LEFT, HEAD_H, stroke=0, fill=1)
    for i, (title, sub, _) in enumerate(COLS):
        cx = (COL_X[i] + COL_X[i + 1]) / 2
        c.setFillColor(INK)
        if not sub:
            c.setFont("Helvetica-Bold", 9)
            if i == 0:
                c.drawString(COL_X[i] + 1.5 * mm, top - HEAD_H / 2 - 1.2 * mm, title)
            else:
                c.drawCentredString(cx, top - HEAD_H / 2 - 1.2 * mm, title)
        else:
            lines = sub.split("\n")
            y = top - 3.8 * mm if len(lines) == 1 else top - 3.2 * mm
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(cx, y, title)
            c.setFont("Helvetica", 6.5)
            c.setFillColor(MUTED)
            for k, ln in enumerate(lines):
                c.drawCentredString(cx, y - 3.2 * mm - k * 2.7 * mm, ln)


def write_lines(c, x0, x1, top, n, gap, first):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    for k in range(n):
        y = top - first - k * gap
        c.line(x0, y, x1, y)


def row(c, nr, top):
    bottom = top - ROW_H
    c.setFillColor(NR_FILL)
    c.rect(COL_X[0], bottom, COL_W[0], ROW_H, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(COL_X[0] + 2 * mm, top - 9 * mm, str(nr))

    # Datum
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(COL_X[1] + 2.5 * mm, top - 9 * mm, COL_X[2] - 2.5 * mm, top - 9 * mm)

    # Zeit
    c.setFont("Helvetica", 9)
    c.drawString(COL_X[2] + 2.5 * mm, top - 8.5 * mm, "von")
    c.drawString(COL_X[2] + 2.5 * mm, top - 16.5 * mm, "bis")
    c.line(COL_X[2] + 10 * mm, top - 9 * mm, COL_X[3] - 2.5 * mm, top - 9 * mm)
    c.line(COL_X[2] + 9 * mm, top - 17 * mm, COL_X[3] - 2.5 * mm, top - 17 * mm)

    # Dauer
    cx = (COL_X[3] + COL_X[4]) / 2
    c.line(COL_X[3] + 4 * mm, top - 9 * mm, COL_X[4] - 4 * mm, top - 9 * mm)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawCentredString(cx, top - 15 * mm, "Stunden")

    # Themen und Hausaufgaben: 5 Schreiblinien
    write_lines(c, COL_X[4] + 3 * mm, COL_X[5] - 3 * mm, top, 5, 7.6 * mm, 8 * mm)
    write_lines(c, COL_X[5] + 3 * mm, COL_X[6] - 3 * mm, top, 5, 7.6 * mm, 8 * mm)

    # Mitarbeit
    c.setFillColor(INK)
    c.setFont("Helvetica", 9)
    c.setStrokeColor(INK)
    c.setLineWidth(0.6)
    for k, label in enumerate(("sehr gut", "gut", "mittel", "schwierig")):
        y = top - 7.5 * mm - k * 8 * mm
        c.circle(COL_X[6] + 4 * mm, y + 1.1 * mm, 1.1 * mm, stroke=1, fill=0)
        c.drawString(COL_X[6] + 7 * mm, y, label)

    # Bestätigung
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(COL_X[7] + 3 * mm, bottom + 11 * mm, COL_X[8] - 3 * mm, bottom + 11 * mm)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawCentredString((COL_X[7] + COL_X[8]) / 2, bottom + 6.5 * mm, "Elternteil")


def grid(c, top, rows):
    bottom = top - HEAD_H - rows * ROW_H
    c.setStrokeColor(GRID)
    c.setLineWidth(0.8)
    c.rect(LEFT, bottom, RIGHT - LEFT, top - bottom, stroke=1, fill=0)
    c.setLineWidth(0.5)
    for x in COL_X[1:-1]:
        c.line(x, bottom, x, top)
    for k in range(rows + 1):
        y = top - HEAD_H - k * ROW_H
        c.line(LEFT, y, RIGHT, y)


def main():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Stundenrapport Nachhilfeunterricht")
    nr = 1
    for page in range(1, PAGES + 1):
        page_header(c)
        top = PAGE_H - 44 * mm
        table_head(c, top)
        for k in range(ROWS_PER_PAGE):
            row(c, nr, top - HEAD_H - k * ROW_H)
            nr += 1
        grid(c, top, ROWS_PER_PAGE)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9)
        c.drawRightString(RIGHT, 8 * mm, f"Seite {page}")
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    main()
