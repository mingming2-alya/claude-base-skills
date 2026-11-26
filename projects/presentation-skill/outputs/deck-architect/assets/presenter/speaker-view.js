/* deck-architect v4.5 Layer 1 Presenter Chrome: speaker-view (S key)
 * Opens a zero-dependency dual-screen speaker console synchronized via BroadcastChannel
 * (with localStorage fallback): current slide info, next slide preview, large speaker notes,
 * elapsed timer, and remote prev/next navigation.
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const deckKey = (document.title || 'deck').slice(0, 48).replace(/\s+/g, '-') + ':' + deck.count;
  const channelName = 'deck-architect-sync:' + deckKey;
  let bc = null;
  try {
    if (typeof BroadcastChannel === 'function') bc = new BroadcastChannel(channelName);
  } catch (_) {}

  let popup = null;
  let ctrlBtn = null;

  function slideSummary(idx) {
    const sl = deck.slides[idx];
    if (!sl) return null;
    const h = sl.querySelector('h1, h2, .shock-text, .div-t');
    const p = sl.querySelector('p.sub, p.lead, .takeaway, p');
    return {
      index: idx,
      total: deck.count,
      title: h ? h.textContent.trim().replace(/\s+/g, ' ').slice(0, 72) : (sl.dataset.id || ('Slide ' + (idx + 1))),
      preview: p ? p.textContent.trim().replace(/\s+/g, ' ').slice(0, 140) : '',
      notes: sl.dataset.notes || '（這頁沒有講者備註）',
      appendix: sl.dataset.appendix === '1',
      surface: sl.dataset.surface || deck.activeSurface || 'dark',
    };
  }

  function buildPayload() {
    let nextIdx = deck.index + 1;
    while (nextIdx < deck.count && deck.slides[nextIdx].dataset.appendix === '1') nextIdx++;
    return {
      type: 'state',
      index: deck.index,
      total: deck.count,
      step: deck.stepIndex,
      stepTotal: deck.stepTotal,
      current: slideSummary(deck.index),
      next: nextIdx < deck.count ? slideSummary(nextIdx) : null,
      ts: Date.now(),
    };
  }

  function broadcast() {
    const payload = buildPayload();
    if (bc) {
      try { bc.postMessage(payload); } catch (_) {}
    }
    try { localStorage.setItem(channelName, JSON.stringify(payload)); } catch (_) {}
    if (popup && !popup.closed && typeof popup.__onDeckState === 'function') {
      try { popup.__onDeckState(payload); } catch (_) {}
    }
    return payload;
  }

  function handleIncoming(msg) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'hello') broadcast();
    else if (msg.type === 'cmd') {
      if (msg.action === 'next') deck.step(1);
      else if (msg.action === 'prev') deck.step(-1);
      else if (msg.action === 'go' && typeof msg.index === 'number') deck.go(msg.index, false, { step: 0 });
    }
  }

  if (bc) bc.onmessage = e => handleIncoming(e.data);
  addEventListener('storage', e => {
    if (e.key !== channelName + ':cmd' || !e.newValue) return;
    try { handleIncoming(JSON.parse(e.newValue)); } catch (_) {}
  });

  function speakerHtml(chName, title) {
    return '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>講者模式 · ' +
      String(title).replace(/</g, '&lt;') + '</title><style>' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'body{background:#0D1016;color:#F4F2EC;font:500 16px/1.55 system-ui,-apple-system,sans-serif;height:100vh;display:grid;grid-template-rows:64px 1fr;overflow:hidden}' +
      'header{display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:1px solid rgba(255,255,255,.12);background:#121620}' +
      '.pos{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums;color:#4BE2A5}' +
      '.timer{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:.04em}' +
      '.bar{display:flex;align-items:center;gap:10px}' +
      'button{appearance:none;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#F4F2EC;padding:8px 14px;border-radius:10px;font:600 14px/1 system-ui;cursor:pointer}' +
      'button:hover{background:rgba(255,255,255,.18)}' +
      'main{display:grid;grid-template-columns:1.15fr 1fr;gap:20px;padding:20px 24px;overflow:hidden}' +
      '.col{display:flex;flex-direction:column;gap:16px;min-height:0}' +
      '.card{background:#151A24;border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:20px 24px;display:flex;flex-direction:column;gap:10px}' +
      '.eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(244,242,236,.58)}' +
      '.cur-title{font-size:28px;font-weight:800;line-height:1.25}' +
      '.cur-prev{font-size:17px;color:rgba(244,242,236,.74)}' +
      '.notes-card{flex:1;min-height:0;overflow:auto}' +
      '.notes-body{font-size:var(--nf,26px);line-height:1.65;color:#F8F6F1;white-space:pre-wrap}' +
      '.next-title{font-size:22px;font-weight:700;color:#CBD5E1}' +
      '</style></head><body>' +
      '<header>' +
        '<div class="bar"><span class="pos" id="sv-pos">01 / 01</span><span id="sv-step" style="color:#94A3B8;font-size:14px"></span></div>' +
        '<div class="bar"><span class="timer" id="sv-timer">00:00</span><button id="sv-tbtn">暫停</button><button id="sv-trst">歸零</button></div>' +
        '<div class="bar"><button id="sv-smaller">A-</button><button id="sv-bigger">A+</button><button id="sv-prev">‹ 上一步</button><button id="sv-next">下一步 ›</button></div>' +
      '</header>' +
      '<main>' +
        '<div class="col">' +
          '<div class="card"><div class="eyebrow">CURRENT SLIDE</div><div class="cur-title" id="sv-cur-title">—</div><div class="cur-prev" id="sv-cur-prev"></div></div>' +
          '<div class="card"><div class="eyebrow">NEXT SLIDE</div><div class="next-title" id="sv-next-title">（已是最後一頁）</div><div class="cur-prev" id="sv-next-prev"></div></div>' +
        '</div>' +
        '<div class="col">' +
          '<div class="card notes-card"><div class="eyebrow">SPEAKER NOTES</div><div class="notes-body" id="sv-notes">等待主畫面同步…</div></div>' +
        '</div>' +
      '</main>' +
      '<script>' +
      '(function(){' +
      'var chName=' + JSON.stringify(chName) + ';' +
      'var bc=null;try{bc=new BroadcastChannel(chName)}catch(_){}' +
      'function send(msg){if(bc)try{bc.postMessage(msg)}catch(_){}try{localStorage.setItem(chName+":cmd",JSON.stringify(Object.assign({ts:Date.now()},msg)))}catch(_){}}' +
      'function render(s){if(!s||s.type!=="state")return;' +
      'var pad=function(n){return(n<10?"0":"")+n};' +
      'document.getElementById("sv-pos").textContent=pad(s.index+1)+" / "+pad(s.total);' +
      'document.getElementById("sv-step").textContent=s.stepTotal>0?("步進 "+s.step+" / "+s.stepTotal):"";' +
      'if(s.current){document.getElementById("sv-cur-title").textContent=s.current.title;document.getElementById("sv-cur-prev").textContent=s.current.preview;document.getElementById("sv-notes").textContent=s.current.notes;}' +
      'if(s.next){document.getElementById("sv-next-title").textContent=s.next.title;document.getElementById("sv-next-prev").textContent=s.next.preview;}' +
      'else{document.getElementById("sv-next-title").textContent="（簡報結束）";document.getElementById("sv-next-prev").textContent="";}}' +
      'window.__onDeckState=render;' +
      'if(bc)bc.onmessage=function(e){render(e.data)};' +
      'window.addEventListener("storage",function(e){if(e.key===chName&&e.newValue)try{render(JSON.parse(e.newValue))}catch(_){}});' +
      'var nf=26;function setNf(v){nf=Math.max(18,Math.min(44,v));document.documentElement.style.setProperty("--nf",nf+"px");}' +
      'document.getElementById("sv-smaller").onclick=function(){setNf(nf-2)};' +
      'document.getElementById("sv-bigger").onclick=function(){setNf(nf+2)};' +
      'document.getElementById("sv-prev").onclick=function(){send({type:"cmd",action:"prev"})};' +
      'document.getElementById("sv-next").onclick=function(){send({type:"cmd",action:"next"})};' +
      'window.addEventListener("keydown",function(e){if(["ArrowRight","ArrowDown"," ","PageDown"].includes(e.key)){e.preventDefault();send({type:"cmd",action:"next"})}else if(["ArrowLeft","ArrowUp","PageUp","Backspace"].includes(e.key)){e.preventDefault();send({type:"cmd",action:"prev"})}});' +
      'var sec=0,run=true;var tEl=document.getElementById("sv-timer"),tb=document.getElementById("sv-tbtn");' +
      'setInterval(function(){if(!run)return;sec++;var m=Math.floor(sec/60),r=sec%60;tEl.textContent=(m<10?"0":"")+m+":"+(r<10?"0":"")+r;},1000);' +
      'tb.onclick=function(){run=!run;tb.textContent=run?"暫停":"繼續"};' +
      'document.getElementById("sv-trst").onclick=function(){sec=0;tEl.textContent="00:00"};' +
      'send({type:"hello"});' +
      '})();</' + 'script></body></html>';
  }

  function open() {
    if (deck.isStatic()) return false;
    if (popup && !popup.closed) {
      popup.focus();
      broadcast();
      return true;
    }
    try {
      popup = window.open('', 'deck-speaker-view', 'width=1200,height=760,resizable=yes');
    } catch (_) {
      popup = null;
    }
    if (!popup) {
      if (typeof deck.toast === 'function') deck.toast('請允許瀏覽器開啟彈出視窗以使用講者模式');
      return false;
    }
    popup.document.open();
    popup.document.write(speakerHtml(channelName, document.title || 'Presentation'));
    popup.document.close();
    setTimeout(broadcast, 80);
    return true;
  }

  if (typeof deck.addCtrlButton === 'function') {
    ctrlBtn = deck.addCtrlButton({
      id: 'speaker',
      label: '講者 S',
      title: '開啟雙螢幕講者控制台 (S)',
      onClick: open,
    });
  }

  addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (typeof deck.hasNavLock === 'function' && deck.hasNavLock()) return;
    if (e.key === 's' || e.key === 'S') {
      if (deck.isStatic()) return;
      e.preventDefault();
      open();
    }
  });

  deck.stage.addEventListener('deck:slideenter', broadcast);
  deck.stage.addEventListener('deck:stepchange', broadcast);

  window.__deckSpeaker = {
    open,
    broadcast,
    channelName,
    getPayload: buildPayload,
  };
})();
