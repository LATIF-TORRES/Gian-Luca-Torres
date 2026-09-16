# 🏆 Padel Arena

Eine Padel-Turnier-App im olympischen Format: Gruppenphase → K.o.-Runde →
Halbfinale/Finale/Bronze-Spiel. Spieler:innen treten mit einem
Online-Benutzernamen an, bilden 2v2-Teams und verfolgen ihre Erfolge in einer
globalen Rangliste.

Gebaut mit **React Native (Expo)** + **Firebase** (Auth & Firestore).

## Funktionsumfang (aktueller Stand — Kern-App)

- Registrierung/Login mit einzigartigem Online-Benutzernamen
- Turniere erstellen (4/6/8/12/16 Teams) mit automatischer Gruppeneinteilung
- Olympisches Turniersystem: Round-Robin-Gruppenphase, danach automatisch
  generierte K.o.-Runde (Viertelfinale → Halbfinale → Finale) **inklusive
  Spiel um Bronze**
- Turnierbeitritt per 6-stelligem Code
- Manuelle Satz-Ergebniseingabe pro Match (bis zu 3 Sätze)
- Live-Synchronisation über Firestore (alle Teilnehmer:innen sehen Änderungen
  sofort)
- Globale Rangliste (Turniersiege, Matchsiege/-niederlagen)
- Profil mit Statistiken
- **Realistischer 3D-Avatar** (siehe unten): eigener, fotorealistischer,
  animierter 3D-Charakter statt Farbkreis mit Initialen
- **Training gegen Bots**: 4 Schwierigkeitsstufen, echtes Tennis/Padel-Scoring
  (Spiele, Einstand/Vorteil, Tiebreak), Punktgewinn über ein Timing-Minispiel

**Noch nicht enthalten (nächste Ausbaustufe):** Echtzeit-Online-Matchmaking
gegen fremde Spieler:innen (aktuell werden Turniere/Teams manuell angelegt,
aber vollständig online synchronisiert).

## Voraussetzungen

