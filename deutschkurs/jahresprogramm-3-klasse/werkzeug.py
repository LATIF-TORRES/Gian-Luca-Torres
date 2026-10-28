"""Gemeinsames Werkzeug für alle Blätter des Jahresprogramms Deutsch 3. Klasse.

Ein Blatt besteht aus Bausteinen (Merkkasten, Aufgaben). Jede Aufgabe zeichnet sich selbst –
einmal ohne Lösung (für das Kind) und einmal mit farbig eingetragener Lösung. Beide Fassungen
haben dieselben Seiten, weil die Seiten aus der grösseren der beiden Höhen geplant werden.

Kurzschrift in Aufgabentexten (siehe `inline`):
  [Wort]          markiertes Wort; die Lösung unterstreicht es (oder kreist es ein, streicht es durch)
  [Wort:1]        markiertes Wort der Kategorie 1 (andere Farbe in der Lösung)
  {Lösung}        Lücke; die Lösung steht in Rot auf der Linie
  {Lösung|Hilfe}  Lücke mit Hilfe in Klammern dahinter, z. B. {fliegt|fliegen}
  <der|*die|das>  Auswahl; das Wort mit * wird in der Lösung eingekreist
  |               Trennstrich, der nur in der Lösung erscheint (Satzglieder, Silben)
"""
import random
from dataclasses import dataclass, field

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
pdfmetrics.registerFont(TTFont("Sans-Oblique", f"{FONT_DIR}/DejaVuSans.ttf"))  # kein Kursiv installiert

PAGE_W, PAGE_H = A4
L, R = 16 * mm, PAGE_W - 16 * mm
W = R - L
TOP = PAGE_H - 37 * mm      # erste Zeile unter dem Kopf
BOTTOM = 15 * mm            # über der Fusszeile
IND = 9 * mm                # Einzug des Aufgabentexts

INK = HexColor("#1d2433")
MUTED = HexColor("#5a6478")
LINE = HexColor("#9aa5ba")
SOFT = HexColor("#f1f4f8")
RED = HexColor("#c8281c")
CAT = [RED, HexColor("#1f5fd1"), HexColor("#0f8a6a"), HexColor("#b4561a")]

# Bereichsfarben (Lehrplan 21: Hören, Lesen, Schreiben, Sprache im Fokus, Rechtschreibung)
BEREICH = {
    "Hören": HexColor("#b4561a"),
    "Lesen": HexColor("#7a3fb8"),
    "Schreiben": HexColor("#0f8a6a"),
    "Grammatik": HexColor("#2b4fd8"),
    "Rechtschreibung": HexColor("#c2337a"),
}


@dataclass
class Stil:
    size: float      # Schriftgrösse der Aufgaben
    lead: float      # Zeilenabstand zwischen Sätzen
    write: float     # Abstand der Schreiblinien


STUFE = {1: Stil(13, 10.5 * mm, 11 * mm), 2: Stil(11.5, 9 * mm, 9.5 * mm)}
STUFE_NAME = {1: "★ Stufe 1 · Grundlagen", 2: "★★ Stufe 2 · Standard"}


# ---------- Zeichnen ----------
class NullCanvas:
    """Schluckt alle Zeichenbefehle; damit misst man die Höhe eines Bausteins."""

    def __getattr__(self, name):
        return self

    def __call__(self, *a, **k):
        return self


@dataclass
class Ctx:
    c: object
    stufe: int
    loesung: bool
    accent: object = INK

    @property
    def st(self):
        return STUFE[self.stufe]


def sw(s, size, font="Sans"):
    return pdfmetrics.stringWidth(s, font, size)


def text(c, x, y, s, size=10.5, font="Sans", color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, s)


