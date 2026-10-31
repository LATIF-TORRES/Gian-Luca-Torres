"""Stellt die Verkaufspakete zusammen (z. B. für eduki).

Aufruf:  python3 verkauf.py        (vorher python3 erzeugen.py ausführen)
Ausgabe: verkauf/<Produkt>/<Produkt>.pdf   Titelblatt, Nutzungsbedingungen, Inhalt, alle Blätter
         verkauf/<Produkt>/vorschau-*.png  Vorschaubilder mit Wasserzeichen „VORSCHAU“
         verkauf/verkaufstexte.md          Titel, Beschreibung, Stichwörter und Preisvorschlag
"""
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfgen import canvas

from erzeugen import OUT as PDF, alle_themen, slug
from jahresplan import QUARTALE
from werkzeug import BEREICH, INK, LINE, MARKE, MUTED, RED, SOFT, ctext, hline, rtext, text, white

HERE = Path(__file__).parent
VERKAUF = HERE / "verkauf"
PW, PH = A4
L, R = 18 * mm, PW - 18 * mm
W = R - L
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

PREIS = {"komplett": "CHF 29.90", "stufe": "CHF 19.90", "thema": "CHF 3.50"}


# ---------- Dateien eines Themas ----------
def datei(m, art, stufe, loes):
    base = PDF / f"{m.NR}-{slug(m.TITEL)}"
    return base / f"{m.NR}-{slug(m.TITEL)}-{art}-stufe{stufe}{'-loesungen' if loes else ''}.pdf"


def vorlese(m):
    return sorted((PDF / f"{m.NR}-{slug(m.TITEL)}").glob("*vorlesetexte*.pdf"))


def seiten(f):
    return len(PdfReader(str(f)).pages)


def reihenfolge(mods):
    by_nr = {m.NR: m for m in mods}
    return [by_nr[nr] for _, ns in QUARTALE for nr in ns]


# ---------- Vorspann: Titelblatt, Nutzung, Inhalt ----------
def miniaturen(pdfs, tmp):
    """Erste Seite einiger Blätter als Bild, für das Titelblatt."""
    out = []
    for k, f in enumerate(pdfs):
        stem = Path(tmp) / f"mini{k}"
        subprocess.run(["pdftoppm", "-r", "110", "-png", "-f", "1", "-l", "1", "-singlefile", str(f), str(stem)],
                       check=True)
        out.append(str(stem) + ".png")
    return out


def titelblatt(c, titel, untertitel, merkmale, bilder):
    # Farbstreifen der fünf Bereiche
    farben = list(BEREICH.values())
    sw_ = PW / len(farben)
    for k, col in enumerate(farben):
        c.setFillColor(col)
        c.rect(k * sw_, PH - 14 * mm, sw_, 14 * mm, stroke=0, fill=1)
    text(c, L, PH - 38 * mm, "Deutsch", 40, "Sans-Bold", INK)
    text(c, L, PH - 52 * mm, "3. Klasse", 28, "Sans-Bold", farben[3])
    y = PH - 66 * mm
    for ln in simpleSplit(titel, "Sans-Bold", 17, W):
        text(c, L, y, ln, 17, "Sans-Bold", INK)
        y -= 8 * mm
    for ln in simpleSplit(untertitel, "Sans", 11.5, W):
        text(c, L, y, ln, 11.5, "Sans", MUTED)
        y -= 6 * mm
    # Miniaturen echter Seiten, leicht versetzt
    bw = (W - 2 * 6 * mm) / 3
    top = PH - 100 * mm
    for k, b in enumerate(bilder[:3]):
        img = ImageReader(b)
        iw, ih = img.getSize()
        bh = bw * ih / iw
        x = L + k * (bw + 6 * mm)
        yy = top - bh + (6 * mm if k == 1 else 0)
        c.setFillColor(LINE)
        c.rect(x + 1.5 * mm, yy - 1.5 * mm, bw, bh, stroke=0, fill=1)
        c.drawImage(img, x, yy, bw, bh)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        c.rect(x, yy, bw, bh, stroke=1, fill=0)
    # Merkmale
    y = 64 * mm
    for m_ in merkmale:
        c.setFillColor(farben[3])
        c.circle(L + 2 * mm, y + 1.3 * mm, 1.3 * mm, stroke=0, fill=1)
        text(c, L + 7 * mm, y, m_, 11.5, "Sans", INK)
        y -= 7 * mm
    hline(c, L, R, 22 * mm, LINE, 0.8)
    text(c, L, 15 * mm, "Lehrplan 21 · Zyklus 2 · Schweizer Rechtschreibung", 9, "Sans", MUTED)
    rtext(c, R, 15 * mm, MARKE, 10, "Sans-Bold", INK)
    c.showPage()


