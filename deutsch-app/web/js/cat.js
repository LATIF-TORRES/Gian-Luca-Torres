// Flocke: die weisse, flauschige Katze, die durch den Kurs begleitet.
// Flocke ist neutral (weder männlich noch weiblich): in den Texten nie „er/sie“, „fier/fière“ usw.
// Sie ist immer freundlich und motivierend, egal ob richtig, falsch oder nach einer Pause.
//
// catSvg(mood, size)   Zeichnung als SVG. Stimmungen: idle, happy, cheer, love, comfort, sleepy, wave
// catPop(mood, text)   kurze Sprechblase unten auf dem Bildschirm
// catSays(mood, text)  Katze mit Sprechblase als HTML (für Karten)
// catLine(key)         zufälliger Satz aus der Liste in i18n.js (key = catGreetFirst, catWrong, …)

import { t } from './i18n.js';
import { esc, pick } from './util.js';

let uid = 0;

const INK = '#2B2440';
const PINK = '#FFCDB8'; // warmer Pfirsichton für Ohren und Bäckchen
const NOSE = '#FF8FAB';

function eyes(mood) {
  const happyArc = (x) => `<path d="M${x - 10} 99 Q${x} 86 ${x + 10} 99" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
  const sleepy = (x) => `<path d="M${x - 10} 96 Q${x} 103 ${x + 10} 96" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  const open = (x) => `
    <ellipse cx="${x}" cy="95" rx="11" ry="13" fill="${INK}"/>
    <circle cx="${x + 4}" cy="89.5" r="4.2" fill="#FFFFFF"/>
    <circle cx="${x - 3.5}" cy="100" r="2" fill="#FFFFFF"/>`;
  if (mood === 'happy' || mood === 'cheer' || mood === 'love') return happyArc(76) + happyArc(124);
  if (mood === 'sleepy') return sleepy(76) + sleepy(124);
  if (mood === 'wave') return open(76) + happyArc(124);
  return open(76) + open(124);
}

