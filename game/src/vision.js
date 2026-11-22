// Vision cones and line of sight. A spotter sees Sable only when she is
// inside the cone's range and angle AND the segment between them crosses
// no wall. Pillars, counters and the vault wall all block sight.
export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// Segment (x1,y1)-(x2,y2) vs axis-aligned rect: true when it crosses it.
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx;
    let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (Math.abs(dy) < 1e-9) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy;
    let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

export function hasLineOfSight(x1, y1, x2, y2, walls) {
  for (const w of walls) {
    if (segmentHitsRect(x1, y1, x2, y2, w)) return false;
  }
  return true;
}

// Is the player inside this eye's cone? Returns 'seen' + closeness 0..1.
export function coneSees(eyeX, eyeY, eyeDir, range, halfAngle, px, py, walls) {
  const d = dist(eyeX, eyeY, px, py);
  if (d > range) return { seen: false, close: 0 };
  const a = angleTo(eyeX, eyeY, px, py);
  if (Math.abs(angleDiff(a, eyeDir)) > halfAngle) return { seen: false, close: 0 };
  if (!hasLineOfSight(eyeX, eyeY, px, py, walls)) return { seen: false, close: 0 };
  return { seen: true, close: 1 - d / range };
}

// Is Sable in soft cover (a plant's leaves)? Plants hide her even in a cone.
export function inPlantCover(px, py, plants) {
  for (const p of plants) {
    if (dist(px, py, p.x, p.y) < p.r) return true;
  }
  return false;
}
