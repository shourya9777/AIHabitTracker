// Replaces components/MorningMotivation.jsx
function initMorningMotivation(container, user) {
  if (!user?.morningMotivation) return;
  const today = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem("morning-seen") === today) return;

  container.classList.remove("hidden");
  container.innerHTML = `
    <div class="relative rounded-2xl p-5 glass overflow-hidden animate-slide-up">
      <div class="absolute inset-0 pointer-events-none opacity-60" style="background: radial-gradient(circle at 0% 0%, rgba(251,191,36,0.25), transparent 55%), radial-gradient(circle at 100% 100%, rgba(99,102,241,0.18), transparent 55%);"></div>
      <button data-dismiss class="absolute top-3 right-3 text-soft hover:text-[var(--text)] z-10" aria-label="Dismiss">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
      <div class="flex items-start gap-3 pr-6 relative">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 animate-float">
          <i data-lucide="sun" class="w-5 h-5"></i>
        </div>
        <div class="flex-1">
          <div class="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Good morning, ${(user.name || "").split(" ")[0]}
          </div>
          <div class="mt-1 text-sm" data-morning-body>Thinking of something nice to say...</div>
        </div>
      </div>
    </div>`;
  if (window.lucide) window.lucide.createIcons();

  container.querySelector("[data-dismiss]").addEventListener("click", () => container.classList.add("hidden"));

  window.api
    .get("/ai/morning")
    .then((res) => {
      window.renderMarkdown(container.querySelector("[data-morning-body]"), res.data.content);
      localStorage.setItem("morning-seen", today);
    })
    .catch(() => {
      container.classList.add("hidden");
    });
}

window.initMorningMotivation = initMorningMotivation;
