// Replaces components/HeatmapChart.jsx (date-fns swapped for a plain
// Date-based formatter since there's no bundler here).
function levelColor(count, max) {
  if (!count) return "var(--heat-0)";
  const ratio = count / Math.max(1, max);
  if (ratio < 0.25) return "var(--heat-1)";
  if (ratio < 0.5) return "var(--heat-2)";
  if (ratio < 0.85) return "var(--heat-3)";
  return "var(--heat-4)";
}

function formatHeatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderHeatmap(container, data = []) {
  let cols = [];
  let max = 0;
  if (data.length) {
    max = Math.max(...data.map((d) => d.count));
    let col = [];
    data.forEach((d, i) => {
      const dow = new Date(d.date).getDay();
      const shifted = (dow + 6) % 7;
      if (i === 0) for (let j = 0; j < shifted; j++) col.push(null);
      col.push(d);
      if (shifted === 6) {
        cols.push(col);
        col = [];
      }
    });
    if (col.length) {
      while (col.length < 7) col.push(null);
      cols.push(col);
    }
  }

  const totalCount = data.reduce((s, d) => s + d.count, 0);
  const legend = [0, 0.2, 0.5, 0.8, 1]
    .map((r) => `<span class="w-3 h-3 rounded-sm" style="background:${levelColor(r * (max || 1), max || 1)}"></span>`)
    .join("");

  const colsHtml = cols
    .map(
      (col) => `
    <div class="flex flex-col gap-1">
      ${col
        .map((d) =>
          d
            ? `<div class="w-3.5 h-3.5 rounded-sm transition-colors" style="background:${levelColor(d.count, max)}" title="${formatHeatDate(d.date)} — ${d.count} completion${d.count === 1 ? "" : "s"}"></div>`
            : `<div class="w-3.5 h-3.5"></div>`
        )
        .join("")}
    </div>`
    )
    .join("");

  container.innerHTML = `
    <div class="card p-5">
      <div class="flex items-center justify-between mb-3">
        <div>
          <div class="text-sm font-medium">Consistency</div>
          <div class="text-xs text-muted">${totalCount} completions in the last 90 days</div>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-muted">Less ${legend} More</div>
      </div>
      <div class="overflow-x-auto"><div class="flex gap-1">${colsHtml}</div></div>
    </div>`;
}

window.renderHeatmap = renderHeatmap;