def ctext(c, x, y, s, size=10.5, font="Sans", color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawCentredString(x, y, s)


def rtext(c, x, y, s, size=10.5, font="Sans", color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawRightString(x, y, s)


def wrapped(c, x, y, s, width, size=10.5, font="Sans", leading=None, color=INK):
    leading = leading or size * 1.4
    for ln in simpleSplit(s, font, size, width):
        text(c, x, y, ln, size, font, color)
        y -= leading
    return y


def hline(c, x0, x1, y, color=LINE, width=0.6):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x0, y, x1, y)


def smiley(c, cx, cy, mood, r=4 * mm):
    c.setStrokeColor(INK)
    c.setLineWidth(0.8)
    c.circle(cx, cy, r, stroke=1, fill=0)
    c.setFillColor(INK)
    c.circle(cx - 1.4 * mm, cy + 1.1 * mm, 0.45 * mm, stroke=0, fill=1)
    c.circle(cx + 1.4 * mm, cy + 1.1 * mm, 0.45 * mm, stroke=0, fill=1)
    if mood == 0:
        c.line(cx - 1.6 * mm, cy - 1.5 * mm, cx + 1.6 * mm, cy - 1.5 * mm)
    else:
        p = c.beginPath()
        mid = cy - 1.5 * mm - mood * 0.9 * mm
        p.moveTo(cx - 1.8 * mm, cy - 1.5 * mm)
        p.curveTo(cx - 0.8 * mm, mid, cx + 0.8 * mm, mid, cx + 1.8 * mm, cy - 1.5 * mm)
        c.drawPath(p, stroke=1, fill=0)


def warn(msg):
    import sys
    print("WARNUNG:", msg, file=sys.stderr)


# ---------- Kurzschrift (eine Zeile mit Lücken, Markierungen, Auswahl) ----------
def parse(s):
    """Zerlegt Kurzschrift in Wortblöcke. Ein Block ist eine Liste von Stücken (art, text, extra)."""
    atoms, cur, i = [], [], 0

    def flush():
        nonlocal cur
        if cur:
            atoms.append(cur)
            cur = []

    while i < len(s):
        ch = s[i]
        if ch == " ":
            flush()
            i += 1
        elif ch in "[{<":
            end = s.index({"[": "]", "{": "}", "<": ">"}[ch], i)
            body = s[i + 1:end]
            if ch == "[":
                word, _, cat = body.partition(":")
                parts = word.split(" ")
                for k, p in enumerate(parts):
                    if k:
                        flush()
                    cur.append(("m", p, int(cat) if cat else 0))
            elif ch == "{":
                sol, _, hint = body.partition("|")
                cur.append(("g", sol, hint))
            else:
                opts = body.split("|")
                right = [k for k, o in enumerate(opts) if o.startswith("*")]
                cur.append(("c", [o.lstrip("*") for o in opts], right))
            i = end + 1
        elif ch == "|" and (i + 1 == len(s) or s[i + 1] == " "):
            flush()
            atoms.append([("s", "|", None)])
            i += 1
        else:
            j = i
            while j < len(s) and s[j] not in " [{<":
                j += 1
            cur.append(("t", s[i:j], None))
            i = j
    flush()
    return atoms


def gap_width(sol, size, min_w):
    if len(sol) <= 3 and min_w is None:
        return max(sw(sol, size) + 3 * mm, 7 * mm)
    return max(sw(sol, size) + 5 * mm, min_w or 20 * mm)


CHOICE_SEP = "   /   "
CHOICE_PAD = 2.5 * mm


def piece_width(p, size, min_gap):
    kind, t, extra = p
    if kind in "tm":
        return sw(t, size)
    if kind == "s":
        return 0
    if kind == "g":
        w = gap_width(t, size, min_gap)
        if extra:
            w += sw(f" ({extra})", size * 0.85)
        return w
    return sw(CHOICE_SEP.join(t), size) + 2 * CHOICE_PAD


def inline(ctx, x, y, s, width, size=None, lead=None, min_gap=None, mark="unter", fill=None):
    """Zeichnet eine Zeile Kurzschrift mit Umbruch. Gibt die y-Position unter der letzten Zeile zurück.

    mark: 'unter' (unterstreichen), 'kreis' (einkreisen), 'durch' (durchstreichen), 'farbe' (anmalen)
    fill: Farbe für alle Lösungen (z. B. für ein vorgelöstes Beispiel)
    """
    c = ctx.c
    size = size or ctx.st.size
    lead = lead or ctx.st.lead
    space = sw(" ", size)
    atoms = parse(s)
    lines, cur, cw = [], [], 0
    for a in atoms:
        aw = sum(piece_width(p, size, min_gap) for p in a)
        if aw > width:
            warn(f"Wort zu breit für die Zeile: {''.join(str(p[1]) for p in a)}")
        if cur and cw + space + aw > width:
            lines.append(cur)
            cur, cw = [], 0
        cur.append((a, aw))
        cw += aw + (space if len(cur) > 1 else 0)
    if cur:
        lines.append(cur)
    show = ctx.loesung or fill is not None
    for ln in lines:
        xx = x
        for a, aw in ln:
            for p in a:
                kind, t, extra = p
                pw = piece_width(p, size, min_gap)
                if kind == "t":
                    text(c, xx, y, t, size)
                elif kind == "s":
                    if show:
                        c.setStrokeColor(fill or RED)
                        c.setLineWidth(1.6)
                        mx = xx - space / 2
                        c.line(mx, y - 2 * mm, mx, y + size * 0.36 * mm + 1.5 * mm)
                elif kind == "m":
                    col = fill or CAT[extra % len(CAT)]
                    if show and mark == "farbe":
                        c.setFillColor(col)
                        c.setFillAlpha(0.22)
                        c.rect(xx - 0.6 * mm, y - 1.6 * mm, pw + 1.2 * mm, size * 0.36 * mm + 3 * mm,
                               stroke=0, fill=1)
                        c.setFillAlpha(1)
                    text(c, xx, y, t, size)
                    if show:
                        c.setStrokeColor(col)
                        c.setLineWidth(1.3)
                        if mark == "unter":
                            c.line(xx, y - 1.5 * mm, xx + pw, y - 1.5 * mm)
                        elif mark == "durch":
                            c.line(xx - 0.5 * mm, y + size * 0.12 * mm, xx + pw + 0.5 * mm, y + size * 0.12 * mm)
                        elif mark == "kreis":
                            c.ellipse(xx - 0.8 * mm, y - 2 * mm, xx + pw + 0.8 * mm, y + size * 0.36 * mm + 1.2 * mm,
                                      stroke=1, fill=0)
                elif kind == "g":
                    gw = gap_width(t, size, min_gap)
                    hline(c, xx, xx + gw, y - 1.2 * mm, INK, 0.7)
                    if show:
                        ctext(c, xx + gw / 2, y, t, size, "Sans-Bold" if fill is None else "Sans", fill or RED)
                    if extra:
                        text(c, xx + gw + sw(" ", size * 0.85), y, f"({extra})", size * 0.85, "Sans", MUTED)
                else:
                    cx = xx + CHOICE_PAD
                    for k, o in enumerate(t):
                        if k:
                            text(c, cx, y, CHOICE_SEP, size, "Sans", MUTED)
                            cx += sw(CHOICE_SEP, size)
                        ow = sw(o, size)
                        text(c, cx, y, o, size)
                        if show and k in extra:
                            c.setStrokeColor(fill or RED)
                            c.setLineWidth(1.3)
                            c.ellipse(cx - 1.6 * mm, y - 2.2 * mm, cx + ow + 1.6 * mm,
                                      y + size * 0.36 * mm + 1.4 * mm, stroke=1, fill=0)
                        cx += ow
                xx += pw
            if a[0][0] != "s":
                xx += space
        y -= lead
    return y


def count_items(s):
    """Anzahl Lösungen in einer Zeile. Eine Markierung über mehrere Wörter zählt einmal."""
    n = s.count("[") + s.count("{") + s.count("<")
    for a in parse(s):
        n += sum(1 for p in a if p[0] == "s")
    return n


def strip(s):
    """Kurzschrift → Text mit eingesetzten Lösungen (für Lösungs-Sätze)."""
    out = []
    for a in parse(s):
        if a[0][0] == "s":
            continue
        w = ""
        for kind, t, extra in a:
            if kind == "c":
                w += t[extra[0]]
            else:
                w += t
        out.append(w)
    return " ".join(out)


# ---------- Bausteine ----------
class Block:
    nr = None
    punkte = 0

    def draw(self, ctx, y):
        raise NotImplementedError

    def height(self, stufe):
        hs = []
        for loes in (False, True):
            ctx = Ctx(NullCanvas(), stufe, loes)
            hs.append(TOP - self.draw(ctx, TOP))
        return max(hs)


@dataclass
class Merkkasten(Block):
    """Kasten mit Regeln. Zeilen: '# Titel', '- Punkt', '> Beispiel', '! wichtig', sonst normal."""
    titel: str
    zeilen: list

    def draw(self, ctx, y):
        c = ctx.c
        size = 10.5 if ctx.stufe == 2 else 11.5
        lead = size * 1.5
        inner = W - 10 * mm
        rows = []
        for z in self.zeilen:
            if z.startswith("# "):
                rows.append(("Sans-Bold", INK, z[2:], 0))
            elif z.startswith("- "):
                rows.append(("Sans", INK, "•  " + z[2:], 0))
            elif z.startswith("> "):
                rows.append(("Sans", ctx.accent, z[2:], 4 * mm))
            elif z.startswith("! "):
                rows.append(("Sans-Bold", RED, z[2:], 0))
            else:
                rows.append(("Sans", INK, z, 0))
        lines = []
        for font, col, t, ind in rows:
            if not t:
                lines.append(None)
                continue
            for ln in simpleSplit(t, font, size, inner - ind):
                lines.append((font, col, ln, ind))
        bh = 13 * mm + sum(lead if ln else lead * 0.45 for ln in lines) + 2 * mm
        c.setFillColor(SOFT)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.8)
        c.roundRect(L, y - bh, W, bh, 3 * mm, stroke=1, fill=1)
        c.setFillColor(ctx.accent)
        c.roundRect(L, y - bh, 2.2 * mm, bh, 1 * mm, stroke=0, fill=1)
        text(c, L + 6 * mm, y - 8 * mm, self.titel, 12.5, "Sans-Bold", ctx.accent)
        yy = y - 15 * mm
        for ln in lines:
            if ln is None:
                yy -= lead * 0.45
                continue
            font, col, t, ind = ln
            text(c, L + 6 * mm + ind, yy, t, size, font, col)
            yy -= lead
        return y - bh - 7 * mm


