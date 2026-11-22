// Seeded RNG (mulberry32) so patrol jitter and playtests reproduce
// exactly from a seed. The game never uses Math.random for gameplay.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngRange(rng, min, max) {
  return min + rng() * (max - min);
}

export function rngPick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

// Deterministic jitter for a patrol waypoint: same seed, same wobble.
export function jitterPoint(rng, x, y, amount) {
  return { x: x + rngRange(rng, -amount, amount), y: y + rngRange(rng, -amount, amount) };
}
