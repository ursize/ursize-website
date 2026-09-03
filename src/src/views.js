export function init_views() {
  const el = document.getElementById('view-count');
  if (!el) return;

  const tick = (from, to, ms) => {
    const start = performance.now();
    const step = () => {
      const p = Math.min((performance.now() - start) / ms, 1);
      const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      el.textContent = v.toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  fetch('/api/views')
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      if (!d) return;
      tick(0, d.views, 1200);
    })
    .catch(() => {});
}
