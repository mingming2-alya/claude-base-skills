/* deck-architect v4.3 Thin Shell Runtime (Phase B.3 — 60fps GPU Core + Visual Guidance Spec)
 *
 * Zero external dependencies (~11 KB gzip), 100% offline single-file HTML playback:
 *  - Silky 60/120fps compositor-only WAAPI transitions (zero JS keyframe bloat, zero lockout)
 *  - 6 narrative transition archetypes (data-transition="push|zoom-rise|iris|shock|morph|sheet-up|modal")
 *    with automatic directional reversal on backward navigation
 *  - Multi-element Keynote Magic Move ([data-morph="id"], MIT open-slide) with zero layout thrash
 *  - Phase B.3 Visual Guidance Choreography (preserves single-click/key slide navigation unchanged):
 *      [data-focus-plan] + [data-focus] 3-tier spotlight + context dimming (auto-clears to 100%)
 *      [data-transform-at] live causal state flip (.pre-transform -> final state)
 *      [data-draw] true SVG pathLength="1" directional stroke draw & progress rings (MIT visual-explainer)
 *      [data-wipe="right|left|down|up"] pure GPU clip-path directional reveal (dashed pins, rails, slashes)
 *      [data-pop] crisp endpoint dot/arrowhead bloom synced to connector arrival
 *      [data-ripple] single target-lock concentric ring over physical anchors
 *      [data-travel="x|y"] chronological rail travel bead (pure GPU translate3d)
 *      [data-nudge="x|y"] subtle interactive slider affordance cue
 *      [data-spotlight] mobile-visible high-contrast focus ring
 *      [data-beat] / [data-grow] / [data-count] / [data-stagger]
 *  - Deferred 480x270 Canvas 2D ambient FX lifecycle ([data-fx]; MIT lewislulu/html-ppt-skill)
 *  - Native mobile touch swipe + interactive live-figure isolation (.live-ctrl / [data-interactive])
 *  - Dual static freeze (?still=1, B low-power toggle, prefers-reduced-motion, @media print)
 *  - Flagship plugin lifecycle events: deck:slideenter, deck:slideleave, deck:still, deck:lowpower
 */
