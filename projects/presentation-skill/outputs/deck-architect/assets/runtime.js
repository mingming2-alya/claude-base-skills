/* deck-architect v4.1 Thin Shell Runtime (Phase B — Layered Hybrid Zero-Dep Core)
 *
 * Zero external dependencies (~10 KB), 100% offline single-file HTML playback:
 *  - Interruptible navigation with zero lockout (analytic critically-damped springs;
 *    inspired by MIT emilkowalski/skills apple-design & beatdeck)
 *  - Hold outgoing slide opacity:1 underneath incoming slide (no stage flash;
 *    inspired by MIT open-slide)
 *  - Cross-slide Keynote Magic Move ([data-morph="id"], forward & backward;
 *    inspired by MIT open-slide)
 *  - Semantic data & SVG primitives: [data-count] rolling numbers (MIT scrolline),
 *    [data-draw] SVG pathLength/ring draw (MIT visual-explainer), [data-grow="x|y"],
 *    [data-stagger] non-uniform ease-out stagger (anti-double-entrance guarded)
 *  - Safe 30fps Canvas 2D background FX lifecycle ([data-fx]; MIT lewislulu/html-ppt-skill)
 *  - Interactive live-figure click & key isolation (.live-ctrl / [data-interactive])
 *  - Dual static freeze: ?still=1, B low-power toggle, prefers-reduced-motion, @media print
 *  - Flagship plugin lifecycle events: deck:slideenter, deck:slideleave, deck:still, deck:lowpower
 */
