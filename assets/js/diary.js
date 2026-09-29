(() => {
  const search = document.getElementById('diary-search');
  if (!search) return;
  const entries = [...document.querySelectorAll('.diary-entry')];
  const buttons = [...document.querySelectorAll('[data-topic]')];
  const params = new URLSearchParams(location.search);
  let topic = buttons.some(button => button.dataset.topic === params.get('topic')) ? params.get('topic') : 'all';
  search.value = params.get('search') || '';
  function filter() {
    const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    entries.forEach(entry => {
      const text = entry.dataset.search.toLocaleLowerCase();
      const matches = (topic === 'all' || entry.dataset.category === topic) && words.every(word => text.includes(word));
      entry.hidden = !matches;
      if (matches) count++;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic === topic)));
    document.getElementById('diary-count').textContent = `${count} ${count === 1 ? 'entry' : 'entries'} shown`;
    document.getElementById('diary-empty').hidden = count !== 0;
  }
  buttons.forEach(button => button.addEventListener('click', () => { topic = button.dataset.topic; filter(); }));
  search.addEventListener('input', filter);
  document.getElementById('diary-reset').addEventListener('click', () => { search.value = ''; topic = 'all'; filter(); search.focus(); });
  document.querySelector('.diary-tools').hidden = false;
  filter();
})();
