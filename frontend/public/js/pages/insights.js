// Replaces pages/Insights.jsx
document.addEventListener("DOMContentLoaded", async () => {
  const user = await window.AuthGuard.require();
  if (!user) return;

  const $ = (sel) => document.querySelector(sel);
  const reportCacheKey = (weekStart) => `weekly-report-${weekStart}`;

  const thisWeek = window.DateHelpers.weekKeysFor(new Date());
  const lastWeek = window.DateHelpers.weekKeysFor(window.DateHelpers.addDays(new Date(), -7));
  const thisWeekKeySet = new Set(thisWeek.map((d) => d.key));

  let habits = [];
  let logs = [];
  let report = "";
  let reportGeneratedAt = null;
  let reportLoading = false;
  let charts = {};

  function destroyCharts() {
    Object.values(charts).forEach((c) => c?.destroy());
    charts = {};
  }

  async function generateReport() {
    reportLoading = true;
    renderReport();
    try {
      const res = await window.api.post("/ai/weekly-report");
      report = res.data.content;
      reportGeneratedAt = new Date();
      localStorage.setItem(reportCacheKey(thisWeek[0].key), JSON.stringify({ content: report, generatedAt: reportGeneratedAt }));
    } catch {
      report = "Failed to generate the report. Please try again.";
    } finally {
      reportLoading = false;
      renderReport();
    }
  }

  function renderReport() {
    $("#insights-report-subtitle").textContent = reportGeneratedAt
      ? `Generated ${reportGeneratedAt.toLocaleString()}`
      : "Personalised review of your last 7 days";
    $("#insights-report-loading").classList.toggle("hidden", !(reportLoading && !report));
    $("#insights-report-body").classList.toggle("hidden", !report);
    $("#insights-generate-btn").classList.toggle("hidden", !!report || reportLoading);
    if (report) window.renderMarkdown($("#insights-report-body"), report);
    if (window.lucide) window.lucide.createIcons();
  }

  function renderAll() {
    const thisWeekLogs = logs.filter((l) => thisWeekKeySet.has(l.completedDate));
    const lastWeekLogs = logs.filter((l) => !thisWeekKeySet.has(l.completedDate));

    const totalSlots = habits.length * 7;
    const totalDone = thisWeekLogs.length;
    const totalLast = lastWeekLogs.length;
    const completionRate = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;
    const delta = totalDone - totalLast;
    const deltaPct = totalLast ? Math.round(((totalDone - totalLast) / totalLast) * 100) : totalDone > 0 ? 100 : 0;

    $("#insights-week-range").textContent = `${thisWeek[0].date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} — ${thisWeek[6].date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
    $("#insights-total-done").textContent = totalDone;
    $("#insights-completion-rate").textContent = `${completionRate}%`;
    $("#insights-completion-sub").textContent = `${totalDone}/${totalSlots} slots`;

    const pill = $("#insights-delta-pill");
    const icon = delta > 0 ? "trending-up" : delta < 0 ? "trending-down" : "minus";
    const color = delta > 0 ? "text-emerald-500 bg-emerald-500/10" : delta < 0 ? "text-rose-500 bg-rose-500/10" : "text-faint bg-[var(--chip-bg)]";
    const label = delta === 0 ? "no change" : `${delta > 0 ? "+" : ""}${delta} (${deltaPct > 0 ? "+" : ""}${deltaPct}%)`;
    pill.className = `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`;
    pill.innerHTML = `<i data-lucide="${icon}" class="w-3 h-3"></i> ${label}`;

    const dailyData = thisWeek.map((d) => ({ label: d.label, count: thisWeekLogs.filter((l) => l.completedDate === d.key).length }));
    const bestDay = [...dailyData].sort((a, b) => b.count - a.count)[0];
    $("#insights-best-day").textContent = bestDay?.count ? bestDay.label : "—";
    $("#insights-best-day-sub").textContent = bestDay?.count ? `${bestDay.count} habit${bestDay.count === 1 ? "" : "s"}` : "no data";

    const perHabit = habits
      .filter((h) => !h.isArchived)
      .map((h) => {
        const done = thisWeekLogs.filter((l) => String(l.habitId) === String(h._id)).length;
        const target = h.targetDays || 7;
        return { habit: h, done, target, pct: Math.min(100, Math.round((done / Math.max(1, target)) * 100)) };
      })
      .sort((a, b) => b.pct - a.pct);
    const topHabit = perHabit[0];
    if (topHabit?.done) {
      $("#insights-top-habit").innerHTML = `<span class="text-xl">${topHabit.habit.icon}</span><span class="font-medium truncate">${topHabit.habit.name}</span>`;
      $("#insights-top-habit-sub").textContent = `${topHabit.done}/${topHabit.target} this week`;
    } else {
      $("#insights-top-habit").innerHTML = `<span class="font-medium">—</span>`;
      $("#insights-top-habit-sub").textContent = "no completions";
    }

    // Per-habit performance bars
    const perHabitEl = $("#insights-per-habit");
    if (!perHabit.length) {
      perHabitEl.innerHTML = `<div class="text-sm text-muted py-10 text-center">No active habits.</div>`;
    } else {
      perHabitEl.innerHTML = `<div class="space-y-3">${perHabit
        .map(
          ({ habit, done, target, pct }) => `
        <div>
          <div class="flex items-center justify-between text-sm mb-1">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-lg shrink-0">${habit.icon}</span>
              <span class="truncate">${habit.name}</span>
            </div>
            <span class="text-muted text-xs">${done}/${target} · ${pct}%</span>
          </div>
          <div class="h-2 rounded-full overflow-hidden" style="background:var(--chip-bg)">
            <div class="h-full rounded-full transition-all" style="width:${pct}%; background:${habit.color}; ${pct === 100 ? `box-shadow:0 0 12px ${habit.color}88` : ""}"></div>
          </div>
        </div>`
        )
        .join("")}</div>`;
    }

    // Category pie
    const catMap = {};
    for (const h of habits) catMap[h._id] = h.category;
    const catCounts = {};
    for (const l of thisWeekLogs) {
      const cat = catMap[l.habitId];
      if (!cat) continue;
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
    const categoryData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));

    // Streak board
    const streakBoard = {};
    for (const h of habits) {
      const keys = logs
        .filter((l) => String(l.habitId) === String(h._id))
        .map((l) => l.completedDate)
        .sort()
        .reverse();
      streakBoard[h._id] = window.DateHelpers.streakFromKeys(keys);
    }
    const activeHabits = habits.filter((h) => !h.isArchived);
    const activeStreaks = Object.values(streakBoard).filter((s) => s.current > 0).length;

    if (activeHabits.length) {
      $("#insights-streaks-card").classList.remove("hidden");
      $("#insights-streaks-sub").textContent = `${activeStreaks} of ${activeHabits.length}`;
      $("#insights-streaks-grid").innerHTML = activeHabits
        .map((h) => {
          const cur = streakBoard[h._id]?.current || 0;
          return `
          <div class="rounded-xl glass p-3 flex items-center gap-3">
            <span class="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style="background:${h.color}26; color:${h.color}">${h.icon}</span>
            <div class="min-w-0 flex-1">
              <div class="text-sm truncate">${h.name}</div>
              <div class="text-xs font-medium ${cur > 0 ? "text-orange-500" : "text-faint"}">🔥 ${cur} day${cur === 1 ? "" : "s"}</div>
            </div>
          </div>`;
        })
        .join("");
    } else {
      $("#insights-streaks-card").classList.add("hidden");
    }

    // Charts
    destroyCharts();
    charts.daily = window.ChartUtil.barChart($("#insights-daily-chart"), {
      labels: dailyData.map((d) => d.label),
      datasets: [{ data: dailyData.map((d) => d.count) }],
    });
    const compareLabels = thisWeek.map((d) => d.label);
    const thisCounts = thisWeek.map((d) => thisWeekLogs.filter((l) => l.completedDate === d.key).length);
    const lastCounts = thisWeek.map((_, idx) => lastWeekLogs.filter((l) => l.completedDate === lastWeek[idx].key).length);
    charts.compare = window.ChartUtil.barChart($("#insights-compare-chart"), {
      labels: compareLabels,
      datasets: [
        { label: "Last week", data: lastCounts, color: "#cbd5e1" },
        { label: "This week", data: thisCounts, color: "#f59e0b" },
      ],
    });
    if (categoryData.length) {
      charts.category = window.ChartUtil.pieChart($("#insights-category-chart"), {
        labels: categoryData.map((d) => d.name),
        data: categoryData.map((d) => d.value),
      });
    } else {
      $("#insights-category-chart").innerHTML = `<div class="text-sm text-muted py-10 text-center">No completions yet this week.</div>`;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  async function load() {
    const start = lastWeek[0].key;
    const end = thisWeek[6].key;
    const [habitsRes, logsRes] = await Promise.all([window.api.get("/habits"), window.api.get("/logs/range", { params: { start, end } })]);
    habits = habitsRes.data;
    logs = logsRes.data;

    const cached = localStorage.getItem(reportCacheKey(thisWeek[0].key));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        report = parsed.content;
        reportGeneratedAt = new Date(parsed.generatedAt);
        renderReport();
      } catch {}
    } else {
      generateReport();
    }
  }

  $("#insights-regenerate-btn").addEventListener("click", generateReport);
  $("#insights-generate-btn").addEventListener("click", generateReport);
  document.addEventListener("themechange", () => renderAll());

  await load();
  $("#insights-loading").classList.add("hidden");
  $("#insights-content").classList.remove("hidden");
  renderAll();
});
