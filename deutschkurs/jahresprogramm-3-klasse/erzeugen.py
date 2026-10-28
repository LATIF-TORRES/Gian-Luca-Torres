"""Erzeugt alle PDFs des Jahresprogramms Deutsch 3. Klasse.

Aufruf:  python3 erzeugen.py            (alle Themen)
         python3 erzeugen.py 01 05      (nur diese Themen)
Ausgabe: pdf/<Nr>-<thema>/… je Thema 8 PDFs: Übung und Lernkontrolle, Stufe 1 und 2, je mit Lösungen.
         pdf/00-jahresplan.pdf und pdf/sammelmappen/… (alle Blätter einer Stufe in einer Datei)
"""
import importlib
import pkgutil
import sys
from pathlib import Path

from pypdf import PdfWriter

import themen
from jahresplan import QUARTALE, jahresplan
from werkzeug import Blatt, render

OUT = Path(__file__).parent / "pdf"


def slug(s):
    for a, b in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("Ä", "Ae"), ("Ö", "Oe"), ("Ü", "Ue"), ("ß", "ss")):
        s = s.replace(a, b)
    return "".join(ch if ch.isalnum() else "-" for ch in s.lower()).strip("-").replace("--", "-")


def alle_themen():
    mods = []
    for info in sorted(pkgutil.iter_modules(themen.__path__), key=lambda i: i.name):
        mods.append(importlib.import_module(f"themen.{info.name}"))
    return mods


def erzeuge(mod):
    folder = OUT / f"{mod.NR}-{slug(mod.TITEL)}"
    folder.mkdir(parents=True, exist_ok=True)
    out = []
    for art, fn in (("Übung", mod.uebung), ("Lernkontrolle", mod.test)):
        for stufe in (1, 2):
            name = f"{mod.NR}-{slug(mod.TITEL)}-{'uebung' if art == 'Übung' else 'lernkontrolle'}-stufe{stufe}"
            for loes in (False, True):
                ziele = getattr(mod, f"LERNZIELE_{stufe}", mod.LERNZIELE)   # eigene Ziele je Stufe, falls nötig
                blatt = Blatt(mod.TITEL, art, stufe, fn(stufe), mod.BEREICH, mod.NR,
                              ziele if art == "Lernkontrolle" else [])
                path = folder / (name + ("-loesungen" if loes else "") + ".pdf")
                n = render(blatt, path, loes)
                out.append((path, n))
    extra = getattr(mod, "extra", None)
    if extra:
        out += extra(folder)
    return out


def sammelmappen(mods):
    """Alle Blätter einer Stufe in einer Datei, in der Reihenfolge des Jahresplans."""
    folder = OUT / "sammelmappen"
    folder.mkdir(parents=True, exist_ok=True)
    by_nr = {m.NR: m for m in mods}
    order = [by_nr[nr] for _, ns in QUARTALE for nr in ns]
    out = []
    for stufe in (1, 2):
        for loes, name in ((False, "kinder"), (True, "loesungen")):
            writer = PdfWriter()
            for m in order:
                base = OUT / f"{m.NR}-{slug(m.TITEL)}"
                for art in ("uebung", "lernkontrolle"):
                    f = base / f"{m.NR}-{slug(m.TITEL)}-{art}-stufe{stufe}{'-loesungen' if loes else ''}.pdf"
                    writer.append(str(f))
                if loes and getattr(m, "extra", None):
                    for f in sorted(base.glob("*vorlesetexte*.pdf")):
                        writer.append(str(f))
            path = folder / f"deutsch-3-klasse-stufe{stufe}-{name}.pdf"
            writer.compress_identical_objects()
            with open(path, "wb") as fh:
                writer.write(fh)
            out.append((path, len(writer.pages)))
    return out


if __name__ == "__main__":
    wanted = set(sys.argv[1:])
    mods = alle_themen()
    for mod in mods:
        if wanted and mod.NR not in wanted:
            continue
        for path, n in erzeuge(mod):
            print(f"{path.relative_to(OUT)}  ({n} S.)")
    if not wanted:
        path = OUT / "00-jahresplan.pdf"
        print(f"{path.relative_to(OUT)}  ({jahresplan(path, mods)} S.)")
        for path, n in sammelmappen(mods):
            print(f"{path.relative_to(OUT)}  ({n} S.)")
