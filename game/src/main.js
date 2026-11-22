// CRIMSON LEDGER — The Meridian Bank Job. Boot + game loop + state machine.
// Modes: title -> briefing -> playing <-> paused -> jobdone -> briefing
// (next job) -> win, or busted on 3 strikes. ?shot=<name> freezes a
// deterministic pose for screenshots (see shots.js).
import { CANVAS_W, CANVAS_H, MAX_STRIKES } from './config.js';
import { buildJob } from './levels.js';
import { newPlayer, movePlayer } from './player.js';
import { patrolGuard, initGuardSweeps, guardSeesPlayer } from './guard.js';
import { sweepCamera, cameraSeesPlayer } from './camera.js';
import { alarmTick } from './alarm.js';
import { newToolState, tryLockpick, tickLockpick, throwSmoke, fireJammer } from './tools.js';
import { collectLoot } from './loot.js';
import { reachVan, jobBonuses } from './getaway.js';
import { currentRoute } from './routes.js';
import { newInput, bindInput, consumePresses } from './input.js';
import { renderGame } from './render.js';
import { stageShot } from './shots.js';
import { ensureAudio, toggleMute, playLootChime, playAlarmSting, playLockdownSiren, playWinStinger, playLoseStinger, playHeartbeat, isMuted } from './audio.js';
import { angleTo, angleDiff, dist } from './vision.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

export function newGame() {
  return {
    mode: 'title',
    jobIndex: 0,
    job: null,
    time: 0,
    alarm: 0,
    strikes: 0,
    lockdowns: 0,
    lockdownT: 0,
    loot: 0,
    score: 0,
    seenEver: false,
    ledgerTaken: false,
    player: null,
    tools: newToolState(),
    smokeClouds: [],
    noiseRings: [],
    jammerT: 0,
    lootChimeT: 0,
    nearMissT: 0,
    routeName: '',
    frozen: false,
    forceEscapePath: false,
    input: newInput(),
    statusEl: document.getElementById('status'),
  };
}

const game = newGame();

export function startJob(index, keepScore) {
  game.jobIndex = index;
  game.job = buildJob(index);
  initGuardSweeps(game.job);
  game.player = newPlayer(game.job.start);
  game.tools = newToolState();
  game.smokeClouds = [];
  game.noiseRings = [];
  game.jammerT = 0;
  game.time = 0;
  game.alarm = 0;
  game.strikes = 0;
  game.lockdownT = 0;
  game.loot = 0;
  game.seenEver = false;
  game.ledgerTaken = false;
  game.forceEscapePath = false;
  if (!keepScore) game.score = 0;
  game.mode = 'briefing';
  game.nearMissT = 0;
}

function setStatus(text) {
  if (game.statusEl) game.statusEl.textContent = text;
}

function coneCoversEye(eyeX, eyeY, eyeDir, range, half, px, py) {
  if (dist(eyeX, eyeY, px, py) > range) return false;
  return Math.abs(angleDiff(angleTo(eyeX, eyeY, px, py), eyeDir)) <= half;
}

