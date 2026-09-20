import * as THREE from 'three';
import './style.css';
import { createPadelScene } from './scene';
import { loadCharacter, type LoadedCharacter } from './characterLoader';
import { CHARACTERS, DEFAULT_CHARACTER_ID, type CharacterDef } from './characters';
import { addCoins } from './coins';
import { OPPONENT, resolvePoint, type HitQuality } from './opponent';
import {
  applyPoint,
  createInitialMatchState,
  matchSetsSummary,
  pointLabel,
  type LiveMatchState,
} from './padelEngine';
import { clearUi, renderCharacterSelect, renderHud, renderLoading, renderResult, renderTimingBar } from './screens';

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const padelScene = createPadelScene(canvas);
window.addEventListener('resize', padelScene.resize);

const clock = new THREE.Clock();
let playerChar: LoadedCharacter | null = null;
let opponentChar: LoadedCharacter | null = null;

// Timing minigame state - a plain progress value driven from the render loop so we can
// read its exact position the instant the player taps (mirrors the mobile app's
// Reanimated TimingMeter, just without a UI framework here).
let timingActive = false;
let timingProgress = 0;
let timingDirection = 1;
let timingMarkerEl: HTMLDivElement | null = null;
let onTimingResolved: ((quality: HitQuality) => void) | null = null;

function tickTiming(deltaSeconds: number) {
  if (!timingActive || !timingMarkerEl) return;
  const cycleSeconds = OPPONENT.cycleMs / 1000;
  timingProgress += (timingDirection * deltaSeconds) / (cycleSeconds / 2);
  if (timingProgress >= 1) {
    timingProgress = 1;
    timingDirection = -1;
  } else if (timingProgress <= 0) {
    timingProgress = 0;
    timingDirection = 1;
  }
  timingMarkerEl.style.left = `calc(${timingProgress * 100}% - 18px)`;
}

function resolveTimingTap() {
  if (!timingActive) return;
  const distanceFromCenter = Math.abs(timingProgress - 0.5) * 2;
  let quality: HitQuality = 'miss';
  if (distanceFromCenter <= OPPONENT.sweetSpotWidth / 2) quality = 'perfect';
  else if (distanceFromCenter <= OPPONENT.goodSpotWidth / 2) quality = 'good';
  timingActive = false;
  onTimingResolved?.(quality);
}

function startTiming(onResolved: (quality: HitQuality) => void) {
  timingProgress = 0;
  timingDirection = 1;
  timingActive = true;
  onTimingResolved = onResolved;
}

let spacePressed = false;
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !spacePressed) {
    spacePressed = true;
    resolveTimingTap();
  }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'Space') spacePressed = false;
});

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  playerChar?.mixer.update(delta);
  opponentChar?.mixer.update(delta);
  tickTiming(delta);
  padelScene.render();
}
animate();

// ---- Ball flight animation -------------------------------------------------
function animateBall(from: THREE.Vector3, to: THREE.Vector3, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const arcHeight = 1.4;
    function step(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const x = THREE.MathUtils.lerp(from.x, to.x, t);
      const z = THREE.MathUtils.lerp(from.z, to.z, t);
      const y = THREE.MathUtils.lerp(from.y, to.y, t) + Math.sin(t * Math.PI) * arcHeight;
      padelScene.ball.position.set(x, y, z);
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

// ---- Screen flow ------------------------------------------------------------
let selectedCharacterId = DEFAULT_CHARACTER_ID;

async function goToCharacterSelect() {
  padelScene.ball.visible = false;
  renderCharacterSelect(
    selectedCharacterId,
    (character) => {
      selectedCharacterId = character.id;
    },
    (character) => {
      startMatch(character);
    }
  );
}

function pickOpponent(playerId: string): CharacterDef {
  const others = CHARACTERS.filter((c) => c.id !== playerId);
  return others[Math.floor(Math.random() * others.length)];
}

async function startMatch(playerDef: CharacterDef) {
  renderLoading('Charaktere werden geladen…');
  const opponentDef = pickOpponent(playerDef.id);

  const [loadedPlayer, loadedOpponent] = await Promise.all([loadCharacter(playerDef), loadCharacter(opponentDef)]);
  playerChar = loadedPlayer;
  opponentChar = loadedOpponent;

  padelScene.playerSlot.clear();
  padelScene.playerSlot.add(playerChar.object);
  padelScene.opponentSlot.clear();
  padelScene.opponentSlot.add(opponentChar.object);
  playerChar.play(playerDef.idleClip);
  opponentChar.play(opponentDef.idleClip);
  padelScene.ball.visible = true;

  let match: LiveMatchState = createInitialMatchState();
  clearUi();
  const hud = renderHud();
  let pointsWonThisMatch = 0;

  function updateHud() {
    const sets = matchSetsSummary(match);
    hud.setScore(
      `${sets.player} : ${sets.opponent}`,
      match.phase === 'tiebreak'
        ? `Tiebreak ${match.tiebreakPoints.player}:${match.tiebreakPoints.opponent}`
        : `${pointLabel(match.currentGamePoints.player, match.currentGamePoints.opponent)} : ${pointLabel(match.currentGamePoints.opponent, match.currentGamePoints.player)}`
    );
  }
  updateHud();

  async function playPoint() {
    document.querySelector('.timing-wrap')?.remove();
    const timingUi = renderTimingBar(OPPONENT.sweetSpotWidth, OPPONENT.goodSpotWidth);
    timingMarkerEl = timingUi.marker;
    timingUi.track.onclick = resolveTimingTap;

    startTiming(async (quality) => {
      const winner = resolvePoint(quality);
      playerChar!.play(playerDef.hitClip, { loop: false });

      const playerPos = new THREE.Vector3();
      padelScene.playerSlot.getWorldPosition(playerPos);
      playerPos.y = 1;
      const opponentPos = new THREE.Vector3();
      padelScene.opponentSlot.getWorldPosition(opponentPos);
      opponentPos.y = 1;

      await animateBall(playerPos, opponentPos, 550);

      if (winner === 'opponent') {
        opponentChar!.play(opponentDef.hitClip, { loop: false });
        await animateBall(opponentPos, playerPos, 450);
      }

      window.setTimeout(() => {
        playerChar?.play(playerDef.idleClip);
        opponentChar?.play(opponentDef.idleClip);
      }, 300);

      hud.setFeedback(
        winner === 'player' ? (quality === 'perfect' ? 'PERFEKT! 🎯 Punkt für dich!' : 'Punkt für dich!') : quality === 'miss' ? 'Verfehlt!' : `Punkt für ${opponentDef.name}`,
        winner !== 'player'
      );
      if (winner === 'player') pointsWonThisMatch += 1;

      match = applyPoint(match, winner);
      updateHud();

      if (match.phase === 'finished') {
        finishMatch(playerDef, opponentDef, match, pointsWonThisMatch);
      } else {
        window.setTimeout(playPoint, 900);
      }
    });
  }

  playPoint();
}

function finishMatch(playerDef: CharacterDef, opponentDef: CharacterDef, match: LiveMatchState, pointsWon: number) {
  const won = match.winner === 'player';
  const coinsEarned = pointsWon * 3 + (won ? 30 : 5);
  addCoins(coinsEarned);
  playerChar?.play(won ? playerDef.hitClip : playerDef.idleClip);

  renderResult({
    won,
    opponentName: opponentDef.name,
    sets: match.completedSets,
    coinsEarned,
    onReplay: () => startMatch(playerDef),
    onChangeCharacter: () => goToCharacterSelect(),
  });
}

goToCharacterSelect();