class Aufgabe(Block):
    """Basis aller Aufgaben. Unterklassen haben die Felder titel, anweisung, hilfe, erklaerung."""

    def head(self, ctx, y, test):
        c = ctx.c
        c.setFillColor(ctx.accent)
        c.circle(L + 3.4 * mm, y + 1.3 * mm, 3.4 * mm, stroke=0, fill=1)
        ctext(c, L + 3.4 * mm, y - 0.2 * mm, str(self.nr), 10, "Sans-Bold", white)
        text(c, L + IND, y, self.titel, 12.5, "Sans-Bold")
        if test and self.punkte:
            if ctx.loesung:
                rtext(c, R, y, f"{self.punkte} P.", 10.5, "Sans-Bold", RED)
            else:
                rtext(c, R, y, f"____ / {self.punkte} P.", 10, "Sans", MUTED)
        isize = 11 if ctx.stufe == 1 else 10.5
        y = wrapped(c, L + IND, y - 6.5 * mm, self.anweisung, W - IND, isize, "Sans", isize * 1.4, INK)
        if self.hilfe:
            y = wrapped(c, L + IND, y, "Tipp: " + self.hilfe, W - IND, isize - 1, "Sans-Oblique",
                        (isize - 1) * 1.4, MUTED)
        if self.erklaerung:
            if ctx.loesung:
                y = wrapped(c, L + IND, y, "Lösung: " + self.erklaerung, W - IND, 9.5, "Sans-Oblique",
                            9.5 * 1.4, RED)
            else:
                y -= len(simpleSplit("Lösung: " + self.erklaerung, "Sans-Oblique", 9.5, W - IND)) * 9.5 * 1.4
        return y - 3 * mm

    def draw(self, ctx, y):
        y = self.head(ctx, y, getattr(ctx, "test", False))
        return self.body(ctx, y) - 6 * mm


def wortkasten(ctx, y, woerter, x=L + IND, width=W - IND, titel="Wörter zum Einsetzen:"):
    c = ctx.c
    size = ctx.st.size - 0.5
    gap = 7 * mm
    rows, cur, cw = [], [], 0
    inner = width - 8 * mm
    for w_ in woerter:
        ww = sw(w_, size)
        if cur and cw + gap + ww > inner:
            rows.append(cur)
            cur, cw = [], 0
        cw += ww + (gap if cur else 0)
        cur.append(w_)
    if cur:
        rows.append(cur)
    tsize = 9
    bh = 6.5 * mm + len(rows) * size * 0.36 * mm * 1.9 + 2.5 * mm
    c.setStrokeColor(ctx.accent)
    c.setLineWidth(0.9)
    c.setDash(3, 2)
    c.roundRect(x, y - bh, width, bh, 2.5 * mm, stroke=1, fill=0)
    c.setDash()
    text(c, x + 4 * mm, y - 5 * mm, titel, tsize, "Sans", MUTED)
    yy = y - 6.5 * mm - size * 0.36 * mm * 1.2
    for row in rows:
        xx = x + 4 * mm
        for w_ in row:
            text(c, xx, yy, w_, size, "Sans-Bold")
            xx += sw(w_, size) + gap
        yy -= size * 0.36 * mm * 1.9
    return y - bh - 4 * mm


def letter(k):
    return "abcdefghijklmnopqrstuvwxyz"[k] + ")"


@dataclass
class Saetze(Aufgabe):
    """Sätze mit Kurzschrift: Lücken füllen, Wörter markieren, richtiges Wort einkreisen."""
    titel: str
    anweisung: str
    zeilen: list
    beispiel: str = ""
    woerter: list = None          # Wortkasten; True = automatisch aus den Lücken
    mark: str = "unter"
    min_gap: float = None
    erklaerung: str = ""
    hilfe: str = ""
    punkte: int = None
    legende: list = None           # Kategorienamen für die Lösungsfarben
    tab: float = 62 * mm           # Text nach einem Tabulator (\t) beginnt bei dieser x-Verschiebung

    def __post_init__(self):
        n = sum(count_items(z) for z in self.zeilen)
        if self.punkte is None:
            self.punkte = n
        # „#N“ in der Anweisung = Anzahl der Lösungen, aus den Daten gezählt
        self.anweisung = self.anweisung.replace("#N", str(n))

    def body(self, ctx, y):
        c = ctx.c
        if self.legende and ctx.loesung:
            xx = L + IND
            for k, name in enumerate(self.legende):
                c.setFillColor(CAT[k])
                c.rect(xx, y - 0.5 * mm, 5 * mm, 2.5 * mm, stroke=0, fill=1)
                text(c, xx + 6.5 * mm, y - 0.3 * mm, name, 9.5, "Sans", CAT[k])
                xx += 6.5 * mm + sw(name, 9.5) + 8 * mm
            y -= 6 * mm
        elif self.legende:
            y -= 6 * mm
        if self.woerter:
            ws = self.woerter
            if ws is True:
                ws = []
                for z in self.zeilen:
                    for a in parse(z):
                        ws += [t for kind, t, _ in a if kind == "g"]
                ws = sorted(set(ws), key=str.lower)
            y = wortkasten(ctx, y, ws)
        y -= ctx.st.size * 0.2 * mm
        x0 = L + IND + 7 * mm
        if self.beispiel:
            text(c, L + IND, y, "Beispiel:", 9, "Sans", MUTED)
            y -= 5.5 * mm
            y = inline(ctx, x0, y, self.beispiel, R - x0, mark=self.mark, min_gap=self.min_gap,
                       fill=CAT[2])
        for k, z in enumerate(self.zeilen):
            text(c, L + IND, y, letter(k), ctx.st.size, "Sans", MUTED)
            if "\t" in z:
                left, right = z.split("\t")
                y1 = inline(ctx, x0, y, left, self.tab - 3 * mm, mark=self.mark, min_gap=self.min_gap)
                y2 = inline(ctx, x0 + self.tab, y, right, R - x0 - self.tab, mark=self.mark, min_gap=self.min_gap)
                y = min(y1, y2)
            else:
                y = inline(ctx, x0, y, z, R - x0, mark=self.mark, min_gap=self.min_gap)
        return y + ctx.st.lead - ctx.st.size * 0.36 * mm


