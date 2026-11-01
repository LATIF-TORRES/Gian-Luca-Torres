// Töne (ohne Audiodateien) und Konfetti.

let ctx = null;
let enabled = true;

export function setSound(on) {
  enabled = on;
}

function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.05);
}

function ready() {
  if (!enabled) return false;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  } catch {
    return false;
  }
}

export const sfx = {
  correct() { if (ready()) { tone(660, 0, 0.12); tone(990, 0.1, 0.22); } },
  wrong() { if (ready()) { tone(220, 0, 0.18, 'triangle', 0.2); tone(180, 0.15, 0.25, 'triangle', 0.2); } },
  tap() { if (ready()) tone(520, 0, 0.05, 'sine', 0.08); },
  done() { if (ready()) [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3)); },
};

export function confetti() {
  const c = document.createElement('canvas');
  c.className = 'confetti';
  document.body.appendChild(c);
  const dpr = window.devicePixelRatio || 1;
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  const colors = ['#6366F1', '#22C55E', '#FACC15', '#EC4899', '#0EA5E9', '#F97316'];
  const parts = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 12,
    vy: -Math.random() * 13 - 4,
    s: Math.random() * 7 + 5,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: colors[Math.floor(Math.random() * colors.length)],
  }));
  let frame = 0;
  (function draw() {
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c;
      g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore();
    }
    if (++frame < 170) requestAnimationFrame(draw); else c.remove();
  })();
}
