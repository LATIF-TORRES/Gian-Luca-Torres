"""Erzeugt Stundenrapporte für den Nachhilfeunterricht (A4 quer).

Aufruf:  python3 stundenrapport_pdf.py
Ausgabe:
- stundenrapport-nachhilfe.pdf         2 Seiten mit je 3 Lektionen, leere Vorlage
- stundenrapport-nachhilfe-10.pdf      3 Seiten mit 4 + 3 + 3 = 10 Lektionen, Kopf ausgefüllt,
                                       Dauer in Minuten, Abschluss mit Total, Ort/Datum und Unterschrift
"""
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

OUT_DIR = Path(__file__).parent

PAGE_W, PAGE_H = landscape(A4)
LEFT = 12 * mm
RIGHT = PAGE_W - 12 * mm

INK = HexColor("#1f2329")
MUTED = HexColor("#4a4f57")
GRID = HexColor("#5c6470")
LINE = HexColor("#6b717a")
HEAD_FILL = HexColor("#dfe5ee")
NR_FILL = HexColor("#eef1f5")
FILLED = HexColor("#1b3d8f")  # vorausgefüllte Angaben im Kopf

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

VARIANTS = [
    dict(out="stundenrapport-nachhilfe.pdf", rows=[3, 3], header_every_page=True, values={},
         dauer="Stunden", footer=False, page_label="Seite {p}"),
    dict(out="stundenrapport-nachhilfe-10.pdf", rows=[4, 3, 3], header_every_page=False,
         values={"Lehrperson:": "Gian-Luca Torres", "Auftraggeber/in:": "Fokus Nachhilfe",
                 "Schüler/in:": "Kevin", "Zeitraum (Monat/Jahr):": "01.10.2026 – 31.10.2026"},
         dauer="Minuten", footer=True, page_label="Seite {p} von {n}"),
]


def field(c, label, x, y, x_end, value=""):
    c.setFillColor(INK)
    c.setFont("Helvetica", 9.5)
    c.drawString(x, y, label)
    lx = x + c.stringWidth(label, "Helvetica", 9.5) + 2 * mm
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(lx, y - 0.5 * mm, x_end, y - 0.5 * mm)
    if value:
        c.setFillColor(FILLED)
        c.setFont("Helvetica-Bold", 10.5)
        c.drawString(lx + 1.5 * mm, y + 0.3 * mm, value)


def page_header(c, values):
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(LEFT + 2 * mm, PAGE_H - 20 * mm, "Stundenrapport Nachhilfeunterricht")
    mid = LEFT + (RIGHT - LEFT) * 0.515
    for label, x, y, x_end in (("Lehrperson:", LEFT + 2 * mm, 29, mid - 18 * mm),
                               ("Auftraggeber/in:", LEFT + 2 * mm, 37, mid - 18 * mm),
                               ("Schüler/in:", mid, 29, RIGHT - 2 * mm),
                               ("Zeitraum (Monat/Jahr):", mid, 37, RIGHT - 2 * mm)):
        field(c, label, x, PAGE_H - y * mm, x_end, values.get(label, ""))


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


def write_lines(c, x0, x1, top, h):
    """Schreiblinien: 5 Linien bei hohen Zeilen, 4 bei niedrigen; die letzte mindestens 4 mm über dem Rand."""
    n = 5 if h >= 40 * mm else 4
    first = 8 * mm
    gap = min(7.6 * mm, (h - first - 4 * mm) / (n - 1))
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    for k in range(n):
        y = top - first - k * gap
        c.line(x0, y, x1, y)


