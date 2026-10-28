"""Jahresplan und Klassenübersicht für die Lehrperson.

Die Tabellen werden aus den Themen-Modulen gebaut (Titel, Bereich, Lernziele).
"""
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas

from werkzeug import BEREICH, INK, LINE, MUTED, SOFT, ctext, hline, rtext, sw, text, white

# Vorschlag: Reihenfolge im Schuljahr, je Thema etwa zwei Wochen. Die Bereiche wechseln sich ab.
QUARTALE = [
    ("1. Quartal (August bis Oktober)", ["12", "01", "02", "17", "13"]),
    ("2. Quartal (Oktober bis Januar)", ["03", "14", "07", "19", "05"]),
    ("3. Quartal (Januar bis April)", ["04", "15", "06", "18", "08"]),
    ("4. Quartal (April bis Juli)", ["16", "09", "10", "11", "20"]),
]


def jahresplan(path, themen):
    by_nr = {m.NR: m for m in themen}
    assert sorted(n for _, ns in QUARTALE for n in ns) == sorted(by_nr), "Jedes Thema genau einmal einplanen"
    PW, PH = A4
    L, R = 16 * mm, PW - 16 * mm
    W = R - L
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle("Jahresplan Deutsch 3. Klasse")

    def kopf(seite, seiten, titel, sub):
        c.setFillColor(INK)
        c.rect(0, PH - 9 * mm, PW, 9 * mm, stroke=0, fill=1)
        text(c, L, PH - 6 * mm, "Deutsch · 3. Klasse · Jahresprogramm", 9, "Sans-Bold", white)
        rtext(c, R, PH - 6 * mm, "Für die Lehrperson", 9, "Sans-Bold", white)
        text(c, L, PH - 20 * mm, titel, 18, "Sans-Bold")
        text(c, L, PH - 26.5 * mm, sub, 10, "Sans", MUTED)
        hline(c, L, R, PH - 30.5 * mm, INK, 1)
        ctext(c, PW / 2, 10 * mm, f"Seite {seite} von {seiten}", 8.5, "Sans", MUTED)

    # Seite 1: Aufbau des Programms
    kopf(1, 4, "Jahresplan Deutsch – 3. Klasse",
         f"{len(themen)} Themen · je 2 Stufen · Übung und Lernkontrolle mit Lösungen")
    y = PH - 40 * mm
    intro = [
        "Dieses Jahresprogramm deckt die Deutsch-Themen der 3. Klasse ab (Lehrplan 21, Zyklus 2): "
        "Hören, Lesen, Schreiben, Grammatik und Rechtschreibung.",
        "Jedes Thema gibt es in zwei Stufen. ★ Stufe 1 (Grundlagen) ist für Kinder mit Förderbedarf: "
        "grössere Schrift, weniger Aufgaben, Wörterkästen, Beispiele und Tipps. ★★ Stufe 2 (Standard) "
        "entspricht den Anforderungen der 3. Klasse.",
        "Pro Thema und Stufe gibt es ein Übungsblatt und eine Lernkontrolle. Zu jedem Blatt gehört ein "
        "Lösungsblatt mit denselben Seiten; die Lösungen sind rot eingetragen. Die Lernkontrollen haben "
        "Punkte und einen Bewertungsvorschlag (Note = Punkte ÷ Total × 5 + 1).",
    ]
    for p in intro:
        for ln in simpleSplit(p, "Sans", 10.5, W):
            text(c, L, y, ln, 10.5)
            y -= 5.4 * mm
        y -= 2.5 * mm
    y -= 2 * mm
    text(c, L, y, "Bereiche", 12, "Sans-Bold")
    y -= 7 * mm
    for name, col in BEREICH.items():
        nrs = [m.NR for m in themen if m.BEREICH == name]
        c.setFillColor(col)
        c.roundRect(L, y - 1.5 * mm, 4.5 * mm, 4.5 * mm, 1 * mm, stroke=0, fill=1)
        text(c, L + 8 * mm, y, name, 10.5, "Sans-Bold")
        text(c, L + 45 * mm, y, "Themen " + ", ".join(nrs), 10.5)
        y -= 6.5 * mm
    y -= 5 * mm
    text(c, L, y, "Dateien pro Thema", 12, "Sans-Bold")
    y -= 7 * mm
    for ln in ["…-uebung-stufe1.pdf  /  …-uebung-stufe2.pdf",
               "…-lernkontrolle-stufe1.pdf  /  …-lernkontrolle-stufe2.pdf",
               "dazu jeweils …-loesungen.pdf",
               "Thema 19 (Hören): zusätzlich die Vorlesetexte für die Lehrperson"]:
        text(c, L + 4 * mm, y, "•  " + ln, 10)
        y -= 5.6 * mm
    y -= 5 * mm
    text(c, L, y, "Tipps für den Einsatz", 12, "Sans-Bold")
    y -= 7 * mm
    for ln in ["Zuerst den Merkkasten gemeinsam lesen und besprechen.",
               "Die Kinder lösen das Übungsblatt; danach selbst oder zu zweit mit dem Lösungsblatt kontrollieren.",
               "Die Lernkontrolle eine Woche später schreiben.",
               "Kinder in Stufe 1 dürfen jederzeit zu Stufe 2 wechseln, wenn sie sicher sind.",
               "Die Smileys unten auf jedem Blatt zeigen, wie sicher sich das Kind fühlt."]:
        for k, part in enumerate(simpleSplit(ln, "Sans", 10, W - 10 * mm)):
            text(c, L + 4 * mm, y, ("•  " if k == 0 else "    ") + part, 10)
            y -= 5.4 * mm
    c.showPage()

    # Seiten 2–3: Jahresplan nach Quartalen
    seite = 2
    y = None
    for qi, (q, nrs) in enumerate(QUARTALE):
        if qi % 2 == 0:
            if qi:
                c.showPage()
                seite += 1
            kopf(seite, 4, "Jahresplan: Reihenfolge im Schuljahr",
                 "Vorschlag – je Thema etwa zwei Wochen. Die Reihenfolge kann angepasst werden.")
            y = PH - 40 * mm
        c.setFillColor(SOFT)
        c.roundRect(L, y - 3 * mm, W, 9 * mm, 2 * mm, stroke=0, fill=1)
        text(c, L + 4 * mm, y, q, 12, "Sans-Bold")
        y -= 11 * mm
        for woche, nr in enumerate(nrs):
            m = by_nr[nr]
            col = BEREICH[m.BEREICH]
            c.setFillColor(col)
            c.roundRect(L, y - 2 * mm, 11 * mm, 6.5 * mm, 1.5 * mm, stroke=0, fill=1)
            ctext(c, L + 5.5 * mm, y, nr, 10, "Sans-Bold", white)
            text(c, L + 15 * mm, y, m.TITEL, 11, "Sans-Bold")
            rtext(c, R, y, f"{m.BEREICH} · Woche {woche * 2 + 1}–{woche * 2 + 2}", 9, "Sans", col)
            y -= 5.5 * mm
            for z in m.LERNZIELE:
                for k, part in enumerate(simpleSplit(z, "Sans", 9, W - 20 * mm)):
                    text(c, L + 15 * mm, y, ("✓  " if k == 0 else "    ") + part, 9, "Sans", MUTED)
                    y -= 4.4 * mm
            y -= 3.5 * mm
        y -= 4 * mm
    c.showPage()

    # Seite 4: Klassenübersicht (quer)
    c.setPageSize(landscape(A4))
    QW, QH = landscape(A4)
    ql, qr = 12 * mm, QW - 12 * mm
    c.setFillColor(INK)
    c.rect(0, QH - 9 * mm, QW, 9 * mm, stroke=0, fill=1)
    text(c, ql, QH - 6 * mm, "Deutsch · 3. Klasse · Jahresprogramm", 9, "Sans-Bold", white)
    rtext(c, qr, QH - 6 * mm, "Für die Lehrperson", 9, "Sans-Bold", white)
    text(c, ql, QH - 19 * mm, "Klassenübersicht: Lernkontrollen", 16, "Sans-Bold")
    text(c, ql, QH - 25 * mm, "Tragen Sie die Note oder die Stufe ein (z. B. „5 / ★★“).", 9.5, "Sans", MUTED)
    ctext(c, QW / 2, 8 * mm, "Seite 4 von 4", 8.5, "Sans", MUTED)
    order = [nr for _, ns in QUARTALE for nr in ns]
    name_w = 46 * mm
    cw = (qr - ql - name_w) / len(order)
    top = QH - 32 * mm
    hh = 30 * mm
    rows = 18
    rh = (top - hh - 14 * mm) / rows
    for k, nr in enumerate(order):
        x = ql + name_w + k * cw
        col = BEREICH[by_nr[nr].BEREICH]
        c.setFillColor(col)
        c.rect(x, top - 7 * mm, cw, 7 * mm, stroke=0, fill=1)
        ctext(c, x + cw / 2, top - 5 * mm, nr, 9, "Sans-Bold", white)
        c.saveState()
        c.translate(x + cw / 2 + 1.2 * mm, top - 9 * mm)
        c.rotate(90)
        t = by_nr[nr].TITEL.replace("Lesen: ", "").replace("Hören: ", "").replace("Schreiben: ", "")
        size = 7
        while sw(t, size) > hh - 10 * mm and size > 5:
            size -= 0.25
        rtext(c, 0, 0, t, size, "Sans", INK)
        c.restoreState()
    text(c, ql, top - 5 * mm, "Name", 10, "Sans-Bold")
    y0 = top - hh
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    for r in range(rows + 1):
        c.line(ql, y0 - r * rh, qr, y0 - r * rh)
    for k in range(len(order) + 1):
        x = ql + name_w + k * cw
        c.line(x, top - 7 * mm, x, y0 - rows * rh)
    c.line(ql, y0, ql, y0 - rows * rh)
    c.showPage()
    c.save()
    return 4
