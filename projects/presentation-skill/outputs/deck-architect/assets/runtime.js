/* deck-architect v4 Thin Shell Runtime
 *
 * Provides deterministic playback infrastructure across all styles & free-canvas slides:
 *  - 1920x1080 responsive stage fit
 *  - Single-source chapter nav & tabs (auto-suppressed on slides with data-nav="inline" or "none")
 *  - Axis-derived chapter transitions & shock curtain pause (Phase B spring/Magic Move hook ready)
 *  - Appendix click-in ([data-link]) and return (.back / Esc / arrow)
 *  - Speaker notes (N), fullscreen (F), print (P), hash navigation (#3), reduced-motion respect
 */
(function () {
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const nav = document.getElementById('nav');
  const tabsEl = document.getElementById('tabs');
  const curtain = document.getElementById('curtain');
  const notesEl = document.getElementById('notes');
  if (!stage || !slides.length) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = (window.DECK && window.DECK.motion) || 'horizontal';
  let cur = -1;
  let busy = false;
  const returnTo = [];

  const isApp = i => slides[i] && slides[i].dataset.appendix === '1';

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

  // Rings TOC radii
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

  // Persistent single-source navigation (automatically yields to slides with data-nav="inline" or "none")
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
    const navMode = sl.dataset.nav || (sl.querySelector('nav.slide-nav, [data-auto-nav]') ? 'inline' : 'shell');
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

  function vec(dir) {
    const s = dir;
    if (M === 'vertical') return ['translateY(' + (8 * s) + '%)', 'translateY(' + (-8 * s) + '%)'];
    if (M === 'zoom-in') return s > 0 ? ['scale(.9)', 'scale(1.12)'] : ['scale(1.12)', 'scale(.9)'];
    if (M === 'zoom-out') return s > 0 ? ['scale(1.12)', 'scale(.9)'] : ['scale(.9)', 'scale(1.12)'];
    return ['translateX(' + (8 * s) + '%)', 'translateX(' + (-8 * s) + '%)'];
  }

  function getEnterEasing(sl) {
    return (getComputedStyle(sl).getPropertyValue('--enter-easing') || '').trim() || 'cubic-bezier(.16,1,.3,1)';
  }

  function reveal(sl, delay) {
    if (reduce) return;
    const ease = getEnterEasing(sl);
    const stepped = ease.startsWith('steps');
    sl.querySelectorAll('.rv').forEach((el, i) => {
      el.animate(
        [{ opacity: 0, transform: stepped ? 'translateY(-30px) scale(1.02)' : 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
        { duration: stepped ? 480 : 760, delay: delay + i * (stepped ? 150 : 70), easing: ease, fill: 'backwards' }
      );
    });
  }

  function showNotes(sl) {
    if (notesEl) notesEl.textContent = sl.dataset.notes || '（這頁沒有講者備註）';
  }

  async function go(n, instant) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur || busy) return;
    const prev = slides[cur];
    const next = slides[n];
    const dir = n > cur ? 1 : -1;
    busy = true;

    const instantly = Boolean(instant || reduce || !prev);
    const chapterChange = prev && (
      next.dataset.kind === 'toc' || prev.dataset.kind === 'toc' ||
      (next.dataset.chi !== prev.dataset.chi && Number(next.dataset.chi) >= 0 && Number(prev.dataset.chi) >= 0)
    );

    if (instantly) {
      stage.classList.add('no-trans');
      if (prev) prev.classList.remove('active');
      next.classList.add('active');
      setNav(next);
      stage.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('no-trans')));
    } else if (next.dataset.kind === 'shock' && dir > 0 && curtain) {
      stage.classList.add('hide-nav');
      await curtain.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, fill: 'forwards' }).finished;
      prev.classList.remove('active');
      next.classList.add('active');
      await new Promise(r => setTimeout(r, 480));
      curtain.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, fill: 'forwards' });
      const st = next.querySelector('.shock-text, [data-role="shock"]');
      if (st) {
        st.animate(
          [{ opacity: 0, transform: 'translateY(24px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'none' }],
          { duration: 1000, delay: 180, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }
        );
      }
      const sub = next.querySelector('.shock-sub');
      if (sub) sub.animate([{ opacity: 0 }, { opacity: .78 }], { duration: 650, delay: 1100, fill: 'backwards' });
      setNav(next);
    } else if (chapterChange) {
      const [inT, outT] = vec(dir);
      await prev.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: outT }], { duration: 340, easing: 'cubic-bezier(.55,.055,.675,.19)' }).finished;
      prev.classList.remove('active');
      next.classList.add('active');
      setNav(next);
      next.animate([{ opacity: 0, transform: inT }, { opacity: 1, transform: 'none' }], { duration: 720, easing: getEnterEasing(next) });
      reveal(next, 140);
    } else {
      await prev.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, easing: 'cubic-bezier(.55,.055,.675,.19)' }).finished;
      prev.classList.remove('active');
      next.classList.add('active');
      setNav(next);
      next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: getEnterEasing(next) });
      reveal(next, 50);
    }

    cur = n;
    showNotes(next);
    if (typeof window.__deckFit === 'function') window.__deckFit();
    try { history.replaceState(null, '', '#' + (n + 1)); } catch (_) {}
    stage.dispatchEvent(new CustomEvent('deck:slidechange', { detail: { index: cur, slide: next, prev } }));
    busy = false;
  }

  addEventListener('keydown', e => {
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); step(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); step(-1); }
    else if (k === 'Escape' && isApp(cur)) { e.preventDefault(); back(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (k === 'f' || k === 'F') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
    }
    else if ((k === 'n' || k === 'N') && notesEl) notesEl.classList.toggle('show');
    else if (k === 'p' || k === 'P') print();
  });

  addEventListener('click', e => {
    if (e.target.closest('#notes, a, button:not(.back):not([data-link])')) return;
    const b = e.target.closest('.back');
    if (b) { back(); return; }
    const l = e.target.closest('[data-link]');
    if (l) { openLink(l.dataset.link); return; }
    step(e.clientX > innerWidth / 3 ? 1 : -1);
  });

  const start = parseInt((location.hash || '#1').slice(1), 10) || 1;
  go(start - 1, true);

  window.__deck = {
    go: (n, instant = true) => go(n, instant),
    step,
    openLink,
    back,
    count: slides.length,
    get index() { return cur; },
    get slides() { return slides; },
  };
})();
