export type HitQuality = 'perfect' | 'good' | 'miss';
export type PointWinner = 'player' | 'opponent';

// One balanced difficulty for the MVP (matches the "Amateur" tier from the mobile app's
// bot-training mode) - character choice is the fun/cosmetic layer here, not difficulty.
export const OPPONENT = {
  sweetSpotWidth: 0.22,
  goodSpotWidth: 0.46,
  cycleMs: 1100,
  perfectCounterChance: 0.15,
  goodWinChance: 0.55,
};

export function resolvePoint(quality: HitQuality): PointWinner {
  if (quality === 'miss') return 'opponent';
  if (quality === 'perfect') {
    return Math.random() < OPPONENT.perfectCounterChance ? 'opponent' : 'player';
  }
  return Math.random() < OPPONENT.goodWinChance ? 'player' : 'opponent';
}
