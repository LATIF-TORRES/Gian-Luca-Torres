// Freischalt-Codes für den Link ohne Server.
//
// Der ganze Kurs ist im Link verschlüsselt (AES-GCM). Nur mit einem gültigen Code
// lässt er sich öffnen. Jeder Code gehört zu einem Namen, z. B. „ANNA-K7Q2M…“:
//   Code = Schlüssel XOR SHA-256("hallo-deutsch:" + NAME)   (in Base32 geschrieben)
// So hat jede Person einen eigenen Code, und alle Codes öffnen denselben Kurs.
// Ein falscher Code scheitert beim Entschlüsseln.

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const KEY_LEN = 16;
const CODE_LEN = 26; // 16 Bytes in Base32

export function normName(name) {
  return String(name || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

function b32(bytes) {
  let bits = 0, val = 0, out = '';
  for (const b of bytes) {
    val = (val << 8) | b; bits += 8;
    while (bits >= 5) { out += ALPHA[(val >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits) out += ALPHA[(val << (5 - bits)) & 31];
  return out;
}

function unb32(s) {
  const out = [];
  let bits = 0, val = 0;
  for (const c of s) {
    const i = ALPHA.indexOf(c);
    if (i < 0) return null;
    val = (val << 5) | i; bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; }
  }
  return new Uint8Array(out.slice(0, KEY_LEN));
}

async function mask(name) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('hallo-deutsch:' + name));
  return new Uint8Array(h).slice(0, KEY_LEN);
}

const xor = (a, b) => a.map((x, i) => x ^ b[i]);

export function b64(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export function unb64(s) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

// Für deine Admin-Seite: Code zu einem Namen erstellen.
export async function makeCode(name, keyBytes) {
  const n = normName(name);
  if (!n) throw new Error('Name fehlt');
  return `${n}-${b32(xor(keyBytes, await mask(n)))}`;
}

// Zerlegt einen eingegebenen Code in Name und Schlüssel.
export async function parseCode(code) {
  const c = String(code || '').toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9-]/g, '');
  const i = c.lastIndexOf('-');
  if (i < 1) return null;
  const name = c.slice(0, i), body = c.slice(i + 1).replace(/[0189]/g, (d) => ({ 0: 'O', 1: 'I', 8: 'B', 9: 'G' }[d]));
  if (body.length !== CODE_LEN) return null;
  const bytes = unb32(body);
  if (!bytes || bytes.length !== KEY_LEN) return null;
  return { name, key: xor(bytes, await mask(name)) };
}

export async function encryptCourse(course, keyBytes) {
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(course)));
  return { iv: b64(iv), data: b64(new Uint8Array(data)) };
}

// Gibt { name, course } zurück oder null, wenn der Code nicht stimmt.
export async function openCourse(code, locked) {
  const p = await parseCode(code);
  if (!p) return null;
  try {
    const key = await crypto.subtle.importKey('raw', p.key, 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(locked.iv) }, key, unb64(locked.data));
    return { name: p.name, course: JSON.parse(new TextDecoder().decode(plain)) };
  } catch {
    return null;
  }
}
