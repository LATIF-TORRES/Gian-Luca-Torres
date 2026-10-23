"""Zwei Rechenspiele zu zweit für die 2. Klasse (Fördergruppe), zum Ausdrucken.

Aufruf:  python3 rechenspiele_zu_zweit_pdf.py
Ausgabe: rechenspiele-zu-zweit.pdf (2 Seiten)
         rechenspiele-zu-zweit-loesungen.pdf (2 Seiten: dieselben Seiten, Lösung farbig eingezeichnet)

Spiel 1 «Würfel-Plus»: 2 Würfel, Punkte zusammenzählen, Feld anmalen, 3 in einer Reihe gewinnt.
Spiel 2 «Rechen-Wettlauf»: 1 Würfel, vorwärts gehen, Aufgabe auf dem Feld rechnen.

Alle Lösungen werden aus denselben Daten berechnet, aus denen die Spielpläne gezeichnet werden.
"""
import random
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).parent.parent / "raum-und-linien"))
from zeichnen import FIG, FIG_FILL, INK, L, MUTED, PAGE_H, R, SOFT, W, ctext, header, text  # noqa: E402

OUT_DIR = Path(__file__).parent
SOL = HexColor("#d0342c")
P_RED = HexColor("#e2483d")
P_BLUE = HexColor("#2f6fdc")

# ---------- Daten Spiel 1 ----------
# So oft kommt jede Summe auf dem Plan vor (ungefähr so oft, wie man sie würfelt): 25 Felder
SUM_COUNT = {2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 3, 9: 3, 10: 2, 11: 1, 12: 1}
BOARD_N = 5


def sum_board():
    nums = [s for s, k in SUM_COUNT.items() for _ in range(k)]
    assert len(nums) == BOARD_N * BOARD_N
    rnd = random.Random(7)
    while True:  # gleiche Zahlen nicht direkt nebeneinander
        rnd.shuffle(nums)
        g = [nums[i * BOARD_N:(i + 1) * BOARD_N] for i in range(BOARD_N)]
        if all(g[r][k] != g[r][k + 1] for r in range(BOARD_N) for k in range(BOARD_N - 1)) and \
           all(g[r][k] != g[r + 1][k] for r in range(BOARD_N - 1) for k in range(BOARD_N)):
            return g


def dice_pairs(s):
    return [(a, s - a) for a in range(1, 7) if 1 <= s - a <= 6 and a <= s - a]


# ---------- Daten Spiel 2 ----------
COLS, ROWS = 5, 6  # Feld 0 = START, letztes Feld = ZIEL


def race_tasks():
    rnd = random.Random(12)
    seen, out = set(), []

    def pick(gen):
        while True:
            t = gen()
            if t not in seen:
                seen.add(t)
                return t

    def bis10_plus():
        a = rnd.randint(1, 8); return (a, "+", rnd.randint(1, 10 - a))

    def bis10_minus():
        a = rnd.randint(3, 10); return (a, "−", rnd.randint(1, a - 1))

    def ohne_plus():  # 12 + 5: kein Zehnerübergang
        a = rnd.randint(11, 17); return (a, "+", rnd.randint(1, 19 - a))

    def ohne_minus():  # 17 − 4
        a = rnd.randint(13, 19); return (a, "−", rnd.randint(1, a - 11))

    def ueber_plus():  # 8 + 5: über den Zehner
        a = rnd.randint(5, 9); return (a, "+", rnd.randint(11 - a, 9))

    def ueber_minus():  # 13 − 6
        a = rnd.randint(11, 16); return (a, "−", rnd.randint(a - 9, 9))

    n = COLS * ROWS - 2
    for i in range(n):
        stage = (bis10_plus, bis10_minus) if i < 10 else (ohne_plus, ohne_minus) if i < 19 else (ueber_plus, ueber_minus)
        out.append(pick(stage[i % 2]))
    return out


def result(t):
    a, op, b = t
    return a + b if op == "+" else a - b


# ---------- Zeichen-Hilfen ----------
def die(c, x, y, s, n, color=INK):
    """Würfel mit n Punkten; (x, y) = linke untere Ecke."""
    c.setStrokeColor(color); c.setFillColor(white); c.setLineWidth(1.1)
    c.roundRect(x, y, s, s, s * 0.18, stroke=1, fill=1)
    pos = {1: [(1, 1)], 2: [(0, 2), (2, 0)], 3: [(0, 2), (1, 1), (2, 0)], 4: [(0, 0), (0, 2), (2, 0), (2, 2)],
           5: [(0, 0), (0, 2), (1, 1), (2, 0), (2, 2)], 6: [(0, 0), (0, 1), (0, 2), (2, 0), (2, 1), (2, 2)]}[n]
    c.setFillColor(color)
    for i, j in pos:
        c.circle(x + s * (0.25 + 0.25 * i), y + s * (0.25 + 0.25 * j), s * 0.085, stroke=0, fill=1)


