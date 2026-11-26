/* deck-architect v4.4 On-Demand Module: ambient-fx
 * Deferred 480x270 Canvas 2D ambient FX (ambient-dust | soft-aurora; MIT lewislulu/html-ppt-skill).
 * Decoupled via #stage lifecycle events (deck:slideenter / deck:slideleave / deck:still / deck:lowpower).
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  let fxRaf = 0;
  let fxCanvas = null;
  let fxTimer = 0;
  let fxToken = 0;

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
    const fx = sl.dataset.fx;
    if (!fx) return;
    const tok = fxToken;

    const boot = () => {
      fxTimer = 0;
      if (tok !== fxToken || deck.isStatic() || deck.slides[deck.index] !== sl) return;
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

      if (fx === 'ambient-dust') {
        const pts = Array.from({ length: 20 }, (_, i) => ({
          x: 170 + ((i * 53) % 295),
          y: (i * 23) % 270,
          r: 0.7 + (i % 3) * 0.45,
          vy: -0.07 - (i % 4) * 0.025,
          vx: -0.04 + (i % 3) * 0.025,
          ph: i * 0.7,
          a: 0.22 + (i % 4) * 0.08,
        }));
        let last = 0;
        const draw = now => {
          fxRaf = requestAnimationFrame(draw);
          if (now - last < 40) return;
          last = now;
          ctx.clearRect(0, 0, 480, 270);
          for (const p of pts) {
            p.y += p.vy;
            p.x += p.vx + Math.sin(now * 0.0008 + p.ph) * 0.04;
            if (p.y < -4) { p.y = 274; p.x = 170 + Math.random() * 295; }
            if (p.x < 100) p.x = 472;
            const alpha = p.a * (0.65 + 0.35 * Math.sin(now * 0.0014 + p.ph));
            ctx.fillStyle = 'rgba(255,232,188,' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
        };
        fxRaf = requestAnimationFrame(draw);
      } else if (fx === 'soft-aurora') {
        const orbs = [
          { x: 365, y: 120, rx: 115, col: '58,217,155', a: 0.11, sp: 0.00055, ph: 0 },
          { x: 130, y: 210, rx: 95, col: '74,195,250', a: 0.085, sp: 0.00042, ph: 2.1 },
          { x: 280, y: 220, rx: 85, col: '242,201,107', a: 0.065, sp: 0.00038, ph: 4.2 },
        ];
        let last = 0;
        const draw = now => {
          fxRaf = requestAnimationFrame(draw);
          if (now - last < 50) return;
          last = now;
          ctx.clearRect(0, 0, 480, 270);
          for (const o of orbs) {
            const dx = Math.sin(now * o.sp + o.ph) * 11;
            const dy = Math.cos(now * o.sp * 0.8 + o.ph) * 7;
            const a = o.a * (0.78 + 0.22 * Math.sin(now * o.sp * 1.4 + o.ph));
            const g = ctx.createRadialGradient(o.x + dx, o.y + dy, 0, o.x + dx, o.y + dy, o.rx);
            g.addColorStop(0, 'rgba(' + o.col + ',' + a.toFixed(3) + ')');
            g.addColorStop(1, 'rgba(' + o.col + ',0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(o.x + dx, o.y + dy, o.rx, 0, Math.PI * 2);
            ctx.fill();
          }
        };
        fxRaf = requestAnimationFrame(draw);
      }
    };

    if (deferMs > 0) fxTimer = setTimeout(boot, deferMs);
    else boot();
  }

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

  if (!deck.isStatic() && deck.slides[deck.index]) {
    startFx(deck.slides[deck.index], 180);
  }
})();
