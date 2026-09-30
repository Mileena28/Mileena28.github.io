(() => {
  function revealPlace() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const place = document.getElementById(id);
    if (!place || !place.classList.contains('place-card')) return;
    const details = place.querySelector('details');
    if (details) details.open = true;
    requestAnimationFrame(() => place.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  window.addEventListener('hashchange', revealPlace);
  revealPlace();
})();