def rules(c, y, items, size=11.5, lead=6.3 * mm):
    for nr, line in items:
        if nr:
            c.setFillColor(FIG); c.circle(L + 3 * mm, y + 1.4 * mm, 2.9 * mm, stroke=0, fill=1)
            ctext(c, L + 3 * mm, y + 0.1 * mm, str(nr), 9.5, "Sans-Bold", white)
        text(c, L + 9 * mm, y, line, size)
        y -= lead
    return y


def needs(c, y, items):
    c.setFillColor(SOFT); c.roundRect(L, y - 3 * mm, W, 9 * mm, 2 * mm, stroke=0, fill=1)
    text(c, L + 3 * mm, y, "Ihr braucht:", 11, "Sans-Bold")
    text(c, L + 29 * mm, y, items, 11)
    return y - 12 * mm


def mini_row(c, x, y, cells, label):
    s = 5 * mm
    for i in range(3):
        for j in range(3):
            c.setStrokeColor(MUTED); c.setLineWidth(0.5)
            c.setFillColor(P_RED if (i, j) in cells else white)
            c.rect(x + i * s, y - (j + 1) * s, s, s, stroke=1, fill=1)
    ctext(c, x + 1.5 * s, y - 3 * s - 4.5 * mm, label, 9.5)


# ---------- Seiten ----------
def page_sum(c, sol, board):
    header(c, "Spiel 1: Würfel-Plus", "Rechenspiel zu zweit · Plus rechnen mit 2 Würfeln", name_fields=False)
    y = needs(c, PAGE_H - 40 * mm, "diesen Spielplan, 2 Würfel, 1 roten Stift und 1 blauen Stift")
    y = rules(c, y, [
        (1, "Jedes Kind wählt eine Farbe: Rot oder Blau."),
        (2, "Würfle mit beiden Würfeln."),
        (3, "Zähle die Punkte von beiden Würfeln zusammen."),
    ])
    # Beispiel
    s = 9 * mm
    die(c, L + 9 * mm, y - 6 * mm, s, 3)
    text(c, L + 20.5 * mm, y - 2.6 * mm, "+", 16, "Sans-Bold")
    die(c, L + 26 * mm, y - 6 * mm, s, 4)
    text(c, L + 38 * mm, y - 2.6 * mm, "Beispiel:  3 + 4 = 7", 12, "Sans-Bold")
    y -= 13 * mm
    y = rules(c, y, [
        (4, "Suche ein Feld mit deiner Zahl. Male das Feld in deiner Farbe an."),
        (5, "Ist kein Feld mit deiner Zahl mehr frei? Dann ist das andere Kind dran."),
        (6, "Wer zuerst 3 Felder in einer Reihe hat, gewinnt. So geht eine Reihe:"),
    ])
    mx = L + 12 * mm
    for k, (cells, lab) in enumerate([({(0, 1), (1, 1), (2, 1)}, "nebeneinander"),
                                       ({(1, 0), (1, 1), (1, 2)}, "untereinander"),
                                       ({(0, 0), (1, 1), (2, 2)}, "schräg")]):
        mini_row(c, mx + k * 38 * mm, y + 2 * mm, cells, lab)
    y -= 25 * mm

    cell = 31 * mm
    bx = L + (W - BOARD_N * cell) / 2
    for r in range(BOARD_N):
        for k in range(BOARD_N):
            x, yy = bx + k * cell, y - (r + 1) * cell
            n = board[r][k]
            c.setStrokeColor(FIG); c.setLineWidth(1.6)
            c.setFillColor(FIG_FILL if (r + k) % 2 == 0 else white)
            c.rect(x, yy, cell, cell, stroke=1, fill=1)
            ctext(c, x + cell / 2, yy + cell / 2 - 4 * mm + (2.5 * mm if sol else 0), str(n), 30, "Sans-Bold")
            if sol:
                ctext(c, x + cell / 2, yy + 3 * mm, "  ".join(f"{a}+{b}" for a, b in dice_pairs(n)), 8.5, "Sans", SOL)
    if sol:
        text(c, L, y - BOARD_N * cell - 7 * mm,
             "Lösung: Unter jeder Zahl steht in Rot, welche Würfel zusammen diese Zahl geben.", 10, "Sans", SOL)
        text(c, L, y - BOARD_N * cell - 12.5 * mm,
             "Kontrolle beim Spielen: Das andere Kind zählt die Punkte auf beiden Würfeln nach.", 10, "Sans", SOL)
    c.showPage()


