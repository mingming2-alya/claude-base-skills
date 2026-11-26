/* deck-architect v4.5 On-Demand Module: ambient-fx core registry
 * Manages deferred 480x270 GPU-stretched Canvas 2D effects and token color resolution.
 * Individual effect files register via window.__deckFx.register(name, factory).
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const registry = new Map();
  let fxRaf = 0;
  let fxCanvas = null;
  let fxTimer = 0;
  let fxToken = 0;

  function parseRgb(raw, fallback) {
    const s = String(raw || '').trim();
    if (!s) return fallback;
    const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      let h = hex[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16);
    }
    const rgb = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgb) return rgb[1] + ',' + rgb[2] + ',' + rgb[3];
    return fallback;
  }

  function resolvePalette(sl) {
    const cs = getComputedStyle(sl);
    const surf = sl.dataset.surface || deck.activeSurface || 'dark';
    const isLight = surf === 'light';
    const primary = parseRgb(cs.getPropertyValue('--fx-color') || cs.getPropertyValue('--accent'), isLight ? '37,99,235' : '99,179,237');
    const secondary = parseRgb(cs.getPropertyValue('--accent2') || cs.getPropertyValue('--accent'), isLight ? '14,165,233' : '58,217,155');
    const warm = parseRgb(cs.getPropertyValue('--warn'), '242,201,107');
    return { primary, secondary, warm, isLight };
  }

  function stopFx() {
    fxToken++;
    if (fxTimer) { clearTimeout(fxTimer); fxTimer = 0; }
    if (fxRaf) { cancelAnimationFrame(fxRaf); fxRaf = 0; }
    if (fxCanvas) {
      const ctx = fxCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      fxCanvas = null;
    }
  }

  function startFx(sl, deferMs) {
    stopFx();
    if (!sl || deck.isStatic()) return;
    const fx = (sl.dataset.fx || '').trim();
    if (!fx || !registry.has(fx)) return;
    const tok = fxToken;

    const boot = () => {
      fxTimer = 0;
      if (tok !== fxToken || deck.isStatic() || deck.slides[deck.index] !== sl) return;
      const factory = registry.get(fx);
      if (!factory) return;
      let canvas = sl.querySelector(':scope > canvas.fx-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'fx-canvas';
        // 480x270 logical buffer stretched smoothly by GPU -> 16x cheaper than 1920x1080
        canvas.width = 480;
        canvas.height = 270;
        canvas.setAttribute('aria-hidden', 'true');
        const anchor = sl.querySelector(':scope > .scrim, :scope > .asset-slot');
        if (anchor && anchor.nextSibling) sl.insertBefore(canvas, anchor.nextSibling);
        else sl.prepend(canvas);
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      fxCanvas = canvas;

      const palette = resolvePalette(sl);
      const stepFn = factory({ ctx, w: 480, h: 270, slide: sl, palette });
      if (typeof stepFn !== 'function') return;

      const loop = now => {
        if (tok !== fxToken || deck.isStatic()) { fxRaf = 0; return; }
        const keepGoing = stepFn(now);
        if (keepGoing === false) { fxRaf = 0; return; }
        fxRaf = requestAnimationFrame(loop);
      };
      fxRaf = requestAnimationFrame(loop);
    };

    if (deferMs > 0) fxTimer = setTimeout(boot, deferMs);
    else boot();
  }

  window.__deckFx = {
    register(name, factory) { registry.set(name, factory); },
    parseRgb,
    stop: stopFx,
    start: startFx,
  };

  deck.stage.addEventListener('deck:slideenter', ({ detail }) => {
    if (detail.staticMode) { stopFx(); return; }
    startFx(detail.slide, detail.instant ? 180 : 620);
  });
  deck.stage.addEventListener('deck:slideleave', stopFx);
  deck.stage.addEventListener('deck:still', ({ detail }) => {
    if (detail.still) stopFx();
    else startFx(deck.slides[deck.index], 120);
  });
  deck.stage.addEventListener('deck:lowpower', ({ detail }) => {
    if (detail.lowPower) stopFx();
    else startFx(deck.slides[deck.index], 120);
  });

  // Boot after synchronous effect plugin scripts finish registering
  Promise.resolve().then(() => {
    if (!deck.isStatic() && deck.slides[deck.index]) {
      startFx(deck.slides[deck.index], 180);
    }
  });
})();
