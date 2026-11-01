// Erzeugt die zwei Seiten für den Link ohne Server:
//   preview/        Die Lern-App zum Teilen. Lektion 1 offen, der Rest verschlüsselt.
//   preview-admin/  Deine private Seite: Freischalt-Codes erstellen. NIE teilen!
//
// Der geheime Schlüssel steht in scripts/.unlock-key (nicht im Repo, siehe .gitignore)
// und auf deiner Admin-Seite. Geht die Datei verloren, steht er auf der Admin-Seite.
// Mit einem neuen Schlüssel gelten alle alten Codes nicht mehr.
//
// Starten: WHATSAPP=+33... COURSE_URL=https://claude.ai/artifact/... node scripts/build-preview.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { COURSE, trialCourse } from '../functions/content/course.js';
import { encryptCourse, makeCode, b64, unb64 } from '../web/js/unlock.js';

const root = new URL('../', import.meta.url);
const keyFile = new URL('scripts/.unlock-key', root);
if (process.env.UNLOCK_KEY) writeFileSync(keyFile, process.env.UNLOCK_KEY.trim() + '\n');
if (!existsSync(keyFile)) writeFileSync(keyFile, b64(crypto.getRandomValues(new Uint8Array(16))) + '\n');
const keyB64 = readFileSync(keyFile, 'utf8').trim();
const key = unb64(keyB64);

const out = new URL('preview/', root);
const web = new URL('web/', root);
rmSync(out, { recursive: true, force: true });
mkdirSync(new URL('js/', out), { recursive: true });

for (const f of readdirSync(new URL('js/', web))) {
  let src = readFileSync(new URL(`js/${f}`, web), 'utf8');
  if (f === 'config.js') {
    src = src.replace('preview: false', 'preview: true');
    const wa = (process.env.WHATSAPP || '').replace(/\D/g, '');
    if (wa) src = src.replace("contactWhatsapp: ''", `contactWhatsapp: '${wa}'`);
  }
  writeFileSync(new URL(`js/${f}`, out), src);
}
writeFileSync(new URL('js/course-preview.js', out),
  `// Nur die Gratis-Lektion (automatisch erzeugt)\nexport const PREVIEW_COURSE = ${JSON.stringify(trialCourse())};\n`);
writeFileSync(new URL('js/course-locked.js', out),
  `// Ganzer Kurs, verschlüsselt. Öffnet sich nur mit einem Freischalt-Code.\nexport const LOCKED_COURSE = ${JSON.stringify(await encryptCourse(COURSE, key))};\n`);
writeFileSync(new URL('styles.css', out), readFileSync(new URL('styles.css', web)));
// Seiten ohne <html>/<head>/<body>: claude.ai ergänzt das Gerüst beim Veröffentlichen.
writeFileSync(new URL('index.html', out), `<title>Hallo Deutsch!</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<div id="app"></div>
<script type="module" src="js/app.js"></script>
`);

// ---------- Admin-Seite
const admin = new URL('preview-admin/', root);
rmSync(admin, { recursive: true, force: true });
mkdirSync(admin, { recursive: true });
writeFileSync(new URL('unlock.js', admin), readFileSync(new URL('js/unlock.js', web)));
const tpl = readFileSync(new URL('scripts/admin-template.html', root), 'utf8');
writeFileSync(new URL('index.html', admin), tpl.replace('__KEY__', keyB64).replace('__LINK__', process.env.COURSE_URL || ''));

console.log('preview/ und preview-admin/ erstellt. Beispiel-Code für „Test“:', await makeCode('Test', key));
