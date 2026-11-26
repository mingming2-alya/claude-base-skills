/* deck-architect v4.7 Style Motion Kit: apple (Cinema Spring)
 * Primitives: [data-split-mask], [data-spotlight-sweep], [data-depth-deck], [data-colorize-wipe]
 */
(function () {
  const deck = window.__deck;
  const isStill = () => (deck && typeof deck.isStill === 'function' ? deck.isStill() : (deck && typeof deck.isStatic === 'function' ? deck.isStatic() : false));
  const isReduced = () => (deck && typeof deck.isReducedMotion === 'function' ? deck.isReducedMotion() : isStill());
  const getScale = () => (deck && typeof deck.stageScale === 'function' ? deck.stageScale() : 1) || 1;
  const enterTimers = new Set();
  function clearEnterTimers() {
    enterTimers.forEach(clearTimeout);
    enterTimers.clear();
  }

  /* ---- 1. Split Mask Reveal ---- */
  function initSplitMask(el) {
    if (el._smInit) return el._smInit;
    if (!el.querySelector('.sm-line')) {
      const parts = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = parts
        .map((p, i) => `<span class="sm-line"><span class="sm-inner" style="transition-delay:${i * 110}ms">${p}</span></span>`)
        .join('');
    }
    let rafId = 0;
    const setFinal = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      el.classList.remove('is-primed');
    };
    const api = {
      play: () => {
        if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
        if (isReduced()) { el.classList.remove('is-primed'); return; }
        el.classList.add('is-primed');
        el.getBoundingClientRect();
        rafId = requestAnimationFrame(() => { rafId = 0; el.classList.remove('is-primed'); });
      },
      setFinal,
    };
    el._smInit = api;
    return api;
  }

  /* ---- 2. Single-Pass Spotlight Sweep (Settles Still for Reading; Pointer Hover Optional) ---- */
  function initSpotlight(root) {
    if (root._spInit) return root._spInit;
    root.classList.add('live-ctrl');
    if (!root.querySelector('.sp-lit')) {
      const cone = document.createElement('div');
      cone.className = 'sp-cone';
      const base = document.createElement('div');
      base.className = 'sp-base';
      // Move original nodes (preserving existing listeners/state) instead of innerHTML rebuild
      while (root.firstChild) base.appendChild(root.firstChild);
      const lit = base.cloneNode(true);
      lit.className = 'sp-lit';
      lit.setAttribute('aria-hidden', 'true');
      lit.removeAttribute('id');
      lit.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      root.appendChild(cone);
      root.appendChild(base);
      root.appendChild(lit);
    }
    let rafId = 0;

    function setPos(px, py) {
      root.style.setProperty('--sp-x', px.toFixed(1) + '%');
      root.style.setProperty('--sp-y', py.toFixed(1) + '%');
    }

    function stop() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      setPos(50, 50);
    }

    // Single-pass cinematic sweep (left -> center) then completely STILL for reading
    function start() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      if (isReduced()) { setPos(50, 50); return; }
      const dur = 1050;
      const t0 = performance.now();
      function step(now) {
        if (isReduced()) { stop(); return; }
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        const x = 14 + (50 - 14) * e;
        const y = 42 + (50 - 42) * e;
        setPos(x, y);
        if (p < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          rafId = 0;
          setPos(50, 50); // Reading window: 100% still
        }
      }
      rafId = requestAnimationFrame(step);
    }

    root.addEventListener('pointermove', e => {
      if (isReduced()) return;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      const r = root.getBoundingClientRect();
      if (!r.width || !r.height) return;
      setPos(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
    });
    root.addEventListener('pointerleave', () => { stop(); });

    setPos(50, 50);
    const api = { start, stop, setPos };
    root._spInit = api;
    return api;
  }

  /* ---- 3. 3D Depth Deck ---- */
  function initDepthDeck(root) {
    if (root._ddInit) return root._ddInit;
    root.classList.add('live-ctrl');
    const cards = [...root.querySelectorAll('[data-deck-card]')];
    if (!cards.length) return null;
    let order = cards.map((_, i) => i);
    let tossing = false;
    let tossTimer = 0;

    function layout() {
      const n = order.length;
      order.forEach((cardIdx, depth) => {
        const c = cards[cardIdx];
        const scale = Math.max(0.82, 1 - depth * 0.065);
        const ty = -depth * 14;
        const tz = -depth * 55;
        const blur = depth === 0 ? 0 : Math.min(2.6, depth * 1.15);
        const op = Math.max(0.45, 1 - depth * 0.22);
        c.style.zIndex = String(n - depth);
        c.style.transform = `translate3d(0, ${ty}px, ${tz}px) scale(${scale})`;
        c.style.opacity = String(op);
        c.style.filter = blur ? `blur(${blur}px)` : 'none';
        c.style.pointerEvents = depth === 0 ? 'auto' : 'none';
        c.dataset.depth = String(depth);
      });
    }

    function next(dir) {
      if (order.length < 2 || tossing) return;
      const front = cards[order[0]];
      if (!isReduced()) {
        tossing = true;
        front.classList.add('is-tossing');
        front.style.transform = `translate3d(${dir * 160}px, -12px, 30px) rotate(${dir * 9}deg) scale(0.95)`;
        front.style.opacity = '0.25';
        tossTimer = setTimeout(() => {
          tossTimer = 0;
          tossing = false;
          front.classList.remove('is-tossing');
          order.push(order.shift());
          layout();
        }, 230);
      } else {
        order.push(order.shift());
        layout();
      }
    }

    function reset() {
      clearTimeout(tossTimer);
      tossTimer = 0;
      tossing = false;
      cards.forEach(c => c.classList.remove('is-tossing', 'is-dragging'));
      order = cards.map((_, i) => i);
      layout();
    }

    cards.forEach(card => {
      let startX = 0, dx = 0, dragging = false;
      card.addEventListener('pointerdown', e => {
        if (card.dataset.depth !== '0' || isStill() || tossing) return;
        e.stopPropagation();
        dragging = true;
        startX = e.clientX;
        dx = 0;
        card.classList.add('is-dragging');
        card.setPointerCapture(e.pointerId);
      });
      card.addEventListener('pointermove', e => {
        if (!dragging) return;
        e.stopPropagation();
        dx = (e.clientX - startX) / getScale();
        card.style.transform = `translate3d(${dx.toFixed(1)}px, ${(Math.abs(dx) * -0.06).toFixed(1)}px, 18px) rotate(${(dx * 0.045).toFixed(2)}deg)`;
      });
      const finish = e => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('is-dragging');
        try { card.releasePointerCapture(e.pointerId); } catch (_) {}
        if (Math.abs(dx) > 54) {
          next(dx > 0 ? 1 : -1);
        } else if (Math.abs(dx) < 8) {
          next(1);
        } else {
          layout();
        }
      };
      card.addEventListener('pointerup', finish);
      card.addEventListener('pointercancel', finish);
      card.addEventListener('click', e => e.stopPropagation());
    });

    layout();
    const api = { next: () => next(1), reset };
    root._ddInit = api;
    return api;
  }

  /* ---- 4. Colorize Wipe ---- */
  function initColorize(root) {
    if (root._cwInit) return root._cwInit;
    root.classList.add('live-ctrl');
    if (!root.querySelector('.cw-color')) {
      const mono = document.createElement('div');
      mono.className = 'cw-mono';
      while (root.firstChild) mono.appendChild(root.firstChild);
      const color = mono.cloneNode(true);
      color.className = 'cw-color';
      color.setAttribute('aria-hidden', 'true');
      color.removeAttribute('id');
      color.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      const beam = document.createElement('div');
      beam.className = 'cw-beam';
      root.appendChild(mono);
      root.appendChild(color);
      root.appendChild(beam);
    }
    let timer = 0;
    let rafId = 0;
    function setPct(p) {
      root.style.setProperty('--cw-pct', p + '%');
    }
    function setFinal() {
      clearTimeout(timer);
      timer = 0;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      setPct(100);
      root.classList.remove('is-sweeping');
    }
    function play() {
      clearTimeout(timer);
      timer = 0;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      if (isReduced()) { setFinal(); return; }
      const color = root.querySelector('.cw-color');
      const beam = root.querySelector('.cw-beam');
      if (color) color.style.transition = 'none';
      if (beam) beam.style.transition = 'none';
      setPct(0);
      root.getBoundingClientRect();
      if (color) color.style.transition = '';
      if (beam) beam.style.transition = '';
      root.classList.add('is-sweeping');
      rafId = requestAnimationFrame(() => { rafId = 0; setPct(100); });
      timer = setTimeout(() => { timer = 0; root.classList.remove('is-sweeping'); }, 1250);
    }
    setPct(100);
    const api = { play, setFinal };
    root._cwInit = api;
    return api;
  }

  const splits = [...document.querySelectorAll('[data-split-mask]')].map(initSplitMask);
  const spots = [...document.querySelectorAll('[data-spotlight-sweep]')].map(initSpotlight);
  const decks = [...document.querySelectorAll('[data-depth-deck]')].map(initDepthDeck).filter(Boolean);
  const colors = [...document.querySelectorAll('[data-colorize-wipe]')].map(initColorize);

  function settleAll(resetDecks) {
    clearEnterTimers();
    splits.forEach(s => s.setFinal());
    spots.forEach(s => s.stop());
    colors.forEach(c => c.setFinal());
    if (resetDecks) decks.forEach(d => d.reset());
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
        sl.querySelectorAll('[data-split-mask]').forEach(el => el._smInit && el._smInit.setFinal());
        sl.querySelectorAll('[data-spotlight-sweep]').forEach(el => el._spInit && el._spInit.stop());
        sl.querySelectorAll('[data-colorize-wipe]').forEach(el => el._cwInit && el._cwInit.setFinal());
        return;
      }
      const run = () => {
        if (deck.slides[deck.index] !== sl || isReduced()) return;
        sl.querySelectorAll('[data-split-mask]').forEach(el => { if (el._smInit && stepOf(el, sl) <= curStep) el._smInit.play(); });
        sl.querySelectorAll('[data-spotlight-sweep]').forEach(el => { if (el._spInit && stepOf(el, sl) <= curStep) el._spInit.start(); });
        sl.querySelectorAll('[data-colorize-wipe]').forEach(el => { if (el._cwInit && stepOf(el, sl) <= curStep) el._cwInit.play(); });
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
        sl.querySelectorAll('[data-split-mask]').forEach(el => el._smInit && el._smInit.setFinal());
        sl.querySelectorAll('[data-spotlight-sweep]').forEach(el => el._spInit && el._spInit.stop());
        sl.querySelectorAll('[data-colorize-wipe]').forEach(el => el._cwInit && el._cwInit.setFinal());
        return;
      }
      sl.querySelectorAll('[data-split-mask]').forEach(el => { if (el._smInit && stepOf(el, sl) === detail.step) el._smInit.play(); });
      sl.querySelectorAll('[data-spotlight-sweep]').forEach(el => { if (el._spInit && stepOf(el, sl) === detail.step) el._spInit.start(); });
      sl.querySelectorAll('[data-colorize-wipe]').forEach(el => { if (el._cwInit && stepOf(el, sl) === detail.step) el._cwInit.play(); });
    });
    deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
      clearEnterTimers();
      const sl = detail.slide;
      if (!sl) return;
      sl.querySelectorAll('[data-split-mask]').forEach(el => el._smInit && el._smInit.setFinal());
      sl.querySelectorAll('[data-spotlight-sweep]').forEach(el => el._spInit && el._spInit.stop());
      sl.querySelectorAll('[data-colorize-wipe]').forEach(el => el._cwInit && el._cwInit.setFinal());
      sl.querySelectorAll('[data-depth-deck]').forEach(el => el._ddInit && el._ddInit.reset());
    });
    deck.stage.addEventListener('deck:still', ({ detail }) => { if (detail.still) settleAll(true); });
    deck.stage.addEventListener('deck:lowpower', ({ detail }) => { if (detail.lowPower) settleAll(false); });
    deck.stage.addEventListener('deck:reducedmotion', ({ detail }) => { if (detail.reduced) settleAll(false); });
  }
  window.__motionKits = window.__motionKits || {};
  window.__motionKits.apple = { initSplitMask, initSpotlight, initDepthDeck, initColorize, splits, spots, decks, colors };
})();
