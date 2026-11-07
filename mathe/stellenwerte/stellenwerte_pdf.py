"""Übungsblätter zur Lernzielkontrolle 3: Stellenwerte, Ziffern und Zahlen (Zahlen bis 1 000 000).

Aufruf:  python3 stellenwerte_pdf.py
Ausgabe (je Blatt eine Aufgaben- und eine Lösungsdatei, je 2 Seiten):
  blatt1-stellenwerte.pdf         / blatt1-stellenwerte-loesungen.pdf        (Lernziele 1, 2, 3)
  blatt2-zahlen-bilden.pdf        / blatt2-zahlen-bilden-loesungen.pdf       (Lernziel 4)
  blatt3-zaehlen-rechnen.pdf      / blatt3-zaehlen-rechnen-loesungen.pdf     (Lernziele 5, 6)
  abschlusstest.pdf               / abschlusstest-loesungen.pdf              (alle Lernziele, neue Zahlen)
  ablaufplan-90-minuten.pdf       (1 Seite für die Lehrperson)
Zeit: Blatt 1 ca. 25 Min., Blatt 2 ca. 15 Min., Blatt 3 ca. 20 Min., Test ca. 20 Min. = 90 Min. mit Pause und Besprechung.

Alle Lösungen werden berechnet (Stellen zerlegen, Ziffernkarten durchprobieren, Rätselzahlen mit allen
möglichen Zahlen prüfen, Folgen und Rechnungen ausrechnen). Nichts ist von Hand eingetragen.
"""
import sys
from itertools import permutations
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "raum-und-linien"))

from reportlab.lib.colors import HexColor, white  # noqa: E402
from reportlab.lib.pagesizes import A4  # noqa: E402
from reportlab.lib.units import mm  # noqa: E402
from reportlab.pdfbase import pdfmetrics  # noqa: E402
from reportlab.pdfgen import canvas  # noqa: E402

from zeichnen import FIG, INK, L, LINE, MUTED, PAGE_H, R, SOFT, W, ctext, header, hline, text  # noqa: E402

OUT_DIR = Path(__file__).parent
SOL = HexColor("#d0342c")
GROUP = {"M": HexColor("#fde7c8"), "HT": HexColor("#dcf3ec"), "ZT": HexColor("#dcf3ec"), "T": HexColor("#dcf3ec"),
         "H": HexColor("#e4eaff"), "Z": HexColor("#e4eaff"), "E": HexColor("#e4eaff")}
NB = " "  # geschütztes Leerzeichen: Zahlen werden nie am Zeilenende getrennt

PLACES = [("M", "Millionen", 1_000_000), ("HT", "Hunderttausender", 100_000), ("ZT", "Zehntausender", 10_000),
          ("T", "Tausender", 1_000), ("H", "Hunderter", 100), ("Z", "Zehner", 10), ("E", "Einer", 1)]
VALUE = {a: v for a, _, v in PLACES}
NAME = {a: n for a, n, _ in PLACES}

GOALS = {
    1: "Ich kenne alle Stellen einer Zahl in der richtigen Reihenfolge: Einer, Zehner, Hunderter, …",
    2: "Ich kenne die Abkürzungen (E, Z, H, T, ZT, HT und M) und die Werte der Stellen und kann also eine Zahl "
       "aus verschiedenen Teilen zusammensetzen: 3 ZT und 4 H = 30 400",
    3: "Ich kann Zahlen in der Stellenwerttabelle lesen und auch Zahlen hineinschreiben.",
    4: "Ich kann aus mehreren Ziffern Zahlen bilden, die den schriftlichen Vorgaben entsprechen.",
    5: "Ich kann mit Zahlen bis 1'000'000 in Schritten vorwärts und rückwärts zählen.",
    6: "Ich kann mit Zahlen bis 1'000'000 addieren und subtrahieren.",
}


# ---------- Hilfen ----------
def z(n):
    """Zahl mit Leerzeichen zwischen den Dreiergruppen, z. B. 30 400 (geschützt gegen Umbruch)."""
    return f"{n:,}".replace(",", NB)


