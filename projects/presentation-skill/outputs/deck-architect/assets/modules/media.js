/* deck-architect v4.5 On-Demand Module: media
 * Manages external <video data-slide-video>, <audio data-sound-demo>, and [data-sound-ab] A/B track comparison:
 *  - Video: muted autoplay, data-start/data-end segment loop, data-rate playback speed, fullscreen toggle
 *  - Audio: glass pill + animated waveform + [data-sound-ab] shared-timeline A/B instant switching
 *  - Automatic pause + reset on slide leave / ?still=1 / low-power
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const isStill = () => (typeof deck.isStill === 'function' ? deck.isStill() : deck.isStatic());
  const isReduced = () => (typeof deck.isReducedMotion === 'function' ? deck.isReducedMotion() : deck.isStatic());

  const WAVE_HEIGHTS = [
    0.22, 0.44, 0.68, 0.38, 0.84, 0.56, 0.94, 0.48, 0.72, 0.34, 0.88, 0.62,
    0.42, 0.96, 0.66, 0.50, 0.78, 0.36, 0.90, 0.58, 0.44, 0.82, 0.64, 0.32,
    0.74, 0.92, 0.54, 0.40, 0.80, 0.60, 0.46, 0.70, 0.36, 0.52, 0.30, 0.22,
  ];
  const abControllers = [];

  function fmtTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function makeWaveHtml(seed) {
    return WAVE_HEIGHTS.map((h, bi) => {
      const dur = 520 + ((bi * 97 + seed * 71) % 340);
      const del = (bi * 55) % 420;
      return '<i style="--h:' + h + ';--wd:' + dur + 'ms;--wdel:-' + del + 'ms"></i>';
    }).join('');
  }

  function videoStart(v) {
    const s = parseFloat(v.dataset.start || '0');
    return Number.isFinite(s) && s > 0 ? s : 0;
  }

  function videoEnd(v) {
    const e = parseFloat(v.dataset.end || '');
    return Number.isFinite(e) && e > videoStart(v) ? e : null;
  }

  function stopSlideMedia(sl) {
    if (!sl) return;
    sl.querySelectorAll('video[data-slide-video]').forEach(v => {
      const st = videoStart(v);
      try {
        v.pause();
        if (v.readyState >= 1 || v.currentTime > st) v.currentTime = st;
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
    abControllers.forEach(c => { if (c.slide === sl) c.stop(); });
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

    const startSec = videoStart(video);
    const endSec = videoEnd(video);
    const initRate = parseFloat(video.dataset.rate || '1');
    if (Number.isFinite(initRate) && initRate > 0) video.playbackRate = initRate;

    if (startSec > 0) {
      video.addEventListener('loadedmetadata', () => {
        try { if (video.currentTime < startSec) video.currentTime = startSec; } catch (_) {}
      });
    }
    if (endSec !== null) {
      video.addEventListener('timeupdate', () => {
        if (video.currentTime >= endSec) {
          if (video.loop || video.hasAttribute('data-loop')) {
            try { video.currentTime = startSec; } catch (_) {}
          } else {
            video.pause();
            try { video.currentTime = endSec; } catch (_) {}
          }
        }
      });
    }

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
      const rateSteps = [1, 1.25, 1.5, 2, 0.75];
      let rateIdx = Math.max(0, rateSteps.indexOf(video.playbackRate));
      const ctrl = document.createElement('div');
      ctrl.className = 'media-video-ctrl live-ctrl live-only';
      ctrl.innerHTML =
        '<button type="button" class="media-btn" data-vact="play" aria-label="播放／暫停">▶</button>' +
        '<div class="media-track" data-vact="seek"><div class="media-track-fill"></div></div>' +
        '<span class="media-time">0:00</span>' +
        '<button type="button" class="media-btn" data-vact="rate" aria-label="切換倍速">' + video.playbackRate + 'x</button>' +
        '<button type="button" class="media-btn" data-vact="mute" aria-label="靜音切換">' + (video.muted ? '靜音' : '有聲') + '</button>' +
        '<button type="button" class="media-btn" data-vact="fs" aria-label="全螢幕檢視">⛶</button>';
      shell.appendChild(ctrl);

      const playBtn = ctrl.querySelector('[data-vact="play"]');
      const rateBtn = ctrl.querySelector('[data-vact="rate"]');
      const muteBtn = ctrl.querySelector('[data-vact="mute"]');
      const fsBtn = ctrl.querySelector('[data-vact="fs"]');
      const fill = ctrl.querySelector('.media-track-fill');
      const track = ctrl.querySelector('[data-vact="seek"]');
      const timeEl = ctrl.querySelector('.media-time');

      const syncUI = () => {
        const playing = !video.paused && !video.ended;
        shell.classList.toggle('is-playing', playing);
        playBtn.textContent = playing ? '❚❚' : '▶';
        muteBtn.textContent = video.muted ? '靜音' : '有聲';
        rateBtn.textContent = video.playbackRate + 'x';
        const fullDur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        const effEnd = endSec !== null ? Math.min(endSec, fullDur || endSec) : fullDur;
        const span = Math.max(0, effEnd - startSec);
        const rel = Math.max(0, video.currentTime - startSec);
        const pct = span > 0 ? Math.min(1, rel / span) : 0;
        fill.style.transform = 'scaleX(' + pct.toFixed(4) + ')';
        timeEl.textContent = fmtTime(rel) + (span ? ' / ' + fmtTime(span) : '');
      };

      const togglePlay = () => {
        if (isStill()) return;
        if (video.paused || video.ended) {
          if (endSec !== null && (video.currentTime < startSec || video.currentTime >= endSec)) {
            try { video.currentTime = startSec; } catch (_) {}
          }
          const p = video.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } else {
          video.pause();
        }
      };

      playBtn.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
      video.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
      rateBtn.addEventListener('click', e => {
        e.stopPropagation();
        rateIdx = (rateIdx + 1) % rateSteps.length;
        video.playbackRate = rateSteps[rateIdx];
        syncUI();
      });
      muteBtn.addEventListener('click', e => {
        e.stopPropagation();
        video.muted = !video.muted;
        syncUI();
      });
      fsBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (document.fullscreenElement === shell || document.fullscreenElement === video) {
          document.exitFullscreen().catch(() => {});
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen().catch(() => {});
        }
      });
      track.addEventListener('click', e => {
        e.stopPropagation();
        const fullDur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        const effEnd = endSec !== null ? Math.min(endSec, fullDur || endSec) : fullDur;
        const span = effEnd - startSec;
        if (span <= 0) return;
        const r = track.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        video.currentTime = startSec + ratio * span;
        syncUI();
      });
      ['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata', 'volumechange', 'ratechange'].forEach(ev =>
        video.addEventListener(ev, syncUI)
      );
      syncUI();
    }
  });

  // ---- Enhance [data-sound-ab] synchronized A/B audio switcher
  document.querySelectorAll('[data-sound-ab]').forEach((box, idx) => {
    const tracks = [...box.querySelectorAll('audio[data-sound-demo]')];
    if (tracks.length < 2) return;
    tracks.forEach(t => { if (!t.preload || t.preload === 'none') t.preload = 'metadata'; });
    box.classList.add('live-ctrl');
    const fallbackDur = parseFloat(box.dataset.duration || tracks[0].dataset.duration || '0');
    const title = box.dataset.label || '音訊 A/B 同步對比';
    let activeIdx = 0;

    const bar = document.createElement('div');
    bar.className = 'sound-demo-bar live-ctrl';
    bar.setAttribute('data-sound-ab-ui', '');

    const abBtnsHtml = tracks.map((t, ti) => {
      const name = t.dataset.label || (ti === 0 ? 'A 原始' : 'B 優化');
      return '<button type="button" class="sound-ab-btn' + (ti === 0 ? ' is-active' : '') + '" data-ab-idx="' + ti + '">' + name.replace(/</g, '&lt;') + '</button>';
    }).join('');

    bar.innerHTML =
      '<button type="button" class="sound-play-btn" aria-label="播放或暫停 A/B 音訊">▶</button>' +
      '<div class="sound-meta">' +
        '<div class="sound-head">' +
          '<span class="sound-label">' + title.replace(/</g, '&lt;') + '</span>' +
          '<div class="sound-ab-switch" role="tablist" aria-label="音軌切換">' + abBtnsHtml + '</div>' +
          '<span class="sound-clock">0:00 / ' + fmtTime(fallbackDur) + '</span>' +
        '</div>' +
        '<div class="sound-wave" role="slider" aria-label="同步進度">' + makeWaveHtml(idx + 5) + '</div>' +
      '</div>';

    box.appendChild(bar);
    const playBtn = bar.querySelector('.sound-play-btn');
    const abBtns = [...bar.querySelectorAll('.sound-ab-btn')];
    const clk = bar.querySelector('.sound-clock');
    const wave = bar.querySelector('.sound-wave');
    const bars = [...wave.querySelectorAll('i')];

    const activeTrack = () => tracks[activeIdx];

    const syncAB = () => {
      const cur = activeTrack();
      const playing = !cur.paused && !cur.ended;
      bar.classList.toggle('is-playing', playing);
      playBtn.textContent = playing ? '❚❚' : '▶';
      const dur = Number.isFinite(cur.duration) && cur.duration > 0 ? cur.duration : fallbackDur;
      clk.textContent = fmtTime(cur.currentTime) + ' / ' + fmtTime(dur);
      const pct = dur > 0 ? Math.min(1, Math.max(0, cur.currentTime / dur)) : 0;
      const lit = Math.round(pct * bars.length);
      bars.forEach((b, bi) => b.classList.toggle('is-past', bi < lit));
      abBtns.forEach((b, bi) => b.classList.toggle('is-active', bi === activeIdx));
      box.dataset.activeTrack = String(activeIdx);
    };

    const stopAB = () => {
      tracks.forEach(t => {
        try { t.pause(); if (t.readyState >= 1 || t.currentTime > 0) t.currentTime = 0; } catch (_) {}
      });
      syncAB();
    };

    const seekAndResume = (trackEl, pos, shouldPlay) => {
      const apply = () => {
        try { trackEl.currentTime = pos; } catch (_) {}
        if (shouldPlay && !isStill()) {
          const p = trackEl.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
        syncAB();
      };
      if (trackEl.readyState >= 1) {
        apply();
      } else {
        trackEl.addEventListener('loadedmetadata', apply, { once: true });
        try { trackEl.load(); } catch (_) {}
      }
    };

    const switchTrack = nextIdx => {
      if (nextIdx === activeIdx) return;
      const prev = activeTrack();
      const wasPlaying = !prev.paused && !prev.ended;
      const pos = prev.currentTime || 0;
      try { prev.pause(); } catch (_) {}
      activeIdx = nextIdx;
      const next = activeTrack();
      seekAndResume(next, pos, wasPlaying);
      syncAB();
    };

    playBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (isStill()) return;
      const cur = activeTrack();
      if (cur.paused || cur.ended) {
        const sl = box.closest('.slide');
        if (sl) {
          sl.querySelectorAll('audio[data-sound-demo]').forEach(other => {
            if (other !== cur && !other.paused) { other.pause(); }
          });
        }
        const p = cur.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else {
        cur.pause();
      }
      syncAB();
    });

    abBtns.forEach((b, bi) => {
      b.addEventListener('click', e => { e.stopPropagation(); switchTrack(bi); });
    });

    wave.addEventListener('click', e => {
      e.stopPropagation();
      const cur = activeTrack();
      const dur = Number.isFinite(cur.duration) && cur.duration > 0 ? cur.duration : 0;
      if (dur <= 0) return;
      const r = wave.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const tPos = ratio * dur;
      tracks.forEach(t => { try { if (t.readyState >= 1) t.currentTime = tPos; } catch (_) {} });
      syncAB();
    });

    tracks.forEach(t => {
      ['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata'].forEach(ev => t.addEventListener(ev, syncAB));
    });
    syncAB();
    const api = { box, slide: box.closest('.slide'), stop: stopAB, switchTrack, get activeIdx() { return activeIdx; } };
    box._soundAB = api;
    abControllers.push(api);
  });

  // ---- Enhance standalone <audio data-sound-demo> (not inside [data-sound-ab])
  document.querySelectorAll('audio[data-sound-demo]').forEach((audio, idx) => {
    if (audio.closest('[data-sound-ab]')) return;
    const label = audio.dataset.label || audio.getAttribute('aria-label') || ('實測音檔 ' + (idx + 1));
    const fallbackDur = parseFloat(audio.dataset.duration || '0');
    const bar = document.createElement('div');
    bar.className = 'sound-demo-bar live-ctrl';
    bar.setAttribute('data-sound-ui', '');

    bar.innerHTML =
      '<button type="button" class="sound-play-btn" data-sound-toggle aria-label="播放或暫停 ' + label.replace(/"/g, '&quot;') + '">▶</button>' +
      '<div class="sound-meta">' +
        '<div class="sound-head"><span class="sound-label">' + label.replace(/</g, '&lt;') + '</span><span class="sound-clock">0:00 / ' + fmtTime(fallbackDur) + '</span></div>' +
        '<div class="sound-wave" role="slider" aria-label="音訊進度">' + makeWaveHtml(idx) + '</div>' +
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
      if (isStill()) return;
      if (audio.paused || audio.ended) {
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
  function autoplayVisibleVideos(sl) {
    if (!sl || isReduced()) return;
    sl.querySelectorAll('video[data-slide-video][data-autoplay]').forEach(v => {
      if (v.closest('[data-step-hidden="1"]')) return;
      if (!v.paused && !v.ended) return;
      v.muted = true;
      try { v.currentTime = videoStart(v); } catch (_) {}
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
  }

  function enterSlide(sl, reduced) {
    if (!sl || reduced || isReduced()) { stopAllMedia(); return; }
    autoplayVisibleVideos(sl);
  }

  deck.stage.addEventListener('deck:slideleave', ({ detail }) => stopSlideMedia(detail.slide));
  deck.stage.addEventListener('deck:slideenter', ({ detail }) => enterSlide(detail.slide, detail.reducedMotion || detail.staticMode));
  deck.stage.addEventListener('deck:stepchange', ({ detail }) => {
    if (!detail.slide || isReduced()) return;
    if (detail.dir >= 0) autoplayVisibleVideos(detail.slide);
    detail.slide.querySelectorAll('video[data-slide-video]').forEach(v => {
      if (v.closest('[data-step-hidden="1"]') && !v.paused) { try { v.pause(); } catch (_) {} }
    });
  });
  deck.stage.addEventListener('deck:still', ({ detail }) => { if (detail.still) stopAllMedia(); });
  deck.stage.addEventListener('deck:lowpower', ({ detail }) => { if (detail.lowPower) stopAllMedia(); });
  deck.stage.addEventListener('deck:reducedmotion', ({ detail }) => { if (detail.reduced) stopAllMedia(); });

  if (!isReduced() && deck.slides[deck.index]) {
    enterSlide(deck.slides[deck.index], false);
  }
})();
