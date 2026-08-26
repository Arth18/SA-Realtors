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
    /* Observe with a generous top margin so elements re-hide as soon as they
       scroll back above the viewport, allowing the entrance to replay. */
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
        } else {
          /* Only reset when the element has scrolled *above* the viewport
             (boundingClientRect.top < 0 means it exited from the top). */
          if (e.boundingClientRect.top < 0) {
            e.target.classList.remove('in');
          }
        }
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
     HERO SCROLL DRIVER  (home page only)

     Reads scroll progress through the tall .hero section and writes
     CSS custom properties so the panel, sub-copy and CTA can animate
     in CSS without needing WAAPI or a scroll-timeline polyfill.
     Also resets when the user scrolls back to the very top.
     ======================================================= */
  (function heroScroll() {
    var hero  = document.querySelector('.hero');
    var stage = document.getElementById('stage');
    if (!hero || !stage) return;

    /* Compact/portrait layouts disable the sticky scroll effect in CSS;
       skip the JS driver on those viewports too. */
    var isCompact = function () {
      return DEVICE_GATES.some(function (q) { return window.matchMedia(q).matches; }) ||
             window.matchMedia(RM_GATE).matches;
    };

    var settled = document.querySelector('.herotext .settle');
    var sub     = document.querySelector('.herotext .settle__sub');
    var cta     = document.querySelector('.herotext .settle__cta');

    var rafId = null;
    var lastK = -1; /* sentinel — forces first paint */

    function tick() {
      rafId = null;
      if (isCompact()) {
        /* On compact layout just make sure everything is fully visible */
        if (settled) { settled.style.removeProperty('opacity'); settled.style.removeProperty('transform'); }
        if (sub)     { sub.style.removeProperty('opacity');     sub.style.removeProperty('transform'); }
        if (cta)     { cta.style.removeProperty('opacity');     cta.style.removeProperty('transform'); }
        return;
      }

      var heroH  = hero.offsetHeight;          /* full tall height (260 vh) */
      var viewH  = window.innerHeight;
      /* scrollable distance inside the hero section (after the sticky viewport) */
      var travel = heroH - viewH;
      var scrollY = window.scrollY || window.pageYOffset;
      /* raw 0..1 progress; clamped so it never over- or under-shoots */
      var raw = travel > 0 ? clamp(scrollY / travel, 0, 1) : 0;

      if (Math.abs(raw - lastK) < 0.001) return; /* no meaningful change */
      lastK = raw;

      /* --- panel slide (subtle translateX) --- */
      /* k=0 → fully on screen, k=1 → fully scrolled through */
      var panelX = raw * -34;   /* slides left as you scroll */
      var panelO = clamp(1 - raw * 1.8, 0, 1);

      /* sub-copy fades out a little earlier */
      var subO = clamp(1 - raw * 2.2, 0, 1);
      var subY = raw * 12;

      /* CTA fades last */
      var ctaO = clamp(1 - raw * 2.6, 0, 1);
      var ctaY = raw * 12;

      if (settled) {
        settled.style.opacity   = panelO;
        settled.style.transform = 'translateX(' + panelX.toFixed(1) + 'px)';
      }
      if (sub) {
        sub.style.opacity   = subO;
        sub.style.transform = 'translateY(' + subY.toFixed(1) + 'px)';
      }
      if (cta) {
        cta.style.opacity   = ctaO;
        cta.style.transform = 'translateY(' + ctaY.toFixed(1) + 'px)';
      }
    }

    function onScroll() {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    /* run once on load so the initial state is correct */
    tick();

    /* If the viewport size changes (rotate, resize) recalculate */
    window.addEventListener('resize', function () {
      lastK = -1;
      onScroll();
    }, { passive: true });
  })();

  /* =======================================================
     HERO  (home page only)

     Video plays and loops on its own. Message is visible immediately
     without needing to scroll. The survey boundary draws itself in
     once when the page loads, then holds.
     ======================================================= */
  (function heroModule() {
    var hero = document.querySelector('.hero');
    var stage = document.getElementById('stage');
    var video = document.getElementById('hero');
    var poster = document.getElementById('poster');
    var ringEl = document.getElementById('loadring');
    var lot = document.getElementById('lot');
    if (!hero || !stage || !video || !poster) return;

    var VIDEO_URL = 'assets/hero-scrub.mp4';
    var POSTER_URL = 'assets/hero-poster.webp';
    var ring = ringEl ? ringEl.querySelector('circle') : null;
    var hudState = document.getElementById('hudState');

    /* the mask needs its real path length before it can draw itself */
    var maskPath = document.getElementById('lotMaskPath');
    if (maskPath && maskPath.getTotalLength) {
      try { maskPath.style.setProperty('--len', Math.ceil(maskPath.getTotalLength())); }
      catch (e) { /* default */ }
    }

    function paintPoster() {
      poster.style.backgroundImage = "url('" + POSTER_URL + "')";
    }

    function playVideo() {
      video.src = VIDEO_URL;
      video.load();
      var canplay = function () {
        stage.classList.add('video-ready');
        var p = video.play();
        if (p && p.catch) p.catch(function () { /* autoplay was blocked, poster stays */ });
      };
      video.addEventListener('canplay', canplay, { once: true });
      video.addEventListener('error', function () {
        stage.classList.add('video-failed');
      });
    }

    function drawBoundary() {
      if (!lot || rmq.matches) {
        if (lot) { lot.style.setProperty('--draw', '1'); lot.classList.add('is-drawn'); }
        if (hudState) hudState.textContent = 'Boundary set';
        return;
      }
      /* eased 0..1 over 2.4s, then the pegs land and the readout flips */
      var start = 0;
      function tick(now) {
        if (!start) start = now;
        var t = Math.min(1, (now - start) / 2400);
        var e = t * t * (3 - 2 * t);
        lot.style.setProperty('--draw', e.toFixed(3));
        if (t < 1) requestAnimationFrame(tick);
        else {
          lot.classList.add('is-drawn');
          if (hudState) hudState.textContent = 'Boundary set';
        }
      }
      requestAnimationFrame(tick);
    }

    function start() {
      paintPoster();
      /* let the poster paint one frame first, so nothing pops in cold */
      var img = new Image();
      img.onload = playVideo;
      img.onerror = playVideo;
      img.src = POSTER_URL;
      /* the boundary can start straight away, independent of the video */
      setTimeout(drawBoundary, 900);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }

    /* the compact layout swaps the video's crop anchor; keep the SVG in sync */
    function syncLotAnchor() {
      if (!lot) return;
      var compact = DEVICE_GATES.some(function (q) { return window.matchMedia(q).matches; });
      lot.setAttribute('preserveAspectRatio', compact ? 'xMaxYMid slice' : 'xMidYMid slice');
    }
    syncLotAnchor();
    DEVICE_GATES.forEach(function (q) {
      var m = window.matchMedia(q);
      var fn = function () { syncLotAnchor(); };
      if (m.addEventListener) m.addEventListener('change', fn);
      else if (m.addListener) m.addListener(fn);
    });

    /* pause the video off-screen to save the visitor's battery */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { if (video.paused && !rmq.matches) video.play().catch(function () {}); }
        else if (!video.paused) video.pause();
      }, { rootMargin: '10px' }).observe(hero);
    }

    /* reduced motion: no video at all, just the ending frame */
    function onMotionFlip() {
      if (rmq.matches) {
        video.pause();
        stage.classList.add('rm-still');
        if (lot) { lot.style.setProperty('--draw', '1'); lot.classList.add('is-drawn'); }
        if (hudState) hudState.textContent = 'Boundary set';
      } else {
        stage.classList.remove('rm-still');
        if (video.paused) video.play().catch(function () {});
      }
    }
    if (rmq.addEventListener) rmq.addEventListener('change', onMotionFlip);
    else if (rmq.addListener) rmq.addListener(onMotionFlip);
    if (rmq.matches) onMotionFlip();
  })();

  /* =======================================================
     CAROUSEL  (home page: recently sold, our team)

     Every rail marked .js-carousel gets duplicated so the loop is seamless,
     then a CSS keyframe scrolls it at a speed derived from its own length.
     ======================================================= */
  (function carouselModule() {
    var rails = [].slice.call(document.querySelectorAll('.js-carousel'));
    if (!rails.length) return;

    rails.forEach(function (rail) {
      var track = rail.querySelector('.carousel__track');
      if (!track) return;
      var originals = [].slice.call(track.children);
      if (!originals.length) return;

      /* clone once so the loop can wrap invisibly */
      originals.forEach(function (n) { track.appendChild(n.cloneNode(true)); });

      var measure = function () {
        var half = 0;
        for (var i = 0; i < originals.length; i++) {
          half += track.children[i].getBoundingClientRect().width;
          var cs = window.getComputedStyle(track);
          half += parseFloat(cs.columnGap || cs.gap || 0);
        }
        rail.style.setProperty('--w', half + 'px');
        /* pace: about 90 pixels per second, easy to read at a glance */
        var seconds = Math.max(20, Math.round(half / 90));
        rail.style.setProperty('--dur', seconds + 's');
      };
      /* wait for images so widths settle */
      var imgs = [].slice.call(track.querySelectorAll('img'));
      var pending = imgs.filter(function (i) { return !i.complete; }).length;
      if (!pending) requestAnimationFrame(measure);
      else imgs.forEach(function (i) {
        if (i.complete) return;
        i.addEventListener('load',  function () { if (--pending === 0) measure(); }, { once: true });
        i.addEventListener('error', function () { if (--pending === 0) measure(); }, { once: true });
      });
      window.addEventListener('resize', function () { requestAnimationFrame(measure); }, { passive: true });
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
      var s = suburb ? suburb.value : '';
      var t = type ? type.value : '';
      var st = status ? status.value : '';
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
      var key = form.getAttribute('data-access-key') || 'YOUR_ACCESS_KEY_HERE';
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: key,
          subject: subject,
          name: g('f-name'),
          phone: g('f-phone'),
          email: g('f-email'),
          want: g('f-want'),
          message: g('f-note') || 'None',
          page: window.location.href
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send my enquiry';
        }
        if (data.success) {
          if (done) {
            done.hidden = false;
            var doneMsg = document.getElementById('formDoneMsg');
            if (doneMsg) {
              doneMsg.textContent = 'Your enquiry has been received. We will get back to you shortly!';
            }
          }
          form.reset();
        } else {
          alert('Submission error: ' + (data.message || 'Please check your configuration.'));
        }
      })
      .catch(function(err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send my enquiry';
        }
        alert('Failed to send enquiry. Please check your internet connection and try again.');
      });
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
