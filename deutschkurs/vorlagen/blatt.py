"""Gemeinsame Bausteine für Übungsblätter, Lernkontrollen und Lösungsblätter (A4 hoch).

Wird von den Skripten in deutschkurs/ und franzoesisch/ verwendet:
    sys.path.insert(0, ".../deutschkurs/vorlagen");  from blatt import *

Aufgabenkopf mit Nummer, Titel, Anweisung (Teile mit zwei Leerzeichen trennen = neue Zeile),
Stufen-Abzeichen (★ leicht, ★★ mittel, ♛ Königsdisziplin) oder Punktefeld für Lernkontrollen.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "mathe" / "raum-und-linien"))

from reportlab.lib.colors import HexColor, white  # noqa: E402
from reportlab.lib.pagesizes import A4  # noqa: E402
from reportlab.lib.units import mm  # noqa: E402
from reportlab.pdfbase import pdfmetrics  # noqa: E402
from reportlab.pdfgen import canvas  # noqa: E402

import zeichnen  # noqa: E402,F401  (registriert die Schriften)
from zeichnen import FIG, INK, L, LINE, MUTED, PAGE_H, PAGE_W, R, SOFT, W, ctext, header, hline, text  # noqa: E402,F401

SOL = HexColor("#d0342c")          # Lösungen: rot
NB = " "                      # geschütztes Leerzeichen
BOTTOM = 16 * mm                   # unterster Rand für Inhalt

LEVELS = {1: ("★  Stufe 1 · leicht", HexColor("#2e8b57")),
          2: ("★★  Stufe 2 · mittel", HexColor("#2b6cb0")),
          3: ("♛  Königsdisziplin", HexColor("#b7791f"))}


def split_lines(s, width, size=9.5, font="Sans"):
    """Zeilen umbrechen, nur bei normalen Leerzeichen."""
    out, line = [], ""
    for w_ in s.split(" "):
        test = (line + " " + w_).strip()
        if pdfmetrics.stringWidth(test, font, size) <= width or not line:
            line = test
        else:
            out.append(line)
            line = w_
    if line:
        out.append(line)
    return out


def wrap(c, x, y, s, width, size=9.5, font="Sans", leading=None, color=INK):
    leading = leading or size * 1.38
    for ln in split_lines(s, width, size, font):
        text(c, x, y, ln, size, font, color)
        y -= leading
    return y


def level_badge(c, y, level):
    label, col = LEVELS[level]
    w = pdfmetrics.stringWidth(label, "Sans-Bold", 9) + 6 * mm
    c.setFillColor(col if level == 3 else white)
    c.setStrokeColor(col)
    c.setLineWidth(1)
    c.roundRect(R - w, y - 1.8 * mm, w, 6 * mm, 3 * mm, stroke=1, fill=1)
    text(c, R - w + 3 * mm, y - 0.1 * mm, label, 9, "Sans-Bold", white if level == 3 else col)
    return w


def task_head(c, y, nr, title, instruction, goal=None, level=None, points=None):
    """Kopf einer Aufgabe. Gibt die y-Position für den Inhalt zurück."""
    right = 0
    if level:
        right = level_badge(c, y, level) + 3 * mm
    if points:
        text(c, R - 18 * mm, y, f"___ / {points} P.", 9.5, "Sans", MUTED)
        right = 22 * mm
    c.setFillColor(INK)
    c.circle(L + 3.4 * mm, y + 1.3 * mm, 3.4 * mm, stroke=0, fill=1)
    ctext(c, L + 3.4 * mm, y - 0.2 * mm, str(nr), 10, "Sans-Bold", white)
    assert pdfmetrics.stringWidth(title, "Sans-Bold", 12) < W - 9 * mm - right, title
    text(c, L + 9 * mm, y, title, 12, "Sans-Bold")
    y -= 5.5 * mm
    for part in instruction.split("  "):
        y = wrap(c, L + 9 * mm, y, part.strip(), W - 9 * mm, 9.5) - 0.8 * mm
    if goal:
        text(c, L + 9 * mm, y, goal, 7, "Sans", MUTED)
        y -= 2.5 * mm
    return y - 4.5 * mm


def answer(c, x, y, width, sol, value, size=10):
    hline(c, x, x + width, y - 0.8 * mm)
    if sol and value:
        text(c, x + 1 * mm, y + 0.3 * mm, value, size, "Sans-Bold", SOL)


def write_lines(c, x, y, width, n, gap=9 * mm, sol_lines=None, size=10):
    """n Schreiblinien; im Lösungsblatt stehen sol_lines (rot) darauf. Gibt y unter der letzten Linie zurück."""
    sol_lines = sol_lines or []
    for k in range(n):
        yy = y - k * gap
        hline(c, x, x + width, yy - 0.8 * mm)
        if k < len(sol_lines):
            text(c, x + 1 * mm, yy + 0.3 * mm, sol_lines[k], size, "Sans-Bold", SOL)
    assert len(sol_lines) <= n, (len(sol_lines), n)
    return y - n * gap


def merkkasten(c, y, title, lines, size=9.5):
    """Grauer Kasten; die Höhe ergibt sich aus dem Text."""
    rows = [split_lines(ln, W - 8 * mm, size) for ln in lines]
    lead = size * 1.38
    h = 12 * mm + sum(len(r) for r in rows) * lead + len(rows) * 0.5 * mm
    c.setFillColor(SOFT)
    c.setStrokeColor(HexColor("#9aa5ba"))
    c.setLineWidth(0.8)
    c.roundRect(L, y - h, W, h, 3 * mm, stroke=1, fill=1)
    text(c, L + 4 * mm, y - 6.5 * mm, title, 11.5, "Sans-Bold")
    yy = y - 12 * mm
    for r in rows:
        for ln in r:
            bold = ln.startswith("**")
            text(c, L + 4 * mm, yy, ln.lstrip("*"), size, "Sans-Bold" if bold else "Sans")
            yy -= lead
        yy -= 0.5 * mm
    return y - h - 7 * mm


def word_bank(c, x, y, words, width, size=10):
    """Wörter in Kästchen, mit Umbruch. Gibt y unter dem letzten Kästchen zurück."""
    xx, row_h, gap = x, 7.5 * mm, 2.5 * mm
    for w_ in words:
        bw = pdfmetrics.stringWidth(w_, "Sans", size) + 5 * mm
        if xx + bw > x + width:
            xx = x
            y -= row_h + 1.5 * mm
        c.setFillColor(white)
        c.setStrokeColor(FIG)
        c.setLineWidth(0.7)
        c.roundRect(xx, y - 2.5 * mm, bw, row_h, 1.6 * mm, stroke=1, fill=1)
        text(c, xx + 2.5 * mm, y, w_, size)
        xx += bw + gap
    return y - 2.5 * mm


def checkbox(c, x, y, s=3.6 * mm):
    c.setStrokeColor(INK)
    c.setLineWidth(0.7)
    c.rect(x, y - 0.6 * mm, s, s, stroke=1, fill=0)


def footer_note(c, sol, page, y_min=None):
    if y_min is not None:
        assert y_min > BOTTOM, f"Seite {page}: Inhalt zu tief ({y_min / mm:.1f} mm)"
    text(c, R - 18 * mm, 8 * mm, f"Seite {page}", 8, "Sans", MUTED)
    if sol:
        text(c, L, 8 * mm, "Lösungen: rot", 8, "Sans-Bold", SOL)


def build_pdf(out, title, pages, sol):
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle(title + (" – Lösungen" if sol else ""))
    for p in pages:
        p(c, sol)
    c.save()
    print(out)