- Node.js 18+
- Ein kostenloses [Firebase](https://console.firebase.google.com)-Projekt
- Zum Testen auf dem eigenen Handy: die **Expo Go**-App (App Store / Play
  Store) — kein Mac und kein Entwickler-Account nötig
- Für eine **echte App-Store-Veröffentlichung** später: ein
  [Apple Developer Account](https://developer.apple.com/programs/) (99 $/Jahr)

## 1. Firebase einrichten

1. Neues Projekt auf [console.firebase.google.com](https://console.firebase.google.com) anlegen.
2. **Build → Authentication → Sign-in method** → "E-Mail/Passwort" aktivieren.
3. **Build → Firestore Database** → Datenbank erstellen (Produktionsmodus).
4. Die Regeln aus [`firestore.rules`](./firestore.rules) in der Firebase
   Console unter **Firestore → Regeln** einfügen und veröffentlichen.
5. **Projekteinstellungen → Meine Apps → Web-App hinzufügen** (das "</>"-Icon),
   einen beliebigen Namen vergeben und die angezeigten Config-Werte
   kopieren.
6. `.env.example` nach `.env` kopieren und die Werte eintragen:

   ```bash
   cp .env.example .env
   ```

## 2. App starten

```bash
npm install
npm start
```

Danach den QR-Code mit der **Expo Go**-App (iOS/Android) scannen — die App
läuft sofort auf deinem Handy, ganz ohne Build oder App-Store-Account.

## 3. Später im App Store veröffentlichen

Das ist der Teil, den nur du selbst machen kannst (Apple erlaubt keine
Veröffentlichung durch Dritte für dich):

1. Einen [Apple Developer Account](https://developer.apple.com/programs/)
   anlegen (99 $/Jahr).
2. [EAS CLI](https://docs.expo.dev/build/setup/) installieren:
   `npm install -g eas-cli`
3. `eas login`, dann `eas build:configure`
4. Build erstellen: `eas build --platform ios`
5. Einreichen: `eas submit --platform ios`

Für Android läuft der Weg über die Google Play Console analog und ist
günstiger (einmalig 25 $).

## 3D-Avatare (realistische Charaktere)

Statt eines Farbkreises mit Initialen kann sich jede:r Spieler:in im Profil
einen **fotorealistischen, animierten 3D-Charakter** erstellen — über
[Ready Player Me](https://readyplayer.me), einem kostenlosen Avatar-Studio,
das direkt in der App eingebettet ist (Foto hochladen oder Charakter frei
gestalten). Der fertige Avatar dreht sich als Turntable-Showcase im Profil,
in den Top-3 der Rangliste und im App-Header — wie ein Spielerkarten-Modell
in einem Sport-Videospiel.

**Technischer Hinweis:** Für "AAA-Videospiel"-Echtzeitgrafik gibt es zwei
grundsätzlich unterschiedliche Wege:

1. **Diesen Weg (umgesetzt):** 3D-Avatare als GLB-Modell, dargestellt über
   Googles `<model-viewer>` in einer eingebetteten WebView
   ([`src/components/Avatar3D.tsx`](./src/components/Avatar3D.tsx)). Das
   liefert echte, realistische 3D-Charaktere direkt in der bestehenden App,
   ohne Build-Komplexität. Wir nutzen bewusst **keine** three.js/expo-gl-
   Lösung, da `expo-gl` die von Expo SDK 55+ verpflichtende "New
   Architecture" aktuell nicht unterstützt und dort nur einen schwarzen
   Bildschirm zeigt (bekanntes, offenes Problem im Expo/Three.js-Ökosystem).
2. **Volle Spiel-Engine (nicht umgesetzt):** Für Unreal-Engine/MetaHuman-Level
   an Realismus (Hautstruktur, Mimik, echtzeit-simulierte Kleidung) bräuchte
   es ein separates natives Spiel-Modul (z.B. Unreal oder Unity) statt einer
   React-Native-App — deutlich aufwändiger, größer und nicht mehr
   "einfach im App Store" verteilbar. Das ist bewusst nicht der eingeschlagene
   Weg, kann aber bei Bedarf als eigenständiges Zusatzmodul nachgerüstet werden.

Die aktuelle Lösung ist damit **"echte 3D-Charaktere, wie im Spiel", aber kein
fotorealistisches AAA-Cutscene-Rendering** — das ist auf einem normalen Handy
in Echtzeit ohnehin nicht realistisch, selbst native Spiele erreichen das nur
in aufwändigen Zwischensequenzen.

**Für den Produktivbetrieb:** Aktuell wird Ready Player Me's öffentliche
Test-Subdomain (`demo.readyplayer.me`) verwendet. Für eine echte
Veröffentlichung solltest du kostenlos eine eigene Subdomain unter
[studio.readyplayer.me](https://studio.readyplayer.me) registrieren und sie in
[`src/screens/AvatarCreatorScreen.tsx`](./src/screens/AvatarCreatorScreen.tsx)
(`AVATAR_CREATOR_URL`) eintragen.

## Projektstruktur

```
src/
  components/   Wiederverwendbare UI-Bausteine (Buttons, Cards, Bracket, ...)
  navigation/    React-Navigation-Setup (Auth-Stack, Tabs, Root-Stack)
  screens/       Alle Bildschirme (Login, Turniere, Match-Eingabe, ...)
  services/      Firebase-Anbindung (Auth, Firestore-Turnierlogik)
  store/         Globaler State (Zustand)
  theme/         Farben & Gradients
  types/         Gemeinsame TypeScript-Typen
  utils/         Turnier-Engine (Gruppen, Tabellen, K.o.-Baum, Presets)
```

## Turnier-Engine

Die gesamte olympische Turnierlogik (Gruppenbildung, Tabellenberechnung,
Bracket-Seeding, Bronze-Spiel) liegt in
[`src/utils/tournamentEngine.ts`](./src/utils/tournamentEngine.ts) und ist
reiner, ungebundener TypeScript-Code (leicht testbar, ohne Firebase-Abhängigkeit).
