/* =========================================================
   SA Realtors — shared script for every page.
   Each module is guarded, so pages without a hero, a survey block
   or a form simply skip that code instead of throwing.
   ========================================================= */
(function () {
  'use strict';

  var clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  var smoothstep = function (p, e0, e1) {
    var t = clamp((p - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  function rng(seed) {
    var s = seed >>> 0;
    return function () { return (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  }
  function seedOf(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  var DEVICE_GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)'
  ];
  var RM_GATE = '(prefers-reduced-motion: reduce)';
  var rmq = window.matchMedia(RM_GATE);

  /* things other modules need to pin when reduced motion flips on */
  var pins = [];
  var unpins = [];

  /* =======================================================
     NAV  (every page)
     ======================================================= */
  (function nav() {
    var el = document.getElementById('nav');
    var toggle = document.getElementById('navtoggle');
    var links = document.getElementById('navlinks');
    if (!el) return;

    var stuck = false;
    window.addEventListener('scroll', function () {
      var s = window.scrollY > 24;
      if (s !== stuck) { stuck = s; el.classList.toggle('is-stuck', s); }
    }, { passive: true });

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        el.classList.toggle('is-open', !open);
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          toggle.setAttribute('aria-expanded', 'false');
          el.classList.remove('is-open');
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && el.classList.contains('is-open')) {
          toggle.setAttribute('aria-expanded', 'false');
          el.classList.remove('is-open');
          toggle.focus();
        }
      });
    }
  })();

  /* =======================================================
     SECTION ENTRANCES  (every page)
     ======================================================= */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  (function reveals() {
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { obs.observe(el); });

    var secObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('on', e.isIntersecting); });
    }, { rootMargin: '80px' });
    [].slice.call(document.querySelectorAll('.sec')).forEach(function (s) { secObs.observe(s); });
  })();

  pins.push(function () { revealEls.forEach(function (el) { el.classList.add('in'); }); });

  document.addEventListener('visibilitychange', function () {
    document.body.classList.toggle('paused', document.hidden);
  });

  /* self-drawing lines need their real length */
  [].slice.call(document.querySelectorAll('.plan__roads path')).forEach(function (p) {
    if (!p.getTotalLength) return;
    try { p.style.setProperty('--len', Math.ceil(p.getTotalLength())); } catch (e) { /* default */ }
  });

  /* =======================================================
     HERO  (home page only)
     ======================================================= */
  (function heroModule() {
    var hero = document.querySelector('.hero');
    var stage = document.getElementById('stage');
    var video = document.getElementById('hero');
    var poster = document.getElementById('poster');
    var cue = document.getElementById('cue');
    var ringEl = document.getElementById('loadring');
    var lot = document.getElementById('lot');
    if (!hero || !stage || !video || !poster) return;

    var VIDEO_URL = 'assets/hero-scrub.mp4';
    var VIDEO_BYTES = 4180097;
    var POSTER_URL = 'assets/hero-poster.webp';
    var ring = ringEl ? ringEl.querySelector('circle') : null;

    var bands = [].slice.call(document.querySelectorAll('.band')).map(function (el) {
      return {
        el: el, a: parseFloat(el.dataset.a), b: parseFloat(el.dataset.b),
        ramp: el.dataset.ramp ? parseFloat(el.dataset.ramp) : 0,
        entrance: el.dataset.entrance || '', op: -1, k: -1
      };
    });

    function splitLine(el, entrance, spread) {
      var text = el.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;
      var rand = rng(seedOf(text));
      var mode = el.dataset.split || 'word';
      el.textContent = '';
      var sr = document.createElement('span');
      sr.className = 'vh'; sr.textContent = text;
      el.appendChild(sr);
      var vis = document.createElement('span');
      vis.setAttribute('aria-hidden', 'true');
      var words = text.split(' ');
      var totalChars = text.replace(/ /g, '').length;
      var charSeen = 0;
      words.forEach(function (word, wi) {
        var w = document.createElement('span');
        w.className = 'w';
        if (mode === 'char') {
          for (var ci = 0; ci < word.length; ci++) {
            var c = document.createElement('span');
            c.className = 'c'; c.textContent = word[ci];
            c.style.setProperty('--th', ((charSeen / totalChars) * spread + rand() * 0.06).toFixed(4));
            c.style.setProperty('--jx', (-14 - rand() * 26).toFixed(1) + 'px');
            w.appendChild(c); charSeen++;
          }
        } else {
          w.textContent = word;
          var t;
          if (entrance === 'part') {
            var left = wi < words.length / 2;
            t = (left ? (words.length / 2 - wi) : (wi - words.length / 2 + 1)) / words.length * spread;
            w.style.setProperty('--jx', (left ? 34 + rand() * 14 : -(34 + rand() * 14)).toFixed(1) + 'px');
          } else {
            t = (wi / words.length) * spread + rand() * 0.04;
          }
          w.style.setProperty('--th', t.toFixed(4));
        }
        if (wi < words.length - 1) w.appendChild(document.createTextNode(' '));
        vis.appendChild(w);
      });
      el.appendChild(vis);
    }

    bands.forEach(function (b) {
      var spread = b.el.dataset.spread ? parseFloat(b.el.dataset.spread) : 0.5;
      [].slice.call(b.el.querySelectorAll('[data-split]')).forEach(function (line) {
        splitLine(line, b.entrance, spread);
      });
    });

    var maskPath = document.getElementById('lotMaskPath');
    if (maskPath && maskPath.getTotalLength) {
      try { maskPath.style.setProperty('--len', Math.ceil(maskPath.getTotalLength())); } catch (e) { /* default */ }
    }

    /* The supplied clip glides at a constant rate and never slows, so a linear
       scroll-to-time map would leave the page settling mid-movement. Hold a
       constant rate to 70% of the scroll, then decelerate to a stop. Velocity is
       matched at the join so the change of pace is not felt, only the arrival. */
    function videoEase(p) {
      var K = 0.70, S = 1.176, TK = K * S;
      if (p <= K) return p * S;
      var u = (p - K) / (1 - K);
      return TK + (1 - TK) * (1 - (1 - u) * (1 - u));
    }

    var target = 0, shown = 0, rafId = null, lastTick = 0;
    var heroOnScreen = true, scrubOn = false;
    var loadK = 0, loadStart = 0, loadRamping = false;
    var lastCue = -1, lastDraw = -1, lotDrawn = false;
    var hudAlt = document.getElementById('hudAlt');
    var hudState = document.getElementById('hudState');
    var lastAlt = -1, lastState = '';

    function heroProgress() {
      var span = hero.offsetHeight - window.innerHeight;
      if (span <= 0) return 0;
      return clamp(-hero.getBoundingClientRect().top / span, 0, 1);
    }

    var seekBusy = false, pendingTime = null;
    function requestSeek(t) {
      if (!video.duration || isNaN(video.duration)) return;
      if (seekBusy) { pendingTime = t; return; }
      seekBusy = true;
      try { video.currentTime = t; } catch (e) { seekBusy = false; }
    }
    video.addEventListener('seeked', function () {
      seekBusy = false;
      if (pendingTime !== null) { var t = pendingTime; pendingTime = null; requestSeek(t); }
    });
    video.addEventListener('error', function () {
      seekBusy = false; pendingTime = null; failVideo();
    });

    function updateCaptions(p) {
      for (var i = 0; i < bands.length; i++) {
        var b = bands[i];
        var f = Math.min(0.02, (b.b - b.a) / 3);
        var inEase = (i === 0) ? 1 : smoothstep(p, b.a, b.a + f);
        var outEase = (i === bands.length - 1) ? 1 : (1 - smoothstep(p, b.b - f, b.b));
        var op = inEase * outEase;
        var ramp = b.ramp || Math.min(0.025, (b.b - b.a) * 0.35);
        var k = clamp((p - b.a) / ramp, 0, 1);
        if (i === 0 && loadK > k) k = loadK;
        if (Math.abs(op - b.op) > 0.004) { b.op = op; b.el.style.opacity = op.toFixed(3); }
        if (Math.abs(k - b.k) > 0.008) {
          b.k = k;
          b.el.style.setProperty('--k', k.toFixed(3));
          if (b.entrance === 'settle') {
            b.el.style.setProperty('--ks', clamp((k - 0.66) * 4, 0, 1).toFixed(3));
            b.el.style.setProperty('--kb', clamp((k - 0.78) * 5, 0, 1).toFixed(3));
          }
        }
      }
      var draw = smoothstep(p, 0.80, 0.985);
      if (Math.abs(draw - lastDraw) > 0.006) {
        lastDraw = draw;
        if (lot) lot.style.setProperty('--draw', draw.toFixed(3));
        var want = draw > 0.9;
        if (lot && want !== lotDrawn) { lotDrawn = want; lot.classList.toggle('is-drawn', want); }
      }
      /* the readout: only ever written when a value actually changes */
      if (hudAlt) {
        var alt = Math.round((240 - 185 * p) / 5) * 5;
        if (alt !== lastAlt) { lastAlt = alt; hudAlt.textContent = alt + ' m'; }
      }
      if (hudState) {
        var st = p > 0.82 ? 'Boundary set' : p > 0.34 ? 'Descending' : 'Surveying';
        if (st !== lastState) { lastState = st; hudState.textContent = st; }
      }

      if (cue) {
        var cueOp = 1 - smoothstep(p, 0.01, 0.07);
        if (Math.abs(cueOp - lastCue) > 0.02) { lastCue = cueOp; cue.style.setProperty('--cue', cueOp.toFixed(2)); }
      }
    }

    function tick(now) {
      var dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      if (loadRamping) {
        loadK = clamp((now - loadStart) / 900, 0, 1);
        if (loadK >= 1) loadRamping = false;
      }
      shown += (target - shown) * (1 - Math.pow(1 - 0.16, dt / 16.667));
      if (Math.abs(target - shown) < 0.0005 && !loadRamping) {
        shown = target; rafId = null; lastTick = 0;
      } else {
        rafId = requestAnimationFrame(tick);
      }
      if (video.duration) requestSeek(videoEase(shown) * video.duration);
      updateCaptions(shown);
    }

    function onScroll() {
      target = heroProgress();
      if (rafId === null && heroOnScreen) { lastTick = 0; rafId = requestAnimationFrame(tick); }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        heroOnScreen = es[0].isIntersecting;
        if (heroOnScreen && rafId === null && scrubOn) { lastTick = 0; rafId = requestAnimationFrame(tick); }
      }, { rootMargin: '10px' }).observe(hero);
    }

    var heroInit = false, blobStarted = false;
    function failVideo() {
      if (ringEl) ringEl.classList.remove('is-on');
      stage.classList.add('video-failed');
    }
    function startBlobFetch() {
      if (blobStarted) return;
      blobStarted = true;
      loadHeroBlob()['catch'](failVideo);
    }
    function loadHeroBlob() {
      if (!window.fetch || !window.AbortController) return Promise.reject(new Error('no fetch'));
      var ctrl = new AbortController();
      var watchdog = setTimeout(function () { ctrl.abort(); }, 20000);
      if (ringEl) ringEl.classList.add('is-on');
      var opts = { signal: ctrl.signal };
      try { opts.priority = 'low'; } catch (e) { /* ignore */ }
      return fetch(VIDEO_URL, opts).then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        var total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
        if (!res.body || !res.body.getReader) {
          clearTimeout(watchdog);
          return res.blob().then(attach);
        }
        var reader = res.body.getReader();
        var chunks = [], got = 0, lastRing = 0;
        return (function pump() {
          return reader.read().then(function (r) {
            if (r.done) { clearTimeout(watchdog); return attach(new Blob(chunks)); }
            clearTimeout(watchdog);
            watchdog = setTimeout(function () { ctrl.abort(); }, 20000);
            chunks.push(r.value);
            got += r.value.length;
            var frac = Math.min(1, got / total);
            var now = performance.now();
            if (now - lastRing > 100 || frac === 1) {
              lastRing = now;
              if (ring) ring.style.setProperty('--ld', Math.round(126 * (1 - frac)));
            }
            return pump();
          });
        })();
      });
      function attach(blob) {
        if (ring) ring.style.setProperty('--ld', 0);
        if (ringEl) ringEl.classList.remove('is-on');
        video.src = URL.createObjectURL(blob);
        video.load();
        video.addEventListener('canplay', function () {
          requestSeek(videoEase(heroProgress()) * video.duration);
          stage.classList.add('video-ready');
        }, { once: true });
      }
    }
    function initHeroOnce() {
      if (heroInit) return;
      heroInit = true;
      poster.style.backgroundImage = "url('" + POSTER_URL + "')";
      loadStart = performance.now();
      loadRamping = true;
      var img = new Image();
      img.onload = startBlobFetch;
      img.onerror = startBlobFetch;
      img.src = POSTER_URL;
      setTimeout(startBlobFetch, 4000);
    }

    function syncLotAnchor() {
      if (!lot) return;
      var compact = DEVICE_GATES.some(function (q) { return window.matchMedia(q).matches; });
      lot.setAttribute('preserveAspectRatio', compact ? 'xMaxYMid slice' : 'xMidYMid slice');
    }

    function enableScrub() {
      if (scrubOn) return;
      scrubOn = true;
      initHeroOnce();
      window.addEventListener('scroll', onScroll, { passive: true });
      bands.forEach(function (b) { b.op = -1; b.k = -1; });
      lastCue = -1; lastDraw = -1;
      if (lot) { lot.style.setProperty('--draw', '0'); lot.classList.remove('is-drawn'); lotDrawn = false; }
      updateCaptions(heroProgress());
      onScroll();
    }
    function disableScrub() {
      if (!scrubOn) return;
      scrubOn = false;
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }
    function applyHeroMode() {
      syncLotAnchor();
      if (rmq.matches) {
        disableScrub();
        if (lot) { lot.style.setProperty('--draw', '1'); lot.classList.add('is-drawn'); lotDrawn = true; }
        bands.forEach(function (b) { b.el.style.setProperty('--k', '1'); b.k = 1; });
      } else {
        enableScrub();
        bands.forEach(function (b) { b.op = -1; b.k = -1; });
        lastCue = -1; lastDraw = -1;
        updateCaptions(heroProgress());
      }
    }

    DEVICE_GATES.concat([RM_GATE]).forEach(function (q) {
      var m = window.matchMedia(q);
      if (m.addEventListener) m.addEventListener('change', applyHeroMode);
      else if (m.addListener) m.addListener(applyHeroMode);
    });

    window.addEventListener('resize', function () {
      bands.forEach(function (b) { b.op = -1; b.k = -1; });
      if (scrubOn) onScroll();
    }, { passive: true });

    /* whisper-level dust in the hero sky */
    (function dust() {
      var r = rng(20260820);
      var frag = document.createDocumentFragment();
      for (var i = 0; i < 14; i++) {
        var d = document.createElement('span');
        d.className = 'dust';
        var size = (2 + r() * 3.4).toFixed(1);
        d.style.width = d.style.height = size + 'px';
        d.style.left = (r() * 100).toFixed(2) + '%';
        d.style.top = (2 + r() * 38).toFixed(2) + '%';
        d.style.setProperty('--dx', (-40 + r() * 80).toFixed(0) + 'px');
        d.style.setProperty('--dy', (14 + r() * 50).toFixed(0) + 'px');
        d.style.animation = 'dustdrift ' + (62 + r() * 44).toFixed(0) + 's ease-in-out ' +
          (-(r() * 60)).toFixed(0) + 's infinite alternate';
        frag.appendChild(d);
      }
      stage.appendChild(frag);
    })();

    pins.push(applyHeroMode);
    unpins.push(applyHeroMode);
    applyHeroMode();
  })();

  /* =======================================================
     PRESS AND HOLD TO SURVEY  (home page only)
     ======================================================= */
  (function surveyModule() {
    var frame = document.querySelector('.survey__frame');
    var hit = document.getElementById('surveyHit');
    if (!frame || !hit) return;

    var sizes = document.getElementById('sizes');
    var hudArea = document.getElementById('hudArea');
    var hudZone = document.getElementById('hudZone');
    var hudStatus = document.getElementById('hudStatus');
    var hint = document.getElementById('surveyHint');
    var maskPath = document.getElementById('surveyMaskPath');

    if (maskPath && maskPath.getTotalLength) {
      try { maskPath.style.setProperty('--len', Math.ceil(maskPath.getTotalLength())); } catch (e) { /* default */ }
    }

    var hold = 0, holding = false, holdRaf = null, holdLast = 0, holdDone = false;
    var HOLD_MS = 1500, RELEASE_MS = 700;
    var lastHudAt = 0, lastArea = '', lastZone = '', lastStatus = '';

    function writeHud(now) {
      if (now - lastHudAt < 100) return;
      lastHudAt = now;
      var area = hold >= 1 ? '700m² to 10 acres' : Math.round(hold * 700) + 'm²';
      var zone = hold > 0.5 ? 'RESIDENTIAL & FUTURE' : '–';
      var stat = hold > 0.86 ? 'AVAILABLE NOW' : '–';
      if (area !== lastArea) { lastArea = area; hudArea.textContent = area; }
      if (zone !== lastZone) { lastZone = zone; hudZone.textContent = zone; }
      if (stat !== lastStatus) { lastStatus = stat; hudStatus.textContent = stat; }
    }
    function holdTick(now) {
      var dt = Math.min(100, now - (holdLast || now));
      holdLast = now;
      hold = clamp(hold + (holding ? dt / HOLD_MS : -dt / RELEASE_MS), 0, 1);
      if (holdDone) hold = 1;
      frame.style.setProperty('--hold', hold.toFixed(3));
      writeHud(now);
      if (hold >= 1 && !holdDone) {
        holdDone = true;
        frame.classList.add('is-done');
        if (sizes) sizes.classList.add('is-lit');
        if (hint) hint.textContent = 'Surveyed';
      }
      if ((holding && hold < 1) || (!holding && hold > 0)) {
        holdRaf = requestAnimationFrame(holdTick);
      } else { holdRaf = null; holdLast = 0; }
    }
    function startHold(e) {
      if (e && e.cancelable) e.preventDefault();
      holding = true;
      if (holdRaf === null) { holdLast = 0; holdRaf = requestAnimationFrame(holdTick); }
    }
    function endHold() {
      holding = false;
      if (holdRaf === null && hold > 0) { holdLast = 0; holdRaf = requestAnimationFrame(holdTick); }
    }
    hit.addEventListener('pointerdown', startHold);
    hit.addEventListener('pointerup', endHold);
    hit.addEventListener('pointercancel', endHold);
    hit.addEventListener('pointerleave', endHold);
    hit.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startHold(); }
    });
    hit.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') endHold(); });
    hit.addEventListener('blur', endHold);

    pins.push(function () {
      hold = 1; holdDone = true;
      frame.style.setProperty('--hold', '1');
      frame.classList.add('is-done');
      if (sizes) sizes.classList.add('is-lit');
      if (hint) hint.textContent = 'Surveyed';
      lastArea = '700m² to 10 acres'; hudArea.textContent = lastArea;
      lastZone = 'RESIDENTIAL & FUTURE'; hudZone.textContent = lastZone;
      lastStatus = 'AVAILABLE NOW'; hudStatus.textContent = lastStatus;
    });
    unpins.push(function () {
      hold = 0; holdDone = false; holding = false;
      frame.style.setProperty('--hold', '0');
      frame.classList.remove('is-done');
      if (sizes) sizes.classList.remove('is-lit');
      if (hint) hint.textContent = 'Press and hold';
      lastArea = ''; lastZone = ''; lastStatus = '';
      hudArea.textContent = '0'; hudZone.textContent = '–'; hudStatus.textContent = '–';
    });
  })();

  /* =======================================================
     PROPERTY FILTERS  (properties page only)
     ======================================================= */
  (function filterModule() {
    var form = document.getElementById('filters');
    var grid = document.querySelector('.js-grid');
    if (!form || !grid) return;

    var cards = [].slice.call(grid.querySelectorAll('.pcard'));
    var count = document.getElementById('filters-count');
    var suburb = document.getElementById('f-suburb');
    var type = document.getElementById('f-type');
    var status = document.getElementById('f-status');

    /* the home page's find bar deep links here, so honour the query string */
    try {
      var qs = new URLSearchParams(window.location.search);
      var qType = qs.get('type'), qSub = qs.get('suburb');
      if (qType && type) { type.value = qType; }
      if (qSub && suburb) {
        var has = [].slice.call(suburb.options).some(function (o) { return o.value === qSub || o.text === qSub; });
        if (has) suburb.value = qSub;
      }
    } catch (e) { /* no URLSearchParams, filters just start clear */ }

    var empty = document.createElement('div');
    empty.className = 'empty';
    empty.hidden = true;
    empty.innerHTML = '<span class="empty__mark" aria-hidden="true"></span>' +
      '<h2>Nothing matches that</h2>' +
      '<p>Try widening the filters, or tell us what you are after and we will call you when something fits.</p>' +
      '<a class="btn" href="#enquire">Tell us what you are after</a>';
    grid.parentNode.insertBefore(empty, grid.nextSibling);

    function apply() {
      var s = suburb.value, t = type.value, st = status.value;
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (!s || c.dataset.suburb === s) &&
                 (!t || c.dataset.kind === t) &&
                 (!st || c.dataset.state === st);
        c.hidden = !ok;
        if (ok) shown++;
      });
      empty.hidden = shown > 0;
      grid.hidden = shown === 0;
      if (count) count.textContent = shown === cards.length
        ? cards.length + ' properties'
        : shown + ' of ' + cards.length + ' properties';
    }
    [suburb, type, status].forEach(function (el) { if (el) el.addEventListener('change', apply); });
    form.addEventListener('reset', function () { setTimeout(apply, 0); });
    form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
    apply();
  })();

  /* =======================================================
     THE FORM  (most pages)
     ======================================================= */
  (function formModule() {
    var form = document.getElementById('form');
    if (!form) return;
    var done = document.getElementById('formDone');
    var fields = [
      { id: 'f-name', err: 'e-name', test: function (v) { return v.trim().length > 1; } },
      { id: 'f-phone', err: 'e-phone', test: function (v) { return v.replace(/[^0-9]/g, '').length >= 8; } },
      { id: 'f-email', err: 'e-email', test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } }
    ];
    fields.forEach(function (f) {
      var input = document.getElementById(f.id);
      if (!input) return;
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field.classList.contains('is-bad') && f.test(input.value)) {
          field.classList.remove('is-bad');
          document.getElementById(f.err).hidden = true;
        }
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      fields.forEach(function (f) {
        var input = document.getElementById(f.id);
        if (!input) return;
        var ok = f.test(input.value);
        input.closest('.field').classList.toggle('is-bad', !ok);
        document.getElementById(f.err).hidden = ok;
        if (!ok && !bad) bad = input;
      });
      if (bad) { bad.focus(); return; }
      var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      var subject = 'Enquiry from ' + g('f-name') + ' via ' + document.title.split('|')[0].trim();
      var body =
        'Name: ' + g('f-name') + '\n' +
        'Phone: ' + g('f-phone') + '\n' +
        'Email: ' + g('f-email') + '\n' +
        'Looking for: ' + g('f-want') + '\n' +
        'Page: ' + window.location.href + '\n\n' +
        'Notes: ' + (g('f-note') || 'None') + '\n';
      /* FORM ENDPOINT: composes a mail for now. Swap for the hosting handler at deploy. */
      window.location.href = 'mailto:contact@sarealtors.com.au' +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (done) done.hidden = false;
    });
  })();

  /* =======================================================
     REDUCED MOTION, live and in both directions
     ======================================================= */
  function onMotion() {
    if (rmq.matches) pins.forEach(function (f) { f(); });
    else unpins.forEach(function (f) { f(); });
  }
  if (rmq.addEventListener) rmq.addEventListener('change', onMotion);
  else if (rmq.addListener) rmq.addListener(onMotion);
  if (rmq.matches) pins.forEach(function (f) { f(); });

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

})();
