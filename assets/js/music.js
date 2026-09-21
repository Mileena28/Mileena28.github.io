/* Players remain accessible without JavaScript; enhancement shows one at a time. */
document.querySelectorAll('[data-player]').forEach((player) => {
  const controls = player.querySelector('.player-switch');
  if (!controls) return;
  const frames = [...player.querySelectorAll('iframe')];
  controls.hidden = false;
  frames.forEach((frame) => { frame.hidden = frame.dataset.service !== 'spotify'; });
  controls.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-platform]');
    if (!button || button.getAttribute('aria-pressed') === 'true') return;
    controls.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    frames.forEach((frame) => {
      const active = frame.dataset.service === button.dataset.platform;
      // Reload the outgoing frame to stop its audio before hiding it.
      if (!frame.hidden && !active) frame.src = frame.src;
      frame.hidden = !active;
    });
  });
});
document.querySelectorAll('[data-music-platform]').forEach((link) => {
  link.addEventListener('click', () => {
    if (typeof window.gtag === 'function') window.gtag('event', 'music_stream_click', {
      platform: link.dataset.musicPlatform,
      album: link.closest('.album-section')?.querySelector('h2')?.textContent || 'artist profile'
    });
  });
});
