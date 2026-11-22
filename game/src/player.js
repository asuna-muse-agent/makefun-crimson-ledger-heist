// Sable, the thief. WASD/arrows to move, SHIFT to run — running is fast
// but loud: noise rings pull Hounds. Walk is silent. Walls stop her;
// plants hide her; a lockpick channel stops her cold for 3 seconds.
import { PLAYER_R, PLAYER_WALK, PLAYER_RUN, NOISE_RUN_RADIUS, PLAY } from './config.js';

export function newPlayer(start) {
  return {
    x: start.x, y: start.y, dir: 0, moving: false, running: false,
    hidden: false, noiseT: 0, stepT: 0,
  };
}

function circleHitsWall(x, y, r, walls) {
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    if (Math.hypot(x - cx, y - cy) < r) return true;
  }
  return false;
}

export function movePlayer(game, dt, input) {
  const p = game.player;
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  p.moving = dx !== 0 || dy !== 0;
  p.running = !!input.run && p.moving;

  if (game.tools.lockpicking) {
    p.moving = false;
    p.running = false;
    return;
  }
  if (!p.moving) return;

  const len = Math.hypot(dx, dy);
  dx /= len;
  dy /= len;
  const speed = p.running ? PLAYER_RUN : PLAYER_WALK;
  p.dir = Math.atan2(dy, dx);

  const nx = p.x + dx * speed * dt;
  const ny = p.y + dy * speed * dt;
  if (!circleHitsWall(nx, p.y, PLAYER_R, game.job.walls)) p.x = nx;
  if (!circleHitsWall(p.x, ny, PLAYER_R, game.job.walls)) p.y = ny;
  p.x = Math.max(PLAY.x0 + PLAYER_R, Math.min(PLAY.x1 - PLAYER_R, p.x));
  p.y = Math.max(PLAY.y0 + PLAYER_R, Math.min(PLAY.y1 - PLAYER_R, p.y));

  if (p.running) {
    p.noiseT -= dt;
    if (p.noiseT <= 0) {
      p.noiseT = 0.5;
      game.noiseRings.push({ x: p.x, y: p.y, r: 10, max: NOISE_RUN_RADIUS, t: 0.7 });
      for (const g of game.job.guards) {
        if (g.type === 'Hound' && Math.hypot(g.x - p.x, g.y - p.y) < NOISE_RUN_RADIUS) {
          g.state = 'chase';
          g.alertT = 1.5;
          g.chaseX = p.x;
          g.chaseY = p.y;
        }
      }
    }
  }
  p.stepT -= dt;
}
