"""Erzeugt das Übungsblatt zum Hörverständnis (4. Klasse) und das Blatt für die Lehrperson.

Aufruf:  python3 hoerverstaendnis_pdf.py
Ausgabe: hoerverstaendnis-uebungsblatt.pdf (2 Seiten, für die Kinder)
         hoerverstaendnis-lehrperson.pdf (2 Seiten: Vorlesetext und Lösungen)
"""
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

INK = HexColor("#1d2433")
MUTED = HexColor("#5a6478")
LINE = HexColor("#9aa5ba")
SOFT = HexColor("#f1f4f8")
ACCENT = HexColor("#b4561a")
RED = HexColor("#c8281c")

# ---------- Inhalt ----------
GOALS = ["Du kannst einer Beschreibung Informationen entnehmen.",
         "Du schreibst deine Antworten in ganzen Sätzen.",
         "Am Ende eines Satzes schreibst du einen Punkt.",
         "Die Anfangsbuchstaben der Nomen schreibst du gross."]

TITLE = "Vermisst: Hund Bruno"
STORY = [
    "Hallo zusammen! Mein Name ist Lara Meier und ich wohne in Winterthur. Seit Samstagnachmittag "
    "ist mein Hund Bruno verschwunden.",
    "Bruno ist ein Beagle und drei Jahre alt. Sein Fell ist braun, weiss und schwarz. Er hat lange, "
    "weiche Ohren und eine weisse Schwanzspitze. Bruno trägt ein rotes Halsband mit einem kleinen "
    "Glöckchen. Am Halsband hängt auch eine Marke mit seinem Namen.",
    "Wir waren auf dem Spielplatz neben dem Schulhaus Rosenberg. Dort hat Bruno ein Eichhörnchen "
    "gesehen und ist sofort in den Wald gerannt. Seitdem suchen wir ihn überall.",
    "Bruno ist sehr freundlich und hat keine Angst vor Kindern. Am liebsten frisst er Karotten und "
    "Hundekekse. Wenn man laut „Bruno, Guetzli!“ ruft, kommt er meistens sofort.",
    "Haben Sie Bruno gesehen? Dann rufen Sie mich bitte an: 079 123 45 67. Vielen Dank für Ihre Hilfe!",
]

NOTES = [("Name des Hundes", "Bruno"),
         ("Hunderasse", "Beagle"),
         ("Alter", "3 Jahre"),
         ("Farbe des Fells", "braun, weiss, schwarz"),
         ("Halsband", "rot, mit Glöckchen (und Namensmarke)"),
         ("Seit wann ist er weg?", "seit Samstagnachmittag"),
         ("Wo ist er weggerannt?", "Spielplatz beim Schulhaus Rosenberg / in den Wald"),
         ("Lieblingsfutter", "Karotten und Hundekekse"),
         ("Telefonnummer", "079 123 45 67")]

TRUE_FALSE = [("Bruno ist ein Beagle.", True, ""),
              ("Bruno ist fünf Jahre alt.", False, "drei Jahre"),
              ("Bruno trägt ein blaues Halsband.", False, "rotes Halsband"),
              ("Bruno ist in den Wald gerannt, weil er ein Eichhörnchen gesehen hat.", True, ""),
              ("Bruno hat Angst vor Kindern.", False, "keine Angst"),
              ("Lara wohnt in Winterthur.", True, "")]

QUESTIONS = [("Wie sieht Brunos Fell aus?", "Brunos Fell ist braun, weiss und schwarz."),
             ("Was hängt an Brunos Halsband?",
              "An Brunos Halsband hängen ein Glöckchen und eine Marke mit seinem Namen."),
             ("Wo war Lara mit Bruno?", "Lara war mit Bruno auf dem Spielplatz neben dem Schulhaus Rosenberg."),
             ("Was frisst Bruno am liebsten?", "Bruno frisst am liebsten Karotten und Hundekekse."),
             ("Was soll man tun, wenn man Bruno sieht?", "Man soll Lara anrufen (Nummer 079 123 45 67).")]

