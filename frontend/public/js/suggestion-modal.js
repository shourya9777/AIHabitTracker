// Replaces components/HabitSuggestionModal.jsx
const SuggestionModalUtil = (() => {
  let onAccept = null;

  function showStep(n) {
    document.querySelectorAll("[data-suggest-step]").forEach((el) => {
      el.classList.toggle("hidden", el.getAttribute("data-suggest-step") !== String(n));
    });
  }

  function reset() {
    showStep(0);
    document.getElementById("suggest-goals").value = "";
    document.getElementById("suggest-time").value = "";
    document.getElementById("suggest-struggles").value = "";
    document.getElementById("suggest-results").innerHTML = "";
  }

  function renderResults(suggestions) {
    const box = document.getElementById("suggest-results");
    if (!suggestions.length) {
      box.innerHTML = `<div class="text-sm text-muted">No suggestions returned. Try again.</div>`;
      return;
    }
    box.innerHTML = suggestions
      .map(
        (s, i) => `
      <div class="glass rounded-xl p-4">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span class="text-xl">${s.icon || "✨"}</span>
          <div class="font-medium">${s.name}</div>
          <span class="chip">${s.category}</span>
          <span class="chip">${s.frequency}</span>
        </div>
        <div class="text-sm text-soft">${s.description || ""}</div>
        ${s.reason ? `<div class="text-xs text-brand-700 dark:text-brand-300 mt-2 bg-brand-500/10 rounded-lg px-2 py-1.5">Why: ${s.reason}</div>` : ""}
        <div class="mt-3 flex justify-end" data-suggest-action="${i}">
          <button class="btn-primary" data-suggest-accept="${i}">Add this habit</button>
        </div>
      </div>`
      )
      .join("");

    box.querySelectorAll("[data-suggest-accept]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const idx = Number(btn.getAttribute("data-suggest-accept"));
        btn.disabled = true;
        btn.textContent = "Adding...";
        await onAccept(suggestions[idx]);
        const action = box.querySelector(`[data-suggest-action="${idx}"]`);
        action.innerHTML = `<div class="text-sm text-emerald-500 flex items-center gap-1"><i data-lucide="check" class="w-[14px] h-[14px]"></i>Added</div>`;
        if (window.lucide) window.lucide.createIcons();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const modal = document.querySelector('[data-modal="suggest-habit"]');
    if (!modal) return;

    document.querySelectorAll("[data-suggest-next]").forEach((btn) => {
      btn.addEventListener("click", () => showStep(Number(btn.getAttribute("data-suggest-next"))));
    });
    document.querySelectorAll("[data-suggest-back]").forEach((btn) => {
      btn.addEventListener("click", () => showStep(Number(btn.getAttribute("data-suggest-back"))));
    });
    document.querySelectorAll("[data-suggest-cancel], #suggest-close-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.ModalUtil.close("suggest-habit");
        reset();
      });
    });

    document.getElementById("suggest-submit-btn").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="refresh-cw" class="w-[14px] h-[14px] animate-spin"></i> Thinking...`;
      if (window.lucide) window.lucide.createIcons();
      try {
        const res = await window.api.post("/ai/suggest-habits", {
          goals: document.getElementById("suggest-goals").value,
          productiveTime: document.getElementById("suggest-time").value,
          struggles: document.getElementById("suggest-struggles").value,
        });
        renderResults(res.data.suggestions || []);
        showStep(3);
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="sparkles" class="w-[14px] h-[14px]"></i> Get suggestions`;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  });

  function open(acceptCallback) {
    onAccept = acceptCallback;
    reset();
    window.ModalUtil.open("suggest-habit");
  }

  return { open };
})();

window.SuggestionModalUtil = SuggestionModalUtil;
