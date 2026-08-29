// Replaces components/SummaryCards.jsx
function renderSummaryCards(container, { totalHabits, activeStreaks, bestStreak, weekRate }) {
  const cards = [
    { icon: "list-checks", label: "Total habits", value: totalHabits, bg: "rgba(99,102,241,0.15)", fg: "#6366f1" },
    { icon: "flame", label: "Active streaks", value: activeStreaks, bg: "rgba(249,115,22,0.15)", fg: "#f97316" },
    { icon: "trophy", label: "Best streak", value: bestStreak, bg: "rgba(245,158,11,0.15)", fg: "#f59e0b" },
    { icon: "trending-up", label: "This week", value: `${weekRate}%`, bg: "rgba(16,185,129,0.15)", fg: "#10b981" },
  ];
  container.innerHTML = `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      ${cards
        .map(
          (c) => `
        <div class="card p-4 flex items-center gap-3 overflow-hidden relative">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:${c.bg}; color:${c.fg}">
            <i data-lucide="${c.icon}" class="w-[18px] h-[18px]"></i>
          </div>
          <div>
            <div class="text-xs font-medium text-muted">${c.label}</div>
            <div class="text-xl font-semibold">${c.value}</div>
          </div>
        </div>`
        )
        .join("")}
    </div>`;
  if (window.lucide) window.lucide.createIcons();
}

window.renderSummaryCards = renderSummaryCards;
