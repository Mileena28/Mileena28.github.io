/* Native details and anchors work without JavaScript. Deep links also open entries. */
(() => {
  function revealEntry() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const entry = document.getElementById(id);
    if (!entry || !entry.classList.contains('chronicle-entry')) return;
    const details = entry.querySelector('details');
    if (details) details.open = true;
    requestAnimationFrame(() => entry.scrollIntoView({ block: 'start' }));
  }
  addEventListener('hashchange', revealEntry);
  revealEntry();
})();
