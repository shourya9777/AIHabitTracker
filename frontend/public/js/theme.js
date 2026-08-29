// Replaces context/ThemeContext.jsx. The initial class is already set
// by the inline script in <head> (to avoid a flash of wrong theme);
// this just wires up toggle buttons and keeps localStorage in sync.
function getTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function setTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
  document.querySelectorAll("[data-theme-icon]").forEach((el) => {
    el.setAttribute("data-lucide", theme === "dark" ? "sun" : "moon");
  });
  document.querySelectorAll("[data-theme-label]").forEach((el) => {
    el.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  });
  if (window.lucide) window.lucide.createIcons();
  document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
}

function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

document.addEventListener("DOMContentLoaded", () => {
  setTheme(getTheme()); // sync icon on load
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", toggleTheme);
  });
});

window.themeUtil = { getTheme, setTheme, toggleTheme };
