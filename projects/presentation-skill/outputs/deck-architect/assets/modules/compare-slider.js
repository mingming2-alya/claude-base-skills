/* deck-architect v4.5 On-Demand Module: compare-slider
 * Pointer & keyboard draggable Before/After comparison ([data-compare-slider]).
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const instances = [];

  document.querySelectorAll('[data-compare-slider]').forEach(root => {
    root.classList.add('live-ctrl');
    const initPct = Math.max(5, Math.min(95, parseFloat(root.dataset.initial || '50') || 50));
    let pct = initPct;

    const beforeEl = root.querySelector('[data-cs-before]');
    const afterEl = root.querySelector('[data-cs-after]');
    if (!beforeEl || !afterEl) return;

    if (afterEl.dataset.label && !root.querySelector('.cs-badge-after')) {
      const b = document.createElement('span');
      b.className = 'cs-badge cs-badge-after';
      b.textContent = afterEl.dataset.label;
      root.appendChild(b);
    }
    if (beforeEl.dataset.label && !root.querySelector('.cs-badge-before')) {
      const b = document.createElement('span');
      b.className = 'cs-badge cs-badge-before';
      b.textContent = beforeEl.dataset.label;
      root.appendChild(b);
    }

    const divider = document.createElement('div');
    divider.className = 'cs-divider';
    const knob = document.createElement('button');
    knob.type = 'button';
    knob.className = 'cs-knob';
    knob.setAttribute('role', 'slider');
    knob.setAttribute('aria-label', '拖曳調整前後對比位置');
    knob.setAttribute('aria-valuemin', '5');
    knob.setAttribute('aria-valuemax', '95');
    knob.textContent = '‹›';
    divider.appendChild(knob);
    root.appendChild(divider);

    function setPos(v) {
      pct = Math.max(5, Math.min(95, Number(v)));
      root.style.setProperty('--cs-pos', pct.toFixed(2) + '%');
      root.dataset.pos = String(Math.round(pct));
      knob.setAttribute('aria-valuenow', String(Math.round(pct)));
    }

    function updateFromClientX(clientX) {
      const r = root.getBoundingClientRect();
      if (!r.width) return;
      setPos(((clientX - r.left) / r.width) * 100);
    }

    let dragging = false;
    root.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (deck.isStatic()) return;
      dragging = true;
      root.setPointerCapture(e.pointerId);
      updateFromClientX(e.clientX);
    });
    root.addEventListener('pointermove', e => {
      if (!dragging) return;
      e.stopPropagation();
      updateFromClientX(e.clientX);
    });
    const endDrag = e => {
      if (!dragging) return;
      dragging = false;
      try { root.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);
    root.addEventListener('click', e => e.stopPropagation());

    knob.addEventListener('keydown', e => {
      if (deck.isStatic()) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); setPos(pct - 5); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); setPos(pct + 5); }
    });

    setPos(initPct);
    const api = { root, setPos, reset: () => setPos(initPct), get pos() { return pct; } };
    root._compareSlider = api;
    instances.push(api);
  });

  deck.stage.addEventListener('deck:still', ({ detail }) => {
    if (detail.still) instances.forEach(i => i.reset());
  });
  deck.stage.addEventListener('deck:lowpower', ({ detail }) => {
    if (detail.lowPower) instances.forEach(i => i.reset());
  });
})();
