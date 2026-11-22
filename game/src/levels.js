// The three jobs of the Meridian Bank heist. Each job is one room with
// three marked routes, fixed patrol loops, fixed camera sweeps, loot with
// risk/reward, a vault door (jobs 2-3) and a getaway van at the dock.
// Coordinates live inside the PLAY bounds from config.js.
import { PLAY } from './config.js';

function route(points, label, note, color) {
  return { points, label, note, color };
}

function guard(type, x, y, waypoints, speed) {
  return { type, x, y, waypoints, speed, wp: 0, dir: 0, state: 'patrol', stateT: 0, alertT: 0, chaseX: 0, chaseY: 0, blindT: 0, pauseT: 0 };
}

function camera(x, y, baseAngle, sweep, speed, phase) {
  return { x, y, baseAngle, sweep, speed, phase: phase || 0, angle: baseAngle, jammedT: 0, blindT: 0 };
}

function loot(x, y, value, kind, behindVault) {
  return { x, y, value, kind, behindVault: !!behindVault, taken: false, glint: 0 };
}

function jobTellerHall() {
  return {
    index: 0,
    name: 'JOB 1 — THE TELLER HALL',
    brief: 'After hours. Slip past the tellers’ floor, lift $15,000 and walk out the loading dock.',
    target: 15000,
    parSeconds: 150,
    start: { x: 70, y: 700 },
    van: { x: 1108, y: 692, w: 64, h: 44 },
    vaultDoor: null,
    ledger: null,
    walls: [
      { x: 180, y: 300, w: 360, h: 34, kind: 'counter' },
      { x: 640, y: 300, w: 360, h: 34, kind: 'counter' },
      { x: 280, y: 130, w: 44, h: 44, kind: 'pillar' },
      { x: 860, y: 130, w: 44, h: 44, kind: 'pillar' },
      { x: 280, y: 600, w: 44, h: 44, kind: 'pillar' },
      { x: 860, y: 600, w: 44, h: 44, kind: 'pillar' },
      { x: 560, y: 440, w: 60, h: 60, kind: 'pillar' },
      { x: 170, y: 520, w: 130, h: 62, kind: 'felt' },
      { x: 880, y: 520, w: 130, h: 62, kind: 'felt' },
    ],
    plants: [
      { x: 120, y: 175, r: 34 }, { x: 1060, y: 120, r: 34 },
      { x: 120, y: 655, r: 34 }, { x: 980, y: 690, r: 30 },
    ],
    routes: [
      route([[60, 112], [1120, 112]], 'VENTS', 'slow · safe · needs lockpick', '#5aa9ff'),
      route([[60, 408], [1120, 408]], 'MAIN FLOOR', 'fast · exposed · cameras', '#ffffff'),
      route([[60, 736], [1120, 736]], 'SERVICE CORRIDOR', 'medium · guards patrol here', '#ff9f2e'),
    ],
    guards: [
      guard('Bull', 590, 408, [[220, 408], [960, 408]], 46),
      guard('Hound', 200, 736, [[120, 736], [1060, 736]], 96),
      guard('Warden', 590, 240, [], 0),
    ],
    cameras: [camera(420, 76, Math.PI / 2, 0.9, 0.45, 0)],
    loot: [
      loot(400, 288, 6000, 'gold'), loot(790, 288, 5000, 'cash'),
      loot(235, 512, 5000, 'cash'), loot(1010, 200, 4000, 'jewel'),
    ],
  };
}

function jobVaultFloor() {
  return {
    index: 1,
    name: 'JOB 2 — THE VAULT FLOOR',
    brief: 'The vault door needs the lockpick. Inside: the big gold. Five guards, three Argus eyes.',
    target: 30000,
    parSeconds: 180,
    start: { x: 70, y: 700 },
    van: { x: 1108, y: 692, w: 64, h: 44 },
    vaultDoor: { x: 940, y: 352, w: 26, h: 76, locked: true },
    ledger: null,
    walls: [
      { x: 940, y: 170, w: 26, h: 182, kind: 'vaultwall' },
      { x: 940, y: 428, w: 26, h: 182, kind: 'vaultwall' },
      { x: 180, y: 300, w: 300, h: 34, kind: 'counter' },
      { x: 560, y: 300, w: 300, h: 34, kind: 'counter' },
      { x: 260, y: 130, w: 44, h: 44, kind: 'pillar' },
      { x: 700, y: 130, w: 44, h: 44, kind: 'pillar' },
      { x: 260, y: 600, w: 44, h: 44, kind: 'pillar' },
      { x: 700, y: 600, w: 44, h: 44, kind: 'pillar' },
      { x: 480, y: 470, w: 120, h: 56, kind: 'felt' },
    ],
    plants: [
      { x: 120, y: 175, r: 34 }, { x: 880, y: 120, r: 34 },
      { x: 120, y: 655, r: 34 }, { x: 620, y: 700, r: 30 },
    ],
    routes: [
      route([[60, 112], [1120, 112]], 'VENTS', 'slow · safe · needs lockpick', '#5aa9ff'),
      route([[60, 408], [900, 408]], 'MAIN FLOOR', 'fast · exposed · cameras', '#ffffff'),
      route([[60, 736], [1120, 736]], 'SERVICE CORRIDOR', 'medium · guards patrol here', '#ff9f2e'),
    ],
    guards: [
      guard('Bull', 400, 408, [[160, 408], [880, 408]], 50),
      guard('Bull', 1050, 300, [[1050, 220], [1050, 560]], 44),
      guard('Hound', 200, 736, [[120, 736], [900, 736]], 100),
      guard('Warden', 600, 230, [], 0),
      guard('Sergeant Kade', 820, 520, [[820, 470], [820, 660]], 58),
    ],
    cameras: [
      camera(300, 76, Math.PI / 2, 0.9, 0.5, 0),
      camera(760, 76, Math.PI / 2, 0.9, 0.5, 1.6),
      camera(1120, 390, Math.PI, 0.8, 0.4, 0.8),
    ],
    loot: [
      loot(330, 288, 6000, 'gold'), loot(700, 288, 5000, 'cash'),
      loot(540, 462, 5000, 'jewel'), loot(200, 650, 4000, 'cash'),
      loot(1080, 250, 12000, 'gold', true), loot(1080, 540, 8000, 'jewel', true),
    ],
  };
}

