// Wires up the Sidebar partial: active-link highlighting (replaces
// react-router's <NavLink> isActive), the settings modal (replaces
// the useState-driven modal in Sidebar.jsx), and logout.
document.addEventListener("DOMContentLoaded", () => {
  // Active link highlighting
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const isActive = link.getAttribute("data-nav-link") === window.location.pathname;
    if (isActive) {
      link.classList.add(
        "bg-gradient-to-r",
        "from-brand-500/15",
        "to-brand-500/5",
        "text-brand-700",
        "dark:text-brand-300",
        "ring-1",
        "ring-brand-500/20"
      );
      link.classList.remove("text-soft", "text-faint");
    }
  });

  document.getElementById("sidebar-logout-btn")?.addEventListener("click", () => window.AuthGuard.logout());

  const settingsBtn = document.getElementById("sidebar-settings-btn");
  const nameInput = document.getElementById("settings-name");
  const morningInput = document.getElementById("settings-morning");
  const saveBtn = document.getElementById("settings-save-btn");

  settingsBtn?.addEventListener("click", () => {
    const user = window.AuthGuard.getStoredUser();
    nameInput.value = user?.name || "";
    morningInput.checked = !!user?.morningMotivation;
    window.ModalUtil.open("settings");
  });

  saveBtn?.addEventListener("click", async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    try {
      const res = await window.api.put("/auth/profile", {
        name: nameInput.value,
        morningMotivation: morningInput.checked,
      });
      window.AuthGuard.updateUser(res.data.user);
      document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = res.data.user.name || ""));
      window.ModalUtil.close("settings");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  });
});
