// Replaces pages/Weekly.jsx
document.addEventListener("DOMContentLoaded", async () => {
  const user = await window.AuthGuard.require();
  if (!user) return;

  const $ = (sel) => document.querySelector(sel);
  let cursor = new Date();

  function isCurrentWeek() {
    const days = window.DateHelpers.weekKeysFor(cursor);
    const todayDays = window.DateHelpers.weekKeys();
    return days[0].key === todayDays[0].key;
  }

  function fmtRange(days) {
    const opts1 = { month: "short", day: "numeric" };
    const opts2 = { month: "short", day: "numeric", year: "numeric" };
    return `${days[0].date.toLocaleDateString(undefined, opts1)} — ${days[6].date.toLocaleDateString(undefined, opts2)}`;
  }

  async function load() {
    $("#weekly-loading").classList.remove("hidden");
    $("#weekly-body").classList.add("hidden");

    const days = window.DateHelpers.weekKeysFor(cursor);
    $("#weekly-range-label").textContent = fmtRange(days);
    $("#weekly-today-btn").classList.toggle("hidden", isCurrentWeek());
    $("#weekly-next-btn").disabled = isCurrentWeek();

    const start = days[0].key;
    const end = days[days.length - 1].key;
    const [habitsRes, rangeRes] = await Promise.all([
      window.api.get("/habits"),
      window.api.get("/logs/range", { params: { start, end } }),
    ]);
    const habits = habitsRes.data;
    const logs = rangeRes.data;

    const logsByHabit = {};
    for (const l of logs) {
      if (!logsByHabit[l.habitId]) logsByHabit[l.habitId] = [];
      logsByHabit[l.habitId].push(l.completedDate);
    }

    const totalSlots = habits.length * 7;
    const totalDone = logs.length;
    const weekRate = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;

    const dayTotals = days.map((d) => ({ ...d, count: logs.filter((l) => l.completedDate === d.key).length }));
    const bestDay = [...dayTotals].sort((a, b) => b.count - a.count)[0];

    const perHabitDone = habits
      .map((h) => ({ h, count: (logsByHabit[h._id] || []).length }))
      .sort((a, b) => b.count - a.count);
    const topHabit = perHabitDone[0];

    $("#weekly-rate").textContent = `${weekRate}%`;
    $("#weekly-rate-sub").textContent = `${totalDone} of ${totalSlots}`;
    $("#weekly-total-done").textContent = totalDone;
    $("#weekly-best-day").textContent = bestDay?.count ? bestDay.label : "—";
    $("#weekly-best-day-sub").textContent = bestDay?.count ? `${bestDay.count} habits done` : "no data";

    if (topHabit?.count) {
      $("#weekly-top-habit").innerHTML = `<span class="mr-1">${topHabit.h.icon}</span><span class="text-base font-medium align-middle">${topHabit.h.name}</span>`;
      $("#weekly-top-habit-sub").textContent = `${topHabit.count}/7 days`;
    } else {
      $("#weekly-top-habit").textContent = "—";
      $("#weekly-top-habit-sub").textContent = "no data";
    }

    if (habits.length === 0) {
      $("#weekly-empty").classList.remove("hidden");
      $("#weekly-grid").innerHTML = "";
    } else {
      $("#weekly-empty").classList.add("hidden");
      window.renderWeeklyGrid($("#weekly-grid"), habits, logsByHabit, days);
    }

    $("#weekly-loading").classList.add("hidden");
    $("#weekly-body").classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  $("#weekly-prev-btn").addEventListener("click", () => {
    cursor = window.DateHelpers.addDays(cursor, -7);
    load();
  });
  $("#weekly-next-btn").addEventListener("click", () => {
    if (isCurrentWeek()) return;
    cursor = window.DateHelpers.addDays(cursor, 7);
    load();
  });
  $("#weekly-today-btn").addEventListener("click", () => {
    cursor = new Date();
    load();
  });

  load();
});
