/* deck-architect v4.5 On-Demand Module: flow-carousel
 * Supports 4 declarative modes via [data-flow-carousel="vertical|horizontal|stepper|chat"]:
 *  - vertical (default): left tabs + vertical card stack
 *  - horizontal: top pill tabs + horizontal slide cards
 *  - stepper: event replay with scrubber + automatic [data-step-target] -> [data-node] highlight
 *  - chat: progressive AI / Agent message stream (snaps all visible in ?still=1 / print)
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const instances = [];

  document.querySelectorAll('[data-flow-carousel]').forEach(root => {
    root.classList.add('live-ctrl');
    const rawMode = (root.getAttribute('data-flow-carousel') || '').trim().toLowerCase();
    const mode = ['horizontal', 'stepper', 'chat'].includes(rawMode) ? rawMode : 'vertical';
    const tabs = [...root.querySelectorAll('[data-fc-idx]')];
    const cards = [...root.querySelectorAll('[data-fc-card], [data-fc-msg]')];
    if (!cards.length) return;

    const intervalMs = Math.max(900, parseInt(root.dataset.interval || (mode === 'chat' ? '1400' : '3400'), 10) || 3400);
    const autoplay = root.dataset.autoplay !== 'false';
    const stillIdx = mode === 'chat'
      ? cards.length - 1
      : Math.max(0, Math.min(cards.length - 1, parseInt(root.dataset.stillIndex || '0', 10) || 0));
    root.style.setProperty('--fc-interval', intervalMs + 'ms');

    let idx = stillIdx;
    let timer = 0;
    let pausedByHover = false;
    let scrubDots = [];
    let scrubPos = null;

    // Auto-mount scrubber in stepper mode unless explicitly disabled
    if (mode === 'stepper' && root.dataset.scrubber !== 'false' && !root.querySelector('.fc-scrubber')) {
      const sc = document.createElement('div');
      sc.className = 'fc-scrubber live-ctrl';
      sc.innerHTML =
        '<button type="button" class="fc-scrub-btn" data-fc-act="prev" aria-label="上一步">‹</button>' +
        '<div class="fc-scrub-dots">' +
          cards.map((_, i) => '<button type="button" class="fc-scrub-dot" data-fc-dot="' + i + '" aria-label="第 ' + (i + 1) + ' 步"></button>').join('') +
        '</div>' +
        '<span class="fc-scrub-pos">1 / ' + cards.length + '</span>' +
        '<button type="button" class="fc-scrub-btn" data-fc-act="next" aria-label="下一步">›</button>';
      root.appendChild(sc);
      scrubDots = [...sc.querySelectorAll('.fc-scrub-dot')];
      scrubPos = sc.querySelector('.fc-scrub-pos');
      sc.querySelector('[data-fc-act="prev"]').addEventListener('click', e => {
        e.stopPropagation();
        apply(idx - 1);
        schedule();
      });
      sc.querySelector('[data-fc-act="next"]').addEventListener('click', e => {
        e.stopPropagation();
        apply(idx + 1);
        schedule();
      });
      scrubDots.forEach((d, di) => d.addEventListener('click', e => {
        e.stopPropagation();
        apply(di);
        schedule();
      }));
    }

    function syncTargetNodes(activeCard) {
      const sl = root.closest('.slide');
      if (!sl) return;
      const nodes = [...sl.querySelectorAll('[data-node]')];
      if (!nodes.length) return;
      const raw = (activeCard && activeCard.dataset.stepTarget) || '';
      const ids = raw.split(/[\s,]+/).filter(Boolean);
      if (!ids.length) {
        nodes.forEach(n => n.classList.remove('is-step-active', 'is-step-dim'));
        return;
      }
      nodes.forEach(n => {
        const hit = ids.includes(n.dataset.node);
        n.classList.toggle('is-step-active', hit);
        n.classList.toggle('is-step-dim', !hit);
      });
    }

    function apply(nextIdx) {
      if (mode === 'chat') {
        idx = Math.max(0, Math.min(cards.length - 1, nextIdx));
        root.dataset.activeIndex = String(idx);
        cards.forEach((c, i) => {
          const shown = i <= idx;
          c.classList.toggle('is-shown', shown);
          c.classList.toggle('is-active', i === idx);
          c.setAttribute('aria-hidden', shown ? 'false' : 'true');
        });
        return;
      }

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
      scrubDots.forEach((d, i) => {
        d.classList.toggle('is-active', i === idx);
        d.classList.toggle('is-past', i < idx);
      });
      if (scrubPos) scrubPos.textContent = (idx + 1) + ' / ' + cards.length;
      syncTargetNodes(cards[idx]);
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
      if (mode === 'chat' && idx >= cards.length - 1) return;
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
    const api = { root, mode, slide: root.closest('.slide'), apply, schedule, stop, stillIdx, get index() { return idx; } };
    root._flowCarousel = api;
    instances.push(api);
  });

  function syncForSlide(sl, staticMode) {
    for (const inst of instances) {
      if (staticMode) {
        inst.stop();
        inst.apply(inst.stillIdx);
      } else if (inst.slide === sl) {
        if (inst.mode === 'chat') inst.apply(0);
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
