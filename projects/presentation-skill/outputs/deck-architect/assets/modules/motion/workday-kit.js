/* deck-architect v4.7 Style Motion Kit: workday (Crisp Snap)
 * Primitives: [data-ruler-progress], [data-bento-expand]
 */
(function () {
  const deck = window.__deck;
  const isStatic = () => (deck && typeof deck.isStatic === 'function' ? deck.isStatic() : false);

  function initRuler(root) {
    if (root._rpInit) return root._rpInit;
    root.classList.add('live-ctrl');
    const targetVal = parseFloat(root.dataset.value || '78');
    const maxVal = parseFloat(root.dataset.max || '100');
    const goalVal = parseFloat(root.dataset.target || '80');
    const unit = root.dataset.unit || '%';
    const label = root.dataset.label || '進度';
    const targetLabel = root.dataset.targetLabel || ('目標 ' + goalVal + unit);

    if (!root.querySelector('.rp-track')) {
      root.innerHTML =
        '<div class="rp-head"><span class="rp-label"></span><span class="rp-val">0' + unit + '</span></div>' +
        '<div class="rp-track"><div class="rp-fill"></div><div class="rp-ticks"></div>' +
        '<div class="rp-target"></div></div>';
      root.querySelector('.rp-label').textContent = label;
    }
    const valEl = root.querySelector('.rp-val');
    const fillEl = root.querySelector('.rp-fill');
    const targetEl = root.querySelector('.rp-target');
    if (targetEl) {
      targetEl.style.setProperty('--rp-target', Math.max(0, Math.min(100, (goalVal / maxVal) * 100)) + '%');
      targetEl.setAttribute('data-target-label', targetLabel);
    }

    let rafId = 0;
    let curVal = 0;

    function setImmediate(v) {
      cancelAnimationFrame(rafId);
      curVal = v;
      const pct = Math.max(0, Math.min(100, (v / maxVal) * 100));
      root.style.setProperty('--rp-pct', pct.toFixed(2) + '%');
      if (valEl) valEl.textContent = (Number.isInteger(v) ? v : v.toFixed(1)) + unit;
      root.classList.toggle('is-passed', v >= goalVal);
    }

    function animateTo(nextVal) {
      if (isStatic()) { setImmediate(nextVal); return; }
      cancelAnimationFrame(rafId);
      const start = curVal;
      const diff = nextVal - start;
      const dur = 760;
      const t0 = performance.now();
      const pct = Math.max(0, Math.min(100, (nextVal / maxVal) * 100));
      root.style.setProperty('--rp-pct', pct.toFixed(2) + '%');
      function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        // Asymmetric ease-out crisp snap
        const e = 1 - Math.pow(1 - p, 3.4);
        curVal = start + diff * e;
        if (valEl) valEl.textContent = Math.round(curVal) + unit;
        if (p < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          curVal = nextVal;
          if (valEl) {
            valEl.textContent = (Number.isInteger(nextVal) ? nextVal : nextVal.toFixed(1)) + unit;
            valEl.classList.add('is-hit');
            setTimeout(() => valEl.classList.remove('is-hit'), 260);
          }
          root.classList.toggle('is-passed', nextVal >= goalVal);
        }
      }
      rafId = requestAnimationFrame(step);
    }

    function play() {
      if (isStatic()) { setImmediate(targetVal); return; }
      setImmediate(0);
      requestAnimationFrame(() => requestAnimationFrame(() => animateTo(targetVal)));
    }

    root.addEventListener('click', e => e.stopPropagation());
    setImmediate(targetVal);
    const api = { play, animateTo, setImmediate, stop: () => { cancelAnimationFrame(rafId); setImmediate(targetVal); } };
    root._rpInit = api;
    return api;
  }

  function initBento(root) {
    if (root._beInit) return root._beInit;
    root.classList.add('live-ctrl');
    const items = [...root.querySelectorAll('[data-bento-item]')];
    function toggle(target) {
      const wasOpen = target.classList.contains('is-open');
      items.forEach(it => it.classList.remove('is-open'));
      if (!wasOpen) {
        target.classList.add('is-open');
        root.classList.add('has-open');
      } else {
        root.classList.remove('has-open');
      }
    }
    items.forEach(it => {
      it.setAttribute('tabindex', '0');
      it.addEventListener('click', e => { e.stopPropagation(); toggle(it); });
      it.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggle(it); }
      });
    });
    const api = {
      openIndex: idx => { if (items[idx]) toggle(items[idx]); },
      closeAll: () => { items.forEach(it => it.classList.remove('is-open')); root.classList.remove('has-open'); }
    };
    root._beInit = api;
    return api;
  }

  const rulers = [...document.querySelectorAll('[data-ruler-progress]')].map(initRuler);
  const bentos = [...document.querySelectorAll('[data-bento-expand]')].map(initBento);

  if (deck && deck.stage) {
    deck.stage.addEventListener('deck:slideenter', ({ detail }) => {
      const sl = detail.slide;
      if (!sl) return;
      sl.querySelectorAll('[data-ruler-progress]').forEach(el => el._rpInit && el._rpInit.play());
    });
    deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
      const sl = detail.slide;
      if (!sl) return;
      sl.querySelectorAll('[data-ruler-progress]').forEach(el => el._rpInit && el._rpInit.stop());
    });
    deck.stage.addEventListener('deck:still', ({ detail }) => {
      if (detail.still) rulers.forEach(r => r.stop());
    });
    deck.stage.addEventListener('deck:lowpower', ({ detail }) => {
      if (detail.lowPower) rulers.forEach(r => r.stop());
    });
  }
  window.__motionKits = window.__motionKits || {};
  window.__motionKits.workday = { initRuler, initBento, rulers, bentos };
})();
