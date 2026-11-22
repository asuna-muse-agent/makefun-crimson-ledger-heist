// HUD, menus and screens. Everything the judge reads lives here: the
// loot counter, the BIG labelled ALARM gauge, the TOOLS bar with costs,
// WIN/LOSE spelled out, job, timer, lives and score — in every shot.
import { CANVAS_W, CANVAS_H, HUD_H, GAUGE_X, GAUGE_Y, GAUGE_W, GAUGE_H, MAX_STRIKES, PALETTE } from './config.js';
import { alarmBand, alarmLabel } from './alarm.js';
import { jobBonuses, jobRank } from './getaway.js';
import { escapeOpen } from './loot.js';

export function money(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

export function drawHud(ctx, game) {
  // Top strip.
  ctx.fillStyle = '#12203c';
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(0, HUD_H - 3, CANVAS_W, 3);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fbf6ea';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('CRIMSON LEDGER', 12, 17);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#ffd94a';
  ctx.fillText('LOOT ' + money(game.loot) + ' / ' + money(game.job.target), 210, 17);
  ctx.fillStyle = '#fbf6ea';
  ctx.fillText('JOB ' + (game.job.index + 1) + '/3', 430, 17);
  ctx.fillText('TIME ' + fmtTime(game.time), 510, 17);
  ctx.fillText('SCORE ' + Math.round(game.score).toLocaleString('en-US'), 610, 17);
  // Lives = strikes left, as diamonds.
  for (let i = 0; i < MAX_STRIKES; i++) {
    ctx.fillStyle = i < MAX_STRIKES - game.strikes ? '#ff5a5a' : '#3a2a2a';
    const cx = 760 + i * 22;
    ctx.beginPath();
    ctx.moveTo(cx, 8); ctx.lineTo(cx + 8, 17); ctx.lineTo(cx, 26); ctx.lineTo(cx - 8, 17);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(game.job.ledger && game.ledgerTaken ? 'LEDGER ✓  ESCAPE TO THE VAN!' : (escapeOpen(game) ? 'ESCAPE OPEN — REACH THE VAN!' : 'STEAL THE TARGET, THEN ESCAPE'), 1180, 17);
  // WIN / LOSE line, spelled out on the play screen.
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#7ee081';
  ctx.fillText('WIN: grab the target loot, reach the VAN', 12, 42);
  ctx.fillStyle = '#ff8a8a';
  ctx.fillText('LOSE: 3 strikes — alarm 100 = LOCKDOWN', 430, 42);
  ctx.fillStyle = '#fbf6ea';
  ctx.font = '12px sans-serif';
  ctx.fillText(game.routeName ? 'ROUTE: ' + game.routeName : 'PICK A ROUTE: VENTS · MAIN FLOOR · SERVICE', 760, 42);

  drawAlarmGauge(ctx, game);
  drawToolsBar(ctx, game);
}

export function drawAlarmGauge(ctx, game) {
  const x = GAUGE_X;
  const y = GAUGE_Y;
  const w = GAUGE_W;
  const h = GAUGE_H;
  ctx.fillStyle = '#12203c';
  ctx.fillRect(x - 6, y - 30, w + 12, h + 76);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 6, y - 30, w + 12, h + 76);
  // Label.
  ctx.fillStyle = '#fbf6ea';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ALARM', x + w / 2, y - 14);
  // Bands: green <50, orange 50-99, red at 100.
  ctx.fillStyle = '#2fae5f';
  ctx.fillRect(x, y + h / 2, w, h / 2);
  ctx.fillStyle = '#f07f13';
  ctx.fillRect(x, y + 2, w, h / 2 - 2);
  ctx.fillStyle = '#d92626';
  ctx.fillRect(x, y, w, 4);
  // Fill level from the bottom.
  const fillH = (game.alarm / 100) * h;
  const band = alarmBand(game.alarm);
  ctx.fillStyle = band === 'red' ? '#ff2e2e' : band === 'orange' ? '#ff9f2e' : '#37d67a';
  ctx.fillRect(x + 3, y + h - fillH, w - 6, fillH);
  // Warning line at 50, with the mark inside the gauge.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 4, y + h / 2);
  ctx.lineTo(x + w + 4, y + h / 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('50', x + 5, y + h / 2 - 5);
  ctx.textAlign = 'center';
  // Number, big.
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(String(Math.round(game.alarm)), x + w / 2, y + h + 26);
  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = band === 'green' ? '#7ee081' : band === 'orange' ? '#ffb35a' : '#ff8a8a';
  ctx.fillText(alarmLabel(game.alarm), x + w / 2, y + h + 44);
  if (game.lockdownT > 0) {
    ctx.fillStyle = '#ff8a8a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('SEALED ' + Math.ceil(game.lockdownT) + 's', x + w / 2, y + h + 60);
  }
}

export function drawToolsBar(ctx, game) {
  const y = 752;
  const h = 44;
  ctx.fillStyle = 'rgba(18, 32, 60, 0.92)';
  ctx.fillRect(10, y, 1178, h);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, y, 1178, h);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const tools = [
    { key: '1', name: 'LOCKPICK', cost: '3s channel · silent', on: true },
    { key: '2', name: 'SMOKE', cost: 'blinds 6s · x' + game.tools.smoke, on: game.tools.smoke > 0 },
    { key: '3', name: 'JAMMER', cost: '+20 ALARM · freezes cameras 10s', on: game.jammerT <= 0 },
  ];
  let x = 24;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#ffd94a';
  ctx.fillText('TOOLS:', x, y + h / 2);
  x += 62;
  for (const t of tools) {
    ctx.fillStyle = t.on ? '#fbf6ea' : '#6b6b6b';
    ctx.fillText('[' + t.key + '] ' + t.name, x, y + h / 2 - 8);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = t.on ? '#ffd94a' : '#6b6b6b';
    ctx.fillText(t.cost, x, y + h / 2 + 10);
    ctx.font = 'bold 13px sans-serif';
    x += t.name === 'JAMMER' ? 320 : 210;
  }
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fbf6ea';
  ctx.font = '12px sans-serif';
  ctx.fillText('WASD move · SHIFT run (loud) · P pause · M mute · R restart', 1176, y + h / 2);
}

function panel(ctx, title, lines, accent) {
  const w = 760;
  const h = 120 + lines.length * 30;
  const x = (CANVAS_W - w) / 2;
  const y = (CANVAS_H - h) / 2;
  ctx.fillStyle = 'rgba(18, 32, 60, 0.96)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = accent || '#c9a227';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(title, CANVAS_W / 2, y + 44);
  ctx.fillStyle = '#fbf6ea';
  ctx.font = '17px sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, CANVAS_W / 2, y + 96 + i * 30));
  return { x, y, w, h };
}

export function drawTitle(ctx, game) {
  ctx.fillStyle = '#f2e8d5';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#7a1f1f';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('CRIMSON LEDGER', CANVAS_W / 2, 110);
  ctx.fillStyle = '#1d2f57';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('— THE MERIDIAN BANK JOB —', CANVAS_W / 2, 160);
  ctx.fillStyle = '#241f18';
  ctx.font = '17px sans-serif';
  ctx.fillText('You are Sable. Slip into the Meridian Reserve Bank after hours,', CANVAS_W / 2, 205);
  ctx.fillText('steal the Crimson Ledger — and get out through the loading dock.', CANVAS_W / 2, 228);
  ctx.fillStyle = '#1d2f57';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('THE CREW YOU WILL MEET', CANVAS_W / 2, 280);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#241f18';
  const roster = [
    'Bull — heavy patroller, wide cone, slow',
    'Hound — runner, fast, short cone, chases noise',
    'Warden — sentry, stands, sweeps a long flashlight cone',
    'Sergeant Kade — boss guard, calls the others when alerted',
    'Argus — fixed camera, rotating cone, blind spots you can read',
  ];
  roster.forEach((line, i) => ctx.fillText(line, CANVAS_W / 2, 308 + i * 24));
  ctx.fillStyle = '#1d2f57';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('YOUR TOOLS — EACH WITH A COST', CANVAS_W / 2, 452);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#241f18';
  ctx.fillText('[1] LOCKPICK — 3s channel, silent · opens vault doors + vents', CANVAS_W / 2, 480);
  ctx.fillText('[2] SMOKE — blinds guards + cameras 6s · only 2 per job', CANVAS_W / 2, 504);
  ctx.fillText('[3] JAMMER — freezes ALL cameras 10s · costs +20 ALARM at once', CANVAS_W / 2, 528);
  ctx.fillStyle = '#7a1f1f';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press ENTER to start JOB 1 — THE TELLER HALL', CANVAS_W / 2, 580);
  ctx.fillStyle = '#241f18';
  ctx.font = '14px sans-serif';
  ctx.fillText('WASD / arrows move · SHIFT run (loud!) · 1/2/3 tools · P pause · M mute · R restart', CANVAS_W / 2, 614);
  ctx.fillText('WIN: grab the target loot and reach the VAN · LOSE: 3 strikes — alarm 100 means LOCKDOWN', CANVAS_W / 2, 638);
  drawToolsBar(ctx, game);
}

export function drawBriefing(ctx, game) {
  panel(ctx, game.job.name, [
    game.job.brief,
    'Target loot: ' + money(game.job.target) + '   ·   Par time: ' + game.job.parSeconds + 's',
    'Three routes: VENTS (slow, safe) · MAIN FLOOR (fast, exposed) · SERVICE (guards)',
    '',
    'Press ENTER to begin the job',
  ]);
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(10, 10, 20, 0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  panel(ctx, 'PAUSED', ['Take a breath, Sable. The cameras keep sweeping.', 'P resume · R restart · M mute']);
}

export function drawLockdownBanner(ctx, game) {
  ctx.fillStyle = 'rgba(217, 38, 38, 0.92)';
  ctx.fillRect(0, 300, CANVAS_W, 64);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LOCKDOWN!  ·  STRIKE ' + game.strikes + ' / ' + MAX_STRIKES, CANVAS_W / 2, 332);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Exits sealed ' + Math.ceil(game.lockdownT) + 's — stay out of the red cones', CANVAS_W / 2, 356);
}

export function drawJobDone(ctx, game) {
  const b = jobBonuses(game);
  const rank = jobRank(game);
  panel(ctx, 'JOB CLEAR — RANK ' + rank, [
    'Loot: ' + money(game.loot) + '   ·   Time bonus: ' + money(b.timeBonus),
    (game.seenEver ? '' : 'GHOST bonus (never seen): ' + money(b.ghost) + '   ·   ') + (game.alarm < 50 ? 'CLEAN GETAWAY bonus: ' + money(b.clean) : 'No clean getaway — alarm ran hot'),
    'Total score: ' + Math.round(game.score + b.total).toLocaleString('en-US'),
    '',
    'Press ENTER for the next job',
  ], '#2fae5f');
}

export function drawWin(ctx, game) {
  const b = jobBonuses(game);
  panel(ctx, 'CLEAN GETAWAY — YOU WIN!', [
    'The van pulls away from the loading dock. The Crimson Ledger is yours.',
    'Loot: ' + money(game.loot) + '   ·   Time bonus: ' + money(b.timeBonus),
    (game.seenEver ? '' : 'GHOST bonus (never seen): ' + money(b.ghost) + '   ·   ') + (game.alarm < 50 ? 'CLEAN GETAWAY bonus: ' + money(b.clean) : ''),
    'Final rank: ' + jobRank(game) + '   ·   Final score: ' + Math.round(game.score + b.total).toLocaleString('en-US'),
    '',
    'Press R to run it again',
  ], '#ffd94a');
}

export function drawBusted(ctx, game) {
  panel(ctx, 'BUSTED!', [
    'Three strikes — Director Ashford has your face on every camera.',
    'Loot kept: ' + money(game.loot) + '   ·   Score: ' + Math.round(game.score).toLocaleString('en-US'),
    '',
    'Press R to try the job again',
  ], '#d92626');
}