@dataclass
class Schreiben(Aufgabe):
    """Zu jedem Auftrag eine Antwort auf Linien schreiben.

    items: Liste von (Auftrag, Lösung). Bei spalten>1 steht die Linie rechts neben dem Auftrag.
    linien: Anzahl Linien unter dem Auftrag (nur bei spalten == 0, „unten“).
    """
    titel: str
    anweisung: str
    items: list
    spalten: int = 1
    linien: int = 1
    beispiel: tuple = None
    erklaerung: str = ""
    hilfe: str = ""
    punkte: int = None
    pro_item: int = 1
    nummern: bool = True
    woerter: list = None
    breit: float = None            # Breite der Auftragsspalte (rechts-Modus)

    def __post_init__(self):
        if self.punkte is None:
            self.punkte = len(self.items) * self.pro_item

    def body(self, ctx, y):
        c = ctx.c
        st = ctx.st
        if self.woerter:
            y = wortkasten(ctx, y, self.woerter)
        y -= st.size * 0.2 * mm
        items = list(self.items)
        if self.spalten == 0:
            x0 = L + IND + (7 * mm if self.nummern else 0)
            all_items = ([("ex",) + tuple(self.beispiel)] if self.beispiel else []) + [("it",) + tuple(i) for i in items]
            k = 0
            for kind, auftrag, loes in all_items:
                if kind == "ex":
                    text(c, L + IND, y, "Beispiel:", 9, "Sans", MUTED)
                    y -= 5.5 * mm
                elif self.nummern:
                    text(c, L + IND, y, letter(k), st.size, "Sans", MUTED)
                    k += 1
                if auftrag:
                    y = inline(ctx, x0, y, auftrag, R - x0, lead=st.size * 0.36 * mm * 1.45)
                    y -= st.write - st.size * 0.36 * mm * 1.45
                sol_lines = simpleSplit(loes, "Sans", st.size, R - x0 - 2 * mm) if loes else []
                n = max(self.linien, len(sol_lines)) if kind == "it" else max(1, len(sol_lines))
                for li in range(n):
                    hline(c, x0, R, y - 1.2 * mm)
                    if (ctx.loesung or kind == "ex") and li < len(sol_lines):
                        text(c, x0 + 1 * mm, y, sol_lines[li], st.size, "Sans",
                             CAT[2] if kind == "ex" else RED)
                    y -= st.write
                y -= 1.5 * mm
            return y + st.write - st.size * 0.36 * mm
        cols = self.spalten
        colw = (W - IND) / cols
        all_items = ([("ex",) + tuple(self.beispiel)] if self.beispiel else []) + [("it",) + tuple(i) for i in items]
        rows = [all_items[i:i + cols] for i in range(0, len(all_items), cols)]
        pw = self.breit or max(sw(strip(a), st.size) for _, a, _ in all_items) + 3 * mm
        k = 0
        for row in rows:
            for ci, (kind, auftrag, loes) in enumerate(row):
                x = L + IND + ci * colw
                if kind == "ex":
                    text(c, x, y + 4.2 * mm, "Beispiel:", 8, "Sans", MUTED)
                    lx = x
                else:
                    if self.nummern:
                        text(c, x, y, letter(k), st.size, "Sans", MUTED)
                    k += 1
                    lx = x + (7 * mm if self.nummern else 0)
                inline(ctx, lx, y, auftrag, pw + 30 * mm)
                x1 = lx + pw
                x2 = x + colw - 5 * mm
                if x2 - x1 < 15 * mm:
                    warn(f"Schreiben „{self.titel}“: zu wenig Platz für die Antwort neben „{auftrag}“")
                hline(c, x1, x2, y - 1.2 * mm)
                if ctx.loesung or kind == "ex":
                    s = loes
                    size = st.size
                    while sw(s, size) > x2 - x1 - 2 * mm and size > 7:
                        size -= 0.5
                    text(c, x1 + 1.5 * mm, y, s, size, "Sans", CAT[2] if kind == "ex" else RED)
            y -= st.write
        return y + st.write - st.size * 0.36 * mm


