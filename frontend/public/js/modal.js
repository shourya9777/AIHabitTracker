// Replaces components/Modal.jsx. Every modal in the views is a
// <div data-modal="name" class="modal-overlay hidden"> ... </div>.
// This wires up: backdrop click to close, Escape to close, and
// body scroll lock while any modal is open — same behaviour as the
// original React <Modal>.
const ModalUtil = (() => {
  function allModals() {
    return document.querySelectorAll("[data-modal]");
  }

  function anyOpen() {
    return Array.from(allModals()).some((m) => !m.classList.contains("hidden"));
  }

  function open(name) {
    const el = document.querySelector(`[data-modal="${name}"]`);
    if (!el) return;
    el.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    if (window.lucide) window.lucide.createIcons();
  }

  function close(name) {
    const el = document.querySelector(`[data-modal="${name}"]`);
    if (!el) return;
    el.classList.add("hidden");
    if (!anyOpen()) document.body.style.overflow = "";
  }

  function closeAll() {
    allModals().forEach((m) => m.classList.add("hidden"));
    document.body.style.overflow = "";
  }

  document.addEventListener("DOMContentLoaded", () => {
    allModals().forEach((el) => {
      const name = el.getAttribute("data-modal");
      el.addEventListener("click", (e) => {
        if (e.target === el) close(name);
      });
      el.querySelectorAll("[data-modal-close]").forEach((btn) => {
        btn.addEventListener("click", () => close(name));
      });
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });
  });

  return { open, close, closeAll };
})();

window.ModalUtil = ModalUtil;
