/* deck-architect v4.7 Style Motion Kit: counsel (Editorial Weight)
 * Primitives: [data-rank-race], [data-odometer], [data-rack-focus]
 */
(function () {
  const deck = window.__deck;
  const isReduced = () => (deck && typeof deck.isReducedMotion === 'function' ? deck.isReducedMotion() : (deck && typeof deck.isStatic === 'function' ? deck.isStatic() : false));
  const getScale = () => (deck && typeof deck.stageScale === 'function' ? deck.stageScale() : 1) || 1;
  const enterTimers = new Set();
  function clearEnterTimers() {
    enterTimers.forEach(clearTimeout);
    enterTimers.clear();
  }

  /* ---- 1. Rolling Odometer ---- */
  function initOdometer(el) {
    if (el._odoInit) return el._odoInit;
    const initialText = (el.dataset.value || el.textContent || '0').trim();
    el.dataset.odoRaw = initialText;
    const digits = '0123456789';
    let settleTimer = 0;

    function renderStatic(str) {
      clearTimeout(settleTimer);
      settleTimer = 0;
      el.innerHTML = '';
      el.setAttribute('aria-label', str);
      const fin = document.createElement('span');
      fin.className = 'odo-final';
      fin.textContent = str;
      el.appendChild(fin);
    }

    function render(text, animate) {
      const str = String(text);
      el.dataset.odoRaw = str;
      clearTimeout(settleTimer);
      settleTimer = 0;
      if (!animate || isReduced()) {
        renderStatic(str);
        return;
      }
      el.innerHTML = '';
      el.setAttribute('aria-label', str);
      const strips = [];
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (digits.includes(ch)) {
          const box = document.createElement('span');
          box.className = 'odo-digit';
          box.setAttribute('aria-hidden', 'true');
          const strip = document.createElement('span');
          strip.className = 'odo-strip';
          for (let k = 0; k < 20; k++) {
            const s = document.createElement('span');
            s.textContent = String(k % 10);
            strip.appendChild(s);
          }
          box.appendChild(strip);
          el.appendChild(box);
          const d = parseInt(ch, 10);
          strips.push({ strip, targetIdx: 10 + d, delay: i * 110 });
        } else {
          const st = document.createElement('span');
          st.className = 'odo-static';
          st.setAttribute('aria-hidden', 'true');
          st.textContent = ch;
          el.appendChild(st);
        }
      }
      strips.forEach(({ strip, targetIdx, delay }) => {
        strip.style.transition = 'none';
        strip.style.transform = 'translateY(0)';
        strip.getBoundingClientRect();
        strip.style.transition = `transform ${960 + delay}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`;
        strip.style.transform = `translateY(-${targetIdx * 1.05}em)`;
      });
      const maxDelay = strips.length ? strips[strips.length - 1].delay : 0;
      // Total finish time for last digit = duration (960 + maxDelay) + delay (maxDelay) + safety buffer
      settleTimer = setTimeout(() => renderStatic(str), 960 + 2 * maxDelay + 90);
    }

    render(initialText, false);
    const api = {
      play: (val) => render(val !== undefined ? val : (el.dataset.value || initialText), true),
      set: (val) => render(val !== undefined ? val : (el.dataset.value || initialText), false),
    };
    el._odoInit = api;
    return api;
  }

  /* ---- 2. FLIP Rank Race ---- */
  function initRankRace(root) {
    if (root._rrInit) return root._rrInit;
    root.classList.add('live-ctrl');
    const items = [...root.querySelectorAll('[data-rank-item]')];
    const maxScore = parseFloat(root.dataset.max || '100');
    const unit = root.dataset.unit || '';
    const itemParent = items.length ? items[0].parentNode : root;
    const anchor = document.createComment('rr-anchor');
    if (items.length && itemParent) itemParent.insertBefore(anchor, items[0]);

    function setStage(stageKey, animate) {
      const firstRects = new Map();
      if (animate && !isReduced()) {
        items.forEach(it => firstRects.set(it, it.getBoundingClientRect()));
      }
      const scored = items.map(it => {
        const v = parseFloat(it.dataset[stageKey] ?? it.dataset.after ?? it.dataset.before ?? '0');
        return { it, v };
      });
      scored.sort((a, b) => b.v - a.v);
      let insertAfter = anchor;
      scored.forEach(({ it, v }, idx) => {
        if (itemParent && insertAfter && insertAfter.parentNode === itemParent) {
          itemParent.insertBefore(it, insertAfter.nextSibling);
          insertAfter = it;
        } else {
          root.appendChild(it);
        }
        it.classList.toggle('is-leader', idx === 0);
        const pos = it.querySelector('.rr-pos');
        if (pos) pos.textContent = '#' + (idx + 1);
        const sc = it.querySelector('.rr-score');
        if (sc) sc.textContent = (Number.isInteger(v) ? v : v.toFixed(1)) + unit;
        const bar = it.querySelector('.rr-bar');
        if (bar) {
          const frac = Math.max(0.06, Math.min(1, v / maxScore));
          bar.style.setProperty('--rr-scale', frac.toFixed(4));
          bar.style.setProperty('--rr-w', (frac * 100).toFixed(1) + '%');
        }
      });

      if (animate && !isReduced()) {
        const scale = getScale();
        scored.forEach(({ it }, idx) => {
          const prev = firstRects.get(it);
          const next = it.getBoundingClientRect();
          if (!prev) return;
          const dy = (prev.top - next.top) / scale;
          if (Math.abs(dy) > 1) {
            it.style.transition = 'none';
            it.style.transform = `translateY(${dy.toFixed(1)}px)`;
            it.getBoundingClientRect();
            it.style.transition = `transform 680ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 45}ms`;
            it.style.transform = 'translateY(0)';
          }
        });
      }
      root.dataset.currentStage = stageKey;
    }

    let timer = 0;
    setStage('after', false);
    const api = {
      show: (stageKey) => { clearTimeout(timer); timer = 0; setStage(stageKey, true); },
      stop: () => { clearTimeout(timer); timer = 0; setStage('after', false); },
      play: () => {
        clearTimeout(timer);
        timer = 0;
        if (isReduced()) { setStage('after', false); return; }
        setStage('before', false);
        timer = setTimeout(() => { timer = 0; setStage('after', true); }, 420);
      }
    };
    root._rrInit = api;
    return api;
  }

  /* ---- 3. Rack Focus ---- */
  function initRackFocus(root) {
    if (root._rfInit) return root._rfInit;
    root.classList.add('live-ctrl');
    const items = [...root.querySelectorAll('[data-rf-item]')];
    function focus(idx) {
      if (idx < 0 || idx >= items.length) {
        items.forEach(it => it.classList.remove('is-focused'));
        root.classList.remove('has-focus');
        return;
      }
      const target = items[idx];
      const already = target.classList.contains('is-focused');
      items.forEach(it => it.classList.remove('is-focused'));
      if (already) {
        root.classList.remove('has-focus');
      } else {
        target.classList.add('is-focused');
        root.classList.add('has-focus');
      }
    }
    items.forEach((it, idx) => {
      it.setAttribute('tabindex', '0');
      it.addEventListener('click', e => { e.stopPropagation(); focus(idx); });
      it.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); focus(idx); }
      });
    });
    const api = { focus, clear: () => focus(-1) };
    root._rfInit = api;
    return api;
  }

  const odos = [...document.querySelectorAll('[data-odometer]')].map(initOdometer);
  const races = [...document.querySelectorAll('[data-rank-race]')].map(initRankRace);
  const racks = [...document.querySelectorAll('[data-rack-focus]')].map(initRackFocus);

  function settleAll() {
    clearEnterTimers();
    odos.forEach(o => o.set());
    races.forEach(r => r.stop());
    racks.forEach(r => r.clear());
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
        sl.querySelectorAll('[data-odometer]').forEach(el => el._odoInit && el._odoInit.set());
        sl.querySelectorAll('[data-rank-race]').forEach(el => el._rrInit && el._rrInit.stop());
        return;
      }
      const run = () => {
        if (deck.slides[deck.index] !== sl || isReduced()) return;
        sl.querySelectorAll('[data-odometer]').forEach(el => { if (el._odoInit && stepOf(el, sl) <= curStep) el._odoInit.play(); });
        sl.querySelectorAll('[data-rank-race]').forEach(el => { if (el._rrInit && stepOf(el, sl) <= curStep) el._rrInit.play(); });
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
      clearEnterTimers();
      const sl = detail.slide;
      if (!sl || detail.step <= 0) return;
      if (detail.dir < 0 || isReduced()) {
        sl.querySelectorAll('[data-odometer]').forEach(el => el._odoInit && el._odoInit.set());
        sl.querySelectorAll('[data-rank-race]').forEach(el => el._rrInit && el._rrInit.stop());
        return;
      }
      const targetStep = detail.step;
      const runStep = () => {
        if (deck.slides[deck.index] !== sl || deck.stepIndex !== targetStep || isReduced()) return;
        sl.querySelectorAll('[data-odometer]').forEach(el => { if (el._odoInit && stepOf(el, sl) === targetStep) el._odoInit.play(); });
        sl.querySelectorAll('[data-rank-race]').forEach(el => { if (el._rrInit && stepOf(el, sl) === targetStep) el._rrInit.play(); });
      };
      const delay = detail.revealDelay || 0;
      if (delay > 0) {
        const id = setTimeout(() => { enterTimers.delete(id); runStep(); }, delay);
        enterTimers.add(id);
      } else {
        runStep();
      }
    });
    deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
      clearEnterTimers();
      const sl = detail.slide;
      if (!sl) return;
      sl.querySelectorAll('[data-odometer]').forEach(el => el._odoInit && el._odoInit.set());
      sl.querySelectorAll('[data-rank-race]').forEach(el => el._rrInit && el._rrInit.stop());
      sl.querySelectorAll('[data-rack-focus]').forEach(el => el._rfInit && el._rfInit.clear());
    });
    deck.stage.addEventListener('deck:still', ({ detail }) => { if (detail.still) settleAll(); });
    deck.stage.addEventListener('deck:lowpower', ({ detail }) => { if (detail.lowPower) settleAll(); });
    deck.stage.addEventListener('deck:reducedmotion', ({ detail }) => { if (detail.reduced) settleAll(); });
  }
  window.__motionKits = window.__motionKits || {};
  window.__motionKits.counsel = { initOdometer, initRankRace, initRackFocus, odos, races, racks };
})();