(function () {
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const nav = document.getElementById('nav');
  const tabsEl = document.getElementById('tabs');
  const curtain = document.getElementById('curtain');
  const notesEl = document.getElementById('notes');
  let morphLayer = document.getElementById('morph-layer');
  let toastEl = document.getElementById('toast');
  if (!stage || !slides.length) return;

  if (!morphLayer) {
    morphLayer = document.createElement('div');
    morphLayer.id = 'morph-layer';
    morphLayer.setAttribute('aria-hidden', 'true');
    stage.appendChild(morphLayer);
  }
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }

  const params = new URLSearchParams(location.search);
  let stillMode = params.get('still') === '1' || params.has('still');
  const hideCtrlMode = params.get('hide-ctrl') === '1';
  let lowPower = false;
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = reduceMQ.matches;
  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', e => { reduce = e.matches; if (reduce) freezeNow(); });

  if (stillMode) document.documentElement.classList.add('still');
  if (hideCtrlMode) document.documentElement.classList.add('hide-ctrl');

  const isStatic = () => Boolean(stillMode || lowPower || reduce);
  const M = (window.DECK && window.DECK.motion) || 'horizontal';

  let cur = -1;
  let navToken = 0;
  let toastTimer = null;
  const returnTo = [];
  const activeAnims = new Set();
  const activeTimers = new Set();
  const activeRafs = new Set();
  const hiddenMorphEls = new Set();

  const isApp = i => slides[i] && slides[i].dataset.appendix === '1';

  // ---------------------------------------------------------------- analytic spring solver
  function springCurve(response, bounce, steps = 26) {
    const r = Math.max(0.18, Math.min(1.4, Number(response) || 0.54));
    const b = Math.max(0, Math.min(0.45, Number(bounce) || 0));
    const w0 = (2 * Math.PI) / r;
    const zeta = Math.max(0.55, 1 - b);
    const dur = Math.round(r * (zeta >= 0.999 ? 1320 : 1560));
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      if (i === steps) { pts.push(1); break; }
      const t = ((i / steps) * dur) / 1000;
      let v;
      if (zeta >= 0.999) {
        v = 1 - (1 + w0 * t) * Math.exp(-w0 * t);
      } else {
        const wd = w0 * Math.sqrt(1 - zeta * zeta);
        v = 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
      }
      pts.push(v);
    }
    return { dur, pts };
  }

  function trackAnim(anim) {
    if (!anim) return anim;
    activeAnims.add(anim);
    const done = () => activeAnims.delete(anim);
    anim.finished.then(done, done);
    return anim;
  }

  function later(fn, ms) {
    const id = setTimeout(() => { activeTimers.delete(id); fn(); }, ms);
    activeTimers.add(id);
    return id;
  }

  function toast(msg) {
    if (!toastEl || stillMode) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // ---------------------------------------------------------------- stage fit & nav
  document.querySelectorAll('[data-shape="rings"] .toc-list').forEach(ol => {
    const lis = [...ol.children], n = lis.length;
    const big = M === 'zoom-in';
    lis.forEach((li, i) => {
      const k = big ? i : n - 1 - i;
      li.style.setProperty('--r', 940 - k * (700 / Math.max(1, n - 1)));
    });
  });

  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fit);
  fit();

  const chapters = (window.DECK && window.DECK.chapters) || [];
  let labels = [], ind = null;
  if (nav && chapters.length) {
    nav.innerHTML = chapters.map(l => '<span>' + String(l).replace(/</g, '&lt;') + '</span>').join('') + '<i class="ind"></i>';
    labels = [...nav.querySelectorAll('span')];
    ind = nav.querySelector('.ind');
  }

  function setNav(sl) {
    if (!nav || !tabsEl) return;
    const kind = sl.dataset.kind || 'content';
    const chi = Number(sl.dataset.chi ?? -1);
    const navMode = sl.dataset.nav || (sl.querySelector('nav.slide-nav, nav[data-auto-nav], [data-auto-nav]') ? 'inline' : 'shell');
    const hide = kind !== 'content' || navMode === 'inline' || navMode === 'none' || chi < 0 || !labels[chi];
    stage.classList.toggle('hide-nav', hide);
    if (hide) { tabsEl.style.opacity = 0; return; }

    labels.forEach((l, i) => l.classList.toggle('on', i === chi));
    const on = labels[chi];
    if (ind && on) {
      ind.style.left = on.offsetLeft + 'px';
      ind.style.width = on.offsetWidth + 'px';
    }
    const tabs = Number(sl.dataset.tabs || 0);
    const tab = Number(sl.dataset.tab || 0);
    const tabList = (window.DECK && window.DECK.tabs && window.DECK.tabs[chi]) || [];
    if (tabs > 2 && tabList.length > 2) {
      if (tabsEl.dataset.chi != String(chi)) {
        tabsEl.innerHTML = tabList.map(t => '<span>' + String(t).replace(/</g, '&lt;') + '</span>').join('');
        tabsEl.dataset.chi = String(chi);
      }
      [...tabsEl.children].forEach((t, i) => t.classList.toggle('on', i === tab));
      tabsEl.style.opacity = 1;
    } else {
      tabsEl.style.opacity = 0;
    }
  }

  function showNotes(sl) {
    if (notesEl) notesEl.textContent = sl.dataset.notes || '（這頁沒有講者備註）';
  }

  function slideMotion(sl) {
    const cs = getComputedStyle(sl);
    const mode = (sl.dataset.motionMode || cs.getPropertyValue('--motion-mode') || 'spring').trim();
    const response = parseFloat(sl.dataset.springResponse || cs.getPropertyValue('--spring-response')) || 0.54;
    const bounce = parseFloat(sl.dataset.springBounce || cs.getPropertyValue('--spring-bounce')) || 0;
    const steps = parseInt(cs.getPropertyValue('--step-frames'), 10) || 5;
    const staggerBase = parseFloat(cs.getPropertyValue('--stagger-base')) || 48;
    const morphMs = parseFloat(cs.getPropertyValue('--morph-ms')) || 780;
    const ease = (cs.getPropertyValue('--enter-easing') || '').trim() || 'cubic-bezier(.16,1,.3,1)';
    return { mode, response, bounce, steps, staggerBase, morphMs, ease };
  }

  // ---------------------------------------------------------------- init semantic primitives
  function findNumTextNode(el) {
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && /\d/.test(n.nodeValue)) return n;
    }
    return null;
  }

  function initPrimitives() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const tn = findNumTextNode(el);
      if (tn && el.dataset.countFinal === undefined) {
        el.dataset.countFinal = tn.nodeValue;
      }
    });
    document.querySelectorAll('[data-draw]').forEach(el => {
      const kind = el.getAttribute('data-draw');
      if (kind === 'ring') {
        const r = parseFloat(el.getAttribute('r') || '0');
        const circ = parseFloat(el.dataset.circ || '') || (r ? +(2 * Math.PI * r).toFixed(2) : 0);
        if (circ) el.dataset.circ = String(circ);
        const da = el.getAttribute('stroke-dasharray');
        const dof = el.getAttribute('stroke-dashoffset');
        if (dof !== null && dof !== '') {
          el.dataset.ringFinal = dof;
        } else if (da && circ) {
          const filled = parseFloat(da.split(/[\s,]+/)[0]);
          if (!Number.isNaN(filled)) {
            const finalOff = Math.max(0, +(circ - filled).toFixed(2));
            el.setAttribute('stroke-dasharray', String(circ));
            el.setAttribute('stroke-dashoffset', String(finalOff));
            el.dataset.ringFinal = String(finalOff);
          }
        }
      } else {
        const da = (el.getAttribute('stroke-dasharray') || '').trim();
        if (da && da !== '1') {
          el.dataset.drawDashed = '1';
        } else {
          el.setAttribute('pathLength', '1');
        }
      }
    });
  }
  initPrimitives();

  function snapSlideFinal(sl) {
    if (!sl) return;
    sl.querySelectorAll('[data-count]').forEach(el => {
      const tn = findNumTextNode(el);
      if (tn && el.dataset.countFinal !== undefined) tn.nodeValue = el.dataset.countFinal;
    });
    sl.querySelectorAll('[data-draw]').forEach(el => {
      if (el.getAttribute('data-draw') === 'ring') {
        if (el.dataset.ringFinal !== undefined) el.style.strokeDashoffset = el.dataset.ringFinal;
      } else if (!el.dataset.drawDashed) {
        el.style.strokeDasharray = '';
        el.style.strokeDashoffset = '';
      }
    });
  }

  function animateSlideContent(sl, baseDelay, token, morphedIds) {
    if (!sl || isStatic()) { snapSlideFinal(sl); return; }
    const cfg = slideMotion(sl);
    const sp = cfg.mode === 'spring' ? springCurve(cfg.response, cfg.bounce, 22) : null;

    // 1. Non-uniform staggered groups ([data-stagger])
    const staggeredSet = new Set();
    sl.querySelectorAll('[data-stagger]').forEach(group => {
      const stepMs = parseFloat(group.getAttribute('data-stagger')) || cfg.staggerBase;
      const gDelay = baseDelay + (parseFloat(group.dataset.delay) || 0);
      const items = [...group.children].filter(el => el.nodeType === 1);
      items.forEach((el, i) => {
        staggeredSet.add(el);
        if (morphedIds && el.dataset.morph && morphedIds.has(el.dataset.morph)) return;
        const d = gDelay + Math.round(stepMs * Math.pow(i, 0.78));
        if (cfg.mode === 'stepped') {
          trackAnim(el.animate(
            [{ opacity: 0, transform: 'translateY(-18px)' }, { opacity: 1, transform: 'none' }],
            { duration: 360, delay: d, easing: 'steps(' + cfg.steps + ', end)', fill: 'backwards' }
          ));
        } else {
          trackAnim(el.animate(
            [{ opacity: 0, transform: 'translateY(14px) scale(0.96)' }, { opacity: 1, transform: 'none' }],
            { duration: 480, delay: d, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
          ));
        }
      });
    });

    // 2. General .rv reveals (strictly skip nested .rv or already-staggered items)
    let rvIdx = 0;
    sl.querySelectorAll('.rv').forEach(el => {
      if (staggeredSet.has(el)) return;
      if (el.parentElement && el.parentElement.closest('.rv, [data-stagger]')) return;
      if (morphedIds && el.dataset.morph && morphedIds.has(el.dataset.morph)) return;
      const d = baseDelay + (parseFloat(el.dataset.delay) || Math.round(cfg.staggerBase * Math.pow(rvIdx++, 0.82)));
      if (cfg.mode === 'stepped') {
        trackAnim(el.animate(
          [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'none' }],
          { duration: 420, delay: d, easing: 'steps(' + cfg.steps + ', end)', fill: 'backwards' }
        ));
      } else if (sp) {
        const frames = sp.pts.map((p, i) => ({
          opacity: Math.min(1, p * 1.45),
          transform: 'translate3d(0,' + ((1 - p) * 22).toFixed(2) + 'px,0)',
          offset: i / (sp.pts.length - 1),
        }));
        trackAnim(el.animate(frames, { duration: sp.dur, delay: d, easing: 'linear', fill: 'backwards' }));
      } else {
        trackAnim(el.animate(
          [{ opacity: 0, transform: 'translate3d(0,16px,0)' }, { opacity: 1, transform: 'none' }],
          { duration: 520, delay: d, easing: cfg.ease, fill: 'backwards' }
        ));
      }
    });

    // 3. Rolling numbers ([data-count])
    sl.querySelectorAll('[data-count]').forEach(el => {
      if (morphedIds && el.dataset.morph && morphedIds.has(el.dataset.morph)) return;
      const tn = findNumTextNode(el);
      const finalStr = el.dataset.countFinal;
      if (!tn || !finalStr) return;
      const m = finalStr.match(/^([+\-−$€£¥\s]*)(\d+(?:,\d{3})*(?:\.\d+)?)(.*)$/);
      if (!m) return;
      const [, pre, numRaw, post] = m;
      const hasComma = numRaw.includes(',');
      const dec = numRaw.includes('.') ? numRaw.split('.')[1].length : 0;
      const target = parseFloat(numRaw.replace(/,/g, ''));
      const dur = parseFloat(el.dataset.dur) || 740;
      const delay = baseDelay + (parseFloat(el.dataset.delay) || 90);
      const fmt = v => {
        let s = dec > 0 ? v.toFixed(dec) : String(Math.round(v));
        if (hasComma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return pre + s + post;
      };
      tn.nodeValue = fmt(0);
      const startAt = performance.now() + delay;
      const tick = now => {
        activeRafs.delete(id);
        if (token !== navToken || isStatic()) { tn.nodeValue = finalStr; return; }
        if (now < startAt) { id = requestAnimationFrame(tick); activeRafs.add(id); return; }
        const p = Math.min(1, (now - startAt) / dur);
        const eased = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
        tn.nodeValue = p >= 1 ? finalStr : fmt(target * eased);
        if (p < 1) { id = requestAnimationFrame(tick); activeRafs.add(id); }
      };
      let id = requestAnimationFrame(tick);
      activeRafs.add(id);
    });

    // 4. SVG stroke draw & progress rings ([data-draw])
    sl.querySelectorAll('[data-draw]').forEach(el => {
      const delay = baseDelay + (parseFloat(el.dataset.delay) || 140);
      const dur = parseFloat(el.dataset.dur) || 820;
      if (el.getAttribute('data-draw') === 'ring') {
        const circ = parseFloat(el.dataset.circ || '0');
        const fin = parseFloat(el.dataset.ringFinal || '0');
        if (!circ) return;
        trackAnim(el.animate(
          [{ strokeDashoffset: circ }, { strokeDashoffset: fin }],
          { duration: dur, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
        ));
      } else if (el.dataset.drawDashed) {
        el.style.transformBox = 'fill-box';
        el.style.transformOrigin = '50% 0%';
        trackAnim(el.animate(
          [{ opacity: 0, transform: 'scaleY(0)' }, { opacity: 1, transform: 'scaleY(1)' }],
          { duration: dur * 0.65, delay, easing: cfg.mode === 'stepped' ? 'steps(' + cfg.steps + ', end)' : 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
        ));
      } else {
        el.style.strokeDasharray = '1';
        const anim = trackAnim(el.animate(
          [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
          { duration: dur, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }
        ));
        anim.finished.then(() => {
          if (token === navToken) { el.style.strokeDasharray = ''; el.style.strokeDashoffset = ''; }
        }, () => {});
      }
    });

    // 5. Bar / column growth ([data-grow="x|y"])
    sl.querySelectorAll('[data-grow]').forEach((el, idx) => {
      const axis = (el.getAttribute('data-grow') || 'x').toLowerCase();
      const delay = baseDelay + (parseFloat(el.dataset.delay) || (110 + idx * 45));
      const dur = parseFloat(el.dataset.dur) || 680;
      el.style.transformOrigin = axis === 'y' ? 'center bottom' : 'left center';
      const fromT = axis === 'y' ? 'scaleY(0)' : 'scaleX(0)';
      const toT = axis === 'y' ? 'scaleY(1)' : 'scaleX(1)';
      trackAnim(el.animate(
        [{ transform: fromT }, { transform: toT }],
        { duration: dur, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
      ));
    });
  }

  // ---------------------------------------------------------------- safe Canvas 2D FX lifecycle (MIT lewislulu)
  let fxRaf = 0;
  let fxCanvas = null;

  function stopFx() {
    if (fxRaf) { cancelAnimationFrame(fxRaf); fxRaf = 0; }
    if (fxCanvas) {
      const ctx = fxCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      fxCanvas = null;
    }
  }

  function startFx(sl) {
    stopFx();
    if (!sl || isStatic()) return;
    const fx = sl.dataset.fx;
    if (!fx) return;

    let canvas = sl.querySelector(':scope > canvas.fx-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'fx-canvas';
      canvas.width = 1920;
      canvas.height = 1080;
      canvas.setAttribute('aria-hidden', 'true');
      const anchor = sl.querySelector(':scope > .scrim, :scope > .asset-slot');
      if (anchor && anchor.nextSibling) sl.insertBefore(canvas, anchor.nextSibling);
      else sl.prepend(canvas);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    fxCanvas = canvas;

    if (fx === 'ambient-dust') {
      const pts = Array.from({ length: 26 }, (_, i) => ({
        x: 680 + ((i * 197) % 1180),
        y: (i * 93) % 1080,
        r: 1.4 + (i % 4) * 0.85,
        vy: -0.22 - (i % 5) * 0.08,
        vx: -0.14 + (i % 3) * 0.09,
        ph: i * 0.7,
        a: 0.16 + (i % 4) * 0.07,
      }));
      let last = 0;
      const draw = now => {
        fxRaf = requestAnimationFrame(draw);
        if (now - last < 33) return;
        last = now;
        ctx.clearRect(0, 0, 1920, 1080);
        for (const p of pts) {
          p.y += p.vy;
          p.x += p.vx + Math.sin(now * 0.0008 + p.ph) * 0.15;
          if (p.y < -12) { p.y = 1092; p.x = 680 + Math.random() * 1180; }
          if (p.x < 420) p.x = 1880;
          const alpha = p.a * (0.65 + 0.35 * Math.sin(now * 0.0014 + p.ph));
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
          g.addColorStop(0, 'rgba(255,232,188,' + alpha.toFixed(3) + ')');
          g.addColorStop(1, 'rgba(255,232,188,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      fxRaf = requestAnimationFrame(draw);
    } else if (fx === 'soft-aurora') {
      const orbs = [
        { x: 1460, y: 480, rx: 460, col: '58,217,155', a: 0.09, sp: 0.00055, ph: 0 },
        { x: 520, y: 840, rx: 380, col: '74,195,250', a: 0.075, sp: 0.00042, ph: 2.1 },
        { x: 1120, y: 880, rx: 340, col: '242,201,107', a: 0.055, sp: 0.00038, ph: 4.2 },
      ];
      let last = 0;
      const draw = now => {
        fxRaf = requestAnimationFrame(draw);
        if (now - last < 40) return;
        last = now;
        ctx.clearRect(0, 0, 1920, 1080);
        for (const o of orbs) {
          const dx = Math.sin(now * o.sp + o.ph) * 44;
          const dy = Math.cos(now * o.sp * 0.8 + o.ph) * 28;
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
  }

  // ---------------------------------------------------------------- cross-slide Magic Move (MIT open-slide)
  function stageBox(el) {
    const sr = stage.getBoundingClientRect();
    const s = sr.width ? sr.width / 1920 : 1;
    const r = el.getBoundingClientRect();
    return {
      x: (r.left - sr.left) / s,
      y: (r.top - sr.top) / s,
      w: r.width / s,
      h: r.height / s,
    };
  }

  function copyVisualStyle(src, dst) {
    const cs = getComputedStyle(src);
    const props = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariantNumeric',
      'letterSpacing', 'lineHeight', 'textAlign', 'color', 'backgroundColor',
      'borderRadius', 'border', 'padding', 'display', 'alignItems',
      'justifyContent', 'gap', 'boxShadow',
    ];
    for (const p of props) dst.style[p] = cs[p];
    dst.style.margin = '0';
    dst.style.whiteSpace = 'nowrap';
    // Copy direct child typography (e.g., <small>%</small>)
    const srcKids = src.children, dstKids = dst.children;
    for (let i = 0; i < Math.min(srcKids.length, dstKids.length); i++) {
      const kcs = getComputedStyle(srcKids[i]);
      dstKids[i].style.fontFamily = kcs.fontFamily;
      dstKids[i].style.fontSize = kcs.fontSize;
      dstKids[i].style.fontWeight = kcs.fontWeight;
      dstKids[i].style.color = kcs.color;
      dstKids[i].style.marginLeft = kcs.marginLeft;
    }
  }

  function collectMorphPairs(prev, next) {
    if (!prev || !next || prev === next) return [];
    const fromMap = new Map();
    prev.querySelectorAll('[data-morph]').forEach(el => {
      const id = el.dataset.morph;
      if (id && !fromMap.has(id)) fromMap.set(id, { el, box: stageBox(el) });
    });
    if (!fromMap.size) return [];

    // Synchronously measure target rects before paint, then restore clean state
    const wasActive = next.classList.contains('active');
    if (!wasActive) { next.classList.add('active'); next.style.opacity = '0'; }
    const pairs = [];
    next.querySelectorAll('[data-morph]').forEach(toEl => {
      const id = toEl.dataset.morph;
      const from = fromMap.get(id);
      if (!from || from.box.w < 1 || from.box.h < 1) return;
      const toBox = stageBox(toEl);
      if (toBox.w < 1 || toBox.h < 1) return;
      pairs.push({ id, fromEl: from.el, toEl, a: from.box, b: toBox });
    });
    if (!wasActive) {
      next.classList.remove('active');
      next.style.opacity = '';
    }
    return pairs;
  }

  function runMagicMove(prev, next, pairs, token) {
    const cfg = slideMotion(next);
    const sp = springCurve(Math.max(0.48, cfg.response), 0, 28);
    const morphDur = Math.max(sp.dur, cfg.morphMs);
    const morphedIds = new Set(pairs.map(p => p.id));

    prev.style.opacity = '';
    prev.classList.remove('active');
    prev.classList.add('leaving');
    next.style.opacity = '';
    next.classList.add('active');

    // Pure opacity crossfade on page so it never competes with Magic Move (open-slide rule)
    const fadeAnim = trackAnim(next.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 280, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'backwards' }
    ));

    const cloneAnims = [];
    for (const { fromEl, toEl, a, b } of pairs) {
      const clone = fromEl.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      copyVisualStyle(fromEl, clone);

      const fromCS = getComputedStyle(fromEl);
      const toCS = getComputedStyle(toEl);
      const isTextOnly = fromCS.backgroundColor === 'rgba(0, 0, 0, 0)' || fromCS.backgroundColor === 'transparent';

      clone.style.position = 'absolute';
      clone.style.left = a.x + 'px';
      clone.style.top = a.y + 'px';
      clone.style.width = a.w + 'px';
      clone.style.height = a.h + 'px';
      clone.style.transformOrigin = '0 0';
      morphLayer.appendChild(clone);

      fromEl.style.visibility = 'hidden';
      toEl.style.visibility = 'hidden';
      hiddenMorphEls.add(fromEl);
      hiddenMorphEls.add(toEl);

      // Uniform vertical scale for bare text prevents glyph distortion; exact box scale for containers
      const sx = isTextOnly ? (b.h / a.h) : (b.w / a.w);
      const sy = b.h / a.h;
      const dx = isTextOnly ? ((b.x + b.w / 2) - (a.x + (a.w * sx) / 2)) : (b.x - a.x);
      const dy = b.y - a.y;

      const frames = sp.pts.map((p, i) => ({
        transform: 'translate3d(' + (dx * p).toFixed(2) + 'px,' + (dy * p).toFixed(2) + 'px,0) scale(' + (1 + (sx - 1) * p).toFixed(4) + ',' + (1 + (sy - 1) * p).toFixed(4) + ')',
        offset: i / (sp.pts.length - 1),
      }));
      const aMove = trackAnim(clone.animate(frames, { duration: morphDur, easing: 'linear', fill: 'forwards' }));
      cloneAnims.push(aMove.finished);

      if (fromCS.color !== toCS.color) {
        trackAnim(clone.animate([{ color: fromCS.color }, { color: toCS.color }], { duration: morphDur * 0.72, easing: 'ease-out', fill: 'forwards' }));
      }
      if (!isTextOnly && fromCS.backgroundColor !== toCS.backgroundColor) {
        trackAnim(clone.animate([{ backgroundColor: fromCS.backgroundColor }, { backgroundColor: toCS.backgroundColor }], { duration: morphDur * 0.72, easing: 'ease-out', fill: 'forwards' }));
      }
      // Smoothly transition child accent spans (e.g., <small>%</small>)
      for (let i = 0; i < clone.children.length; i++) {
        const fc = getComputedStyle(fromEl.children[i]).color;
        const tc = toEl.children[i] ? getComputedStyle(toEl.children[i]).color : toCS.color;
        if (fc !== tc) {
          trackAnim(clone.children[i].animate([{ color: fc }, { color: tc }], { duration: morphDur * 0.72, easing: 'ease-out', fill: 'forwards' }));
        }
      }
    }

    animateSlideContent(next, 110, token, morphedIds);

    Promise.all([fadeAnim.finished, ...cloneAnims]).then(() => {
      if (token !== navToken) return;
      morphLayer.innerHTML = '';
      for (const { fromEl, toEl } of pairs) {
        fromEl.style.visibility = '';
        toEl.style.visibility = '';
        hiddenMorphEls.delete(fromEl);
        hiddenMorphEls.delete(toEl);
      }
      prev.classList.remove('leaving', 'active');
    }, () => {});
  }

  // ---------------------------------------------------------------- flight cleanup (zero lockout!)
  function cleanupFlight(keepPrev, keepNext) {
    for (const a of activeAnims) { try { a.cancel(); } catch (_) {} }
    activeAnims.clear();
    for (const id of activeTimers) clearTimeout(id);
    activeTimers.clear();
    for (const id of activeRafs) cancelAnimationFrame(id);
    activeRafs.clear();
    morphLayer.innerHTML = '';
    for (const el of hiddenMorphEls) el.style.visibility = '';
    hiddenMorphEls.clear();
    if (curtain) curtain.style.opacity = '0';
    for (const sl of slides) {
      if (sl !== keepPrev && sl !== keepNext) {
        sl.classList.remove('active', 'leaving');
        sl.style.opacity = '';
        sl.style.transform = '';
      }
    }
  }

  function freezeNow() {
    navToken++;
    stopFx();
    cleanupFlight(null, slides[cur]);
    if (slides[cur]) {
      slides[cur].classList.add('active');
      slides[cur].style.opacity = '';
      slides[cur].style.transform = '';
      snapSlideFinal(slides[cur]);
    }
  }

  // ---------------------------------------------------------------- axis vector & navigation
  function axisDelta(dir) {
    if (M === 'vertical') return { x: 0, y: 90 * dir, scale: 1 };
    if (M === 'zoom-in') return { x: 0, y: 0, scale: dir > 0 ? 0.94 : 1.07 };
    if (M === 'zoom-out') return { x: 0, y: 0, scale: dir > 0 ? 1.07 : 0.94 };
    return { x: 140 * dir, y: 0, scale: 1 };
  }

  function go(n, instant) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur && !instant) return;
    const prev = cur >= 0 ? slides[cur] : null;
    const prevIdx = cur;
    const next = slides[n];
    const dir = prev ? (n > prevIdx ? 1 : -1) : 1;

    // Immediate logical state commit -> rapid key presses NEVER lock out!
    const token = ++navToken;
    cur = n;

    // Detect Magic Move BEFORE clearing prev visibility (unless instant/static)
    const instantly = Boolean(instant || isStatic() || !prev || prev === next);
    const morphPairs = (!instantly && next.dataset.kind !== 'shock') ? collectMorphPairs(prev, next) : [];

    stopFx();
    cleanupFlight(instantly ? null : prev, next);

    if (prev && prev !== next) {
      stage.dispatchEvent(new CustomEvent('deck:slideleave', { detail: { index: prevIdx, slide: prev, next } }));
    }

    setNav(next);
    showNotes(next);
    try { history.replaceState(null, '', '#' + (n + 1)); } catch (_) {}

    if (instantly) {
      stage.classList.add('no-trans');
      if (prev && prev !== next) prev.classList.remove('active', 'leaving');
      next.classList.add('active');
      next.style.opacity = '';
      next.style.transform = '';
      snapSlideFinal(next);
      stage.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('no-trans')));
      if (!isStatic()) startFx(next);
    } else if (morphPairs.length) {
      runMagicMove(prev, next, morphPairs, token);
      startFx(next);
    } else if (next.dataset.kind === 'shock' && dir > 0 && curtain) {
      stage.classList.add('hide-nav');
      prev.classList.remove('active');
      prev.classList.add('leaving');
      const cIn = trackAnim(curtain.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, fill: 'forwards' }));
      cIn.finished.then(() => {
        if (token !== navToken) return;
        prev.classList.remove('leaving', 'active');
        next.classList.add('active');
        later(() => {
          if (token !== navToken) return;
          const cOut = trackAnim(curtain.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 340, fill: 'forwards' }));
          cOut.finished.then(() => { if (token === navToken) { curtain.style.opacity = '0'; cOut.cancel(); } }, () => {});
          const st = next.querySelector('.shock-text, [data-role="shock"], h1');
          if (st) {
            trackAnim(st.animate(
              [{ opacity: 0, transform: 'translate3d(0,22px,0)', filter: 'blur(5px)' }, { opacity: 1, transform: 'none', filter: 'none' }],
              { duration: 920, delay: 140, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
            ));
          }
          animateSlideContent(next, 240, token, null);
          startFx(next);
        }, 380);
      }, () => {});
    } else {
      const cfg = slideMotion(next);
      const chapterChange = prev && (
        next.dataset.kind === 'toc' || prev.dataset.kind === 'toc' ||
        (next.dataset.chi !== prev.dataset.chi && Number(next.dataset.chi) >= 0 && Number(prev.dataset.chi) >= 0)
      );

      // Hold outgoing opacity:1 underneath so stage background NEVER flashes (open-slide MIT)
      prev.style.opacity = '';
      prev.classList.remove('active');
      prev.classList.add('leaving');
      next.style.opacity = '';
      next.classList.add('active');

      let enterAnim;
      if (chapterChange) {
        const d = axisDelta(dir);
        if (cfg.mode === 'stepped') {
          enterAnim = trackAnim(next.animate(
            [{ opacity: 0, transform: 'translate3d(' + d.x + 'px,' + d.y + 'px,0)' }, { opacity: 1, transform: 'none' }],
            { duration: 420, easing: 'steps(' + cfg.steps + ', end)' }
          ));
        } else if (cfg.mode === 'spring') {
          const sp = springCurve(cfg.response, cfg.bounce, 26);
          const frames = sp.pts.map((p, i) => ({
            opacity: Math.min(1, p * 2.1),
            transform: 'translate3d(' + ((1 - p) * d.x).toFixed(2) + 'px,' + ((1 - p) * d.y).toFixed(2) + 'px,0) scale(' + (d.scale + (1 - d.scale) * p).toFixed(4) + ')',
            offset: i / (sp.pts.length - 1),
          }));
          enterAnim = trackAnim(next.animate(frames, { duration: sp.dur, easing: 'linear' }));
        } else {
          enterAnim = trackAnim(next.animate(
            [{ opacity: 0, transform: 'translate3d(' + d.x + 'px,' + d.y + 'px,0) scale(' + d.scale + ')' }, { opacity: 1, transform: 'none' }],
            { duration: 540, easing: cfg.ease }
          ));
        }
        animateSlideContent(next, 90, token, null);
      } else {
        enterAnim = trackAnim(next.animate(
          [{ opacity: 0, transform: 'translate3d(0,10px,0)' }, { opacity: 1, transform: 'none' }],
          { duration: cfg.mode === 'stepped' ? 300 : 320, easing: cfg.mode === 'stepped' ? 'steps(' + cfg.steps + ', end)' : cfg.ease }
        ));
        animateSlideContent(next, 40, token, null);
      }

      startFx(next);
      enterAnim.finished.then(() => {
        if (token !== navToken) return;
        prev.classList.remove('leaving', 'active');
        next.style.opacity = '';
        next.style.transform = '';
      }, () => {});
    }

    if (typeof window.__deckFit === 'function') window.__deckFit();
    const detail = { index: cur, slide: next, prev, instant: instantly, staticMode: isStatic() };
    stage.dispatchEvent(new CustomEvent('deck:slideenter', { detail }));
    stage.dispatchEvent(new CustomEvent('deck:slidechange', { detail }));
  }

  function step(d) {
    if (isApp(cur)) { back(); return; }
    let n = cur + d;
    while (n >= 0 && n < slides.length && isApp(n)) n += d;
    if (n >= 0 && n < slides.length) go(n);
  }

  function openLink(id) {
    const n = slides.findIndex(s => s.dataset.appendix === '1' && s.dataset.id === id);
    if (n < 0) return;
    if (!isApp(cur)) returnTo.push(cur);
    go(n);
  }

  function back() {
    const n = returnTo.length ? returnTo.pop() : 0;
    go(n);
  }

  function toggleLowPower(force) {
    lowPower = typeof force === 'boolean' ? force : !lowPower;
    document.body.classList.toggle('low-power', lowPower);
    if (lowPower) {
      freezeNow();
      toast('已切換靜態省電模式（按 B 恢復動態）');
    } else {
      startFx(slides[cur]);
      toast('已恢復動態播放');
    }
    stage.dispatchEvent(new CustomEvent('deck:lowpower', { detail: { lowPower } }));
    return lowPower;
  }

  function setStill(flag) {
    stillMode = Boolean(flag);
    document.documentElement.classList.toggle('still', stillMode);
    if (stillMode) freezeNow();
    else startFx(slides[cur]);
    stage.dispatchEvent(new CustomEvent('deck:still', { detail: { still: stillMode } }));
  }

  // ---------------------------------------------------------------- input handling (isolated from live controls)
  const INTERACTIVE_SEL = '.live-ctrl, [data-interactive], input, select, textarea, label, #notes, a, button:not(.back):not([data-link])';

  addEventListener('keydown', e => {
    const k = e.key;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      if (k === 'Escape') document.activeElement.blur();
      return;
    }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); step(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); step(-1); }
    else if (k === 'Escape' && isApp(cur)) { e.preventDefault(); back(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (k === 'b' || k === 'B') { e.preventDefault(); toggleLowPower(); }
    else if (k === 'f' || k === 'F') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
    }
    else if ((k === 'n' || k === 'N') && notesEl) notesEl.classList.toggle('show');
    else if (k === 'p' || k === 'P') print();
  });

  addEventListener('click', e => {
    if (e.target.closest(INTERACTIVE_SEL)) return;
    const b = e.target.closest('.back');
    if (b) { back(); return; }
    const l = e.target.closest('[data-link]');
    if (l) { openLink(l.dataset.link); return; }
    step(e.clientX > innerWidth / 3 ? 1 : -1);
  });

  const start = parseInt((location.hash || '#1').slice(1), 10) || 1;
  go(start - 1, true);
  if (stillMode) {
    stage.dispatchEvent(new CustomEvent('deck:still', { detail: { still: true } }));
  } else if (slides[cur]) {
    animateSlideContent(slides[cur], 120, navToken, null);
  }

  window.__deck = {
    go: (n, instant = true) => go(n, instant),
    step,
    openLink,
    back,
    setStill,
    toggleLowPower,
    isStatic,
    stage,
    count: slides.length,
    get index() { return cur; },
    get slides() { return slides; },
    get lowPower() { return lowPower; },
  };
})();
