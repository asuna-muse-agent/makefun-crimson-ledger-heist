// The three tools, each with a real cost printed in the HUD:
// Lockpick — slow (3s channel), silent, opens vault doors and vent grates.
// Smoke pellet — blinds guards + cameras in a radius for 6s; 2 uses a job.
// Jammer — freezes ALL cameras for 10s, but +20 alarm the instant you use it.
import {
  LOCKPICK_SECONDS, SMOKE_USES, SMOKE_RADIUS, SMOKE_SECONDS,
  JAMMER_SECONDS, ALARM_JAMMER_COST, ALARM_MAX,
} from './config.js';
import { dist } from './vision.js';
import { jamCameras, blindCamerasInRadius } from './camera.js';

export function newToolState() {
  return { smoke: SMOKE_USES, jammerReady: true, lockpicking: false, lockpickT: 0, lockpickTarget: null };
}

export function toolCostText() {
  return [
    { key: '1', name: 'LOCKPICK', cost: '3s channel · silent', left: '∞' },
    { key: '2', name: 'SMOKE', cost: 'blinds 6s', left: 'x2' },
    { key: '3', name: 'JAMMER', cost: '+20 ALARM', left: '10s freeze' },
  ];
}

// Start (or keep) a lockpick channel when Sable stands by a locked door.
export function tryLockpick(game) {
  const door = game.job.vaultDoor;
  if (!door || !door.locked) return false;
  const d = dist(game.player.x, game.player.y, door.x + door.w / 2, door.y + door.h / 2);
  if (d > 70) return false;
  if (!game.tools.lockpicking) {
    game.tools.lockpicking = true;
    game.tools.lockpickT = LOCKPICK_SECONDS;
    game.tools.lockpickTarget = door;
  }
  return true;
}

export function tickLockpick(game, dt) {
  if (!game.tools.lockpicking) return;
  const door = game.tools.lockpickTarget;
  const d = dist(game.player.x, game.player.y, door.x + door.w / 2, door.y + door.h / 2);
  if (d > 80 || game.player.moving) {
    game.tools.lockpicking = false;
    game.tools.lockpickT = 0;
    return;
  }
  game.tools.lockpickT -= dt;
  if (game.tools.lockpickT <= 0) {
    door.locked = false;
    game.tools.lockpicking = false;
    game.tools.lockpickT = 0;
    game.score += 500;
  }
}

// Throw a smoke pellet at Sable's feet: blinds eyes in a radius.
export function throwSmoke(game) {
  if (game.tools.smoke <= 0) return false;
  game.tools.smoke -= 1;
  game.smokeClouds.push({ x: game.player.x, y: game.player.y, r: SMOKE_RADIUS, t: SMOKE_SECONDS });
  for (const g of game.job.guards) {
    if (dist(g.x, g.y, game.player.x, game.player.y) < SMOKE_RADIUS + 40) g.blindT = SMOKE_SECONDS;
  }
  blindCamerasInRadius(game.job.cameras, game.player.x, game.player.y, SMOKE_RADIUS, SMOKE_SECONDS);
  return true;
}

// Fire the jammer: every camera freezes, the alarm jumps +20 right now.
export function fireJammer(game) {
  jamCameras(game.job.cameras, JAMMER_SECONDS);
  game.jammerT = JAMMER_SECONDS;
  game.alarm = Math.min(ALARM_MAX, game.alarm + ALARM_JAMMER_COST);
  game.tools.jammerReady = false;
  game.tools.jammerCooldown = JAMMER_SECONDS + 8;
}
