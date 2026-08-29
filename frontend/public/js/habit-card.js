// Replaces components/TodayHabitCard.jsx. Renders one habit row and
// wires up its toggle button + "..." options menu (edit/archive/delete).
// The dropdown menu is appended to <body> (data-portal), same trick
// the original used with createPortal so it isn't clipped by any
// overflow:hidden ancestor.
function renderHabitCard(habit, { completed, streak, onToggle, onEdit, onArchive, onDelete }) {
  const el = document.createElement("div");
  el.className = `card p-4 flex items-center gap-4 transition ${
    completed ? "ring-1 ring-brand-500/10 bg-brand-500/5 dark:bg-brand-500/3" : ""
  }`;
  el.innerHTML = `
    <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style="background:${habit.color}26; color:${habit.color}">
      ${habit.icon}
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <div class="font-medium truncate">${habit.name}</div>
        <span class="chip">${habit.category}</span>
      </div>
      ${habit.description ? `<div class="text-sm text-muted truncate mt-0.5">${habit.description}</div>` : ""}
    </div>
    <div class="hidden sm:flex items-center gap-1 text-sm text-soft">
      <i data-lucide="flame" class="w-4 h-4 ${streak > 0 ? "text-orange-500" : "text-faint"}"></i>
      <span class="font-medium">${streak}</span>
    </div>
    <div class="relative">
      <button class="btn-ghost p-2 habit-menu-trigger" aria-label="Habit options">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="3" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="13" cy="8" r="1.5" />
        </svg>
      </button>
    </div>
    <button class="habit-toggle-btn shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition ${
      completed
        ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/40 animate-pop"
        : "bg-brand-100 border-2 border-border-brand-400 text-brand-400 hover:border-brand-400 hover:text-brand-400"
    }" aria-label="${completed ? "Mark incomplete" : "Mark complete"}">
      <i data-lucide="check" class="w-5 h-5" style="stroke-width:3"></i>
    </button>
  `;

  el.querySelector(".habit-toggle-btn").addEventListener("click", onToggle);

  const trigger = el.querySelector(".habit-menu-trigger");
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    openHabitMenu(trigger, habit, { onEdit, onArchive, onDelete });
  });

  return el;
}

function openHabitMenu(trigger, habit, { onEdit, onArchive, onDelete }) {
  document.querySelectorAll(".habit-menu-portal").forEach((n) => n.remove());

  const rect = trigger.getBoundingClientRect();
  const menuWidth = 160;
  const menuHeight = 132;
  const flipUp = rect.bottom + menuHeight + 8 > window.innerHeight;

  const backdrop = document.createElement("div");
  backdrop.className = "habit-menu-portal fixed inset-0 z-[100]";
  const menu = document.createElement("div");
  menu.className = "habit-menu-portal fixed z-[110] glass-strong rounded-xl py-1 w-40 shadow-xl animate-fade-in";
  menu.style.top = (flipUp ? rect.top - menuHeight - 4 : rect.bottom + 4) + "px";
  menu.style.left = rect.right - menuWidth + "px";
  menu.innerHTML = `
    <button data-action="edit" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-soft hover:bg-[var(--surface-hover)]">
      <i data-lucide="pencil" class="w-[14px] h-[14px]"></i> Edit
    </button>
    <button data-action="archive" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-soft hover:bg-[var(--surface-hover)]">
      <i data-lucide="archive" class="w-[14px] h-[14px]"></i> ${habit.isArchived ? "Unarchive" : "Archive"}
    </button>
    <button data-action="delete" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10">
      <i data-lucide="trash-2" class="w-[14px] h-[14px]"></i> Delete
    </button>
  `;

  const close = () => document.querySelectorAll(".habit-menu-portal").forEach((n) => n.remove());
  backdrop.addEventListener("click", close);
  menu.querySelector('[data-action="edit"]').addEventListener("click", () => {
    close();
    onEdit();
  });
  menu.querySelector('[data-action="archive"]').addEventListener("click", () => {
    close();
    onArchive();
  });
  menu.querySelector('[data-action="delete"]').addEventListener("click", () => {
    close();
    onDelete();
  });

  document.body.appendChild(backdrop);
  document.body.appendChild(menu);
  if (window.lucide) window.lucide.createIcons();

  window.addEventListener("scroll", close, { capture: true, once: true });
  window.addEventListener("resize", close, { once: true });
}

window.renderHabitCard = renderHabitCard;
