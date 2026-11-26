/* deck-architect v4.7 Style Motion Kit: illustration / story (Tactile Bounce)
 * Primitives: [data-popup-fold], [data-chat-replay]
 */
(function () {
  const deck = window.__deck;
  const isStatic = () => (deck && typeof deck.isStatic === 'function' ? deck.isStatic() : false);

  /* ---- 1. Pop-up Book 3D Fold ---- */
  function initPopupFold(root) {
    if (root._pfInit) return root._pfInit;
    const layers = [...root.querySelectorAll('[data-pop-layer]')];
    layers.forEach((layer, i) => {
      if (!layer.style.transitionDelay) layer.style.transitionDelay = (i * 120) + 'ms';
    });

    function play() {
      if (isStatic()) { root.classList.remove('is-folded'); return; }
      root.classList.add('is-folded');
      root.getBoundingClientRect();
      setTimeout(() => root.classList.remove('is-folded'), 90);
    }
    function toggle() {
      root.classList.toggle('is-folded');
    }

    const api = { play, toggle, unfold: () => root.classList.remove('is-folded'), fold: () => root.classList.add('is-folded') };
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
      if (isStatic()) { showAll(); return; }
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
    folds.forEach(f => f.unfold());
    chats.forEach(c => c.showAll());
  }

  function stepOf(el, sl) {
    const h = el.closest('[data-step], [data-step-only]');
    return h && sl && sl.contains(h) ? (parseInt(h.dataset.step || h.dataset.stepOnly || '0', 10) || 0) : 0;
  }

  if (deck && deck.stage) {
    deck.stage.addEventListener('deck:slideenter', ({ detail }) => {
      const sl = detail.slide;
      if (!sl) return;
      const curStep = detail.step || 0;
      sl.querySelectorAll('[data-popup-fold]').forEach(el => { if (el._pfInit && stepOf(el, sl) <= curStep) el._pfInit.play(); });
      sl.querySelectorAll('[data-chat-replay]').forEach(el => { if (el._crInit && stepOf(el, sl) <= curStep) el._crInit.play(); });
    });
    deck.stage.addEventListener('deck:stepchange', ({ detail }) => {
      const sl = detail.slide;
      if (!sl || detail.step <= 0) return;
      sl.querySelectorAll('[data-popup-fold]').forEach(el => { if (el._pfInit && stepOf(el, sl) === detail.step) el._pfInit.play(); });
      sl.querySelectorAll('[data-chat-replay]').forEach(el => { if (el._crInit && stepOf(el, sl) === detail.step) el._crInit.play(); });
    });
    deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
      const sl = detail.slide;
      if (!sl) return;
      sl.querySelectorAll('[data-chat-replay]').forEach(el => el._crInit && el._crInit.stop());
    });
    deck.stage.addEventListener('deck:still', ({ detail }) => { if (detail.still) settleAll(); });
    deck.stage.addEventListener('deck:lowpower', ({ detail }) => { if (detail.lowPower) settleAll(); });
  }
  window.__motionKits = window.__motionKits || {};
  window.__motionKits.story = { initPopupFold, initChatReplay, folds, chats };
})();
