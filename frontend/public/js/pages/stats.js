// Replaces pages/Stats.jsx
document.addEventListener("DOMContentLoaded", async () => {
  const user = await window.AuthGuard.require();
  if (!user) return;

  const $ = (sel) => document.querySelector(sel);
  let stats = null;
  let habits = [];
  let logs = [];
  let charts = {};

  function destroyCharts() {
    Object.values(charts).forEach((c) => c?.destroy());
    charts = {};
  }

  function computeMonthly() {
    const end = new Date();
    const byDate = {};
    const order = [];
    for (let i = 29; i >= 0; i--) {
      const d = window.DateHelpers.addDays(end, -i);
      const key = window.DateHelpers.toKey(d);
      byDate[key] = 0;
      order.push(key);
    }
    for (const l of logs) if (byDate[l.completedDate] !== undefined) byDate[l.completedDate] += 1;
    return order.map((k) => ({
      label: new Date(k).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: byDate[k],
    }));
  }

  function computeWeekly() {
    const end = new Date();
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = window.DateHelpers.addDays(end, -i);
      const key = window.DateHelpers.toKey(d);
      const count = logs.filter((l) => l.completedDate === key).length;
      out.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }), count });
    }
    return out;
  }

  function computeCategoryData() {
    const map = {};
    for (const h of habits) map[h._id] = h.category;
    const counts = {};
    for (const l of logs) {
      const cat = map[l.habitId];
      if (!cat) continue;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }

  function renderHighlightCard(labelClass, icon, label, statObj, valueLine) {
    return `
      <div class="card p-5">
        <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${labelClass}">
          <i data-lucide="${icon}" class="w-[14px] h-[14px]"></i>
          ${label}
        </div>
        <div class="mt-2 flex items-center gap-3">
          <span class="text-3xl">${statObj.icon}</span>
          <div>
            <div class="font-semibold">${statObj.name}</div>
            <div class="text-sm text-muted">${valueLine}</div>
          </div>
        </div>
      </div>`;
  }

  function renderHabitCard(s) {
    return `
      <div class="card p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style="background:${s.color}26; color:${s.color}">${s.icon}</div>
        <div class="flex-1 min-w-0">
          <div class="font-medium truncate">${s.name}</div>
          <div class="text-xs text-muted">${s.category}</div>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <div class="flex items-center gap-1" title="Current streak">
            <i data-lucide="flame" class="w-[14px] h-[14px] text-orange-500"></i>
            <span class="font-medium">${s.currentStreak}</span>
          </div>
          <div class="flex items-center gap-1" title="Longest streak">
            <i data-lucide="trophy" class="w-[14px] h-[14px] text-amber-500"></i>
            <span class="font-medium">${s.longestStreak}</span>
          </div>
          <div class="hidden sm:flex items-center gap-1" title="30-day count">
            <i data-lucide="target" class="w-[14px] h-[14px] text-brand-500"></i>
            <span class="font-medium">${s.completions30d}/30</span>
          </div>
        </div>
      </div>`;
  }

  function render() {
    if (!stats.perHabit.length) {
      $("#stats-empty").classList.remove("hidden");
      $("#stats-body").classList.add("hidden");
      return;
    }
    $("#stats-empty").classList.add("hidden");
    $("#stats-body").classList.remove("hidden");

    const sortedByStreak = [...stats.perHabit].sort((a, b) => b.currentStreak - a.currentStreak);
    const best = sortedByStreak[0];
    const sortedByComp = [...stats.perHabit].sort((a, b) => b.completions30d - a.completions30d);
    const longestLongest = [...stats.perHabit].sort((a, b) => b.longestStreak - a.longestStreak)[0];
    const worst = [...stats.perHabit].filter((s) => s.completions30d < 30).sort((a, b) => a.completions30d - b.completions30d)[0];

    let cardsHtml = "";
    if (best) cardsHtml += renderHighlightCard("text-emerald-600 dark:text-emerald-400", "flame", "Best streak", best, `${best.currentStreak} day${best.currentStreak === 1 ? "" : "s"} running`);
    if (longestLongest) cardsHtml += renderHighlightCard("text-amber-600 dark:text-amber-400", "trophy", "Longest ever", longestLongest, `${longestLongest.longestStreak} day record`);
    if (worst) cardsHtml += renderHighlightCard("text-rose-600 dark:text-rose-400", "trending-down", "Needs attention", worst, `${worst.completions30d}/30 in the last 30 days`);
    $("#stats-highlight-cards").innerHTML = cardsHtml;

    const topHtml = sortedByComp
      .slice(0, 5)
      .map((s) => {
        const pct = Math.round((s.completions30d / 30) * 100);
        return `
        <div>
          <div class="flex items-center justify-between text-sm mb-1">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-lg shrink-0">${s.icon}</span>
              <span class="truncate">${s.name}</span>
            </div>
            <span class="text-muted text-xs">${s.completions30d}/30 · ${pct}%</span>
          </div>
          <div class="h-2 rounded-full overflow-hidden" style="background:var(--chip-bg)">
            <div class="h-full rounded-full transition-all" style="width:${pct}%; background:${s.color}"></div>
          </div>
        </div>`;
      })
      .join("");
    $("#stats-top-habits").innerHTML = `<div class="space-y-3">${topHtml}</div>`;

    $("#stats-habit-cards").innerHTML = stats.perHabit.map(renderHabitCard).join("");

    destroyCharts();
    const weekly = computeWeekly();
    charts.weekly = window.ChartUtil.barChart($("#stats-weekly-chart"), {
      labels: weekly.map((d) => d.label),
      datasets: [{ data: weekly.map((d) => d.count) }],
    });
    const monthly = computeMonthly();
    charts.monthly = window.ChartUtil.barChart($("#stats-monthly-chart"), {
      labels: monthly.map((d) => d.label),
      datasets: [{ data: monthly.map((d) => d.count) }],
      gradientColors: ["#fde68a", "#f59e0b"],
    });
    const categoryData = computeCategoryData();
    if (categoryData.length) {
      charts.category = window.ChartUtil.pieChart($("#stats-category-chart"), {
        labels: categoryData.map((d) => d.name),
        data: categoryData.map((d) => d.value),
      });
    } else {
      $("#stats-category-chart").innerHTML = `<div class="text-sm text-muted py-10 text-center">No data yet.</div>`;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  async function load() {
    const [statsRes, habitsRes] = await Promise.all([window.api.get("/logs/stats"), window.api.get("/habits")]);
    stats = statsRes.data;
    habits = habitsRes.data;
    const end = new Date();
    const start = window.DateHelpers.addDays(end, -29);
    const rangeRes = await window.api.get("/logs/range", {
      params: { start: window.DateHelpers.toKey(start), end: window.DateHelpers.toKey(end) },
    });
    logs = rangeRes.data;
  }

  document.addEventListener("themechange", () => {
    if (stats) render();
  });

  await load();
  $("#stats-loading").classList.add("hidden");
  $("#stats-content").classList.remove("hidden");
  render();
});
