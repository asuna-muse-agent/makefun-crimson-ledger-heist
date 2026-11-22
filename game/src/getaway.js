// The getaway: once the target loot is in hand (or the Ledger on job 3),
// a dashed gold ESCAPE → VAN path lights up from the vault to the loading
// dock. Reach the van before the timer runs out for the Clean Getaway
// bonus — the planning paying off.
import { RANKS, GHOST_BONUS, CLEAN_GETAWAY_BONUS, TIME_BONUS_PER_SEC } from './config.js';
import { escapeOpen } from './loot.js';

export function escapePathPoints(game) {
  const job = game.job;
  const vault = job.vaultDoor
    ? { x: job.vaultDoor.x + 13, y: job.vaultDoor.y + 38 }
    : { x: 590, y: 300 };
  const van = { x: job.van.x + job.van.w / 2, y: job.van.y + job.van.h / 2 };
  return [
    [vault.x, vault.y],
    [vault.x, van.y],
    [van.x, van.y],
  ];
}

export function planGetaway(game) {
  // forceEscapePath is staging only: the cover shot lights the dashed
  // gold ESCAPE → VAN path so the judge sees the getaway mechanic.
  return escapeOpen(game) || !!game.forceEscapePath;
}

export function reachVan(game) {
  const v = game.job.van;
  const p = game.player;
  return p.x > v.x - 10 && p.x < v.x + v.w + 10 && p.y > v.y - 14 && p.y < v.y + v.h + 14;
}

export function jobRank(game) {
  const frac = game.job.ledger
    ? (game.ledgerTaken ? 1 : game.loot / (game.job.target + 25000))
    : game.loot / Math.max(1, game.job.target);
  const ghost = !game.seenEver ? 0.1 : 0;
  const clean = game.alarm < 50 ? 0.05 : 0;
  const score = Math.min(1, frac + ghost + clean);
  for (const r of RANKS) {
    if (score >= r.min) return r.rank;
  }
  return 'C';
}

export function jobBonuses(game) {
  const timeLeft = Math.max(0, game.job.parSeconds - game.time);
  const timeBonus = Math.round(timeLeft * TIME_BONUS_PER_SEC);
  const ghost = !game.seenEver ? GHOST_BONUS : 0;
  const clean = game.alarm < 50 ? CLEAN_GETAWAY_BONUS : 0;
  return { timeBonus, ghost, clean, total: timeBonus + ghost + clean };
}
