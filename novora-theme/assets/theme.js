/* ==========================================================================
   NOVORA theme — vanilla JS, no dependencies.
   Scroll reveal · sticky header · mobile nav · accordions · ticker ·
   gallery swap · color swatches · add-to-cart feedback
   Editor-safe: re-initialises sections re-rendered by the Shopify theme
   editor and never leaves content hidden if JS hiccups.
   ========================================================================== */
(function () {
  'use strict';

  var inEditor = window.Shopify && window.Shopify.designMode;

  ready(function () {
    window.__novoraReady = true;
    revealInit(document);
    stickyHeader();
    bindAll(document);

    /* Shopify theme editor: re-render hooks so edited sections come back
       to life (reveal + interactions) instead of staying invisible. */
    document.addEventListener('shopify:section:load', function (e) {
      revealNow(e.target);
      bindAll(e.target);
    });
    document.addEventListener('shopify:section:select', function (e) {
      revealNow(e.target);
    });
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

    function activateThumb(thumb) {
      if (!thumb) return;
      var src = thumb.dataset.img;
      if (src && main && main.tagName === 'IMG') {
        main.style.opacity = '0';
        setTimeout(function () { main.src = src; main.style.opacity = '1'; }, 120);
      }
      if (caption && thumb.dataset.cap) caption.textContent = thumb.dataset.cap;
      thumbs.forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
    }

    thumbs.forEach(function (thumb) {
      if (thumb.dataset.bound) return;
      thumb.dataset.bound = '1';
      thumb.addEventListener('click', function () { activateThumb(thumb); });
    });

    /* Thumbnail strip prev/next arrows */
    var strip = root.querySelector('[data-thumbs-strip]') || document.querySelector('[data-thumbs-strip]');
    var btnPrev = root.querySelector('[data-thumb-prev]') || document.querySelector('[data-thumb-prev]');
    var btnNext = root.querySelector('[data-thumb-next]') || document.querySelector('[data-thumb-next]');
    if (strip && btnPrev && btnNext && !strip.dataset.arrowsBound) {
      strip.dataset.arrowsBound = '1';
      function updateArrows() {
        btnPrev.hidden = strip.scrollLeft <= 4;
        btnNext.hidden = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 4;
      }
      var scrollStep = function () { return strip.clientWidth * 0.75; };
      btnPrev.addEventListener('click', function () { strip.scrollBy({ left: -scrollStep(), behavior: 'smooth' }); });
      btnNext.addEventListener('click', function () { strip.scrollBy({ left: scrollStep(), behavior: 'smooth' }); });
      strip.addEventListener('scroll', updateArrows, { passive: true });
      updateArrows();
    }

    /* Each [data-swatches] group updates its label + syncs the gallery image. */
    var groups = Array.prototype.slice.call(root.querySelectorAll('[data-swatches]'));
    groups.forEach(function (group) {
      if (group.dataset.bound) return;
      group.dataset.bound = '1';
      var wrap = group.closest('.product__select') || group.parentNode;
      var label = wrap ? wrap.querySelector('[data-swatch-label]') : null;
      var opts = Array.prototype.slice.call(group.querySelectorAll('[data-swatch]'));
      opts.forEach(function (opt) {
        opt.addEventListener('click', function () {
          opts.forEach(function (o) {
            o.classList.remove('is-active');
            o.setAttribute('aria-checked', 'false');
          });
          opt.classList.add('is-active');
          opt.setAttribute('aria-checked', 'true');
          if (label && opt.dataset.swatch) label.textContent = opt.dataset.swatch;
          if (opt.dataset.thumbTarget !== undefined) {
            activateThumb(thumbs[parseInt(opt.dataset.thumbTarget, 10)]);
          }
          updateVariant();
        });
      });
    });

    function updateVariant() {
      var input = document.getElementById('selected-variant-id');
      if (!input || !window.__novoraVariants) return;
      var nationEl = document.querySelector('[data-swatches][aria-label="Nation"] [data-swatch].is-active');
      var sizeEl = document.querySelector('[data-swatches][aria-label="Size"] [data-swatch].is-active');
      if (!nationEl || !sizeEl) return;
      var key = nationEl.dataset.swatch + '/' + sizeEl.dataset.swatch;
      var id = window.__novoraVariants[key];
      if (id) input.value = id;
    }
    updateVariant();
  }

  /* --- Add to cart: AJAX submit with "✓ Added!" feedback --------------- */
  function addToCart(root) {
    var form = (root || document).getElementById('product-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    var btn = form.querySelector('[data-add-to-cart]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var variantId = document.getElementById('selected-variant-id').value;
      if (!variantId || !btn || btn.dataset.busy === '1') return;
      btn.dataset.busy = '1';
      var original = btn.innerHTML;
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
      .then(function (r) { return r.json(); })
      .then(function () {
        btn.innerHTML = '✓ Added!';
        btn.style.background = '#16A34A';
        btn.style.color = '#FFFFFF';
        setTimeout(function () {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.style.color = '';
          btn.dataset.busy = '0';
        }, 2000);
      })
      .catch(function () {
        window.location.href = '/cart/add?id=' + variantId + '&quantity=1&return_to=/cart';
      });
    });
  }
})();
