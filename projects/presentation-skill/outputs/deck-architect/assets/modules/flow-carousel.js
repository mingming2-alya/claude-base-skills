/* deck-architect v4.4 On-Demand Module: flow-carousel
 * Controls [data-flow-carousel] vertical live product workflow card carousels.
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const instances = [];

  document.querySelectorAll('[data-flow-carousel]').forEach(root => {
    root.classList.add('live-ctrl');
    const tabs = [...root.querySelectorAll('[data-fc-idx]')];
    const cards = [...root.querySelectorAll('[data-fc-card]')];
    if (!cards.length) return;

    const intervalMs = Math.max(1200, parseInt(root.dataset.interval || '3400', 10) || 3400);
    const autoplay = root.dataset.autoplay !== 'false';
    const stillIdx = Math.max(0, Math.min(cards.length - 1, parseInt(root.dataset.stillIndex || '0', 10) || 0));
    root.style.setProperty('--fc-interval', intervalMs + 'ms');

    let idx = stillIdx;
    let timer = 0;
    let pausedByHover = false;

    function apply(nextIdx) {
      idx = ((nextIdx % cards.length) + cards.length) % cards.length;
      const prevIdx = (idx - 1 + cards.length) % cards.length;
      const afterIdx = (idx + 1) % cards.length;
      root.dataset.activeIndex = String(idx);
      tabs.forEach((t, i) => {
        const on = i === idx;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      cards.forEach((c, i) => {
        c.classList.toggle('is-active', i === idx);
        c.classList.toggle('is-prev', cards.length > 2 && i === prevIdx);
        c.classList.toggle('is-next', cards.length > 1 && i === afterIdx && afterIdx !== prevIdx);
        c.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      });
    }

    function stop() {
      if (timer) { clearTimeout(timer); timer = 0; }
      root.classList.remove('is-running');
    }

    function schedule() {
      stop();
      if (!autoplay || deck.isStatic() || pausedByHover) return;
      const sl = root.closest('.slide');
      if (!sl || deck.slides[deck.index] !== sl) return;
      // Trigger progress bar restart cleanly
      void root.offsetWidth;
      root.classList.add('is-running');
      timer = setTimeout(() => {
        apply(idx + 1);
        schedule();
      }, intervalMs);
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', e => {
        e.stopPropagation();
        apply(i);
        schedule();
      });
    });

    root.addEventListener('mouseenter', () => { pausedByHover = true; stop(); });
    root.addEventListener('mouseleave', () => { pausedByHover = false; schedule(); });

    apply(stillIdx);
    const api = { root, slide: root.closest('.slide'), apply, schedule, stop, stillIdx, get index() { return idx; } };
    root._flowCarousel = api;
    instances.push(api);
  });

  function syncForSlide(sl, staticMode) {
    for (const inst of instances) {
      if (staticMode) {
        inst.stop();
        inst.apply(inst.stillIdx);
      } else if (inst.slide === sl) {
        inst.schedule();
      } else {
        inst.stop();
      }
    }
  }

  deck.stage.addEventListener('deck:slideenter', ({ detail }) => syncForSlide(detail.slide, detail.staticMode));
  deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
    for (const inst of instances) if (inst.slide === detail.slide) inst.stop();
  });
  deck.stage.addEventListener('deck:still', ({ detail }) => syncForSlide(deck.slides[deck.index], detail.still));
  deck.stage.addEventListener('deck:lowpower', ({ detail }) => syncForSlide(deck.slides[deck.index], detail.lowPower));

  if (deck.slides[deck.index]) syncForSlide(deck.slides[deck.index], deck.isStatic());
})();