(function () {
  const stage = document.getElementById('stage');
  const viewportEl = document.getElementById('viewport');
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

  // Apple critically damped & expo-out compositor curves (2-keyframe GPU-only -> locked 60/120fps)
  const EASE_SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const EASE_CRISP = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const EASE_CINEMA = 'cubic-bezier(0.32, 0.72, 0, 1)'; // Apple iOS/Keynote sheet curve!

  let cur = -1;
  let navToken = 0;
  let toastTimer = null;
  const returnTo = [];
  const activeAnims = new Set();
  const activeTimers = new Set();
  const activeRafs = new Set();
  const hiddenMorphEls = new Set();

  const isApp = i => slides[i] && slides[i].dataset.appendix === '1';

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
    const staggerBase = parseFloat(cs.getPropertyValue('--stagger-base')) || 46;
    const morphMs = parseFloat(cs.getPropertyValue('--morph-ms')) || 680;
    const ease = mode === 'crisp' ? EASE_CRISP : EASE_SPRING;
    return { mode, staggerBase, morphMs, ease };
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
      if (tn && el.dataset.countFinal === undefined) el.dataset.countFinal = tn.nodeValue;
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
        if (da && da !== '1') el.dataset.drawDashed = '1';
        else el.setAttribute('pathLength', '1');
      }
    });
  }
  initPrimitives();

  function clearFocusClasses(sl) {
    if (!sl) return;
    sl.classList.remove('is-focusing');
    sl.querySelectorAll('[data-focus]').forEach(el => {
      el.classList.remove('focus-dim', 'focus-active', 'focus-visited');
    });
  }

  function clearGuidanceState(sl) {
    if (!sl) return;
    clearFocusClasses(sl);
    sl.querySelectorAll('[data-transform-at]').forEach(el => {
      el.classList.remove('pre-transform', 'transforming');
    });
    sl.querySelectorAll('.spot-pulse').forEach(el => el.classList.remove('spot-pulse'));
  }

  function snapSlideFinal(sl) {
    if (!sl) return;
    clearGuidanceState(sl);
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

  function parseFocusPlan(raw) {
    if (!raw) return [];
    const out = [];
    for (const part of raw.split(',')) {
      const m = part.trim().match(/^([^\s@]+)@(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
      if (m) out.push({ id: m[1], start: parseFloat(m[2]), end: parseFloat(m[3]) });
    }
    return out.sort((a, b) => a.start - b.start);
  }

  // Semantic beat delay helper: Beat 1 = immediate anchor, Beat 2 = causal visual cue, Beat 3 = takeaway, Beat 4 = supporting
  const BEAT_MS = { '1': 60, '2': 420, '3': 840, '4': 1260 };
  function beatDelay(el, fallback) {
    if (el.dataset.delay !== undefined) return parseFloat(el.dataset.delay) || 0;
    const b = el.dataset.beat;
    if (b && BEAT_MS[b] !== undefined) return BEAT_MS[b];
    return fallback;
  }

  function animateSlideContent(sl, baseDelay, token, morphedIds) {
    if (!sl || isStatic()) { snapSlideFinal(sl); return; }
    const cfg = slideMotion(sl);

    // 0a. 3-tier Spotlight + Context Dimming Choreographer ([data-focus-plan] + [data-focus])
    const focusPlan = parseFocusPlan(sl.dataset.focusPlan || '');
    const focusEls = focusPlan.length ? [...sl.querySelectorAll('[data-focus]')] : [];
    if (focusPlan.length && focusEls.length) {
      const visited = new Set();
      const applyStage = activeId => {
        if (token !== navToken || isStatic()) return;
        sl.classList.add('is-focusing');
        for (const el of focusEls) {
          const ids = (el.dataset.focus || '').split(/[\s,]+/).filter(Boolean);
          const isAct = ids.includes(activeId);
          const isVis = !isAct && ids.some(id => visited.has(id));
          el.classList.toggle('focus-active', isAct);
          el.classList.toggle('focus-visited', isVis);
          el.classList.toggle('focus-dim', !isAct && !isVis);
        }
      };
      let maxEnd = 0;
      focusPlan.forEach((step, idx) => {
        maxEnd = Math.max(maxEnd, step.end);
        const startAt = step.start === 0 ? 0 : baseDelay + step.start;
        if (startAt === 0 && idx === 0) {
          applyStage(step.id);
        } else {
          later(() => {
            if (token !== navToken || isStatic()) return;
            for (let k = 0; k < idx; k++) visited.add(focusPlan[k].id);
            applyStage(step.id);
          }, startAt);
        }
      });
      later(() => {
        if (token !== navToken) return;
        clearFocusClasses(sl);
      }, baseDelay + maxEnd);
    }

    // 0b. Live Causal State Transformation ([data-transform-at="ms"]: .pre-transform -> final DOM state)
    sl.querySelectorAll('[data-transform-at]').forEach(el => {
      const ms = parseFloat(el.dataset.transformAt) || 720;
      el.classList.remove('transforming');
      el.classList.add('pre-transform');
      later(() => {
        if (token !== navToken || isStatic()) { el.classList.remove('pre-transform', 'transforming'); return; }
        el.classList.remove('pre-transform');
        el.classList.add('transforming');
        later(() => { el.classList.remove('transforming'); }, 760);
      }, baseDelay + ms);
    });

    // 1. Non-uniform staggered groups ([data-stagger]) — lightweight 2-keyframe compositor only
    const staggeredSet = new Set();
    sl.querySelectorAll('[data-stagger]').forEach(group => {
      const stepMs = parseFloat(group.getAttribute('data-stagger')) || cfg.staggerBase;
      const gDelay = baseDelay + beatDelay(group, 100);
      const items = [...group.children].filter(el => el.nodeType === 1);
      items.forEach((el, i) => {
        staggeredSet.add(el);
        if (morphedIds && el.dataset.morph && morphedIds.has(el.dataset.morph)) return;
        const d = gDelay + Math.round(stepMs * Math.pow(i, 0.78));
        trackAnim(el.animate(
          [{ opacity: 0, transform: 'translate3d(0,14px,0)' }, { opacity: 1, transform: 'none' }],
          { duration: 420, delay: d, easing: cfg.ease, fill: 'backwards' }
        ));
      });
    });

    // 2. Semantic directional reveals (.rv, [data-beat]) — strictly skip nested, specialized & morphed
    let rvIdx = 0;
    sl.querySelectorAll('.rv, [data-beat]').forEach(el => {
      if (staggeredSet.has(el)) return;
      if (
        el.hasAttribute('data-stagger') || el.hasAttribute('data-grow') || el.hasAttribute('data-draw') ||
        el.hasAttribute('data-wipe') || el.hasAttribute('data-pop') || el.hasAttribute('data-ripple') ||
        el.hasAttribute('data-travel') || el.hasAttribute('data-nudge')
      ) return;
      if (el.parentElement && el.parentElement.closest('.rv, [data-stagger]')) return;
      if (morphedIds && el.dataset.morph && morphedIds.has(el.dataset.morph)) return;
      const d = baseDelay + beatDelay(el, Math.round(cfg.staggerBase * Math.pow(rvIdx++, 0.82)));
      const dir = el.dataset.from || 'up';
      const fromT = dir === 'left' ? 'translate3d(-24px,0,0)'
        : dir === 'right' ? 'translate3d(24px,0,0)'
        : dir === 'down' ? 'translate3d(0,-18px,0)'
        : dir === 'none' ? 'none'
        : 'translate3d(0,18px,0)';
      trackAnim(el.animate(
        [{ opacity: 0, transform: fromT }, { opacity: 1, transform: 'none' }],
        { duration: 460, delay: d, easing: cfg.ease, fill: 'backwards' }
      ));
    });

    // 3. Mobile-visible high-contrast spotlight cues ([data-spotlight])
    sl.querySelectorAll('[data-spotlight]').forEach(el => {
      el.classList.remove('spot-pulse');
      const d = baseDelay + beatDelay(el, 380);
      later(() => {
        if (token !== navToken || isStatic()) return;
        el.classList.add('spot-pulse');
        later(() => el.classList.remove('spot-pulse'), 1020);
      }, d);
    });

    // 4. Throttled rolling numbers ([data-count]) — updates at ~30Hz AFTER transition starts to avoid layout thrash
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
      const dur = parseFloat(el.dataset.dur) || 580;
      const delay = baseDelay + beatDelay(el, 220);
      const fmt = v => {
        let s = dec > 0 ? v.toFixed(dec) : String(Math.round(v));
        if (hasComma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return pre + s + post;
      };
      tn.nodeValue = fmt(0);
      const startAt = performance.now() + delay;
      let lastPaint = 0;
      const tick = now => {
        activeRafs.delete(id);
        if (token !== navToken || isStatic()) { tn.nodeValue = finalStr; return; }
        if (now < startAt) { id = requestAnimationFrame(tick); activeRafs.add(id); return; }
        const p = Math.min(1, (now - startAt) / dur);
        if (p >= 1) { tn.nodeValue = finalStr; return; }
        if (now - lastPaint >= 30) {
          lastPaint = now;
          const eased = 1 - Math.pow(2, -9 * p);
          tn.nodeValue = fmt(target * eased);
        }
        id = requestAnimationFrame(tick);
        activeRafs.add(id);
      };
      let id = requestAnimationFrame(tick);
      activeRafs.add(id);
    });

    // 5. True SVG stroke draw & progress rings ([data-draw])
    sl.querySelectorAll('[data-draw]').forEach(el => {
      const delay = baseDelay + beatDelay(el, 220);
      const dur = parseFloat(el.dataset.dur) || 720;
      if (el.getAttribute('data-draw') === 'ring') {
        const circ = parseFloat(el.dataset.circ || '0');
        const fin = parseFloat(el.dataset.ringFinal || '0');
        if (!circ) return;
        trackAnim(el.animate(
          [{ strokeDashoffset: circ }, { strokeDashoffset: fin }],
          { duration: dur, delay, easing: EASE_CRISP, fill: 'backwards' }
        ));
      } else if (el.dataset.drawDashed) {
        trackAnim(el.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: Math.min(380, dur), delay, easing: EASE_CRISP, fill: 'backwards' }
        ));
      } else {
        el.style.strokeDasharray = '1';
        const anim = trackAnim(el.animate(
          [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
          { duration: dur, delay, easing: EASE_SPRING, fill: 'backwards' }
        ));
        anim.finished.then(() => {
          if (token === navToken) { el.style.strokeDasharray = ''; el.style.strokeDashoffset = ''; }
        }, () => {});
      }
    });

    // 6. Directional bar growth ([data-grow="x|x-left|y|y-down"])
    sl.querySelectorAll('[data-grow]').forEach((el, idx) => {
      const dir = (el.getAttribute('data-grow') || 'x').toLowerCase();
      const delay = baseDelay + beatDelay(el, 160 + idx * 45);
      const dur = parseFloat(el.dataset.dur) || 560;
      if (el instanceof SVGElement) el.style.transformBox = 'fill-box';
      if (dir === 'x-left') {
        el.style.transformOrigin = 'right center';
        trackAnim(el.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: dur, delay, easing: EASE_CRISP, fill: 'backwards' }));
      } else if (dir === 'y') {
        el.style.transformOrigin = 'center bottom';
        trackAnim(el.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: dur, delay, easing: EASE_CRISP, fill: 'backwards' }));
      } else if (dir === 'y-down') {
        el.style.transformOrigin = 'center top';
        trackAnim(el.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: dur, delay, easing: EASE_CRISP, fill: 'backwards' }));
      } else {
        el.style.transformOrigin = 'left center';
        trackAnim(el.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: dur, delay, easing: EASE_CRISP, fill: 'backwards' }));
      }
    });

    // 7. Directional GPU clip-path wipe ([data-wipe="right|left|down|up"]) — zero dash distortion!
    sl.querySelectorAll('[data-wipe]').forEach(el => {
      const dir = (el.getAttribute('data-wipe') || 'right').toLowerCase();
      const delay = baseDelay + beatDelay(el, 220);
      const dur = parseFloat(el.dataset.dur) || 440;
      const fromClip = dir === 'left' ? 'inset(0 0 0 100%)'
        : dir === 'down' ? 'inset(0 0 100% 0)'
        : dir === 'up' ? 'inset(100% 0 0 0)'
        : 'inset(0 100% 0 0)';
      trackAnim(el.animate(
        [{ clipPath: fromClip }, { clipPath: 'inset(0 0 0 0)' }],
        { duration: dur, delay, easing: EASE_CRISP, fill: 'backwards' }
      ));
    });

    // 8. Endpoint dot / arrowhead / badge crisp pop ([data-pop])
    sl.querySelectorAll('[data-pop]').forEach(el => {
      const delay = baseDelay + beatDelay(el, 260);
      const dur = parseFloat(el.dataset.dur) || 260;
      if (el instanceof SVGElement) {
        el.style.transformBox = 'fill-box';
        el.style.transformOrigin = 'center center';
      }
      trackAnim(el.animate(
        [{ opacity: 0, transform: 'scale(0.22)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: dur, delay, easing: 'cubic-bezier(0.22, 1.28, 0.36, 1)', fill: 'backwards' }
      ));
    });

    // 9. Target-lock concentric ripple ([data-ripple])
    sl.querySelectorAll('[data-ripple]').forEach(el => {
      const delay = baseDelay + beatDelay(el, 480);
      const dur = parseFloat(el.dataset.dur) || 820;
      trackAnim(el.animate(
        [
          { opacity: 0, transform: 'scale(0.35)' },
          { opacity: 0.92, transform: 'scale(0.88)', offset: 0.16 },
          { opacity: 0, transform: 'scale(2.85)' },
        ],
        { duration: dur, delay, easing: EASE_SPRING, fill: 'both' }
      ));
    });

    // 10. Chronological rail travel bead ([data-travel="x|y"])
    sl.querySelectorAll('[data-travel]').forEach(el => {
      const axis = (el.getAttribute('data-travel') || 'x').toLowerCase();
      const dist = parseFloat(el.dataset.travelDist || '800');
      const delay = baseDelay + beatDelay(el, 280);
      const dur = parseFloat(el.dataset.dur) || 1200;
      const p0 = 'translate3d(0,0,0)';
      const p1 = axis === 'y'
        ? 'translate3d(0,' + (dist * 0.05).toFixed(1) + 'px,0)'
        : 'translate3d(' + (dist * 0.05).toFixed(1) + 'px,0,0)';
      const p2 = axis === 'y'
        ? 'translate3d(0,' + dist + 'px,0)'
        : 'translate3d(' + dist + 'px,0,0)';
      trackAnim(el.animate(
        [
          { opacity: 0, transform: p0 + ' scale(0.5)' },
          { opacity: 1, transform: p1 + ' scale(1)', offset: 0.06 },
          { opacity: 1, transform: p2 + ' scale(1)', offset: 0.92 },
          { opacity: 0, transform: p2 + ' scale(0.55)' },
        ],
        { duration: dur, delay, easing: 'cubic-bezier(0.28, 0.08, 0.28, 1)', fill: 'both' }
      ));
    });

    // 11. Single subtle interactive control affordance nudge ([data-nudge="x|y"])
    sl.querySelectorAll('[data-nudge]').forEach(el => {
      const axis = (el.getAttribute('data-nudge') || 'x').toLowerCase();
      const delay = baseDelay + beatDelay(el, 700);
      const dur = parseFloat(el.dataset.dur) || 740;
      const frames = axis === 'y'
        ? [
            { transform: 'translate3d(0,0,0)' },
            { transform: 'translate3d(0,8px,0)', offset: 0.35 },
            { transform: 'translate3d(0,-3px,0)', offset: 0.72 },
            { transform: 'translate3d(0,0,0)' },
          ]
        : [
            { transform: 'translate3d(0,0,0)' },
            { transform: 'translate3d(14px,0,0)', offset: 0.35 },
            { transform: 'translate3d(-5px,0,0)', offset: 0.72 },
            { transform: 'translate3d(0,0,0)' },
          ];
      trackAnim(el.animate(frames, { duration: dur, delay, easing: EASE_SPRING, fill: 'none' }));
    });
  }

  // ---------------------------------------------------------------- deferred low-res Canvas 2D FX (MIT lewislulu)
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

  function startFx(sl, deferMs, token) {
    stopFx();
    if (!sl || isStatic()) return;
    const fx = sl.dataset.fx;
    if (!fx) return;

    const boot = () => {
      if (token !== navToken || isStatic() || slides[cur] !== sl) return;
      let canvas = sl.querySelector(':scope > canvas.fx-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'fx-canvas';
        // 480x270 logical buffer stretched smoothly by GPU -> 16x cheaper than 1920x1080!
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

    if (deferMs > 0) later(boot, deferMs);
    else boot();
  }

  // ---------------------------------------------------------------- cross-slide Magic Move (MIT open-slide)
  function stageBox(el, sr, s) {
    const r = el.getBoundingClientRect();
    return { x: (r.left - sr.left) / s, y: (r.top - sr.top) / s, w: r.width / s, h: r.height / s };
  }

  function copyVisualStyle(src, dst) {
    const cs = getComputedStyle(src);
    const props = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariantNumeric',
      'letterSpacing', 'lineHeight', 'textAlign', 'color', 'backgroundColor',
      'borderRadius', 'border', 'padding', 'display', 'alignItems',
      'justifyContent', 'gap',
    ];
    for (const p of props) dst.style[p] = cs[p];
    dst.style.margin = '0';
    dst.style.whiteSpace = 'nowrap';
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
    const sr = stage.getBoundingClientRect();
    const s = sr.width ? sr.width / 1920 : 1;
    const fromMap = new Map();
    prev.querySelectorAll('[data-morph]').forEach(el => {
      const id = el.dataset.morph;
      if (id && !fromMap.has(id)) {
        const box = stageBox(el, sr, s);
        if (box.w >= 1 && box.h >= 1) fromMap.set(id, { el, box });
      }
    });
    if (!fromMap.size) return [];

    // Single synchronous measurement pass (no double toggle)
    const wasActive = next.classList.contains('active');
    if (!wasActive) { next.classList.add('active'); next.style.opacity = '0'; }
    const pairs = [];
    next.querySelectorAll('[data-morph]').forEach(toEl => {
      const id = toEl.dataset.morph;
      const from = fromMap.get(id);
      if (!from) return;
      const toBox = stageBox(toEl, sr, s);
      if (toBox.w < 1 || toBox.h < 1) return;
      pairs.push({ id, fromEl: from.el, toEl, a: from.box, b: toBox });
    });
    if (!wasActive) {
      next.classList.remove('active');
      next.style.opacity = '';
    }
    return pairs;
  }

  function launchMorphClones(pairs, morphDur) {
    const anims = [];
    for (const { fromEl, toEl, a, b } of pairs) {
      const clone = fromEl.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      copyVisualStyle(fromEl, clone);

      const fromCS = getComputedStyle(fromEl);
      const toCS = getComputedStyle(toEl);
      const isTextOnly = fromCS.backgroundColor === 'rgba(0, 0, 0, 0)' || fromCS.backgroundColor === 'transparent';

      // Handle gradient-clipped hero text (e.g., Shock +1.8% -> Simulator +1.8%) cleanly
      const fromClip = fromCS.webkitBackgroundClip || fromCS.backgroundClip || '';
      const fromGrad = fromClip.includes('text') && (fromCS.backgroundImage || '').includes('gradient');
      if (fromGrad) {
        clone.style.color = toCS.color;
        clone.style.webkitTextFillColor = toCS.color;
        clone.style.background = 'none';
      }

      clone.style.position = 'absolute';
      clone.style.left = a.x + 'px';
      clone.style.top = a.y + 'px';
      clone.style.width = a.w + 'px';
      clone.style.height = a.h + 'px';
      clone.style.transformOrigin = '0 0';
      clone.style.willChange = 'transform';
      morphLayer.appendChild(clone);

      fromEl.style.visibility = 'hidden';
      toEl.style.visibility = 'hidden';
      hiddenMorphEls.add(fromEl);
      hiddenMorphEls.add(toEl);

      const sx = isTextOnly ? (b.h / a.h) : (b.w / a.w);
      const sy = b.h / a.h;
      const dx = isTextOnly ? ((b.x + b.w / 2) - (a.x + (a.w * sx) / 2)) : (b.x - a.x);
      const dy = b.y - a.y;

      const aMove = trackAnim(clone.animate(
        [
          { transform: 'translate3d(0,0,0) scale(1,1)' },
          { transform: 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')' },
        ],
        { duration: morphDur, easing: EASE_CINEMA, fill: 'forwards' }
      ));
      anims.push(aMove.finished);

      if (!fromGrad && fromCS.color !== toCS.color) {
        trackAnim(clone.animate([{ color: fromCS.color }, { color: toCS.color }], { duration: morphDur * 0.7, easing: 'ease-out', fill: 'forwards' }));
      }
      if (!isTextOnly && fromCS.backgroundColor !== toCS.backgroundColor) {
        trackAnim(clone.animate([{ backgroundColor: fromCS.backgroundColor }, { backgroundColor: toCS.backgroundColor }], { duration: morphDur * 0.7, easing: 'ease-out', fill: 'forwards' }));
      }
      for (let i = 0; i < clone.children.length; i++) {
        const fc = getComputedStyle(fromEl.children[i]).color;
        const tc = toEl.children[i] ? getComputedStyle(toEl.children[i]).color : toCS.color;
        if (fc !== tc) {
          trackAnim(clone.children[i].animate([{ color: fc }, { color: tc }], { duration: morphDur * 0.7, easing: 'ease-out', fill: 'forwards' }));
        }
      }
    }
    return anims;
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
      sl.classList.remove('in-flight');
      sl.style.zIndex = '';
      if (sl !== keepPrev) clearGuidanceState(sl);
      if (sl !== keepPrev && sl !== keepNext) {
        sl.classList.remove('active', 'leaving');
        sl.style.opacity = '';
        sl.style.transform = '';
        sl.style.clipPath = '';
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
      slides[cur].style.clipPath = '';
      snapSlideFinal(slides[cur]);
    }
  }

  // ---------------------------------------------------------------- 6 narrative transition archetypes (60fps GPU)
  function resolveTransition(prev, next, dir, morphPairs) {
    if (next.dataset.appendix === '1' || (prev && prev.dataset.appendix === '1')) return 'modal';
    if (next.dataset.kind === 'shock' && dir > 0 && curtain) return 'shock';
    // Forward uses next's declared transition; backward mirrors prev's declared transition!
    const declared = dir > 0 ? (next.dataset.transition || '') : (prev && prev.dataset.transition || '');
    if (declared) return declared;
    if (morphPairs.length) return 'morph';
    const chChange = prev && (
      next.dataset.kind === 'toc' || prev.dataset.kind === 'toc' ||
      (next.dataset.chi !== prev.dataset.chi && Number(next.dataset.chi) >= 0 && Number(prev.dataset.chi) >= 0)
    );
    return chChange ? 'push' : 'cross';
  }

  function go(n, instant) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur && !instant) return;
    const prev = cur >= 0 ? slides[cur] : null;
    const prevIdx = cur;
    const next = slides[n];
    const dir = prev ? (n > prevIdx ? 1 : -1) : 1;

    const token = ++navToken;
    cur = n;

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
      next.style.clipPath = '';
      snapSlideFinal(next);
      stage.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('no-trans')));
      if (!isStatic()) startFx(next, 180, token);
    } else {
      const kind = resolveTransition(prev, next, dir, morphPairs);
      const cfg = slideMotion(next);
      const morphedIds = new Set(morphPairs.map(p => p.id));

      prev.style.opacity = '';
      prev.style.transform = '';
      prev.style.clipPath = '';
      next.style.opacity = '';
      next.style.transform = '';
      next.style.clipPath = '';

      if (kind === 'shock' && curtain) {
        stage.classList.add('hide-nav');
        prev.classList.remove('active');
        prev.classList.add('leaving');
        const cIn = trackAnim(curtain.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: 'forwards' }));
        cIn.finished.then(() => {
          if (token !== navToken) return;
          prev.classList.remove('leaving', 'active');
          clearGuidanceState(prev);
          next.classList.add('active');
          later(() => {
            if (token !== navToken) return;
            const cOut = trackAnim(curtain.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: 'forwards' }));
            cOut.finished.then(() => { if (token === navToken) { curtain.style.opacity = '0'; cOut.cancel(); } }, () => {});
            const st = next.querySelector('.shock-text, [data-role="shock"], h1');
            if (st) {
              trackAnim(st.animate(
                [{ opacity: 0, transform: 'translate3d(0,26px,0) scale(0.97)' }, { opacity: 1, transform: 'none' }],
                { duration: 680, delay: 70, easing: EASE_SPRING, fill: 'backwards' }
              ));
            }
            animateSlideContent(next, 180, token, null);
            startFx(next, 520, token);
          }, 190);
        }, () => {});
      } else {
        // Hold outgoing slide opacity:1 underneath so background NEVER flashes
        prev.classList.remove('active');
        prev.classList.add('leaving', 'in-flight');
        next.classList.add('active', 'in-flight');

        const waits = [];
        let contentDelay = 120;

        if (kind === 'iris') {
          const origin = (dir > 0 ? next.dataset.irisOrigin : prev.dataset.irisOrigin) || '48% 72%';
          if (dir > 0) {
            const aIn = trackAnim(next.animate(
              [{ clipPath: 'circle(4% at ' + origin + ')' }, { clipPath: 'circle(145% at ' + origin + ')' }],
              { duration: 640, easing: EASE_CINEMA }
            ));
            waits.push(aIn.finished);
            if (morphPairs.length) waits.push(...launchMorphClones(morphPairs, 660));
            contentDelay = 240;
          } else {
            // Reverse iris: incoming dark tablet sits behind while warm clay contracts smoothly into the tablet!
            prev.style.zIndex = '5';
            next.style.zIndex = '4';
            const aOut = trackAnim(prev.animate(
              [{ clipPath: 'circle(145% at ' + origin + ')' }, { clipPath: 'circle(0% at ' + origin + ')' }],
              { duration: 540, easing: EASE_CINEMA, fill: 'forwards' }
            ));
            waits.push(aOut.finished);
            if (morphPairs.length) waits.push(...launchMorphClones(morphPairs, 580));
            contentDelay = 160;
          }
        } else if (kind === 'push') {
          const sx = dir > 0 ? '100%' : '-100%';
          const ox = dir > 0 ? '-14%' : '14%';
          const aOut = trackAnim(prev.animate(
            [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(' + ox + ',0,0)' }],
            { duration: 540, easing: EASE_CINEMA }
          ));
          const aIn = trackAnim(next.animate(
            [{ transform: 'translate3d(' + sx + ',0,0)' }, { transform: 'translate3d(0,0,0)' }],
            { duration: 540, easing: EASE_CINEMA }
          ));
          waits.push(aOut.finished, aIn.finished);
          if (morphPairs.length) waits.push(...launchMorphClones(morphPairs, 640));
          contentDelay = 200;
        } else if (kind === 'sheet-up') {
          if (dir > 0) {
            const aOut = trackAnim(prev.animate(
              [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.95)', opacity: 0.72 }],
              { duration: 560, easing: EASE_CINEMA }
            ));
            const aIn = trackAnim(next.animate(
              [{ transform: 'translate3d(0,100%,0)' }, { transform: 'translate3d(0,0,0)' }],
              { duration: 560, easing: EASE_CINEMA }
            ));
            waits.push(aOut.finished, aIn.finished);
          } else {
            prev.style.zIndex = '5';
            next.style.zIndex = '4';
            const aOut = trackAnim(prev.animate(
              [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(0,100%,0)' }],
              { duration: 480, easing: EASE_CINEMA, fill: 'forwards' }
            ));
            const aIn = trackAnim(next.animate(
              [{ transform: 'scale(0.95)', opacity: 0.75 }, { transform: 'scale(1)', opacity: 1 }],
              { duration: 480, easing: EASE_CINEMA }
            ));
            waits.push(aOut.finished, aIn.finished);
          }
          contentDelay = 210;
        } else if (kind === 'zoom-rise') {
          const aOut = trackAnim(prev.animate(
            [{ transform: 'scale(1)', opacity: 1 }, { transform: dir > 0 ? 'scale(0.94)' : 'scale(1.04)', opacity: 0.5 }],
            { duration: 460, easing: EASE_CINEMA }
          ));
          const aIn = trackAnim(next.animate(
            [{ opacity: 0, transform: dir > 0 ? 'translate3d(0,48px,0) scale(0.97)' : 'translate3d(0,-36px,0) scale(1.02)' }, { opacity: 1, transform: 'none' }],
            { duration: 520, easing: EASE_SPRING }
          ));
          waits.push(aOut.finished, aIn.finished);
          if (morphPairs.length) waits.push(...launchMorphClones(morphPairs, cfg.morphMs));
          contentDelay = 190;
        } else if (kind === 'modal') {
          const intoApp = next.dataset.appendix === '1';
          const aIn = trackAnim(next.animate(
            [{ opacity: 0, transform: intoApp ? 'scale(0.93)' : 'scale(1.04)' }, { opacity: 1, transform: 'none' }],
            { duration: 360, easing: EASE_SPRING }
          ));
          waits.push(aIn.finished);
          contentDelay = 90;
        } else if (kind === 'morph' && morphPairs.length) {
          const aIn = trackAnim(next.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 260, easing: 'ease-out', fill: 'backwards' }
          ));
          waits.push(aIn.finished, ...launchMorphClones(morphPairs, cfg.morphMs));
          contentDelay = 180;
        } else {
          const aIn = trackAnim(next.animate(
            [{ opacity: 0, transform: 'translate3d(0,12px,0)' }, { opacity: 1, transform: 'none' }],
            { duration: 320, easing: cfg.ease }
          ));
          waits.push(aIn.finished);
          contentDelay = 80;
        }

        animateSlideContent(next, contentDelay, token, morphedIds);
        startFx(next, 520, token);

        Promise.all(waits).then(() => {
          if (token !== navToken) return;
          morphLayer.innerHTML = '';
          for (const { fromEl, toEl } of morphPairs) {
            fromEl.style.visibility = '';
            toEl.style.visibility = '';
            hiddenMorphEls.delete(fromEl);
            hiddenMorphEls.delete(toEl);
          }
          prev.classList.remove('leaving', 'active', 'in-flight');
          prev.style.zIndex = '';
          prev.style.clipPath = '';
          clearGuidanceState(prev);
          next.classList.remove('in-flight');
          next.style.zIndex = '';
          next.style.clipPath = '';
        }, () => {});
      }
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
      startFx(slides[cur], 120, navToken);
      toast('已恢復動態播放');
    }
    stage.dispatchEvent(new CustomEvent('deck:lowpower', { detail: { lowPower } }));
    return lowPower;
  }

  function setStill(flag) {
    stillMode = Boolean(flag);
    document.documentElement.classList.toggle('still', stillMode);
    if (stillMode) freezeNow();
    else startFx(slides[cur], 120, navToken);
    stage.dispatchEvent(new CustomEvent('deck:still', { detail: { still: stillMode } }));
  }

  // ---------------------------------------------------------------- input handling (keyboard + click + mobile swipe)
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

  const clickTarget = viewportEl || window;
  clickTarget.addEventListener('click', e => {
    if (e.target.closest(INTERACTIVE_SEL)) return;
    const b = e.target.closest('.back');
    if (b) { back(); return; }
    const l = e.target.closest('[data-link]');
    if (l) { openLink(l.dataset.link); return; }
    const vr = viewportEl ? viewportEl.getBoundingClientRect() : { left: 0, width: innerWidth };
    step((e.clientX - vr.left) > vr.width / 3 ? 1 : -1);
  });

  if (viewportEl) {
    let tx = 0, ty = 0, swiping = false;
    viewportEl.addEventListener('touchstart', e => {
      if (e.touches.length !== 1 || e.target.closest(INTERACTIVE_SEL)) { swiping = false; return; }
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
      swiping = true;
    }, { passive: true });
    viewportEl.addEventListener('touchend', e => {
      if (!swiping || !e.changedTouches.length) return;
      swiping = false;
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  const start = parseInt((location.hash || '#1').slice(1), 10) || 1;
  go(start - 1, true);
  if (stillMode) stage.dispatchEvent(new CustomEvent('deck:still', { detail: { still: true } }));

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
