import { CHARACTERS, type CharacterDef } from './characters';
import { getCoins, isUnlocked, tryUnlock } from './coins';

const root = document.getElementById('ui-root')!;

function clear() {
  root.innerHTML = '';
}

function coinBadge(): HTMLDivElement {
  const badge = document.createElement('div');
  badge.className = 'coin-badge';
  badge.textContent = `🪙 ${getCoins()}`;
  return badge;
}

export function renderCharacterSelect(
  selectedId: string,
  onSelect: (character: CharacterDef) => void,
  onStart: (character: CharacterDef) => void
) {
  clear();
  const screen = document.createElement('div');
  screen.className = 'screen';

  screen.appendChild(coinBadge());

  const logo = document.createElement('div');
  logo.className = 'logo';
  logo.textContent = '🏆 PADEL ARENA 3D';
  screen.appendChild(logo);

  const subtitle = document.createElement('div');
  subtitle.className = 'subtitle';
  subtitle.textContent =
    'Wähle deinen Charakter. Der erste ist kostenlos, weitere schaltest du mit Münzen frei, die du beim Spielen verdienst.';
  screen.appendChild(subtitle);

  const grid = document.createElement('div');
  grid.className = 'character-grid';

  CHARACTERS.forEach((character) => {
    const card = document.createElement('div');
    const unlocked = isUnlocked(character.id, character.price);
    card.className = `character-card${character.id === selectedId ? ' selected' : ''}${!unlocked ? ' locked' : ''}`;

    const emoji = document.createElement('div');
    emoji.className = 'character-emoji';
    emoji.textContent = character.emoji;
    card.appendChild(emoji);

    const name = document.createElement('div');
    name.className = 'character-name';
    name.textContent = character.name;
    card.appendChild(name);

    const desc = document.createElement('div');
    desc.className = 'character-desc';
    desc.textContent = character.description;
    card.appendChild(desc);

    const price = document.createElement('div');
    if (character.price === 0) {
      price.className = 'character-price free';
      price.textContent = 'Kostenlos';
    } else if (unlocked) {
      price.className = 'character-price owned';
      price.textContent = '✓ Freigeschaltet';
    } else {
      price.className = 'character-price locked';
      price.textContent = `🔒 ${character.price} Münzen`;
    }
    card.appendChild(price);

    card.onclick = () => {
      if (unlocked) {
        onSelect(character);
        renderCharacterSelect(character.id, onSelect, onStart);
        return;
      }
      const bought = tryUnlock(character.id, character.price);
      if (bought) {
        onSelect(character);
        renderCharacterSelect(character.id, onSelect, onStart);
      } else {
        card.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], {
          duration: 200,
        });
      }
    };

    grid.appendChild(card);
  });
  screen.appendChild(grid);

  const startButton = document.createElement('button');
  startButton.className = 'primary';
  startButton.textContent = '▶ Match starten';
  startButton.style.marginTop = '28px';
  startButton.onclick = () => onStart(CHARACTERS.find((c) => c.id === selectedId) ?? CHARACTERS[0]);
  screen.appendChild(startButton);

  root.appendChild(screen);
}

export function clearUi() {
  clear();
}

export function renderHud(): {
  setScore: (setsText: string, pointsText: string) => void;
  setFeedback: (text: string, isMiss: boolean) => void;
} {
  const hud = document.createElement('div');
  hud.className = 'hud';

  const scoreBox = document.createElement('div');
  scoreBox.className = 'hud-score';
  const setsEl = document.createElement('div');
  setsEl.className = 'hud-sets';
  const pointsEl = document.createElement('div');
  pointsEl.className = 'hud-points';
  scoreBox.appendChild(setsEl);
  scoreBox.appendChild(pointsEl);
  hud.appendChild(scoreBox);
  root.appendChild(hud);
  root.appendChild(coinBadge());

  const feedback = document.createElement('div');
  feedback.className = 'feedback';
  root.appendChild(feedback);

  return {
    setScore: (setsText, pointsText) => {
      setsEl.textContent = setsText;
      pointsEl.textContent = pointsText;
    },
    setFeedback: (text, isMiss) => {
      feedback.textContent = text;
      feedback.className = `feedback${isMiss ? ' miss' : ''}`;
    },
  };
}