function mouth(mood) {
  if (mood === 'happy' || mood === 'cheer' || mood === 'love' || mood === 'wave') {
    return `<path d="M92 115 Q100 129 108 115 Z" fill="#E05A7A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  if (mood === 'sleepy') return `<ellipse cx="100" cy="119" rx="4" ry="3" fill="#E05A7A"/>`;
  return `<path d="M100 112 Q100 118 93 119 M100 112 Q100 118 107 119" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
}

function extras(mood) {
  if (mood === 'love') {
    return `<path d="M168 52 c-6 -10 -20 -2 -12 8 l12 10 l12 -10 c8 -10 -6 -18 -12 -8z" fill="#FF6B8B"/>
      <path d="M30 40 c-4 -7 -14 -1 -8 5 l8 7 l8 -7 c6 -6 -4 -12 -8 -5z" fill="#FF8FAB"/>`;
  }
  if (mood === 'sleepy') {
    return `<text x="150" y="44" font-family="Nunito, system-ui, sans-serif" font-weight="900" font-size="22" fill="#8B85B1">z</text>
      <text x="166" y="28" font-family="Nunito, system-ui, sans-serif" font-weight="900" font-size="16" fill="#B3AED3">z</text>`;
  }
  if (mood === 'happy' || mood === 'cheer') {
    const star = (x, y, s) => `<path d="M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3}Z" fill="#FFCE00"/>`;
    return star(30, 46, 9) + star(172, 40, 11) + star(182, 78, 6);
  }
  return '';
}

function paws(mood, fur) {
  const paw = (cx, cy, rot = 0) => `
    <g transform="rotate(${rot} ${cx} ${cy})">
      <ellipse cx="${cx}" cy="${cy}" rx="15" ry="12" fill="${fur}" stroke="#DCD6EC" stroke-width="2"/>
      <path d="M${cx - 5} ${cy - 3} v5 M${cx + 5} ${cy - 3} v5" stroke="#CFC8E3" stroke-width="2" stroke-linecap="round"/>
    </g>`;
  let up = '';
  if (mood === 'cheer') up = paw(30, 108, -25) + paw(170, 108, 25);
  if (mood === 'wave') up = paw(172, 92, 20);
  if (mood === 'comfort') up = paw(150, 150, -10);
  return { up, down: paw(78, 188) + (mood === 'comfort' ? '' : paw(122, 188)) };
}

export function catSvg(mood = 'idle', size = 96, label = 'Flocke') {
  const id = `fl${++uid}`;
  const fur = `url(#${id}g)`;
  const p = paws(mood, '#FFFFFF');
  return `<svg class="cat cat-${mood}" width="${size}" height="${size}" viewBox="0 0 200 210" role="img" aria-label="${esc(label)}">
  <defs>
    <radialGradient id="${id}g" cx="45%" cy="35%" r="75%">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.7" stop-color="#FAF8FF"/>
      <stop offset="1" stop-color="#E7E2F4"/>
    </radialGradient>
    <filter id="${id}f" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
  <g class="cat-body">
    <g filter="url(#${id}f)">
      <path d="M146 176 C190 172 196 126 170 112" fill="none" stroke="#DCD6EC" stroke-width="24" stroke-linecap="round"/>
      <path d="M146 176 C190 172 196 126 170 112" fill="none" stroke="#FFFFFF" stroke-width="19" stroke-linecap="round"/>
      <ellipse cx="100" cy="160" rx="54" ry="42" fill="${fur}" stroke="#DCD6EC" stroke-width="2.5"/>
      <path d="M50 66 L44 16 L90 44 Z" fill="${fur}" stroke="#E4DFF1" stroke-width="5" stroke-linejoin="round"/>
      <path d="M150 66 L156 16 L110 44 Z" fill="${fur}" stroke="#E4DFF1" stroke-width="5" stroke-linejoin="round"/>
      <ellipse cx="100" cy="94" rx="64" ry="55" fill="${fur}" stroke="#DCD6EC" stroke-width="2.5"/>
      <circle cx="44" cy="112" r="15" fill="${fur}"/>
      <circle cx="156" cy="112" r="15" fill="${fur}"/>
    </g>
    <ellipse cx="100" cy="94" rx="60" ry="51" fill="${fur}"/>
    <path d="M56 56 L53 30 L76 45 Z" fill="${PINK}"/>
    <path d="M144 56 L147 30 L124 45 Z" fill="${PINK}"/>
    <ellipse cx="100" cy="152" rx="30" ry="22" fill="#FFFFFF" opacity="0.6"/>
    ${eyes(mood)}
    <ellipse cx="60" cy="113" rx="10" ry="5.5" fill="${PINK}" opacity="0.75"/>
    <ellipse cx="140" cy="113" rx="10" ry="5.5" fill="${PINK}" opacity="0.75"/>
    <path d="M95.5 106.5 Q100 103 104.5 106.5 Q100 113 95.5 106.5 Z" fill="${NOSE}"/>
    ${mouth(mood)}
    <path d="M46 106 L24 101 M46 113 L22 115 M154 106 L176 101 M154 113 L178 115" stroke="#C9C2DE" stroke-width="2" stroke-linecap="round"/>
    <path d="M62 136 Q100 150 138 136" fill="none" stroke="#E11D2E" stroke-width="6" stroke-linecap="round"/>
    <circle cx="100" cy="146" r="6.5" fill="#FFCE00" stroke="#D9A400" stroke-width="2"/>
    ${p.down}
    ${p.up}
    ${extras(mood)}
  </g>
</svg>`;
}

export function catLine(key) {
  const v = t(key);
  return Array.isArray(v) ? pick(v) : v;
}

// Katze mit Sprechblase (für Karten auf der Startseite, im Profil, …)
export function catSays(mood, text, size = 92, extraHtml = '') {
  return `
    <div class="cat-says">
      ${catSvg(mood, size)}
      <div class="cat-bubble"><b class="cat-name">Flocke</b><span>${esc(text)}</span>${extraHtml}</div>
    </div>`;
}

// Kurze Einblendung unten (verschwindet von selbst, Antippen schliesst sie)
let popTimer = null;
export function catPop(mood, text, ms = 3200) {
  document.querySelector('.cat-pop')?.remove();
  clearTimeout(popTimer);
  const el = document.createElement('div');
  el.className = 'cat-pop';
  el.setAttribute('role', 'status');
  el.innerHTML = `${catSvg(mood, 74)}<div class="cat-bubble"><b class="cat-name">Flocke</b><span>${esc(text)}</span></div>`;
  el.onclick = () => el.remove();
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add('show'));
  popTimer = setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 350); }, ms);
}
