/* deck-architect v4.4 Thin Shell Runtime (Phase C.2 — Bipolar Surface, Multi-Mode Nav, Auto-Hide Bar, Dual-Track data-step)
 *
 * Zero external dependencies, 100% offline single-file HTML playback:
 *  - Per-slide polarity sync (data-surface="light|dark|split|photo" -> #stage[data-active-surface])
 *  - Navigation modes: top-bar | minimal-side (#nav-side) | divider-only, with per-slide data-nav overrides
 *  - Unified auto-hiding floating bottom control capsule (#ctrl-bar) + 2px progress bar (#deck-progress)
 *  - Dual-track pacing: default 0-step Visual Guidance Choreography + presenter-paced click steps
 *      (data-step / data-step-hide / data-step-only / data-step-from, deferred inner primitives,
 *       backward navigation lands on previous slide's final step, ?still=1 & print expand to final state)
 *  - 60fps compositor-only 6 narrative transitions + cross-slide Magic Move (data-morph)
 *  - Lifecycle event bus (#stage): deck:slideenter, deck:slideleave, deck:stepchange, deck:still, deck:lowpower
 *    (consumed by on-demand modules: ambient-fx, media, flow-carousel, coverflow)
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
  const noScaleMode = params.get('noscale') === '1';
  let lowPower = false;
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = reduceMQ.matches;
  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', e => { reduce = e.matches; if (reduce) freezeNow(); });

  if (stillMode) document.documentElement.classList.add('still');
  if (hideCtrlMode) document.documentElement.classList.add('hide-ctrl');
  if (noScaleMode) document.documentElement.classList.add('noscale');

  const isStatic = () => Boolean(stillMode || lowPower || reduce);
  const DECK = window.DECK || {};
  const M = DECK.motion || 'horizontal';
  const deckStageMode = DECK.stageMode || document.documentElement.dataset.stageMode || '';
  const deckNavMode = DECK.navMode || document.documentElement.dataset.navMode || (deckStageMode === 'keynote' ? 'divider-only' : 'top-bar');

  // Centralized overlay & Esc priority registry (Order-Within-Flexibility: zero shortcut clashes)
  const overlays = [];
  function registerOverlay(spec) {
    overlays.push(spec);
    overlays.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  function hasNavLock() {
    return overlays.some(o => o.lockNav && typeof o.isOpen === 'function' && o.isOpen());
  }
  function closeTopOverlay() {
    for (const o of overlays) {
      if (typeof o.isOpen === 'function' && o.isOpen()) {
        if (typeof o.close === 'function') o.close();
        return true;
      }
    }
    return false;
  }

  // Apple critically damped & expo-out compositor curves (2-keyframe GPU-only -> locked 60/120fps)
  const EASE_SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const EASE_CRISP = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const EASE_CINEMA = 'cubic-bezier(0.32, 0.72, 0, 1)';

  let cur = -1;
  let curStep = 0;
  let navToken = 0;
  let toastTimer = null;
  const returnTo = [];
  const activeAnims = new Set();
  const activeTimers = new Set();
  const activeRafs = new Set();
  const hiddenMorphEls = new Set();
  const stepAnims = new WeakMap();

  const isApp = i => slides[i] && slides[i].dataset.appendix === '1';
  const mainIndices = slides.map((_, i) => i).filter(i => !isApp(i));

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

  // ---------------------------------------------------------------- stage fit & navigation (top-bar / minimal-side / divider-only)
  document.querySelectorAll('[data-shape="rings"] .toc-list').forEach(ol => {
    const lis = [...ol.children], n = lis.length;
    const big = M === 'zoom-in';
    lis.forEach((li, i) => {
      const k = big ? i : n - 1 - i;
      li.style.setProperty('--r', 940 - k * (700 / Math.max(1, n - 1)));
    });
  });

  function fit() {
    if (noScaleMode) { stage.style.transform = 'none'; return; }
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fit);
  fit();

  const chapters = DECK.chapters || [];
  let labels = [], ind = null;
  if (nav && chapters.length) {
    nav.innerHTML = chapters.map(l => '<span>' + String(l).replace(/</g, '&lt;') + '</span>').join('') + '<i class="ind"></i>';
    labels = [...nav.querySelectorAll('span')];
    ind = nav.querySelector('.ind');
  }

  // Mount minimal-side chapter rail (#nav-side)
  let sideNav = document.getElementById('nav-side');
  let sideItems = [];
  if (chapters.length) {
    if (!sideNav) {
      sideNav = document.createElement('nav');
      sideNav.id = 'nav-side';
      sideNav.setAttribute('aria-label', '章節導航');
      stage.appendChild(sideNav);
    }
    const chFirstSlide = chapters.map((_, ci) =>
      slides.findIndex(s => s.dataset.appendix !== '1' && Number(s.dataset.chi ?? -1) === ci)
    );
    sideNav.innerHTML = chapters.map((l, ci) =>
      '<button type="button" class="ns-item" data-chi="' + ci + '" aria-label="' + String(l).replace(/"/g, '&quot;') + '">' +
      '<span class="ns-lab">' + String(l).replace(/</g, '&lt;') + '</span><span class="ns-dot"></span></button>'
    ).join('');
    sideItems = [...sideNav.querySelectorAll('.ns-item')];
    sideItems.forEach((btn, ci) => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const target = chFirstSlide[ci];
        if (target >= 0) go(target, false, { step: 0 });
      });
    });
  }

  function resolveSurface(sl) {
    if (!sl) return DECK.mode || document.documentElement.dataset.mode || 'dark';
    return sl.dataset.surface || DECK.mode || document.documentElement.dataset.mode || 'dark';
  }

  function syncSurface(sl) {
    const surf = resolveSurface(sl);
    stage.dataset.activeSurface = surf;
    return surf;
  }

  function resolveNavMode(sl) {
    if (!sl) return deckNavMode;
    if (sl.dataset.nav) return sl.dataset.nav;
    if (sl.querySelector('nav.slide-nav, nav[data-auto-nav], [data-auto-nav]')) return 'inline';
    return deckNavMode;
  }

  function setNav(sl) {
    const kind = sl.dataset.kind || 'content';
    const chi = Number(sl.dataset.chi ?? -1);
    const effMode = resolveNavMode(sl);
    const hasChapter = kind === 'content' && chi >= 0 && Boolean(chapters[chi]);

    const showSide = hasChapter && effMode === 'minimal-side';
    const showTop = hasChapter && (effMode === 'top-bar' || effMode === 'shell');

    stage.classList.toggle('show-side-nav', showSide);
    stage.classList.toggle('hide-nav', !showTop);

    if (sideItems.length) {
      sideItems.forEach((item, i) => item.classList.toggle('on', i === chi));
    }

    if (!nav || !tabsEl) return;
    if (!showTop) {
      tabsEl.style.opacity = 0;
      return;
    }

    labels.forEach((l, i) => l.classList.toggle('on', i === chi));
    const on = labels[chi];
    if (ind && on) {
      ind.style.left = on.offsetLeft + 'px';
      ind.style.width = on.offsetWidth + 'px';
    }
    const tabs = Number(sl.dataset.tabs || 0);
    const tab = Number(sl.dataset.tab || 0);
    const tabList = (DECK.tabs && DECK.tabs[chi]) || [];
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

  // ---------------------------------------------------------------- unified auto-hiding bottom control bar & 2px progress bar
  let progressEl = document.getElementById('deck-progress');
  let progressFill = document.getElementById('deck-progress-fill');
  if (!progressEl) {
    progressEl = document.createElement('div');
    progressEl.id = 'deck-progress';
    progressEl.setAttribute('aria-hidden', 'true');
    progressFill = document.createElement('div');
    progressFill.id = 'deck-progress-fill';
    progressEl.appendChild(progressFill);
    document.body.appendChild(progressEl);
  }

  let ctrlBar = document.getElementById('ctrl-bar');
  if (!ctrlBar) {
    ctrlBar = document.createElement('div');
    ctrlBar.id = 'ctrl-bar';
    ctrlBar.setAttribute('role', 'toolbar');
    ctrlBar.setAttribute('aria-label', '簡報控制列');
    ctrlBar.innerHTML =
      '<button type="button" class="cb-btn" data-cb="prev" aria-label="上一頁">‹</button>' +
      '<span class="cb-pos">01 / 01</span>' +
      '<span class="cb-step" aria-label="頁內步進"></span>' +
      '<button type="button" class="cb-btn" data-cb="next" aria-label="下一頁">›</button>' +
      '<span class="cb-sep" aria-hidden="true"></span>' +
      '<button type="button" class="cb-btn" data-cb="notes" aria-label="講者備註 (N)">備註 N</button>' +
      '<button type="button" class="cb-btn" data-cb="static" aria-label="靜態省電 (B)">靜態 B</button>' +
      '<button type="button" class="cb-btn" data-cb="fs" aria-label="全螢幕 (F)">全螢幕 F</button>';
    document.body.appendChild(ctrlBar);
  }

  const cbPosEl = ctrlBar.querySelector('.cb-pos');
  const cbStepEl = ctrlBar.querySelector('.cb-step');
  const cbNotesBtn = ctrlBar.querySelector('[data-cb="notes"]');
  const cbStaticBtn = ctrlBar.querySelector('[data-cb="static"]');
  const cbFsBtn = ctrlBar.querySelector('[data-cb="fs"]');
  let ctrlHideTimer = 0;
  let ctrlHover = false;

  function setCtrlBarVisible(visible, keepOpen) {
    clearTimeout(ctrlHideTimer);
    if (!ctrlBar || stillMode || hideCtrlMode) return false;
    ctrlBar.classList.toggle('visible', Boolean(visible));
    if (visible && !keepOpen && !ctrlHover) {
      ctrlHideTimer = setTimeout(() => {
        if (!ctrlHover) ctrlBar.classList.remove('visible');
      }, 2200);
    }
    return ctrlBar.classList.contains('visible');
  }

  function updateCtrlBar() {
    if (!ctrlBar) return;
    const sl = slides[cur];
    const totalMain = Math.max(1, mainIndices.length);
    const pad = n => (n < 10 ? '0' : '') + n;
    if (sl && isApp(cur)) {
      if (cbPosEl) cbPosEl.textContent = '附件';
    } else {
      const mPos = Math.max(1, mainIndices.indexOf(cur) + 1);
      if (cbPosEl) cbPosEl.textContent = pad(mPos) + ' / ' + pad(totalMain);
      if (progressFill) {
        const ratio = totalMain > 1 ? (mPos - 1) / (totalMain - 1) : 1;
        progressFill.style.transform = 'scaleX(' + Math.max(0.03, ratio).toFixed(4) + ')';
      }
    }
    const maxS = getMaxStep(sl);
    if (cbStepEl) {
      if (maxS > 0) {
        cbStepEl.textContent = '步進 ' + curStep + '/' + maxS;
        cbStepEl.classList.add('has-steps');
      } else {
        cbStepEl.textContent = '';
        cbStepEl.classList.remove('has-steps');
      }
    }
    if (cbNotesBtn && notesEl) cbNotesBtn.classList.toggle('is-on', notesEl.classList.contains('show'));
    if (cbStaticBtn) cbStaticBtn.classList.toggle('is-on', lowPower);
    if (cbFsBtn) cbFsBtn.classList.toggle('is-on', Boolean(document.fullscreenElement));
  }

  const cbExtButtons = new Map();
  let cbExtSep = null;
  function addCtrlButton(spec) {
    if (!ctrlBar || !spec || !spec.id) return null;
    if (cbExtButtons.has(spec.id)) return cbExtButtons.get(spec.id);
    if (!cbExtSep) {
      cbExtSep = document.createElement('span');
      cbExtSep.className = 'cb-sep';
      cbExtSep.setAttribute('aria-hidden', 'true');
      ctrlBar.appendChild(cbExtSep);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cb-btn';
    btn.dataset.cbExt = spec.id;
    btn.textContent = spec.label || spec.id;
    if (spec.title) {
      btn.title = spec.title;
      btn.setAttribute('aria-label', spec.title);
    }
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (typeof spec.onClick === 'function') spec.onClick(btn);
    });
    ctrlBar.appendChild(btn);
    cbExtButtons.set(spec.id, btn);
    return btn;
  }

  ctrlBar.addEventListener('mouseenter', () => { ctrlHover = true; clearTimeout(ctrlHideTimer); });
  ctrlBar.addEventListener('mouseleave', () => {
    ctrlHover = false;
    ctrlHideTimer = setTimeout(() => ctrlBar.classList.remove('visible'), 1400);
  });
  ctrlBar.addEventListener('click', e => {
    e.stopPropagation();
    const btn = e.target.closest('[data-cb]');
    if (!btn) return;
    const act = btn.dataset.cb;
    if (act === 'prev') step(-1);
    else if (act === 'next') step(1);
    else if (act === 'notes' && notesEl) { notesEl.classList.toggle('show'); updateCtrlBar(); }
    else if (act === 'static') toggleLowPower();
    else if (act === 'fs') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
    }
  });
  document.addEventListener('fullscreenchange', updateCtrlBar);
  addEventListener('mousemove', e => {
    if (stillMode || hideCtrlMode) return;
    if (e.clientY >= innerHeight - 96) setCtrlBarVisible(true, false);
  }, { passive: true });

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

  // ---------------------------------------------------------------- dual-track presenter-paced data-step engine
  const STEP_SEL = '[data-step], [data-step-hide], [data-step-only]';

  function stepRule(el) {
    if (el.dataset.stepOnly !== undefined) {
      const k = parseInt(el.dataset.stepOnly, 10) || 0;
      return { show: k, hide: k + 1 };
    }
    const show = el.dataset.step !== undefined ? (parseInt(el.dataset.step, 10) || 0) : 0;
    const hide = el.dataset.stepHide !== undefined ? (parseInt(el.dataset.stepHide, 10) || Infinity) : Infinity;
    return { show, hide };
  }

  function getMaxStep(sl) {
    if (!sl) return 0;
    let max = 0;
    sl.querySelectorAll(STEP_SEL).forEach(el => {
      if (el.dataset.step !== undefined) max = Math.max(max, parseInt(el.dataset.step, 10) || 0);
      if (el.dataset.stepHide !== undefined) max = Math.max(max, parseInt(el.dataset.stepHide, 10) || 0);
      if (el.dataset.stepOnly !== undefined) max = Math.max(max, parseInt(el.dataset.stepOnly, 10) || 0);
    });
    return max;
  }

  function deferredStepOf(el, sl) {
    const host = el.closest('[data-step], [data-step-only]');
    if (!host || !sl.contains(host)) return 0;
    return stepRule(host).show;
  }

  function cancelElStepAnim(el) {
    const prev = stepAnims.get(el);
    if (prev) { try { prev.cancel(); } catch (_) {} stepAnims.delete(el); }
  }

  function stepFromTransform(el) {
    const dir = el.dataset.stepFrom || el.dataset.from || 'up';
    if (dir === 'left') return 'translate3d(-26px,0,0)';
    if (dir === 'right') return 'translate3d(26px,0,0)';
    if (dir === 'down') return 'translate3d(0,-20px,0)';
    if (dir === 'scale') return 'scale(0.94)';
    if (dir === 'none') return 'none';
    return 'translate3d(0,22px,0)';
  }

  function applySlideStep(sl, targetStep, dir, instant, token) {
    if (!sl) return;
    const maxS = getMaxStep(sl);
    const k = Math.max(0, Math.min(maxS, targetStep));
    curStep = k;
    sl.dataset.currentStep = String(k);
    const cfg = slideMotion(sl);

    sl.querySelectorAll(STEP_SEL).forEach(el => {
      const r = stepRule(el);
      const nowVis = k >= r.show && k < r.hide;
      const wasVis = el.dataset.stepHidden !== '1' && el.dataset.stepHidden !== undefined;

      cancelElStepAnim(el);

      if (instant || isStatic() || el.dataset.stepHidden === undefined) {
        el.dataset.stepHidden = nowVis ? '0' : '1';
        if (nowVis) snapSubtreeFinal(el);
        return;
      }

      if (!wasVis && nowVis) {
        el.dataset.stepHidden = '0';
        const anim = trackAnim(el.animate(
          [{ opacity: 0, transform: stepFromTransform(el) }, { opacity: 1, transform: 'none' }],
          { duration: 480, easing: cfg.ease, fill: 'backwards' }
        ));
        stepAnims.set(el, anim);
        if (dir >= 0) triggerSubtreePrimitives(el, sl, 40, token);
        else snapSubtreeFinal(el);
      } else if (wasVis && !nowVis) {
        const anim = trackAnim(el.animate(
          [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate3d(0,-10px,0)' }],
          { duration: 220, easing: 'ease-out', fill: 'forwards' }
        ));
        stepAnims.set(el, anim);
        anim.finished.then(() => {
          if (token === navToken && Number(sl.dataset.currentStep) === k) {
            el.dataset.stepHidden = '1';
            try { anim.cancel(); } catch (_) {}
          }
        }, () => {});
      }
    });

    updateCtrlBar();
    if (!instant) {
      stage.dispatchEvent(new CustomEvent('deck:stepchange', {
        detail: { index: cur, slide: sl, step: curStep, totalSteps: maxS, dir },
      }));
    }
  }

  function setStep(k, dir = 1) {
    const sl = slides[cur];
    if (!sl) return curStep;
    const maxS = getMaxStep(sl);
    if (!maxS) return 0;
    const nextK = Math.max(0, Math.min(maxS, k));
    if (nextK === curStep) return curStep;
    applySlideStep(sl, nextK, dir, isStatic(), navToken);
    return curStep;
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

  function snapSubtreeFinal(root) {
    if (!root) return;
    const counts = root.matches && root.matches('[data-count]') ? [root, ...root.querySelectorAll('[data-count]')] : [...root.querySelectorAll('[data-count]')];
    counts.forEach(el => {
      const tn = findNumTextNode(el);
      if (tn && el.dataset.countFinal !== undefined) tn.nodeValue = el.dataset.countFinal;
    });
    const draws = root.matches && root.matches('[data-draw]') ? [root, ...root.querySelectorAll('[data-draw]')] : [...root.querySelectorAll('[data-draw]')];
    draws.forEach(el => {
      if (el.getAttribute('data-draw') === 'ring') {
        if (el.dataset.ringFinal !== undefined) el.style.strokeDashoffset = el.dataset.ringFinal;
      } else if (!el.dataset.drawDashed) {
        el.style.strokeDasharray = '';
        el.style.strokeDashoffset = '';
      }
    });
  }

  function snapSlideFinal(sl) {
    if (!sl) return;
    clearGuidanceState(sl);
    const maxS = getMaxStep(sl);
    if (maxS > 0) {
      sl.dataset.currentStep = String(maxS);
      if (slides[cur] === sl) curStep = maxS;
      sl.querySelectorAll(STEP_SEL).forEach(el => {
        cancelElStepAnim(el);
        const r = stepRule(el);
        const vis = maxS >= r.show && maxS < r.hide;
        el.dataset.stepHidden = vis ? '0' : '1';
      });
    }
    snapSubtreeFinal(sl);
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

  const BEAT_MS = { '1': 120, '2': 760, '3': 1480, '4': 2200 };
  function beatDelay(el, fallback) {
    if (el.dataset.delay !== undefined) return parseFloat(el.dataset.delay) || 0;
    const b = el.dataset.beat;
    if (b && BEAT_MS[b] !== undefined) return BEAT_MS[b];
    return fallback;
  }

  // Reusable primitive animators (run at slide entry for step-0, or on step reveal for deferred step-k)
  function runPrimitives(root, sl, baseDelay, token, morphedIds, skipDeferred) {
    const cfg = slideMotion(sl);
    const q = sel => {
      const list = [];
      if (root !== sl && root.matches && root.matches(sel)) list.push(root);
      root.querySelectorAll(sel).forEach(el => list.push(el));
      return skipDeferred ? list.filter(el => deferredStepOf(el, sl) === 0) : list;
    };

    // 1. Non-uniform staggered groups ([data-stagger])
    const staggeredSet = new Set();
    q('[data-stagger]').forEach(group => {
      const stepMs = parseFloat(group.getAttribute('data-stagger')) || cfg.staggerBase;
      const gDelay = baseDelay + beatDelay(group, skipDeferred ? 140 : 40);
      const items = [...group.children].filter(el => el.nodeType === 1);
      items.forEach((el, i) => {
        staggeredSet.add(el);
        if (morphedIds && el.dataset.morph && morphedIds.has(el.dataset.morph)) return;
        const d = gDelay + Math.round(stepMs * Math.pow(i, 0.82));
        trackAnim(el.animate(
          [{ opacity: 0, transform: 'translate3d(0,16px,0)' }, { opacity: 1, transform: 'none' }],
          { duration: 560, delay: d, easing: cfg.ease, fill: 'backwards' }
        ));
      });
    });

    // 2. Semantic directional reveals (.rv, [data-beat])
    let rvIdx = 0;
    q('.rv, [data-beat]').forEach(el => {
      if (staggeredSet.has(el)) return;
      if (
        el.hasAttribute('data-stagger') || el.hasAttribute('data-grow') || el.hasAttribute('data-draw') ||
        el.hasAttribute('data-wipe') || el.hasAttribute('data-pop') || el.hasAttribute('data-ripple') ||
        el.hasAttribute('data-travel') || el.hasAttribute('data-nudge')
      ) return;
      if (el.parentElement && el.parentElement.closest('.rv, [data-stagger]')) return;
      if (morphedIds && el.dataset.morph && morphedIds.has(el.dataset.morph)) return;
      if (!skipDeferred && el === root) return; // root already animated by applySlideStep
      const d = baseDelay + beatDelay(el, Math.round(cfg.staggerBase * Math.pow(rvIdx++, 0.85)));
      const dir = el.dataset.from || 'up';
      const fromT = dir === 'left' ? 'translate3d(-24px,0,0)'
        : dir === 'right' ? 'translate3d(24px,0,0)'
        : dir === 'down' ? 'translate3d(0,-18px,0)'
        : dir === 'none' ? 'none'
        : 'translate3d(0,18px,0)';
      trackAnim(el.animate(
        [{ opacity: 0, transform: fromT }, { opacity: 1, transform: 'none' }],
        { duration: 600, delay: d, easing: cfg.ease, fill: 'backwards' }
      ));
    });

    // 3. Mobile-visible high-contrast spotlight cues ([data-spotlight])
    q('[data-spotlight]').forEach(el => {
      el.classList.remove('spot-pulse');
      const d = baseDelay + beatDelay(el, skipDeferred ? 540 : 120);
      later(() => {
        if (token !== navToken || isStatic()) return;
        el.classList.add('spot-pulse');
        later(() => el.classList.remove('spot-pulse'), 1320);
      }, d);
    });

    // 4. Throttled rolling numbers ([data-count])
    q('[data-count]').forEach(el => {
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
      const dur = parseFloat(el.dataset.dur) || 820;
      const delay = baseDelay + beatDelay(el, skipDeferred ? 280 : 60);
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
          const eased = 1 - Math.pow(2, -8 * p);
          tn.nodeValue = fmt(target * eased);
        }
        id = requestAnimationFrame(tick);
        activeRafs.add(id);
      };
      let id = requestAnimationFrame(tick);
      activeRafs.add(id);
    });

    // 5. True SVG stroke draw & progress rings ([data-draw])
    q('[data-draw]').forEach(el => {
      const delay = baseDelay + beatDelay(el, skipDeferred ? 280 : 80);
      const dur = parseFloat(el.dataset.dur) || 880;
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
          { duration: Math.min(480, dur), delay, easing: EASE_CRISP, fill: 'backwards' }
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
    q('[data-grow]').forEach((el, idx) => {
      const dir = (el.getAttribute('data-grow') || 'x').toLowerCase();
      const delay = baseDelay + beatDelay(el, (skipDeferred ? 220 : 60) + idx * 65);
      const dur = parseFloat(el.dataset.dur) || 720;
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

    // 7. Directional GPU clip-path wipe ([data-wipe="right|left|down|up"])
    q('[data-wipe]').forEach(el => {
      const dir = (el.getAttribute('data-wipe') || 'right').toLowerCase();
      const delay = baseDelay + beatDelay(el, skipDeferred ? 280 : 60);
      const dur = parseFloat(el.dataset.dur) || 540;
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
    q('[data-pop]').forEach(el => {
      const delay = baseDelay + beatDelay(el, skipDeferred ? 320 : 120);
      const dur = parseFloat(el.dataset.dur) || 340;
      if (el instanceof SVGElement) {
        el.style.transformBox = 'fill-box';
        el.style.transformOrigin = 'center center';
      }
      trackAnim(el.animate(
        [{ opacity: 0, transform: 'scale(0.22)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: dur, delay, easing: 'cubic-bezier(0.22, 1.24, 0.36, 1)', fill: 'backwards' }
      ));
    });

    // 9. Target-lock concentric ripple ([data-ripple])
    q('[data-ripple]').forEach(el => {
      const delay = baseDelay + beatDelay(el, skipDeferred ? 560 : 160);
      const dur = parseFloat(el.dataset.dur) || 1050;
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
    q('[data-travel]').forEach(el => {
      const axis = (el.getAttribute('data-travel') || 'x').toLowerCase();
      const dist = parseFloat(el.dataset.travelDist || '800');
      const delay = baseDelay + beatDelay(el, skipDeferred ? 320 : 100);
      const dur = parseFloat(el.dataset.dur) || 2400;
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
          { opacity: 1, transform: p1 + ' scale(1)', offset: 0.05 },
          { opacity: 1, transform: p2 + ' scale(1)', offset: 0.93 },
          { opacity: 0, transform: p2 + ' scale(0.55)' },
        ],
        { duration: dur, delay, easing: 'cubic-bezier(0.25, 0.06, 0.25, 1)', fill: 'both' }
      ));
    });

    // 11. Interactive control affordance nudge ([data-nudge="x|y"])
    q('[data-nudge]').forEach(el => {
      const axis = (el.getAttribute('data-nudge') || 'x').toLowerCase();
      const delay = baseDelay + beatDelay(el, 1100);
      const dur = parseFloat(el.dataset.dur) || 920;
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

  function triggerSubtreePrimitives(el, sl, delay, token) {
    if (!el || isStatic()) { snapSubtreeFinal(el); return; }
    runPrimitives(el, sl, delay, token, null, false);
  }

  function animateSlideContent(sl, baseDelay, token, morphedIds) {
    if (!sl || isStatic()) { snapSlideFinal(sl); return; }

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
      focusPlan.forEach((stepItem, idx) => {
        maxEnd = Math.max(maxEnd, stepItem.end);
        const startAt = stepItem.start === 0 ? 0 : baseDelay + stepItem.start;
        if (startAt === 0 && idx === 0) {
          applyStage(stepItem.id);
        } else {
          later(() => {
            if (token !== navToken || isStatic()) return;
            for (let k = 0; k < idx; k++) visited.add(focusPlan[k].id);
            applyStage(stepItem.id);
          }, startAt);
        }
      });
      later(() => {
        if (token !== navToken) return;
        clearFocusClasses(sl);
      }, baseDelay + maxEnd);
    }

    // 0b. Live Causal State Transformation ([data-transform-at="ms"])
    sl.querySelectorAll('[data-transform-at]').forEach(el => {
      if (deferredStepOf(el, sl) > 0) return;
      const ms = parseFloat(el.dataset.transformAt) || 1200;
      el.classList.remove('transforming');
      el.classList.add('pre-transform');
      later(() => {
        if (token !== navToken || isStatic()) { el.classList.remove('pre-transform', 'transforming'); return; }
        el.classList.remove('pre-transform');
        el.classList.add('transforming');
        later(() => { el.classList.remove('transforming'); }, 840);
      }, baseDelay + ms);
    });

    runPrimitives(sl, sl, baseDelay, token, morphedIds, true);
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
      if (el.dataset.stepHidden === '1') return;
      const id = el.dataset.morph;
      if (id && !fromMap.has(id)) {
        const box = stageBox(el, sr, s);
        if (box.w >= 1 && box.h >= 1) fromMap.set(id, { el, box });
      }
    });
    if (!fromMap.size) return [];

    const wasActive = next.classList.contains('active');
    if (!wasActive) { next.classList.add('active'); next.style.opacity = '0'; }
    const pairs = [];
    next.querySelectorAll('[data-morph]').forEach(toEl => {
      if (toEl.dataset.stepHidden === '1') return;
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
    cleanupFlight(null, slides[cur]);
    if (slides[cur]) {
      slides[cur].classList.add('active');
      slides[cur].style.opacity = '';
      slides[cur].style.transform = '';
      slides[cur].style.clipPath = '';
      snapSlideFinal(slides[cur]);
    }
    updateCtrlBar();
  }

  // ---------------------------------------------------------------- 6 narrative transition archetypes (60fps GPU)
  function resolveTransition(prev, next, dir, morphPairs) {
    if (next.dataset.appendix === '1' || (prev && prev.dataset.appendix === '1')) return 'modal';
    if (next.dataset.kind === 'shock' && dir > 0 && curtain) return 'shock';
    const declared = dir > 0 ? (next.dataset.transition || '') : (prev && prev.dataset.transition || '');
    if (declared) return declared;
    if (morphPairs.length) return 'morph';
    const chChange = prev && (
      next.dataset.kind === 'toc' || prev.dataset.kind === 'toc' ||
      (next.dataset.chi !== prev.dataset.chi && Number(next.dataset.chi) >= 0 && Number(prev.dataset.chi) >= 0)
    );
    return chChange ? 'push' : 'cross';
  }

  function go(n, instant, opts) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur && !instant) return;
    const prev = cur >= 0 ? slides[cur] : null;
    const prevIdx = cur;
    const next = slides[n];
    const dir = prev ? (n > prevIdx ? 1 : -1) : 1;

    const token = ++navToken;
    cur = n;

    const instantly = Boolean(instant || isStatic() || !prev || prev === next);

    // Initialize target step on incoming slide BEFORE morph collection or paint
    const maxS = getMaxStep(next);
    let targetStep = 0;
    if (isStatic() || (opts && opts.step === 'final')) targetStep = maxS;
    else if (opts && typeof opts.step === 'number') targetStep = Math.max(0, Math.min(maxS, opts.step));
    else if (dir < 0 && prev && prev !== next && !instant) targetStep = maxS;
    applySlideStep(next, targetStep, 0, true, token);

    const morphPairs = (!instantly && next.dataset.kind !== 'shock') ? collectMorphPairs(prev, next) : [];

    cleanupFlight(instantly ? null : prev, next);

    if (prev && prev !== next) {
      stage.dispatchEvent(new CustomEvent('deck:slideleave', { detail: { index: prevIdx, slide: prev, next } }));
    }

    syncSurface(next);
    setNav(next);
    showNotes(next);
    updateCtrlBar();
    try { history.replaceState(null, '', '#' + (n + 1)); } catch (_) {}

    if (instantly) {
      stage.classList.add('no-trans');
      if (prev && prev !== next) prev.classList.remove('active', 'leaving');
      next.classList.add('active');
      next.style.opacity = '';
      next.style.transform = '';
      next.style.clipPath = '';
      if (isStatic()) snapSlideFinal(next);
      else snapSubtreeFinal(next);
      stage.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('no-trans')));
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
        stage.classList.remove('show-side-nav');
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
                { duration: 860, delay: 90, easing: EASE_SPRING, fill: 'backwards' }
              ));
            }
            if (targetStep === 0) animateSlideContent(next, 240, token, null);
          }, 220);
        }, () => {});
      } else {
        prev.classList.remove('active');
        prev.classList.add('leaving', 'in-flight');
        next.classList.add('active', 'in-flight');

        const waits = [];
        let contentDelay = 160;

        if (kind === 'iris') {
          const origin = (dir > 0 ? next.dataset.irisOrigin : prev.dataset.irisOrigin) || '48% 72%';
          if (dir > 0) {
            const aIn = trackAnim(next.animate(
              [{ clipPath: 'circle(4% at ' + origin + ')' }, { clipPath: 'circle(145% at ' + origin + ')' }],
              { duration: 760, easing: EASE_CINEMA }
            ));
            waits.push(aIn.finished);
            if (morphPairs.length) waits.push(...launchMorphClones(morphPairs, 780));
            contentDelay = 300;
          } else {
            prev.style.zIndex = '5';
            next.style.zIndex = '4';
            const aOut = trackAnim(prev.animate(
              [{ clipPath: 'circle(145% at ' + origin + ')' }, { clipPath: 'circle(0% at ' + origin + ')' }],
              { duration: 640, easing: EASE_CINEMA, fill: 'forwards' }
            ));
            waits.push(aOut.finished);
            if (morphPairs.length) waits.push(...launchMorphClones(morphPairs, 680));
            contentDelay = 200;
          }
        } else if (kind === 'push') {
          const sx = dir > 0 ? '100%' : '-100%';
          const ox = dir > 0 ? '-14%' : '14%';
          const aOut = trackAnim(prev.animate(
            [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(' + ox + ',0,0)' }],
            { duration: 640, easing: EASE_CINEMA }
          ));
          const aIn = trackAnim(next.animate(
            [{ transform: 'translate3d(' + sx + ',0,0)' }, { transform: 'translate3d(0,0,0)' }],
            { duration: 640, easing: EASE_CINEMA }
          ));
          waits.push(aOut.finished, aIn.finished);
          if (morphPairs.length) waits.push(...launchMorphClones(morphPairs, 740));
          contentDelay = 260;
        } else if (kind === 'sheet-up') {
          if (dir > 0) {
            const aOut = trackAnim(prev.animate(
              [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.95)', opacity: 0.72 }],
              { duration: 660, easing: EASE_CINEMA }
            ));
            const aIn = trackAnim(next.animate(
              [{ transform: 'translate3d(0,100%,0)' }, { transform: 'translate3d(0,0,0)' }],
              { duration: 660, easing: EASE_CINEMA }
            ));
            waits.push(aOut.finished, aIn.finished);
          } else {
            prev.style.zIndex = '5';
            next.style.zIndex = '4';
            const aOut = trackAnim(prev.animate(
              [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(0,100%,0)' }],
              { duration: 560, easing: EASE_CINEMA, fill: 'forwards' }
            ));
            const aIn = trackAnim(next.animate(
              [{ transform: 'scale(0.95)', opacity: 0.75 }, { transform: 'scale(1)', opacity: 1 }],
              { duration: 560, easing: EASE_CINEMA }
            ));
            waits.push(aOut.finished, aIn.finished);
          }
          contentDelay = 280;
        } else if (kind === 'zoom-rise') {
          const aOut = trackAnim(prev.animate(
            [{ transform: 'scale(1)', opacity: 1 }, { transform: dir > 0 ? 'scale(0.94)' : 'scale(1.04)', opacity: 0.5 }],
            { duration: 560, easing: EASE_CINEMA }
          ));
          const aIn = trackAnim(next.animate(
            [{ opacity: 0, transform: dir > 0 ? 'translate3d(0,48px,0) scale(0.97)' : 'translate3d(0,-36px,0) scale(1.02)' }, { opacity: 1, transform: 'none' }],
            { duration: 620, easing: EASE_SPRING }
          ));
          waits.push(aOut.finished, aIn.finished);
          if (morphPairs.length) waits.push(...launchMorphClones(morphPairs, cfg.morphMs));
          contentDelay = 240;
        } else if (kind === 'modal') {
          const intoApp = next.dataset.appendix === '1';
          const aIn = trackAnim(next.animate(
            [{ opacity: 0, transform: intoApp ? 'scale(0.93)' : 'scale(1.04)' }, { opacity: 1, transform: 'none' }],
            { duration: 440, easing: EASE_SPRING }
          ));
          waits.push(aIn.finished);
          contentDelay = 140;
        } else if (kind === 'morph' && morphPairs.length) {
          const aIn = trackAnim(next.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 320, easing: 'ease-out', fill: 'backwards' }
          ));
          waits.push(aIn.finished, ...launchMorphClones(morphPairs, cfg.morphMs));
          contentDelay = 240;
        } else {
          const aIn = trackAnim(next.animate(
            [{ opacity: 0, transform: 'translate3d(0,12px,0)' }, { opacity: 1, transform: 'none' }],
            { duration: 400, easing: cfg.ease }
          ));
          waits.push(aIn.finished);
          contentDelay = 120;
        }

        // Only run slide-entry choreography when landing at step 0 (not when backing into final step)
        if (targetStep === 0) {
          animateSlideContent(next, contentDelay, token, morphedIds);
        }

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
    const detail = {
      index: cur,
      slide: next,
      prev,
      instant: instantly,
      staticMode: isStatic(),
      surface: stage.dataset.activeSurface,
      step: curStep,
      totalSteps: maxS,
    };
    stage.dispatchEvent(new CustomEvent('deck:slideenter', { detail }));
    stage.dispatchEvent(new CustomEvent('deck:slidechange', { detail }));
  }

  function step(d) {
    if (isApp(cur)) { back(); return; }
    const sl = slides[cur];
    const maxS = getMaxStep(sl);
    if (!isStatic() && maxS > 0) {
      if (d > 0 && curStep < maxS) { setStep(curStep + 1, 1); return; }
      if (d < 0 && curStep > 0) { setStep(curStep - 1, -1); return; }
    }
    let n = cur + d;
    while (n >= 0 && n < slides.length && isApp(n)) n += d;
    if (n >= 0 && n < slides.length) {
      go(n, false, d < 0 ? { step: 'final' } : { step: 0 });
    }
  }

  function openLink(id) {
    const n = slides.findIndex(s => s.dataset.appendix === '1' && s.dataset.id === id);
    if (n < 0) return;
    if (!isApp(cur)) returnTo.push(cur);
    go(n, false, { step: 0 });
  }

  function back() {
    const n = returnTo.length ? returnTo.pop() : 0;
    go(n, false, { step: 'final' });
  }

  function toggleLowPower(force) {
    lowPower = typeof force === 'boolean' ? force : !lowPower;
    document.body.classList.toggle('low-power', lowPower);
    if (lowPower) {
      freezeNow();
      toast('已切換靜態省電模式（按 B 恢復動態）');
    } else {
      updateCtrlBar();
      toast('已恢復動態播放');
    }
    stage.dispatchEvent(new CustomEvent('deck:lowpower', { detail: { lowPower } }));
    return lowPower;
  }

  function setStill(flag) {
    stillMode = Boolean(flag);
    document.documentElement.classList.toggle('still', stillMode);
    if (stillMode) freezeNow();
    else updateCtrlBar();
    stage.dispatchEvent(new CustomEvent('deck:still', { detail: { still: stillMode } }));
  }

  // ---------------------------------------------------------------- input handling (keyboard + click + mobile swipe)
  const INTERACTIVE_SEL = '.live-ctrl, [data-interactive], #ctrl-bar, #nav-side, #deck-grid, #deck-annotator, #deck-lightbox, [data-compare-slider], [data-zoomable], [data-ref], input, select, textarea, label, #notes, a, video, audio, button:not(.back):not([data-link])';

  addEventListener('keydown', e => {
    const k = e.key;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      if (k === 'Escape') document.activeElement.blur();
      return;
    }
    if (k === 'Escape') {
      if (closeTopOverlay()) { e.preventDefault(); return; }
      if (isApp(cur)) { e.preventDefault(); back(); return; }
      return;
    }
    if (hasNavLock()) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); step(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); step(-1); }
    else if (k === 'Home') go(0, false, { step: 0 });
    else if (k === 'End') go(slides.length - 1, false, { step: 0 });
    else if (k === 'b' || k === 'B') { e.preventDefault(); toggleLowPower(); }
    else if (k === 'f' || k === 'F') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
    }
    else if ((k === 'n' || k === 'N') && notesEl) { notesEl.classList.toggle('show'); updateCtrlBar(); }
    else if (k === 'p' || k === 'P') print();
  });

  const clickTarget = viewportEl || window;
  clickTarget.addEventListener('click', e => {
    if (hasNavLock()) return;
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
      if (hasNavLock() || e.touches.length !== 1 || e.target.closest(INTERACTIVE_SEL)) { swiping = false; return; }
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
      if (ty >= innerHeight - 80) setCtrlBarVisible(true, false);
      swiping = true;
    }, { passive: true });
    viewportEl.addEventListener('touchend', e => {
      if (!swiping || hasNavLock() || !e.changedTouches.length) return;
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
    go: (n, instant = true, opts) => go(n, instant, opts),
    step,
    setStep,
    openLink,
    back,
    setStill,
    toggleLowPower,
    setCtrlBarVisible,
    registerOverlay,
    hasNavLock,
    closeTopOverlay,
    addCtrlButton,
    toast,
    isStatic,
    isApp,
    stage,
    count: slides.length,
    navMode: deckNavMode,
    stageMode: deckStageMode,
    noScaleMode,
    get index() { return cur; },
    get stepIndex() { return curStep; },
    get stepTotal() { return getMaxStep(slides[cur]); },
    get activeSurface() { return stage.dataset.activeSurface || ''; },
    get slides() { return slides; },
    get lowPower() { return lowPower; },
  };
})();
