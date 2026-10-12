(function () {
  var root = document.querySelector('[data-list]');
  if (!root || !window.OCD) return;
  var mode = root.dataset.list;
  var all = (mode === 'buy' ? OCD.BUY : OCD.RENT).slice();
  var plan = root.dataset.plan || 'day';
  var priceOf = function (c) { return mode === 'buy' ? c.price : plan === 'week' ? c.week : plan === 'month' ? c.month : c.day; };
  var params = new URLSearchParams(location.search);
  var st = {
    q: params.get('q') || '', cats: new Set(root.dataset.cat ? [root.dataset.cat] : params.get('cat') ? [params.get('cat')] : []),
    brands: new Set(root.dataset.brand ? [root.dataset.brand] : []),
    max: Math.max.apply(null, all.map(priceOf)), seats: +(root.dataset.seats || 0), nodep: !!root.dataset.nodep, year: 0, sort: 'pop', shown: 12
  };
  var maxAll = st.max;
  var panel = document.getElementById('fpanel'), grid = document.getElementById('grid'), count = document.getElementById('count');
  var CAT = OCD_CAT;
  var brands = Array.from(new Set(all.map(function (c) { return c.brand; }))).sort();
  var cats = Object.keys(CAT).filter(function (k) { return all.some(function (c) { return c.cat === k; }); });
  var step = maxAll > 20000 ? 5000 : 50;

  function cnt(fn) { return all.filter(fn).length; }
  function renderPanel() {
    panel.innerHTML =
      '<div class="fp-head"><b>Filters</b><button type="button" class="link" id="reset">Reset</button><button type="button" class="fp-x" id="fClose" aria-label="Close">×</button></div>' +
      '<div class="fgroup"><label>Search</label><input id="fq" type="search" placeholder="Search brand or model" value="' + st.q.replace(/"/g, '&quot;') + '"></div>' +
      '<div class="fgroup"><label>Car type</label>' + cats.map(function (k) { return '<label class="chk"><input type="checkbox" data-cat="' + k + '"' + (st.cats.has(k) ? ' checked' : '') + '> ' + CAT[k] + ' <em>' + cnt(function (c) { return c.cat === k; }) + '</em></label>'; }).join('') + '</div>' +
      '<div class="fgroup"><label>Brand</label><div class="scrollbox">' + brands.map(function (b) { return '<label class="chk"><input type="checkbox" data-brand="' + b + '"' + (st.brands.has(b) ? ' checked' : '') + '> ' + b + ' <em>' + cnt(function (c) { return c.brand === b; }) + '</em></label>'; }).join('') + '</div></div>' +
      '<div class="fgroup"><label>Max price <output id="pOut"></output></label><input type="range" id="fp" min="' + step + '" max="' + maxAll + '" step="' + step + '" value="' + st.max + '"></div>' +
      '<div class="fgroup"><label>Seats</label><select id="fs"><option value="0">Any</option>' + [2, 4, 5, 7, 9, 12].map(function (n) { return '<option value="' + n + '"' + (st.seats === n ? ' selected' : '') + '>' + n + '+ seats</option>'; }).join('') + '</select></div>' +
      (mode === 'rent' ? '<div class="fgroup"><label class="chk"><input type="checkbox" id="fnd"' + (st.nodep ? ' checked' : '') + '> No deposit only</label></div>' :
        '<div class="fgroup"><label>Year from</label><select id="fy"><option value="0">Any</option>' + [2024, 2022, 2020, 2018].map(function (y) { return '<option value="' + y + '">' + y + '</option>'; }).join('') + '</select></div>') +
      '<button class="btn-s wide" id="fApply" type="button">Show cars</button>';
    bindPanel(); updPrice();
  }
  function updPrice() { var o = document.getElementById('pOut'); if (o) o.innerHTML = '<span data-aed="' + st.max + '">AED ' + st.max.toLocaleString('en-US') + '</span>'; if (OCD.applyCurrency) OCD.applyCurrency(panel); }
  function bindPanel() {
    panel.querySelector('#fq').addEventListener('input', function (e) { st.q = e.target.value; st.shown = 12; render(); });
    panel.querySelectorAll('[data-cat]').forEach(function (i) { i.addEventListener('change', function () { i.checked ? st.cats.add(i.dataset.cat) : st.cats.delete(i.dataset.cat); st.shown = 12; render(); }); });
    panel.querySelectorAll('[data-brand]').forEach(function (i) { i.addEventListener('change', function () { i.checked ? st.brands.add(i.dataset.brand) : st.brands.delete(i.dataset.brand); st.shown = 12; render(); }); });
    panel.querySelector('#fp').addEventListener('input', function (e) { st.max = +e.target.value; updPrice(); st.shown = 12; render(); });
    panel.querySelector('#fs').addEventListener('change', function (e) { st.seats = +e.target.value; st.shown = 12; render(); });
    var nd = panel.querySelector('#fnd'); if (nd) nd.addEventListener('change', function (e) { st.nodep = e.target.checked; st.shown = 12; render(); });
    var fy = panel.querySelector('#fy'); if (fy) fy.addEventListener('change', function (e) { st.year = +e.target.value; st.shown = 12; render(); });
    panel.querySelector('#reset').addEventListener('click', resetAll);
    panel.querySelector('#fApply').addEventListener('click', function () { panel.classList.remove('open'); window.scrollTo({ top: root.offsetTop - 80, behavior: 'smooth' }); });
    panel.querySelector('#fClose').addEventListener('click', function () { panel.classList.remove('open'); });
  }
  function resetAll() {
    st.q = ''; st.cats = new Set(root.dataset.cat ? [root.dataset.cat] : []); st.brands = new Set(root.dataset.brand ? [root.dataset.brand] : []);
    st.max = maxAll; st.seats = +(root.dataset.seats || 0); st.nodep = !!root.dataset.nodep; st.year = 0; st.shown = 12; renderPanel(); render();
  }
  function filtered() {
    var q = st.q.trim().toLowerCase();
    var r = all.filter(function (c) {
      if (q && (c.brand + ' ' + c.model + ' ' + c.year).toLowerCase().indexOf(q) < 0) return false;
      if (st.cats.size && !st.cats.has(c.cat)) return false;
      if (st.brands.size && !st.brands.has(c.brand)) return false;
      if (priceOf(c) > st.max) return false;
      if (st.seats && c.seats < st.seats) return false;
      if (st.nodep && c.deposit !== 0) return false;
      if (st.year && c.year < st.year) return false;
      return true;
    });
    var s = { pop: function (a, b) { return b.pop - a.pop; }, low: function (a, b) { return priceOf(a) - priceOf(b); }, high: function (a, b) { return priceOf(b) - priceOf(a); }, 'new': function (a, b) { return b.year - a.year || b.pop - a.pop; } }[st.sort];
    return r.sort(s);
  }
  function render() {
    var list = filtered();
    count.textContent = list.length + (list.length === 1 ? ' car' : ' cars') + ' available';
    grid.innerHTML = list.slice(0, st.shown).map(function (c) { return OCD_card(c, mode, plan); }).join('');
    document.getElementById('empty').hidden = list.length > 0;
    document.getElementById('more').parentNode.style.display = list.length > st.shown ? '' : 'none';
    if (OCD.applyCurrency) OCD.applyCurrency(grid);
  }
  document.getElementById('sort').addEventListener('change', function (e) { st.sort = e.target.value; render(); });
  document.getElementById('more').addEventListener('click', function () { st.shown += 12; render(); });
  document.getElementById('reset2').addEventListener('click', resetAll);
  document.getElementById('fToggle').addEventListener('click', function () { panel.classList.add('open'); });
  renderPanel(); render();
})();
