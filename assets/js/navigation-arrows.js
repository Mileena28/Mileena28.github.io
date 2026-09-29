/* Draw navigation arrows consistently, without platform emoji fonts. */
(() => {
  const rotations = { '→':0, '➡':0, '←':180, '⬅':180, '↑':-90, '⬆':-90, '↓':90, '⬇':90, '↗':-45, '↖':-135, '↘':45, '↙':135 };
  const labels = { '→':'Next', '➡':'Next', '←':'Back', '⬅':'Back', '↑':'Back to top', '⬆':'Back to top', '↓':'Continue down', '⬇':'Continue down', '↗':'Open link', '↖':'Open link', '↘':'Open link', '↙':'Open link' };
  function drawArrows() {
    document.querySelectorAll('a, button').forEach(control => {
      if (control.closest('svg')) return;
      const text = control.textContent.trim();
      if (/^[→➡←⬅↑⬆↓⬇↗↖↘↙][\uFE0E\uFE0F]?$/.test(text) && !control.hasAttribute('aria-label')) {
        control.setAttribute('aria-label', labels[text[0]]);
      }
      const walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.parentElement.closest('svg, script, style, .sr-only') && /[→➡←⬅↑⬆↓⬇↗↖↘↙]/.test(node.textContent)) nodes.push(node);
      }
      nodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        const parts = node.textContent.split(/([→➡←⬅↑⬆↓⬇↗↖↘↙][\uFE0E\uFE0F]?)/g);
        parts.forEach(part => {
          if (!(part[0] in rotations)) { fragment.append(document.createTextNode(part)); return; }
          const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
          svg.setAttribute('viewBox','0 0 24 24');
          svg.setAttribute('width','1em');
          svg.setAttribute('height','1em');
          svg.setAttribute('aria-hidden','true');
          svg.setAttribute('focusable','false');
          svg.style.cssText = `display:inline-block;vertical-align:-.12em;flex-shrink:0;overflow:visible;transform:rotate(${rotations[part[0]]}deg)`;
          const path = document.createElementNS(svg.namespaceURI,'path');
          path.setAttribute('d','M4 12h16M14 6l6 6-6 6');
          path.setAttribute('fill','none');
          path.setAttribute('stroke','currentColor');
          path.setAttribute('stroke-width','1.6');
          path.setAttribute('stroke-linecap','round');
          path.setAttribute('stroke-linejoin','round');
          svg.append(path); fragment.append(svg);
        });
        node.replaceWith(fragment);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', drawArrows);
  else drawArrows();
})();