def nutzung(c, aufbau):
    text(c, L, PH - 28 * mm, "So ist das Material aufgebaut", 16, "Sans-Bold")
    y = PH - 38 * mm
    for p in aufbau:
        for ln in simpleSplit(p, "Sans", 10.5, W):
            text(c, L, y, ln, 10.5)
            y -= 5.3 * mm
        y -= 2.5 * mm
    y -= 6 * mm
    text(c, L, y, "Nutzungsbedingungen", 16, "Sans-Bold")
    y -= 10 * mm
    regeln = [
        "Du darfst das Material für deinen eigenen Unterricht beliebig oft ausdrucken und kopieren – "
        "auch für Förderunterricht, Nachhilfe und Hausaufgaben deiner eigenen Schülerinnen und Schüler.",
        "Du darfst es digital mit deiner eigenen Klasse teilen (z. B. in einer geschlossenen Lernplattform).",
        "Nicht erlaubt: das Material an andere Lehrpersonen oder Schulen weitergeben, öffentlich ins "
        "Internet stellen oder (auch verändert) weiterverkaufen. Für Kolleginnen und Kollegen bitte eine "
        "eigene Lizenz kaufen.",
        f"Alle Texte und Aufgaben: © {MARKE}. Alle Rechte vorbehalten.",
    ]
    for p in regeln:
        lines = simpleSplit(p, "Sans", 10.5, W - 6 * mm)
        c.setFillColor(INK)
        c.circle(L + 1.5 * mm, y + 1.3 * mm, 1 * mm, stroke=0, fill=1)
        for ln in lines:
            text(c, L + 6 * mm, y, ln, 10.5)
            y -= 5.3 * mm
        y -= 2.5 * mm
    y -= 6 * mm
    c.setFillColor(SOFT)
    c.roundRect(L, y - 22 * mm, W, 24 * mm, 3 * mm, stroke=0, fill=1)
    text(c, L + 5 * mm, y - 5 * mm, "Tipp zum Drucken", 11, "Sans-Bold")
    for k, ln in enumerate(simpleSplit(
            "Drucke die Blätter in Originalgrösse (100 %, nicht „an Seite anpassen“). Die Lösungsblätter "
            "haben dieselben Seiten wie die Kinderblätter – die Lösungen sind rot eingetragen.",
            "Sans", 10, W - 10 * mm)):
        text(c, L + 5 * mm, y - 11 * mm - k * 5 * mm, ln, 10)
    c.showPage()


def inhalt(c, eintraege, start):
    """eintraege: Liste von (Ebene, Text, Seite im Inhalt-Body); start: Seitenversatz."""
    text(c, L, PH - 28 * mm, "Inhalt", 16, "Sans-Bold")
    y = PH - 40 * mm
    for ebene, t, seite in eintraege:
        if y < 22 * mm:
            c.showPage()
            y = PH - 25 * mm
        size = 11 if ebene == 0 else 9.5
        font = "Sans-Bold" if ebene == 0 else "Sans"
        x = L + (0 if ebene == 0 else 6 * mm)
        if ebene == 0:
            y -= 2 * mm
        text(c, x, y, t, size, font)
        rtext(c, R, y, str(seite + start), size, font)
        c.setStrokeColor(LINE)
        c.setDash(1, 2)
        c.line(x + c.stringWidth(t, font, size) + 2 * mm, y + 0.5 * mm, R - c.stringWidth(str(seite + start), font, size) - 2 * mm, y + 0.5 * mm)
        c.setDash()
        y -= 6.5 * mm if ebene == 0 else 5.2 * mm
    c.showPage()


def inhalt_seiten(eintraege):
    """Wie viele Seiten braucht das Inhaltsverzeichnis? (gleiche Rechnung wie inhalt())."""
    y, n = PH - 40 * mm, 1
    for ebene, _, _ in eintraege:
        if y < 22 * mm:
            n += 1
            y = PH - 25 * mm
        if ebene == 0:
            y -= 2 * mm
        y -= 6.5 * mm if ebene == 0 else 5.2 * mm
    return n