@dataclass
class Tabelle(Aufgabe):
    """Tabelle; Zellen in Kurzschrift. Eine Zelle nur aus {Lösung} wird eine Linie über die ganze Zelle."""
    titel: str
    anweisung: str
    kopf: list
    zeilen: list
    beispiel: list = None
    breiten: list = None
    erklaerung: str = ""
    hilfe: str = ""
    punkte: int = None
    woerter: list = None

    def __post_init__(self):
        if self.punkte is None:
            self.punkte = sum(count_items(z) for r in self.zeilen for z in r)

    def body(self, ctx, y):
        c = ctx.c
        st = ctx.st
        if self.woerter:
            y = wortkasten(ctx, y, self.woerter)
        x0 = L + IND
        tw = R - x0
        ws = self.breiten or [1] * len(self.kopf)
        cws = [tw * w_ / sum(ws) for w_ in ws]
        rh = st.write
        c.setFillColor(SOFT)
        c.rect(x0, y - 2.6 * mm, tw, rh - 1 * mm, stroke=0, fill=1)
        xx = x0
        for h, cw in zip(self.kopf, cws):
            text(c, xx + 2 * mm, y, h, 10, "Sans-Bold")
            xx += cw
        y -= rh
        rows = ([("ex", r) for r in [self.beispiel]] if self.beispiel else []) + [("it", r) for r in self.zeilen]
        clead = st.size * 0.36 * mm * 1.4
        for kind, row in rows:
            xx = x0
            low = y
            for cell, cw in zip(row, cws):
                full = cell.startswith("{") and cell.endswith("}") and cell.count("{") == 1
                if full:
                    sol = cell[1:-1].partition("|")[0]
                    if kind == "it":
                        hline(c, xx + 2 * mm, xx + cw - 3 * mm, y - 1.2 * mm, INK, 0.7)
                    if ctx.loesung or kind == "ex":
                        size = st.size
                        while sw(sol, size) > cw - 5 * mm and size > 7:
                            size -= 0.5
                        text(c, xx + 2.5 * mm, y, sol, size, "Sans", CAT[2] if kind == "ex" else RED)
                else:
                    end = inline(ctx, xx + 2 * mm, y, cell, cw - 4 * mm, lead=clead,
                                 fill=CAT[2] if kind == "ex" else None)
                    low = min(low, end + clead)
                xx += cw
            y -= y - low      # Zeile wächst mit, wenn eine Zelle umbricht
            hline(c, x0, R, y - rh + st.size * 0.36 * mm + 1.5 * mm, SOFT, 0.8)
            y -= rh
        return y + rh - st.size * 0.36 * mm


@dataclass
class Sortieren(Aufgabe):
    """Wörter aus dem Kasten in Spalten schreiben. spalten: {Überschrift: [Lösungen]}."""
    titel: str
    anweisung: str
    woerter: list
    spalten: dict
    erklaerung: str = ""
    hilfe: str = ""
    punkte: int = None

    def __post_init__(self):
        if self.punkte is None:
            self.punkte = sum(len(v) for v in self.spalten.values())

    def body(self, ctx, y):
        c = ctx.c
        st = ctx.st
        y = wortkasten(ctx, y, self.woerter, titel="Wörter:")
        n = max(len(v) for v in self.spalten.values())
        cols = list(self.spalten.items())
        gap = 4 * mm
        cw = (W - IND - gap * (len(cols) - 1)) / len(cols)
        rh = st.write
        bh = 9 * mm + n * rh
        for k, (h, sols) in enumerate(cols):
            x = L + IND + k * (cw + gap)
            c.setStrokeColor(LINE)
            c.setLineWidth(0.8)
            c.roundRect(x, y - bh, cw, bh, 2 * mm, stroke=1, fill=0)
            c.setFillColor(SOFT)
            c.roundRect(x, y - 8 * mm, cw, 8 * mm, 2 * mm, stroke=0, fill=1)
            ctext(c, x + cw / 2, y - 5.5 * mm, h, 10.5, "Sans-Bold")
            yy = y - 8 * mm - rh + 2.5 * mm
            for i in range(n):
                hline(c, x + 3 * mm, x + cw - 3 * mm, yy - 1.2 * mm)
                if ctx.loesung and i < len(sols):
                    size = st.size
                    while sw(sols[i], size) > cw - 7 * mm and size > 7:
                        size -= 0.5
                    text(c, x + 4 * mm, yy, sols[i], size, "Sans", RED)
                yy -= rh
        return y - bh - 1 * mm


@dataclass
class Lesetext(Aufgabe):
    """Text zum Lesen mit Zeilennummern (ohne Punkte)."""
    titel: str
    anweisung: str
    ueberschrift: str
    absaetze: list
    punkte: int = 0
    erklaerung: str = ""
    hilfe: str = ""
    nummern: bool = True

    def body(self, ctx, y):
        c = ctx.c
        size = 13 if ctx.stufe == 1 else 11.5
        lead = size * (1.65 if ctx.stufe == 1 else 1.5)
        x0 = L + IND + 8 * mm
        lines = []
        for k, p in enumerate(self.absaetze):
            if k:
                lines.append(None)
            lines += simpleSplit(p, "Sans", size, R - x0 - 4 * mm)
        bh = 14 * mm + sum(lead if ln else lead * 0.4 for ln in lines)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.8)
        c.roundRect(L + IND, y - bh, W - IND, bh, 3 * mm, stroke=1, fill=0)
        ctext(c, (L + IND + R) / 2, y - 8 * mm, self.ueberschrift, 13.5, "Sans-Bold")
        yy = y - 8 * mm - lead * 1.25
        nr = 0
        for ln in lines:
            if ln is None:
                yy -= lead * 0.4
                continue
            nr += 1
            if self.nummern and nr % 5 == 0:
                rtext(c, x0 - 3 * mm, yy, str(nr), 7.5, "Sans", MUTED)
            text(c, x0, yy, ln, size)
            yy -= lead
        return y - bh - 2 * mm


@dataclass
class RichtigFalsch(Aufgabe):
    """Aussagen: Kind schreibt R oder F ins Kästchen. aussagen: (Satz, richtig, Korrektur)."""
    titel: str
    anweisung: str
    aussagen: list
    erklaerung: str = ""
    hilfe: str = ""
    punkte: int = None

    def __post_init__(self):
        if self.punkte is None:
            self.punkte = len(self.aussagen)

    def body(self, ctx, y):
        c = ctx.c
        st = ctx.st
        box = 7 * mm
        x0 = L + IND + 7 * mm
        for k, (s, ok, corr) in enumerate(self.aussagen):
            text(c, L + IND, y, letter(k), st.size, "Sans", MUTED)
            lines = simpleSplit(s, "Sans", st.size, R - x0 - box - 6 * mm)
            c.setStrokeColor(INK)
            c.setLineWidth(0.8)
            c.rect(R - box, y - 2 * mm, box, box, stroke=1, fill=0)
            if ctx.loesung:
                ctext(c, R - box / 2, y - 0.2 * mm, "R" if ok else "F", 12, "Sans-Bold", RED)
            yy = y
            for ln in lines:
                text(c, x0, yy, ln, st.size)
                yy -= st.size * 0.36 * mm * 1.45
            if ctx.loesung and corr:
                text(c, x0, yy, "→ " + corr, st.size - 2, "Sans-Oblique", RED)
            yy -= (st.size - 2) * 0.36 * mm * 1.4 if corr else 0
            y = min(yy, y - st.lead) - (st.lead - st.size * 0.36 * mm * 1.45) * 0.6
        return y + st.lead * 0.5


