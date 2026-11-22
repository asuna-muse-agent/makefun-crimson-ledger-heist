// Guard state machine: patrol -> suspicious -> alert/chase -> return.
// Each named type reads differently: Bull is wide and slow, Hound is fast
// with a short cone and chases noise, Warden stands and sweeps a long
// flashlight, Sergeant Kade calls the others when he is alerted.
import { GUARD_CONE_RANGE, GUARD_CONE_HALF, HOUND_CONE_RANGE, WARDEN_CONE_RANGE, PLAY } from './config.js';
import { angleTo, angleDiff, coneSees, dist, inPlantCover } from './vision.js';

export const GUARD_TYPES = {
  Bull: { label: 'Bull — heavy patroller, wide cone, slow', range: GUARD_CONE_RANGE, half: 0.72, speed: 46, color: '#1d2f57' },
  Hound: { label: 'Hound — runner, fast, short cone, chases noise', range: HOUND_CONE_RANGE, half: 0.5, speed: 100, color: '#5b2d8e' },
  Warden: { label: 'Warden — sentry, stands, sweeps a long flashlight', range: WARDEN_CONE_RANGE, half: 0.42, speed: 0, color: '#274e13' },
  'Sergeant Kade': { label: 'Sergeant Kade — boss guard, calls others when alerted', range: 210, half: 0.66, speed: 60, color: '#7a1f1f' },
};

export function guardConeSpec(g) {
  return GUARD_TYPES[g.type] || GUARD_TYPES.Bull;
}

export function guardSeesPlayer(g, px, py, walls, plants) {
  if (g.blindT > 0) return { seen: false, close: 0 };
  if (inPlantCover(px, py, plants)) return { seen: false, close: 0 };
  const spec = guardConeSpec(g);
  return coneSees(g.x, g.y, g.dir, spec.range, spec.half, px, py, walls);
}

function clampToPlay(g) {
  g.x = Math.max(PLAY.x0 + 8, Math.min(PLAY.x1 - 8, g.x));
  g.y = Math.max(PLAY.y0 + 8, Math.min(PLAY.y1 - 8, g.y));
}

// One tick of one guard. Returns 'spotted' when this guard has eyes on Sable.
export function patrolGuard(g, dt, game) {
  const spec = guardConeSpec(g);
  if (g.blindT > 0) g.blindT -= dt;
  if (g.alertT > 0) g.alertT -= dt;

  const seen = guardSeesPlayer(g, game.player.x, game.player.y, game.job.walls, game.job.plants);

  if (seen.seen) {
    if (g.state !== 'chase') {
      g.state = 'suspicious';
      g.stateT += dt;
      if (g.stateT > 0.6) {
        g.state = 'chase';
        g.alertT = 2.5;
        if (g.type === 'Sergeant Kade') {
          for (const other of game.job.guards) {
            if (other !== g && other.state !== 'chase') { other.state = 'suspicious'; other.stateT = 0.4; }
          }
        }
      }
    } else {
      g.alertT = 2.5;
    }
  } else if (g.state === 'suspicious') {
    g.stateT -= dt * 0.5;
    if (g.stateT <= 0) g.state = 'patrol';
  } else if (g.state === 'chase' && g.alertT <= 0) {
    g.state = 'return';
  }

  // Movement by state.
  if (g.state === 'chase' && g.blindT <= 0) {
    const a = angleTo(g.x, g.y, game.player.x, game.player.y);
    const sp = spec.speed * 1.55;
    g.x += Math.cos(a) * sp * dt;
    g.y += Math.sin(a) * sp * dt;
    g.dir = a;
  } else if (g.state === 'return') {
    const home = g.waypoints[0] || { x: g.x, y: g.y };
    const d = dist(g.x, g.y, home.x, home.y);
    if (d < 6) { g.state = 'patrol'; g.wp = 0; }
    else {
      const a = angleTo(g.x, g.y, home.x, home.y);
      g.x += Math.cos(a) * spec.speed * dt;
      g.y += Math.sin(a) * spec.speed * dt;
      g.dir = a;
    }
  } else if (g.state === 'patrol' && g.waypoints.length > 1) {
    const target = g.waypoints[g.wp];
    const d = dist(g.x, g.y, target.x, target.y);
    if (d < 8) {
      g.wp = (g.wp + 1) % g.waypoints.length;
      g.pauseT = 0.4;
    } else if (g.pauseT > 0) {
      g.pauseT -= dt;
    } else {
      const a = angleTo(g.x, g.y, target.x, target.y);
      g.x += Math.cos(a) * spec.speed * dt;
      g.y += Math.sin(a) * spec.speed * dt;
      g.dir = a;
    }
  } else if (g.type === 'Warden') {
    // Warden stands and sweeps his flashlight cone back and forth.
    g.dir = g.sweepBase + Math.sin(game.time * 0.7 + g.sweepPhase) * 0.85;
  }
  clampToPlay(g);
  return seen;
}

export function initGuardSweeps(job) {
  for (const g of job.guards) {
    if (g.type === 'Warden') {
      g.sweepBase = g.dir || 0;
      g.sweepPhase = (g.x * 0.01 + g.y * 0.013) % (Math.PI * 2);
      g.dir = g.sweepBase;
    } else if (g.waypoints.length > 0) {
      const t = g.waypoints[0];
      g.dir = angleTo(g.x, g.y, t.x, t.y);
    }
  }
}
