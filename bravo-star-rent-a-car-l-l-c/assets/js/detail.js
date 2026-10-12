(function () {
  // ---------- Gallery ----------
  var thumbs = document.querySelector('.gal-thumbs');
  if (thumbs) {
    var main = document.getElementById('gMain');
    var styles = ['', 'object-position:20% 60%;transform:scale(1.5)', 'object-position:80% 60%;transform:scale(1.5)', 'object-position:50% 90%;transform:scale(1.6)', 'object-position:50% 20%;transform:scale(1.4)'];
    thumbs.addEventListener('click', function (e) {
      var b = e.target.closest('.thumb'); if (!b) return;
      thumbs.querySelectorAll('.thumb').forEach(function (t) { t.classList.remove('on'); });
      b.classList.add('on');
      main.setAttribute('style', styles[+b.dataset.i] || '');
    });
  }

  // ---------- Rental booking card ----------
  var book = document.getElementById('book');
  if (book) {
    var from = document.getElementById('bFrom'), to = document.getElementById('bTo'), loc = document.getElementById('bLoc');
    var day = +book.dataset.day, week = +book.dataset.week, month = +book.dataset.month;
    var iso = function (d) { return d.toISOString().slice(0, 10); };
    var t0 = new Date(), t1 = new Date(Date.now() + 86400000);
    from.min = iso(t0); from.value = iso(t0); to.min = iso(t1); to.value = iso(t1);
    function calc() {
      var a = new Date(from.value), b = new Date(to.value);
      if (!(b > a)) { b = new Date(a.getTime() + 86400000); to.value = iso(b); }
      var days = Math.max(1, Math.round((b - a) / 86400000));
      var total = days >= 28 ? Math.round(month / 30 * days) : days >= 7 ? Math.round(week / 7 * days) : day * days;
      document.getElementById('bDays').textContent = days + (days === 1 ? ' day' : ' days') + (days >= 28 ? ' · monthly rate' : days >= 7 ? ' · weekly rate' : '');
      var t = document.getElementById('bTotal'); t.dataset.aed = total; t.textContent = 'AED ' + total.toLocaleString('en-US');
      if (window.OCD && OCD.applyCurrency) OCD.applyCurrency(book);
      var msg = 'Hi, I would like to rent the ' + book.dataset.name + '.\nPickup: ' + from.value + ' (' + loc.value + ')\nReturn: ' + to.value + '\nDuration: ' + days + ' day(s)\nEstimated total: AED ' + total.toLocaleString('en-US');
      document.getElementById('bWa').href = 'https://wa.me/' + book.dataset.wa + '?text=' + encodeURIComponent(msg);
      document.getElementById('bMail').href = 'mailto:' + book.dataset.email + '?subject=' + encodeURIComponent('Rental enquiry: ' + book.dataset.name) + '&body=' + encodeURIComponent(msg);
    }
    from.addEventListener('change', function () { var n = new Date(new Date(from.value).getTime() + 86400000); to.min = iso(n); if (new Date(to.value) <= new Date(from.value)) to.value = iso(n); calc(); });
    to.addEventListener('change', calc); loc.addEventListener('change', calc); calc();
  }

  // ---------- Buy EMI ----------
  var buy = document.getElementById('buyBox');
  if (buy) {
    var price = +buy.dataset.price, dp = document.getElementById('dp'), yr = document.getElementById('yr');
    function emi() {
      var down = +dp.value / 100, years = +yr.value, loan = price * (1 - down), r = 0.045 / 12, n = years * 12;
      var m = loan * r / (1 - Math.pow(1 + r, -n));
      document.getElementById('dpOut').textContent = dp.value + '%';
      document.getElementById('yrOut').textContent = years + (years === 1 ? ' year' : ' years');
      var o = document.getElementById('emiOut'); o.dataset.aed = Math.round(m); o.textContent = 'AED ' + Math.round(m).toLocaleString('en-US') + ' / mo';
      if (window.OCD && OCD.applyCurrency) OCD.applyCurrency(buy);
    }
    dp.addEventListener('input', emi); yr.addEventListener('input', emi); emi();
  }
})();
