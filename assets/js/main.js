(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Toast
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  // Mobile menu
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Highlight current section in nav
  if ('IntersectionObserver' in window) {
    var links = $$('.menu a:not(.btn)');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle('act', l.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['features', 'how', 'pricing', 'contact'].forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  // Hero demo: sending a sample reminder
  var owed = $('#owed'), note = $('#boardnote');
  function fmt(n) { return 'Rs ' + n.toLocaleString('en-IN'); }
  function updateOwed() {
    var total = 0;
    $$('#inv li').forEach(function (li) { if (!li.classList.contains('sent')) total += +li.dataset.amt; });
    owed.textContent = fmt(total) + ' outstanding';
  }
  $$('#inv button').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.closest('li'), who = $('b', li).textContent;
      li.classList.add('sent');
      var tag = $('.tag', li);
      tag.className = 'tag ok';
      tag.textContent = 'Reminder sent';
      b.textContent = 'Sent';
      b.disabled = true;
      toast('Reminder sent to ' + who + ' (sample only)');
      var left = $$('#inv li:not(.sent)').length;
      note.textContent = left ? 'Chaser will follow up again on the schedule you set.' : 'All reminders sent. Chaser now waits for payments.';
    });
  });
  updateOwed();

  // Pricing toggle
  var per = $$('.per');
  $$('[data-bill]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var y = btn.dataset.bill === 'y';
      $$('[data-bill]').forEach(function (o) {
        o.classList.toggle('on', o === btn);
        o.setAttribute('aria-pressed', o === btn);
      });
      $$('.amt span').forEach(function (s) { s.textContent = y ? s.dataset.y : s.dataset.m; });
      per.forEach(function (p) { p.textContent = y ? 'year' : 'month'; });
    });
  });

  // Plan buttons pre-select the plan in the form
  var form = $('#form');
  $$('[data-plan]').forEach(function (a) {
    a.addEventListener('click', function () {
      form.elements.plan.value = a.dataset.plan;
      var first = form.elements.name;
      setTimeout(function () { first.focus({ preventScroll: true }); }, 600);
    });
  });

  // Form validation
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function check(el) {
    var v = el.value.trim(), msg = '';
    if (el.name === 'name' && v.length < 2) msg = 'Enter your name.';
    if (el.name === 'email') msg = !v ? 'Enter your email.' : (!emailRe.test(v) ? 'Check the email format, for example name@company.com.' : '');
    if (el.name === 'msg' && v.length < 10) msg = 'Write at least 10 characters so we can prepare.';
    el.classList.toggle('bad', !!msg);
    el.setAttribute('aria-invalid', !!msg);
    el.parentNode.querySelector('em').textContent = msg;
    return !msg;
  }
  var fields = $$('input, textarea', form);
  fields.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); f.addEventListener('input', function () { if (f.classList.contains('bad')) check(f); }); });
  var ok = $('#ok');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ok.hidden = true;
    var good = fields.map(check).every(Boolean);
    if (!good) { var bad = $('.bad', form); if (bad) bad.focus(); return; }
    var first = form.elements.name.value.trim().split(' ')[0];
    ok.textContent = 'Thanks, ' + first + '. We have your request and will email ' + form.elements.email.value.trim() + ' within one working day.';
    ok.hidden = false;
    form.reset();
  });

  $('#yr').textContent = new Date().getFullYear();
})();
