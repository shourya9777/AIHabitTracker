// Replaces utils/confetti.js. Loaded via the canvas-confetti CDN
// script in partials/head.ejs (window.confetti), same library the
// React app used under the hood (canvas-confetti is plain JS already —
// only the import mechanism changes here).
function celebrate(origin = { x: 0.5, y: 0.6 }) {
  window.confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    scalar: 0.9,
    origin,
    colors: ["#fbbf24", "#fcd34d", "#f59e0b", "#fde68a", "#d97706"],
  });
}

function celebrateBig() {
  const duration = 800;
  const end = Date.now() + duration;
  (function frame() {
    window.confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#fbbf24", "#fcd34d", "#f59e0b"],
    });
    window.confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#fbbf24", "#fcd34d", "#f59e0b"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

window.ConfettiUtil = { celebrate, celebrateBig };
