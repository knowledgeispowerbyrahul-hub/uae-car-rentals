(function () {
  var OCD = window.OCD = window.OCD || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- Currency / language / location ----------
  var RATES = { AED: 1, USD: 0.2723, EUR: 0.25, GBP: 0.215, SAR: 1.021, INR: 22.8 };
  var SYM = { AED: 'AED', USD: '$', EUR: '€', GBP: '£', SAR: 'SAR', INR: '₹' };
  var cur = localStorage.ocdCur || 'AED', lang = localStorage.ocdLang || 'en', loc = localStorage.ocdLoc || 'Dubai';
  function fmt(n) { return SYM[cur] + ' ' + Math.round(n * RATES[cur]).toLocaleString('en-US'); }
  OCD.applyCurrency = function (root) {
    $$('[data-aed]', root).forEach(function (el) { el.textContent = fmt(+el.dataset.aed); });
    var l = $('#curLabel'); if (l) l.textContent = cur;
    $$('[data-cur]').forEach(function (b) { b.classList.toggle('on', b.dataset.cur === cur); });
  };
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    var l = $('#langLabel'); if (l) l.textContent = lang === 'ar' ? 'ARA' : 'ENG';
    $$('[data-lang]').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === lang); });
  }
  function applyLoc() { var l = $('#locLabel'); if (l) l.textContent = loc; $$('[data-loc]').forEach(function (b) { b.classList.toggle('on', b.dataset.loc === loc); }); }
  $$('[data-cur]').forEach(function (b) { b.addEventListener('click', function () { cur = b.dataset.cur; localStorage.ocdCur = cur; OCD.applyCurrency(); }); });
  $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { lang = b.dataset.lang; localStorage.ocdLang = lang; applyLang(); }); });
  $$('[data-loc]').forEach(function (b) { b.addEventListener('click', function () { loc = b.dataset.loc; localStorage.ocdLoc = loc; applyLoc(); closePops(); }); });

  // popovers
  function closePops() { $$('.pop-box').forEach(function (p) { p.classList.remove('show'); }); }
  $$('[data-pop]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); var box = $('#pop-' + b.dataset.pop); var was = box.classList.contains('show'); closePops(); if (!was) box.classList.add('show'); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.pop')) closePops(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePops(); });

  // ---------- Header ----------
  var header = $('.header');
  window.addEventListener('scroll', function () { header.classList.toggle('scrolled', scrollY > 30); }, { passive: true });
  var burger = $('.burger');
  if (burger) burger.addEventListener('click', function () { $('.nav').classList.toggle('open'); });
  $$('.dd > a').forEach(function (a) { a.addEventListener('click', function (e) { if (innerWidth <= 860 && a.nextElementSibling) { e.preventDefault(); a.parentNode.classList.toggle('open'); } }); });

  // ---------- Reveal ----------
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .1 }) : null;
  $$('.reveal').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  // ---------- Hero (home dynamic tabs) ----------
  var form = $('#searchForm');
  if (form) {
    var tabs = $$('.seg button'), input = form.q, btn = form.querySelector('button[type=submit]');
    var hTitle = $('#heroTitle'), hSub = $('#heroSub');
    var modes = [
      {
        title: 'RENT A CAR DUBAI',
        sub: 'Car Rental in Dubai. Book Direct. No Hidden Fees.',
        ph: 'Search by brand or model (e.g. BMW, Mercedes, SUV)',
        btn: 'View All Cars &nbsp;›',
        url: '/rent-a-car-dubai',
        data: 'RENT',
        base: '/cars/'
      },
      {
        title: 'BUY USED CARS DUBAI',
        sub: 'Certified GCC-Spec Used Cars for Sale in Dubai.',
        ph: 'Search used cars (e.g. Porsche, Toyota, Mercedes)',
        btn: 'View Cars for Sale &nbsp;›',
        url: '/buy-used-cars-dubai',
        data: 'BUY',
        base: '/cars-for-sale/'
      },
      {
        title: 'SELL YOUR CAR DUBAI',
        sub: 'Free Valuation. Instant Cash Offer. Zero Listing Fees.',
        ph: 'Enter your car brand & model (e.g. BMW X5)',
        btn: 'Get Free Valuation &nbsp;›',
        url: '/sell-my-car-dubai',
        data: null
      }
    ];
    var mi = 0, sugg = document.createElement('div'); sugg.className = 'sugg'; form.appendChild(sugg);
    function setMode(i) {
      mi = i;
      tabs.forEach(function (t, k) { t.classList.toggle('on', k === i); });
      if (hTitle) {
        hTitle.style.opacity = '0';
        setTimeout(function () { hTitle.textContent = modes[i].title; hTitle.style.opacity = '1'; }, 120);
      }
      if (hSub) {
        hSub.style.opacity = '0';
        setTimeout(function () { hSub.textContent = modes[i].sub; hSub.style.opacity = '1'; }, 120);
      }
      if (input) input.placeholder = modes[i].ph;
      if (btn) btn.innerHTML = modes[i].btn;
      sugg.innerHTML = ''; sugg.classList.remove('show');
    }
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { setMode(i); }); });
    if (input) {
      input.addEventListener('input', function () {
        var m = modes[mi], q = input.value.trim().toLowerCase();
        if (!q || !m.data || !OCD[m.data]) { sugg.classList.remove('show'); return; }
        var res = OCD[m.data].filter(function (c) { return (c.brand + ' ' + c.model).toLowerCase().indexOf(q) > -1; }).slice(0, 6);
        sugg.innerHTML = res.length ? res.map(function (c) { return '<a href="' + m.base + c.slug + '"><img src="' + c.img + '" alt=""><span><b>' + c.brand + ' ' + c.model + '</b><small>' + (OCD_CAT ? OCD_CAT[c.cat] : c.cat) + ' · ' + c.year + '</small></span></a>'; }).join('') : '<p>No match. Press enter to search all.</p>';
        sugg.classList.add('show');
      });
    }
    document.addEventListener('click', function (e) { if (!form.contains(e.target)) sugg.classList.remove('show'); });
    form.addEventListener('submit', function (e) { e.preventDefault(); var q = input ? input.value.trim() : ''; location.href = modes[mi].url + (q ? '?q=' + encodeURIComponent(q) : ''); });
  }

  // brand strip arrows
  var bs = $('#bScroll');
  if (bs) { $('#bPrev').onclick = function () { bs.scrollBy({ left: -420, behavior: 'smooth' }); }; $('#bNext').onclick = function () { bs.scrollBy({ left: 420, behavior: 'smooth' }); }; }

  // ---------- Home fleet + buy ----------
  var fleet = $('#homeFleet');
  if (fleet && OCD.RENT) {
    var chips = $$('.chip');
    var draw = function (f) { var list = OCD.RENT.filter(function (c) { return f === 'all' || c.cat === f; }).sort(function (a, b) { return b.pop - a.pop; }).slice(0, 6); fleet.innerHTML = list.map(function (c) { return OCD_card(c, 'rent'); }).join(''); OCD.applyCurrency(fleet); };
    chips.forEach(function (ch) { ch.addEventListener('click', function () { chips.forEach(function (c) { c.classList.remove('active'); }); ch.classList.add('active'); draw(ch.dataset.filter); }); });
    draw('all');
  }
  var hb = $('#homeBuy');
  if (hb && OCD.BUY) { hb.innerHTML = OCD.BUY.slice(0, 3).map(function (c) { return OCD_card(c, 'buy'); }).join(''); }

  // ---------- WhatsApp / email forms ----------
  $$('form[data-wa-form]').forEach(function (f) {
    function message() {
      var lines = [f.dataset.subject + ':']; new FormData(f).forEach(function (v, k) { if (String(v).trim()) lines.push(k + ': ' + v); }); return lines.join('\n');
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault(); window.open('https://wa.me/' + f.dataset.wa + '?text=' + encodeURIComponent(message()), '_blank');
      var ok = $('.form-ok', f); if (ok) ok.hidden = false;
    });
    var mb = $('[data-mail]', f);
    if (mb) mb.addEventListener('click', function () { if (!f.reportValidity()) return; location.href = 'mailto:' + f.dataset.email + '?subject=' + encodeURIComponent(f.dataset.subject) + '&body=' + encodeURIComponent(message()); });
  });

  OCD.applyCurrency(); applyLang(); applyLoc();
})();