def snake(i):
    r, k = divmod(i, COLS)
    return r, (k if r % 2 == 0 else COLS - 1 - k)


def page_race(c, sol, tasks):
    header(c, "Spiel 2: Rechen-Wettlauf", "Rechenspiel zu zweit · Plus und Minus bis 20", name_fields=False)
    y = needs(c, PAGE_H - 40 * mm, "diesen Spielplan, 1 Würfel, 2 Spielfiguren, das Lösungsblatt")
    y = rules(c, y, [
        (1, "Stellt beide Spielfiguren auf START."),
        (2, "Würfle. Gehe so viele Felder weiter, wie der Würfel Punkte zeigt."),
        (3, "Rechne die Aufgabe auf deinem Feld. Sage das Ergebnis laut."),
        (4, "Das andere Kind schaut auf dem Lösungsblatt nach, ob es stimmt."),
        (5, "Richtig: Du bleibst auf dem Feld."),
        (6, "Falsch: Du gehst zurück auf dein altes Feld."),
        (7, "Jetzt ist das andere Kind dran. Wer zuerst im ZIEL ist, gewinnt."),
    ])
    y -= 1 * mm
    cw, ch, gap = W / COLS, 28 * mm, 0
    total = COLS * ROWS
    centers = {}
    for i in range(total):
        r, k = snake(i)
        x, yy = L + k * cw, y - (r + 1) * ch
        centers[i] = (x + cw / 2, yy + ch / 2)
        pad = 2 * mm
        if i == 0 or i == total - 1:
            fill = HexColor("#d8f3dc") if i == 0 else HexColor("#ffe0de")
        else:
            fill = white
        c.setFillColor(fill); c.setStrokeColor(FIG); c.setLineWidth(1.4)
        c.roundRect(x + pad, yy + pad, cw - 2 * pad, ch - 2 * pad, 3 * mm, stroke=1, fill=1)
        cx = x + cw / 2
        if i == 0:
            ctext(c, cx, yy + ch / 2 - 3 * mm, "START", 18, "Sans-Bold")
        elif i == total - 1:
            ctext(c, cx, yy + ch / 2 - 3 * mm, "ZIEL", 20, "Sans-Bold")
        else:
            a, op, b = tasks[i - 1]
            ctext(c, cx, yy + ch / 2 - 2 * mm + (3 * mm if sol else 0), f"{a} {op} {b}", 21, "Sans-Bold")
            if sol:
                ctext(c, cx, yy + 4.5 * mm, f"= {result(tasks[i - 1])}", 15, "Sans-Bold", SOL)
    # Pfeile zwischen den Feldern
    for i in range(total - 1):
        (x0, y0), (x1, y1) = centers[i], centers[i + 1]
        c.setFillColor(P_BLUE)
        if abs(y0 - y1) < 1:  # waagrecht
            mx, d = (x0 + x1) / 2, (1 if x1 > x0 else -1)
            p = c.beginPath(); p.moveTo(mx + d * 1.8 * mm, y0); p.lineTo(mx - d * 1.6 * mm, y0 + 2 * mm)
            p.lineTo(mx - d * 1.6 * mm, y0 - 2 * mm); p.close()
        else:  # nach unten
            my = (y0 + y1) / 2
            p = c.beginPath(); p.moveTo(x0, my - 1.8 * mm); p.lineTo(x0 - 2 * mm, my + 1.6 * mm)
            p.lineTo(x0 + 2 * mm, my + 1.6 * mm); p.close()
        c.drawPath(p, stroke=0, fill=1)
    if sol:
        text(c, L, y - ROWS * ch - 6 * mm,
             "Lösungsblatt: Das Ergebnis steht in Rot unter jeder Aufgabe.", 10, "Sans", SOL)
    c.showPage()


def build(sol):
    board, tasks = sum_board(), race_tasks()
    for t in tasks:
        assert 0 <= result(t) <= 20
    name = "rechenspiele-zu-zweit" + ("-loesungen" if sol else "") + ".pdf"
    c = canvas.Canvas(str(OUT_DIR / name), pagesize=A4)
    c.setTitle("Rechenspiele zu zweit – 2. Klasse" + (" – Lösungen" if sol else ""))
    page_sum(c, sol, board)
    page_race(c, sol, tasks)
    c.save()
    print(name)


if __name__ == "__main__":
    build(False)
    build(True)
