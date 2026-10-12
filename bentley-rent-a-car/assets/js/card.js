(function (g) {
  var CAT = { suv: 'SUV', luxury: 'Luxury', sports: 'Sports', convertible: 'Convertible', economy: 'Economy', van: 'Van' };
  var WA = '<svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.4.7 4.7 1.9 6.600L3 29l6.900-2.200a12.700 12.700 0 0 0 6.100 1.600c7 0 12.700-5.700 12.700-12.700S23 3 16 3zm0 23.200c-1.900 0-3.800-.5-5.400-1.500l-.4-.2-4.100 1.300 1.300-4-.3-.4a10.400 10.400 0 1 1 8.900 4.800zm5.700-7.800c-.3-.2-1.900-.9-2.200-1-.3-.1-.5-.2-.7.200s-.8 1-1 1.200c-.2.200-.4.200-.7.100-.3-.2-1.400-.5-2.600-1.600-1-.9-1.600-1.900-1.800-2.200-.2-.3 0-.5.100-.6l.5-.6c.1-.2.2-.3.300-.5.100-.2.100-.4 0-.5l-1-2.300c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1.100 1.100-1.100 2.600s1.100 3 1.300 3.200c.2.200 2.200 3.400 5.400 4.700.8.300 1.400.5 1.800.6.800.2 1.500.2 2 .1.600-.1 1.900-.8 2.100-1.500.3-.7.300-1.400.2-1.500-.1-.1-.3-.2-.6-.4z"/></svg>';
  function money(n, cls) { return '<b class="m ' + (cls || '') + '" data-aed="' + n + '">AED ' + Number(n).toLocaleString('en-US') + '</b>'; }
  function card(c, mode, plan) {
    var buy = mode === 'buy';
    var href = (buy ? '/cars-for-sale/' : '/cars/') + c.slug;
    var price = buy ? c.price : plan === 'week' ? c.week : plan === 'month' ? c.month : c.day;
    var per = buy ? '' : plan === 'week' ? '/ week' : plan === 'month' ? '/ month' : '/ day';
    var specs = buy
      ? '<span><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#calendar"/></svg> ' + c.year + '</span><span><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#road"/></svg> ' + c.km.toLocaleString('en-US') + ' km</span><span><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#gear"/></svg> ' + c.trans + '</span>'
      : '<span><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#users"/></svg> ' + c.seats + ' Seats</span><span><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#gear"/></svg> ' + c.trans + '</span><span><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#fuel"/></svg> ' + c.fuel + '</span>' + (c.deposit === 0 ? '<span class="nodep"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#check"/></svg> No deposit</span>' : '');
    var tag = buy ? 'For sale' : CAT[c.cat];
    return '<article class="car" data-cat="' + c.cat + '">' +
      '<a class="car-img" href="' + href + '"><span class="tag">' + tag + '</span><img src="' + c.img + '" alt="' + (buy ? 'Buy ' : 'Rent ') + c.brand + ' ' + c.model + ' in Dubai" loading="lazy"></a>' +
      '<div class="car-body"><h3><a href="' + href + '">' + c.brand + ' ' + c.model + '</a></h3>' +
      '<p class="sub">' + CAT[c.cat] + ' · ' + c.year + (buy ? ' · ' + c.spec : '') + '</p>' +
      '<div class="specs">' + specs + '</div>' +
      (buy
        ? '<div class="car-foot"><div class="price">' + money(price) + '</div>'
        : '<div class="rates"><div><small>Daily</small>' + money(c.day) + '</div><div><small>Weekly</small>' + money(c.week) + '</div><div><small>Monthly</small>' + money(c.month) + '</div></div><div class="car-foot">') +
      '<a href="https://wa.me/971500000000?text=' + encodeURIComponent((buy ? 'Hi, I am interested in buying the ' : 'Hi, I would like to rent the ') + c.year + ' ' + c.brand + ' ' + c.model + ' in Dubai.') + '" class="btn-wa sm' + (buy ? '' : ' full') + '" target="_blank" rel="noopener">' + WA + ' WhatsApp</a></div></div></article>';
  }
  g.OCD_card = card; g.OCD_money = money; g.OCD_CAT = CAT;
  if (typeof module !== 'undefined') module.exports = { card: card, money: money, CAT: CAT };
})(typeof window !== 'undefined' ? window : globalThis);