# ---------- Produkte ----------
def baue(name, titel, untertitel, merkmale, aufbau, teile, mini):
    """teile: Liste von (Ebene, Überschrift, [PDF-Dateien]). Erzeugt PDF mit Vorspann und Lesezeichen."""
    folder = VERKAUF / name
    if folder.exists():
        shutil.rmtree(folder)
    folder.mkdir(parents=True)
    eintraege, seite = [], 1
    for ebene, t, files in teile:
        eintraege.append((ebene, t, seite))
        seite += sum(seiten(f) for f in files)
    vorspann = 2 + inhalt_seiten(eintraege)
    with tempfile.TemporaryDirectory() as tmp:
        front = Path(tmp) / "front.pdf"
        c = canvas.Canvas(str(front), pagesize=A4)
        c.setTitle(titel)
        c.setAuthor(MARKE)
        titelblatt(c, titel, untertitel, merkmale, miniaturen(mini, tmp))
        nutzung(c, aufbau)
        inhalt(c, eintraege, vorspann)
        c.save()
        writer = PdfWriter()
        writer.append(str(front))
        eltern = {}
        for (ebene, t, files), (_, _, s) in zip(teile, eintraege):
            mark = writer.add_outline_item(t, s - 1 + vorspann, parent=eltern.get(ebene - 1))
            eltern[ebene] = mark
            for f in files:
                writer.append(str(f), import_outline=False)
        writer.add_metadata({"/Title": titel, "/Author": MARKE})
        writer.compress_identical_objects()
        out = folder / f"{name}.pdf"
        with open(out, "wb") as fh:
            writer.write(fh)
    n = len(PdfReader(str(out)).pages)
    vorschau(out, folder, [1, vorspann + 1, vorspann + 2, beispiel_loesung(teile, vorspann)])
    return out, n


def beispiel_loesung(teile, vorspann):
    """Seitennummer einer Lösungsseite (für die Vorschau)."""
    s = 1
    for ebene, t, files in teile:
        for f in files:
            if "loesungen" in f.name:
                return s + vorspann
            s += seiten(f)
    return vorspann + 3


