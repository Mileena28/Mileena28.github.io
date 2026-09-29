// Keep the complete totals in the HTML, including when motion or JavaScript is off.
(() => {
  const section = document.querySelector('.books-milestones');
  if (!section || !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    section.querySelectorAll('.books-counter-value').forEach((counter) => {
      const total = Number(counter.dataset.count);
      // Animate a visual copy so assistive technology always reads the final total.
      const visual = document.createElement('span');
      visual.setAttribute('aria-hidden', 'true');
      counter.style.position = 'absolute';
      counter.style.width = '1px';
      counter.style.height = '1px';
      counter.style.overflow = 'hidden';
      counter.style.clipPath = 'inset(50%)';
      counter.after(visual);
      const started = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - started) / 850, 1);
        visual.textContent = Math.round(total * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, {threshold: 0.15});
  observer.observe(section);
})();
