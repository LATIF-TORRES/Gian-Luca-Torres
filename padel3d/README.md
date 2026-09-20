# 🏆 Padel Arena 3D

Ein eigenständiges Browser-3D-Spiel: wähle einen Charakter (Tier oder
menschenähnliche Figur) und spiele Padel gegen einen computergesteuerten
Gegner in einer 3D-Halle. Läuft direkt im Browser (Desktop & Handy), keine
Installation nötig.

Technisch komplett getrennt von der Turnier-App im Hauptordner dieses
Repos — eigenes kleines Projekt mit [Vite](https://vitejs.dev) +
[Three.js](https://threejs.org) + TypeScript.

## Funktionsumfang

- 4 spielbare Charaktere: ein Pferd (kostenlos), ein Papagei, ein Roboter
  und ein Soldat (jeweils mit Münzen freischaltbar)
- Echtes Tennis/Padel-Scoring (Spiele, Einstand/Vorteil, Tiebreak,
  Best-of-3-Sätze) — dieselbe Logik wie im Bot-Training der Hauptapp
- Timing-Minispiel entscheidet jeden Punkt: im richtigen Moment tippen
  (oder Leertaste drücken), während der Marker über die Leiste läuft
- Münzen werden durchs Spielen verdient (pro Punkt + Bonus bei Sieg) und
  lokal im Browser gespeichert (`localStorage`) — kein Konto nötig
- Echtgeld-Käufe sind **bewusst noch nicht eingebaut** (siehe unten)

## Charaktermodelle

Alle vier 3D-Charaktere sind frei nutzbare, fertig animierte
glTF-Modelle aus dem offiziellen
[three.js-Beispielarchiv](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf)
(`Horse.glb`, `Parrot.glb`, `RobotExpressive.glb` von Tomás Laulhé, CC0,
`Soldier.glb`) — Standardmodelle, die in tausenden Three.js-Demos
verwendet werden. Für den Produktivbetrieb mit eigener Optik können sie
jederzeit gegen andere glTF-Dateien in `public/models/` ausgetauscht
werden, ohne Code ändern zu müssen (nur den Pfad + Animationsnamen in
[`src/characters.ts`](./src/characters.ts) anpassen).

## Entwickeln & testen

```bash
npm install
npm run dev
```

Öffnet einen lokalen Server (Adresse wird im Terminal angezeigt).

## Bauen

```bash
npm run build
npm run preview   # lokal den Produktions-Build testen
```

## Deployment

Wird automatisch zusammen mit der Hauptapp über
[`.github/workflows/deploy-web.yml`](../.github/workflows/deploy-web.yml)
gebaut und unter `/game/` auf demselben GitHub-Pages-Link veröffentlicht:

```
https://latif-torres.github.io/Gian-Luca-Torres/game/
```

## Echtgeld-Zahlungen (bewusst noch nicht umgesetzt)

Aktuell werden alle Charaktere ausschließlich mit im Spiel verdienten
Münzen freigeschaltet. Echtgeld-Käufe würden einen Zahlungsanbieter
(z. B. [Stripe](https://stripe.com)) mit eigenem Konto und ggf.
Geschäftsverifizierung erfordern — bewusst als nächster, separater Schritt
zurückgestellt, um nicht denselben Aufwand wie bei der Firebase-Einrichtung
der Hauptapp zu wiederholen, bevor das Spiel grundsätzlich steht.
