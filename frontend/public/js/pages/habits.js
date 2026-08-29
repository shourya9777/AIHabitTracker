// Replaces pages/Habits.jsx
document.addEventListener("DOMContentLoaded", async () => {
  const user = await window.AuthGuard.require();
  if (!user) return;

  let habits = [];
  let logsByHabit = {};
  let showArchived = false;
  let query = "";
  let category = "All";
  let deleteTarget = null;

  const $ = (sel) => document.querySelector(sel);

  const catSelect = $("#habits-category-filter");
  window.CATEGORIES.forEach((c) => {
    const opt = document.createElement("option");
    opt.textContent = c;
    catSelect.appendChild(opt);
  });

  async function load() {
    const [habitsRes, rangeRes] = await Promise.all([
      window.api.get("/habits", { params: { includeArchived: "true" } }),
      window.api.get("/logs/range", {
        params: { start: window.DateHelpers.last90Days()[0], end: window.DateHelpers.todayKey() },
      }),
    ]);
    habits = habitsRes.data;
    const byId = {};
    for (const h of habits) byId[h._id] = [];
    for (const l of rangeRes.data) {
      if (!byId[l.habitId]) byId[l.habitId] = [];
      byId[l.habitId].push(l.completedDate);
    }
    for (const k of Object.keys(byId)) byId[k] = byId[k].sort().reverse();
    logsByHabit = byId;
  }

  function filtered() {
    const q = query.trim().toLowerCase();
    return habits.filter((h) => {
      if (!showArchived && h.isArchived) return false;
      if (showArchived && !h.isArchived) return false;
      if (category !== "All" && h.category !== category) return false;
      if (q && !h.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function renderRow(h) {
    const keys = logsByHabit[h._id] || [];
    const { current, longest } = window.DateHelpers.streakFromKeys(keys);
    const el = document.createElement("div");
    el.className = `card p-4 flex items-center gap-4 ${h.isArchived ? "opacity-70" : ""}`;
    el.innerHTML = `
      <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style="background:${h.color}26; color:${h.color}">${h.icon}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <div class="font-medium truncate">${h.name}</div>
          <span class="chip">${h.category}</span>
          <span class="chip">${h.frequency}</span>
          ${h.isArchived ? `<span class="chip bg-amber-500/15 text-amber-700 dark:text-amber-300">Archived</span>` : ""}
        </div>
        ${h.description ? `<div class="text-sm text-muted truncate mt-0.5">${h.description}</div>` : ""}
      </div>
      <div class="hidden sm:flex items-center gap-4 text-sm">
        <div class="flex items-center gap-1" title="Current streak">
          <i data-lucide="flame" class="w-[14px] h-[14px] ${current > 0 ? "text-orange-500" : "text-faint"}"></i>
          <span class="font-medium">${current}</span>
        </div>
        <div class="flex items-center gap-1" title="Longest streak">
          <i data-lucide="trophy" class="w-[14px] h-[14px] text-amber-500"></i>
          <span class="font-medium">${longest}</span>
        </div>
        <div class="text-muted text-xs hidden md:block">${keys.length} total</div>
      </div>
      <div class="flex items-center gap-1">
        <button data-action="edit" class="btn-ghost p-2" title="Edit"><i data-lucide="pencil" class="w-4 h-4"></i></button>
        <button data-action="archive" class="btn-ghost p-2" title="${h.isArchived ? "Unarchive" : "Archive"}">
          <i data-lucide="${h.isArchived ? "archive-restore" : "archive"}" class="w-4 h-4"></i>
        </button>
        <button data-action="delete" class="btn-ghost p-2 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400" title="Delete">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>`;

    el.querySelector('[data-action="edit"]').addEventListener("click", () => window.HabitFormUtil.open(h, saveHabit));
    el.querySelector('[data-action="archive"]').addEventListener("click", () => archiveHabit(h));
    el.querySelector('[data-action="delete"]').addEventListener("click", () => openDelete(h));
    return el;
  }

  function render() {
    const list = filtered();
    const activeCount = habits.filter((h) => !h.isArchived).length;
    const archivedCount = habits.filter((h) => h.isArchived).length;
    $("#habits-active-count").textContent = activeCount;
    $("#habits-archived-count").textContent = archivedCount;

    const container = $("#habits-list");
    container.innerHTML = "";

    if (list.length === 0) {
      $("#habits-empty").classList.remove("hidden");
      $("#habits-empty-icon").textContent = showArchived ? "🗂️" : "🎯";
      $("#habits-empty-title").textContent = showArchived
        ? "Nothing archived"
        : habits.length === 0
        ? "No habits yet"
        : "No habits match your filter";
      $("#habits-empty-desc").textContent = showArchived
        ? "Archived habits keep their history but stay out of your daily list."
        : habits.length === 0
        ? "Start small — something you can do in under 5 minutes."
        : "Try clearing your search or category filter.";
      $("#habits-empty-create-btn").classList.toggle("hidden", showArchived || habits.length !== 0);
    } else {
      $("#habits-empty").classList.add("hidden");
      list.forEach((h) => container.appendChild(renderRow(h)));
    }

    if (window.lucide) window.lucide.createIcons();
  }

  async function saveHabit(data, editingId) {
    if (editingId) {
      const res = await window.api.put(`/habits/${editingId}`, data);
      habits = habits.map((h) => (h._id === res.data._id ? res.data : h));
    } else {
      const res = await window.api.post("/habits", data);
      habits = [...habits, res.data];
      logsByHabit[res.data._id] = [];
    }
    render();
  }

  async function archiveHabit(h) {
    const res = await window.api.put(`/habits/${h._id}/archive`);
    habits = habits.map((x) => (x._id === res.data._id ? res.data : x));
    render();
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
    deleteTarget = null;
    window.ModalUtil.close("delete-habit");
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
    logsByHabit[res.data._id] = [];
    render();
  }

  $("#new-habit-btn").addEventListener("click", () => window.HabitFormUtil.open(null, saveHabit));
  $("#habits-empty-create-btn").addEventListener("click", () => window.HabitFormUtil.open(null, saveHabit));
  $("#suggest-habit-btn").addEventListener("click", () => window.SuggestionModalUtil.open(acceptSuggestion));
  $("#delete-habit-confirm").addEventListener("click", deleteHabit);

  $("#habits-search").addEventListener("input", (e) => {
    query = e.target.value;
    render();
  });
  $("#habits-category-filter").addEventListener("change", (e) => {
    category = e.target.value;
    render();
  });
  $("#habits-tab-active").addEventListener("click", () => {
    showArchived = false;
    updateTabs();
    render();
  });
  $("#habits-tab-archived").addEventListener("click", () => {
    showArchived = true;
    updateTabs();
    render();
  });

  function updateTabs() {
    $("#habits-tab-active").classList.toggle("bg-brand-500/15", !showArchived);
    $("#habits-tab-active").classList.toggle("text-brand-700", !showArchived);
    $("#habits-tab-active").classList.toggle("dark:text-brand-300", !showArchived);
    $("#habits-tab-active").classList.toggle("text-soft", showArchived);

    $("#habits-tab-archived").classList.toggle("bg-brand-500/15", showArchived);
    $("#habits-tab-archived").classList.toggle("text-brand-700", showArchived);
    $("#habits-tab-archived").classList.toggle("dark:text-brand-300", showArchived);
    $("#habits-tab-archived").classList.toggle("text-soft", !showArchived);
  }

  await load();
  $("#habits-loading").classList.add("hidden");
  $("#habits-content").classList.remove("hidden");
  render();
});
