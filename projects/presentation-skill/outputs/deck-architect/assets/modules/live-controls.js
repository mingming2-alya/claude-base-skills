/* deck-architect v4.5 On-Demand Module: live-controls
 * Wires declarative interactive controls:
 *  - [data-segmented] pill selectors
 *  - [data-toggle] boolean switches
 *  - [data-presets] + [data-preset='{"#sel": val}'] scenario presets
 *  - [data-reset] one-click restore to initial slide control values
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const initialSnapshots = new WeakMap();

  function captureScope(scope) {
    if (!scope || initialSnapshots.has(scope)) return;
    const entries = [];
    scope.querySelectorAll('input, select').forEach(el => {
      entries.push({
        kind: el.type === 'checkbox' || el.type === 'radio' ? 'check' : 'value',
        el,
        val: el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value,
      });
    });
    scope.querySelectorAll('[data-segmented]').forEach(seg => {
      const act = seg.querySelector('button.is-active, button[aria-pressed="true"]') || seg.querySelector('button');
      entries.push({ kind: 'segmented', el: seg, val: act ? (act.dataset.val ?? act.textContent.trim()) : '' });
    });
    scope.querySelectorAll('[data-toggle]').forEach(tog => {
      const on = tog.classList.contains('is-on') || tog.getAttribute('aria-checked') === 'true' || tog.dataset.checked === '1';
      entries.push({ kind: 'toggle', el: tog, val: on });
    });
    initialSnapshots.set(scope, entries);
  }

  function setSegmentedValue(seg, val, silent) {
    const btns = [...seg.querySelectorAll('button')];
    let matched = null;
    btns.forEach(b => {
      const bv = b.dataset.val ?? b.textContent.trim();
      const on = String(bv) === String(val);
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) matched = b;
    });
    seg.dataset.value = String(val);
    if (!silent && matched) {
      seg.dispatchEvent(new CustomEvent('lc:change', { bubbles: true, detail: { value: String(val) } }));
      seg.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function setToggleState(tog, on, silent) {
    const flag = Boolean(on);
    tog.classList.toggle('is-on', flag);
    tog.setAttribute('role', 'switch');
    tog.setAttribute('aria-checked', flag ? 'true' : 'false');
    tog.dataset.checked = flag ? '1' : '0';
    if (!silent) {
      tog.dispatchEvent(new CustomEvent('lc:change', { bubbles: true, detail: { checked: flag } }));
      tog.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Snapshot all slides before user interaction
  deck.slides.forEach(sl => {
    if (sl.querySelector('[data-reset], [data-presets], [data-segmented], [data-toggle]')) {
      captureScope(sl);
    }
  });

  // Segmented controls
  document.querySelectorAll('[data-segmented]').forEach(seg => {
    seg.classList.add('live-ctrl');
    const btns = [...seg.querySelectorAll('button')];
    if (!btns.length) return;
    const init = seg.querySelector('button.is-active, button[aria-pressed="true"]') || btns[0];
    setSegmentedValue(seg, init.dataset.val ?? init.textContent.trim(), true);
    btns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        setSegmentedValue(seg, btn.dataset.val ?? btn.textContent.trim(), false);
      });
    });
  });

  // Toggle switches
  document.querySelectorAll('[data-toggle]').forEach(tog => {
    tog.classList.add('live-ctrl');
    const init = tog.classList.contains('is-on') || tog.getAttribute('aria-checked') === 'true' || tog.dataset.checked === '1';
    setToggleState(tog, init, true);
    tog.addEventListener('click', e => {
      e.stopPropagation();
      const next = tog.dataset.checked !== '1';
      setToggleState(tog, next, false);
    });
  });

  // Preset bars
  document.querySelectorAll('[data-presets]').forEach(bar => {
    bar.classList.add('live-ctrl');
    const btns = [...bar.querySelectorAll('button[data-preset]')];
    btns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        let map = null;
        try { map = JSON.parse(btn.dataset.preset || '{}'); } catch (_) { return; }
        const scope = bar.closest('.slide') || document;
        btns.forEach(b => b.classList.toggle('is-active', b === btn));
        for (const [sel, val] of Object.entries(map)) {
          const target = scope.querySelector(sel) || document.querySelector(sel);
          if (!target) continue;
          if (target.hasAttribute('data-segmented')) {
            setSegmentedValue(target, val, false);
          } else if (target.hasAttribute('data-toggle')) {
            setToggleState(target, Boolean(val), false);
          } else if (target.type === 'checkbox' || target.type === 'radio') {
            target.checked = Boolean(val);
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            target.value = String(val);
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    });
  });

  // One-click reset buttons
  document.querySelectorAll('[data-reset]').forEach(btn => {
    btn.classList.add('live-ctrl');
    const scope = btn.closest('[data-reset-scope]') || btn.closest('.slide');
    captureScope(scope);
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const entries = initialSnapshots.get(scope) || [];
      for (const item of entries) {
        if (item.kind === 'segmented') setSegmentedValue(item.el, item.val, false);
        else if (item.kind === 'toggle') setToggleState(item.el, item.val, false);
        else if (item.kind === 'check') {
          item.el.checked = Boolean(item.val);
          item.el.dispatchEvent(new Event('input', { bubbles: true }));
          item.el.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          item.el.value = String(item.val);
          item.el.dispatchEvent(new Event('input', { bubbles: true }));
          item.el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      if (scope) scope.querySelectorAll('[data-presets] > button.is-active').forEach(b => b.classList.remove('is-active'));
    });
  });
})();
