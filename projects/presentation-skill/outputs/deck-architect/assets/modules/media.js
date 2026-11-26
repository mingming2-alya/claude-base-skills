/* deck-architect v4.4 On-Demand Module: media
 * Manages external <video data-slide-video> & <audio data-sound-demo>:
 *  - Autoplay (muted) on slide enter when data-autoplay is set
 *  - Minimal glass controls + animated waveform bars (zero WebAudio CORS taint on file://)
 *  - Automatic pause + reset to currentTime = 0 on slide leave / ?still=1 / low-power
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  function fmtTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function stopSlideMedia(sl) {
    if (!sl) return;
    sl.querySelectorAll('video[data-slide-video]').forEach(v => {
      try {
        v.pause();
        if (v.readyState >= 1 || v.currentTime > 0) v.currentTime = 0;
      } catch (_) {}
      const shell = v.closest('.media-video-shell');
      if (shell) shell.classList.remove('is-playing');
    });
    sl.querySelectorAll('audio[data-sound-demo]').forEach(a => {
      try {
        a.pause();
        if (a.readyState >= 1 || a.currentTime > 0) a.currentTime = 0;
      } catch (_) {}
      const bar = a._soundBar;
      if (bar) {
        bar.classList.remove('is-playing');
        const btn = bar.querySelector('.sound-play-btn');
        if (btn) btn.textContent = '▶';
        bar.querySelectorAll('.sound-wave i').forEach(b => b.classList.remove('is-past'));
        const clk = bar.querySelector('.sound-clock');
        if (clk) clk.textContent = '0:00 / ' + fmtTime(a.duration || parseFloat(a.dataset.duration || '0'));
      }
    });
  }

  function stopAllMedia() {
    deck.slides.forEach(stopSlideMedia);
  }

  // ---- Enhance <video data-slide-video>
  document.querySelectorAll('video[data-slide-video]').forEach(video => {
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    if (video.hasAttribute('data-loop')) video.loop = true;
    if (video.hasAttribute('data-autoplay') || video.hasAttribute('data-muted')) video.muted = true;

    let shell = video.closest('.media-video-shell');
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'media-video-shell live-ctrl';
      video.parentNode.insertBefore(shell, video);
      shell.appendChild(video);
    } else {
      shell.classList.add('live-ctrl');
    }

    if (video.dataset.controls !== 'none') {
      const ctrl = document.createElement('div');
      ctrl.className = 'media-video-ctrl live-ctrl live-only';
      ctrl.innerHTML =
        '<button type="button" class="media-btn" data-vact="play" aria-label="播放／暫停">▶</button>' +
        '<div class="media-track" data-vact="seek"><div class="media-track-fill"></div></div>' +
        '<span class="media-time">0:00</span>' +
        '<button type="button" class="media-btn" data-vact="mute" aria-label="靜音切換">' + (video.muted ? '靜音' : '有聲') + '</button>';
      shell.appendChild(ctrl);

      const playBtn = ctrl.querySelector('[data-vact="play"]');
      const muteBtn = ctrl.querySelector('[data-vact="mute"]');
      const fill = ctrl.querySelector('.media-track-fill');
      const track = ctrl.querySelector('[data-vact="seek"]');
      const timeEl = ctrl.querySelector('.media-time');

      const syncUI = () => {
        const playing = !video.paused && !video.ended;
        shell.classList.toggle('is-playing', playing);
        playBtn.textContent = playing ? '❚❚' : '▶';
        muteBtn.textContent = video.muted ? '靜音' : '有聲';
        const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        const pct = dur ? Math.min(1, Math.max(0, video.currentTime / dur)) : 0;
        fill.style.transform = 'scaleX(' + pct.toFixed(4) + ')';
        timeEl.textContent = fmtTime(video.currentTime) + (dur ? ' / ' + fmtTime(dur) : '');
      };

      const togglePlay = () => {
        if (deck.isStatic()) return;
        if (video.paused || video.ended) {
          const p = video.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } else {
          video.pause();
        }
      };

      playBtn.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
      video.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
      muteBtn.addEventListener('click', e => {
        e.stopPropagation();
        video.muted = !video.muted;
        syncUI();
      });
      track.addEventListener('click', e => {
        e.stopPropagation();
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        const r = track.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        video.currentTime = ratio * video.duration;
        syncUI();
      });
      ['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata', 'volumechange'].forEach(ev =>
        video.addEventListener(ev, syncUI)
      );
      syncUI();
    }
  });

  // ---- Enhance <audio data-sound-demo>
  const WAVE_HEIGHTS = [
    0.22, 0.44, 0.68, 0.38, 0.84, 0.56, 0.94, 0.48, 0.72, 0.34, 0.88, 0.62,
    0.42, 0.96, 0.66, 0.50, 0.78, 0.36, 0.90, 0.58, 0.44, 0.82, 0.64, 0.32,
    0.74, 0.92, 0.54, 0.40, 0.80, 0.60, 0.46, 0.70, 0.36, 0.52, 0.30, 0.22,
  ];
  document.querySelectorAll('audio[data-sound-demo]').forEach((audio, idx) => {
    const label = audio.dataset.label || audio.getAttribute('aria-label') || ('實測音檔 ' + (idx + 1));
    const fallbackDur = parseFloat(audio.dataset.duration || '0');
    const bar = document.createElement('div');
    bar.className = 'sound-demo-bar live-ctrl';
    bar.setAttribute('data-sound-ui', '');

    const barsHtml = WAVE_HEIGHTS.map((h, bi) => {
      const dur = 520 + ((bi * 97 + idx * 71) % 340);
      const del = (bi * 55) % 420;
      return '<i style="--h:' + h + ';--wd:' + dur + 'ms;--wdel:-' + del + 'ms"></i>';
    }).join('');

    bar.innerHTML =
      '<button type="button" class="sound-play-btn" data-sound-toggle aria-label="播放或暫停 ' + label.replace(/"/g, '&quot;') + '">▶</button>' +
      '<div class="sound-meta">' +
        '<div class="sound-head"><span class="sound-label">' + label.replace(/</g, '&lt;') + '</span><span class="sound-clock">0:00 / ' + fmtTime(fallbackDur) + '</span></div>' +
        '<div class="sound-wave" role="slider" aria-label="音訊進度">' + barsHtml + '</div>' +
      '</div>';

    audio.parentNode.insertBefore(bar, audio.nextSibling);
    audio._soundBar = bar;

    const btn = bar.querySelector('.sound-play-btn');
    const clk = bar.querySelector('.sound-clock');
    const wave = bar.querySelector('.sound-wave');
    const bars = [...wave.querySelectorAll('i')];

    const syncAudio = () => {
      const playing = !audio.paused && !audio.ended;
      bar.classList.toggle('is-playing', playing);
      btn.textContent = playing ? '❚❚' : '▶';
      const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : fallbackDur;
      clk.textContent = fmtTime(audio.currentTime) + ' / ' + fmtTime(dur);
      const pct = dur > 0 ? Math.min(1, Math.max(0, audio.currentTime / dur)) : 0;
      const lit = Math.round(pct * bars.length);
      bars.forEach((b, bi) => b.classList.toggle('is-past', bi < lit));
    };

    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (deck.isStatic()) return;
      if (audio.paused || audio.ended) {
        // Pause sibling sound demos on the same slide for crisp A/B comparison
        const sl = audio.closest('.slide');
        if (sl) {
          sl.querySelectorAll('audio[data-sound-demo]').forEach(other => {
            if (other !== audio && !other.paused) { other.pause(); other.currentTime = 0; }
          });
        }
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else {
        audio.pause();
      }
      syncAudio();
    });

    wave.addEventListener('click', e => {
      e.stopPropagation();
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const r = wave.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      audio.currentTime = ratio * audio.duration;
      syncAudio();
    });

    ['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata'].forEach(ev =>
      audio.addEventListener(ev, syncAudio)
    );
    syncAudio();
  });

  // ---- Lifecycle hooks
  function enterSlide(sl, staticMode) {
    if (!sl || staticMode) { stopAllMedia(); return; }
    sl.querySelectorAll('video[data-slide-video][data-autoplay]').forEach(v => {
      v.muted = true;
      try { v.currentTime = 0; } catch (_) {}
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
  }

  deck.stage.addEventListener('deck:slideleave', ({ detail }) => stopSlideMedia(detail.slide));
  deck.stage.addEventListener('deck:slideenter', ({ detail }) => enterSlide(detail.slide, detail.staticMode));
  deck.stage.addEventListener('deck:still', ({ detail }) => { if (detail.still) stopAllMedia(); });
  deck.stage.addEventListener('deck:lowpower', ({ detail }) => { if (detail.lowPower) stopAllMedia(); });

  if (!deck.isStatic() && deck.slides[deck.index]) {
    enterSlide(deck.slides[deck.index], false);
  }
})();
