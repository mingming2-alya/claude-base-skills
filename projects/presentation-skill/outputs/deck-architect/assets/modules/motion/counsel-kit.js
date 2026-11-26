/* deck-architect v4.7 Style Motion Kit: counsel (Editorial Weight)
 * Primitives: [data-rank-race], [data-odometer], [data-rack-focus]
 */
(function () {
  const deck = window.__deck;
  const isStatic = () => (deck && typeof deck.isStatic === 'function' ? deck.isStatic() : false);

  /* ---- 1. Rolling Odometer ---- */
  function initOdometer(el) {
    if (el._odoInit) return el._odoInit;
    const initialText = (el.dataset.value || el.textContent || '0').trim();
    const digits = '0123456789';

    function render(text, animate) {
      const str = String(text);
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
          // Double cycle 0..9 + 0..9 for richer physical roll
          for (let k = 0; k < 20; k++) {
            const s = document.createElement('span');
            s.textContent = String(k % 10);
            strip.appendChild(s);
          }
          box.appendChild(strip);
          el.appendChild(box);
          const d = parseInt(ch, 10);
          strips.push({ strip, targetIdx: animate ? (10 + d) : d, delay: i * 65 });
        } else {
          const st = document.createElement('span');
          st.className = 'odo-static';
          st.setAttribute('aria-hidden', 'true');
          st.textContent = ch;
          el.appendChild(st);
        }
      }
      if (!animate || isStatic()) {
        strips.forEach(({ strip, targetIdx }) => {
          strip.style.transition = 'none';
          strip.style.transform = `translateY(-${targetIdx * 1.05}em)`;
        });
      } else {
        strips.forEach(({ strip, targetIdx, delay }) => {
          strip.style.transition = 'none';
          strip.style.transform = 'translateY(0)';
          strip.getBoundingClientRect();
          strip.style.transition = `transform ${820 + delay}ms cubic-bezier(0.16, 1.04, 0.28, 1) ${delay}ms`;
          strip.style.transform = `translateY(-${targetIdx * 1.05}em)`;
        });
      }
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

    function setStage(stageKey, animate) {
      const firstRects = new Map();
      if (animate && !isStatic()) {
        items.forEach(it => firstRects.set(it, it.getBoundingClientRect()));
      }
      const scored = items.map(it => {
        const v = parseFloat(it.dataset[stageKey] ?? it.dataset.after ?? it.dataset.before ?? '0');
        return { it, v };
      });
      scored.sort((a, b) => b.v - a.v);
      scored.forEach(({ it, v }, idx) => {
        root.appendChild(it);
        it.classList.toggle('is-leader', idx === 0);
        const pos = it.querySelector('.rr-pos');
        if (pos) pos.textContent = '#' + (idx + 1);
        const sc = it.querySelector('.rr-score');
        if (sc) sc.textContent = (Number.isInteger(v) ? v : v.toFixed(1)) + unit;
        const bar = it.querySelector('.rr-bar');
        if (bar) bar.style.setProperty('--rr-w', Math.max(6, Math.min(100, (v / maxScore) * 100)).toFixed(1) + '%');
      });

      if (animate && !isStatic()) {
        scored.forEach(({ it }, idx) => {
          const prev = firstRects.get(it);
          const next = it.getBoundingClientRect();
          if (!prev) return;
          const dy = prev.top - next.top;
          if (Math.abs(dy) > 1) {
            it.style.transition = 'none';
            it.style.transform = `translateY(${dy}px)`;
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
      show: (stageKey) => { clearTimeout(timer); setStage(stageKey, true); },
      stop: () => { clearTimeout(timer); setStage('after', false); },
      play: () => {
        clearTimeout(timer);
        if (isStatic()) { setStage('after', false); return; }
        setStage('before', false);
        timer = setTimeout(() => setStage('after', true), 420);
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
      const sl = detail.slide;
      if (!sl) return;
      const curStep = detail.step || 0;
      sl.querySelectorAll('[data-odometer]').forEach(el => { if (el._odoInit && stepOf(el, sl) <= curStep) el._odoInit.play(); });
      sl.querySelectorAll('[data-rank-race]').forEach(el => { if (el._rrInit && stepOf(el, sl) <= curStep) el._rrInit.play(); });
    });
    deck.stage.addEventListener('deck:stepchange', ({ detail }) => {
      const sl = detail.slide;
      if (!sl || detail.step <= 0) return;
      sl.querySelectorAll('[data-odometer]').forEach(el => { if (el._odoInit && stepOf(el, sl) === detail.step) el._odoInit.play(); });
      sl.querySelectorAll('[data-rank-race]').forEach(el => { if (el._rrInit && stepOf(el, sl) === detail.step) el._rrInit.play(); });
    });
    deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
      const sl = detail.slide;
      if (!sl) return;
      sl.querySelectorAll('[data-rank-race]').forEach(el => el._rrInit && el._rrInit.stop());
    });
    deck.stage.addEventListener('deck:still', ({ detail }) => { if (detail.still) settleAll(); });
    deck.stage.addEventListener('deck:lowpower', ({ detail }) => { if (detail.lowPower) settleAll(); });
  }
  window.__motionKits = window.__motionKits || {};
  window.__motionKits.counsel = { initOdometer, initRankRace, initRackFocus, odos, races, racks };
})();