export function renderTimingBar(
  sweetSpotWidth: number,
  goodSpotWidth: number
): { track: HTMLDivElement; marker: HTMLDivElement } {
  const wrap = document.createElement('div');
  wrap.className = 'timing-wrap';

  const track = document.createElement('div');
  track.className = 'timing-track';

  const goodZone = document.createElement('div');
  goodZone.className = 'timing-zone good';
  goodZone.style.left = `${(1 - goodSpotWidth) * 50}%`;
  goodZone.style.width = `${goodSpotWidth * 100}%`;
  track.appendChild(goodZone);

  const perfectZone = document.createElement('div');
  perfectZone.className = 'timing-zone perfect';
  perfectZone.style.left = `${(1 - sweetSpotWidth) * 50}%`;
  perfectZone.style.width = `${sweetSpotWidth * 100}%`;
  track.appendChild(perfectZone);

  const marker = document.createElement('div');
  marker.className = 'timing-marker';
  track.appendChild(marker);

  wrap.appendChild(track);

  const hint = document.createElement('div');
  hint.className = 'timing-hint';
  hint.textContent = 'Tippen zum Schlagen! 🎾';
  wrap.appendChild(hint);

  root.appendChild(wrap);
  return { track, marker };
}

export function renderResult(opts: {
  won: boolean;
  opponentName: string;
  sets: { player: number; opponent: number }[];
  coinsEarned: number;
  onReplay: () => void;
  onChangeCharacter: () => void;
}) {
  clear();
  const screen = document.createElement('div');
  screen.className = 'screen overlay';

  const emoji = document.createElement('div');
  emoji.className = 'result-emoji';
  emoji.textContent = opts.won ? '🏆' : '💪';
  screen.appendChild(emoji);

  const title = document.createElement('div');
  title.className = 'result-title';
  title.textContent = opts.won ? 'Sieg!' : 'Niederlage';
  screen.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.className = 'subtitle';
  subtitle.textContent = opts.won ? `Du hast ${opts.opponentName} geschlagen!` : `${opts.opponentName} war heute stärker.`;
  screen.appendChild(subtitle);

  const coinsEl = document.createElement('div');
  coinsEl.className = 'coins-earned';
  coinsEl.textContent = `+${opts.coinsEarned} 🪙 verdient`;
  screen.appendChild(coinsEl);

  opts.sets.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'subtitle';
    row.style.marginBottom = '0';
    row.textContent = `Satz ${i + 1}: ${s.player} : ${s.opponent}`;
    screen.appendChild(row);
  });

  const replayBtn = document.createElement('button');
  replayBtn.className = 'primary';
  replayBtn.textContent = 'Nochmal spielen';
  replayBtn.style.marginTop = '24px';
  replayBtn.onclick = opts.onReplay;
  screen.appendChild(replayBtn);

  const changeBtn = document.createElement('button');
  changeBtn.className = 'ghost';
  changeBtn.textContent = 'Charakter wechseln';
  changeBtn.onclick = opts.onChangeCharacter;
  screen.appendChild(changeBtn);

  root.appendChild(screen);
}

export function renderLoading(text: string) {
  clear();
  const screen = document.createElement('div');
  screen.className = 'screen overlay';
  const logo = document.createElement('div');
  logo.className = 'logo';
  logo.textContent = '🏆 PADEL ARENA 3D';
  screen.appendChild(logo);
  const loading = document.createElement('div');
  loading.className = 'loading-text';
  loading.textContent = text;
  screen.appendChild(loading);
  root.appendChild(screen);
}
