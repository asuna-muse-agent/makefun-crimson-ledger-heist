// Tuning constants for CRIMSON LEDGER — The Meridian Bank Job.
// One place holds every number the game balances on, so a balance pass
// touches this file and nothing else.
export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// HUD layout: top strip + big vertical ALARM gauge on the right edge.
export const HUD_H = 56;
export const GAUGE_X = 1198;
export const GAUGE_Y = 72;
export const GAUGE_W = 68;
export const GAUGE_H = 520;

// Playable room bounds (inside the HUD chrome).
export const PLAY = { x0: 10, y0: 66, x1: 1188, y1: 790 };

export const PLAYER_R = 13;
export const PLAYER_WALK = 150;
export const PLAYER_RUN = 238;
export const NOISE_RUN_RADIUS = 170;

export const ALARM_MAX = 100;
export const ALARM_WARN = 50;
export const ALARM_SEEN_RATE = 26; // per second while any eye is on Sable
export const ALARM_CLOSE_RATE = 18; // extra when the spotter is close
export const ALARM_DRAIN_RATE = 9; // per second while fully hidden
export const ALARM_JAMMER_COST = 20;
export const LOCKDOWN_SECONDS = 15;
export const MAX_STRIKES = 3;

export const SMOKE_USES = 2;
export const SMOKE_RADIUS = 150;
export const SMOKE_SECONDS = 6;
export const JAMMER_SECONDS = 10;
export const LOCKPICK_SECONDS = 3;

export const GUARD_CONE_RANGE = 190;
export const GUARD_CONE_HALF = 0.62; // radians, ~71 degrees full
export const HOUND_CONE_RANGE = 130;
export const WARDEN_CONE_RANGE = 260;
export const CAMERA_RANGE = 230;
export const CAMERA_HALF = 0.5;

export const GHOST_BONUS = 1500;
export const CLEAN_GETAWAY_BONUS = 1000;
export const TIME_BONUS_PER_SEC = 25;

export const RANKS = [
  { min: 0.95, rank: 'S' },
  { min: 0.8, rank: 'A' },
  { min: 0.6, rank: 'B' },
  { min: 0, rank: 'C' },
];

export const PALETTE = {
  marble: '#f2e8d5',
  marbleDark: '#e3d3b8',
  brass: '#c9a227',
  brassDark: '#8a6d1f',
  felt: '#1e6b4a',
  feltDark: '#14523a',
  navy: '#1d2f57',
  navyDark: '#12203c',
  cream: '#fbf6ea',
  ink: '#241f18',
  gold: '#ffd94a',
  red: '#d92626',
  orange: '#f07f13',
  green: '#2fae5f',
  smoke: '#cfd6dd',
};
