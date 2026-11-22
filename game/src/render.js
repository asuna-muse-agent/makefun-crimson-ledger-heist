// Canvas rendering: a BRIGHT bank — cream marble, brass trim, emerald
// felt, navy uniforms — so the frame reads at thumbnail size. Danger is
// unmistakable: guard cones SOLID yellow, camera cones STRIPED red-white,
// loot gold and glinting, the alarm light red. Safe cover is marble
// pillars and green plants.
import { CANVAS_W, CANVAS_H, HUD_H, PLAY, PALETTE } from './config.js';
import { GUARD_TYPES } from './guard.js';
import { alarmBand } from './alarm.js';
import { escapePathPoints, planGetaway } from './getaway.js';
import { LOOT_KINDS } from './loot.js';
import { drawHud, drawTitle, drawBriefing, drawPaused, drawLockdownBanner, drawJobDone, drawWin, drawBusted } from './hud.js';

function marbleFloor(ctx) {
  ctx.fillStyle = PALETTE.marble;
  ctx.fillRect(0, HUD_H, CANVAS_W, CANVAS_H - HUD_H);
  // Checker tiles.
  const tile = 74;
  for (let y = HUD_H; y < CANVAS_H; y += tile) {
    for (let x = 0; x < CANVAS_W; x += tile) {
      if (((x / tile) | 0) % 2 === ((y / tile) | 0) % 2) {
        ctx.fillStyle = PALETTE.marbleDark;
        ctx.fillRect(x, y, tile, tile);
      }
    }
  }
  // Brass border around the room.
  ctx.strokeStyle = PALETTE.brass;
  ctx.lineWidth = 5;
  ctx.strokeRect(PLAY.x0, PLAY.y0, PLAY.x1 - PLAY.x0, PLAY.y1 - PLAY.y0);
  // Wall signage: the bank's name, big and brass.
  ctx.fillStyle = PALETTE.brassDark;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M E R I D I A N   R E S E R V E   B A N K', CANVAS_W / 2, PLAY.y0 + 22);
}

