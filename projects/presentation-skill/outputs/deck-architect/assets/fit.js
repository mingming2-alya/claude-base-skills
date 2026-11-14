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
