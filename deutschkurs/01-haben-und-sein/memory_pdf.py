"""Erzeugt zwei A4-PDFs zum Ausschneiden: memory-haben.pdf und memory-sein.pdf.

Aufruf:  python3 memory_pdf.py
"""
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("Sans", f"{FONT_DIR}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Sans-Bold", f"{FONT_DIR}/DejaVuSans-Bold.ttf"))

OUT_DIR = Path(__file__).parent

PERSONS = ["ich", "du", "er / sie / es", "wir", "ihr", "sie / Sie"]
FORMS = {
    "haben": {"Präsens": ["habe", "hast", "hat", "haben", "habt", "haben"],
              "Präteritum": ["hatte", "hattest", "hatte", "hatten", "hattet", "hatten"]},
    "sein": {"Präsens": ["bin", "bist", "ist", "sind", "seid", "sind"],
             "Präteritum": ["war", "warst", "war", "waren", "wart", "waren"]},
}
COLOR = {"haben": HexColor("#2b4fd8"), "sein": HexColor("#0f8a6a")}
SOFT = {"haben": HexColor("#e4eaff"), "sein": HexColor("#dcf3ec")}
# Rückseiten in der Farbe des Verbs, damit sich die beiden Kartensätze nicht vermischen.
BACK = {"haben": (HexColor("#283a8f"), HexColor("#3449ad")),
        "sein": (HexColor("#0b5e48"), HexColor("#137a5e"))}
EXAMPLE = {"haben": ("wir · haben · Präteritum", "hatten", "ich hatte", "hatte"),
           "sein": ("wir · sein · Präteritum", "waren", "ich war", "war")}
INK = HexColor("#1d2433")
MUTED = HexColor("#5a6478")
CUT = HexColor("#9aa5ba")

PAGE_W, PAGE_H = A4
COLS, ROWS = 4, 6
CARD_W, CARD_H = 45 * mm, 42 * mm
GRID_X = (PAGE_W - COLS * CARD_W) / 2
GRID_TOP = PAGE_H - 30 * mm


def card_origin(i):
    col, row = i % COLS, i // COLS
    return GRID_X + col * CARD_W, GRID_TOP - (row + 1) * CARD_H


def header(c, title, sub):
    c.setFillColor(INK)
    c.setFont("Sans-Bold", 18)
    c.drawString(GRID_X, PAGE_H - 17 * mm, title)
    c.setFillColor(MUTED)
    c.setFont("Sans", 9.5)
    c.drawString(GRID_X, PAGE_H - 23.5 * mm, sub)


def cut_grid(c):
    c.setStrokeColor(CUT)
    c.setLineWidth(0.6)
    c.setDash(3, 2.5)
    for k in range(COLS + 1):
        x = GRID_X + k * CARD_W
        c.line(x, GRID_TOP, x, GRID_TOP - ROWS * CARD_H)
    for k in range(ROWS + 1):
        y = GRID_TOP - k * CARD_H
        c.line(GRID_X, y, GRID_X + COLS * CARD_W, y)
    c.setDash()
    c.setFillColor(CUT)
    c.setFont("Sans", 11)
    c.drawString(GRID_X - 5 * mm, GRID_TOP + 1.2 * mm, "✂")


def fit_size(text, font, size, max_w):
    while pdfmetrics.stringWidth(text, font, size) > max_w and size > 8:
        size -= 0.5
    return size


def inner_frame(c, x, y, verb, dashed):
    pad = 2.5 * mm
    c.setStrokeColor(COLOR[verb])
    c.setLineWidth(1.4)
    if dashed:
        c.setDash(4, 2)
    c.roundRect(x + pad, y + pad, CARD_W - 2 * pad, CARD_H - 2 * pad, 3 * mm, stroke=1, fill=0)
    c.setDash()


def prompt_card(c, i, verb, tense, person):
    x, y = card_origin(i)
    inner_frame(c, x, y, verb, dashed=False)
    cx = x + CARD_W / 2
    # Etikett: Verb · Zeitform
    label = f"{verb} · {tense}"
    c.setFont("Sans-Bold", 7.5)
    lw = pdfmetrics.stringWidth(label, "Sans-Bold", 7.5) + 5 * mm
    c.setFillColor(SOFT[verb])
    c.roundRect(cx - lw / 2, y + CARD_H - 12 * mm, lw, 5.2 * mm, 2.6 * mm, stroke=0, fill=1)
    c.setFillColor(COLOR[verb])
    c.drawCentredString(cx, y + CARD_H - 10.2 * mm, label)
    # Person
    size = fit_size(person, "Sans-Bold", 17, CARD_W - 9 * mm)
    c.setFillColor(INK)
    c.setFont("Sans-Bold", size)
    c.drawCentredString(cx, y + CARD_H / 2 - 3 * mm, person)
    c.setFillColor(MUTED)
    c.setFont("Sans", 10)
    c.drawCentredString(cx, y + 7.5 * mm, "_ _ _ _")


def answer_card(c, i, verb, form):
    x, y = card_origin(i)
    inner_frame(c, x, y, verb, dashed=True)
    cx = x + CARD_W / 2
    c.setFillColor(INK)
    c.setFont("Sans-Bold", fit_size(form, "Sans-Bold", 22, CARD_W - 9 * mm))
    c.drawCentredString(cx, y + CARD_H / 2 - 1 * mm, form)
    c.setFillColor(MUTED)
    c.setFont("Sans", 6.5)
    c.drawCentredString(cx, y + 6.5 * mm, "VERBFORM")