@dataclass
class Verbinden(Aufgabe):
    """Links und rechts passende Paare mit einem Strich verbinden. paare: (links, rechts) in Lösungsreihenfolge."""
    titel: str
    anweisung: str
    paare: list
    seed: int = 3
    erklaerung: str = ""
    hilfe: str = ""
    punkte: int = None

    def __post_init__(self):
        if self.punkte is None:
            self.punkte = len(self.paare)

    def body(self, ctx, y):
        c = ctx.c
        st = ctx.st
        right = [r for _, r in self.paare]
        order = list(range(len(right)))
        rnd = random.Random(self.seed)
        while True:
            rnd.shuffle(order)
            if all(order[i] != i for i in range(len(order))) or len(order) < 2:
                break
        lw = max(sw(a, st.size) for a, _ in self.paare)
        rw = max(sw(b, st.size) for b in right)
        xl = L + IND + 4 * mm
        xr = R - rw - 4 * mm
        dot_l, dot_r = xl + lw + 4 * mm, xr - 4 * mm
        rh = st.lead * 0.95
        for i, (a, _) in enumerate(self.paare):
            yy = y - i * rh
            text(c, xl, yy, a, st.size)
            c.setFillColor(INK)
            c.circle(dot_l, yy + 1.2 * mm, 0.9 * mm, stroke=0, fill=1)
        pos = {}
        for slot, idx in enumerate(order):
            yy = y - slot * rh
            text(c, xr, yy, right[idx], st.size)
            c.circle(dot_r, yy + 1.2 * mm, 0.9 * mm, stroke=0, fill=1)
            pos[idx] = yy
        if ctx.loesung:
            c.setStrokeColor(RED)
            c.setLineWidth(1.2)
            for i in range(len(self.paare)):
                c.line(dot_l, y - i * rh + 1.2 * mm, dot_r, pos[i] + 1.2 * mm)
        return y - (len(self.paare) - 1) * rh - 4 * mm


@dataclass
class Wortkarten(Aufgabe):
    """Wortkarten in die richtige Reihenfolge bringen und den Satz aufschreiben.

    saetze: Lösungssätze. Die Karten werden aus dem Satz gebildet und gemischt.
    """
    titel: str
    anweisung: str
    saetze: list
    seed: int = 7
    satzzeichen_karte: bool = True
    erklaerung: str = ""
    hilfe: str = ""
    punkte: int = None
    linien: int = 1

    def __post_init__(self):
        if self.punkte is None:
            self.punkte = len(self.saetze)

    def cards(self, s, k):
        words = s.split(" ")
        if self.satzzeichen_karte and words[-1][-1] in ".?!":
            words = words[:-1] + [words[-1][:-1], words[-1][-1]]
        order = words[:]
        rnd = random.Random(self.seed + k)
        for _ in range(20):
            rnd.shuffle(order)
            if order != words:
                break
        return order

    def body(self, ctx, y):
        c = ctx.c
        st = ctx.st
        size = st.size - 0.5
        x0 = L + IND + 7 * mm
        for k, s in enumerate(self.saetze):
            text(c, L + IND, y, letter(k), st.size, "Sans", MUTED)
            xx = x0
            yy = y
            for w_ in self.cards(s, k):
                cw = sw(w_, size) + 5 * mm
                if xx + cw > R:
                    xx = x0
                    yy -= 9 * mm
                c.setStrokeColor(LINE)
                c.setLineWidth(0.8)
                c.setFillColor(SOFT)
                c.roundRect(xx, yy - 2.5 * mm, cw, size * 0.36 * mm + 4.5 * mm, 1.5 * mm, stroke=1, fill=1)
                text(c, xx + 2.5 * mm, yy, w_, size)
                xx += cw + 2.5 * mm
            y = yy - st.write
            sol = simpleSplit(s, "Sans", st.size, R - x0)
            for li in range(max(self.linien, len(sol))):
                hline(c, x0, R, y - 1.2 * mm)
                if ctx.loesung and li < len(sol):
                    text(c, x0 + 1 * mm, y, sol[li], st.size, "Sans", RED)
                y -= st.write
            y -= 2 * mm
        return y + st.write - st.size * 0.36 * mm


@dataclass
class Silben(Aufgabe):
    """Silbenbögen: Wörter mit Trennstrichen ('Ba-na-ne'). Das Kind zeichnet Bögen und schreibt getrennt."""
    titel: str
    anweisung: str
    woerter: list
    spalten: int = 2
    erklaerung: str = ""
    hilfe: str = ""
    punkte: int = None
    anzahl: bool = True

    def __post_init__(self):
        if self.punkte is None:
            self.punkte = len(self.woerter)

    def body(self, ctx, y):
        c = ctx.c
        st = ctx.st
        size = st.size + 2
        colw = (W - IND) / self.spalten
        rh = 15 * mm if ctx.stufe == 1 else 13 * mm
        rows = [self.woerter[i:i + self.spalten] for i in range(0, len(self.woerter), self.spalten)]
        for row in rows:
            for ci, wd in enumerate(row):
                x = L + IND + ci * colw
                parts = wd.split("-")
                plain = "".join(parts)
                text(c, x, y, plain, size, "Sans-Bold")
                ww = sw(plain, size, "Sans-Bold")
                x1 = x + ww + 5 * mm
                x2 = x + colw - (14 * mm if self.anzahl else 5 * mm)
                hline(c, x1, x2, y - 1.2 * mm)
                if self.anzahl:
                    c.setStrokeColor(INK)
                    c.setLineWidth(0.8)
                    c.rect(x + colw - 11 * mm, y - 2 * mm, 6.5 * mm, 6.5 * mm, stroke=1, fill=0)
                if ctx.loesung:
                    xx = x
                    c.setStrokeColor(RED)
                    c.setLineWidth(1.2)
                    for p in parts:
                        pw = sw(p, size, "Sans-Bold")
                        c.arc(xx + 0.4 * mm, y - 4.5 * mm, xx + pw - 0.4 * mm, y + 0.5 * mm, 200, 140)
                        xx += pw
                    s = " - ".join(parts)
                    fs = st.size
                    while sw(s, fs) > x2 - x1 - 2 * mm and fs > 7:
                        fs -= 0.5
                    text(c, x1 + 1 * mm, y, s, fs, "Sans", RED)
                    if self.anzahl:
                        ctext(c, x + colw - 7.75 * mm, y - 0.2 * mm, str(len(parts)), 11, "Sans-Bold", RED)
            y -= rh
        return y + rh - size * 0.36 * mm - 3 * mm


