(function(){
const stage=document.getElementById('stage'), slides=[...document.querySelectorAll('.slide')];
const nav=document.getElementById('nav'), tabsEl=document.getElementById('tabs'), curtain=document.getElementById('curtain');
const notesEl=document.getElementById('notes');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const M=DECK.motion; let cur=-1, busy=false, returnTo=[];
const isApp=i=>slides[i] && slides[i].dataset.appendix==='1';
function step(d){
  if(isApp(cur)){ back(); return; }
  let n=cur+d; while(n>=0 && n<slides.length && isApp(n)) n+=d;
  if(n>=0 && n<slides.length) go(n);
}
function openLink(id){
  const n=slides.findIndex(s=>s.dataset.appendix==='1' && s.dataset.id===id);
  if(n<0) return;
  if(!isApp(cur)) returnTo.push(cur);
  go(n);
}
function back(){ const n=returnTo.length?returnTo.pop():0; go(n); }

// rings TOC radii
document.querySelectorAll('[data-shape=rings] .toc-list').forEach(ol=>{
  const lis=[...ol.children], n=lis.length;
  const big=M==='zoom-in';
  lis.forEach((li,i)=>{const k=big? i : n-1-i; li.style.setProperty('--r', 940-k*(700/Math.max(1,n-1)));});
});

function fit(){const s=Math.min(innerWidth/1920,innerHeight/1080);stage.style.transform='scale('+s+')';}
addEventListener('resize',fit);fit();

// persistent navigation: one object that lives across the whole deck
nav.innerHTML=DECK.chapters.map(l=>'<span>'+l.replace(/</g,'&lt;')+'</span>').join('')+'<i class="ind"></i>';
const labels=[...nav.querySelectorAll('span')], ind=nav.querySelector('.ind');
function setNav(sl){
  const kind=sl.dataset.kind, chi=+sl.dataset.chi;
  const hide=!(kind==='content');
  stage.classList.toggle('hide-nav',hide);
  if(hide){tabsEl.style.opacity=0;return;}
  labels.forEach((l,i)=>l.classList.toggle('on',i===chi));
  const on=labels[chi]; ind.style.left=on.offsetLeft+'px'; ind.style.width=on.offsetWidth+'px';
  const tabs=+sl.dataset.tabs, tab=+sl.dataset.tab;
  if(tabs>2){
    if(tabsEl.dataset.chi!=chi){tabsEl.innerHTML=DECK.tabs[chi].map(t=>'<span>'+String(t).replace(/</g,'&lt;')+'</span>').join('');tabsEl.dataset.chi=chi;}
    [...tabsEl.children].forEach((t,i)=>t.classList.toggle('on',i===tab));
    tabsEl.style.opacity=1;
  } else {tabsEl.style.opacity=0;}
}

function vec(dir){ // enter transform for the incoming slide on a chapter change
  const s=dir;
  if(M==='vertical') return ['translateY('+(8*s)+'%)','translateY('+(-8*s)+'%)'];
  if(M==='zoom-in') return s>0?['scale(.88)','scale(1.14)']:['scale(1.14)','scale(.88)'];
  if(M==='zoom-out') return s>0?['scale(1.14)','scale(.88)']:['scale(.88)','scale(1.14)'];
  return ['translateX('+(8*s)+'%)','translateX('+(-8*s)+'%)'];
}
// Entrance: slow and firm (expo-out, ~0.9s, 28px rise, 80ms stagger). A theme can swap the easing
// through --enter-easing, e.g. washi uses steps(5) for a hand-made stop-motion feel (paper-collage-ppt, MIT).
// Exit (below) is fast and eased-in: asymmetric rhythm reads as intentional (bang-motion, MIT).
const ENTER_EASE=(getComputedStyle(document.documentElement).getPropertyValue('--enter-easing')||'').trim()||'cubic-bezier(.16,1,.3,1)';
const STEPPED=ENTER_EASE.startsWith('steps');
function reveal(sl,delay){
  if(reduce) return;
  sl.querySelectorAll('.rv').forEach((el,i)=>el.animate(
    [{opacity:0,transform:STEPPED?'translateY(-36px) scale(1.03)':'translateY(28px)'},{opacity:1,transform:'none'}],
    {duration:STEPPED?520:900,delay:delay+i*(STEPPED?170:80),easing:ENTER_EASE,fill:'backwards'}));
}
function showNotes(sl){notesEl.textContent=sl.dataset.notes||'（這頁沒有講者備註）';}

async function go(n,instant){
  n=Math.max(0,Math.min(slides.length-1,n));
  if(n===cur||busy) return;
  const prev=slides[cur], next=slides[n], dir=n>cur?1:-1;
  busy=true;
  const instantly=instant||reduce||!prev;
  const chapterChange=prev && (next.dataset.kind==='toc' || prev.dataset.kind==='toc' ||
     (next.dataset.chi!==prev.dataset.chi && +next.dataset.chi>=0 && +prev.dataset.chi>=0));
  if(instantly){
    stage.classList.add('no-trans');
    if(prev) prev.classList.remove('active');
    next.classList.add('active'); setNav(next);
    stage.offsetWidth; requestAnimationFrame(()=>requestAnimationFrame(()=>stage.classList.remove('no-trans')));
  } else if(next.dataset.kind==='shock' && dir>0){
    // cut to black, hold (the speaker's pause), then let the line surface
    stage.classList.add('hide-nav');
    await curtain.animate([{opacity:0},{opacity:1}],{duration:260,fill:'forwards'}).finished;
    prev.classList.remove('active'); next.classList.add('active');
    await new Promise(r=>setTimeout(r,520));
    curtain.animate([{opacity:1},{opacity:0}],{duration:380,fill:'forwards'});
    next.querySelector('.shock-text').animate([{opacity:0,transform:'translateY(24px)',filter:'blur(6px)'},{opacity:1,transform:'none',filter:'none'}],
      {duration:1100,delay:200,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
    const sub=next.querySelector('.shock-sub');
    if(sub) sub.animate([{opacity:0},{opacity:.7}],{duration:700,delay:1300,fill:'backwards'});
    setNav(next);
  } else if(chapterChange){
    const [inT,outT]=vec(dir);
    await prev.animate([{opacity:1,transform:'none'},{opacity:0,transform:outT}],{duration:400,easing:'cubic-bezier(.55,.055,.675,.19)'}).finished;
    prev.classList.remove('active'); next.classList.add('active'); setNav(next);
    next.animate([{opacity:0,transform:inT},{opacity:1,transform:'none'}],{duration:800,easing:'cubic-bezier(.16,1,.3,1)'});
    reveal(next,180);
  } else {
    // nothing crossfades on top of anything: the old page leaves first, fast
    await prev.animate([{opacity:1},{opacity:0}],{duration:180,easing:'cubic-bezier(.55,.055,.675,.19)'}).finished;
    prev.classList.remove('active'); next.classList.add('active'); setNav(next);
    next.animate([{opacity:0},{opacity:1}],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'});
    reveal(next,60);
  }
  cur=n; showNotes(next);
  history.replaceState(null,'','#'+(n+1));
  busy=false;
}

addEventListener('keydown',e=>{
  const k=e.key;
  if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(k)){e.preventDefault();step(1);}
  else if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(k)){e.preventDefault();step(-1);}
  else if(k==='Escape' && isApp(cur)){e.preventDefault();back();}
  else if(k==='Home') go(0); else if(k==='End') go(slides.length-1);
  else if(k==='f'||k==='F'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();}
  else if(k==='n'||k==='N') notesEl.classList.toggle('show');
  else if(k==='p'||k==='P') print();
});
addEventListener('click',e=>{
  if(e.target.closest('#notes')) return;
  const b=e.target.closest('.back'); if(b){ back(); return; }
  const l=e.target.closest('[data-link]'); if(l){ openLink(l.dataset.link); return; }
  step(e.clientX>innerWidth/3?1:-1);
});
const start=parseInt((location.hash||'#1').slice(1),10)||1;
go(start-1,true);
window.__deck={go:(n)=>go(n,true),count:slides.length,get index(){return cur;}};
})();
