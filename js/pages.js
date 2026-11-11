/* =====================================================================
   ARKITECH — содержимое страниц из данных (data/*.js)
   Элементы с data-render="…" заполняются здесь. Тексты карточек —
   в файлах data/, вёрстка карточек — в функциях ниже.
   Подключается после layout.js и до main.js.
   ===================================================================== */
(function () {
  'use strict';
  var A = window.APP, D = window.DATA || {}, CONFIG = window.SITE_CONFIG || {};
  var esc = A.esc, money = A.money, doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);
  var byId = function (list, id) { return (list || []).filter(function (x) { return x.id === id; })[0]; };
  var AGE = { '6-11': '6–11 лет', '12-17': '12–17 лет', '18+': '18+' };
  var ages = function (a) { return (a || []).map(function (x) { return AGE[x] || x; }).join(', '); };
  var minPrice = function (p) { return Math.min.apply(null, ['self', 'feedback', 'personal'].map(function (k) { return p.prices[k] || Infinity; })); };
  function render(name, fn) { $$('[data-render="' + name + '"]').forEach(function (el) { el.innerHTML = fn(el); }); }

  /* ================= АКАДЕМИЯ ================= */
  function programCard(p) {
    return '<article class="card pop">' +
      '<div class="card__tags"><span class="tag">' + ages(p.ages) + '</span>' + (p.ready ? '' : '<span class="badge badge--soon">Скоро</span>') + '</div>' +
      '<h3 class="card__title">' + esc(p.title) + '</h3>' +
      '<p class="card__text">' + esc(p.short) + '</p>' +
      '<ul class="meta"><li>' + esc(p.level) + '</li><li>' + esc(p.goal) + '</li><li>' + esc(p.duration) + '</li></ul>' +
      '<div class="card__foot">' +
        (p.ready ? '<span class="price">от ' + money(minPrice(p)) + '</span><a class="btn btn--small btn--accent" href="program.html?id=' + esc(p.id) + '">Подробнее</a>'
                 : '<span class="price price--muted">Запись скоро</span><button class="btn btn--small" type="button" data-form="notify" data-item="' + esc(p.id) + '" data-title="' + esc(p.title) + '">Сообщить о запуске</button>') +
      '</div></article>';
  }

  var filter = { age: 'all', level: 'all', goal: 'all' };
  function uniq(key) {
    var out = [];
    (D.programs || []).forEach(function (p) { [].concat(p[key]).forEach(function (v) { if (out.indexOf(v) < 0) out.push(v); }); });
    return out;
  }
  function chips(key, label, values, names) {
    return '<div class="filter"><span class="filter__label">' + label + '</span><div class="chips">' +
      ['all'].concat(values).map(function (v) {
        return '<button type="button" class="chip" data-filter="' + key + '" data-value="' + esc(v) + '" aria-pressed="' + (filter[key] === v) + '">' + esc(v === 'all' ? 'Все' : (names && names[v]) || v) + '</button>';
      }).join('') + '</div></div>';
  }
  function renderCatalog() {
    var box = $('[data-render="catalog"]'); if (!box) return;
    var list = (D.programs || []).filter(function (p) {
      return (filter.age === 'all' || p.ages.indexOf(filter.age) >= 0) &&
             (filter.level === 'all' || p.level === filter.level) &&
             (filter.goal === 'all' || p.goal === filter.goal);
    }).sort(function (a, b) { return (b.ready - a.ready); });
    box.innerHTML = list.length ? list.map(programCard).join('') :
      '<div class="empty"><p>Под такие фильтры программ пока нет.</p><button class="btn btn--primary" type="button" data-form="pick-program" data-title="Подбор программы">Подобрать программу</button></div>';
    var count = $('[data-render="catalog-count"]'); if (count) count.textContent = list.length;
  }
  var filters = $('[data-render="filters"]');
  if (filters) {
    filters.innerHTML = chips('age', 'Возраст', ['6-11', '12-17', '18+'], AGE) + chips('level', 'Уровень', uniq('level')) + chips('goal', 'Цель', uniq('goal'));
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]'); if (!b) return;
      filter[b.dataset.filter] = b.dataset.value;
      $$('[data-filter="' + b.dataset.filter + '"]', filters).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      renderCatalog();
    });
    var startAge = params.get('age'); if (startAge && AGE[startAge]) { var c = $('[data-filter="age"][data-value="' + startAge + '"]', filters); if (c) c.click(); }
  }
  renderCatalog();

  /* ---------- Менторы ---------- */
  function initials(n) { return n.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2); }
  function avatar(m) {
    return m.photo ? '<img class="avatar" src="' + esc(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy" width="120" height="120">'
                   : '<span class="avatar" aria-hidden="true">' + esc(initials(m.name)) + '</span>';
  }
  function mentorCard(m) {
    var fmts = m.formats.map(function (f) { return D.formats[f].name; }).join(', ');
    return '<article class="card mentor pop">' + avatar(m) +
      '<div><h3 class="card__title">' + esc(m.name) + (m.star ? ' <span class="badge">Приглашённый</span>' : '') + '</h3><p class="mentor__role">' + esc(m.role) + '</p></div>' +
      '<ul class="facts"><li><span>Опыт</span>' + esc(m.exp) + '</li><li><span>Возраст</span>' + ages(m.ages) + '</li><li><span>Форматы</span>' + esc(fmts) + '</li></ul>' +
      '<div class="card__foot"><span class="price">' + (m.price ? 'от ' + money(m.price) + '<small>/мес</small>' : 'Индивидуально') + '</span>' +
      (m.star ? '<button class="btn btn--small btn--accent" type="button" data-form="mentor-star" data-item="' + esc(m.id) + '" data-title="' + esc(m.name) + '">Оставить заявку</button>'
              : '<button class="btn btn--small btn--accent" type="button" data-mentor-pick="' + esc(m.id) + '">Выбрать</button>') +
      '</div></article>';
  }
  render('mentors', function () { return (D.mentors || []).map(mentorCard).join(''); });

  /* «Выбрать ментора» → выбор программы → оплата персонального формата */
  doc.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-mentor-pick]'); if (!b) return;
    var m = byId(D.mentors, b.dataset.mentorPick); if (!m) return;
    A.track('mentor_pick', { mentor: m.id });
    var progs = (D.programs || []).filter(function (p) {
      return p.ready && p.prices.personal && p.ages.some(function (a) { return m.ages.indexOf(a) >= 0; });
    });
    A.openModal('<p class="eyebrow"><span class="dot"></span>Персональное сопровождение</p>' +
      '<div class="mentor mentor--inline">' + avatar(m) + '<div><h3 class="modal__title">' + esc(m.name) + '</h3><p class="mentor__role">' + esc(m.role) + '</p></div></div>' +
      '<p class="modal__lead">Выберите программу — ' + esc(m.name.split(' ')[0]) + ' будет вести вас по ней: план, видеоразборы и созвоны раз в неделю. Индивидуальные занятия по видеосвязи оплачиваются отдельно.</p>' +
      '<ul class="pick">' + progs.map(function (p) {
        return '<li><div><b>' + esc(p.title) + '</b><span>' + ages(p.ages) + ' · ' + esc(p.duration) + '</span></div>' +
          '<button class="btn btn--small btn--accent" type="button" data-pay="' + esc(p.id) + '" data-format="personal" data-mentor="' + esc(m.id) + '" data-mentor-name="' + esc(m.name) + '" data-title="' + esc(p.title) + '" data-price="' + p.prices.personal + '">' + money(p.prices.personal) + '</button></li>';
      }).join('') + '</ul>' +
      '<button class="btn btn--ghost" type="button" data-form="pick-mentor" data-item="' + esc(m.id) + '" data-title="' + esc(m.name) + '">Не знаю, что выбрать — помогите</button>');
  });

  /* ---------- Страница программы ---------- */
  var progBox = $('[data-render="program"]');
  if (progBox) {
    var p = byId(D.programs, params.get('id'));
    if (!p) {
      progBox.innerHTML = '<div class="empty"><p>Программа не найдена.</p><a class="btn btn--primary" href="academy.html">Все программы</a></div>';
    } else {
      doc.title = p.title + ' — Академия Arkitech';
      setHero(p.title, p.short, ages(p.ages) + ' · ' + p.level);
      var mentor = byId(D.mentors, p.mentor);
      var fmtKeys = ['self', 'feedback', 'personal'].filter(function (k) { return p.prices[k]; });
      progBox.innerHTML =
        '<div class="detail">' +
          '<div class="detail__main">' +
            '<section class="block"><h2 class="block__title">Чему научитесь</h2><ul class="ticks">' + p.tasks.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></section>' +
            '<section class="block"><h2 class="block__title">Программа</h2><ol class="modules">' + p.modules.map(function (t, i) { return '<li><span>' + (i + 1) + '</span>' + esc(t) + '</li>'; }).join('') + '</ol></section>' +
            '<section class="block"><h2 class="block__title">Детали</h2><ul class="facts facts--grid">' +
              '<li><span>Для кого</span>' + ages(p.ages) + '</li><li><span>Уровень</span>' + esc(p.level) + '</li>' +
              '<li><span>Длительность</span>' + esc(p.duration) + '</li><li><span>Нагрузка</span>' + esc(p.load) + '</li>' +
              '<li><span>Что понадобится</span>' + esc(p.equipment) + '</li><li><span>Участие родителя</span>' + esc(p.parent) + '</li>' +
              '<li><span>Доступ к урокам</span>' + esc(p.access) + '</li><li><span>Сертификат</span>' + (p.certificate ? 'Электронный, после финального проекта' : 'Не выдаётся') + '</li>' +
            '</ul></section>' +
            (mentor ? '<section class="block"><h2 class="block__title">Ментор программы</h2><div class="mentor mentor--inline">' + avatar(mentor) + '<div><b>' + esc(mentor.name) + '</b><p class="mentor__role">' + esc(mentor.role) + ' · ' + esc(mentor.exp) + '</p></div></div>' +
              '<p class="muted small">В формате «Персонально» можно выбрать другого ментора — <a href="academy.html#mentors">все менторы</a>.</p></section>' : '') +
          '</div>' +
          '<aside class="detail__side"><div class="buy">' +
            (p.ready ? '<h2 class="block__title">Формат участия</h2><div class="formats">' + fmtKeys.map(function (k, i) {
                return '<label class="format"><input type="radio" name="fmt" value="' + k + '"' + (i === 1 || fmtKeys.length === 1 ? ' checked' : '') + '>' +
                  '<span class="format__box"><b>' + esc(D.formats[k].name) + '</b><span>' + esc(D.formats[k].note) + '</span><em>' + money(p.prices[k]) + '</em></span></label>';
              }).join('') + '</div>' +
              '<button class="btn btn--primary btn--big btn--block" type="button" data-pay="' + esc(p.id) + '" data-title="' + esc(p.title) + '" id="payBtn">Перейти к оплате</button>' +
              '<p class="muted small">Доступ откроется автоматически сразу после оплаты. Без скрытых платежей: продление — по желанию, отдельной оплатой.</p>'
              : '<span class="badge badge--soon">Скоро</span><p class="muted">Программа ещё готовится — оплату мы не принимаем, пока она не готова.</p><button class="btn btn--primary btn--block" type="button" data-form="notify" data-item="' + esc(p.id) + '" data-title="' + esc(p.title) + '">Сообщить о запуске</button>') +
            '<button class="btn btn--ghost btn--block" type="button" data-form="pick-program" data-item="' + esc(p.id) + '" data-title="' + esc(p.title) + '">Есть вопросы — помогите выбрать</button>' +
          '</div></aside>' +
        '</div>';
      var pay = $('#payBtn');
      var syncPay = function () {
        var k = ($('input[name=fmt]:checked', progBox) || {}).value; if (!pay || !k) return;
        pay.dataset.format = k; pay.dataset.price = p.prices[k];
        if (k === 'personal' && mentor) { pay.dataset.mentor = mentor.id; pay.dataset.mentorName = mentor.name; } else { delete pay.dataset.mentor; delete pay.dataset.mentorName; }
        pay.textContent = 'Оплатить ' + money(p.prices[k]);
      };
      progBox.addEventListener('change', syncPay); syncPay();
    }
  }

  /* ================= ДЖЕМЫ И КЭМПЫ ================= */
  var STATUS = {
    collecting: { name: 'Собираем заявки', cls: 'badge--info', btn: 'Оставить заявку', form: 'jam-apply' },
    confirmed:  { name: 'Набор подтверждён', cls: 'badge--ok', btn: 'Забронировать место', form: 'jam-book' },
    full:       { name: 'Группа набрана', cls: 'badge--off', btn: 'В лист ожидания', form: 'jam-wait' },
    past:       { name: 'Прошёл', cls: 'badge--off' }
  };
  function seats(j) {
    if (j.status === 'confirmed' && j.seatsLeft != null) return 'Осталось мест: <b>' + j.seatsLeft + '</b> из ' + j.seatsTotal;
    if (j.status === 'collecting') return j.minGroup ? 'Подтвердим, когда наберётся ' + j.minGroup + ' участников' : 'Подтвердим, когда соберётся группа';
    if (j.status === 'full') return 'Мест нет — работает лист ожидания';
    return '';
  }
  function jamButton(j, big) {
    var s = STATUS[j.status]; if (!s.form) return '';
    return '<button class="btn ' + (big ? 'btn--primary btn--big btn--block' : 'btn--small btn--accent') + '" type="button" data-form="' + s.form + '" data-item="' + esc(j.id) + '" data-title="' + esc(j.title) + '">' + s.btn + '</button>';
  }
  function jamCard(j) {
    var s = STATUS[j.status];
    return '<article class="card jam pop">' +
      '<div class="card__tags"><span class="badge ' + s.cls + '">' + s.name + '</span><span class="tag">' + esc(j.type) + '</span></div>' +
      '<h3 class="card__title"><a href="jam.html?id=' + esc(j.id) + '">' + esc(j.title) + '</a></h3>' +
      '<p class="card__text">' + esc(j.short) + '</p>' +
      '<ul class="facts"><li><span>Когда</span>' + esc(j.dates) + '</li><li><span>Где</span>' + esc(j.place) + '</li><li><span>Возраст</span>' + ages(j.ages) + '</li></ul>' +
      (j.status !== 'past' ? '<p class="seats">' + seats(j) + '</p>' : '') +
      '<div class="card__foot">' + (j.status !== 'past' ? '<span class="price">' + money(j.price) + '</span>' : '<a class="link" href="jam.html?id=' + esc(j.id) + '">Как это было →</a>') +
      (j.status !== 'past' ? jamButton(j) : '') + '</div></article>';
  }
  function renderJams() {
    render('jams', function () { return (D.jams || []).filter(function (j) { return j.status !== 'past'; }).map(jamCard).join(''); });
    render('jams-archive', function () { return (D.jams || []).filter(function (j) { return j.status === 'past'; }).map(jamCard).join(''); });
    renderJamPage();
  }
  function renderJamPage() {
    var box = $('[data-render="jam"]'); if (!box) return;
    var j = byId(D.jams, params.get('id'));
    if (!j) { box.innerHTML = '<div class="empty"><p>Джем не найден.</p><a class="btn btn--primary" href="jams.html">Все джемы и кэмпы</a></div>'; return; }
    var s = STATUS[j.status];
    doc.title = j.title + ' — Arkitech';
    setHero(j.title, j.short, j.type + ' · ' + j.dates);
    var order = ['collecting', 'confirmed', 'full'];
    box.innerHTML = '<div class="detail"><div class="detail__main">' +
      (j.status === 'past'
        ? '<section class="block"><h2 class="block__title">Как это было</h2><p>' + esc(j.report) + '</p><div class="gallery">' + [1, 2, 3].map(function () { return '<div class="ph ph--photo">Фото / видео</div>'; }).join('') + '</div></section>'
        : '<section class="block"><h2 class="block__title">Статус набора</h2><ol class="stepper">' + order.map(function (k) {
            var i = order.indexOf(k), cur = order.indexOf(j.status);
            return '<li class="' + (i < cur ? 'is-done' : i === cur ? 'is-current' : '') + '"><b>' + STATUS[k].name + '</b><span>' +
              ({ collecting: 'Заявки без оплаты', confirmed: 'Бронь и оплата', full: 'Лист ожидания' })[k] + '</span></li>';
          }).join('') + '</ol><p class="seats">' + seats(j) + '</p></section>' +
          '<section class="block"><h2 class="block__title">Программа</h2><ul class="ticks">' + (j.plan || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></section>' +
          '<section class="block"><h2 class="block__title">Что входит</h2><ul class="ticks">' + (j.includes || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></section>') +
      '</div><aside class="detail__side"><div class="buy">' +
        '<span class="badge ' + s.cls + '">' + s.name + '</span>' +
        '<ul class="facts"><li><span>Когда</span>' + esc(j.dates) + '</li><li><span>Где</span>' + esc(j.place) + '</li><li><span>Возраст</span>' + ages(j.ages) + '</li>' +
        (j.status !== 'past' ? '<li><span>Стоимость</span>' + money(j.price) + '</li>' : '') + '</ul>' +
        (j.status !== 'past' ? jamButton(j, true) + '<p class="muted small">' + (j.status === 'collecting' ? 'Сейчас — только заявка, без оплаты. Поездка состоится, когда соберём группу.' : 'Отмена и возврат — по <a href="docs.html#refund">условиям</a>.') + '</p>' : '<a class="btn btn--primary btn--block" href="jams.html">Ближайшие джемы</a>') +
      '</div></aside></div>';
  }
  renderJams();

  /* Статусы и места из Google-таблицы (CSV): id, status, seatsLeft */
  if (CONFIG.SHEETS && CONFIG.SHEETS.jams && /^https?:/.test(location.protocol) && $('[data-render^="jam"]')) {
    fetch(CONFIG.SHEETS.jams).then(function (r) { return r.text(); }).then(function (csv) {
      var rows = csv.trim().split(/\r?\n/).map(function (l) { return l.split(',').map(function (c) { return c.trim().replace(/^"|"$/g, ''); }); });
      var head = rows.shift();
      rows.forEach(function (r) {
        var o = {}; head.forEach(function (h, i) { o[h] = r[i]; });
        var j = byId(D.jams, o.id); if (!j) return;
        if (STATUS[o.status]) j.status = o.status;
        if (o.seatsLeft !== undefined && o.seatsLeft !== '') j.seatsLeft = parseInt(o.seatsLeft, 10);
      });
      renderJams();
    }).catch(function () { /* таблица недоступна — остаются данные из data/jams.js */ });
  }

  /* ================= СОБЫТИЯ ================= */
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var MONTHS_N = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function evDate(e) { var p = e.date.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function eventRow(e, past) {
    var d = evDate(e);
    return '<article class="event pop">' +
      '<div class="event__date"><b>' + d.getDate() + '</b><span>' + MONTHS[d.getMonth()].slice(0, 3) + '</span></div>' +
      '<div class="event__body"><div class="card__tags"><span class="tag">' + esc(e.type) + '</span><span class="badge ' + (e.price ? '' : 'badge--ok') + '">' + money(e.price) + '</span></div>' +
        '<h3 class="card__title">' + esc(e.title) + '</h3><p class="card__text">' + esc(e.short) + '</p>' +
        '<p class="muted small">' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + esc(e.time) + ' · ' + esc(e.place) + '</p></div>' +
      (past ? '' : '<button class="btn btn--small btn--accent event__btn" type="button" data-form="' + (e.price ? 'event-paid' : 'event-free') + '" data-item="' + esc(e.id) + '" data-title="' + esc(e.title) + '">Зарегистрироваться</button>') +
    '</article>';
  }
  function eventsList(past, limit) {
    var list = (D.events || []).filter(function (e) { return past ? evDate(e) < today : evDate(e) >= today; })
      .sort(function (a, b) { return past ? evDate(b) - evDate(a) : evDate(a) - evDate(b); });
    if (limit) list = list.slice(0, limit);
    if (!list.length) return '<div class="empty"><p>' + (past ? 'Архив пока пуст.' : 'Ближайших событий пока нет — следите за Telegram.') + '</p></div>';
    var html = '', month = -1;
    list.forEach(function (e) {
      var m = evDate(e).getMonth();
      if (!limit && m !== month) { html += '<h3 class="month">' + MONTHS_N[m] + ' ' + evDate(e).getFullYear() + '</h3>'; month = m; }
      html += eventRow(e, past);
    });
    return html;
  }
  render('events', function (el) { return eventsList(el.dataset.past === 'true', +el.dataset.limit || 0); });
  $$('[data-tabs]').forEach(function (tabs) {
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tab]'); if (!b) return;
      $$('[data-tab]', tabs).forEach(function (t) { t.setAttribute('aria-selected', String(t === b)); });
      $$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== b.dataset.tab; });
    });
  });

  /* ================= МАГАЗИН ================= */
  var CART_KEY = 'arkitech_cart';
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { cart = []; }
  function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { } updateCartBtn(); }
  function cartCount() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (s, i) { var p = byId(D.products, i.id); return s + (p ? p.price * i.qty : 0); }, 0); }
  function productCard(p) {
    return '<article class="card product pop">' +
      (p.photo ? '<img class="product__img" src="' + esc(p.photo) + '" alt="' + esc(p.title) + '" loading="lazy" width="800" height="800">' : '<div class="product__img ph" aria-hidden="true">' + esc(p.label) + '</div>') +
      '<span class="tag">' + esc(p.cat) + '</span><h3 class="card__title">' + esc(p.title) + '</h3>' +
      (p.sizes.length ? '<label class="field field--inline"><span>Размер</span><select data-size>' + p.sizes.map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select></label>' : '') +
      '<div class="card__foot"><span class="price">' + money(p.price) + '</span><button class="btn btn--small btn--accent" type="button" data-add="' + esc(p.id) + '">В корзину</button></div></article>';
  }
  var shopBox = $('[data-render="shop"]');
  var shopFilter = 'all';
  function renderShop() {
    if (!shopBox) return;
    shopBox.innerHTML = (D.products || []).filter(function (p) { return shopFilter === 'all' || p.cat === shopFilter; }).map(productCard).join('');
  }
  var shopChips = $('[data-render="shop-filters"]');
  if (shopChips) {
    var cats = []; (D.products || []).forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });
    shopChips.innerHTML = '<div class="chips">' + ['all'].concat(cats).map(function (c) { return '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (c === 'all') + '">' + (c === 'all' ? 'Все' : esc(c)) + '</button>'; }).join('') + '</div>';
    shopChips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]'); if (!b) return;
      shopFilter = b.dataset.cat;
      $$('[data-cat]', shopChips).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      renderShop();
    });
  }
  renderShop();

  var cartBtn = null;
  if (shopBox) {
    cartBtn = doc.createElement('button');
    cartBtn.type = 'button'; cartBtn.className = 'cart-btn'; cartBtn.setAttribute('aria-label', 'Корзина');
    doc.body.appendChild(cartBtn);
    cartBtn.addEventListener('click', openCart);
    shopBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-add]'); if (!b) return;
      var card = b.closest('.product'), sizeEl = $('[data-size]', card), size = sizeEl ? sizeEl.value : '';
      var item = cart.filter(function (i) { return i.id === b.dataset.add && i.size === size; })[0];
      if (item) item.qty++; else cart.push({ id: b.dataset.add, size: size, qty: 1 });
      saveCart(); A.track('cart_add', { item: b.dataset.add });
      b.textContent = 'Добавлено ✓'; setTimeout(function () { b.textContent = 'В корзину'; }, 1200);
      cartBtn.classList.remove('is-bump'); void cartBtn.offsetWidth; cartBtn.classList.add('is-bump');
    });
  }
  function updateCartBtn() {
    if (!cartBtn) return;
    var n = cartCount();
    cartBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM5.2 4l.6 3H21l-2 8H7.4L4.4 2H1v2h4.2Z"/></svg>' + (n ? '<b>' + n + '</b>' : '');
    cartBtn.classList.toggle('has-items', n > 0);
  }
  updateCartBtn();
  function cartHTML() {
    if (!cart.length) return '<h3 class="modal__title">Корзина пуста</h3><p class="modal__lead">Добавьте товары из каталога.</p><button class="btn btn--primary" type="button" data-close>К товарам</button>';
    return '<p class="eyebrow"><span class="dot"></span>Магазин</p><h3 class="modal__title">Корзина</h3><ul class="cart">' + cart.map(function (i, n) {
      var p = byId(D.products, i.id); if (!p) return '';
      return '<li><div><b>' + esc(p.title) + '</b><span>' + (i.size ? 'Размер ' + esc(i.size) + ' · ' : '') + money(p.price) + '</span></div>' +
        '<div class="qty"><button type="button" data-qty="' + n + '" data-d="-1" aria-label="Меньше">−</button><span>' + i.qty + '</span><button type="button" data-qty="' + n + '" data-d="1" aria-label="Больше">+</button></div></li>';
    }).join('') + '</ul><div class="summary"><span>Итого без доставки</span><b>' + money(cartTotal()) + '</b></div>' +
    '<ol class="flow"><li>Вы оформляете заказ — без оплаты</li><li>Менеджер проверяет наличие и считает доставку</li><li>Присылает ссылку на оплату</li></ol>' +
    '<button class="btn btn--primary btn--big btn--block" type="button" data-checkout>Оформить заказ</button>';
  }
  function openCart() {
    A.openModal(cartHTML());
    var body = $('.modal__body');
    body.onclick = function (e) {
      var q = e.target.closest('[data-qty]');
      if (q) { var i = cart[+q.dataset.qty]; i.qty += +q.dataset.d; if (i.qty < 1) cart.splice(+q.dataset.qty, 1); saveCart(); body.innerHTML = cartHTML(); return; }
      if (e.target.closest('[data-checkout]')) {
        body.onclick = null;
        var items = cart.map(function (i) { var p = byId(D.products, i.id); return { id: i.id, title: p && p.title, size: i.size, qty: i.qty, price: p && p.price }; });
        A.openForm('order', { title: 'Заказ на ' + money(cartTotal()), extra: { items: items, total: cartTotal() },
          summary: '<div class="summary"><span>' + cartCount() + ' шт. без доставки</span><b>' + money(cartTotal()) + '</b></div>',
          onDone: function () { cart = []; saveCart(); } });
      }
    };
  }

  /* ---------- Шапка страниц-деталей ---------- */
  function setHero(title, lead, eyebrow) {
    var t = $('[data-hero="title"]'), l = $('[data-hero="lead"]'), e = $('[data-hero="eyebrow"]');
    if (t) t.textContent = title; if (l) l.textContent = lead; if (e) e.textContent = eyebrow;
  }
})();