function tick(dt) {
  const presses = consumePresses(game.input);
  if (presses.mute) toggleMute();
  if (presses.restart) {
    startJob(game.jobIndex, false);
    return;
  }

  if (game.mode === 'title') {
    if (presses.confirm) startJob(0, false);
    return;
  }
  if (game.mode === 'briefing') {
    if (presses.confirm) game.mode = 'playing';
    return;
  }
  if (game.mode === 'paused') {
    if (presses.pause || presses.confirm) game.mode = 'playing';
    return;
  }
  if (game.mode === 'jobdone') {
    if (presses.confirm) {
      if (game.jobIndex + 1 < 3) startJob(game.jobIndex + 1, true);
      else game.mode = 'win';
    }
    return;
  }
  if (game.mode === 'win' || game.mode === 'busted') return;
  if (game.mode !== 'playing') return;

  if (presses.pause) {
    game.mode = 'paused';
    return;
  }

  game.time += dt;

  // Tools.
  if (presses.toolLockpick) {
    ensureAudio();
    tryLockpick(game);
  }
  if (presses.toolSmoke) {
    ensureAudio();
    if (throwSmoke(game)) playAlarmSting();
  }
  if (presses.toolJammer && game.tools.jammerReady) {
    ensureAudio();
    fireJammer(game);
    playAlarmSting();
  }
  if (game.tools.jammerCooldown > 0) {
    game.tools.jammerCooldown -= dt;
    if (game.tools.jammerCooldown <= 0) game.tools.jammerReady = true;
  }
  if (game.jammerT > 0) game.jammerT -= dt;
  tickLockpick(game, dt);

  // Player.
  movePlayer(game, dt, game.input);
  const route = currentRoute(game.job, game.player.x, game.player.y);
  game.routeName = route ? route.label + ' — ' + route.note : '';

  // Guards + cameras.
  let anySeen = false;
  let closestSeen = 0;
  let nearMiss = false;
  for (const g of game.job.guards) {
    const seen = patrolGuard(g, dt, game);
    if (seen.seen) {
      anySeen = true;
      closestSeen = Math.max(closestSeen, seen.close);
    } else if (coneCoversEye(g.x, g.y, g.dir, 190, 0.62, game.player.x, game.player.y)) {
      nearMiss = true;
    }
  }
  for (const cam of game.job.cameras) {
    sweepCamera(cam, dt, game.time);
    const seen = cameraSeesPlayer(cam, game.player.x, game.player.y, game.job.walls, game.job.plants);
    if (seen.seen) {
      anySeen = true;
      closestSeen = Math.max(closestSeen, seen.close);
    } else if (cam.jammedT <= 0 && coneCoversEye(cam.x, cam.y, cam.angle, 230, 0.5, game.player.x, game.player.y)) {
      nearMiss = true;
    }
  }

  // Alarm.
  const beforeLockdown = game.lockdownT;
  const wasPlaying = game.mode === 'playing';
  alarmTick(game, dt, anySeen, closestSeen);
  if (game.lockdownT > 0 && beforeLockdown <= 0) playLockdownSiren();
  if (wasPlaying && game.mode === 'busted') playLoseStinger();

  // Near-miss heartbeat + CLOSE! flash.
  if (nearMiss && !anySeen) {
    if (game.nearMissT <= 0) playHeartbeat();
    game.nearMissT = 0.7;
  }
  if (game.nearMissT > 0) game.nearMissT -= dt;

  // Loot + escape.
  const lootBefore = game.loot;
  collectLoot(game);
  if (game.loot > lootBefore) playLootChime();
  if (game.lootChimeT > 0) game.lootChimeT -= dt;

  // Timers on effects.
  for (const s of game.smokeClouds) s.t -= dt;
  game.smokeClouds = game.smokeClouds.filter((s) => s.t > 0);
  for (const r of game.noiseRings) {
    r.r += 260 * dt;
    r.t -= dt;
  }
  game.noiseRings = game.noiseRings.filter((r) => r.t > 0);

  // Escape? (Only while still playing — a bust on the same frame wins.)
  const escapeReady = game.job.ledger ? game.ledgerTaken : game.loot >= game.job.target;
  if (game.mode === 'playing' && escapeReady && reachVan(game)) {
    const b = jobBonuses(game);
    game.score += b.total;
    if (game.jobIndex === 2) {
      game.mode = 'win';
      playWinStinger();
    } else {
      game.mode = 'jobdone';
      playWinStinger();
    }
    return;
  }

  setStatus(
    'Job ' + (game.jobIndex + 1) + ' of 3. Loot $' + game.loot + ' of $' + game.job.target +
    '. Alarm ' + Math.round(game.alarm) + '. Strikes ' + game.strikes + ' of ' + MAX_STRIKES + '.',
  );
}

let last = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  if (!game.frozen) tick(dt);
  renderGame(ctx, game);
  requestAnimationFrame(frame);
}

bindInput(game.input, canvas, () => ensureAudio());
startJob(0, false);
game.mode = 'title';

// Debug handle for playtests (headless screenshots drive the keys).
window.__crimson = game;

// Deterministic screenshot poses: ?shot=cover|title|lockdown|win
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  stageShot(game, shot);
  game.frozen = true;
}

requestAnimationFrame(frame);
