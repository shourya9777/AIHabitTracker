// Replaces the recharts-based chart components (WeeklyBarChart,
// MonthlyBarChart, CategoryPieChart, and the two inline BarChart /
// PieChart blocks in Insights.jsx) with Chart.js, loaded via CDN in
// partials/head.ejs. Charts are theme-aware and rebuild themselves on
// the "themechange" event (dispatched by theme.js) so switching
// dark/light updates axis + tooltip colors, same as the React
// version reading useTheme().
const ChartUtil = (() => {
  const PIE_COLORS = ["#f59e0b", "#fb923c", "#ef4444", "#ec4899", "#8b5cf6", "#6366f1", "#0ea5e9", "#10b981", "#14b8a6"];

  function themeColors() {
    const isDark = window.themeUtil.getTheme() === "dark";
    return {
      isDark,
      grid: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,15,27,0.08)",
      tick: isDark ? "#8a8aa0" : "#6b6b78",
      tooltipBg: isDark ? "rgba(20,20,36,0.95)" : "rgba(255,255,255,0.95)",
      tooltipBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,15,27,0.08)",
      tooltipText: isDark ? "#ebebf5" : "#13131b",
    };
  }

  // Returns a controller object: { canvas, destroy() }. The caller
  // keeps a registry and calls rebuild() on themechange.
  function barChart(container, { labels, datasets, gradientColors = ["#fcd34d", "#d97706"] }) {
    const c = themeColors();
    container.innerHTML = `<div style="height:240px"><canvas></canvas></div>`;
    const canvas = container.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 0, 220);
    grad.addColorStop(0, gradientColors[0]);
    grad.addColorStop(1, gradientColors[1]);

    const chartDatasets = datasets.map((ds) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color || grad,
      borderRadius: 6,
      maxBarThickness: 34,
    }));

    return new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: chartDatasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: datasets.length > 1, labels: { color: c.tick, font: { size: 12 }, usePointStyle: true } },
          tooltip: {
            backgroundColor: c.tooltipBg,
            borderColor: c.tooltipBorder,
            borderWidth: 1,
            titleColor: c.tooltipText,
            bodyColor: c.tooltipText,
            padding: 8,
            cornerRadius: 10,
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: c.tick, font: { size: 12 } } },
          y: { grid: { color: c.grid }, ticks: { color: c.tick, font: { size: 12 }, precision: 0 } },
        },
      },
    });
  }

  function pieChart(container, { labels, data }) {
    const c = themeColors();
    container.innerHTML = `<div style="height:240px"><canvas></canvas></div>`;
    const canvas = container.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    return new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: labels.map((_, i) => PIE_COLORS[i % PIE_COLORS.length]),
            borderColor: c.isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "55%",
        plugins: {
          legend: { position: "bottom", labels: { color: c.tick, font: { size: 12 }, usePointStyle: true } },
          tooltip: {
            backgroundColor: c.tooltipBg,
            borderColor: c.tooltipBorder,
            borderWidth: 1,
            titleColor: c.tooltipText,
            bodyColor: c.tooltipText,
            padding: 8,
            cornerRadius: 10,
          },
        },
      },
    });
  }

  return { barChart, pieChart };
})();

window.ChartUtil = ChartUtil;