FIX = [("bruno hat lange ohren", "Bruno hat lange Ohren."),
       ("lara sucht ihren hund im wald", "Lara sucht ihren Hund im Wald."),
       ("der hund mag karotten und guetzli", "Der Hund mag Karotten und Guetzli.")]

POINTS = [len(NOTES), len(TRUE_FALSE), 3 * len(QUESTIONS), 2 * len(FIX)]
TOTAL = sum(POINTS)


# ---------- Hilfen ----------
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


def box(c, x, y, size=3.6 * mm):
    c.setStrokeColor(INK)
    c.setLineWidth(0.7)
    c.rect(x, y, size, size, stroke=1, fill=0)


def task_head(c, y, nr, title, points, instruction):
    c.setFillColor(INK)
    c.circle(L + 3.4 * mm, y + 1.3 * mm, 3.4 * mm, stroke=0, fill=1)
    ctext(c, L + 3.4 * mm, y - 0.2 * mm, str(nr), 10, "Sans-Bold", white)
    text(c, L + 9 * mm, y, title, 12.5, "Sans-Bold")
    text(c, R - 24 * mm, y, f"____ / {points} P.", 10, "Sans", MUTED)
    return wrapped(c, L + 9 * mm, y - 6 * mm, instruction, W - 9 * mm, 10, color=MUTED) - 2 * mm


def header(c, title, sub, name_fields=True):
    text(c, L, PAGE_H - 20 * mm, title, 18, "Sans-Bold")
    text(c, L, PAGE_H - 26.5 * mm, sub, 10, "Sans", MUTED)
    if name_fields:
        text(c, R - 72 * mm, PAGE_H - 18 * mm, "Name:", 10)
        hline(c, R - 59 * mm, R, PAGE_H - 18.6 * mm)
        text(c, R - 72 * mm, PAGE_H - 26 * mm, "Datum:", 10)
        hline(c, R - 59 * mm, R, PAGE_H - 26.6 * mm)
    hline(c, L, R, PAGE_H - 31 * mm, INK, 1)


def smiley(c, cx, cy, mood, r=3.4 * mm):
    c.setStrokeColor(INK)
    c.setLineWidth(0.7)
    c.circle(cx, cy, r, stroke=1, fill=0)
    c.setFillColor(INK)
    e = r * 0.35
    c.circle(cx - e, cy + r * 0.28, r * 0.11, stroke=0, fill=1)
    c.circle(cx + e, cy + r * 0.28, r * 0.11, stroke=0, fill=1)
    my = cy - r * 0.38
    if mood == 0:
        c.line(cx - r * 0.4, my, cx + r * 0.4, my)
    else:
        p = c.beginPath()
        mid = my - mood * r * 0.25
        p.moveTo(cx - r * 0.45, my)
        p.curveTo(cx - r * 0.2, mid, cx + r * 0.2, mid, cx + r * 0.45, my)
        c.drawPath(p, stroke=1, fill=0)


def ear_icon(c, cx, cy):
    """Kleines Ohr-Symbol für „Hören“."""
    c.setFillColor(ACCENT)
    c.circle(cx, cy, 4.2 * mm, stroke=0, fill=1)
    c.setStrokeColor(white)
    c.setLineWidth(1.1)
    p = c.beginPath()
    p.moveTo(cx - 1.2 * mm, cy - 2.2 * mm)
    p.curveTo(cx - 2.6 * mm, cy + 0.5 * mm, cx - 0.5 * mm, cy + 3 * mm, cx + 1.2 * mm, cy + 2 * mm)
    p.curveTo(cx + 2.6 * mm, cy + 1 * mm, cx + 1.8 * mm, cy - 0.8 * mm, cx + 0.6 * mm, cy - 1.2 * mm)
    p.curveTo(cx - 0.2 * mm, cy - 1.6 * mm, cx + 0.2 * mm, cy - 2.6 * mm, cx - 0.6 * mm, cy - 2.8 * mm)
    c.drawPath(p, stroke=1, fill=0)


