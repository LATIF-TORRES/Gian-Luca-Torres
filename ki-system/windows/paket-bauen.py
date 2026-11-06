"""Baut das Windows-Paket von A&T: ../download/A-und-T-Windows.zip

Aufruf (aus dem Ordner ki-system):  python3 windows/paket-bauen.py
Nach jeder Änderung an der App neu ausführen und die ZIP mit einchecken.
"""
import os
import zipfile
from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
KI = os.path.dirname(HIER)
ZIEL = os.path.join(KI, "download", "A-und-T-Windows.zip")
SYMBOL = os.path.join(HIER, "a-und-t.ico")
SCHRIFT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Diese Dateien der Web-App kommen ins Paket (Ordner app/).
APP_DATEIEN = ["index.html", "manifest.webmanifest", "css/style.css",
               "js/lib/marked.min.js", "js/lib/purify.min.js",
               "js/daten.js", "js/speicher.js", "js/halal-welt.js", "js/depot.js", "js/ki.js", "js/gemini.js", "js/lokal.js",
               "js/stimme.js", "js/einrichtung.js", "js/neuigkeiten.js", "js/app.js",
               "a-und-t-192.png", "a-und-t-512.png"]


def symbol_zeichnen(groesse=256):
    """Goldener Ring mit „A&T“ auf dunklem Grund, wie das Symbol in der App."""
    bild = Image.new("RGBA", (groesse, groesse), (0, 0, 0, 0))
    z = ImageDraw.Draw(bild)
    rand = groesse * 0.06
    z.ellipse([rand, rand, groesse - rand, groesse - rand],
              fill=(11, 15, 23, 255), outline=(232, 184, 74, 255), width=int(groesse * 0.075))
    schrift = ImageFont.truetype(SCHRIFT, int(groesse * 0.27))
    text = "A&T"
    box = z.textbbox((0, 0), text, font=schrift)
    b, h = box[2] - box[0], box[3] - box[1]
    z.text(((groesse - b) / 2 - box[0], (groesse - h) / 2 - box[1]), text, font=schrift, fill=(232, 184, 74, 255))
    return bild


def main():
    import json, re
    v_json = json.load(open(os.path.join(KI, "version.json")))["version"]
    v_app = re.search(r'APP_VERSION = "([^"]+)"', open(os.path.join(KI, "js", "neuigkeiten.js"), encoding="utf-8").read()).group(1)
    if v_json != v_app:
        raise SystemExit("Version passt nicht: version.json %s, neuigkeiten.js %s" % (v_json, v_app))
    # Symbole für die installierbare Web-App (Handy, Chrome, Edge)
    for g in (192, 512):
        symbol_zeichnen(g).save(os.path.join(KI, "a-und-t-%d.png" % g))
    symbol_zeichnen().save(SYMBOL, sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    os.makedirs(os.path.dirname(ZIEL), exist_ok=True)
    wurzel = "A-und-T/"
    with zipfile.ZipFile(ZIEL, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in ["A-und-T starten.cmd", "Installieren.cmd", "Lokale KI installieren.cmd", "LIESMICH.txt"]:
            zf.write(os.path.join(HIER, name), wurzel + name)
        for name in APP_DATEIEN:
            zf.write(os.path.join(KI, name), wurzel + "app/" + name)
        zf.write(SYMBOL, wurzel + "app/a-und-t.ico")
        zf.write(os.path.join(HIER, "installieren.ps1"), wurzel + "app/installieren.ps1")
        zf.write(os.path.join(HIER, "lokale-ki.ps1"), wurzel + "app/lokale-ki.ps1")
        zf.write(os.path.join(HIER, "starten.ps1"), wurzel + "app/starten.ps1")
        zf.write(os.path.join(KI, "version.json"), wurzel + "app/version.json")
    print("Gebaut:", ZIEL, os.path.getsize(ZIEL), "Bytes")


if __name__ == "__main__":
    main()
