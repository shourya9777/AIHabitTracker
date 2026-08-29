// Replaces components/AIWeeklyReport.jsx
function initAIWeeklyReport(container) {
  let content = "";
  let generatedAt = null;

  container.innerHTML = `
    <div class="card p-5 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none opacity-40" style="background: radial-gradient(circle at 0% 0%, rgba(99,102,241,0.25), transparent 60%);"></div>
      <button id="ai-report-toggle" class="w-full flex items-center gap-3 text-left relative">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
          <i data-lucide="sparkles" class="w-[18px] h-[18px]"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium">AI Weekly Report</div>
          <div class="text-xs text-muted" id="ai-report-subtitle">See patterns and personalised encouragement from the past 7 days</div>
        </div>
        <i data-lucide="chevron-down" id="ai-report-chevron" class="text-faint transition w-[18px] h-[18px]"></i>
      </button>
      <div id="ai-report-panel" class="mt-4 animate-slide-up relative hidden">
        <button id="ai-report-generate" class="btn-primary">
          <i data-lucide="sparkles" class="w-[14px] h-[14px]"></i>
          Generate weekly report
        </button>
        <div id="ai-report-content" class="hidden">
          <div class="mt-1 glass rounded-xl p-4 text-sm" id="ai-report-md"></div>
          <div class="mt-3 flex justify-end">
            <button id="ai-report-regenerate" class="btn-ghost">
              <i data-lucide="refresh-cw" class="w-[14px] h-[14px]"></i>
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>`;
  if (window.lucide) window.lucide.createIcons();

  const panel = container.querySelector("#ai-report-panel");
  const chevron = container.querySelector("#ai-report-chevron");

  container.querySelector("#ai-report-toggle").addEventListener("click", () => {
    panel.classList.toggle("hidden");
    chevron.classList.toggle("rotate-180");
  });

  async function generate(btn) {
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="refresh-cw" class="w-[14px] h-[14px] animate-spin"></i> Analysing your week...`;
    if (window.lucide) window.lucide.createIcons();
    try {
      const res = await window.api.post("/ai/weekly-report");
      content = res.data.content;
      generatedAt = new Date();
      container.querySelector("#ai-report-subtitle").textContent = `Generated ${generatedAt.toLocaleTimeString()}`;
      container.querySelector("#ai-report-generate").classList.add("hidden");
      container.querySelector("#ai-report-content").classList.remove("hidden");
      window.renderMarkdown(container.querySelector("#ai-report-md"), content);
      panel.classList.remove("hidden");
    } catch {
      content = "Failed to generate report. Please try again.";
      window.renderMarkdown(container.querySelector("#ai-report-md"), content);
      container.querySelector("#ai-report-generate").classList.add("hidden");
      container.querySelector("#ai-report-content").classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  container.querySelector("#ai-report-generate").addEventListener("click", (e) => generate(e.currentTarget));
  container.querySelector("#ai-report-regenerate").addEventListener("click", (e) => generate(e.currentTarget));
}

window.initAIWeeklyReport = initAIWeeklyReport;