# ---------- Übungsblatt ----------
def intro(c, y):
    bh = 32 * mm
    c.setFillColor(SOFT)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.roundRect(L, y - bh, W, bh, 3 * mm, stroke=1, fill=1)
    ear_icon(c, L + 8 * mm, y - 8 * mm)
    text(c, L + 15 * mm, y - 9.5 * mm, f"Hörtext: „{TITLE}“", 12, "Sans-Bold")
    lines = ["Deine Lehrperson liest dir den Text zweimal vor.",
             "1. Mal: Hör nur gut zu. Du schreibst noch nichts.",
             "2. Mal: Jetzt darfst du in Aufgabe 1 Stichwörter notieren.",
             "Danach löst du die Aufgaben 2 bis 4 allein."]
    for i, ln in enumerate(lines):
        text(c, L + 15 * mm, y - 15.5 * mm - i * 4.4 * mm, ln, 9.5, "Sans-Bold" if i in (1, 2) else "Sans",
             INK if i in (1, 2) else MUTED)
    return y - bh - 8 * mm


def aufgabe1(c, y):
    y = task_head(c, y, 1, "Notizen beim Zuhören", POINTS[0],
                  "Schreibe beim 2. Hören Stichwörter auf. Hier musst du noch keine ganzen Sätze schreiben.")
    rh = 8.3 * mm
    for i, (label, _) in enumerate(NOTES):
        yy = y - i * rh
        if i % 2 == 0:
            c.setFillColor(SOFT)
            c.rect(L + 9 * mm, yy - rh + 3.2 * mm, W - 9 * mm, rh, stroke=0, fill=1)
        text(c, L + 11 * mm, yy, label, 10.5, "Sans-Bold")
        hline(c, L + 62 * mm, R - 3 * mm, yy - 0.8 * mm)
    return y - len(NOTES) * rh - 5 * mm


def aufgabe2(c, y):
    y = task_head(c, y, 2, "Richtig oder falsch?", POINTS[1], "Kreuze an.")
    xr, xf = R - 22 * mm, R - 8 * mm
    ctext(c, xr + 1.8 * mm, y, "richtig", 8.5, "Sans-Bold", MUTED)
    ctext(c, xf + 1.8 * mm, y, "falsch", 8.5, "Sans-Bold", MUTED)
    y -= 6.5 * mm
    for i, (s, _, _) in enumerate(TRUE_FALSE):
        yy = y - i * 7.6 * mm
        text(c, L + 9 * mm, yy, f"{i + 1}.  {s}", 10.5)
        box(c, xr, yy - 0.8 * mm)
        box(c, xf, yy - 0.8 * mm)
    return y - len(TRUE_FALSE) * 7.6 * mm


def aufgabe3(c, y):
    y = task_head(c, y, 4, "Fragen in ganzen Sätzen beantworten", POINTS[2],
                  "Beantworte jede Frage mit einem ganzen Satz. Kontrolliere danach jede Antwort mit der Checkliste.")
    # Beispiel
    c.setFillColor(SOFT)
    c.roundRect(L + 9 * mm, y - 10.5 * mm, W - 9 * mm, 13 * mm, 2 * mm, stroke=0, fill=1)
    text(c, L + 12 * mm, y - 2.5 * mm, "Beispiel:  Wie heisst der Hund?", 10, "Sans-Bold", MUTED)
    text(c, L + 12 * mm, y - 7.8 * mm, "Der Hund heisst Bruno.", 11, "Sans", ACCENT)
    text(c, L + 64 * mm, y - 7.8 * mm, "← ganzer Satz · Nomen gross · Punkt am Ende", 8.5, "Sans", MUTED)
    y -= 18 * mm
    for i, (q, _) in enumerate(QUESTIONS):
        text(c, L + 9 * mm, y, f"{i + 1}.  {q}", 10.5, "Sans-Bold")
        hline(c, L + 14 * mm, R, y - 8 * mm)
        hline(c, L + 14 * mm, R, y - 16 * mm)
        # Checkliste zum Abhaken
        cx = L + 14 * mm
        for lbl in ("ganzer Satz", "Punkt", "Nomen gross"):
            box(c, cx, y - 21.5 * mm, 3 * mm)
            text(c, cx + 4.5 * mm, y - 21.2 * mm, lbl, 7.5, "Sans", MUTED)
            cx += 30 * mm
        y -= 27.5 * mm
    return y


