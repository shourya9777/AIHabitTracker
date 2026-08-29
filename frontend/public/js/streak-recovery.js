// Replaces components/StreakRecoveryCard.jsx
function renderStreakRecovery(container, habit, onDismiss) {
  container.classList.remove("hidden");
  container.innerHTML = `
    <div class="relative rounded-2xl p-5 glass overflow-hidden animate-slide-up">
      <div class="absolute inset-0 pointer-events-none opacity-60" style="background: radial-gradient(circle at 0% 0%, rgba(244,114,182,0.22), transparent 55%), radial-gradient(circle at 100% 100%, rgba(239,68,68,0.15), transparent 55%);"></div>
      <button data-dismiss class="absolute top-3 right-3 text-soft hover:text-[var(--text)] z-10" aria-label="Dismiss">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
      <div class="flex items-start gap-3 pr-6 relative">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30">
          <i data-lucide="heart" class="w-[18px] h-[18px]"></i>
        </div>
        <div class="flex-1">
          <div class="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-300">
            Streak paused · ${habit.name}
          </div>
          <div class="mt-1 text-sm text-soft">
            You had a great run. Broken streaks are part of the journey — let's get back on track.
          </div>
          <div data-recovery-body>
            <button data-generate class="mt-3 btn-primary">Get back on track</button>
          </div>
        </div>
      </div>
    </div>`;
  if (window.lucide) window.lucide.createIcons();

  container.querySelector("[data-dismiss]").addEventListener("click", () => {
    container.classList.add("hidden");
    onDismiss();
  });

  container.querySelector("[data-generate]").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="refresh-cw" class="w-[14px] h-[14px] animate-spin"></i> Building your plan...`;
    if (window.lucide) window.lucide.createIcons();
    try {
      const res = await window.api.post("/ai/recovery-plan", { habitId: habit._id });
      const body = container.querySelector("[data-recovery-body]");
      body.innerHTML = `<div class="mt-3 glass rounded-xl p-4 text-sm" data-recovery-md></div>`;
      window.renderMarkdown(body.querySelector("[data-recovery-md]"), res.data.content);
    } finally {
      btn.disabled = false;
    }
  });
}

window.renderStreakRecovery = renderStreakRecovery;
