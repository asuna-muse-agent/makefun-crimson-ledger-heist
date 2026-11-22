// The three routes through every room: VENTS (slow, safe, needs the
// lockpick), MAIN FLOOR (fast, exposed, cameras overhead) and SERVICE
// CORRIDOR (medium, guards patrol it). Each is drawn on the floor as a
// dashed line with its name, so the choice reads in one frame.
export function routeAtPoint(route, x, y, tolerance) {
  for (let i = 0; i < route.points.length - 1; i++) {
    const a = route.points[i];
    const b = route.points[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy || 1;
    let t = ((x - a[0]) * dx + (y - a[1]) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a[0] + t * dx;
    const py = a[1] + t * dy;
    if (Math.hypot(x - px, y - py) < tolerance) return route;
  }
  return null;
}

export function currentRoute(job, x, y) {
  for (const r of job.routes) {
    if (routeAtPoint(r, x, y, 26)) return r;
  }
  return null;
}

export function routeLabel(route) {
  return route ? route.label + ' — ' + route.note : '';
}
