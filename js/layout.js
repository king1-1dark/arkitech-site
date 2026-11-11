/* =====================================================================
   ARKITECH — общий каркас всех страниц (ванильный JS)
   1. Меню и шапка — одна на все страницы (правится здесь, в NAV)
   2. Подвал и плавающая кнопка
   3. Окна: заявки, оплата, вход на платформу
   4. Отправка заявок (FORM_ENDPOINT или тестовый режим)
   Подключается ДО pages.js и main.js.
   ===================================================================== */
(function () {
  'use strict';
  var CONFIG = window.SITE_CONFIG || {};
  var doc = document;
  var page = doc.body.dataset.page || 'home';

  /* ---------- Пункты меню: [страница, адрес, подпись] ---------- */
  var NAV = [
    ['home',    'index.html',   'Студия'],
    ['academy', 'academy.html', 'Академия'],
    ['jams',    'jams.html',    'Джемы и кэмпы'],
    ['events',  'events.html',  'События'],
    ['shop',    'shop.html',    'Магазин']
  ];
  var FAB_TEXT = { home: 'Обсудить проект', academy: 'Подобрать программу', jams: 'Задать вопрос', events: 'Задать вопрос', shop: 'Задать вопрос' };

  /* ---------- Утилиты ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return n ? n.toLocaleString('ru-RU') + ' ₽' : 'Бесплатно'; }
  function track(goal, params) {   // цели Яндекс Метрики (если счётчик подключён)
    if (typeof window.ym === 'function' && CONFIG.METRIKA_ID) window.ym(CONFIG.METRIKA_ID, 'reachGoal', goal, params);
  }
  var TG_ICON = '<svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.7 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.5-.6-.2L6.3 13.2l-4.8-1.5c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.7.2 1.4 1.3Z"/></svg>';

  /* ---------- 1. Шапка ---------- */
  var header = doc.getElementById('header');
  if (header) {
    var links = NAV.map(function (n) {
      return '<a href="' + n[1] + '"' + (n[0] === page ? ' aria-current="page"' : '') + '>' + n[2] + '</a>';
    }).join('');
    header.className = 'header';
    header.innerHTML =
      '<div class="container header__inner">' +
        '<a class="logo" href="index.html" aria-label="Arkitech Studio — на главную"><span class="logo__mark" aria-hidden="true"></span>ARKITECH<span class="logo__dim">.STUDIO</span></a>' +
        '<nav class="nav" id="nav" aria-label="Основное меню">' + links +
          '<a class="btn btn--small btn--outline nav__bot" data-platform-link href="#">Войти в академию</a>' +
          '<a class="btn btn--small nav__bot nav__bot--main" data-bot-link href="#">Написать боту</a>' +
        '</nav>' +
        '<a class="btn btn--small btn--outline header__bot" data-platform-link href="#">Войти</a>' +
        '<a class="btn btn--small header__bot" data-bot-link href="#">Написать боту</a>' +
        '<button class="burger" id="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="nav"><span></span><span></span></button>' +
      '</div>';
  }

  /* ---------- 2. Подвал и плавающая кнопка ---------- */
  var footer = doc.getElementById('footer');
  if (footer) {
    footer.className = 'footer';
    footer.innerHTML =
      '<div class="container footer__inner">' +
        '<div><a class="logo" href="index.html"><span class="logo__mark" aria-hidden="true"></span>ARKITECH<span class="logo__dim">.STUDIO</span></a>' +
        '<p class="footer__note">Студия разработки игр и академия геймдева. Все тексты, люди, цены и даты на сайте — тестовые.</p></div>' +
        '<div><h4>Разделы</h4><ul class="footer__list">' + NAV.map(function (n) { return '<li><a href="' + n[1] + '">' + n[2] + '</a></li>'; }).join('') +
          '<li><a data-platform-link href="#">Вход в академию</a></li></ul></div>' +
        '<div><h4>Контакты</h4><ul class="footer__list">' +
          '<li><a data-bot-link href="#">Telegram-бот</a></li>' +
          '<li><a href="mailto:hello@arkitech.studio">hello@arkitech.studio</a></li>' +
          '<li>Заявки принимаем круглосуточно, отвечаем в течение рабочего дня (тест)</li></ul></div>' +
        '<div><h4>Документы</h4><ul class="footer__list">' +
          '<li><a href="docs.html#offer">Публичная оферта</a></li>' +
          '<li><a href="docs.html#privacy">Политика персональных данных</a></li>' +
          '<li><a href="docs.html#refund">Возврат и отмена</a></li>' +
          '<li><a href="docs.html#seller">Реквизиты продавца</a></li></ul></div>' +
      '</div>' +
      '<div class="container footer__bottom"><span>© <span id="year">2026</span> Arkitech Studio</span><span>Тестовая версия сайта ✦</span></div>';
  }
  if (!doc.getElementById('fab')) {
    var fab = doc.createElement('a');
    fab.className = 'fab'; fab.id = 'fab'; fab.href = '#';
    fab.setAttribute('data-bot-link', ''); fab.setAttribute('aria-hidden', 'true'); fab.tabIndex = -1;
    fab.innerHTML = TG_ICON + esc(FAB_TEXT[page] || 'Написать боту');
    doc.body.appendChild(fab);
  }

  /* ---------- 3. Модальное окно ---------- */
  var modal = doc.createElement('dialog');
  modal.className = 'modal';
  modal.innerHTML = '<div class="modal__box"><button class="modal__close" type="button" data-close aria-label="Закрыть">×</button><div class="modal__body"></div></div>';
  doc.body.appendChild(modal);
  var modalBody = modal.querySelector('.modal__body');
  function openModal(html) {
    modalBody.innerHTML = html;
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    doc.body.classList.add('modal-open');
    var first = modalBody.querySelector('input, select, textarea, button');
    if (first && window.matchMedia('(pointer: fine)').matches) first.focus();
  }
  function closeModal() { if (modal.open) modal.close(); modal.removeAttribute('open'); doc.body.classList.remove('modal-open'); }
  modal.addEventListener('close', function () { doc.body.classList.remove('modal-open'); });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });   // клик по фону

  var TEST_NOTE = '<p class="note">Тестовый режим: подключение ещё не настроено (см. <code>js/config.js</code>).</p>';

  /* ---------- Формы заявок ----------
     Кнопка: <button data-form="тип" data-item="код" data-title="Название">.
     Типы и их поля — ниже. Тексты «что будет дальше» — в next. */
  var FIELD = {
    name:    '<label class="field"><span>Имя</span><input name="name" required autocomplete="name"></label>',
    contact: '<label class="field"><span>Telegram или телефон</span><input name="contact" required autocomplete="tel" placeholder="@username или +7…"></label>',
    age:     '<label class="field"><span>Возраст участника</span><select name="age" required><option value="">Выберите</option><option>6-11</option><option>12-17</option><option>18+</option></select></label>',
    count:   '<label class="field"><span>Сколько участников</span><input name="count" type="number" min="1" max="10" value="1" required></label>',
    city:    '<label class="field"><span>Город и способ доставки</span><input name="city" required placeholder="Москва, курьер / СДЭК / самовывоз"></label>',
    goal:    '<label class="field"><span>Что хотите получить</span><textarea name="comment" rows="3" placeholder="Например: сын 13 лет, хочет делать игры, опыта нет"></textarea></label>',
    comment: '<label class="field"><span>Комментарий</span><textarea name="comment" rows="3"></textarea></label>'
  };
  var FORMS = {
    'pick-program': { h: 'Подберём программу', lead: 'Расскажите о себе или ребёнке — предложим 1–2 подходящие программы.', fields: ['name', 'contact', 'age', 'goal'],
      next: 'Менеджер напишет в течение рабочего дня и предложит программу и формат.', goal: 'lead_pick_program' },
    'pick-mentor':  { h: 'Помогите подобрать ментора', lead: 'Не знаете, кого выбрать? Подберём ментора под возраст, цель и расписание.', fields: ['name', 'contact', 'age', 'goal'],
      next: 'Предложим ментора и пришлём ссылку на оплату сопровождения.', goal: 'lead_pick_mentor' },
    'mentor-star':  { h: 'Заявка к ментору', lead: 'Стоимость работы с этим ментором — индивидуальная, её согласует руководитель академии.', fields: ['name', 'contact', 'age', 'goal'],
      next: 'Согласуем формат и цену, затем пришлём ссылку на оплату через сайт. Прямых оплат ментору нет.', goal: 'lead_mentor_star' },
    'notify':       { h: 'Сообщить о запуске', lead: 'Программа ещё готовится, оплату мы пока не принимаем. Напишем, когда откроем запись.', fields: ['name', 'contact'],
      next: 'Напишем, как только программа будет готова к запуску.', goal: 'lead_notify' },
    'jam-apply':    { h: 'Предварительная заявка', lead: 'Это заявка без оплаты. Мы собираем группу: когда наберётся минимум участников, подтвердим заезд.', fields: ['name', 'contact', 'age', 'count', 'comment'],
      next: 'Когда группа соберётся, подтвердим даты и пришлём ссылку на бронирование и оплату. До этого платить ничего не нужно.', goal: 'lead_jam_apply' },
    'jam-book':     { h: 'Бронирование места', lead: 'Набор подтверждён. Оставьте данные — забронируем место и пришлём ссылку на оплату.', fields: ['name', 'contact', 'age', 'count', 'comment'],
      next: 'Бронь держится 48 часов. Ссылка на оплату придёт в Telegram или СМС.', goal: 'lead_jam_book' },
    'jam-wait':     { h: 'Лист ожидания', lead: 'Группа набрана. Если место освободится, напишем по очереди листа ожидания.', fields: ['name', 'contact', 'age', 'count'],
      next: 'Вы в листе ожидания. Напишем, если освободится место или откроем ещё одну группу.', goal: 'lead_jam_wait' },
    'event-free':   { h: 'Регистрация', lead: 'Событие бесплатное — достаточно зарегистрироваться.', fields: ['name', 'contact', 'count'],
      next: 'Место за вами. Напомним о событии за день.', goal: 'lead_event_free' },
    'event-paid':   { h: 'Регистрация', lead: 'Сначала регистрация, затем подтверждаем место и присылаем ссылку на оплату.', fields: ['name', 'contact', 'count'],
      next: 'Подтвердим место и пришлём ссылку на оплату.', goal: 'lead_event_paid' },
    'order':        { h: 'Оформление заказа', lead: 'Менеджер проверит наличие, посчитает доставку и пришлёт ссылку на оплату.', fields: ['name', 'contact', 'city', 'comment'],
      next: 'Менеджер подтвердит наличие и стоимость доставки и пришлёт ссылку на оплату.', goal: 'lead_order' },
    'contact':      { h: 'Связаться с нами', lead: 'Оставьте контакт — ответим в рабочее время.', fields: ['name', 'contact', 'comment'],
      next: 'Ответим в течение рабочего дня.', goal: 'lead_contact' }
  };

  function openForm(type, opts) {
    var f = FORMS[type]; if (!f) return;
    opts = opts || {};
    openModal(
      '<p class="eyebrow"><span class="dot"></span>' + esc(opts.title || 'Заявка') + '</p>' +
      '<h3 class="modal__title">' + esc(f.h) + '</h3>' +
      '<p class="modal__lead">' + esc(f.lead) + '</p>' +
      (opts.summary || '') +
      '<form class="form" novalidate>' + f.fields.map(function (k) { return FIELD[k]; }).join('') +
        '<label class="check"><input type="checkbox" name="consent" required><span>Согласен на обработку персональных данных по <a href="docs.html#privacy" target="_blank">политике</a>. Если участнику нет 18 лет, заявку оставляет родитель.</span></label>' +
        '<p class="form__error" hidden></p>' +
        '<button class="btn btn--primary btn--big" type="submit">Отправить заявку</button>' +
      '</form>');
    var form = modalBody.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = form.querySelector('.form__error');
      if (!form.checkValidity()) { err.textContent = 'Заполните обязательные поля и отметьте согласие.'; err.hidden = false; form.reportValidity && form.reportValidity(); return; }
      var data = {}; Array.prototype.forEach.call(form.elements, function (el) { if (el.name && el.name !== 'consent') data[el.name] = el.value.trim(); });
      var btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Отправляем…';
      sendLead({ type: type, item: opts.item || '', title: opts.title || '', extra: opts.extra || null, fields: data })
        .then(function (res) {
          track(f.goal, { item: opts.item });
          if (opts.onDone) opts.onDone();
          openModal('<div class="done"><div class="done__icon" aria-hidden="true">✓</div><h3 class="modal__title">Заявка принята</h3>' +
            '<p class="modal__lead">' + esc(f.next) + '</p>' + (res.test ? '<p class="note">Тестовый режим: заявка сохранена только в этом браузере. После настройки <code>FORM_ENDPOINT</code> она будет приходить в рабочий Telegram-чат и в таблицу учёта.</p>' : '') +
            '<button class="btn btn--primary" type="button" data-close>Хорошо</button></div>');
        })
        .catch(function () { btn.disabled = false; btn.textContent = 'Отправить заявку'; err.textContent = 'Не получилось отправить. Попробуйте ещё раз или напишите боту.'; err.hidden = false; });
    });
  }

  /* ---------- 4. Отправка заявки ---------- */
  function sendLead(lead) {
    lead.page = location.pathname.split('/').pop() || 'index.html';
    lead.ts = new Date().toISOString();
    if (CONFIG.FORM_ENDPOINT) {
      return fetch(CONFIG.FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return { test: false }; });
    }
    try {
      var all = JSON.parse(localStorage.getItem('arkitech_leads') || '[]');
      all.push(lead); localStorage.setItem('arkitech_leads', JSON.stringify(all));
    } catch (e) { /* хранилище недоступно — для теста не страшно */ }
    if (window.console) console.info('[тест] заявка', lead);
    return Promise.resolve({ test: true });
  }

  /* ---------- Оплата программы ----------
     <button data-pay="код-программы" data-format="self|feedback|personal" data-mentor="код"> */
  function openPay(o) {
    track('pay_click', { item: o.id, format: o.format });
    if (CONFIG.PAY_URL) {
      location.href = CONFIG.PAY_URL.replace('{id}', encodeURIComponent(o.id)).replace('{format}', encodeURIComponent(o.format)).replace('{mentor}', encodeURIComponent(o.mentor || ''));
      return;
    }
    var fmt = (window.DATA && DATA.formats && DATA.formats[o.format]) || { name: o.format, note: '' };
    var steps = ['Оплата на защищённой странице учебной платформы', 'Письмо со входом в личный кабинет', 'Доступ к урокам открывается автоматически'];
    if (o.format === 'feedback') steps.push('Сдаёте задания — ментор проверяет и пишет разбор');
    if (o.format === 'personal') steps.push(o.mentorName ? 'Ментор ' + o.mentorName + ' напишет вам и согласует старт' : 'Назначим ментора и согласуем старт');
    openModal('<p class="eyebrow"><span class="dot"></span>Переход к оплате</p>' +
      '<h3 class="modal__title">' + esc(o.title) + '</h3>' +
      '<div class="summary"><span>' + esc(fmt.name) + (o.mentorName ? ' · ' + esc(o.mentorName) : '') + '</span><b>' + money(o.price) + '</b></div>' +
      '<p class="modal__lead">' + esc(fmt.note) + '</p>' +
      '<ol class="flow">' + steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      TEST_NOTE.replace('</p>', ' Здесь откроется оплата на платформе — <code>PAY_URL</code>.</p>') +
      '<button class="btn btn--primary" type="button" data-close>Понятно</button>');
  }

  /* ---------- Кнопки: делегирование кликов ---------- */
  doc.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-form],[data-pay],[data-platform-link],[data-close]') : null;
    if (!t) return;
    if (t.hasAttribute('data-close')) { closeModal(); return; }
    if (t.hasAttribute('data-platform-link')) {
      e.preventDefault();
      if (CONFIG.PLATFORM_URL) { window.open(CONFIG.PLATFORM_URL, '_blank', 'noopener'); return; }
      doc.body.classList.remove('menu-open');
      openModal('<p class="eyebrow"><span class="dot"></span>Академия</p><h3 class="modal__title">Вход на учебную платформу</h3>' +
        '<p class="modal__lead">Здесь откроется личный кабинет на учебной платформе. В нём будут роли:</p>' +
        '<ul class="flow flow--dots"><li>Ученик — уроки, задания, видео с телефона</li><li>Родитель — прогресс ребёнка</li><li>Ментор — только свои ученики и их работы</li><li>Администратор — программы, доступы, начисления</li></ul>' +
        TEST_NOTE.replace('</p>', ' Ссылка — <code>PLATFORM_URL</code>.</p>') + '<button class="btn btn--primary" type="button" data-close>Понятно</button>');
      return;
    }
    e.preventDefault();
    if (t.hasAttribute('data-pay')) {
      openPay({ id: t.dataset.pay, format: t.dataset.format, mentor: t.dataset.mentor, mentorName: t.dataset.mentorName, title: t.dataset.title, price: +t.dataset.price });
      return;
    }
    openForm(t.dataset.form, { item: t.dataset.item, title: t.dataset.title });
  });

  window.APP = { esc: esc, money: money, track: track, openModal: openModal, closeModal: closeModal, openForm: openForm, openPay: openPay, sendLead: sendLead, page: page };
})();
