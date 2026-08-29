// Replaces components/AIChat.jsx
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("ai-chat-toggle");
  if (!toggleBtn) return; // not present on this page

  const toggleIcon = document.getElementById("ai-chat-toggle-icon");
  const panel = document.getElementById("ai-chat-panel");
  const messagesEl = document.getElementById("ai-chat-messages");
  const form = document.getElementById("ai-chat-form");
  const input = document.getElementById("ai-chat-input");

  const SAMPLES = [
    "Which day of the week am I most consistent?",
    "What is my best performing category?",
    "Why do I keep failing my exercise habit?",
  ];

  let messages = [{ role: "assistant", content: "Hi — ask me anything about your habit data. Try one of the examples below." }];
  let loading = false;
  let open = false;

  function renderMessages() {
    messagesEl.innerHTML = "";
    messages.forEach((m) => {
      const row = document.createElement("div");
      row.className = `flex ${m.role === "user" ? "justify-end" : "justify-start"}`;
      const bubble = document.createElement("div");
      bubble.className =
        m.role === "user"
          ? "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-br-md shadow-md shadow-brand-500/30"
          : "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed glass rounded-bl-md";
      if (m.role === "user") {
        bubble.textContent = m.content;
      } else {
        window.renderMarkdown(bubble, m.content);
      }
      row.appendChild(bubble);
      messagesEl.appendChild(row);
    });

    if (loading) {
      const row = document.createElement("div");
      row.className = "flex justify-start";
      row.innerHTML = `<div class="glass rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm text-soft flex items-center gap-2"><i data-lucide="refresh-cw" class="w-3 h-3 animate-spin"></i> Thinking...</div>`;
      messagesEl.appendChild(row);
    }

    if (messages.length === 1) {
      const box = document.createElement("div");
      box.className = "pt-2 space-y-1.5";
      SAMPLES.forEach((s) => {
        const btn = document.createElement("button");
        btn.className = "block w-full text-left text-xs rounded-lg glass hover:bg-[var(--surface-hover)] px-3 py-2 text-soft";
        btn.textContent = s;
        btn.addEventListener("click", () => send(s));
        box.appendChild(btn);
      });
      messagesEl.appendChild(box);
    }

    if (window.lucide) window.lucide.createIcons();
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function send(text) {
    const q = (text ?? input.value).trim();
    if (!q || loading) return;
    input.value = "";
    messages = [...messages, { role: "user", content: q }];
    loading = true;
    renderMessages();
    try {
      const res = await window.api.post("/ai/chat", { question: q });
      messages = [...messages, { role: "assistant", content: res.data.content }];
    } catch {
      messages = [...messages, { role: "assistant", content: "Sorry, I couldn't answer that right now." }];
    } finally {
      loading = false;
      renderMessages();
    }
  }

  toggleBtn.addEventListener("click", () => {
    open = !open;
    panel.classList.toggle("hidden", !open);
    toggleIcon.setAttribute("data-lucide", open ? "x" : "message-circle");
    if (window.lucide) window.lucide.createIcons();
    if (open) renderMessages();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send();
  });

  renderMessages();
});
