// Loot: gold bars, cash stacks, jewels — and on job 3, the Crimson Ledger
// itself. Risk and reward: the richest pieces sit behind the vault door.
// Picking up loot pays its value into the score and the HUD's loot counter.
import { dist } from './vision.js';

export const LOOT_KINDS = {
  gold: { label: 'Gold bars', color: '#ffd94a' },
  cash: { label: 'Cash stack', color: '#7ee081' },
  jewel: { label: 'Jewels', color: '#7ec8ff' },
  ledger: { label: 'THE CRIMSON LEDGER', color: '#ff5a5a' },
};

export function lootValueTaken(job) {
  return job.loot.filter((l) => l.taken).reduce((s, l) => s + l.value, 0);
}

export function collectLoot(game) {
  const p = game.player;
  for (const l of game.job.loot) {
    if (l.taken) continue;
    if (l.behindVault && game.job.vaultDoor && game.job.vaultDoor.locked) continue;
    if (dist(p.x, p.y, l.x, l.y) < 26) {
      l.taken = true;
      game.loot += l.value;
      game.score += l.value;
      game.lootChimeT = 0.5;
    }
  }
  const led = game.job.ledger;
  if (led && !led.taken) {
    const door = game.job.vaultDoor;
    const open = !door || !door.locked;
    if (open && dist(p.x, p.y, led.x, led.y) < 30) {
      led.taken = true;
      game.loot += 25000;
      game.score += 25000;
      game.ledgerTaken = true;
      game.lootChimeT = 0.8;
    }
  }
}

// Is the escape open? Target loot reached — or the Ledger taken on job 3.
export function escapeOpen(game) {
  if (game.job.ledger) return game.ledgerTaken;
  return game.loot >= game.job.target;
}
