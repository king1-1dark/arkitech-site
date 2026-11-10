/* =====================================================================
   ARKITECH STUDIO — логика страницы (ванильный JS, без зависимостей)
   1. Ссылка на бота из config.js   4. Параллакс (скролл + мышь)
   2. Картинки слоёв из config.js   5. Появление блоков, счётчики
   3. Шапка и мобильное меню        6. Плавающая кнопка, наклон карточек
   ===================================================================== */
(function () {
  'use strict';

  var CONFIG = window.SITE_CONFIG || {};
  var doc = document, root = doc.documentElement;
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Кнопки бота: все элементы с data-bot-link ---------- */
  $$('[data-bot-link]').forEach(function (a) {
    if (CONFIG.BOT_URL) a.href = CONFIG.BOT_URL;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- 2. Слои параллакса: <img data-layer="имя"> ---------- */
  $$('img[data-layer]').forEach(function (img) {
    var src = CONFIG.LAYERS && CONFIG.LAYERS[img.dataset.layer];
    if (src) img.src = src;
    img.decoding = 'async';
    img.draggable = false;
  });

  /* ---------- 3. Шапка и меню ---------- */
  var header = doc.getElementById('header');
  var burger = doc.getElementById('burger');
  function setMenu(open) {
    doc.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  burger.addEventListener('click', function () { setMenu(!doc.body.classList.contains('menu-open')); });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 4. Параллакс ----------
     data-depth слоя: 0 — бесконечно далеко, 1 — передний план, >1 — ближе камеры.
     Скролл: далёкие слои «отстают» от страницы, близкие едут вместе с ней.
     Мышь (только ПК): чем ближе слой, тем сильнее он смещается против курсора.
     На телефоне — только скролл и с меньшей силой. */
  var SCROLL_K = finePointer ? 0.6 : 0.4;    // сила параллакса от скролла
  var MOUSE_X = 40, MOUSE_Y = 20;             // макс. сдвиг от мыши, px
  var vh = window.innerHeight, scrollY = window.pageYOffset;
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  var ticking = false;

  var scenes = $$('[data-parallax]').map(function (el) {
    return {
      el: el, top: 0, height: 0, visible: true,
      strength: parseFloat(el.dataset.strength || '1'),
      layers: $$('[data-depth]', el).map(function (l) {
        return { el: l, depth: parseFloat(l.dataset.depth), fade: l.hasAttribute('data-fade') };
      })
    };
  });

  function measure() {
    vh = window.innerHeight;
    scrollY = window.pageYOffset;
    scenes.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      s.top = r.top + scrollY; s.height = r.height;
    });
  }

  function frame() {
    ticking = false;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      if (!s.visible) continue;
      var p = (scrollY + vh / 2) - (s.top + s.height / 2);   // смещение центра сцены от центра экрана
      for (var j = 0; j < s.layers.length; j++) {
        var l = s.layers[j];
        var y = p * (1 - l.depth) * SCROLL_K * s.strength - mouse.y * MOUSE_Y * l.depth;
        var x = -mouse.x * MOUSE_X * l.depth;
        l.el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
        if (l.fade) l.el.style.opacity = Math.max(0, 1 - Math.max(0, p) / (vh * 0.7)).toFixed(3);
      }
    }
    if (Math.abs(mouse.tx - mouse.x) > 0.001 || Math.abs(mouse.ty - mouse.y) > 0.001) requestTick();
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  if (!reduceMotion && scenes.length) {
    measure();
    window.addEventListener('scroll', function () { scrollY = window.pageYOffset; requestTick(); }, { passive: true });
    window.addEventListener('resize', function () { measure(); requestTick(); });
    window.addEventListener('load', function () { measure(); requestTick(); });
    if ('IntersectionObserver' in window) {
      var sceneIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          for (var i = 0; i < scenes.length; i++) if (scenes[i].el === e.target) scenes[i].visible = e.isIntersecting;
        });
        requestTick();
      }, { rootMargin: '20% 0px' });
      scenes.forEach(function (s) { sceneIO.observe(s.el); });
    }
    if (finePointer) {
      window.addEventListener('mousemove', function (e) {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = (e.clientY / vh) * 2 - 1;
        requestTick();
      }, { passive: true });
    }
    requestTick();
  }

  /* шапка: фон после начала прокрутки */
  function onScrollHeader() { header.classList.toggle('is-scrolled', window.pageYOffset > 24); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 5. Появление блоков и счётчики ---------- */
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10), start = null, dur = 1200;
    if (reduceMotion || !target) return;
    function step(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // лёгкая «лесенка» для соседних карточек
        var siblings = el.parentNode ? $$('.reveal', el.parentNode).filter(function (n) { return n.parentNode === el.parentNode; }) : [];
        el.style.transitionDelay = (Math.max(0, siblings.indexOf(el)) % 4) * 90 + 'ms';
        el.classList.add('is-in');
        setTimeout(function () { el.style.transitionDelay = ''; }, 1000);
        $$('[data-count]', el).forEach(countUp);
        revealIO.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { revealIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 6. Плавающая кнопка: после первого экрана, прячется у финального призыва ---------- */
  var fab = doc.getElementById('fab');
  var hero = doc.querySelector('.hero');
  var cta = doc.getElementById('contact');
  if (fab && hero && 'IntersectionObserver' in window) {
    var heroIn = true, ctaIn = false;
    var updateFab = function () {
      var show = !heroIn && !ctaIn;
      fab.classList.toggle('is-visible', show);
      fab.setAttribute('aria-hidden', String(!show));
      fab.tabIndex = show ? 0 : -1;
    };
    var fabIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === hero) heroIn = e.isIntersecting;
        if (e.target === cta) ctaIn = e.isIntersecting;
      });
      updateFab();
    }, { threshold: 0.12 });
    fabIO.observe(hero);
    if (cta) fabIO.observe(cta);
  }

  /* наклон карточек игр за курсором (только ПК) */
  if (finePointer && !reduceMotion) {
    $$('.game').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * 9).toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }
})();
