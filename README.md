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
