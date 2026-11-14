// Display text: if a phrase does not fit on one line, shrink the text (down to 72%)
// until every phrase does. If it still does not fit, keep full size and let it wrap.
(function(){
  function fitPhrases(){
    document.querySelectorAll('.key,.shock-text,.closing-text,.cover-title').forEach(function(el){
      var phs=[].slice.call(el.querySelectorAll('.ph')); if(!phs.length) return;
      el.style.fontSize='';
      var base=parseFloat(getComputedStyle(el).fontSize), size=base;
      function wraps(){var lh=parseFloat(getComputedStyle(el).lineHeight)||size*1.2;
        return phs.some(function(p){return p.offsetHeight>lh*1.5;});}
      while(wraps()&&size>base*.72){size-=base*.04;el.style.fontSize=size+'px';}
      if(wraps()) el.style.fontSize='';
    });
  }
  fitPhrases();
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fitPhrases);
})();

// Figures: a number never wraps, so when it is wider than its column (or pushes the page wider than
// the stage) every figure on that page shrinks together, down to half size.
(function(){
  function fitFigures(){
    document.querySelectorAll('.slide .body').forEach(function(b){
      var els=[].slice.call(b.querySelectorAll('.number .value,.stats-row .sv')); if(!els.length) return;
      els.forEach(function(e){e.style.fontSize='';});
      var base=els.map(function(e){return parseFloat(getComputedStyle(e).fontSize);}), k=1;
      function over(){return b.scrollWidth>b.clientWidth+1||els.some(function(e){return e.scrollWidth>e.clientWidth+1;});}
      while(over()&&k>.5){k-=.05;els.forEach(function(e,i){e.style.fontSize=(base[i]*k)+'px';});}
    });
  }
  fitFigures();
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fitFigures);
})();
