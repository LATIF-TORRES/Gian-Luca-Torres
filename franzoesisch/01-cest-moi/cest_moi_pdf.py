"""Französisch, Mille feuilles 4.1 «C'est moi»: Übungsblatt und Lernkontrolle mit Lösungsblättern.

Aufruf:  python3 cest_moi_pdf.py
Ausgabe:
  cest-moi-uebungsblatt.pdf    / cest-moi-uebungsblatt-loesungen.pdf
  cest-moi-lernkontrolle.pdf   / cest-moi-lernkontrolle-loesungen.pdf

Lernziele (Blatt der Lehrperson):
  1. Wörtli S. 51 lesen, verstehen und richtig schreiben
  2. Wörtli von Französisch in Deutsch übersetzen und umgekehrt
  3. Wörtli S. 51 richtig aussprechen
  4. mon, ma, mes / ton, ta, tes / son, sa, ses richtig anwenden
  5. Die Kinder und ihre Hobbys aus dem magazine 4.1 kennen

Alle Lösungen werden aus denselben Daten berechnet wie die Aufgaben (Wortliste, Geschlecht der Nomen,
Regel für mon/ma/mes). Das Übungsblatt steigert sich: Stufe 1 (leicht), Stufe 2 (mittel), Königsdisziplin.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "deutschkurs" / "vorlagen"))

from blatt import (BOTTOM, FIG, INK, L, MUTED, NB, PAGE_H, R, SOL, W, answer, build_pdf, checkbox,  # noqa: E402
                   ctext, footer_note, header, hline, merkkasten, mm, pdfmetrics, task_head, text, word_bank,
                   wrap, write_lines, HexColor, white)

OUT_DIR = Path(__file__).parent
SUB = "Französisch · Mille feuilles 4.1 · C'est moi"

GOALS = {1: "Wörter S. 51 lesen, verstehen, schreiben", 2: "Übersetzen Französisch ↔ Deutsch",
         3: "Aussprache", 4: "mon, ma, mes · ton, ta, tes · son, sa, ses", 5: "Kinder und Hobbys aus dem magazine"}


def goal(*nums):
    return "Lernziel " + ", ".join(f"{n} ({GOALS[n]})" for n in nums)


# ---------------------------------------------------------------------------
# Wortliste Seite 51 (Wort mit Begleiter, Deutsch, Geschlecht: m, f oder pl)
# ---------------------------------------------------------------------------
BODY = {
    "tête": ("la tête", "der Kopf", "f"),
    "cheveux": ("les cheveux", "die Haare", "pl"),
    "yeux": ("les yeux", "die Augen", "pl"),
    "nez": ("le nez", "die Nase", "m"),
    "oreille": ("l'oreille", "das Ohr", "f"),
    "bouche": ("la bouche", "der Mund", "f"),
    "cou": ("le cou", "der Hals", "m"),
    "bras": ("le bras", "der Arm", "m"),
    "main": ("la main", "die Hand", "f"),
    "doigt": ("le doigt", "der Finger", "m"),
    "ventre": ("le ventre", "der Bauch", "m"),
    "jambe": ("la jambe", "das Bein", "f"),
    "genou": ("le genou", "das Knie", "m"),
    "pied": ("le pied", "der Fuss", "m"),
}
HOBBY = {
    "voile": ("la voile", "das Segeln"),
    "gym": ("la gymnastique", "das Turnen"),
    "athle": ("l'athlétisme", "die Leichtathletik"),
    "rando": ("faire de la randonnée", "wandern"),
    "equi": ("faire de l'équitation", "reiten"),
    "photos": ("prendre des photos", "fotografieren"),
    "cartes": ("jouer aux cartes", "Karten spielen"),
    "console": ("jouer à la console", "gamen"),
    "piano": ("jouer du piano", "Klavier spielen"),
    "guitare": ("jouer de la guitare", "Gitarre spielen"),
    "batterie": ("jouer de la batterie", "Schlagzeug spielen"),
    "escalade": ("l'escalade", "das Klettern"),
    "bricoler": ("bricoler", "basteln"),
    "patinage": ("le patinage", "das Schlittschuhlaufen"),
    "luge": ("la luge", "das Schlitteln"),
    "dessiner": ("dessiner", "zeichnen"),
}
SENT = {
    "passion": ("J'ai une passion.", "Ich habe ein allergrösstes Hobby."),
    "bike": ("J'aime faire du mountain bike.", "Ich mag das Mountainbiken."),
    "patinage": ("J'adore le patinage.", "Ich liebe das Schlittschuhlaufen."),
    "entraine": ("Je m'entraîne.", "Ich trainiere."),
    "escalade": ("J'aime l'escalade.", "Ich mag das Klettern."),
    "luge": ("J'adore la luge.", "Ich liebe das Schlitteln."),
    "dessiner": ("J'aime dessiner.", "Ich mag zeichnen."),
}

# ---------------------------------------------------------------------------
# mon / ma / mes
# ---------------------------------------------------------------------------
POSS = {"je": ("mon", "ma", "mes"), "tu": ("ton", "ta", "tes"), "il": ("son", "sa", "ses")}
VOWELS = "aeiouyhéèêàâîôû"


def poss(person, noun, gender):
    m, f, pl = POSS[person]
    if gender == "pl":
        return pl
    if noun[0].lower() in VOWELS:      # vor einem Vokal immer mon, ton, son (auch weiblich)
        return m
    return m if gender == "m" else f


def fill(sentence, slots):
    """Setzt die Pronomen ein; am Satzanfang (auch nach «) gross."""
    out = sentence
    for person, noun, gender in slots:
        p = poss(person, noun, gender)
        k = out.index("{}")
        if k == 0 or out[:k].rstrip().endswith("«"):
            p = p.capitalize()
        out = out[:k] + p + out[k + 2:]
    return out


# ---------------------------------------------------------------------------
# Die Kinder aus dem magazine 4.1 (S. 12–15)
# ---------------------------------------------------------------------------
KIDS = [
    ("Akim", "Kongo (le Congo)", "Karate (le karaté)"),
    ("Shemsi", "Marokko (le Maroc)", "zeichnen, basteln, reiten"),
    ("Vincent", "Frankreich (la France)", "Steine sammeln, Bogenschiessen"),
    ("Turereura", "Französisch-Polynesien", "tanzen, Blumenkronen machen"),
]
KID_NAMES = [k[0] for k in KIDS]

# ---------------------------------------------------------------------------
# Körper-Zeichnung: Punkte in mm (Ursprung unten in der Mitte), Seite der Beschriftung
# ---------------------------------------------------------------------------
TARGET = {
    "cheveux": (-7, 107.5, "L"), "tête": (7.5, 101, "R"), "yeux": (-4, 96, "L"), "oreille": (12.6, 93.5, "R"),
    "nez": (-0.4, 92.6, "L"), "bouche": (2, 87.2, "R"), "cou": (2, 81, "R"), "bras": (-21.5, 64, "L"),
    "main": (31, 49, "R"), "doigt": (-35, 43.5, "L"), "ventre": (6, 59, "R"), "jambe": (-7.5, 36, "L"),
    "genou": (7.5, 25, "R"), "pied": (-12, 2.5, "L"),
}
SKIN = HexColor("#f6d7b8")
HAIR = HexColor("#8a5a32")
SHIRT = HexColor("#dfe7ff")
PANTS = HexColor("#cfd8e6")


def draw_body(c, ox, oy):
    def P(x, y):
        return ox + x * mm, oy + y * mm

    def poly(pts, fill):
        p = c.beginPath()
        p.moveTo(*P(*pts[0]))
        for q in pts[1:]:
            p.lineTo(*P(*q))
        p.close()
        c.setFillColor(fill)
        c.drawPath(p, stroke=1, fill=1)

    c.setStrokeColor(INK)
    c.setLineWidth(0.8)
    # Beine, Füsse
    for s in (-1, 1):
        poly([(s * 3.5, 46), (s * 11, 46), (s * 10.5, 5), (s * 4.5, 5)], PANTS)
        c.setFillColor(SKIN)
        x0, y0 = P(s * 3.5 if s > 0 else -17.5, 0)
        c.ellipse(x0, y0, x0 + 14 * mm, y0 + 6 * mm, stroke=1, fill=1)
        c.line(*P(s * 5, 25), *P(s * 10, 25))          # Knie
        c.arc(*P(s * 5.2 - 0.2, 23), *P(s * 9.8 + 0.2, 27), 200 if s < 0 else 200, 140)
    # Arme, Hände, Finger
    for s in (-1, 1):
        poly([(s * 13, 79), (s * 14, 70), (s * 28, 50), (s * 34, 53)], SHIRT)
        for ang in (-60, -85, -110, -135):
            import math
            a = math.radians(ang if s > 0 else 180 - ang)
            x1, y1 = 31 * s, 49
            c.setLineWidth(1.6)
            c.line(*P(x1, y1), *P(x1 + 5.2 * math.cos(a), y1 + 5.2 * math.sin(a)))
        c.setLineWidth(0.8)
        c.setFillColor(SKIN)
        c.circle(*P(31 * s, 49), 3.8 * mm, stroke=1, fill=1)
    # Rumpf, Bauchnabel
    c.setFillColor(SHIRT)
    x0, y0 = P(-14, 44)
    c.roundRect(x0, y0, 28 * mm, 36 * mm, 4 * mm, stroke=1, fill=1)
    c.setFillColor(INK)
    c.circle(*P(0, 57), 0.6 * mm, stroke=0, fill=1)
    # Hals
    c.setFillColor(SKIN)
    x0, y0 = P(-3.5, 79)
    c.rect(x0, y0, 7 * mm, 6 * mm, stroke=1, fill=1)
    # Haare, Ohren, Gesicht
    c.setFillColor(HAIR)
    c.circle(*P(0, 97), 12.5 * mm, stroke=1, fill=1)
    c.setFillColor(SKIN)
    for s in (-1, 1):
        c.circle(*P(11.2 * s, 93.5), 2.8 * mm, stroke=1, fill=1)
    c.circle(*P(0, 94), 11 * mm, stroke=1, fill=1)
    c.setFillColor(INK)
    for s in (-1, 1):
        c.circle(*P(4 * s, 96.5), 1.1 * mm, stroke=0, fill=1)
    c.setLineWidth(0.9)
    p = c.beginPath()
    p.moveTo(*P(0.2, 95.5)); p.lineTo(*P(-1.2, 92.4)); p.lineTo(*P(0.8, 92.4))
    c.drawPath(p, stroke=1, fill=0)
    c.arc(*P(-3.6, 85.6), *P(3.6, 90.4), 200, 140)


def body_labels(c, ox, oy, parts, sol, bank=False):
    """Linien von den Körperteilen zu nummerierten Schreiblinien. Gibt die Nummern-Zuordnung zurück."""
    side_items = {"L": [], "R": []}
    for k in parts:
        x, y, s = TARGET[k]
        side_items[s].append([k, x, y, y])
    gap = 9 * mm / mm
    for s, items in side_items.items():
        items.sort(key=lambda t: -t[2])
        for i in range(1, len(items)):
            items[i][3] = min(items[i][3], items[i - 1][3] - gap)
        low = min(t[3] for t in items)
        if low < 1:
            for t in items:
                t[3] += 1 - low
        for i in range(len(items) - 2, -1, -1):
            items[i][3] = max(items[i][3], items[i + 1][3] + gap)
    allitems = sorted(side_items["L"] + side_items["R"], key=lambda t: (-t[3], TARGET[t[0]][2]))
    order = {t[0]: n + 1 for n, t in enumerate(allitems)}
    for s, items in side_items.items():
        for k, x, y, ly in items:
            yy = oy + ly * mm
            if s == "L":
                nx, line_x0, line_x1, lead_x = L + 47 * mm, L, L + 42 * mm, L + 51 * mm
            else:
                nx, line_x0, line_x1, lead_x = R - 47 * mm, R - 42 * mm, R, R - 51 * mm
            c.setStrokeColor(MUTED)
            c.setLineWidth(0.5)
            c.line(lead_x, yy + 1.2 * mm, ox + x * mm, oy + y * mm)
            c.setFillColor(INK)
            c.circle(ox + x * mm, oy + y * mm, 0.7 * mm, stroke=0, fill=1)
            c.setFillColor(FIG)
            c.circle(nx, yy + 1.2 * mm, 2.9 * mm, stroke=0, fill=1)
            ctext(c, nx, yy, str(order[k]), 9, "Sans-Bold", white)
            answer(c, line_x0, yy, line_x1 - line_x0, sol, BODY[k][0], 10)
    return order


# ---------------------------------------------------------------------------
# Hilfen für Aufgabenzeilen
# ---------------------------------------------------------------------------
def pair_rows(c, y, items, sol, cols=2, label_w=40 * mm, ans_w=None, size=10, gap=8.5 * mm, letters=True):
    """items: (Vorgabe, Lösung). Gibt y unter der letzten Zeile zurück."""
    colw = (W - 9 * mm) / cols
    ans_w = ans_w or colw - label_w - 6 * mm
    for i, (q, a) in enumerate(items):
        xx = L + 9 * mm + (i % cols) * colw
        yy = y - (i // cols) * gap
        lbl = (f"{'abcdefghijkl'[i]})  " if letters else "") + q
        text(c, xx, yy, lbl, size)
        assert pdfmetrics.stringWidth(lbl, "Sans", size) < label_w, lbl
        answer(c, xx + label_w, yy, ans_w, sol, a, size)
    return y - ((len(items) + cols - 1) // cols) * gap


def strike_word(c, x, y, word, silent, sol, size=15):
    text(c, x, y, word, size, "Sans-Bold")
    if sol and silent:
        w0 = pdfmetrics.stringWidth(word[:-len(silent)], "Sans-Bold", size)
        w1 = pdfmetrics.stringWidth(word, "Sans-Bold", size)
        c.setStrokeColor(SOL)
        c.setLineWidth(1.6)
        c.line(x + w0 - 0.5 * mm, y + 1.6 * mm, x + w1 + 0.5 * mm, y + 1.6 * mm)
    return pdfmetrics.stringWidth(word, "Sans-Bold", size)


# ===========================================================================
# Übungsblatt
# ===========================================================================
U_FIG = ["tête", "yeux", "nez", "oreille", "bras", "main", "doigt", "jambe", "genou", "pied"]
U_FD = ["cheveux", "bouche", "cou", "ventre"]
U_DF = ["tête", "genou", "yeux", "pied"]
U_HOBBY = ["voile", "gym", "rando", "photos", "cartes", "console", "piano", "bricoler"]
U_SOUND = [("le c", "ou", ""), ("la b", "ou", "che"), ("le gen", "ou", ""),
           ("le d", "oi", "gt"), ("les chev", "eu", "x"), ("les y", "eu", "x")]
U_SILENT = [("pied", "d"), ("nez", "z"), ("bras", "s"), ("doigt", "gt"), ("cheveux", "x")]
U_SENT = ["escalade", "luge", "dessiner", "patinage", "entraine", "passion"]
U_MON = ["tête", "cheveux", "nez", "main", "yeux", "genou", "bouche", "doigt"]
U_POSS = [  # (Satz, Lücken, Hilfe)
    ("Shemsi: «J'habite avec {} parents et {} sœur.»", [("je", "parents", "pl"), ("je", "sœur", "f")],
     "les parents, la sœur"),
    ("Turereura: «J'habite avec {} grand-mère, {} père et {} mère.»",
     [("je", "grand-mère", "f"), ("je", "père", "m"), ("je", "mère", "f")], "la grand-mère, le père, la mère"),
    (f"Shemsi, comment s'appelle {{}} cheval{NB}?", [("tu", "cheval", "m")], "le cheval"),
    (f"Vincent, tu aimes {{}} cailloux{NB}?", [("tu", "cailloux", "pl")], "les cailloux"),
    ("Akim habite avec {} famille.", [("il", "famille", "f")], "la famille"),
    ("Vincent aime {} collection de cailloux.", [("il", "collection", "f")], "la collection"),
    ("Turereura fait des couronnes avec {} amies.", [("il", "amies", "pl")], "les amies"),
]
U_TRAP = [
    ("Vincent: «{} école est adaptée.»", [("je", "école", "f")], "l'école, weiblich"),
    ("C'est {} oreille.", [("je", "oreille", "f")], "l'oreille, weiblich"),
    ("Shemsi aime {} école.", [("il", "école", "f")], "l'école, weiblich"),
]
U_WHO = [
    ("Wer hat ein Pferd? Es heisst Jupiter.", "Shemsi"),
    ("Wer ist von Geburt an gehörlos (sourd de naissance)?", "Vincent"),
    ("Wer möchte Bankier oder Arzt werden?", "Akim"),
    ("Wer wohnt auf der Insel Rangiroa im Pazifik?", "Turereura"),
    ("Wer mag Mathe am wenigsten? Schreibe beide Namen.", "Shemsi, Turereura"),
]


def poss_rows(c, y, items, sol, size=10, x=L + 9 * mm, letters=True):
    for i, (s, slots, hint) in enumerate(items):
        shown = s.replace("{}", "_____")
        lbl = f"{'abcdefgh'[i]})  " if letters else "–  "
        text(c, x, y, lbl + shown, size)
        hx = x + pdfmetrics.stringWidth(lbl + shown, "Sans", size) + 3 * mm
        hint = f"({hint})"
        if hx + pdfmetrics.stringWidth(hint, "Sans", 8) > R:
            y -= 4.4 * mm
            hx = x + 5 * mm
        text(c, hx, y, hint, 8, "Sans", MUTED)
        if sol:
            text(c, x + 5 * mm, y - 4.6 * mm, fill(s, slots), 9, "Sans-Bold", SOL)
        y -= 10.5 * mm
    return y


def u_task1(c, y, sol):
    y = merkkasten(c, y, "Merke: die Begleiter le, la, l' und les", [
        "le steht vor männlichen Wörtern (m): le nez.",
        "la steht vor weiblichen Wörtern (f): la tête.",
        "l' steht vor Wörtern, die mit a, e, i, o, u oder é beginnen: l'oreille.",
        "les steht in der Mehrzahl: les yeux.",
        "Lerne jedes Wort immer mit seinem Begleiter.",
    ])
    y = task_head(c, y, 1, "Le corps: der Körper",
                  "Schreibe zu jeder Nummer das französische Wort mit le, la, l' oder les auf. Die Wörter im Kasten "
                  "helfen dir. Jedes Wort passt genau einmal.", goal(1), level=1)
    bank = sorted((BODY[k][0] for k in U_FIG), key=lambda s: s.split("'")[-1].split()[-1])
    y = word_bank(c, L + 9 * mm, y, bank, W - 9 * mm) - 4 * mm
    oy = y - 113 * mm
    draw_body(c, L + W / 2, oy)
    body_labels(c, L + W / 2, oy, U_FIG, sol)
    y = oy - 10 * mm
    return y


def u_task2(c, y, sol):
    y = task_head(c, y, 2, "Wörter übersetzen",
                  "a) Schreibe das deutsche Wort mit der, die oder das auf.  "
                  "b) Schreibe das französische Wort mit le, la, l' oder les auf.", goal(1, 2), level=1)
    text(c, L + 9 * mm, y, "a)", 10, "Sans-Bold", FIG)
    text(c, L + 9 * mm + (W - 9 * mm) / 2, y, "b)", 10, "Sans-Bold", FIG)
    for i in range(4):
        yy = y - i * 8.5 * mm
        fr, de, _ = BODY[U_FD[i]]
        text(c, L + 16 * mm, yy, fr, 10)
        answer(c, L + 44 * mm, yy, 36 * mm, sol, de)
        fr2, de2, _ = BODY[U_DF[i]]
        x2 = L + 9 * mm + (W - 9 * mm) / 2 + 7 * mm
        text(c, x2, yy, de2, 10)
        answer(c, x2 + 26 * mm, yy, 36 * mm, sol, fr2)
    y -= 4 * 8.5 * mm
    return y


def u_task3(c, y, sol):
    y = task_head(c, y, 3, "Les hobbys: die Hobbys",
                  "Schreibe das deutsche Wort auf. Die Wörter im Kasten helfen dir. Jedes Wort passt genau einmal.",
                  goal(1, 2), level=1)
    bank = sorted(HOBBY[k][1] for k in U_HOBBY)
    y = word_bank(c, L + 9 * mm, y, bank, W - 9 * mm) - 6 * mm
    y = pair_rows(c, y, [(HOBBY[k][0], HOBBY[k][1]) for k in U_HOBBY], sol, cols=2, label_w=50 * mm, size=9.5) - 4 * mm
    return y


def u_task4(c, y, sol):
    y = task_head(c, y, 4, "Richtig aussprechen",
                  "Lies jedes Wort laut. Die Regeln im Kasten helfen dir.", goal(3), level=1)
    y = merkkasten(c, y + 3 * mm, "So spricht man es aus", [
        "**ou = u: le cou  ·  oi = ua: le doigt  ·  eu = ö: les cheveux",
        "**ch = sch: la bouche  ·  ê = ä: la tête",
        "Viele Buchstaben am Ende hört man nicht: le pied klingt wie «lö pje».",
    ], size=9)
    text(c, L + 9 * mm, y, "a) Schreibe ou, oi oder eu in die Lücke. Lies das Wort dann laut.", 10)
    y -= 9 * mm
    colw = (W - 9 * mm) / 3
    for i, (a, gap_, b) in enumerate(U_SOUND):
        xx = L + 13 * mm + (i % 3) * colw
        yy = y - (i // 3) * 10 * mm
        text(c, xx, yy, a, 13, "Sans-Bold")
        gx = xx + pdfmetrics.stringWidth(a, "Sans-Bold", 13) + 1 * mm
        answer(c, gx, yy, 9 * mm, sol, gap_, 13)
        text(c, gx + 10 * mm, yy, b, 13, "Sans-Bold")
    y -= 2 * 10 * mm + 3 * mm
    y = wrap(c, L + 9 * mm, y, "b) Lies das Wort laut. Streiche am Ende die Buchstaben durch, die man nicht hört.",
             W - 9 * mm, 10) - 5 * mm
    xx = L + 13 * mm
    for w_, silent in U_SILENT:
        xx += strike_word(c, xx, y, w_, silent, sol) + 12 * mm
    y -= 8 * mm
    return y


def u_task5(c, y, sol):
    y = task_head(c, y, 5, "Sätze über Hobbys",
                  "Schreibe den Satz auf Französisch.  Hilfe: Ich mag … = J'aime …   Ich liebe … = J'adore …",
                  goal(1, 2), level=2)
    for i, k in enumerate(U_SENT):
        fr, de = SENT[k]
        text(c, L + 9 * mm, y, f"{'abcdef'[i]})  {de}", 10)
        answer(c, L + 96 * mm, y, W - 96 * mm, sol, fr)
        y -= 9 * mm
    y -= 4 * mm
    return y


def u_task6(c, y, sol):
    y = merkkasten(c, y, "Merke: mein, dein, sein", [
        "**mein:  mon nez (le nez)  ·  ma tête (la tête)  ·  mes yeux (les yeux)",
        "**dein:  ton nez  ·  ta tête  ·  tes yeux",
        "**sein / ihr:  son nez  ·  sa tête  ·  ses yeux",
        "Schau auf den Begleiter: le → mon, ton, son.  la → ma, ta, sa.  les → mes, tes, ses.",
    ])
    y = task_head(c, y, 6, "mon, ma oder mes",
                  "Schau auf den Begleiter. Schreibe mon, ma oder mes in die Lücke.", goal(4), level=2)
    colw = (W - 9 * mm) / 2
    for i, k in enumerate(U_MON):
        fr, de, g = BODY[k]
        noun = fr.split("'")[-1].split()[-1]
        xx = L + 9 * mm + (i % 2) * colw
        yy = y - (i // 2) * 9 * mm
        lbl = f"{'abcdefgh'[i]})  {fr}   →"
        text(c, xx, yy, lbl, 10)
        ax = xx + 40 * mm
        answer(c, ax, yy, 14 * mm, sol, poss("je", noun, g))
        text(c, ax + 16 * mm, yy, noun, 10)
    y -= 4 * 9 * mm
    return y


def u_task7(c, y, sol):
    y = task_head(c, y, 7, "Die Kinder aus dem magazine",
                  "Diese Sätze kommen aus dem magazine. Schreibe mon, ma, mes, ton, ta, tes, son, sa oder ses in die "
                  "Lücke. In der Klammer steht der Begleiter.  "
                  "Tipp: «Akim habite avec sa famille.» Akim ist ein Junge, aber la famille ist weiblich. Darum: sa.",
                  goal(4, 5), level=2)
    y = poss_rows(c, y, U_POSS, sol) - 2 * mm
    return y


def u_task8(c, y, sol):
    y = task_head(c, y, 8, "Wer ist es?",
                  "a) Schreibe das Land und das Hobby auf Deutsch auf.  b) Lies die Frage. Schreibe den Namen auf.",
                  goal(5), level=2)
    text(c, L + 9 * mm, y, "a)", 10, "Sans-Bold", FIG)
    text(c, L + 16 * mm, y, "Name", 8.5, "Sans-Bold", MUTED)
    text(c, L + 44 * mm, y, "Land", 8.5, "Sans-Bold", MUTED)
    text(c, L + 100 * mm, y, "Hobby", 8.5, "Sans-Bold", MUTED)
    y -= 7.5 * mm
    for name, land, hobby in KIDS:
        text(c, L + 16 * mm, y, name, 10, "Sans-Bold")
        answer(c, L + 44 * mm, y, 52 * mm, sol, land, 9)
        answer(c, L + 100 * mm, y, W - 100 * mm, sol, hobby, 9)
        y -= 8 * mm
    y -= 2 * mm
    text(c, L + 9 * mm, y, "b)", 10, "Sans-Bold", FIG)
    for q, a in U_WHO:
        assert all(n in KID_NAMES for n in a.split(", "))
        text(c, L + 16 * mm, y, q, 10)
        answer(c, R - 42 * mm, y, 42 * mm, sol, a, 9.5)
        y -= 8 * mm
    return y


def u_task9(c, y, sol):
    y = task_head(c, y, 9, "C'est moi!",
                  "a) Schreibe auf Französisch über dich. Ergänze jeden Satz. Verwende Wörter von Seite 51.  "
                  "b) Achtung, Falle! Vor a, e, i, o, u oder é steht immer mon, ton oder son, auch bei weiblichen "
                  "Wörtern. Schreibe das richtige Wort in die Lücke.", goal(1, 4), level=3)
    text(c, L + 9 * mm, y, "a)", 10, "Sans-Bold", FIG)
    frames = [("Je m'appelle", "Kevin."), ("J'ai", "… ans."), ("J'ai une passion:", "le karaté."),
              ("J'aime", "jouer à la console."), ("J'adore", "la luge."), ("Je m'entraîne avec", "mes amis.")]
    for a, ex in frames:
        text(c, L + 16 * mm, y, a, 11)
        answer(c, L + 16 * mm + pdfmetrics.stringWidth(a, "Sans", 11) + 2 * mm, y, 70 * mm, sol, ex)
        y -= 9 * mm
    if sol:
        y = wrap(c, L + 16 * mm, y + 3 * mm, "Das ist nur ein Beispiel. Viele Lösungen sind richtig: Jeder Satz endet "
                 "mit einem Wort oder einem Hobby von Seite 51 und mit einem Punkt.", W - 16 * mm, 8.5, color=SOL) - 2 * mm
    y -= 3 * mm
    text(c, L + 9 * mm, y, "b)", 10, "Sans-Bold", FIG)
    y = poss_rows(c, y, U_TRAP, sol, x=L + 16 * mm, letters=False)
    if sol:
        y = wrap(c, L + 9 * mm, y + 1 * mm, "Warum? «ma école» kann man schlecht aussprechen. Darum sagt man «mon école», "
                 "obwohl l'école weiblich ist.", W - 9 * mm, 8.5, color=SOL)
    return y


U_PAGES = [[u_task1], [u_task2, u_task3, u_task4], [u_task5, u_task6], [u_task7, u_task8], [u_task9]]


def u_pages():
    def make(n, tasks):
        def page(c, sol):
            header(c, "Übungsblatt Französisch", SUB + f" · Seite {n}", name_fields=(n == 1 and not sol))
            y = PAGE_H - (37 if n == 1 else 38) * mm
            for t in tasks:
                y = t(c, y, sol) - 4 * mm
            footer_note(c, sol, n, y + 4 * mm)
            c.showPage()
        return page
    return [make(n + 1, t) for n, t in enumerate(U_PAGES)]


# ===========================================================================
# Lernkontrolle
# ===========================================================================
T_FIG = ["cheveux", "oreille", "bouche", "cou", "main", "ventre", "genou", "pied"]
T_FD = [BODY["tête"][:2], BODY["doigt"][:2], HOBBY["voile"], HOBBY["batterie"], HOBBY["bricoler"], HOBBY["escalade"]]
T_DF = [(fr, de) for fr, de in [BODY["yeux"][:2], BODY["jambe"][:2], HOBBY["rando"], HOBBY["piano"], SENT["luge"],
                                   SENT["entraine"]]]
T_DF = [(de, fr) for fr, de in T_DF]   # Vorgabe Deutsch, Lösung Französisch
T_POSS = [("mein Kopf", "je", "tête", "f", "la tête"), ("meine Haare", "je", "cheveux", "pl", "les cheveux"),
          ("dein Fuss", "tu", "pied", "m", "le pied"), ("deine Hand", "tu", "main", "f", "la main"),
          ("deine Augen", "tu", "yeux", "pl", "les yeux"), ("sein Pferd", "il", "cheval", "m", "le cheval"),
          ("ihre Familie", "il", "famille", "f", "la famille"), ("ihre Freundinnen", "il", "amies", "pl", "les amies")]
T_WHO = [("Wer sammelt Steine (des cailloux)?", "Vincent"), ("Wer macht Karate?", "Akim"),
         ("Wer zeichnet gern Kleider für Kinder?", "Shemsi"),
         ("Wer macht Blumenkronen (des couronnes de fleurs)?", "Turereura"),
         ("Wer trainiert 3-mal pro Woche?", "Akim"), ("Wer hat einen eigenen Fahrer (un chauffeur privé)?", "Vincent")]
T_SPEAK = ["les cheveux", "le doigt", "la bouche", "le genou", "la tête", "le pied", "J'adore le patinage.",
           "Je m'entraîne."]
T_SPEAK_TIP = {"les cheveux": "le schöwö", "le doigt": "lö dua", "la bouche": "la busch", "le genou": "lö schönu",
               "la tête": "la tät", "le pied": "lö pje", "J'adore le patinage.": "schador lö patinasch",
               "Je m'entraîne.": "schö mãträn"}
T_POINTS = {1: len(T_FIG), 2: len(T_FD), 3: len(T_DF), 4: len(T_POSS), 5: len(T_WHO), 6: len(T_SPEAK)}
T_TOTAL = sum(T_POINTS.values())


def t_page1(c, sol):
    header(c, "Lernkontrolle Französisch", SUB + " · Seite 1", name_fields=not sol)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 1, "Le corps: der Körper",
                  "Schreibe zu jeder Nummer das französische Wort mit le, la, l' oder les auf.", goal(1),
                  points=T_POINTS[1])
    oy = y - 112 * mm
    draw_body(c, L + W / 2, oy)
    body_labels(c, L + W / 2, oy, T_FIG, sol)
    y = oy - 10 * mm
    y = task_head(c, y, 2, "Französisch → Deutsch", "Schreibe das deutsche Wort auf.", goal(2), points=T_POINTS[2])
    y = pair_rows(c, y, T_FD, sol, cols=2, label_w=46 * mm, size=9.5) - 3 * mm
    footer_note(c, sol, 1, y)
    c.showPage()


def t_page2(c, sol):
    header(c, "Lernkontrolle Französisch", SUB + " · Seite 2", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 3, "Deutsch → Französisch",
                  "Schreibe auf Französisch. Schreibe bei Nomen le, la, l' oder les dazu.", goal(1, 2), points=T_POINTS[3])
    y = pair_rows(c, y, T_DF, sol, cols=1, label_w=80 * mm, size=10) - 4 * mm
    y = task_head(c, y, 4, "mon, ma, mes · ton, ta, tes · son, sa, ses",
                  "Schreibe das richtige Wort in die Lücke. In der Klammer steht der Begleiter.", goal(4),
                  points=T_POINTS[4])
    for i, (de, person, noun, g, art) in enumerate(T_POSS):
        xx = L + 9 * mm
        text(c, xx, y, f"{'abcdefgh'[i]})  {de}", 10)
        text(c, xx + 42 * mm, y, f"({art})", 9, "Sans", MUTED)
        text(c, xx + 75 * mm, y, "→", 10)
        ax = xx + 83 * mm
        answer(c, ax, y, 15 * mm, sol, poss(person, noun, g))
        text(c, ax + 17 * mm, y, noun, 10)
        y -= 8.5 * mm
    y -= 3 * mm

    y = task_head(c, y, 5, "Die Kinder aus dem magazine",
                  "Lies die Frage. Schreibe den Namen auf: Akim, Shemsi, Vincent oder Turereura.", goal(5),
                  points=T_POINTS[5])
    for q, a in T_WHO:
        assert a in KID_NAMES
        text(c, L + 9 * mm, y, q, 10)
        answer(c, R - 38 * mm, y, 38 * mm, sol, a)
        y -= 8.5 * mm
    y -= 3 * mm

    footer_note(c, sol, 2, y)
    c.showPage()


def t_page3(c, sol):
    header(c, "Lernkontrolle Französisch", SUB + " · Seite 3", name_fields=False)
    y = PAGE_H - 38 * mm
    y = task_head(c, y, 6, "Laut vorlesen",
                  "Lies jedes Wort und jeden Satz laut vor. Die Lehrperson hört zu und macht ein Häkchen, wenn die "
                  "Aussprache stimmt.", goal(3), points=T_POINTS[6])
    for i, w_ in enumerate(T_SPEAK):
        xx = L + 9 * mm
        yy = y - i * 9 * mm
        checkbox(c, xx, yy)
        text(c, xx + 6 * mm, yy, w_, 11, "Sans-Bold")
        if sol:
            text(c, xx + 6 * mm + pdfmetrics.stringWidth(w_, "Sans-Bold", 11) + 3 * mm, yy,
                 f"«{T_SPEAK_TIP[w_]}»", 8.5, "Sans", SOL)
    y -= len(T_SPEAK) * 9 * mm + 4 * mm

    c.setStrokeColor(INK)
    c.setLineWidth(1)
    c.roundRect(R - 66 * mm, y - 9 * mm, 66 * mm, 13 * mm, 3 * mm, stroke=1, fill=0)
    text(c, R - 62 * mm, y - 3.6 * mm, f"Total:  _____ / {T_TOTAL} Punkte", 11.5, "Sans-Bold")
    if sol:
        yy = y
        text(c, L, yy, "Bewertung", 10, "Sans-Bold", SOL)
        for ln in ["Je 1 Punkt pro richtige Lücke oder richtiges Wort.",
                   "Aufgabe 1 und 3: Der Begleiter (le, la, l', les) gehört dazu.",
                   "Kleine Schreibfehler (z. B. fehlender Akzent): ½ Punkt.",
                   f"Richtwert: ab {round(T_TOTAL * 0.9)} P. sehr gut · ab {round(T_TOTAL * 0.78)} P. gut · "
                   f"ab {round(T_TOTAL * 0.62)} P. Lernziele erreicht."]:
            yy -= 4.2 * mm
            text(c, L, yy, ln, 8, "Sans", SOL)
        y = min(y - 9 * mm, yy)
    footer_note(c, sol, 3, y)
    c.showPage()


def build():
    for stem, title, pages in [("cest-moi-uebungsblatt", "Übungsblatt Französisch: C'est moi",
                                u_pages()),
                               ("cest-moi-lernkontrolle", "Lernkontrolle Französisch: C'est moi", [t_page1, t_page2, t_page3])]:
        for sol in (False, True):
            build_pdf(OUT_DIR / (stem + ("-loesungen" if sol else "") + ".pdf"), title, pages, sol)


if __name__ == "__main__":
    build()
