// Replaces pages/Dashboard.jsx. All the useState/useMemo/useEffect
// wiring becomes a handful of plain variables + render functions that
// re-run after each mutation (same net effect: update local state,
// re-render just the affected pieces).
document.addEventListener("DOMContentLoaded", async () => {
  const user = await window.AuthGuard.require();
  if (!user) return;

  let habits = [];
  let todayLogs = [];
  let weekLogs = [];
  let heatmap = [];
  let allLogsByHabit = {};
  let recoveryHabit = null;
  let deleteTarget = null;

  const $ = (sel) => document.querySelector(sel);

  function completedTodaySet() {
    return new Set(todayLogs.map((l) => String(l.habitId)));
  }

  function weekLogsByHabit() {
    const out = {};
    for (const l of weekLogs) {
      if (!out[l.habitId]) out[l.habitId] = [];
      out[l.habitId].push(l.completedDate);
    }
    return out;
  }

  function streaksById() {
    const out = {};
    for (const h of habits) out[h._id] = window.DateHelpers.streakFromKeys(allLogsByHabit[h._id] || []);
    return out;
  }

  async function loadAll() {
    const week = window.DateHelpers.weekKeys();
    const start = week[0].key;
    const end = week[week.length - 1].key;

    const [habitsRes, todayRes, rangeRes, heatRes] = await Promise.all([
      window.api.get("/habits"),
      window.api.get("/logs/today"),
      window.api.get("/logs/range", { params: { start, end } }),
      window.api.get("/logs/heatmap"),
    ]);

    habits = habitsRes.data;
    todayLogs = todayRes.data;
    weekLogs = rangeRes.data;
    heatmap = heatRes.data;

    const byId = {};
    const start90 = new Date();
    start90.setDate(start90.getDate() - 89);
    const s90 = start90.toISOString().slice(0, 10);
    const e90 = new Date().toISOString().slice(0, 10);
    const allRange = await window.api.get("/logs/range", { params: { start: s90, end: e90 } });
    for (const h of habits) byId[h._id] = [];
    for (const l of allRange.data) {
      if (!byId[l.habitId]) byId[l.habitId] = [];
      byId[l.habitId].push(l.completedDate);
    }
    for (const k of Object.keys(byId)) byId[k] = byId[k].sort().reverse();
    allLogsByHabit = byId;
  }

  function render() {
    const completedToday = completedTodaySet();
    const wLogsByHabit = weekLogsByHabit();
    const streaks = streaksById();

    $("#dashboard-greeting").textContent = `Hey ${(user.name || "").split(" ")[0]} 👋`;
    $("#dashboard-date").textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const activeStreaks = Object.values(streaks).filter((s) => s.current > 0).length;
    const bestStreak = Math.max(0, ...Object.values(streaks).map((s) => s.longest));
    const weekTotal = habits.length * 7;
    const weekDone = Object.values(wLogsByHabit).reduce((s, arr) => s + arr.length, 0);
    const weekRate = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;
    window.renderSummaryCards($("#summary-cards"), { totalHabits: habits.length, activeStreaks, bestStreak, weekRate });

    const todayProgress = habits.length ? Math.round((completedToday.size / habits.length) * 100) : 0;
    $("#today-progress-label").textContent = `${completedToday.size} of ${habits.length} complete`;
    $("#today-progress-ring").innerHTML =
      window.progressRingSVG(todayProgress, 52, 5) +
      `<div class="absolute inset-0 flex items-center justify-center text-xs font-semibold">${todayProgress}%</div>`;

    const list = $("#today-habit-list");
    list.innerHTML = "";
    if (!habits.length) {
      $("#today-empty").classList.remove("hidden");
    } else {
      $("#today-empty").classList.add("hidden");
      habits.forEach((h) => {
        const card = window.renderHabitCard(h, {
          completed: completedToday.has(String(h._id)),
          streak: streaks[h._id]?.current || 0,
          onToggle: () => toggle(h),
          onEdit: () => openEdit(h),
          onArchive: () => archiveHabit(h),
          onDelete: () => openDelete(h),
        });
        list.appendChild(card);
      });
    }

    window.renderWeeklyGrid($("#weekly-grid"), habits, wLogsByHabit);
    window.renderHeatmap($("#heatmap-chart"), heatmap);

    if (window.lucide) window.lucide.createIcons();
  }

  function checkRecovery() {
    if (recoveryHabit || !habits.length) return;
    const dismissed = JSON.parse(localStorage.getItem("recovery-dismissed") || "{}");
    const streaks = streaksById();
    for (const h of habits) {
      const s = streaks[h._id];
      if (s && s.longest >= 7 && s.current === 0 && !dismissed[h._id]) {
        recoveryHabit = h;
        window.renderStreakRecovery($("#streak-recovery"), h, () => {
          const d = JSON.parse(localStorage.getItem("recovery-dismissed") || "{}");
          d[h._id] = Date.now();
          localStorage.setItem("recovery-dismissed", JSON.stringify(d));
          recoveryHabit = null;
        });
        return;
      }
    }
  }

  async function toggle(habit) {
    const completedToday = completedTodaySet();
    const done = completedToday.has(String(habit._id));
    const today = window.DateHelpers.todayKey();
    if (done) {
      await window.api.delete("/logs", { data: { habitId: habit._id, date: today } });
      todayLogs = todayLogs.filter((l) => String(l.habitId) !== String(habit._id));
      allLogsByHabit[habit._id] = (allLogsByHabit[habit._id] || []).filter((d) => d !== today);
    } else {
      const res = await window.api.post("/logs", { habitId: habit._id, date: today });
      todayLogs = [...todayLogs, res.data];
      allLogsByHabit[habit._id] = [today, ...(allLogsByHabit[habit._id] || [])];
      window.ConfettiUtil.celebrate();
      setTimeout(() => {
        if (completedTodaySet().size === habits.length && habits.length > 0) window.ConfettiUtil.celebrateBig();
      }, 150);
    }
    render();
  }

  function openNew() {
    window.HabitFormUtil.open(null, saveHabit);
  }

  function openEdit(h) {
    window.HabitFormUtil.open(h, saveHabit);
  }

  async function saveHabit(data, editingId) {
    if (editingId) {
      const res = await window.api.put(`/habits/${editingId}`, data);
      habits = habits.map((h) => (h._id === res.data._id ? res.data : h));
    } else {
      const res = await window.api.post("/habits", data);
      habits = [...habits, res.data];
      allLogsByHabit[res.data._id] = [];
    }
    render();
    checkRecovery();
  }

  function openDelete(h) {
    deleteTarget = h;
    $("#delete-habit-name").textContent = h.name;
    window.ModalUtil.open("delete-habit");
  }

  async function deleteHabit() {
    if (!deleteTarget) return;
    await window.api.delete(`/habits/${deleteTarget._id}`);
    habits = habits.filter((h) => h._id !== deleteTarget._id);
    todayLogs = todayLogs.filter((l) => String(l.habitId) !== String(deleteTarget._id));
    delete allLogsByHabit[deleteTarget._id];
    deleteTarget = null;
    window.ModalUtil.close("delete-habit");
    render();
  }

  async function archiveHabit(habit) {
    const res = await window.api.put(`/habits/${habit._id}/archive`);
    if (res.data.isArchived) habits = habits.filter((h) => h._id !== habit._id);
    else habits = habits.map((h) => (h._id === res.data._id ? res.data : h));
    render();
  }

  async function acceptSuggestion(s) {
    const res = await window.api.post("/habits", {
      name: s.name,
      description: s.description,
      category: s.category,
      frequency: s.frequency,
      icon: s.icon,
      targetDays: s.frequency === "daily" ? 7 : 3,
    });
    habits = [...habits, res.data];
    allLogsByHabit[res.data._id] = [];
    render();
  }

  $("#new-habit-btn").addEventListener("click", openNew);
  $("#today-empty-create-btn").addEventListener("click", openNew);
  $("#suggest-habit-btn").addEventListener("click", () => window.SuggestionModalUtil.open(acceptSuggestion));
  $("#delete-habit-confirm").addEventListener("click", deleteHabit);

  await loadAll();
  $("#dashboard-loading").classList.add("hidden");
  $("#dashboard-content").classList.remove("hidden");
  render();
  window.initAIWeeklyReport($("#ai-weekly-report"));
  window.initMorningMotivation($("#morning-motivation"), user);
  checkRecovery();
});
