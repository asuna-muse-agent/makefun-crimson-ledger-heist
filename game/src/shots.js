// Screenshot staging: deterministic poses for the four screenshots.
// Called once from main.js when the URL carries ?shot=<name>; the loop
// then freezes, so the frame the camera catches is exactly this pose.
// Every pose is a real render of the game's own code — nothing is drawn
// by hand for the camera.
import { startJob } from './main.js';

function poseGuard(g, x, y, dir, state) {
  g.x = x;
  g.y = y;
  g.dir = dir;
  g.state = state || 'patrol';
  g.stateT = 0;
  g.alertT = state === 'chase' ? 2.5 : 0;
}

export function stageShot(game, name) {
  if (name === 'title') {
    game.mode = 'title';
    return;
  }

  if (name === 'cover') {
    // Mid-heist, job 1: Sable behind a marble pillar, guards with solid
    // yellow cones, one Argus camera sweeping a striped cone, gold
    // glinting, ALARM at 35, loot $12,400, three route markers, and the
    // dashed gold ESCAPE → VAN path lit up.
    startJob(0, false);
    game.mode = 'playing';
    game.time = 62;
    game.alarm = 35;
    game.loot = 12400;
    game.score = 12900;
    game.forceEscapePath = true;
    game.player.x = 344;
    game.player.y = 668;
    game.player.dir = -Math.PI / 2;
    const guards = game.job.guards;
    poseGuard(guards[0], 590, 408, Math.PI, 'patrol'); // Bull, wide yellow cone
    poseGuard(guards[1], 500, 736, 0, 'patrol'); // Hound on the service corridor
    poseGuard(guards[2], 590, 240, Math.PI / 2, 'patrol'); // Warden sweeping down
    const cam = game.job.cameras[0];
    cam.angle = Math.PI / 2 + 0.45; // striped cone sweeping down-left
    cam.phase = 0;
    game.job.loot[0].taken = true; // $6,000 gold
    game.job.loot[1].taken = true; // $5,000 cash
    return;
  }

  if (name === 'lockdown') {
    // The caught moment, job 2: alarm 100, LOCKDOWN banner, red cones on
    // Sable, smoke deployed, Jammer active — cameras frozen with JAMMED
    // tags, exits sealed, strike 1 of 3.
    startJob(1, false);
    game.mode = 'playing';
    game.time = 96;
    game.alarm = 100;
    game.lockdownT = 12;
    game.strikes = 1;
    game.loot = 18000;
    game.score = 18500;
    game.seenEver = true;
    game.jammerT = 8;
    game.player.x = 700;
    game.player.y = 520;
    game.player.dir = Math.PI;
    game.smokeClouds.push({ x: 700, y: 520, r: 150, t: 5 });
    const guards = game.job.guards;
    poseGuard(guards[0], 480, 408, 0, 'chase');
    poseGuard(guards[1], 1050, 420, Math.PI, 'chase');
    poseGuard(guards[2], 420, 736, 0, 'chase');
    poseGuard(guards[3], 600, 230, Math.PI / 2, 'suspicious');
    poseGuard(guards[4], 820, 600, -Math.PI / 2, 'chase');
    for (const cam of game.job.cameras) cam.jammedT = 8;
    game.job.loot[0].taken = true;
    game.job.loot[1].taken = true;
    game.job.loot[2].taken = true;
    return;
  }

  if (name === 'win') {
    // The getaway, job 3: the van at the loading dock, the Ledger taken,
    // Ghost bonus (never seen) + Clean Getaway bonus, rank S.
    startJob(2, false);
    game.mode = 'win';
    game.time = 168;
    game.alarm = 32;
    game.loot = 52000;
    game.score = 53400;
    game.seenEver = false;
    game.ledgerTaken = true;
    game.job.ledger.taken = true;
    game.job.vaultDoor.locked = false;
    for (const l of game.job.loot) l.taken = true;
    game.player.x = 1130;
    game.player.y = 714;
    game.player.dir = 0;
    const guards = game.job.guards;
    poseGuard(guards[0], 400, 408, Math.PI, 'patrol');
    poseGuard(guards[6], 820, 520, -Math.PI / 2, 'patrol');
    return;
  }
}