def row(c, nr, top, h, dauer):
    bottom = top - h
    c.setFillColor(NR_FILL)
    c.rect(COL_X[0], bottom, COL_W[0], h, stroke=0, fill=1)
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
    c.drawCentredString(cx, top - 13 * mm, dauer)

    # Themen und Hausaufgaben
    write_lines(c, COL_X[4] + 3 * mm, COL_X[5] - 3 * mm, top, h)
    write_lines(c, COL_X[5] + 3 * mm, COL_X[6] - 3 * mm, top, h)

    # Mitarbeit
    step = min(8 * mm, (h - 12 * mm) / 3)
    c.setFillColor(INK)
    c.setFont("Helvetica", 9)
    c.setStrokeColor(INK)
    c.setLineWidth(0.6)
    for k, label in enumerate(("sehr gut", "gut", "mittel", "schwierig")):
        y = top - 7.5 * mm - k * step
        c.circle(COL_X[6] + 4 * mm, y + 1.1 * mm, 1.1 * mm, stroke=1, fill=0)
        c.drawString(COL_X[6] + 7 * mm, y, label)

    # Bestätigung
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(COL_X[7] + 3 * mm, bottom + 10 * mm, COL_X[8] - 3 * mm, bottom + 10 * mm)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawCentredString((COL_X[7] + COL_X[8]) / 2, bottom + 5.5 * mm, "Elternteil")


def grid(c, top, h, rows):
    bottom = top - HEAD_H - rows * h
    c.setStrokeColor(GRID)
    c.setLineWidth(0.8)
    c.rect(LEFT, bottom, RIGHT - LEFT, top - bottom, stroke=1, fill=0)
    c.setLineWidth(0.5)
    for x in COL_X[1:-1]:
        c.line(x, bottom, x, top)
    for k in range(rows + 1):
        y = top - HEAD_H - k * h
        c.line(LEFT, y, RIGHT, y)
    return bottom


def footer(c, y):
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(LEFT + 2 * mm, y, "Total Stunden im Zeitraum:")
    x = LEFT + 2 * mm + c.stringWidth("Total Stunden im Zeitraum:", "Helvetica-Bold", 10.5) + 2 * mm
    c.setStrokeColor(LINE); c.setLineWidth(0.6)
    c.line(x, y - 0.5 * mm, x + 30 * mm, y - 0.5 * mm)
    c.drawString(x + 32 * mm, y, "Std.")
    y2 = y - 15 * mm
    c.setFont("Helvetica", 10)
    c.drawString(LEFT + 2 * mm, y2, "Ort, Datum:")
    c.line(LEFT + 24 * mm, y2 - 0.5 * mm, LEFT + 105 * mm, y2 - 0.5 * mm)
    mid = LEFT + (RIGHT - LEFT) * 0.515
    c.drawString(mid, y2, "Unterschrift Lehrperson:")
    c.line(mid + c.stringWidth("Unterschrift Lehrperson:", "Helvetica", 10) + 2 * mm, y2 - 0.5 * mm,
           RIGHT - 2 * mm, y2 - 0.5 * mm)


def build(v):
    out = OUT_DIR / v["out"]
    c = canvas.Canvas(str(out), pagesize=landscape(A4))
    c.setTitle("Stundenrapport Nachhilfeunterricht")
    n_pages = len(v["rows"])
    nr = 1
    for p, rows in enumerate(v["rows"], start=1):
        with_header = v["header_every_page"] or p == 1
        if with_header:
            page_header(c, v["values"])
            top = PAGE_H - 44 * mm
        else:
            top = PAGE_H - 14 * mm
        last = p == n_pages
        bottom_limit = (48 if (last and v["footer"]) else 15) * mm
        h = min(43 * mm, (top - HEAD_H - bottom_limit) / rows)
        table_head(c, top)
        for k in range(rows):
            row(c, nr, top - HEAD_H - k * h, h, v["dauer"])
            nr += 1
        bottom = grid(c, top, h, rows)
        assert bottom >= bottom_limit - 0.01, (p, bottom / mm)
        if last and v["footer"]:
            footer(c, bottom - 14 * mm)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9)
        c.drawRightString(RIGHT, 8 * mm, v["page_label"].format(p=p, n=n_pages))
        c.showPage()
    c.save()
    print(out, "Lektionen:", nr - 1)


if __name__ == "__main__":
    for v in VARIANTS:
        build(v)
