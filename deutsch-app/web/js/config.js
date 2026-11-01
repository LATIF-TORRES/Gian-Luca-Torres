// ⚙️ EINSTELLUNGEN – hier trägst du deine Werte ein (siehe README.md, Schritt 2).
//
// Die Firebase-Werte findest du in der Firebase-Konsole unter
// Projekteinstellungen → Allgemein → Meine Apps → Web-App → SDK-Konfiguration.
// Diese Werte sind nicht geheim (Firebase sagt das selbst). Geschützt wird alles durch die Regeln
// in firestore.rules und durch die Cloud Functions.
//
// Solange apiKey leer ist, läuft die App im DEMO-MODUS: kein Login, keine Zahlung,
// alle Lektionen offen, Fortschritt nur im Browser. Gut zum Ausprobieren.

export const CONFIG = {
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
  // Region der Cloud Functions (europe-west6 = Zürich). Muss zu functions/index.js passen.
  functionsRegion: 'europe-west6',
  // Wird auf der Bezahlseite angezeigt. Der echte Preis kommt aus Stripe.
  priceLabel: '9.99 €',
  appName: 'Hallo Deutsch!',
};