def digits_of(n):
    return {a: (n // v) % 10 for a, _, v in PLACES}


def parts_of(n):
    """Zerlegung in Stellen ohne Nullen, z. B. 30 400 -> '3 ZT + 4 H'."""
    d = digits_of(n)
    return " + ".join(f"{d[a]}{NB}{a}" for a, _, _ in PLACES if d[a])


def wrap(c, x, y, s, width, size=9.5, font="Sans", leading=None, color=INK):
    """Zeilenumbruch nur bei normalen Leerzeichen (Zahlen mit geschütztem Leerzeichen bleiben ganz)."""
    leading = leading or size * 1.38
    words, line = s.split(" "), ""
    for w_ in words:
        test = (line + " " + w_).strip()
        if pdfmetrics.stringWidth(test, font, size) <= width or not line:
            line = test
        else:
            text(c, x, y, line, size, font, color)
            y -= leading
            line = w_
    if line:
        text(c, x, y, line, size, font, color)
        y -= leading
    return y


def task_head(c, y, nr, title, instruction, goals):
    c.setFillColor(INK)
    c.circle(L + 3.4 * mm, y + 1.3 * mm, 3.4 * mm, stroke=0, fill=1)
    ctext(c, L + 3.4 * mm, y - 0.2 * mm, str(nr), 10, "Sans-Bold", white)
    text(c, L + 9 * mm, y, title, 12, "Sans-Bold")
    y -= 5.5 * mm
    for part in instruction.split("  "):
        y = wrap(c, L + 9 * mm, y, part.strip(), W - 9 * mm, 9.5) - 0.8 * mm
    text(c, L + 9 * mm, y, "Lernziel " + ", ".join(str(g) for g in goals), 7, "Sans", MUTED)
    return y - 6 * mm


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
        yy = wrap(c, L + 4 * mm, yy, ln, W - 8 * mm, 9.5) - 0.5 * mm
    return y - h - 7 * mm


def place_table(c, x, y_top, cw, rows, sol, solutions=None, given=None, labels=None, show_names=False):
    """Stellenwerttabelle M … E.  given[i] = Ziffern (dict Stelle->Ziffer) für vorgegebene Zeilen,
    solutions[i] = Ziffern, die im Lösungsblatt rot erscheinen."""
    rh = 8 * mm
    hh = 12 * mm if show_names else 7 * mm
    for k, (a, n, _) in enumerate(PLACES):
        cx = x + k * cw
        c.setFillColor(GROUP[a])
        c.rect(cx, y_top - hh, cw, hh, stroke=0, fill=1)
        ctext(c, cx + cw / 2, y_top - 5 * mm, a, 10.5, "Sans-Bold")
        if show_names:
            ctext(c, cx + cw / 2, y_top - 9.5 * mm, n, 6.5, "Sans", MUTED)
    c.setStrokeColor(INK)
    c.setLineWidth(0.6)
    total_h = hh + rows * rh
    c.rect(x, y_top - total_h, 7 * cw, total_h, stroke=1, fill=0)
    for k in range(1, 7):
        c.setLineWidth(1.4 if k in (1, 4) else 0.5)
        c.line(x + k * cw, y_top, x + k * cw, y_top - total_h)
    c.setLineWidth(0.5)
    for r in range(rows + 1):
        c.line(x, y_top - hh - r * rh, x + 7 * cw, y_top - hh - r * rh)
    for r in range(rows):
        cy = y_top - hh - r * rh - 5.6 * mm
        if labels:
            text(c, x - 7 * mm, cy, labels[r], 9.5, "Sans-Bold", FIG)
        for src, col in ((given, INK), (solutions if sol else None, SOL)):
            if src and src[r]:
                for k, (a, _, _) in enumerate(PLACES):
                    if a in src[r]:
                        ctext(c, x + k * cw + cw / 2, cy, str(src[r][a]), 12, "Sans-Bold", col)
    return y_top - total_h


def table_digits(n):
    """Ziffern ab der ersten Stelle, die nicht 0 ist (führende Nullen bleiben leer)."""
    d = digits_of(n)
    out, started = {}, False
    for a, _, _ in PLACES:
        if d[a] or started:
            started = True
            out[a] = d[a]
    return out


def goals_box(c, y, nums):
    text(c, L, y, "Das kann ich schon", 11.5, "Sans-Bold")
    for k, h in enumerate(("gut", "fast", "üben")):
        ctext(c, R - 28.2 * mm + k * 10 * mm, y, h, 7.5, "Sans-Bold", MUTED)
    y -= 3 * mm
    for g in nums:
        lines_y = wrap(c, L + 1 * mm, y - 4.6 * mm, GOALS[g], W - 36 * mm, 8)
        rh = max(7.4 * mm, (y - lines_y) + 2 * mm)
        for k in range(3):
            c.setStrokeColor(INK); c.setLineWidth(0.6)
            c.rect(R - 30 * mm + k * 10 * mm, y - 5.4 * mm, 3.6 * mm, 3.6 * mm, stroke=1, fill=0)
        hline(c, L, R, y - rh, LINE, 0.4)
        y -= rh
    return y


def footer_note(c, sol, page):
    text(c, R - 18 * mm, 8 * mm, f"Seite {page}", 8, "Sans", MUTED)
    if sol:
        text(c, L, 8 * mm, "Lösungen: rot", 8, "Sans-Bold", SOL)


# =====================================================================
# Blatt 1: Stellenwerte (Lernziele 1, 2, 3)
# =====================================================================
ORDER_GIVEN = 2  # Einer und Zehner sind vorgegeben
ABBR_ORDER = ["H", "ZT", "E", "M", "T", "HT", "Z"]
COMPOSE = [  # (Teile in der angegebenen Reihenfolge)
    [("HT", 5), ("T", 2), ("E", 7)],
    [("ZT", 6), ("Z", 9)],
    [("M", 1), ("H", 3)],
    [("T", 8), ("H", 4), ("Z", 1)],
    [("HT", 2), ("ZT", 5)],
    [("E", 7), ("Z", 3), ("HT", 9)],
]
DECOMPOSE = [472_305, 60_018, 905_060]
WRITE_IN = [305_070, 48_006, 1_000_000, 720_400]
READ_OUT = [640_205, 7_003, 80_090, 999_999]
DIGIT7 = [470_120, 7_315]       # Wert der Ziffer 7
WHERE5 = [153_000, 500_312, 8_451]    # Stelle der Ziffer 5


def compose(parts):
    return sum(VALUE[a] * d for a, d in parts)


def b1_page1(c, sol):
    header(c, "Übungsblatt 1", "Stellenwerte · ca. 25 Minuten · Seite 1", name_fields=not sol)
    y = PAGE_H - 37 * mm
    text(c, L, y, "Merke: die Stellenwerttabelle", 11.5, "Sans-Bold")
    y -= 3 * mm
    cw = W / 7
    y = place_table(c, L, y, cw, 1, False, given=[{a: "1" for a in VALUE}], show_names=True)
    # Werte darunter
    for k, (a, _, v) in enumerate(PLACES):
        ctext(c, L + k * cw + cw / 2, y - 4.5 * mm, z(v), 8, "Sans", MUTED)
    y = wrap(c, L, y - 10.5 * mm, f"Jede Stelle ist 10-mal so viel wert wie die Stelle rechts daneben. "
             f"Beispiel: 3{NB}ZT und 4{NB}H = 30{NB}000 + 400 = 30{NB}400.", W, 9.5) - 6 * mm

    y = task_head(c, y, 1, "Die Stellen der Reihe nach",
                  "Schreibe die Namen der Stellen in der richtigen Reihenfolge auf. Beginne bei den Einern.",
                  [1])
    names = [n for _, n, _ in reversed(PLACES)]
    x = L + 9 * mm
    bw = (W - 9 * mm) / 3
    for i, n in enumerate(names):
        col, row = i % 3, i // 3
        xx, yy = x + col * bw, y - row * 9 * mm
        text(c, xx, yy, f"{i + 1}.", 9.5, "Sans-Bold", FIG)
        if i < ORDER_GIVEN:
            text(c, xx + 6 * mm, yy, n, 10)
        else:
            answer(c, xx + 6 * mm, yy, bw - 10 * mm, sol, n, 9.5)
    y -= 3 * 9 * mm + 6 * mm

    y = task_head(c, y, 2, "Abkürzungen und Werte",
                  "Schreibe zu jeder Abkürzung den Namen der Stelle und ihren Wert.", [2])
    text(c, L + 9 * mm, y, "Abkürzung", 8.5, "Sans-Bold", MUTED)
    text(c, L + 32 * mm, y, "Name", 8.5, "Sans-Bold", MUTED)
    text(c, L + 100 * mm, y, "Wert", 8.5, "Sans-Bold", MUTED)
    y -= 7 * mm
    for a in ABBR_ORDER:
        text(c, L + 13 * mm, y, a, 11, "Sans-Bold")
        answer(c, L + 32 * mm, y, 60 * mm, sol, NAME[a])
        answer(c, L + 100 * mm, y, 40 * mm, sol, z(VALUE[a]))
        y -= 7.5 * mm
    y -= 4 * mm

    y = task_head(c, y, 3, "Zahlen zusammensetzen",
                  "Setze die Zahl aus den Teilen zusammen. Schreibe sie mit Ziffern auf.  "
                  "Achtung: Die Teile stehen nicht immer der Reihe nach.", [2])
    text(c, L + 9 * mm, y, f"Beispiel:  3{NB}ZT und 4{NB}H = 30{NB}400", 9.5, "Sans", MUTED)
    y -= 7.5 * mm
    half = (W - 9 * mm) / 2
    for i, parts in enumerate(COMPOSE):
        col, row = i % 2, i // 2
        xx, yy = L + 9 * mm + col * half, y - row * 8.5 * mm
        desc = ", ".join(f"{d}{NB}{a}" for a, d in parts[:-1]) + f" und {parts[-1][1]}{NB}{parts[-1][0]}"
        lbl = f"{'abcdefgh'[i]})  {desc} ="
        text(c, xx, yy, lbl, 10)
        answer(c, xx + pdfmetrics.stringWidth(lbl, "Sans", 10) + 2 * mm, yy, 26 * mm, sol, z(compose(parts)))
    footer_note(c, sol, 1)
    c.showPage()


def b1_page2(c, sol):
    header(c, "Übungsblatt 1", "Stellenwerte · ca. 25 Minuten · Seite 2", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 4, "Zahlen zerlegen",
                  "Zerlege die Zahl in ihre Stellen. Schreibe nur die Stellen auf, die nicht 0 sind.", [2])
    text(c, L + 9 * mm, y, f"Beispiel:  30{NB}400 = 3{NB}ZT + 4{NB}H", 9.5, "Sans", MUTED)
    y -= 8 * mm
    for i, n in enumerate(DECOMPOSE):
        lbl = f"{'abcd'[i]})  {z(n)} ="
        text(c, L + 9 * mm, y, lbl, 10)
        answer(c, L + 45 * mm, y, W - 45 * mm, sol, parts_of(n))
        y -= 8.5 * mm
    y -= 4 * mm

    y = task_head(c, y, 5, "Zahlen in die Stellenwerttabelle schreiben",
                  "Schreibe jede Zahl in die Stellenwerttabelle. Schreibe in jedes Feld genau eine Ziffer.  "
                  "Denke an die Nullen. Vor der ersten Ziffer bleiben die Felder leer.", [3])
    cw = 14 * mm
    x0 = L + 30 * mm
    for i, n in enumerate(WRITE_IN):
        text(c, L + 9 * mm, y - 12.6 * mm - i * 8 * mm, f"{'abcde'[i]})  {z(n)}", 10, "Sans-Bold")
    y = place_table(c, x0 + 12 * mm, y, cw, len(WRITE_IN), sol,
                    solutions=[{a: str(v) for a, v in table_digits(n).items()} for n in WRITE_IN]) - 9 * mm

    y = task_head(c, y, 6, "Zahlen aus der Stellenwerttabelle lesen",
                  "Lies die Zahl in jeder Zeile. Schreibe sie rechts mit Ziffern auf.", [3])
    top = y
    y = place_table(c, L + 16 * mm, y, cw, len(READ_OUT), sol,
                    given=[{a: str(v) for a, v in table_digits(n).items()} for n in READ_OUT],
                    labels=[f"{l})" for l in "abcde"])
    for i, n in enumerate(READ_OUT):
        answer(c, L + 16 * mm + 7 * cw + 8 * mm, top - 12.6 * mm - i * 8 * mm, 32 * mm, sol, z(n))
    y -= 9 * mm
    y = task_head(c, y, 7, "Wert einer Ziffer",
                  "a) Welchen Wert hat die Ziffer 7 in der Zahl? Schreibe den Wert als Zahl auf.  "
                  "b) An welcher Stelle steht die Ziffer 5? Schreibe die Abkürzung auf.", [2, 3])
    for i, n in enumerate(DIGIT7):
        d = digits_of(n)
        assert list(d.values()).count(7) == 1
        a = next(k for k, v in d.items() if v == 7)
        if i == 0:
            text(c, L + 9 * mm, y, "a)", 10, "Sans-Bold", FIG)
        xx = L + 17 * mm + (i % 2) * 80 * mm
        yy = y - (i // 2) * 8 * mm
        text(c, xx, yy, f"{z(n)}:", 10)
        answer(c, xx + 24 * mm, yy, 30 * mm, sol, z(7 * VALUE[a]))
    y -= ((len(DIGIT7) + 1) // 2) * 8 * mm + 2 * mm
    for i, n in enumerate(WHERE5):
        d = digits_of(n)
        assert list(d.values()).count(5) == 1
        a = next(k for k, v in d.items() if v == 5)
        if i == 0:
            text(c, L + 9 * mm, y, "b)", 10, "Sans-Bold", FIG)
        xx = L + 17 * mm + (i % 3) * 55 * mm
        yy = y - (i // 3) * 8 * mm
        text(c, xx, yy, f"{z(n)}:", 10)
        answer(c, xx + 24 * mm, yy, 14 * mm, sol, a)
    footer_note(c, sol, 2)
    c.showPage()


# =====================================================================
# Blatt 2: Zahlen bilden (Lernziel 4)
# =====================================================================
CARDS_A = "471923"
CARDS_B = "86300"
RIDDLES = [
    ("a) Meine Zahl hat 3 HT, 5 T, 7 H und 1 E. Alle anderen Stellen sind 0.",
     lambda n: digits_of(n) == {"M": 0, "HT": 3, "ZT": 0, "T": 5, "H": 7, "Z": 0, "E": 1}, range(100_000, 1_000_000)),
    ("b) Meine Zahl hat 5 Stellen. An der Zehntausenderstelle steht 4. Die Ziffer an der Einerstelle ist doppelt "
     "so gross wie die Ziffer an der Zehntausenderstelle. Alle anderen Ziffern sind 2.",
     lambda n: (lambda d: d["ZT"] == 4 and d["E"] == 2 * d["ZT"] and d["T"] == d["H"] == d["Z"] == 2)(digits_of(n)),
     range(10_000, 100_000)),
    ("c) Meine Zahl liegt zwischen 600 000 und 700 000. Alle Ziffern ausser der ersten sind gleich. "
     "Wenn du alle Ziffern zusammenzählst, gibt es 11.",
     lambda n: 600_000 < n < 700_000 and len(set(str(n)[1:])) == 1 and sum(map(int, str(n))) == 11,
     range(600_001, 700_000)),
]
ORDER_NUMS = [405_300, 45_030, 450_300, 40_530, 405_030, 54_030]
COMPARE = [(99_999, "100 000", 100_000), (307_040, "307 400", 307_400),
           ("8 ZT", "80 000", None), ("5 HT", "50 ZT", None)]


def all_numbers(cards):
    return sorted({int("".join(p)) for p in permutations(cards) if p[0] != "0"})


def card_row(c, x, y, cards, size=9 * mm):
    for i, d in enumerate(cards):
        cx = x + i * (size + 2.5 * mm)
        c.setFillColor(white); c.setStrokeColor(INK); c.setLineWidth(1)
        c.roundRect(cx, y - size, size, size * 1.2, 1.5 * mm, stroke=1, fill=1)
        ctext(c, cx + size / 2, y - size + 3 * mm, d, 15, "Sans-Bold")


def cmp_sign(a, b):
    return "<" if a < b else ">" if a > b else "="


def term_value(t):
    if isinstance(t, int):
        return t
    if isinstance(t, str) and t.split()[-1] in VALUE and len(t.split()) == 2:
        k, a = t.split()
        return int(k) * VALUE[a]
    return int(t.replace(" ", ""))


def b2_page1(c, sol):
    header(c, "Übungsblatt 2", "Zahlen bilden · ca. 15 Minuten · Seite 1", name_fields=not sol)
    y = PAGE_H - 37 * mm
    y = merkkasten(c, y, 38 * mm, "Merke: Ziffern und Zahlen", [
        "Ziffern sind die 10 Zeichen 0, 1, 2, 3, 4, 5, 6, 7, 8 und 9. Aus Ziffern bildest du Zahlen.",
        "Grösste Zahl: Stelle die grösste Ziffer ganz nach vorne, dann die nächstgrösste und so weiter.",
        "Kleinste Zahl: Stelle die kleinste Ziffer ganz nach vorne. Achtung: Die 0 darf nie ganz vorne stehen.",
        "Gerade Zahlen enden mit 0, 2, 4, 6 oder 8. Ungerade Zahlen enden mit 1, 3, 5, 7 oder 9.",
    ])
    nums = all_numbers(CARDS_A)
    even = [n for n in nums if n % 2 == 0]
    target = 500_000
    closest = min(nums, key=lambda n: abs(n - target))
    assert sum(abs(n - target) == abs(closest - target) for n in nums) == 1
    qa = [("a) Bilde die grösste Zahl.", max(nums)),
          ("b) Bilde die kleinste Zahl.", min(nums)),
          ("c) Bilde die grösste gerade Zahl.", max(even)),
          ("d) Bilde die kleinste gerade Zahl.", min(even)),
          (f"e) Bilde die Zahl, die am nächsten bei 500{NB}000 liegt.", closest)]
    assert len({v for _, v in qa}) == len(qa), qa
    y = task_head(c, y, 1, "Zahlen aus 6 Ziffernkarten",
                  "Du hast diese 6 Ziffernkarten. Bilde damit sechsstellige Zahlen. Brauche jede Karte genau einmal.",
                  [4])
    card_row(c, L + 9 * mm, y + 2 * mm, CARDS_A)
    y -= 14 * mm
    for q, v in qa:
        text(c, L + 9 * mm, y, q, 10)
        answer(c, R - 40 * mm, y, 40 * mm, sol, z(v))
        y -= 8.5 * mm
    if sol:
        text(c, L + 9 * mm, y + 2 * mm, f"Tipp e): Mit 4 vorne ist die grösste Zahl {z(closest)}. Mit 7 vorne ist die "
             f"kleinste {z(min(n for n in nums if n > target))}. {z(closest)} ist näher bei 500{NB}000.", 8, "Sans", SOL)
        y -= 4 * mm
    y -= 4 * mm

    numsb = all_numbers(CARDS_B)
    over = min(n for n in numsb if n > 50_000)
    qb = [("a) Bilde die grösste Zahl.", max(numsb)),
          ("b) Bilde die kleinste Zahl. Achtung: Die 0 darf nicht vorne stehen.", min(numsb)),
          (f"c) Bilde die kleinste Zahl, die grösser als 50{NB}000 ist.", over)]
    assert len({v for _, v in qb}) == len(qb)
    y = task_head(c, y, 2, "Zahlen aus 5 Ziffernkarten mit zwei Nullen",
                  "Du hast diese 5 Ziffernkarten. Bilde damit fünfstellige Zahlen. Brauche jede Karte genau einmal.", [4])
    card_row(c, L + 9 * mm, y + 2 * mm, CARDS_B)
    y -= 14 * mm
    for q, v in qb:
        text(c, L + 9 * mm, y, q, 10)
        answer(c, R - 40 * mm, y, 40 * mm, sol, z(v))
        y -= 8.5 * mm
    footer_note(c, sol, 1)
    c.showPage()


def b2_page2(c, sol):
    header(c, "Übungsblatt 2", "Zahlen bilden · ca. 15 Minuten · Seite 2", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 3, "Rätselzahlen",
                  "Lies jeden Hinweis genau. Finde die Zahl und schreibe sie auf.", [2, 4])
    for q, test, rng in RIDDLES:
        hits = [n for n in rng if test(n)]
        assert len(hits) == 1, (q, hits[:5])
        y = wrap(c, L + 9 * mm, y, q, W - 9 * mm, 10) - 1 * mm
        text(c, L + 13 * mm, y, "Meine Zahl:", 9.5, "Sans", MUTED)
        answer(c, L + 35 * mm, y, 36 * mm, sol, z(hits[0]))
        y -= 10 * mm
    y -= 2 * mm

    y = task_head(c, y, 4, "Zahlen ordnen",
                  "Ordne die 6 Zahlen der Grösse nach. Beginne mit der kleinsten Zahl. Schreibe das Zeichen < zwischen die Zahlen.",
                  [4])
    text(c, L + 9 * mm, y, "   ".join(z(n) for n in ORDER_NUMS), 11, "Sans-Bold")
    y -= 10 * mm
    srt = sorted(ORDER_NUMS)
    bw = (W - 9 * mm) / 6
    for i in range(6):
        xx = L + 9 * mm + i * bw
        answer(c, xx, y, bw - 7 * mm, sol, z(srt[i]), 9.5)
        if i < 5:
            text(c, xx + bw - 5.5 * mm, y, "<", 11, "Sans-Bold")
    y -= 14 * mm

    y = task_head(c, y, 5, "Zahlen vergleichen",
                  "Setze das richtige Zeichen ein: < (kleiner als), > (grösser als) oder = (gleich gross).", [2, 4])
    for i, (a, b_txt, b) in enumerate(COMPARE):
        va = term_value(a)
        vb = term_value(b if b is not None else b_txt)
        left = z(a) if isinstance(a, int) else a.replace(" ", NB)
        xx = L + 9 * mm + (i % 2) * 85 * mm
        yy = y - (i // 2) * 10 * mm
        text(c, xx, yy, left, 11)
        bx = xx + 28 * mm
        c.setStrokeColor(INK); c.setLineWidth(0.7)
        c.rect(bx, yy - 2 * mm, 7 * mm, 7 * mm, stroke=1, fill=0)
        if sol:
            ctext(c, bx + 3.5 * mm, yy, cmp_sign(va, vb), 12, "Sans-Bold", SOL)
        text(c, bx + 11 * mm, yy, b_txt.replace(" ", NB), 11)
    y -= 2 * 10 * mm + 4 * mm
    if sol:
        y = wrap(c, L, y, f"Hilfe: 8{NB}ZT = 80{NB}000.  5{NB}HT = 500{NB}000 und 50{NB}ZT = 500{NB}000.", W, 8.5,
                 color=SOL) - 3 * mm
    footer_note(c, sol, 2)
    c.showPage()


# =====================================================================
# Blatt 3: Zählen und Rechnen (Lernziele 5, 6)
# =====================================================================
FORWARD = [(995_000, 1_000), (299_700, 100), (750_000, 50_000)]
BACKWARD = [(1_000_000, 10_000), (403_000, 1_000), (525_000, 25_000)]
RULE = [120_000, 145_000, 170_000, 195_000]
NEIGHBOURS = [400_000, 99_999, 50_909]
HEAD_CALC = [(340_000, "+", 60_000), (1_000_000, "−", 250_000), (703_000, "−", 5_000), (45_600, "+", 400),
             (999_999, "+", 1), (500_000, "−", 1)]
WRITTEN = [(245_386, "+", 371_548), (700_000, "−", 238_465)]
WORD = [
    ("Ein Verein sammelt Geld. Sein Ziel sind 1 000 000 Franken. Bis jetzt hat er 785 400 Franken gesammelt. "
     "Wie viele Franken fehlen noch?", 1_000_000 - 785_400, "Franken"),
]


def calc(a, op, b):
    return a + b if op == "+" else a - b


def seq_row(c, x, y, start, step, sol, count=6, bw=27 * mm):
    vals = [start + k * step for k in range(count)]
    assert all(0 <= v <= 1_000_000 for v in vals), vals
    for k, v in enumerate(vals):
        xx = x + k * bw
        if k == 0:
            text(c, xx, y, z(v), 9.5, "Sans-Bold")
        else:
            answer(c, xx, y, bw - 4 * mm, sol, z(v), 9)
    return vals


def b3_page1(c, sol):
    header(c, "Übungsblatt 3", "Zählen und Rechnen · ca. 20 Minuten · Seite 1", name_fields=not sol)
    y = PAGE_H - 37 * mm
    y = merkkasten(c, y, 27 * mm, "Merke: in Schritten zählen", [
        "Vorwärts zählen: Du rechnest immer gleich viel dazu. Rückwärts zählen: Du rechnest immer gleich viel weg.",
        f"Achtung bei den Übergängen: 299{NB}900 + 100 = 300{NB}000 und 990{NB}000 + 10{NB}000 = 1{NB}000{NB}000.",
    ])
    y = task_head(c, y, 1, "Vorwärts zählen",
                  "Zähle in Schritten vorwärts. Die Schrittgrösse steht links. Schreibe die nächsten 5 Zahlen auf.", [5])
    for i, (s, st) in enumerate(FORWARD):
        text(c, L + 9 * mm, y, f"{'abcd'[i]})  +{z(st)}", 9.5, "Sans-Bold", FIG)
        seq_row(c, L + 33 * mm, y, s, st, sol)
        y -= 9 * mm
    y -= 4 * mm
    y = task_head(c, y, 2, "Rückwärts zählen",
                  "Zähle in Schritten rückwärts. Die Schrittgrösse steht links. Schreibe die nächsten 5 Zahlen auf.", [5])
    for i, (s, st) in enumerate(BACKWARD):
        text(c, L + 9 * mm, y, f"{'abcd'[i]})  −{z(st)}", 9.5, "Sans-Bold", FIG)
        seq_row(c, L + 33 * mm, y, s, -st, sol)
        y -= 9 * mm
    y -= 4 * mm
    step = RULE[1] - RULE[0]
    assert all(RULE[k + 1] - RULE[k] == step for k in range(3))
    y = task_head(c, y, 3, "Die Regel finden",
                  "Wie gross ist der Schritt? Schreibe die Regel auf. Zähle dann 2 Zahlen weiter.", [5])
    text(c, L + 9 * mm, y, ",   ".join(z(n) for n in RULE) + ",", 10.5, "Sans-Bold")
    xx = L + 9 * mm + pdfmetrics.stringWidth(",   ".join(z(n) for n in RULE) + ",", "Sans-Bold", 10.5) + 3 * mm
    answer(c, xx, y, 24 * mm, sol, z(RULE[-1] + step), 9.5)
    answer(c, xx + 28 * mm, y, 24 * mm, sol, z(RULE[-1] + 2 * step), 9.5)
    y -= 8 * mm
    text(c, L + 9 * mm, y, "Regel:", 10)
    answer(c, L + 23 * mm, y, 30 * mm, sol, f"+{NB}{z(step)}")
    y -= 12 * mm
    y = task_head(c, y, 4, "Nachbarzahlen",
                  "Schreibe die Zahl davor (1 weniger) und die Zahl danach (1 mehr) auf.", [5])
    text(c, L + 9 * mm, y, "Zahl davor", 8.5, "Sans-Bold", MUTED)
    text(c, L + 64 * mm, y, "Zahl", 8.5, "Sans-Bold", MUTED)
    text(c, L + 104 * mm, y, "Zahl danach", 8.5, "Sans-Bold", MUTED)
    y -= 7.5 * mm
    for n in NEIGHBOURS:
        answer(c, L + 9 * mm, y, 40 * mm, sol, z(n - 1))
        text(c, L + 64 * mm, y, z(n), 11, "Sans-Bold")
        answer(c, L + 104 * mm, y, 40 * mm, sol, z(n + 1))
        y -= 8 * mm
    footer_note(c, sol, 1)
    c.showPage()


def written_grid(c, x, y_top, a, op, b, sol, cols=8):
    """Häuschen für das schriftliche Rechnen. Zahlen rechtsbündig, Ergebniszeile leer."""
    cell = 6 * mm
    res = calc(a, op, b)
    rows = [str(a), str(b), str(res)]
    c.setStrokeColor(HexColor("#c4d3ea")); c.setLineWidth(0.35)
    for i in range(cols + 1):
        c.line(x + i * cell, y_top, x + i * cell, y_top - 4 * cell)
    for j in range(5):
        c.line(x, y_top - j * cell, x + cols * cell, y_top - j * cell)
    c.setStrokeColor(INK); c.setLineWidth(1.2)
    c.line(x, y_top - 2 * cell - 0.6 * cell, x + cols * cell, y_top - 2 * cell - 0.6 * cell)
    ctext(c, x + cell / 2, y_top - 2 * cell + 1.6 * mm, op, 12, "Sans-Bold")
    for r, s in enumerate(rows):
        if r == 2 and not sol:
            continue
        rr = r if r < 2 else 2.9
        for k, ch in enumerate(reversed(s)):
            ctext(c, x + (cols - 1 - k) * cell + cell / 2, y_top - rr * cell - 4.4 * mm, ch, 12,
                  "Sans-Bold", SOL if r == 2 else INK)
    return res


def b3_page2(c, sol):
    header(c, "Übungsblatt 3", "Zählen und Rechnen · ca. 20 Minuten · Seite 2", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 5, "Im Kopf rechnen", "Rechne im Kopf. Schreibe das Ergebnis auf.", [6])
    for i, (a, op, b) in enumerate(HEAD_CALC):
        res = calc(a, op, b)
        assert 0 <= res <= 1_000_000
        xx = L + 9 * mm + (i % 2) * 85 * mm
        yy = y - (i // 2) * 8.5 * mm
        lbl = f"{z(a)} {op} {z(b)} ="
        text(c, xx, yy, lbl, 10)
        answer(c, xx + pdfmetrics.stringWidth(lbl, "Sans", 10) + 2 * mm, yy, 26 * mm, sol, z(res))
    y -= ((len(HEAD_CALC) + 1) // 2) * 8.5 * mm + 4 * mm

    y = task_head(c, y, 6, "Schriftlich rechnen",
                  "Rechne schriftlich. Die Zahlen stehen schon richtig untereinander: Einer unter Einern, Zehner unter Zehnern.  "
                  "Vergiss die Überträge nicht.", [6])
    for i, (a, op, b) in enumerate(WRITTEN):
        gx = L + 16 * mm + (i % 2) * 85 * mm
        gy = y - 2 * mm - (i // 2) * 30 * mm
        text(c, gx - 7 * mm, gy - 4.4 * mm, f"{'abcd'[i]})", 9.5, "Sans-Bold", FIG)
        res = written_grid(c, gx, gy, a, op, b, sol)
        assert 0 <= res <= 1_000_000
    y -= ((len(WRITTEN) + 1) // 2) * 30 * mm + 4 * mm

    y = task_head(c, y, 7, "Textaufgabe",
                  "Lies die Aufgabe genau. Schreibe die Rechnung auf. Schreibe dann einen Antwortsatz.", [6])
    for q, res, unit in WORD:
        y = wrap(c, L + 9 * mm, y, q.replace("1 000 000", f"1{NB}000{NB}000").replace("384 250", f"384{NB}250")
                 .replace("12 750", f"12{NB}750").replace("785 400", f"785{NB}400"), W - 9 * mm, 10) - 1.5 * mm
        text(c, L + 9 * mm, y, "Rechnung:", 9.5, "Sans", MUTED)
        rech = (f"384{NB}250 + 12{NB}750 = {z(res)}" if unit == "Einwohner"
                else f"1{NB}000{NB}000 − 785{NB}400 = {z(res)}")
        answer(c, L + 30 * mm, y, 90 * mm, sol, rech)
        y -= 8 * mm
        text(c, L + 9 * mm, y, "Antwort:", 9.5, "Sans", MUTED)
        ans = (f"Die Stadt hat jetzt {z(res)} Einwohner." if unit == "Einwohner"
               else f"Es fehlen noch {z(res)} Franken.")
        answer(c, L + 30 * mm, y, W - 30 * mm, sol, ans)
        y -= 9 * mm
    footer_note(c, sol, 2)
    c.showPage()


# =====================================================================
# Abschlusstest (alle Lernziele, neue Zahlen), ca. 20 Minuten
# =====================================================================
T_ORDER = ["Zehntausender", "Einer", "Millionen", "Hunderter", "Hunderttausender", "Zehner", "Tausender"]
T_VALUES = ["ZT", "HT", "M"]
T_COMPOSE = [[("HT", 7), ("ZT", 3), ("E", 5)], [("T", 2), ("Z", 6)], [("Z", 9), ("HT", 1), ("H", 4)],
             [("ZT", 5), ("E", 5)]]
T_DECOMPOSE = 603_080
T_WRITE = [206_040, 90_007, 800_500]
T_READ = [502_060, 70_009]
T_CARDS = "508261"
T_RIDDLE = ("Meine Zahl liegt zwischen 20 000 und 30 000. An der Tausender-, der Hunderter-, der Zehner- "
            "und der Einerstelle steht immer die Ziffer 5.",
            lambda n: 20_000 < n < 30_000 and str(n)[1:] == "5555", range(20_001, 30_000))
T_FORWARD = (698_000, 1_000)
T_BACKWARD = (1_000_000, 50_000)
T_NEIGHBOUR = 299_999
T_HEAD = [(600_000, "+", 400_000), (1_000_000, "−", 1), (350_000, "−", 50_000), (99_990, "+", 10)]
T_WRITTEN = [(347_589, "+", 268_734), (900_000, "−", 356_718)]
T_POINTS = {1: 3, 2: 8, 3: 5, 4: 5, 5: 8, 6: 8}   # Aufgabe = Lernziel
T_TOTAL = sum(T_POINTS.values())


def t_head(c, y, nr, title, instruction):
    y2 = task_head(c, y, nr, title, instruction, [nr])
    text(c, R - 22 * mm, y, f"____ / {T_POINTS[nr]} P.", 9.5, "Sans", MUTED)
    return y2


def test_page1(c, sol):
    header(c, "Abschlusstest", "Stellenwerte, Ziffern und Zahlen · ca. 20 Minuten · Seite 1", name_fields=not sol)
    y = PAGE_H - 38 * mm
    y = t_head(c, y, 1, "Die Stellen der Reihe nach",
               "Ordne die Namen der Stellen. Schreibe sie in der richtigen Reihenfolge auf. Beginne bei den Einern.")
    text(c, L + 9 * mm, y, ",  ".join(T_ORDER), 9.5, "Sans-Bold")
    y -= 8 * mm
    names = [n for _, n, _ in reversed(PLACES)]
    assert sorted(names) == sorted(T_ORDER)
    bw = (W - 9 * mm) / 3
    for i, n in enumerate(names):
        xx, yy = L + 9 * mm + (i % 3) * bw, y - (i // 3) * 8.5 * mm
        text(c, xx, yy, f"{i + 1}.", 9.5, "Sans-Bold", FIG)
        answer(c, xx + 6 * mm, yy, bw - 10 * mm, sol, n, 9.5)
    y -= 3 * 8.5 * mm + 4 * mm

    y = t_head(c, y, 2, "Werte und Zahlen zusammensetzen",
               "a) Schreibe den Wert der Stelle als Zahl auf.  "
               "b) Setze die Zahl aus den Teilen zusammen. Schreibe sie mit Ziffern auf.  "
               "c) Zerlege die Zahl in ihre Stellen. Schreibe nur die Stellen auf, die nicht 0 sind.")
    text(c, L + 9 * mm, y, "a)", 10, "Sans-Bold", FIG)
    for i, a in enumerate(T_VALUES):
        xx = L + 17 * mm + i * 55 * mm
        text(c, xx, y, f"1{NB}{a} =", 10)
        answer(c, xx + 15 * mm, y, 28 * mm, sol, z(VALUE[a]))
    y -= 9 * mm
    text(c, L + 9 * mm, y, "b)", 10, "Sans-Bold", FIG)
    half = (W - 17 * mm) / 2
    for i, parts in enumerate(T_COMPOSE):
        xx, yy = L + 17 * mm + (i % 2) * half, y - (i // 2) * 8.5 * mm
        desc = ", ".join(f"{d}{NB}{a}" for a, d in parts[:-1]) + f" und {parts[-1][1]}{NB}{parts[-1][0]} ="
        text(c, xx, yy, desc, 10)
        answer(c, xx + pdfmetrics.stringWidth(desc, "Sans", 10) + 2 * mm, yy, 24 * mm, sol, z(compose(parts)))
    y -= 2 * 8.5 * mm + 1 * mm
    text(c, L + 9 * mm, y, "c)", 10, "Sans-Bold", FIG)
    text(c, L + 17 * mm, y, f"{z(T_DECOMPOSE)} =", 10)
    answer(c, L + 40 * mm, y, 80 * mm, sol, parts_of(T_DECOMPOSE))
    y -= 12 * mm

    y = t_head(c, y, 3, "Stellenwerttabelle",
               "a) Schreibe die Zahlen in die Stellenwerttabelle. Schreibe in jedes Feld genau eine Ziffer.  "
               "b) Lies die Zahlen in der Tabelle. Schreibe sie rechts mit Ziffern auf.")
    cw = 13 * mm
    rows = len(T_WRITE) + len(T_READ)
    for i in range(rows):
        yy = y - 12.6 * mm - i * 8 * mm
        if i == 0 or i == len(T_WRITE):
            text(c, L + 9 * mm, yy, "a)" if i == 0 else "b)", 10, "Sans-Bold", FIG)
        if i < len(T_WRITE):
            text(c, L + 16 * mm, yy, z(T_WRITE[i]), 10, "Sans-Bold")
    given = [None] * len(T_WRITE) + [{a: str(v) for a, v in table_digits(n).items()} for n in T_READ]
    solu = [{a: str(v) for a, v in table_digits(n).items()} for n in T_WRITE] + [None] * len(T_READ)
    x0 = L + 42 * mm
    top = y
    place_table(c, x0, y, cw, rows, sol, solutions=solu, given=given)
    for i, n in enumerate(T_READ):
        answer(c, x0 + 7 * cw + 6 * mm, top - 12.6 * mm - (len(T_WRITE) + i) * 8 * mm, 30 * mm, sol, z(n))
    footer_note(c, sol, 1)
    c.showPage()


def test_page2(c, sol):
    header(c, "Abschlusstest", "Stellenwerte, Ziffern und Zahlen · Seite 2", name_fields=False)
    y = PAGE_H - 38 * mm
    nums = all_numbers(T_CARDS)
    odd = [n for n in nums if n % 2]
    closest = min(nums, key=lambda n: abs(n - 600_000))
    assert sum(abs(n - 600_000) == abs(closest - 600_000) for n in nums) == 1
    hits = [n for n in T_RIDDLE[2] if T_RIDDLE[1](n)]
    assert len(hits) == 1
    qa = [("a) Bilde die grösste Zahl.", max(nums)), ("b) Bilde die kleinste Zahl.", min(nums)),
          ("c) Bilde die grösste ungerade Zahl.", max(odd)),
          (f"d) Bilde die Zahl, die am nächsten bei 600{NB}000 liegt.", closest)]
    assert len({v for _, v in qa}) == 4
    y = t_head(c, y, 4, "Zahlen bilden",
               "a) bis d): Bilde mit diesen 6 Ziffernkarten sechsstellige Zahlen. Brauche jede Karte genau einmal.  "
               "e) Löse die Rätselzahl.")
    card_row(c, L + 9 * mm, y + 2 * mm, T_CARDS, size=8 * mm)
    y -= 12 * mm
    for q, v in qa:
        text(c, L + 9 * mm, y, q, 10)
        answer(c, R - 38 * mm, y, 38 * mm, sol, z(v))
        y -= 8 * mm
    y = wrap(c, L + 9 * mm, y, "e) " + T_RIDDLE[0].replace("20 000", f"20{NB}000").replace("30 000", f"30{NB}000"),
             W - 52 * mm, 10)
    answer(c, R - 38 * mm, y + 4.5 * mm, 38 * mm, sol, z(hits[0]))
    y -= 7 * mm

    y = t_head(c, y, 5, "In Schritten zählen",
               "a) Zähle vorwärts. Schreibe die nächsten 3 Zahlen auf.  b) Zähle rückwärts. Schreibe die nächsten 3 Zahlen auf.  "
               "c) Schreibe die Zahl davor (1 weniger) und die Zahl danach (1 mehr) auf.")
    for lbl, (st, step) in (("a)", T_FORWARD), ("b)", (T_BACKWARD[0], -T_BACKWARD[1]))):
        text(c, L + 9 * mm, y, f"{lbl}  {'+' if step > 0 else '−'}{z(abs(step))}", 9.5, "Sans-Bold", FIG)
        seq_row(c, L + 40 * mm, y, st, step, sol, count=4, bw=32 * mm)
        y -= 9 * mm
    text(c, L + 9 * mm, y, "c)", 9.5, "Sans-Bold", FIG)
    answer(c, L + 20 * mm, y, 34 * mm, sol, z(T_NEIGHBOUR - 1))
    text(c, L + 62 * mm, y, z(T_NEIGHBOUR), 11, "Sans-Bold")
    answer(c, L + 90 * mm, y, 34 * mm, sol, z(T_NEIGHBOUR + 1))
    y -= 10 * mm

    y = t_head(c, y, 6, "Rechnen",
               "a) Rechne im Kopf.  b) Rechne schriftlich. Die Zahlen stehen schon richtig untereinander.")
    for i, (a, op, b) in enumerate(T_HEAD):
        res = calc(a, op, b)
        assert 0 <= res <= 1_000_000
        xx = L + 9 * mm + (i % 2) * 85 * mm
        yy = y - (i // 2) * 8.5 * mm
        lbl = f"{'a) ' if i == 0 else ''}{z(a)} {op} {z(b)} ="
        text(c, xx if i == 0 else xx + (6 * mm if i == 2 else 0), yy, lbl, 10)
        x_ans = (xx if i == 0 else xx + (6 * mm if i == 2 else 0)) + pdfmetrics.stringWidth(lbl, "Sans", 10) + 2 * mm
        answer(c, x_ans, yy, 24 * mm, sol, z(res))
    y -= 2 * 8.5 * mm + 2 * mm
    text(c, L + 9 * mm, y - 4.4 * mm, "b)", 10, "Sans-Bold", FIG)
    for i, (a, op, b) in enumerate(T_WRITTEN):
        res = written_grid(c, L + 18 * mm + i * 85 * mm, y, a, op, b, sol)
        assert 0 <= res <= 1_000_000
    y -= 4 * 6 * mm + 5 * mm

    bx, bw2, bh2 = R - 66 * mm, 66 * mm, 11 * mm
    c.setStrokeColor(INK); c.setLineWidth(1)
    c.roundRect(bx, y - bh2, bw2, bh2, 3 * mm, stroke=1, fill=0)
    text(c, bx + 4 * mm, y - bh2 + 4 * mm, f"Total:  ______ / {T_TOTAL} Punkte", 11, "Sans-Bold")
    if sol:
        yy = y - 3 * mm
        text(c, L, yy, "Bewertung", 10, "Sans-Bold", SOL)
        yy -= 4.5 * mm
        for line in ["Punkte je Aufgabe (Aufgabe = Lernziel): " + " · ".join(f"{k}: {v}" for k, v in T_POINTS.items()),
                     "Aufgabe 1: alles richtig 3 P., 1 Fehler 2 P., 2 Fehler 1 P.",
                     "Aufgabe 6b: je 2 P. (1 P. bei nur einer falschen Ziffer). Alle anderen Lücken: je 1 P.",
                     f"Richtwert: ab {round(T_TOTAL * .9)} P. sehr gut · ab {round(T_TOTAL * .75)} P. gut · "
                     f"ab {round(T_TOTAL * .6)} P. Lernziele erreicht."]:
            yy = wrap(c, L, yy, line, W - 72 * mm, 8, color=SOL)
        assert yy > 14 * mm, yy / mm
    footer_note(c, sol, 2)
    c.showPage()


PLAN = [
    ("0–25 Min.", "Übungsblatt 1: Stellenwerte",
     "Zuerst den Merkkasten gemeinsam lesen. Nach jeder Aufgabe kurz mit dem Lösungsblatt vergleichen."),
    ("25–40 Min.", "Übungsblatt 2: Zahlen bilden",
     "Den Merkkasten laut lesen lassen. Bei Aufgabe 1 die Ziffernkarten auf dem Tisch legen lassen hilft sehr."),
    ("40–60 Min.", "Übungsblatt 3: Zählen und Rechnen",
     "Bei den Übergängen (z. B. 299 900 → 300 000) genau hinschauen. Schriftlich: Überträge klein notieren."),
    ("60–65 Min.", "Kurze Pause", "Etwas trinken, bewegen."),
    ("65–85 Min.", "Abschlusstest", "Allein lösen, ohne Hilfe und ohne Merkkasten. Danach mit dem Lösungsblatt korrigieren."),
    ("85–90 Min.", "Test besprechen", "Pro Aufgabe = Lernziel: Was hat geklappt? Was üben wir vor dem 12.11. noch einmal?"),
]
SHORT = ("Wenn die Zeit knapp wird: Blatt 1 Aufgabe 2 nur mündlich lösen. Blatt 2 Aufgabe 5 weglassen. "
         "Blatt 3 nur eine schriftliche Rechnung lösen. Der Test sollte immer ganz gemacht werden.")


def ablauf(c):
    header(c, "Ablaufplan: 90 Minuten", "Stellenwerte, Ziffern und Zahlen · Für die Lehrperson", name_fields=False)
    y = PAGE_H - 40 * mm
    for zeit, was, tipp in PLAN:
        c.setFillColor(SOFT)
        c.roundRect(L, y - 15 * mm, W, 17 * mm, 2 * mm, stroke=0, fill=1)
        text(c, L + 3 * mm, y - 4 * mm, zeit, 10.5, "Sans-Bold", FIG)
        text(c, L + 32 * mm, y - 4 * mm, was, 10.5, "Sans-Bold")
        wrap(c, L + 32 * mm, y - 9.5 * mm, tipp.replace("299 900", f"299{NB}900").replace("300 000", f"300{NB}000"),
             W - 36 * mm, 8.5, color=MUTED)
        y -= 20 * mm
    y = wrap(c, L, y - 2 * mm, SHORT, W, 9.5) - 6 * mm
    text(c, L, y, "Lernziele der Lernzielkontrolle 3 (Test am 12.11.2026)", 11, "Sans-Bold")
    y -= 6 * mm
    where = {1: "Blatt 1 (Aufg. 1), Test 1", 2: "Blatt 1 (Aufg. 2–4, 7), Test 2", 3: "Blatt 1 (Aufg. 5–7), Test 3",
             4: "Blatt 2, Test 4", 5: "Blatt 3 (Aufg. 1–4), Test 5", 6: "Blatt 3 (Aufg. 5–7), Test 6"}
    for g, txt in GOALS.items():
        yy = wrap(c, L + 6 * mm, y, txt, W - 70 * mm, 8.5)
        text(c, L, y, f"{g}.", 8.5, "Sans-Bold", FIG)
        text(c, R - 58 * mm, y, where[g], 8, "Sans", MUTED)
        y = yy - 2.5 * mm
    c.showPage()


SHEETS = [
    ("blatt1-stellenwerte", "Übungsblatt 1: Stellenwerte", [b1_page1, b1_page2]),
    ("blatt2-zahlen-bilden", "Übungsblatt 2: Zahlen bilden", [b2_page1, b2_page2]),
    ("blatt3-zaehlen-rechnen", "Übungsblatt 3: Zählen und Rechnen", [b3_page1, b3_page2]),
    ("abschlusstest", "Abschlusstest: Stellenwerte, Ziffern und Zahlen", [test_page1, test_page2]),
]


def build():
    for stem, title, pages in SHEETS:
        for sol in (False, True):
            out = OUT_DIR / (stem + ("-loesungen" if sol else "") + ".pdf")
            c = canvas.Canvas(str(out), pagesize=A4)
            c.setTitle(title + (" – Lösungen" if sol else ""))
            for p in pages:
                p(c, sol)
            c.save()
            print(out)
    out = OUT_DIR / "ablaufplan-90-minuten.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle("Ablaufplan: 90 Minuten")
    ablauf(c)
    c.save()
    print(out)


if __name__ == "__main__":
    build()
