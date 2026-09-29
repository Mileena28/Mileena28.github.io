(() => {
  const form = document.getElementById('directory-controls');
  const grid = document.getElementById('character-grid');
  if (!form || !grid) return;
  const cards = [...grid.querySelectorAll('.directory-card')];
  const search = document.getElementById('character-search');
  const book = document.getElementById('character-book');
  const story = document.getElementById('character-story');
  const sort = document.getElementById('character-sort');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '');
  function update() {
    const isHistories = book.value === 'The Lost Histories';
    document.getElementById('story-filter').hidden = !isHistories;
    if (!isHistories) story.value = '';
    const query = normalize(search.value.trim());
    const ordered = sort.value === 'name' ? [...cards].sort((a,b) => a.dataset.name.localeCompare(b.dataset.name)) : cards;
    let count = 0;
    ordered.forEach(card => {
      const matches = normalize(card.dataset.name).includes(query) && (!book.value || card.dataset.book === book.value) && (!story.value || card.dataset.story === story.value);
      card.hidden = !matches;
      if (!matches) card.querySelector('details').open = false;
      if (matches) count++;
      grid.appendChild(card);
    });
    document.getElementById('character-count').textContent = `${count} of ${cards.length} characters${book.value ? ' · ' + book.value : ''}${story.value ? ' · ' + story.value : ''}`;
    document.getElementById('character-empty').hidden = count !== 0;
  }
  form.hidden = false;
  form.addEventListener('submit', event => event.preventDefault());
  search.addEventListener('input', update);
  [book,story,sort].forEach(control => control.addEventListener('change',update));
  form.addEventListener('reset', () => { setTimeout(update,0); });
  document.getElementById('clear-empty').addEventListener('click', () => { form.reset(); search.focus(); });
  update();
})();