@dataclass
class Freitext(Aufgabe):
    """Schreibauftrag mit Linien. checkliste: Punkte zum Überprüfen; beispiel: Musterlösung."""
    titel: str
    anweisung: str
    linien: int = 6
    checkliste: list = None
    beispiel: str = ""
    satzanfaenge: list = None
    punkte: int = 0
    erklaerung: str = ""
    hilfe: str = ""

    def body(self, ctx, y):
        c = ctx.c
        st = ctx.st
        if self.satzanfaenge:
            y = wortkasten(ctx, y, self.satzanfaenge, titel="Diese Satzanfänge helfen dir:")
        if self.checkliste:
            size = 10
            lines = len(self.checkliste)
            bh = 7 * mm + lines * 5.5 * mm
            c.setFillColor(SOFT)
            c.roundRect(L + IND, y - bh, W - IND, bh, 2.5 * mm, stroke=0, fill=1)
            text(c, L + IND + 4 * mm, y - 5 * mm, "Kontrolliere am Schluss:", 9.5, "Sans-Bold")
            yy = y - 10.5 * mm
            for p in self.checkliste:
                c.setStrokeColor(INK)
                c.setLineWidth(0.7)
                c.rect(L + IND + 4 * mm, yy - 0.5 * mm, 3.4 * mm, 3.4 * mm, stroke=1, fill=0)
                text(c, L + IND + 10 * mm, yy, p, size)
                yy -= 5.5 * mm
            y -= bh + 6 * mm
        sol = []
        if self.beispiel:
            sol = simpleSplit(self.beispiel, "Sans", st.size - 0.5, W - IND - 2 * mm)
        n = max(self.linien, len(sol))
        for li in range(n):
            hline(c, L + IND, R, y - 1.2 * mm)
            if ctx.loesung and li < len(sol):
                text(c, L + IND + 1 * mm, y, sol[li], st.size - 0.5, "Sans", RED)
            y -= st.write
        return y + st.write - st.size * 0.36 * mm


# ---------- Blätter ----------
@dataclass
class Blatt:
    titel: str            # z. B. „Nomen“
    art: str              # „Übung“ oder „Lernkontrolle“
    stufe: int
    bausteine: list
    bereich: str
    thema_nr: str
    lernziele: list = field(default_factory=list)

    @property
    def test(self):
        return self.art == "Lernkontrolle"


def number(bausteine):
    nr = 0
    for b in bausteine:
        if isinstance(b, Aufgabe):
            nr += 1
            b.nr = nr


def plan(blatt):
    """Verteilt die Bausteine auf Seiten. Gibt Liste von Seiten (Listen von Bausteinen) zurück.

    Passt die nächste Aufgabe nicht mehr auf die Seite, wird eine spätere, kleinere Aufgabe
    vorgezogen – aber nie vor einen Lesetext, weil die Fragen zum Text gehören. Die Nummern
    folgen danach der neuen Reihenfolge.
    """
    rest = list(blatt.bausteine)
    h = {id(b): b.height(blatt.stufe) for b in rest}
    for b in rest:
        if h[id(b)] > TOP - BOTTOM:
            warn(f"{blatt.titel}: Baustein „{getattr(b, 'titel', '')}“ ist höher als eine Seite")
    pages, cur = [], []
    y = TOP - (lernziele_height(blatt) if blatt.lernziele else 0)
    while rest:
        b = rest[0]
        need = h[id(b)]
        # Merkkasten nie allein unten auf eine Seite stellen
        if isinstance(b, Merkkasten) and len(rest) > 1:
            need += min(h[id(rest[1])], 40 * mm)
        if not cur or y - need >= BOTTOM:
            pick = b
        else:
            pick = None
            for o in rest[1:] if not isinstance(b, Lesetext) else []:
                if isinstance(o, Lesetext):
                    break
                if isinstance(o, Aufgabe) and y - h[id(o)] >= BOTTOM:
                    pick = o
                    break
            if pick is None:
                pages.append(cur)
                cur = []
                y = TOP
                continue
        rest.remove(pick)
        cur.append(pick)
        y -= h[id(pick)]
    pages.append(cur)
    order = [b for p in pages for b in p]
    number(order)
    return pages


LZ_W = W - 60 * mm        # Breite des Lernziele-Kastens (rechts daneben der Punktekasten)


def lernziele_zeilen(blatt):
    out = []
    for z in blatt.lernziele:
        for k, ln in enumerate(simpleSplit(z, "Sans", 10, LZ_W - 14 * mm)):
            out.append(("✓  " if k == 0 else "     ") + ln)
    return out


def lernziele_height(blatt):
    return max(9 * mm + len(lernziele_zeilen(blatt)) * 5 * mm, 30 * mm) + 6 * mm


def footer_height(blatt):
    return 14 * mm


def header(c, blatt, loesung, page, pages, accent):
    c.setFillColor(accent)
    c.rect(0, PAGE_H - 9 * mm, PAGE_W, 9 * mm, stroke=0, fill=1)
    text(c, L, PAGE_H - 6 * mm, f"Deutsch · 3. Klasse · {blatt.bereich}", 9, "Sans-Bold", white)
    rtext(c, R, PAGE_H - 6 * mm, STUFE_NAME[blatt.stufe], 9, "Sans-Bold", white)
    art = blatt.art + (" · Lösungen" if loesung else "")
    tsize = 18
    while sw(blatt.titel, tsize, "Sans-Bold") > W - 78 * mm and tsize > 11:
        tsize -= 0.5
    text(c, L, PAGE_H - 19.5 * mm, blatt.titel, tsize, "Sans-Bold")
    text(c, L, PAGE_H - 26 * mm, f"{art} · Thema {blatt.thema_nr}", 10, "Sans-Bold" if loesung else "Sans",
         RED if loesung else MUTED)
    if not loesung:
        text(c, R - 72 * mm, PAGE_H - 18 * mm, "Name:", 10)
        hline(c, R - 59 * mm, R, PAGE_H - 18.6 * mm)
        text(c, R - 72 * mm, PAGE_H - 26 * mm, "Datum:", 10)
        hline(c, R - 59 * mm, R, PAGE_H - 26.6 * mm)
    else:
        c.setStrokeColor(RED)
        c.setLineWidth(1.4)
        c.roundRect(R - 52 * mm, PAGE_H - 27 * mm, 52 * mm, 11 * mm, 2 * mm, stroke=1, fill=0)
        ctext(c, R - 26 * mm, PAGE_H - 23 * mm, "LÖSUNGEN", 13, "Sans-Bold", RED)
    hline(c, L, R, PAGE_H - 30.5 * mm, INK, 1)
    ctext(c, PAGE_W / 2, 10 * mm, f"Seite {page} von {pages}", 8.5, "Sans", MUTED)