def verb_page(c, verb):
    header(c, f"Memory: {verb}",
           f"Präsens und Präteritum · 12 Paare · entlang der gestrichelten Linien ausschneiden")
    i = 0
    for tense in ("Präsens", "Präteritum"):
        for p, form in zip(PERSONS, FORMS[verb][tense]):
            prompt_card(c, i, verb, tense, p)
            i += 1
    for tense in ("Präteritum", "Präsens"):
        for form in reversed(FORMS[verb][tense]):
            answer_card(c, i, verb, form)
            i += 1
    cut_grid(c)
    c.showPage()


def backs_page(c, verb):
    """Rückseite für das vorherige Blatt.

    Keine Überschrift und keine Schnittlinien: Die blaue Fläche geht über das ganze
    Kartenraster hinaus, damit ein leichter Versatz beim Duplexdruck nicht auffällt.
    Das Raster ist waagerecht zentriert, deshalb liegt es beim Wenden über die
    lange Kante genau hinter den Vorderseiten.
    """
    bleed = 3 * mm
    dark, light = BACK[verb]
    c.setFillColor(dark)
    c.rect(GRID_X - bleed, GRID_TOP - ROWS * CARD_H - bleed,
           COLS * CARD_W + 2 * bleed, ROWS * CARD_H + 2 * bleed, stroke=0, fill=1)
    for i in range(COLS * ROWS):
        x, y = card_origin(i)
        c.setFillColor(light)
        c.circle(x + CARD_W / 2, y + CARD_H / 2, 10 * mm, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont("Sans-Bold", 22)
        c.drawCentredString(x + CARD_W / 2, y + CARD_H / 2 - 7.5, "?")
        c.setFont("Sans-Bold", 6.5)
        c.drawCentredString(x + CARD_W / 2, y + 5.5 * mm, verb.upper())
    c.showPage()


def rules_page(c, verb):
    ex_prompt, ex_form, ex_same, ex_same_form = EXAMPLE[verb]
    header(c, f"Spielregeln und Lösung: {verb}", "Für die Lehrkraft oder zum Nachschauen nach dem Spiel")
    x0 = GRID_X
    y = PAGE_H - 38 * mm
    c.setFillColor(INK)
    c.setFont("Sans-Bold", 12)
    c.drawString(x0, y, "So wird gespielt")
    rules = [
        "1. Karten ausschneiden, mischen und verdeckt auf den Tisch legen.",
        "2. Wer dran ist, deckt zwei Karten auf.",
        f"3. Passen Personen-Karte und Verbform zusammen (z. B. „{ex_prompt}“ + „{ex_form}“),",
        "    darf man das Paar behalten und ist nochmal dran.",
        "4. Passen sie nicht, werden beide Karten wieder umgedreht. Dann ist die nächste Person dran.",
        "5. Wer am Ende die meisten Paare hat, gewinnt.",
        "",
        "Drucken: beidseitig, Wenden an der langen Kante, Größe 100 % (nicht „an Seite anpassen“).",
        "Seite 1 = Karten, Seite 2 = Rückseiten, Seite 3 = diese Anleitung.",
        "",
        f"Tipp: Gleiche Formen zählen als richtig. „{ex_same}“ passt auch auf die „{ex_same_form}“-Karte",
        "von „er / sie / es“. Für Fortgeschrittene: Kartensätze von haben und sein zusammen mischen.",
    ]
    c.setFont("Sans", 10)
    for line in rules:
        y -= 6 * mm
        c.drawString(x0, y, line)

    y -= 14 * mm
    col_w = [34 * mm, 26 * mm, 30 * mm]
    if True:
        tx = x0
        ty = y
        c.setFillColor(COLOR[verb])
        c.setFont("Sans-Bold", 14)
        c.drawString(tx, ty, verb)
        ty -= 8 * mm
        c.setFillColor(MUTED)
        c.setFont("Sans-Bold", 8)
        for k, h in enumerate(("PERSON", "PRÄSENS", "PRÄTERITUM")):
            c.drawString(tx + sum(col_w[:k]), ty, h)
        for p, a, b in zip(PERSONS, FORMS[verb]["Präsens"], FORMS[verb]["Präteritum"]):
            ty -= 7 * mm
            c.setStrokeColor(HexColor("#c9d3e1"))
            c.setLineWidth(0.5)
            c.line(tx, ty + 5 * mm, tx + sum(col_w), ty + 5 * mm)
            c.setFillColor(MUTED)
            c.setFont("Sans", 10)
            c.drawString(tx, ty, p)
            c.setFillColor(INK)
            c.setFont("Sans-Bold", 10)
            c.drawString(tx + col_w[0], ty, a)
            c.drawString(tx + col_w[0] + col_w[1], ty, b)
    c.showPage()


def build(verb):
    out = OUT_DIR / f"memory-{verb}.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle(f"Memory: {verb} (zum Ausschneiden)")
    c.setAuthor("Deutschkurs")
    # Druckvoreinstellungen: Duplex über die lange Kante, keine Skalierung.
    # Adobe Acrobat/Reader übernimmt das im Druckdialog; andere Programme ignorieren es teils.
    c.setViewerPreference("Duplex", "DuplexFlipLongEdge")
    c.setViewerPreference("PrintScaling", "None")
    # Reihenfolge für Duplex: Vorderseite, Rückseite, Anleitung.
    verb_page(c, verb)
    backs_page(c, verb)
    rules_page(c, verb)
    c.save()
    print(out)


def main():
    for verb in FORMS:
        build(verb)


if __name__ == "__main__":
    main()
