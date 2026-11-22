// WebAudio synth only — no audio files. Footsteps, loot chime, alarm
// sting, lockdown siren, win/lose stingers and a heartbeat on near-miss.
// Created lazily on the first key press so autoplay rules never block it.
let ctx = null;
let muted = false;

export function ensureAudio() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

function tone(freq, seconds, type, gain, when) {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  const t0 = ac.currentTime + (when || 0);
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + seconds + 0.05);
}

export function playLootChime() {
  tone(880, 0.12, 'sine', 0.14, 0);
  tone(1318, 0.2, 'sine', 0.12, 0.09);
}

export function playAlarmSting() {
  tone(220, 0.25, 'square', 0.07, 0);
  tone(185, 0.3, 'square', 0.07, 0.12);
}

export function playLockdownSiren() {
  tone(660, 0.4, 'sawtooth', 0.08, 0);
  tone(440, 0.4, 'sawtooth', 0.08, 0.35);
  tone(660, 0.4, 'sawtooth', 0.08, 0.7);
}

export function playHeartbeat() {
  tone(70, 0.12, 'sine', 0.2, 0);
  tone(65, 0.14, 'sine', 0.18, 0.16);
}

export function playWinStinger() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.13, i * 0.12));
}

export function playLoseStinger() {
  [392, 330, 262, 196].forEach((f, i) => tone(f, 0.35, 'triangle', 0.12, i * 0.14));
}

export function playFootstep() {
  tone(90, 0.05, 'sine', 0.05, 0);
}