def draw_lernziele(c, blatt, y, accent, loesung, total):
    """Lernziele links, Punktekasten rechts (nur Lernkontrolle)."""
    h = lernziele_height(blatt) - 6 * mm
    bw = 56 * mm
    lw = W - bw - 4 * mm
    c.setStrokeColor(accent)
    c.setLineWidth(0.9)
    c.roundRect(L, y - h, lw, h, 2.5 * mm, stroke=1, fill=0)
    text(c, L + 5 * mm, y - 6 * mm, "Das kannst du nach diesem Thema:", 10, "Sans-Bold", accent)
    yy = y - 12 * mm
    for ln in lernziele_zeilen(blatt):
        text(c, L + 5 * mm, yy, ln, 10)
        yy -= 5 * mm
    bx = R - bw
    c.setStrokeColor(RED if loesung else INK)
    c.setLineWidth(1.2)
    c.roundRect(bx, y - h, bw, h, 2.5 * mm, stroke=1, fill=0)
    if loesung:
        text(c, bx + 4 * mm, y - 6 * mm, f"Total: {total} Punkte", 10.5, "Sans-Bold", RED)
        lines = bewertung(total)
        text(c, bx + 4 * mm, y - 11 * mm, lines[0], 8, "Sans", RED)
        for k, ln in enumerate(lines[1:6]):
            text(c, bx + 4 * mm + (k // 3) * 24 * mm, y - 15 * mm - (k % 3) * 3.8 * mm, ln, 8, "Sans", RED)
        text(c, bx + 4 * mm, y - h + 3 * mm, lines[6], 8, "Sans", RED)
    else:
        text(c, bx + 4 * mm, y - 6 * mm, "Deine Punkte:", 10, "Sans-Bold")
        text(c, bx + 4 * mm, y - h + 6 * mm, f"______ / {total}", 15, "Sans-Bold")
    return y - h - 6 * mm


def draw_footer(c, blatt, y, loesung):
    by = y - 10 * mm
    text(c, L, by, "So ging es mir:", 11)
    for k, mood in enumerate((1, 0, -1)):
        smiley(c, L + 40 * mm + k * 12 * mm, by + 1.5 * mm, mood)
    if loesung:
        rtext(c, R, by, "Andere sinnvolle Antworten sind auch richtig.", 8.5, "Sans", RED)


def bewertung(total):
    """Bewertungsvorschlag aus der Punktzahl berechnet (Note = Punkte / Total × 5 + 1)."""
    out = ["Notenvorschlag:"]
    for note in (6, 5.5, 5, 4.5, 4):
        need = (note - 1) / 5 * total
        out.append(f"{note:g}:  ab {round(need * 2) / 2:g} P.")
    out.append("Lernziel erreicht ab Note 4")
    return out


def render(blatt, path, loesung):
    pages = plan(blatt)
    accent = BEREICH[blatt.bereich]
    total = sum(b.punkte for b in blatt.bausteine if isinstance(b, Aufgabe))
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle(f"{blatt.titel} – {blatt.art} {STUFE_NAME[blatt.stufe]}" + (" – Lösungen" if loesung else ""))
    c.setAuthor("Deutsch 3. Klasse – Jahresprogramm")
    for pi, page in enumerate(pages):
        header(c, blatt, loesung, pi + 1, len(pages), accent)
        y = TOP
        if pi == 0 and blatt.lernziele:
            y = draw_lernziele(c, blatt, y, accent, loesung, total)
        for b in page:
            h = b.height(blatt.stufe)
            ctx = Ctx(c, blatt.stufe, loesung, accent)
            ctx.test = blatt.test
            b.draw(ctx, y)
            y -= h
        if pi == len(pages) - 1 and y - footer_height(blatt) >= BOTTOM - 6 * mm:
            draw_footer(c, blatt, y - 2 * mm, loesung)
        c.showPage()
    c.save()
    return len(pages)


def vorlesetexte(path, titel, bereich, nr, texte):
    """Blatt für die Lehrperson mit den Vorlesetexten (Hörverstehen).

    texte: Liste von (Überschrift, Stufe/Art, [Absätze]). Jeder Text beginnt auf einer neuen Seite.
    """
    accent = BEREICH[bereich]
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle(f"{titel} – Vorlesetexte für die Lehrperson")
    for k, (ueberschrift, wofuer, absaetze) in enumerate(texte):
        c.setFillColor(accent)
        c.rect(0, PAGE_H - 9 * mm, PAGE_W, 9 * mm, stroke=0, fill=1)
        text(c, L, PAGE_H - 6 * mm, f"Deutsch · 3. Klasse · {bereich}", 9, "Sans-Bold", white)
        rtext(c, R, PAGE_H - 6 * mm, "Für die Lehrperson", 9, "Sans-Bold", white)
        text(c, L, PAGE_H - 19.5 * mm, f"Vorlesetext: {ueberschrift}", 17, "Sans-Bold")
        text(c, L, PAGE_H - 26 * mm, f"{wofuer} · Thema {nr}", 10, "Sans", MUTED)
        hline(c, L, R, PAGE_H - 30.5 * mm, INK, 1)
        y = PAGE_H - 40 * mm
        hint = ("So gehen Sie vor: Lesen Sie den Text zweimal langsam und deutlich vor. "
                "Beim ersten Mal hören die Kinder nur zu. Beim zweiten Mal dürfen sie Notizen machen. "
                "Danach lösen sie die Aufgaben auf dem Blatt. Den Text bekommen die Kinder nicht zu sehen.")
        lines = simpleSplit(hint, "Sans", 9.5, W - 10 * mm)
        bh = len(lines) * 9.5 * 1.45 * 0.3528 * mm + 8 * mm
        c.setFillColor(SOFT)
        c.roundRect(L, y - bh, W, bh, 2.5 * mm, stroke=0, fill=1)
        wrapped(c, L + 5 * mm, y - 6 * mm, hint, W - 10 * mm, 9.5, "Sans", 9.5 * 1.45, MUTED)
        y -= bh + 10 * mm
        for p in absaetze:
            y = wrapped(c, L, y, p, W, 13, "Sans", 13 * 1.6) - 4 * mm
        ctext(c, PAGE_W / 2, 10 * mm, f"Seite {k + 1} von {len(texte)}", 8.5, "Sans", MUTED)
        c.showPage()
    c.save()
    return len(texte)
