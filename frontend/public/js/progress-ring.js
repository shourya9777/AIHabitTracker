// Replaces components/ProgressRing.jsx
function progressRingSVG(value = 0, size = 44, stroke = 4, color) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const gradId = `ring-grad-${size}-${stroke}-${Math.round(Math.random() * 1e6)}`;
  const strokeColor = color || `url(#${gradId})`;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fcd34d" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>
      <circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke-width="${stroke}" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke-width="${stroke}"
        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        transform="rotate(-90 ${size / 2} ${size / 2})"
        style="stroke: ${strokeColor}; transition: stroke-dashoffset 0.6s ease;" />
    </svg>`;
}

window.progressRingSVG = progressRingSVG;