def aufgabe4(c, y):
    y = task_head(c, y, 3, "Satz-Doktor", POINTS[3],
                  "Diese Sätze sind krank: Es fehlen der Punkt und die grossen Anfangsbuchstaben. "
                  "Schreibe sie richtig ab.")
    for low, _ in FIX:
        text(c, L + 9 * mm, y - 1 * mm, low, 11)
        hline(c, L + 80 * mm, R, y - 1.8 * mm)
        y -= 9 * mm
    return y - 3 * mm


def selbst(c, y):
    text(c, L, y, "Das kann ich schon", 12, "Sans-Bold")
    text(c, R - 41 * mm, y, "Male ein Gesicht an.", 8, "Sans", MUTED)
    y -= 3 * mm
    rh = 9 * mm
    for i, g in enumerate(GOALS):
        yy = y - i * rh
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.line(L, yy - rh, R, yy - rh)
        text(c, L + 2 * mm, yy - 5.8 * mm, g, 9.5)
        for k, mood in enumerate((1, 0, -1)):
            smiley(c, R - 34 * mm + k * 11 * mm, yy - 4.6 * mm, mood)
    return y - len(GOALS) * rh


def uebungsblatt():
    out = OUT_DIR / "hoerverstaendnis-uebungsblatt.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Hörverständnis: Vermisst – Hund Bruno (4. Klasse)")
    header(c, "Hörverständnis", "Übungsblatt Deutsch · 4. Klasse · Seite 1")
    y = intro(c, PAGE_H - 36 * mm)
    y = aufgabe1(c, y)
    y = aufgabe2(c, y) - 6 * mm
    aufgabe4(c, y)          # Satz-Doktor ist Aufgabe 3
    c.showPage()

    header(c, "Hörverständnis", "Übungsblatt Deutsch · 4. Klasse · Seite 2", name_fields=False)
    y = aufgabe3(c, PAGE_H - 39 * mm)   # Fragen = Aufgabe 4
    selbst(c, y - 2 * mm)
    # Punkte
    bx, bw, bh, by = R - 62 * mm, 62 * mm, 11 * mm, 9 * mm
    c.setStrokeColor(INK)
    c.setLineWidth(1)
    c.roundRect(bx, by, bw, bh, 3 * mm, stroke=1, fill=0)
    text(c, bx + 4 * mm, by + 4 * mm, f"Total:  ______ / {TOTAL} Punkte", 11, "Sans-Bold")
    c.showPage()
    c.save()
    print(out)


