const COINS_KEY = 'padel3d_coins';
const UNLOCKS_KEY = 'padel3d_unlocked';

export function getCoins(): number {
  return Number(localStorage.getItem(COINS_KEY) ?? '0');
}

export function addCoins(amount: number): number {
  const next = getCoins() + amount;
  localStorage.setItem(COINS_KEY, String(next));
  return next;
}

function getUnlocked(): string[] {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function isUnlocked(id: string, price: number): boolean {
  return price === 0 || getUnlocked().includes(id);
}

/** Attempts to buy a character with coins. Returns true on success. */
export function tryUnlock(id: string, price: number): boolean {
  if (isUnlocked(id, price)) return true;
  const coins = getCoins();
  if (coins < price) return false;
  localStorage.setItem(COINS_KEY, String(coins - price));
  const unlocked = getUnlocked();
  unlocked.push(id);
  localStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocked));
  return true;
}
