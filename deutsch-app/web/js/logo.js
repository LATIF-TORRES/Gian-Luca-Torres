// Logo „Sprechblase“: violette Sprechblase mit „Hallo!“ und Streifen in Schwarz-Rot-Gold.

const BUBBLE = 'M22 12 h76 a16 16 0 0 1 16 16 v46 a16 16 0 0 1 -16 16 H54 l-24 22 v-22 h-8 a16 16 0 0 1 -16 -16 V28 a16 16 0 0 1 16 -16 z';
const ICON_BUBBLE = 'M26 22 h68 a14 14 0 0 1 14 14 v38 a14 14 0 0 1 -14 14 H56 l-20 18 v-18 h-10 a14 14 0 0 1 -14 -14 V36 a14 14 0 0 1 14 -14 z';
const FONT = "Nunito, system-ui, sans-serif";

// Die Sprechblase allein (für Kopfzeile und Startseite)
export function logoMark(size = 32, label = 'Hallo Deutsch!') {
  return `<svg class="logo-mark" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${label}">
    <path d="${BUBBLE}" fill="#6366F1"/>
    <text x="60" y="58" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="27" fill="#FFFFFF">Hallo!</text>
    <rect x="33" y="68" width="17" height="6" rx="3" fill="#1A1A1A"/>
    <rect x="51.5" y="68" width="17" height="6" rx="3" fill="#E11D2E"/>
    <rect x="70" y="68" width="17" height="6" rx="3" fill="#FFCE00"/>
  </svg>`;
}

// App-Symbol: weisse Sprechblase auf violettem Quadrat
export function appIcon(size = 64) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
    <rect width="120" height="120" rx="28" fill="#6366F1"/>
    <path d="${ICON_BUBBLE}" fill="#FFFFFF"/>
    <text x="60" y="61" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="24" fill="#6366F1">Hallo!</text>
    <rect x="37" y="69" width="15" height="5" rx="2.5" fill="#1A1A1A"/>
    <rect x="52.5" y="69" width="15" height="5" rx="2.5" fill="#E11D2E"/>
    <rect x="68" y="69" width="15" height="5" rx="2.5" fill="#FFCE00"/>
  </svg>`;
}
