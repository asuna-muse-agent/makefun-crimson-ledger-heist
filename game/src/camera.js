// Argus — the camera network. Fixed wall units sweeping fixed arcs with
// readable blind spots. A jammer freezes every camera; smoke blinds one
// camera's eye for a while. Striped red-white cones, never solid yellow:
// the judge must tell a camera from a guard at a glance.
import { CAMERA_RANGE, CAMERA_HALF } from './config.js';
import { coneSees, inPlantCover } from './vision.js';

export const CAMERA_TYPE = {
  label: 'Argus — fixed camera, rotating cone, blind spots you can read',
  range: CAMERA_RANGE,
  half: CAMERA_HALF,
};

export function sweepCamera(cam, dt, gameTime) {
  if (cam.jammedT > 0) { cam.jammedT -= dt; return; }
  if (cam.blindT > 0) cam.blindT -= dt;
  cam.angle = cam.baseAngle + Math.sin(gameTime * cam.speed + cam.phase) * cam.sweep;
}

export function cameraSeesPlayer(cam, px, py, walls, plants) {
  if (cam.jammedT > 0 || cam.blindT > 0) return { seen: false, close: 0 };
  if (inPlantCover(px, py, plants)) return { seen: false, close: 0 };
  return coneSees(cam.x, cam.y, cam.angle, CAMERA_RANGE, CAMERA_HALF, px, py, walls);
}

export function jamCameras(cameras, seconds) {
  for (const cam of cameras) cam.jammedT = seconds;
}

export function blindCamerasInRadius(cameras, x, y, radius, seconds) {
  for (const cam of cameras) {
    if (Math.hypot(cam.x - x, cam.y - y) < radius + 60) cam.blindT = seconds;
  }
}