function jobMeridianVault() {
  return {
    index: 2,
    name: 'JOB 3 — THE MERIDIAN VAULT',
    brief: 'Director Ashford walks the vault floor himself. Take the Crimson Ledger, then run for the van.',
    target: 25000,
    parSeconds: 210,
    start: { x: 70, y: 700 },
    van: { x: 1108, y: 692, w: 64, h: 44 },
    vaultDoor: { x: 940, y: 352, w: 26, h: 76, locked: true },
    ledger: { x: 1080, y: 390, taken: false },
    walls: [
      { x: 940, y: 170, w: 26, h: 182, kind: 'vaultwall' },
      { x: 940, y: 428, w: 26, h: 182, kind: 'vaultwall' },
      { x: 180, y: 300, w: 300, h: 34, kind: 'counter' },
      { x: 560, y: 300, w: 300, h: 34, kind: 'counter' },
      { x: 260, y: 130, w: 44, h: 44, kind: 'pillar' },
      { x: 700, y: 130, w: 44, h: 44, kind: 'pillar' },
      { x: 260, y: 600, w: 44, h: 44, kind: 'pillar' },
      { x: 700, y: 600, w: 44, h: 44, kind: 'pillar' },
      { x: 480, y: 470, w: 120, h: 56, kind: 'felt' },
      { x: 1020, y: 130, w: 90, h: 40, kind: 'counter' },
    ],
    plants: [
      { x: 120, y: 175, r: 34 }, { x: 880, y: 120, r: 34 },
      { x: 120, y: 655, r: 34 }, { x: 620, y: 700, r: 30 },
    ],
    routes: [
      route([[60, 112], [1120, 112]], 'VENTS', 'slow · safe · needs lockpick', '#5aa9ff'),
      route([[60, 408], [900, 408]], 'MAIN FLOOR', 'fast · exposed · cameras', '#ffffff'),
      route([[60, 736], [1120, 736]], 'SERVICE CORRIDOR', 'medium · guards patrol here', '#ff9f2e'),
    ],
    guards: [
      guard('Bull', 400, 408, [[160, 408], [880, 408]], 54),
      guard('Bull', 1050, 300, [[1050, 220], [1050, 560]], 48),
      guard('Hound', 200, 736, [[120, 736], [900, 736]], 104),
      guard('Hound', 600, 650, [[420, 650], [880, 650]], 100),
      guard('Warden', 600, 230, [], 0),
      guard('Warden', 880, 660, [], 0),
      guard('Sergeant Kade', 820, 520, [[820, 470], [820, 660]], 62),
    ],
    cameras: [
      camera(300, 76, Math.PI / 2, 0.9, 0.55, 0),
      camera(760, 76, Math.PI / 2, 0.9, 0.55, 1.6),
      camera(1120, 390, Math.PI, 0.8, 0.45, 0.8),
      camera(590, 784, -Math.PI / 2, 0.9, 0.5, 2.4),
    ],
    loot: [
      loot(330, 288, 6000, 'gold'), loot(700, 288, 5000, 'cash'),
      loot(540, 462, 5000, 'jewel'), loot(200, 650, 4000, 'cash'),
      loot(1080, 250, 9000, 'gold', true), loot(1080, 540, 7000, 'jewel', true),
      loot(1065, 150, 5000, 'cash', true), loot(700, 650, 4000, 'gold'),
    ],
  };
}

export const JOBS = [jobTellerHall, jobVaultFloor, jobMeridianVault];

export function buildJob(index) {
  return JOBS[index]();
}

export function jobLootTotal(job) {
  let total = job.loot.reduce((s, l) => s + l.value, 0);
  if (job.ledger) total += 25000;
  return total;
}