# ---------- Blatt für die Lehrperson ----------
def lehrperson():
    out = OUT_DIR / "hoerverstaendnis-lehrperson.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Hörverständnis 4. Klasse: Vorlesetext und Lösungen")

    header(c, "Hörverständnis: Vorlesetext", "Für die Lehrperson · 4. Klasse · Nicht an die Kinder abgeben",
           name_fields=False)
    y = PAGE_H - 40 * mm
    text(c, L, y, "So geht's", 11.5, "Sans-Bold")
    steps = ["1. Übungsblatt austeilen. Die Kinder lesen kurz Aufgabe 1 (ca. 1 Minute).",
             "2. Text ein erstes Mal vorlesen, ruhig und deutlich. Die Kinder hören nur zu.",
             "3. Kurze Pause. Dann ein zweites Mal vorlesen, etwas langsamer. Jetzt notieren die Kinder Stichwörter.",
             "4. Danach lösen die Kinder die Aufgaben 2 bis 4 allein (ca. 20 Minuten).",
             "Dauer insgesamt: etwa 30 Minuten. Der Text wird nicht verteilt."]
    y -= 6 * mm
    for s in steps:
        y = wrapped(c, L, y, s, W, 9.5, color=MUTED if s.startswith("Dauer") else INK) - 1 * mm
    y -= 5 * mm
    c.setFillColor(SOFT)
    box_top = y + 4 * mm
    text(c, L + 5 * mm, y - 4 * mm, TITLE, 14, "Sans-Bold")
    yy = y - 13 * mm
    for para in STORY:
        yy = wrapped(c, L + 5 * mm, yy, para, W - 10 * mm, 12.5, "Sans", 7.2 * mm) - 3.5 * mm
    c.setStrokeColor(ACCENT)
    c.setLineWidth(1.2)
    c.roundRect(L, yy, W, box_top - yy, 3 * mm, stroke=1, fill=0)
    words = sum(len(p.split()) for p in STORY)
    text(c, L, yy - 6 * mm, f"{words} Wörter · Lesedauer ca. 1½ Minuten", 8.5, "Sans", MUTED)
    c.showPage()

    header(c, "Hörverständnis: Lösungen", "Für die Lehrperson · 4. Klasse", name_fields=False)
    y = PAGE_H - 40 * mm

    def head(nr, title, pts, note=""):
        nonlocal y
        text(c, L, y, f"{nr}. {title}", 11.5, "Sans-Bold")
        text(c, R - 20 * mm, y, f"{pts} P.", 10, "Sans-Bold", RED)
        y -= 5 * mm
        if note:
            y = wrapped(c, L, y, note, W, 8.5, color=MUTED) - 1 * mm

    head(1, "Notizen beim Zuhören", POINTS[0], "1 Punkt pro richtiger Information. Stichwörter genügen, "
         "Rechtschreibung wird hier nicht bewertet.")
    for label, sol in NOTES:
        text(c, L, y, label, 9.5)
        text(c, L + 50 * mm, y, sol, 9.5, color=RED)
        y -= 4.6 * mm
    y -= 3 * mm

    head(2, "Richtig oder falsch?", POINTS[1])
    for i, (s, ok, why) in enumerate(TRUE_FALSE):
        text(c, L, y, f"{i + 1}. {s}", 9.5)
        text(c, L + 125 * mm, y, "richtig" if ok else f"falsch ({why})", 9.5, color=RED)
        y -= 4.6 * mm
    y -= 3 * mm

    head(3, "Satz-Doktor", POINTS[3], "Pro Satz 2 Punkte: 1 P. alle grossen Anfangsbuchstaben "
         "(Satzanfang und Nomen) · 1 P. Punkt am Ende.")
    for _, right in FIX:
        text(c, L, y, right, 9.5, color=RED)
        y -= 4.6 * mm
    y -= 4 * mm

    head(4, "Fragen in ganzen Sätzen beantworten", POINTS[2],
         "Pro Frage 3 Punkte: 1 P. richtiger Inhalt · 1 P. ganzer Satz mit Punkt am Ende · 1 P. alle Nomen "
         "gross. Andere richtige Formulierungen sind auch gut. Bei Frage 2 genügt Glöckchen oder Marke.")
    for i, (q, a) in enumerate(QUESTIONS):
        text(c, L, y, f"{i + 1}. {q}", 9.5, "Sans-Bold")
        y = wrapped(c, L + 5 * mm, y - 4.4 * mm, a, W - 5 * mm, 9.5, color=RED) - 1.5 * mm
    y -= 2 * mm

    text(c, L, y, f"Total: {TOTAL} Punkte", 11.5, "Sans-Bold")
    text(c, L, y - 6 * mm, "Vorschlag Bewertung:  Lernziele sehr gut erreicht ab 32 P.  ·  erreicht ab 25 P.  ·  "
         "teilweise erreicht ab 18 P.", 9, "Sans", MUTED)
    c.showPage()
    c.save()
    print(out)


if __name__ == "__main__":
    uebungsblatt()
    lehrperson()
