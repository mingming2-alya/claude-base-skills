/* deck-architect v4.7 Style Motion Kit: apple (Cinema Spring)
 * Primitives: [data-split-mask], [data-spotlight-sweep], [data-depth-deck], [data-colorize-wipe]
 */
(function () {
  const deck = window.__deck;
  const isStatic = () => (deck && typeof deck.isStatic === 'function' ? deck.isStatic() : false);

  /* ---- 1. Split Mask Reveal ---- */
  function initSplitMask(el) {
    if (el._smInit) return el._smInit;
    if (!el.querySelector('.sm-line')) {
      const parts = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = parts
        .map((p, i) => `<span class="sm-line"><span class="sm-inner" style="transition-delay:${i * 110}ms">${p}</span></span>`)
        .join('');
    }
    const api = {
      play: () => {
        if (isStatic()) { el.classList.remove('is-primed'); return; }
        el.classList.add('is-primed');
        el.getBoundingClientRect();
        requestAnimationFrame(() => el.classList.remove('is-primed'));
      },
      setFinal: () => el.classList.remove('is-primed')
    };
    el._smInit = api;
    return api;
  }

  /* ---- 2. Single-Pass Spotlight Sweep (Settles Still for Reading; Pointer Hover Optional) ---- */
  function initSpotlight(root) {
    if (root._spInit) return root._spInit;
    root.classList.add('live-ctrl');
    if (!root.querySelector('.sp-lit')) {
      const raw = root.innerHTML;
      root.innerHTML = `<div class="sp-cone"></div><div class="sp-base">${raw}</div><div class="sp-lit" aria-hidden="true">${raw}</div>`;
    }
    let rafId = 0;

    function setPos(px, py) {
      root.style.setProperty('--sp-x', px.toFixed(1) + '%');
      root.style.setProperty('--sp-y', py.toFixed(1) + '%');
    }

    function stop() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    // Single-pass cinematic sweep (left -> center) then completely STILL for reading
    function start() {
      stop();
      if (isStatic()) { setPos(50, 50); return; }
      const dur = 1050;
      const t0 = performance.now();
      function step(now) {
        if (isStatic()) { stop(); setPos(50, 50); return; }
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
      if (isStatic()) return;
      stop(); // Immediate user takeover
      const r = root.getBoundingClientRect();
      if (!r.width || !r.height) return;
      setPos(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
    });
    root.addEventListener('pointerleave', () => { stop(); setPos(50, 50); });

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
      if (order.length < 2) return;
      const front = cards[order[0]];
      if (!isStatic()) {
        front.classList.add('is-tossing');
        front.style.transform = `translate3d(${dir * 160}px, -12px, 30px) rotate(${dir * 9}deg) scale(0.95)`;
        front.style.opacity = '0.25';
        setTimeout(() => {
          front.classList.remove('is-tossing');
          order.push(order.shift());
          layout();
        }, 230);
      } else {
        order.push(order.shift());
        layout();
      }
    }

    cards.forEach(card => {
      let startX = 0, dx = 0, dragging = false;
      card.addEventListener('pointerdown', e => {
        if (card.dataset.depth !== '0' || isStatic()) return;
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
        dx = e.clientX - startX;
        card.style.transform = `translate3d(${dx}px, ${Math.abs(dx) * -0.06}px, 18px) rotate(${dx * 0.045}deg)`;
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
    const api = {
      next: () => next(1),
      reset: () => { order = cards.map((_, i) => i); layout(); }
    };
    root._ddInit = api;
    return api;
  }

  /* ---- 4. Colorize Wipe ---- */
  function initColorize(root) {
    if (root._cwInit) return root._cwInit;
    root.classList.add('live-ctrl');
    if (!root.querySelector('.cw-color')) {
      const inner = root.innerHTML;
      root.innerHTML = `<div class="cw-mono">${inner}</div><div class="cw-color" aria-hidden="true">${inner}</div><div class="cw-beam"></div>`;
    }
    let timer = 0;
    function setPct(p) {
      root.style.setProperty('--cw-pct', p + '%');
    }
    function play() {
      clearTimeout(timer);
      if (isStatic()) { setPct(100); root.classList.remove('is-sweeping'); return; }
      const color = root.querySelector('.cw-color');
      const beam = root.querySelector('.cw-beam');
      if (color) color.style.transition = 'none';
      if (beam) beam.style.transition = 'none';
      setPct(0);
      root.getBoundingClientRect();
      if (color) color.style.transition = '';
      if (beam) beam.style.transition = '';
      root.classList.add('is-sweeping');
      requestAnimationFrame(() => setPct(100));
      timer = setTimeout(() => root.classList.remove('is-sweeping'), 1250);
    }
    setPct(100);
    const api = { play, setFinal: () => { clearTimeout(timer); setPct(100); root.classList.remove('is-sweeping'); } };
    root._cwInit = api;
    return api;
  }

  const splits = [...document.querySelectorAll('[data-split-mask]')].map(initSplitMask);
  const spots = [...document.querySelectorAll('[data-spotlight-sweep]')].map(initSpotlight);
  const decks = [...document.querySelectorAll('[data-depth-deck]')].map(initDepthDeck).filter(Boolean);
  const colors = [...document.querySelectorAll('[data-colorize-wipe]')].map(initColorize);

  if (deck && deck.stage) {
    deck.stage.addEventListener('deck:slideenter', ({ detail }) => {
      const sl = detail.slide;
      if (!sl) return;
      sl.querySelectorAll('[data-split-mask]').forEach(el => el._smInit && el._smInit.play());
      sl.querySelectorAll('[data-spotlight-sweep]').forEach(el => el._spInit && el._spInit.start());
      sl.querySelectorAll('[data-colorize-wipe]').forEach(el => el._cwInit && el._cwInit.play());
    });
    deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
      const sl = detail.slide;
      if (!sl) return;
      sl.querySelectorAll('[data-spotlight-sweep]').forEach(el => el._spInit && el._spInit.stop());
    });
    deck.stage.addEventListener('deck:still', ({ detail }) => {
      if (detail.still) {
        splits.forEach(s => s.setFinal());
        spots.forEach(s => s.stop());
        colors.forEach(c => c.setFinal());
        decks.forEach(d => d.reset());
      }
    });
  }
  window.__motionKits = window.__motionKits || {};
  window.__motionKits.apple = { initSplitMask, initSpotlight, initDepthDeck, initColorize, splits, spots, decks, colors };
})();
