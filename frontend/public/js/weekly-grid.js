// Replaces components/WeeklyGrid.jsx
function renderWeeklyGrid(container, habits, logsByHabit, customDays) {
  const days = customDays || window.DateHelpers.weekKeys();
  const todayKey = window.DateHelpers.todayKey();

  if (!habits.length) {
    container.innerHTML = `<div class="card p-6 text-center text-muted text-sm">Create a habit to see your weekly grid.</div>`;
    return;
  }

  const headerCells = days
    .map(
      (d) => `
    <div class="text-center text-xs font-medium ${d.key === todayKey ? "text-brand-600 dark:text-brand-300" : "text-muted"}">
      <div>${d.label}</div>
      <div class="text-faint">${d.short}</div>
    </div>`
    )
    .join("");

  const rows = habits
    .map((h) => {
      const done = new Set(logsByHabit[h._id] || []);
      const cells = days
        .map((d) => {
          const isDone = done.has(d.key);
          const style = isDone ? `background:${h.color}; box-shadow:0 4px 12px ${h.color}55` : `background:var(--chip-bg)`;
          return `
        <div class="flex items-center justify-center">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center transition ${isDone ? "text-white shadow-md" : "text-faint"}" style="${style}">
            ${isDone ? '<i data-lucide="check" class="w-[14px] h-[14px]" style="stroke-width:3"></i>' : ""}
          </div>
        </div>`;
        })
        .join("");
      return `
      <div class="grid grid-cols-[180px_repeat(7,minmax(0,1fr))] gap-2 items-center py-2 border-t divider">
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0" style="background:${h.color}26; color:${h.color}">${h.icon}</span>
          <span class="text-sm truncate">${h.name}</span>
        </div>
        ${cells}
      </div>`;
    })
    .join("");

  container.innerHTML = `
    <div class="card p-5 overflow-x-auto">
      <div class="min-w-[520px]">
        <div class="grid grid-cols-[180px_repeat(7,minmax(0,1fr))] gap-2 items-center mb-2">
          <div class="text-xs font-medium text-muted uppercase tracking-wider">Habit</div>
          ${headerCells}
        </div>
        ${rows}
      </div>
    </div>`;

  if (window.lucide) window.lucide.createIcons();
}

window.renderWeeklyGrid = renderWeeklyGrid;