function drawWalls(ctx, job) {
  for (const w of job.walls) {
    if (w.kind === 'counter') {
      ctx.fillStyle = '#8a6d1f';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = '#fbf6ea';
      ctx.fillRect(w.x + 3, w.y + 3, w.w - 6, w.h - 6);
      ctx.fillStyle = '#2fae5f';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TELLER', w.x + w.w / 2, w.y + w.h / 2);
      // Cash stacks on the counter.
      ctx.fillStyle = '#7ee081';
      ctx.fillRect(w.x + 12, w.y - 8, 22, 8);
      ctx.fillRect(w.x + w.w - 34, w.y - 8, 22, 8);
    } else if (w.kind === 'pillar') {
      ctx.fillStyle = '#cbb98a';
      ctx.beginPath();
      ctx.arc(w.x + w.w / 2, w.y + w.h / 2, w.w / 2 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbf6ea';
      ctx.beginPath();
      ctx.arc(w.x + w.w / 2, w.y + w.h / 2, w.w / 2 - 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PALETTE.brass;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w.x + w.w / 2, w.y + w.h / 2, w.w / 2 - 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (w.kind === 'felt') {
      ctx.fillStyle = PALETTE.feltDark;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = PALETTE.felt;
      ctx.fillRect(w.x + 4, w.y + 4, w.w - 8, w.h - 8);
      ctx.strokeStyle = PALETTE.brass;
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x + 4, w.y + 4, w.w - 8, w.h - 8);
      ctx.fillStyle = '#fbf6ea';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CARD TABLE', w.x + w.w / 2, w.y + w.h / 2);
    } else if (w.kind === 'vaultwall') {
      ctx.fillStyle = '#3a3f4a';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = '#565d6b';
      ctx.fillRect(w.x + 3, w.y, w.w - 6, w.h);
    }
  }
  // The vault door: a big circular door with spokes.
  const door = job.vaultDoor;
  if (door) {
    const cx = door.x + door.w / 2;
    const cy = door.y + door.h / 2;
    ctx.fillStyle = door.locked ? '#6b7280' : '#2fae5f';
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.brass;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(door.locked ? 'VAULT — LOCKED' : 'VAULT — OPEN', cx, cy + 58);
  }
}

function drawRoutes(ctx, job) {
  ctx.textBaseline = 'middle';
  for (const r of job.routes) {
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    r.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    const text = r.label + ' — ' + r.note;
    const tw = ctx.measureText(text).width;
    const lx = r.points[0][0] + 6;
    const ly = r.points[0][1] - 14;
    ctx.fillStyle = 'rgba(18, 32, 60, 0.88)';
    ctx.fillRect(lx - 4, ly - 10, tw + 8, 20);
    ctx.fillStyle = r.color;
    ctx.fillText(text, lx, ly);
  }
}

function drawEscapePath(ctx, game) {
  if (!planGetaway(game)) return;
  const pts = escapePathPoints(game);
  ctx.strokeStyle = '#ffd94a';
  ctx.lineWidth = 5;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
  ctx.stroke();
  ctx.setLineDash([]);
  const mid = pts[1];
  ctx.fillStyle = '#7a1f1f';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ESCAPE → VAN', mid[0] + 120, mid[1] - 12);
}

function drawPlants(ctx, job) {
  for (const p of job.plants) {
    ctx.fillStyle = '#2f7a3e';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4caf5a';
    ctx.beginPath();
    ctx.arc(p.x - 8, p.y - 6, p.r * 0.55, 0, Math.PI * 2);
    ctx.arc(p.x + 10, p.y + 8, p.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDE', p.x, p.y + p.r + 10);
  }
}

function drawLoot(ctx, game) {
  for (const l of game.job.loot) {
    if (l.taken) continue;
    l.glint = (l.glint + 1) % 60;
    const pulse = 0.6 + 0.4 * Math.sin((l.glint / 60) * Math.PI * 2);
    const kind = LOOT_KINDS[l.kind];
    ctx.fillStyle = kind.color;
    if (l.kind === 'gold') {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(-0.3);
      ctx.fillRect(-14, -7, 28, 14);
      ctx.fillStyle = 'rgba(255,255,255,' + pulse.toFixed(2) + ')';
      ctx.fillRect(-14, -7, 28, 5);
      ctx.restore();
    } else if (l.kind === 'cash') {
      ctx.fillRect(l.x - 12, l.y - 8, 24, 16);
      ctx.fillStyle = '#14523a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', l.x, l.y + 1);
    } else {
      ctx.beginPath();
      ctx.moveTo(l.x, l.y - 12);
      ctx.lineTo(l.x + 10, l.y);
      ctx.lineTo(l.x, l.y + 12);
      ctx.lineTo(l.x - 10, l.y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#241f18';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$' + (l.value / 1000) + 'k', l.x, l.y + 24);
  }
  const led = game.job.ledger;
  if (led && !led.taken) {
    const pulse = 0.6 + 0.4 * Math.sin(game.time * 4);
    ctx.fillStyle = '#ff5a5a';
    ctx.fillRect(led.x - 16, led.y - 20, 32, 40);
    ctx.fillStyle = 'rgba(255,255,255,' + pulse.toFixed(2) + ')';
    ctx.fillRect(led.x - 16, led.y - 20, 32, 8);
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LEDGER', led.x, led.y + 34);
  }
}

function drawVan(ctx, game) {
  const v = game.job.van;
  ctx.fillStyle = '#1d2f57';
  ctx.fillRect(v.x, v.y, v.w, v.h);
  ctx.fillStyle = '#fbf6ea';
  ctx.fillRect(v.x + 4, v.y + 4, v.w - 8, v.h - 8);
  ctx.fillStyle = '#1d2f57';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VAN', v.x + v.w / 2, v.y + v.h / 2 - 6);
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('LOADING DOCK', v.x + v.w / 2, v.y + v.h / 2 + 10);
  if (planGetaway(game)) {
    ctx.strokeStyle = '#ffd94a';
    ctx.lineWidth = 3;
    ctx.strokeRect(v.x - 4, v.y - 4, v.w + 8, v.h + 8);
  }
}

function drawCone(ctx, x, y, dir, range, half, fill, striped) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, dir - half, dir + half);
  ctx.closePath();
  if (striped) {
    ctx.clip();
    ctx.fillStyle = fill;
    ctx.fillRect(x - range, y - range, range * 2, range * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 7;
    for (let i = -range; i < range; i += 26) {
      ctx.beginPath();
      ctx.moveTo(x + i, y - range);
      ctx.lineTo(x + i + range, y + range);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = fill;
    ctx.globalAlpha = 0.34;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = fill;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawGuard(ctx, g) {
  const spec = GUARD_TYPES[g.type];
  const alert = g.state === 'chase' || g.state === 'suspicious';
  const coneColor = alert ? 'rgba(217,38,38,0.85)' : 'rgba(240,180,20,0.9)';
  if (g.blindT <= 0) {
    drawCone(ctx, g.x, g.y, g.dir, spec.range, spec.half, coneColor, false);
  }
  // Body: navy uniform, brass badge.
  ctx.fillStyle = spec.color;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.brass;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fbf6ea';
  ctx.beginPath();
  ctx.arc(g.x + Math.cos(g.dir) * 6, g.y + Math.sin(g.dir) * 6, 5, 0, Math.PI * 2);
  ctx.fill();
  // Name + state mark.
  ctx.fillStyle = '#241f18';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(g.type.toUpperCase(), g.x, g.y - 22);
  if (g.state === 'chase') {
    ctx.fillStyle = '#d92626';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('!', g.x, g.y - 34);
  } else if (g.state === 'suspicious') {
    ctx.fillStyle = '#f07f13';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('?', g.x, g.y - 34);
  }
  if (g.blindT > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('BLINDED ' + Math.ceil(g.blindT) + 's', g.x, g.y + 28);
  }
}

function drawCamera(ctx, cam) {
  if (cam.jammedT > 0) {
    ctx.fillStyle = 'rgba(90, 120, 150, 0.25)';
  } else {
    drawCone(ctx, cam.x, cam.y, cam.angle, 230, 0.5, 'rgba(217,38,38,0.55)', true);
  }
  // Wall-mounted unit.
  ctx.fillStyle = '#3a3f4a';
  ctx.fillRect(cam.x - 11, cam.y - 8, 22, 16);
  ctx.fillStyle = cam.jammedT > 0 ? '#8a97a5' : '#d92626';
  ctx.beginPath();
  ctx.arc(cam.x + 12, cam.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#241f18';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ARGUS', cam.x, cam.y - 16);
  if (cam.jammedT > 0) {
    ctx.fillStyle = '#5aa9ff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('JAMMED ' + Math.ceil(cam.jammedT) + 's', cam.x, cam.y + 34);
  } else if (cam.blindT > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('BLINDED', cam.x, cam.y + 34);
  }
}

function drawPlayer(ctx, game) {
  const p = game.player;
  // Noise rings while running.
  for (const ring of game.noiseRings) {
    ctx.strokeStyle = 'rgba(240,127,19,' + (0.7 * (1 - ring.r / ring.max)).toFixed(2) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Smoke clouds.
  for (const s of game.smokeClouds) {
    ctx.fillStyle = 'rgba(207,214,221,0.75)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Sable: crimson cloak, gold trim.
  ctx.fillStyle = '#7a1f1f';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd94a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fbf6ea';
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.dir) * 5, p.y + Math.sin(p.dir) * 5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#241f18';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SABLE', p.x, p.y - 20);
  if (game.tools.lockpicking) {
    ctx.fillStyle = '#5aa9ff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('PICKING… ' + Math.ceil(game.tools.lockpickT) + 's', p.x, p.y + 28);
    ctx.strokeStyle = '#5aa9ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 20, -Math.PI / 2, -Math.PI / 2 + (1 - game.tools.lockpickT / 3) * Math.PI * 2);
    ctx.stroke();
  }
}

function drawHoverPaths(ctx, game) {
  const input = game.input;
  const mx = input.mouseX;
  const my = input.mouseY;
  for (const g of game.job.guards) {
    if (Math.hypot(mx - g.x, my - g.y) < 26 && g.waypoints.length > 1) {
      ctx.strokeStyle = 'rgba(29,47,87,0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      g.waypoints.forEach((w, i) => (i === 0 ? ctx.moveTo(w[0], w[1]) : ctx.lineTo(w[0], w[1])));
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#1d2f57';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(g.type + ' patrol — ' + (GUARD_TYPES[g.type] ? GUARD_TYPES[g.type].label : ''), 20, CANVAS_H - 24);
    }
  }
  for (const cam of game.job.cameras) {
    if (Math.hypot(mx - cam.x, my - cam.y) < 26) {
      ctx.strokeStyle = 'rgba(217,38,38,0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(cam.x, cam.y, 230, cam.baseAngle - cam.sweep, cam.baseAngle + cam.sweep);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

export function renderGame(ctx, game) {
  marbleFloor(ctx);
  drawRoutes(ctx, game.job);
  drawEscapePath(ctx, game);
  drawWalls(ctx, game.job);
  drawPlants(ctx, game.job);
  drawLoot(ctx, game);
  drawVan(ctx, game);
  for (const cam of game.job.cameras) drawCamera(ctx, cam);
  for (const g of game.job.guards) drawGuard(ctx, g);
  drawPlayer(ctx, game);
  drawHoverPaths(ctx, game);

  // Near-miss flash.
  if (game.nearMissT > 0) {
    ctx.fillStyle = 'rgba(240,127,19,' + (0.25 * game.nearMissT).toFixed(2) + ')';
    ctx.fillRect(0, HUD_H, CANVAS_W, CANVAS_H - HUD_H);
    ctx.fillStyle = '#f07f13';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLOSE!', CANVAS_W / 2, 120);
  }

  drawHud(ctx, game);
  if (game.lockdownT > 0 && game.mode === 'playing') drawLockdownBanner(ctx, game);
  if (game.mode === 'title') drawTitle(ctx, game);
  if (game.mode === 'briefing') drawBriefing(ctx, game);
  if (game.mode === 'paused') drawPaused(ctx);
  if (game.mode === 'jobdone') drawJobDone(ctx, game);
  if (game.mode === 'win') drawWin(ctx, game);
  if (game.mode === 'busted') drawBusted(ctx, game);
}