def vorschau(pdf, folder, nummern):
    """PNG-Vorschaubilder; alle ausser dem Titelblatt mit Wasserzeichen „VORSCHAU“."""
    font = ImageFont.truetype(FONT, 110)
    for k, nr in enumerate(nummern):
        stem = folder / f"vorschau-{k + 1}"
        subprocess.run(["pdftoppm", "-r", "100", "-png", "-f", str(nr), "-l", str(nr), "-singlefile",
                        str(pdf), str(stem)], check=True)
        if k == 0:
            continue
        im = Image.open(str(stem) + ".png").convert("RGBA")
        lay = Image.new("RGBA", im.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(lay)
        for yy in (0.3, 0.7):
            box = d.textbbox((0, 0), "VORSCHAU", font=font)
            tw, th = box[2] - box[0], box[3] - box[1]
            tile = Image.new("RGBA", (tw + 40, th + 60), (0, 0, 0, 0))
            ImageDraw.Draw(tile).text((20, 10), "VORSCHAU", font=font, fill=(200, 40, 28, 70))
            tile = tile.rotate(30, expand=True)
            lay.alpha_composite(tile, ((im.width - tile.width) // 2, int(im.height * yy - tile.height / 2)))
        Image.alpha_composite(im, lay).convert("RGB").save(str(stem) + ".png")


def main():
    mods = alle_themen()
    order = reihenfolge(mods)
    plan = PDF / "00-jahresplan.pdf"
    produkte = []
    aufbau_basis = [
        "★ Stufe 1 (Grundlagen) ist für Kinder mit Förderbedarf: grössere Schrift, weniger Aufgaben, "
        "Wörterkästen, Beispiele und Tipps. ★★ Stufe 2 (Standard) entspricht den Anforderungen der 3. Klasse.",
        "Jedes Thema hat ein Übungsblatt mit Merkkasten und eine Lernkontrolle mit Punkten und Notenvorschlag. "
        "Zu jedem Blatt gibt es ein Lösungsblatt.",
        "Die Aufgaben sind in kurzen, klaren Sätzen formuliert. Jede Aufgabe beginnt mit einem Verb.",
    ]

    # 1) Komplettpaket
    teile = [(0, "Jahresplan und Klassenübersicht", [plan])]
    for stufe in (1, 2):
        for loes, was in ((False, "Kinderblätter"), (True, "Lösungen")):
            teile.append((0, f"Stufe {stufe} – {was}", []))
            for m in order:
                fs = [datei(m, a, stufe, loes) for a in ("uebung", "lernkontrolle")]
                if loes and stufe == 2:
                    fs += vorlese(m)
                teile.append((1, f"{m.NR} {m.TITEL}", fs))
    produkte.append(("komplett", "deutsch-3-klasse-jahresprogramm-komplett",
                     "Jahresprogramm komplett – beide Stufen",
                     "20 Themen für das ganze Schuljahr: Hören, Lesen, Schreiben, Grammatik, Rechtschreibung. "
                     "Mit Förderstufe und Standardstufe.",
                     teile))
    # 2) Je Stufe
    for stufe, name in ((1, "Förderstufe (★ Grundlagen)"), (2, "Standardstufe (★★)")):
        teile = [(0, "Jahresplan und Klassenübersicht", [plan]), (0, "Kinderblätter", [])]
        for m in order:
            teile.append((1, f"{m.NR} {m.TITEL}", [datei(m, a, stufe, False) for a in ("uebung", "lernkontrolle")]))
        teile.append((0, "Lösungen", []))
        for m in order:
            teile.append((1, f"{m.NR} {m.TITEL}",
                          [datei(m, a, stufe, True) for a in ("uebung", "lernkontrolle")] + vorlese(m)))
        produkte.append(("stufe", f"deutsch-3-klasse-jahresprogramm-stufe{stufe}",
                         f"Jahresprogramm – {name}",
                         "20 Themen für das ganze Schuljahr, alle Blätter einer Stufe mit Lösungen.", teile))
    # 3) Themenhefte
    for m in sorted(mods, key=lambda m: m.NR):
        teile = []
        for stufe in (1, 2):
            teile.append((0, f"Stufe {stufe}", []))
            teile.append((1, "Übung", [datei(m, "uebung", stufe, False)]))
            teile.append((1, "Lernkontrolle", [datei(m, "lernkontrolle", stufe, False)]))
        teile.append((0, "Lösungen", []))
        for stufe in (1, 2):
            teile.append((1, f"Stufe {stufe}", [datei(m, a, stufe, True) for a in ("uebung", "lernkontrolle")]))
        if vorlese(m):
            teile.append((1, "Vorlesetexte für die Lehrperson", vorlese(m)))
        produkte.append(("thema", f"deutsch-3-klasse-{m.NR}-{slug(m.TITEL)}", m.TITEL,
                         f"Themenheft {m.NR} · {m.BEREICH} · zwei Stufen mit Lösungen", teile, m))

    if VERKAUF.exists():
        shutil.rmtree(VERKAUF)
    VERKAUF.mkdir()
    ergebnisse = []
    for p in produkte:
        art, name, titel, unter, teile = p[:5]
        files = [f for _, _, fs in teile for f in fs]
        n_blatt = sum(1 for f in files if "loesungen" not in f.name and "jahresplan" not in f.name
                      and "vorlese" not in f.name)
        merkmale = [f"{n_blatt} Arbeitsblätter mit Lösungen",
                    "Übungen und Lernkontrollen mit Notenvorschlag",
                    "Zwei Stufen: Förderniveau und Standard" if art != "stufe" else "Merkkästen, Tipps und Beispiele",
                    "Druckfertig, sofort einsetzbar"]
        if art == "thema":
            merkmale[0] = f"{n_blatt} Blätter (Übung und Lernkontrolle, je zwei Stufen) mit Lösungen"
        mini = [f for f in files if "loesungen" not in f.name and "jahresplan" not in f.name][:3]
        out, n = baue(name, titel, unter, merkmale, aufbau_basis, teile, mini)
        ergebnisse.append((p, out, n, n_blatt))
        print(f"{out.relative_to(HERE)}  ({n} S.)")
    texte(ergebnisse)


# ---------- Verkaufstexte ----------
def texte(ergebnisse):
    zeilen = [f"# Verkaufstexte – Deutsch 3. Klasse ({MARKE})", "",
              "Fertige Texte zum Kopieren in die Produktseite (z. B. eduki). Preise sind Vorschläge.", "",
              "Allgemeine Angaben für alle Produkte:", "",
              "- Fach: Deutsch",
              "- Klassenstufe: 3. Klasse (Zyklus 2, Lehrplan 21); als Förderstufe auch für die 4. Klasse",
              "- Schulart: Primarschule",
              "- Materialart: Arbeitsblätter, Lernkontrollen, Lösungen",
              "- Sprache: Deutsch (Schweizer Rechtschreibung mit ss)", ""]
    for p, out, n, n_blatt in ergebnisse:
        art, name, titel, unter, teile = p[:5]
        zeilen += [f"## {titel}", "",
                   f"**Datei:** `verkauf/{name}/{name}.pdf` ({n} Seiten)  ",
                   f"**Vorschaubilder:** `verkauf/{name}/vorschau-1.png` bis `vorschau-4.png`  ",
                   f"**Preisvorschlag:** {PREIS[art]}", ""]
        if art == "thema":
            m = p[5]
            zeilen += [f"**Titel:** Deutsch 3. Klasse: {m.TITEL} – Übungen und Lernkontrollen in 2 Stufen", "",
                       "**Kurzbeschreibung:**", "",
                       f"Alles zum Thema „{m.TITEL}“ für die 3. Klasse: Übungsblatt mit Merkkasten und "
                       f"Lernkontrolle, jeweils in einer Förderstufe und einer Standardstufe – mit Lösungen.", "",
                       "**Beschreibung:**", "",
                       "Mit diesem Themenheft übst und prüfst du das Thema differenziert:", "",
                       "- ★ Stufe 1 (Grundlagen): grössere Schrift, weniger Aufgaben, Wörterkästen, Beispiele "
                       "und Tipps – ideal für Kinder mit Förderbedarf oder DaZ",
                       "- ★★ Stufe 2 (Standard): Anforderungen der 3. Klasse",
                       "- Je ein Übungsblatt mit Merkkasten und eine Lernkontrolle mit Punkten und Notenvorschlag",
                       "- Lösungsblätter mit denselben Seiten, Lösungen rot eingetragen",
                       "- Lernziele stehen auf jeder Lernkontrolle"]
            if m.NR == "19":
                zeilen.append("- Vorlesetexte für die Lehrperson")
            zeilen += ["", "**Lernziele:**", ""] + [f"- {z}" for z in m.LERNZIELE] + [""]
            zeilen += ["**Stichwörter:** " + ", ".join([m.TITEL, m.BEREICH, "3. Klasse", "Deutsch", "Arbeitsblatt",
                                                         "Lernkontrolle", "differenziert", "Förderung",
                                                         "Lehrplan 21", "mit Lösungen"]), ""]
        else:
            zeilen += [f"**Titel:** Deutsch 3. Klasse – {titel} ({n_blatt} Arbeitsblätter mit Lösungen)", "",
                       "**Kurzbeschreibung:**", "",
                       f"{unter} Mit Übungen, Lernkontrollen (mit Notenvorschlag) und Lösungen – druckfertig.", "",
                       "**Beschreibung:**", "",
                       "Ein komplettes Deutsch-Jahresprogramm für die 3. Klasse. Jedes Thema hat ein "
                       "Übungsblatt mit Merkkasten und eine Lernkontrolle mit Punkten und Notenvorschlag. "
                       "Zu jedem Blatt gibt es ein Lösungsblatt mit denselben Seiten.", "",
                       "Enthalten:", "",
                       "- Jahresplan mit Reihenfolge für vier Quartale und Klassenübersicht zum Eintragen",
                       "- 20 Themen: Nomen, Begleiter, Verben, Zeitformen, Adjektive, Pronomen, Satzarten, "
                       "Satzbau, Komma, wörtliche Rede, Wortfamilien, Abc und Wörterbuch, Silben, doppelte "
                       "Mitlaute, lange Selbstlaute, Verlängern und Ableiten, Lesen (Geschichten und Sachtexte), "
                       "Hören (mit Vorlesetexten), Geschichten schreiben"]
            if art == "komplett":
                zeilen += ["- Beide Stufen: ★ Förderstufe (grössere Schrift, Wörterkästen, Tipps) und "
                           "★★ Standardstufe – ideal für differenzierten Unterricht"]
            else:
                zeilen += ["- " + ("★ Förderstufe: grössere Schrift, weniger Aufgaben, Wörterkästen, Beispiele "
                                   "und Tipps" if "stufe1" in name else "★★ Standardstufe: Anforderungen der 3. Klasse")]
            foerder = "" if "stufe2" in name else "differenziert, Förderung, "
            zeilen += ["- PDF mit Inhaltsverzeichnis und Lesezeichen", "",
                       "**Stichwörter:** Deutsch, 3. Klasse, Jahresplanung, Arbeitsblätter, Lernkontrollen, "
                       f"Grammatik, Rechtschreibung, Lesen, Hören, Schreiben, {foerder}Lehrplan 21, mit Lösungen", ""]
    zeilen += ["## Vor dem Hochladen prüfen", "",
               f"- Verkäufername: In `werkzeug.py` steht `MARKE = \"{MARKE}\"`. Wenn du unter einem anderen "
               "Namen verkaufst, dort ändern und `python3 erzeugen.py` und `python3 verkauf.py` neu ausführen.",
               "- Vorschaubilder: Bild 1 ist das Titelblatt, die anderen haben das Wasserzeichen „VORSCHAU“.",
               "- Preise und Gebühren der Plattform vor dem Veröffentlichen prüfen.", ""]
    (VERKAUF / "verkaufstexte.md").write_text("\n".join(zeilen), encoding="utf-8")


if __name__ == "__main__":
    main()
