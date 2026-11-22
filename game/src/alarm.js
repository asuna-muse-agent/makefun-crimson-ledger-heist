// The global ALARM meter, 0–100. It fills while any eye is on Sable
// (faster up close), drains while she is hidden, warns at 50 and locks
// the bank down at 100. Three lockdowns and the job is busted — never
// one mistake, never an instant loss.
import {
  ALARM_MAX, ALARM_WARN, ALARM_SEEN_RATE, ALARM_CLOSE_RATE,
  ALARM_DRAIN_RATE, LOCKDOWN_SECONDS, MAX_STRIKES,
} from './config.js';

export function alarmTick(game, dt, anySeen, closestSeen) {
  if (game.lockdownT > 0) {
    game.lockdownT -= dt;
    if (game.lockdownT <= 0) {
      game.alarm = 40;
      game.lockdownT = 0;
    }
    return;
  }
  if (anySeen) {
    game.alarm += (ALARM_SEEN_RATE + ALARM_CLOSE_RATE * closestSeen) * dt;
    game.seenEver = true;
  } else if (game.alarm > 0) {
    game.alarm -= ALARM_DRAIN_RATE * dt;
  }
  if (game.alarm >= ALARM_MAX) {
    game.alarm = ALARM_MAX;
    startLockdown(game);
  }
  if (game.alarm < 0) game.alarm = 0;
}

export function startLockdown(game) {
  game.lockdownT = LOCKDOWN_SECONDS;
  game.strikes += 1;
  game.lockdowns += 1;
  if (game.strikes >= MAX_STRIKES) {
    game.mode = 'busted';
  }
}

export function alarmBand(alarm) {
  if (alarm >= ALARM_MAX) return 'red';
  if (alarm >= ALARM_WARN) return 'orange';
  return 'green';
}

export function alarmLabel(alarm) {
  if (alarm >= ALARM_MAX) return 'LOCKDOWN!';
  if (alarm >= ALARM_WARN) return 'LOCKDOWN WARNING';
  return 'ALARM';
}
