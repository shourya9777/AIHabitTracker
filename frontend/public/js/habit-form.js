// Replaces components/HabitForm.jsx. Exposes HabitFormUtil.open(habit)
// to populate + show the modal, and lets the page wire up onSubmit.
const HabitFormUtil = (() => {
  let editingId = null;
  let onSave = null;

  function populatePickers() {
    const catSel = document.getElementById("habit-category");
    catSel.innerHTML = window.CATEGORIES.map((c) => `<option>${c}</option>`).join("");

    const iconPicker = document.getElementById("habit-icon-picker");
    iconPicker.innerHTML = window.ICONS.map(
      (i) => `<button type="button" data-icon="${i}" class="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition glass hover:bg-[var(--surface-hover)]">${i}</button>`
    ).join("");

    const colorPicker = document.getElementById("habit-color-picker");
    colorPicker.innerHTML = window.COLORS.map(
      (c) => `<button type="button" data-color="${c}" class="w-8 h-8 rounded-full transition" style="background:${c}" aria-label="Select color ${c}"></button>`
    ).join("");
  }

  function selectIcon(icon) {
    document.querySelectorAll("#habit-icon-picker [data-icon]").forEach((btn) => {
      const active = btn.getAttribute("data-icon") === icon;
      btn.classList.toggle("ring-2", active);
      btn.classList.toggle("ring-brand-500", active);
      btn.classList.toggle("bg-brand-500/15", active);
    });
    document.getElementById("habit-icon-picker").dataset.selected = icon;
  }

  function selectColor(color) {
    document.querySelectorAll("#habit-color-picker [data-color]").forEach((btn) => {
      const active = btn.getAttribute("data-color") === color;
      btn.classList.toggle("ring-4", active);
      btn.classList.toggle("ring-offset-2", active);
      btn.classList.toggle("ring-[var(--surface-ring)]", active);
    });
    document.getElementById("habit-color-picker").dataset.selected = color;
  }

  // habit = null for "new", or a habit object for "edit"
  function open(habit, saveCallback) {
    editingId = habit ? habit._id : null;
    onSave = saveCallback;

    document.getElementById("habit-form-title").textContent = habit ? "Edit habit" : "New habit";
    document.getElementById("habit-form-submit").textContent = habit ? "Save changes" : "Create habit";
    document.getElementById("habit-name").value = habit?.name || "";
    document.getElementById("habit-description").value = habit?.description || "";
    document.getElementById("habit-category").value = habit?.category || "Health";
    document.getElementById("habit-frequency").value = habit?.frequency || "daily";
    document.getElementById("habit-target").value = habit?.targetDays || 7;
    document.getElementById("habit-target-value").textContent = habit?.targetDays || 7;
    selectIcon(habit?.icon || window.ICONS[0]);
    selectColor(habit?.color || window.COLORS[0]);

    window.ModalUtil.open("habit-form");
  }

  document.addEventListener("DOMContentLoaded", () => {
    populatePickers();

    document.getElementById("habit-icon-picker").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-icon]");
      if (btn) selectIcon(btn.getAttribute("data-icon"));
    });
    document.getElementById("habit-color-picker").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-color]");
      if (btn) selectColor(btn.getAttribute("data-color"));
    });
    document.getElementById("habit-target").addEventListener("input", (e) => {
      document.getElementById("habit-target-value").textContent = e.target.value;
    });

    document.getElementById("habit-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("habit-name").value.trim();
      if (!name) return;

      const submitBtn = document.getElementById("habit-form-submit");
      const data = {
        name,
        description: document.getElementById("habit-description").value,
        category: document.getElementById("habit-category").value,
        frequency: document.getElementById("habit-frequency").value,
        targetDays: Number(document.getElementById("habit-target").value),
        icon: document.getElementById("habit-icon-picker").dataset.selected,
        color: document.getElementById("habit-color-picker").dataset.selected,
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";
      try {
        await onSave(data, editingId);
        window.ModalUtil.close("habit-form");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingId ? "Save changes" : "Create habit";
      }
    });
  });

  return { open };
})();

window.HabitFormUtil = HabitFormUtil;
