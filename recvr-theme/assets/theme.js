/* ==========================================================================
   RECVR™ theme — vanilla JS, no dependencies.
   Scroll reveal · sticky header · mobile nav · accordions · ticker ·
   gallery swap · color swatches · add-to-cart feedback
   Editor-safe: re-initialises sections re-rendered by the Shopify theme
   editor and never leaves content hidden if JS hiccups.
   ========================================================================== */
(function () {
  'use strict';

  var inEditor = window.Shopify && window.Shopify.designMode;

  ready(function () {
    window.__recvrReady = true;
    revealInit(document);
    stickyHeader();
    bindAll(document);

    /* Shopify theme editor: re-render hooks so edited sections come back
       to life (reveal + interactions) instead of staying invisible. */
    document.addEventListener('shopify:section:load', function (e) {
      revealNow(e.target);
      bindAll(e.target);
      pixelCanvas(e.target);
    });
    document.addEventListener('shopify:section:select', function (e) {
      revealNow(e.target);
    });

    pixelCanvas(document);
  });

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function bindAll(root) {
    mobileNav(root);
    accordions(root);
    configurator(root);
    addToCart(root);
  }

  /* --- Scroll reveal --------------------------------------------------- */
  function revealNow(root) {
    (root || document).querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  function revealInit(root) {
    var els = (root || document).querySelectorAll('.reveal');
    if (!els.length) return;

    // In the editor (or without IntersectionObserver), just show everything.
    if (inEditor || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* --- Sticky header shadow on scroll ---------------------------------- */
  function stickyHeader() {
    var header = document.querySelector('[data-header]');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Mobile hamburger menu ------------------------------------------- */
  function mobileNav(root) {
    var burger = (root || document).querySelector('[data-burger]');
    var nav = (root || document).querySelector('[data-mobile-nav]');
    if (!burger || !nav || burger.dataset.bound) return;
    burger.dataset.bound = '1';
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
      });
    });
  }

  /* --- Accordions ------------------------------------------------------ */
  function accordions(root) {
    var items = (root || document).querySelectorAll('[data-accordion-item]');
    items.forEach(function (item) {
      if (item.dataset.bound) return;
      item.dataset.bound = '1';
      var trigger = item.querySelector('[data-accordion-trigger]');
      var panel = item.querySelector('[data-accordion-panel]');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        var group = item.closest('[data-accordion]');
        if (group) {
          group.querySelectorAll('[data-accordion-item].is-open').forEach(function (sib) {
            if (sib !== item) {
              sib.classList.remove('is-open');
              var sp = sib.querySelector('[data-accordion-panel]');
              if (sp) sp.style.maxHeight = null;
            }
          });
        }
        if (isOpen) {
          item.classList.remove('is-open');
          panel.style.maxHeight = null;
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* --- Configurator: gallery thumbnails + color swatches --------------- */
  function configurator(root) {
    root = root || document;
    var main = root.querySelector('#ProdMain') || document.getElementById('ProdMain');
    var caption = document.getElementById('ProdCaption');
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-thumb]'));

    thumbs.forEach(function (thumb) {
      if (thumb.dataset.bound) return;
      thumb.dataset.bound = '1';
      thumb.addEventListener('click', function () {
        var src = thumb.dataset.img;
        if (src && main && main.tagName === 'IMG') {
          main.style.opacity = '0';
          setTimeout(function () {
            main.src = src;
            main.style.opacity = '1';
          }, 120);
        }
        if (caption && thumb.dataset.cap) caption.textContent = thumb.dataset.cap;
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });
    });

    var label = document.querySelector('[data-swatch-label]');
    var swatches = Array.prototype.slice.call(root.querySelectorAll('[data-swatch]'));
    swatches.forEach(function (sw) {
      if (sw.dataset.bound) return;
      sw.dataset.bound = '1';
      sw.addEventListener('click', function () {
        swatches.forEach(function (s) {
          s.classList.remove('is-active');
          s.setAttribute('aria-checked', 'false');
        });
        sw.classList.add('is-active');
        sw.setAttribute('aria-checked', 'true');
        if (label && sw.dataset.swatch) label.textContent = sw.dataset.swatch;
      });
    });
  }

  /* --- Add to cart: "✓ Added!" green flash for 2 seconds --------------- */
  function addToCart(root) {
    var btns = (root || document).querySelectorAll('[data-add-to-cart]');
    btns.forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        if (btn.dataset.busy === '1') return;
        btn.dataset.busy = '1';
        var original = btn.innerHTML;
        var bg = btn.style.background;
        var color = btn.style.color;
        btn.innerHTML = '✓ Added!';
        btn.style.background = '#16A34A';
        btn.style.color = '#FFFFFF';
        setTimeout(function () {
          btn.innerHTML = original;
          btn.style.background = bg;
          btn.style.color = color;
          btn.dataset.busy = '0';
        }, 2000);
      });
    });
  }

  /* --- "Silent Precision" pixel canvas (ported from PixelHero) --------- */
  function pixelCanvas(root) {
    var canvases = (root || document).querySelectorAll('[data-pixel-canvas]');
    if (!canvases.length) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    canvases.forEach(function (canvas) {
      if (canvas.dataset.bound) return;
      canvas.dataset.bound = '1';
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      var wrap = canvas.parentNode;
      var gap = parseInt(canvas.dataset.gap, 10) || 6;
      var speed = (parseInt(canvas.dataset.speed, 10) || 35) * 0.001;
      var colors = (canvas.dataset.colors || 'rgba(255,255,255,0.12)').split(',');
      var pixels = [];

      function rand(min, max) { return Math.random() * (max - min) + min; }

      function build() {
        var rect = wrap.getBoundingClientRect();
        var w = Math.floor(rect.width);
        var h = Math.floor(rect.height);
        if (!w || !h) return;
        canvas.width = w;
        canvas.height = h;
        pixels = [];
        for (var x = 0; x < w; x += gap) {
          for (var y = 0; y < h; y += gap) {
            var dx = x - w / 2, dy = y - h / 2;
            pixels.push({
              x: x, y: y,
              color: colors[Math.floor(Math.random() * colors.length)],
              size: 0,
              maxSize: rand(0.5, 2),
              sizeStep: rand(0.12, 0.28),
              speed: rand(0.08, 0.4) * speed,
              delay: reduced ? 0 : Math.sqrt(dx * dx + dy * dy) * 0.55,
              counter: 0,
              counterStep: rand(1.8, 3.2),
              shimmer: false,
              reverse: false
            });
          }
        }
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < pixels.length; i++) {
          var p = pixels[i];
          if (p.counter <= p.delay) { p.counter += p.counterStep; continue; }
          if (p.size >= p.maxSize) p.shimmer = true;
          if (p.shimmer) {
            if (p.size >= p.maxSize) p.reverse = true;
            else if (p.size <= 0.5) p.reverse = false;
            p.size += p.reverse ? -p.speed : p.speed;
          } else {
            p.size += p.sizeStep;
          }
          var offset = 1 - p.size * 0.5;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
        }
        requestAnimationFrame(draw);
      }

      build();
      draw();

      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(build, 200);
      }, { passive: true });
    });
  }
})();
