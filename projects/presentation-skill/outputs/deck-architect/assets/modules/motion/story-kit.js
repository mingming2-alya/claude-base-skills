/* deck-architect v4.7 Style Motion Kit: illustration / story (Tactile Bounce)
 * Primitives: [data-popup-fold], [data-chat-replay]
 */
(function () {
  const deck = window.__deck;
  const isReduced = () => (deck && typeof deck.isReducedMotion === 'function' ? deck.isReducedMotion() : (deck && typeof deck.isStatic === 'function' ? deck.isStatic() : false));
  const enterTimers = new Set();
  function clearEnterTimers() {
    enterTimers.forEach(clearTimeout);
    enterTimers.clear();
  }

  /* ---- 1. Pop-up Book 3D Fold ---- */
  function initPopupFold(root) {
    if (root._pfInit) return root._pfInit;
    root.classList.add('live-ctrl');
    const layers = [...root.querySelectorAll('[data-pop-layer]')];
    layers.forEach((layer, i) => {
      if (!layer.style.transitionDelay) layer.style.transitionDelay = (i * 120) + 'ms';
    });
    let foldTimer = 0;

    function unfold() {
      clearTimeout(foldTimer);
      foldTimer = 0;
      root.classList.remove('is-folded');
    }
    function fold() {
      clearTimeout(foldTimer);
      foldTimer = 0;
      root.classList.add('is-folded');
    }
    function play() {
      clearTimeout(foldTimer);
      foldTimer = 0;
      if (isReduced()) { root.classList.remove('is-folded'); return; }
      root.classList.add('is-folded');
      root.getBoundingClientRect();
      foldTimer = setTimeout(() => {
        foldTimer = 0;
        root.classList.remove('is-folded');
      }, 90);
    }
    function toggle() {
      clearTimeout(foldTimer);
      foldTimer = 0;
      root.classList.toggle('is-folded');
    }

    const api = { play, toggle, unfold, fold };
    root._pfInit = api;
    return api;
  }

  /* ---- 2. Chat Scenario Theater ---- */
  function initChatReplay(root) {
    if (root._crInit) return root._crInit;
    root.classList.add('live-ctrl');
    const msgs = [...root.querySelectorAll('[data-chat-msg]')];
    let typing = root.querySelector('.cr-typing');
    if (!typing) {
      typing = document.createElement('div');
      typing.className = 'cr-typing';
      typing.innerHTML = '<i></i><i></i><i></i>';
      root.appendChild(typing);
    }
    let timers = [];
    function clearTimers() {
      timers.forEach(t => clearTimeout(t));
      timers = [];
    }
    function showAll() {
      clearTimers();
      typing.classList.remove('is-on');
      msgs.forEach(m => m.classList.remove('is-hidden'));
    }
    function play() {
      clearTimers();
      if (isReduced()) { showAll(); return; }
      msgs.forEach(m => m.classList.add('is-hidden'));
      let t = 180;
      msgs.forEach(m => {
        timers.push(setTimeout(() => {
          typing.style.alignSelf = m.dataset.chatMsg === 'me' ? 'flex-end' : 'flex-start';
          typing.classList.add('is-on');
        }, t));
        t += 520;
        timers.push(setTimeout(() => {
          typing.classList.remove('is-on');
          m.classList.remove('is-hidden');
        }, t));
        t += 360;
      });
    }
    showAll();
    const api = { play, showAll, stop: clearTimers };
    root._crInit = api;
    return api;
  }

  const folds = [...document.querySelectorAll('[data-popup-fold]')].map(initPopupFold);
  const chats = [...document.querySelectorAll('[data-chat-replay]')].map(initChatReplay);

  function settleAll() {
    clearEnterTimers();
    folds.forEach(f => f.unfold());
    chats.forEach(c => c.showAll());
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
        sl.querySelectorAll('[data-popup-fold]').forEach(el => el._pfInit && el._pfInit.unfold());
        sl.querySelectorAll('[data-chat-replay]').forEach(el => el._crInit && el._crInit.showAll());
        return;
      }
      const run = () => {
        if (deck.slides[deck.index] !== sl || isReduced()) return;
        sl.querySelectorAll('[data-popup-fold]').forEach(el => { if (el._pfInit && stepOf(el, sl) <= curStep) el._pfInit.play(); });
        sl.querySelectorAll('[data-chat-replay]').forEach(el => { if (el._crInit && stepOf(el, sl) <= curStep) el._crInit.play(); });
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
      clearEnterTimers();
      const sl = detail.slide;
      if (!sl || detail.step <= 0) return;
      if (detail.dir < 0 || isReduced()) {
        sl.querySelectorAll('[data-popup-fold]').forEach(el => el._pfInit && el._pfInit.unfold());
        sl.querySelectorAll('[data-chat-replay]').forEach(el => el._crInit && el._crInit.showAll());
        return;
      }
      const targetStep = detail.step;
      const runStep = () => {
        if (deck.slides[deck.index] !== sl || deck.stepIndex !== targetStep || isReduced()) return;
        sl.querySelectorAll('[data-popup-fold]').forEach(el => { if (el._pfInit && stepOf(el, sl) === targetStep) el._pfInit.play(); });
        sl.querySelectorAll('[data-chat-replay]').forEach(el => { if (el._crInit && stepOf(el, sl) === targetStep) el._crInit.play(); });
      };
      const delay = detail.revealDelay || 0;
      if (delay > 0) {
        const id = setTimeout(() => { enterTimers.delete(id); runStep(); }, delay);
        enterTimers.add(id);
      } else {
        runStep();
      }
    });
    deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
      clearEnterTimers();
      const sl = detail.slide;
      if (!sl) return;
      sl.querySelectorAll('[data-chat-replay]').forEach(el => el._crInit && el._crInit.showAll());
      sl.querySelectorAll('[data-popup-fold]').forEach(el => el._pfInit && el._pfInit.unfold());
    });
    deck.stage.addEventListener('deck:still', ({ detail }) => { if (detail.still) settleAll(); });
    deck.stage.addEventListener('deck:lowpower', ({ detail }) => { if (detail.lowPower) settleAll(); });
    deck.stage.addEventListener('deck:reducedmotion', ({ detail }) => { if (detail.reduced) settleAll(); });
  }
  window.__motionKits = window.__motionKits || {};
  window.__motionKits.story = { initPopupFold, initChatReplay, folds, chats };
})();
