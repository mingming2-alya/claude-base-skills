/* deck-architect v4.7 Style Motion Kit: workday (Crisp Snap)
 * Primitives: [data-ruler-progress], [data-bento-expand]
 */
(function () {
  const deck = window.__deck;
  const isReduced = () => (deck && typeof deck.isReducedMotion === 'function' ? deck.isReducedMotion() : (deck && typeof deck.isStatic === 'function' ? deck.isStatic() : false));
  const enterTimers = new Set();
  function clearEnterTimers() {
    enterTimers.forEach(clearTimeout);
    enterTimers.clear();
  }

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
    const targetEl = root.querySelector('.rp-target');
    if (targetEl) {
      targetEl.style.setProperty('--rp-target', Math.max(0, Math.min(100, (goalVal / maxVal) * 100)) + '%');
      targetEl.setAttribute('data-target-label', targetLabel);
    }

    let rafId = 0;
    let playRaf1 = 0;
    let playRaf2 = 0;
    let hitTimer = 0;
    let curVal = 0;

    function cancelAll() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      if (playRaf1) { cancelAnimationFrame(playRaf1); playRaf1 = 0; }
      if (playRaf2) { cancelAnimationFrame(playRaf2); playRaf2 = 0; }
      if (hitTimer) { clearTimeout(hitTimer); hitTimer = 0; }
      if (valEl) valEl.classList.remove('is-hit');
    }

    function setFill(v) {
      const frac = Math.max(0, Math.min(1, v / maxVal));
      root.style.setProperty('--rp-scale', frac.toFixed(4));
      root.style.setProperty('--rp-pct', (frac * 100).toFixed(2) + '%');
    }

    function setImmediate(v) {
      cancelAll();
      curVal = v;
      setFill(v);
      if (valEl) valEl.textContent = (Number.isInteger(v) ? v : v.toFixed(1)) + unit;
      root.classList.toggle('is-passed', v >= goalVal);
    }

    function animateTo(nextVal) {
      if (isReduced()) { setImmediate(nextVal); return; }
      cancelAll();
      const start = curVal;
      const diff = nextVal - start;
      const dur = 760;
      const t0 = performance.now();
      setFill(nextVal);
      function step(now) {
        if (isReduced()) { setImmediate(nextVal); return; }
        const p = Math.min(1, (now - t0) / dur);
        // Asymmetric ease-out crisp snap
        const e = 1 - Math.pow(1 - p, 3.4);
        curVal = start + diff * e;
        if (valEl) valEl.textContent = Math.round(curVal) + unit;
        if (p < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          rafId = 0;
          curVal = nextVal;
          if (valEl) {
            valEl.textContent = (Number.isInteger(nextVal) ? nextVal : nextVal.toFixed(1)) + unit;
            valEl.classList.add('is-hit');
            hitTimer = setTimeout(() => { hitTimer = 0; valEl.classList.remove('is-hit'); }, 260);
          }
          root.classList.toggle('is-passed', nextVal >= goalVal);
        }
      }
      rafId = requestAnimationFrame(step);
    }

    function play() {
      if (isReduced()) { setImmediate(targetVal); return; }
      setImmediate(0);
      playRaf1 = requestAnimationFrame(() => {
        playRaf1 = 0;
        playRaf2 = requestAnimationFrame(() => {
          playRaf2 = 0;
          animateTo(targetVal);
        });
      });
    }

    root.addEventListener('click', e => e.stopPropagation());
    setImmediate(targetVal);
    const api = { play, animateTo, setImmediate, stop: () => setImmediate(targetVal) };
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

  function settleAll(closeBentos) {
    clearEnterTimers();
    rulers.forEach(r => r.stop());
    if (closeBentos) bentos.forEach(b => b.closeAll());
  }

  function stepOf(el, sl) {
    const h = el.closest('[data-step], [data-step-only]');
    return h && sl && sl.contains(h) ? (parseInt(h.dataset.step || h.dataset.stepOnly || '0', 10) || 0) : 0;
  }

  if (deck && deck.stage) {
    deck.stage.addEventListener('deck:slideenter', ({ detail }) => {
      clearEnterTimers();
      const sl = detail.slide;
      if (!sl) return;
      const curStep = detail.step || 0;
      if (detail.restAtFinal || detail.reducedMotion || detail.staticMode || isReduced()) {
        sl.querySelectorAll('[data-ruler-progress]').forEach(el => el._rpInit && el._rpInit.stop());
        return;
      }
      const run = () => {
        if (deck.slides[deck.index] !== sl || isReduced()) return;
        sl.querySelectorAll('[data-ruler-progress]').forEach(el => {
          if (el._rpInit && stepOf(el, sl) <= curStep) el._rpInit.play();
        });
      };
      const delay = detail.enterDelay || 0;
      if (delay > 0) {
        const id = setTimeout(() => { enterTimers.delete(id); run(); }, delay);
        enterTimers.add(id);
      } else {
        run();
      }
    });
    deck.stage.addEventListener('deck:stepchange', ({ detail }) => {
      const sl = detail.slide;
      if (!sl || detail.step <= 0) return;
      if (detail.dir < 0 || isReduced()) {
        sl.querySelectorAll('[data-ruler-progress]').forEach(el => el._rpInit && el._rpInit.stop());
        return;
      }
      sl.querySelectorAll('[data-ruler-progress]').forEach(el => {
        if (el._rpInit && stepOf(el, sl) === detail.step) el._rpInit.play();
      });
    });
    deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
      clearEnterTimers();
      const sl = detail.slide;
      if (!sl) return;
      sl.querySelectorAll('[data-ruler-progress]').forEach(el => el._rpInit && el._rpInit.stop());
      sl.querySelectorAll('[data-bento-expand]').forEach(el => el._beInit && el._beInit.closeAll());
    });
    deck.stage.addEventListener('deck:still', ({ detail }) => {
      if (detail.still) settleAll(true);
    });
    deck.stage.addEventListener('deck:lowpower', ({ detail }) => {
      if (detail.lowPower) settleAll(false);
    });
    deck.stage.addEventListener('deck:reducedmotion', ({ detail }) => {
      if (detail.reduced) settleAll(false);
    });
  }
  window.__motionKits = window.__motionKits || {};
  window.__motionKits.workday = { initRuler, initBento, rulers, bentos };
})();
