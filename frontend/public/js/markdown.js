// Replaces components/Markdown.jsx (react-markdown + custom component
// renderers). Uses the `marked` CDN library to turn markdown into
// HTML, then applies the same Tailwind classes the React version put
// on each element via its `components` map.
const CLASS_MAP = {
  p: "mb-2 last:mb-0 leading-relaxed",
  strong: "font-semibold",
  em: "italic",
  ul: "list-disc pl-5 my-2 space-y-1",
  ol: "list-decimal pl-5 my-2 space-y-1",
  li: "leading-relaxed",
  h1: "font-semibold text-base mt-3 mb-1",
  h2: "font-semibold text-base mt-3 mb-1",
  h3: "font-semibold text-base mt-3 mb-1",
  blockquote: "border-l-2 border-brand-500/40 pl-3 my-2 italic text-soft",
  hr: "my-3 divider",
  a: "text-brand-700 dark:text-brand-300 underline underline-offset-2",
};

function renderMarkdown(container, markdownText) {
  const html = window.marked.parse(markdownText || "");
  container.innerHTML = html;

  Object.entries(CLASS_MAP).forEach(([tag, cls]) => {
    container.querySelectorAll(tag).forEach((el) => {
      cls.split(" ").forEach((c) => el.classList.add(c));
    });
  });

  // h1/h2 are downgraded to look like h3, matching the original
  container.querySelectorAll("h1, h2").forEach((el) => {
    const h3 = document.createElement("h3");
    h3.className = el.className;
    h3.innerHTML = el.innerHTML;
    el.replaceWith(h3);
  });

  container.querySelectorAll("code").forEach((code) => {
    const inline = code.parentElement.tagName !== "PRE";
    code.classList.add("text-[0.85em]", "font-mono");
    if (inline) {
      code.classList.add("px-1.5", "py-0.5", "rounded");
    } else {
      code.classList.add("block", "rounded-lg", "p-3", "overflow-x-auto");
    }
    code.style.background = "var(--chip-bg)";
  });

  container.querySelectorAll("a").forEach((a) => {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noreferrer");
  });
}

window.renderMarkdown = renderMarkdown;
