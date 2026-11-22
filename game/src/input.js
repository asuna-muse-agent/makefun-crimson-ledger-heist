// Keyboard + mouse input. WASD/arrows move, SHIFT runs (loud), 1/2/3 use
// tools, P pauses, M mutes, R restarts, Enter starts the next job.
// Hovering a guard or a camera shows its patrol / sweep path.
export function newInput() {
  return {
    left: false, right: false, up: false, down: false, run: false,
    toolLockpick: false, toolSmoke: false, toolJammer: false,
    pause: false, mute: false, restart: false, confirm: false,
    mouseX: 0, mouseY: 0, hoverGuard: null, hoverCamera: null,
  };
}

const KEYMAP = {
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  ShiftLeft: 'run', ShiftRight: 'run',
};

export function bindInput(input, canvas, onKey) {
  window.addEventListener('keydown', (e) => {
    const mapped = KEYMAP[e.code];
    if (mapped) {
      input[mapped] = true;
      e.preventDefault();
    }
    if (e.code === 'Digit1') input.toolLockpick = true;
    if (e.code === 'Digit2') input.toolSmoke = true;
    if (e.code === 'Digit3') input.toolJammer = true;
    if (e.code === 'KeyP') input.pause = true;
    if (e.code === 'KeyM') input.mute = true;
    if (e.code === 'KeyR') input.restart = true;
    if (e.code === 'Enter' || e.code === 'Space') input.confirm = true;
    if (onKey) onKey(e.code);
  });
  window.addEventListener('keyup', (e) => {
    const mapped = KEYMAP[e.code];
    if (mapped) input[mapped] = false;
  });
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    input.mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;
  });
}

export function consumePresses(input) {
  const out = {
    toolLockpick: input.toolLockpick, toolSmoke: input.toolSmoke,
    toolJammer: input.toolJammer, pause: input.pause, mute: input.mute,
    restart: input.restart, confirm: input.confirm,
  };
  input.toolLockpick = false;
  input.toolSmoke = false;
  input.toolJammer = false;
  input.pause = false;
  input.mute = false;
  input.restart = false;
  input.confirm = false;
  return out;
}
