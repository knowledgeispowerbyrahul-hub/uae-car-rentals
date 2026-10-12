const fs = require('fs'), path = require('path');
const cfg = require('./site.config.json');
const { RENT, BUY, slug } = require('./data/cars.js');
const { card, money, CAT } = require('./assets/js/card.js');

const ROOT = __dirname;
const SITE = cfg.domain;
const out = (f, html) => { const p = path.join(ROOT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, html); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const WA = `https://wa.me/${cfg.whatsapp}`;
const WAICON = '<svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.4.7 4.7 1.9 6.600L3 29l6.900-2.200a12.700 12.700 0 0 0 6.100 1.600c7 0 12.700-5.700 12.700-12.700S23 3 16 3zm0 23.200c-1.900 0-3.800-.5-5.400-1.500l-.4-.2-4.100 1.300 1.300-4-.3-.4a10.400 10.400 0 1 1 8.900 4.800zm5.700-7.800c-.3-.2-1.900-.9-2.200-1-.3-.1-.5-.2-.7.200s-.8 1-1 1.200c-.2.200-.4.200-.7.100-.3-.2-1.400-.5-2.600-1.600-1-.9-1.600-1.900-1.800-2.200-.2-.3 0-.5.100-.6l.5-.6c.1-.2.2-.3.300-.5.100-.2.100-.4 0-.5l-1-2.300c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1.100 1.100-1.100 2.600s1.100 3 1.300 3.200c.2.200 2.200 3.400 5.400 4.700.8.300 1.400.5 1.800.6.800.2 1.500.2 2 .1.600-.1 1.900-.8 2.100-1.500.3-.7.300-1.400.2-1.500-.1-.1-.3-.2-.6-.4z"/></svg>';
const waLink = t => `${WA}?text=${encodeURIComponent(t)}`;

const pages = []; // for sitemap
const brandsRent = [...new Set(RENT.map(c => c.brand))].sort();
const brandsBuy = [...new Set(BUY.map(c => c.brand))].sort();
const rentBrandUrl = b => `/rent-${slug(b)}-dubai`;
const brandLogo = (b, cls = 'blogo') => { const f = ['svg', 'png'].find(e => fs.existsSync(path.join(ROOT, `assets/img/brands/${slug(b)}.${e}`))); return f ? `<img class="${cls}" src="/assets/img/brands/${slug(b)}.${f}" alt="${esc(b)} logo" loading="lazy" width="26" height="26">` : `<i>${b[0]}</i>`; };
const buyBrandUrl = b => `/buy-${slug(b)}-used-cars-dubai`;

const CATPAGES = [
  { cat: 'suv', url: '/suv-rental-dubai', name: 'SUV Rental Dubai' },
  { cat: 'luxury', url: '/luxury-car-rental-dubai', name: 'Luxury Car Rental Dubai' },
  { cat: 'sports', url: '/sports-car-rental-dubai', name: 'Sports Car Rental Dubai' },
  { cat: 'convertible', url: '/convertible-car-rental-dubai', name: 'Convertible Rental Dubai' },
  { cat: 'economy', url: '/cheap-car-rental-dubai', name: 'Cheap Car Rental Dubai' },
  { cat: 'van', url: '/van-rental-dubai', name: 'Van & Bus Rental Dubai' },
];
const SEATPAGES = [
  { seats: 7, url: '/7-seater-car-rental-dubai', name: '7 Seater Car Rental Dubai' },
  { seats: 9, url: '/9-seater-car-rental-dubai', name: '9 Seater Van Rental Dubai' },
  { seats: 12, url: '/12-seater-van-rental-dubai', name: '12 Seater Van Rental Dubai' },
];
const PLANPAGES = [
  { plan: 'day', url: '/daily-car-rental-dubai', name: 'Daily Car Rental Dubai' },
  { plan: 'week', url: '/weekly-car-rental-dubai', name: 'Weekly Car Rental Dubai' },
  { plan: 'month', url: '/monthly-car-rental-dubai', name: 'Monthly Car Rental Dubai' },
  { plan: 'day', nodep: true, url: '/no-deposit-car-rental-dubai', name: 'No Deposit Car Rental Dubai' },
];
const AREAS = ['Dubai Marina', 'Downtown Dubai', 'JBR', 'Business Bay', 'Palm Jumeirah', 'Deira', 'Al Barsha', 'DIFC', 'Dubai Airport (DXB)'];
const areaUrl = a => `/rent-a-car-${slug(a.replace(/\(.*\)/, ''))}`;

/* ---------- Layout ---------- */
const nav = `
<nav class="nav" aria-label="Main">
  <div class="dd"><a href="/rent-a-car-dubai">Rent a Car ▾</a><div class="dd-menu">${CATPAGES.map(c => `<a href="${c.url}">${c.name.replace(' Dubai', '')}</a>`).join('')}<a href="/rent-a-car-dubai"><b>All Cars →</b></a></div></div>
  <div class="dd"><a href="/rent-a-car-dubai">Car Brands ▾</a><div class="dd-menu dd-cols">${brandsRent.map(b => `<a href="${rentBrandUrl(b)}">${b}</a>`).join('')}</div></div>
  <div class="dd"><a href="/monthly-car-rental-dubai">Rental Plans ▾</a><div class="dd-menu">${PLANPAGES.map(c => `<a href="${c.url}">${c.name.replace(' Dubai', '')}</a>`).join('')}${SEATPAGES.map(c => `<a href="${c.url}">${c.name.replace(' Dubai', '')}</a>`).join('')}</div></div>
  <div class="dd"><a href="/rent-a-car-dubai-marina">Areas ▾</a><div class="dd-menu">${AREAS.map(a => `<a href="${areaUrl(a)}">${a}</a>`).join('')}</div></div>
  <a href="/buy-used-cars-dubai">Buy a Car</a>
  <a href="/sell-my-car-dubai">Sell My Car</a>
  <a href="/Dubai-Car-Rental-FAQs">FAQ</a>
</nav>`;

const header = `
<div class="utility"><div class="u-wrap">
  <div class="u-left"><a href="tel:${cfg.phone.replace(/\s/g, '')}"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#phone"/></svg> ${cfg.phone}</a><a href="${WA}" target="_blank" rel="noopener"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#whatsapp"/></svg> WhatsApp</a></div>
  <div class="u-right">
    <div class="pop"><button type="button" class="u-sel" data-pop="loc"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#pin"/></svg> <span id="locLabel">Dubai</span> ▾</button>
      <div class="pop-box" id="pop-loc"><b>Pickup area</b>${['Dubai', ...AREAS].map(a => `<button type="button" data-loc="${a}">${a}</button>`).join('')}</div></div>
    <div class="pop"><button type="button" class="u-sel" data-pop="cur"><span id="curLabel">AED</span> / <span id="langLabel">ENG</span> ▾</button>
      <div class="pop-box wide" id="pop-cur"><b>Language</b><div class="pills"><button type="button" data-lang="en">English</button><button type="button" data-lang="ar">العربية</button></div>
        <b>Currency</b><div class="pills">${['AED', 'USD', 'EUR', 'GBP', 'SAR', 'INR'].map(c => `<button type="button" data-cur="${c}">${c}</button>`).join('')}</div></div></div>
  </div>
</div></div>
<header class="header">
  <div class="container nav-row">
    <a href="/" class="brand-logo" aria-label="${esc(cfg.name)} home"><span class="wm">ARMANI NO<em>Deposit</em></span></a>
    ${nav}
    <div class="nav-cta"><button class="burger" aria-label="Menu" type="button"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#menu"/></svg></button></div>
  </div>
</header>`;

const footer = `
<footer class="footer">
  <div class="container">
    <div class="f-grid">
      <div class="f-brand-col">
        <a href="/" class="brand-logo"><span class="wm" style="color:#fff">ARMANI NO<em>Deposit</em></span></a>
        <p class="f-tagline">${cfg.tagline}</p>
        <div class="f-trust-badge">
          <span class="f-stars">★★★★★</span>
          <b>4.9 / 5.0</b> &nbsp;·&nbsp; <span>2,400+ Verified UAE Drivers</span>
        </div>
        <div class="f-social">
          <a href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#whatsapp"/></svg></a>
          <a href="mailto:${cfg.email}" aria-label="Email"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#mail"/></svg></a>
          <a href="tel:${cfg.phone.replace(/\s/g, '')}" aria-label="Call"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#phone"/></svg></a>
        </div>
      </div>
      <div><h4 class="f-title">Rent a Car</h4><ul>${CATPAGES.map(c => `<li><a href="${c.url}">${c.name}</a></li>`).join('')}</ul></div>
      <div><h4 class="f-title">Popular Brands</h4><ul>${brandsRent.slice(0, 8).map(b => `<li><a href="${rentBrandUrl(b)}">Rent ${b}</a></li>`).join('')}</ul></div>
      <div><h4 class="f-title">Company</h4><ul><li><a href="/aboutus">About Us</a></li><li><a href="/contactus">Contact Us</a></li><li><a href="/testimonials">Testimonials</a></li><li><a href="/Dubai-Car-Rental-FAQs">FAQs</a></li><li><a href="/country-driving-license-valid-UAE">Driving Licence Guide</a></li><li><a href="/report-problem">Report a Problem</a></li></ul></div>
      <div class="f-contact-col"><h4 class="f-title">Concierge &amp; Location</h4>
        <ul class="f-contact-list">
          <li><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#pin"/></svg> <span>${cfg.address}</span></li>
          <li><a href="tel:${cfg.phone.replace(/\s/g, '')}"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#phone"/></svg> <span>${cfg.phone}</span></a></li>
          <li><a href="mailto:${cfg.email}"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#mail"/></svg> <span>${cfg.email}</span></a></li>
          <li><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#clock"/></svg> <span>24/7 Doorstep Delivery in Dubai</span></li>
        </ul>
      </div>
    </div>
    <div class="f-pay-strip">
      <span class="f-pay-label">Accepted Payments:</span>
      <div class="f-pay-badges">
        <div class="f-pay-pill" title="Visa">
          <svg class="pay-svg" viewBox="0 0 38 24" width="38" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#ffffff"/>
            <path d="M15.2 16.5l1.8-11.2h2.9l-1.8 11.2h-2.9zm8.5-11c-.6-.2-1.5-.4-2.7-.4-3 0-5.1 1.6-5.1 3.9 0 1.7 1.5 2.6 2.7 3.2 1.2.6 1.6 1 1.6 1.5 0 .8-.9 1.2-1.8 1.2-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.5c.7.3 1.9.6 3.2.6 3.2 0 5.3-1.6 5.3-4 0-1.3-.8-2.3-2.6-3.2-1.1-.5-1.7-.9-1.7-1.5 0-.5.6-1 1.8-1 1 0 1.7.2 2.3.5l.3.1.5-2.5zm7.3 0h-2.2c-.7 0-1.2.2-1.5.9l-4.3 10.3h3l.6-1.7h3.7l.3 1.7h2.7l-2.3-11.2zm-3.6 7.2l1.5-4.2.9 4.2h-2.4zm-14.2-7.2l-2.8 7.6-.3-1.5c-.5-1.7-2.1-3.6-3.9-4.5l2.5 9.6h3l4.5-11.2h-3z" fill="#1434CB"/>
            <path d="M6.2 5.3h4.5c.6 0 1.1.4 1.2 1l.7 3.6-2.5-1.3c-.6-.4-2.1-.9-3.9-1.2v-2.1z" fill="#F7B600"/>
          </svg>
          <span>VISA</span>
        </div>
        <div class="f-pay-pill" title="Mastercard">
          <svg class="pay-svg" viewBox="0 0 38 24" width="38" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#ffffff"/>
            <circle cx="14.5" cy="12" r="6.8" fill="#EB001B"/>
            <circle cx="23.5" cy="12" r="6.8" fill="#F79E1B"/>
            <path d="M19 7.7a6.76 6.76 0 0 1 2.3 4.3 6.76 6.76 0 0 1-2.3 4.3 6.76 6.76 0 0 1-2.3-4.3c0-1.7.8-3.2 2.3-4.3z" fill="#FF5F00"/>
          </svg>
          <span>Mastercard</span>
        </div>
        <div class="f-pay-pill" title="Apple Pay">
          <svg class="pay-svg" viewBox="0 0 38 24" width="38" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#ffffff"/>
            <path d="M12.2 8.3c.4-.5.7-1.3.6-2-.7 0-1.5.5-1.9 1-.4.5-.7 1.3-.6 2 .7 0 1.4-.4 1.9-1zm.7 1.1c-1.1-.1-2 .6-2.5.6-.5 0-1.3-.6-2.1-.6-1.1 0-2.1.7-2.7 1.7-1.1 2-.3 4.9.8 6.5.5.8 1.2 1.7 2 1.7.8 0 1.2-.5 2.2-.5 1 0 1.4.5 2.2.5.9 0 1.4-.8 2-1.6.6-.9.9-1.8.9-1.9 0-.1-1.8-.7-1.8-2.7 0-1.7 1.4-2.6 1.5-2.6-.8-1.2-2.1-1.3-2.5-1.1z" fill="#000000"/>
            <path d="M17.5 7.3h2.6c1.7 0 2.8 1.1 2.8 2.7 0 1.6-1.1 2.7-2.8 2.7h-1.2v3.6h-1.4V7.3zm2.5 4.1c.9 0 1.5-.6 1.5-1.5s-.6-1.5-1.5-1.5h-1.1v3h1.1zm4.6 3.3c0-1.1.8-1.8 2.4-1.8l1.4-.1v-.5c0-.7-.5-1.1-1.3-1.1-.7 0-1.2.3-1.4.8h-1.2c.2-1.1 1.2-1.8 2.6-1.8 1.5 0 2.6.8 2.6 2.1v4.2h-1.3v-.9c-.5.6-1.2 1-2 1-1.2 0-1.8-.8-1.8-1.9zm3.8-.5v-.7l-1.2.1c-.8.1-1.2.4-1.2 1 0 .5.5.9 1.1.9.7 0 1.3-.5 1.3-1.3zm3.2-3.4l1.5 4.3 1.5-4.3h1.4l-2.3 6c-.6 1.6-1.3 2.1-2.6 2.1-.3 0-.6 0-.8-.1v-1.1c.2 0 .4.1.6.1.7 0 1.1-.3 1.4-1.2l.2-.6-2.5-5.2h1.6z" fill="#000000"/>
          </svg>
          <span>Apple Pay</span>
        </div>
        <div class="f-pay-pill" title="Google Pay">
          <svg class="pay-svg" viewBox="0 0 38 24" width="38" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#ffffff"/>
            <path d="M13.6 12.1c0-.3 0-.6-.1-.8h-3.4v1.7h1.9c-.1.5-.4 1-.8 1.3v1.1h1.4c.8-.8 1-2 1-3.3z" fill="#4285F4"/>
            <path d="M10.1 15.6c1 0 1.8-.3 2.4-.9l-1.2-.9c-.3.2-.8.4-1.2.4-.9 0-1.7-.6-2-1.5H6.6v1c.7 1.3 2 1.9 3.5 1.9z" fill="#34A853"/>
            <path d="M8.1 12.7c-.1-.2-.1-.5-.1-.8s0-.6.1-.8v-1H6.6c-.3.6-.5 1.2-.5 1.8s.2 1.2.5 1.8l1.5-1z" fill="#FBBC05"/>
            <path d="M10.1 9.5c.5 0 1 .2 1.4.5l1-1c-.6-.6-1.4-.9-2.4-.9-1.5 0-2.8.6-3.5 1.9l1.5 1c.3-.9 1.1-1.5 2-1.5z" fill="#EA4335"/>
            <path d="M17.1 8.8h2.6c1.7 0 2.8 1.1 2.8 2.7 0 1.6-1.1 2.7-2.8 2.7h-1.2v3.1h-1.4V8.8zm2.5 4.1c.9 0 1.5-.6 1.5-1.5s-.6-1.5-1.5-1.5h-1.1v3h1.1zm4.6 2.9c0-1.1.8-1.7 2.3-1.8l1.4-.1v-.5c0-.7-.5-1.1-1.2-1.1-.7 0-1.2.3-1.4.8h-1.2c.2-1.1 1.2-1.8 2.6-1.8 1.5 0 2.6.8 2.6 2.1v4h-1.3v-.9c-.5.6-1.2 1-1.9 1-1.2 0-1.9-.8-1.9-1.9zm3.7-.5v-.6l-1.2.1c-.8.1-1.2.4-1.2 1 0 .5.5.9 1.1.9.7 0 1.3-.5 1.3-1.4zm3.2-3.3l1.5 4.2 1.5-4.2h1.4l-2.3 5.8c-.6 1.6-1.3 2.1-2.6 2.1-.3 0-.6 0-.8-.1v-1.1c.2 0 .4.1.6.1.7 0 1.1-.3 1.4-1.2l.2-.6-2.5-5h1.5z" fill="#5F6368"/>
          </svg>
          <span>Google Pay</span>
        </div>
        <div class="f-pay-pill" title="Cash on Delivery">
          <svg class="pay-svg" viewBox="0 0 38 24" width="38" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#ffffff"/>
            <rect x="7" y="6" width="24" height="12" rx="2" stroke="#16a34a" stroke-width="1.6" fill="#f0fdf4"/>
            <circle cx="19" cy="12" r="3" stroke="#16a34a" stroke-width="1.5" fill="none"/>
            <path d="M10 9h.01M28 15h.01" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>Cash on Delivery</span>
        </div>
        <div class="f-pay-pill" title="Bank Transfer">
          <svg class="pay-svg" viewBox="0 0 38 24" width="38" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#ffffff"/>
            <path d="M8 8.5L19 4.5l11 4v1.5H8V8.5zm3 3v5.5h2.5V11.5H11zm5.5 0v5.5H19V11.5h-2.5zm5.5 0v5.5h2.5V11.5H22zm-14 7h24V20H8v-1.5z" fill="#0284c7"/>
          </svg>
          <span>Bank Transfer</span>
        </div>
      </div>
    </div>
    <div class="f-areas"><b>Popular Delivery Locations:</b> ${AREAS.map(a => `<a href="${areaUrl(a)}">${a}</a>`).join(' <span class="dot">·</span> ')}</div>
    <div class="f-bottom">
      <span>© ${new Date().getFullYear()} ${cfg.name} LLC. All rights reserved. RTA Dubai Approved.</span>
      <div class="f-legal-links"><a href="/terms">Terms</a><span class="dot">·</span><a href="/privacy">Privacy</a><span class="dot">·</span><span>Dubai, United Arab Emirates 🇦🇪</span></div>
    </div>
  </div>
</footer>`;

const tail = `
<a class="fab" href="${WA}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${WAICON.replace('width="18" height="18"', 'width="32" height="32"')}</a>
<script src="/assets/js/card.js"></script>
<script src="/assets/js/data.js"></script>
<script src="/assets/js/main.js"></script>
<script src="/assets/js/listing.js" defer></script>
<script src="/assets/js/detail.js" defer></script>`;

const headTpl = ({ title, desc, url, ld = [], img }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${url}">
<link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">
<link rel="shortcut icon" href="/favicon.ico">
<meta name="theme-color" content="#059669">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${url}"><meta property="og:image" content="${SITE}${img || '/assets/img/hero-showroom.jpg'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css"><link rel="stylesheet" href="/assets/css/pages.css"><link rel="stylesheet" href="/assets/css/home.css">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'AutoRental', name: cfg.name, url: SITE, telephone: cfg.phone, email: cfg.email, address: { '@type': 'PostalAddress', streetAddress: 'Business Bay', addressLocality: 'Dubai', addressCountry: 'AE' }, openingHours: 'Mo-Su 00:00-23:59', areaServed: 'Dubai' })}</script>
${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>`;

function page({ file, url, title, desc, body, ld, img, noindex }) {
  const html = `${headTpl({ title, desc, url, ld, img })}
<body>
${header}
${body}
${footer}
${tail}
</body>
</html>`;
  out(file, noindex ? html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8"><meta name="robots" content="noindex">') : html);
  if (!noindex) pages.push(url);
}

const crumbs = list => `<nav class="crumbs" aria-label="Breadcrumb">${list.map(([n, u], i) => u ? `<a href="${u}">${n}</a>` : `<span>${n}</span>`).join('<i>›</i>')}</nav>`;
const crumbLD = list => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + (u || '') })) });

/* ---------- Listing pages ---------- */
function faqBlock(items) {
  return `<section class="container seo-faq"><h2>Frequently asked questions</h2>${items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>`;
}
const defaultFaq = [
  ['What do I need to rent a car in Dubai?', 'Tourists need a passport, entry stamp and a valid driving licence (an International Driving Permit may be needed). Residents need an Emirates ID and a valid UAE or foreign licence.'],
  ['Is a security deposit required?', 'Most cars need a refundable deposit. Many economy and mid-range cars have zero-deposit options, especially on weekly and monthly rentals.'],
  ['Do you deliver the car to my hotel or the airport?', 'Yes. We deliver and collect across Dubai, including DXB airport, hotels and homes. Delivery is free on rentals of 3 days or more.'],
  ['Is insurance included?', 'Basic comprehensive insurance is included with every rental. Optional full cover can be added to reduce the excess to zero.'],
];

function listPage({ file, url, title, desc, h1, intro, mode = 'rent', data = {}, crumbList, extra = '', seoText = '', faq = defaultFaq }) {
  const attrs = Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
  const body = `
<div class="container page-top">${crumbs(crumbList)}<h1>${h1}</h1><p class="intro">${intro}</p></div>
<section class="container list-wrap" data-list="${mode}" ${attrs}>
  <aside class="fpanel" id="fpanel"></aside>
  <div class="lmain">
    <div class="lbar"><span id="count" class="count"></span>
      <div class="lbar-r"><button class="btn-o sm" id="fToggle" type="button"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#menu"/></svg> Filters</button>
      <select id="sort" aria-label="Sort cars"><option value="pop">Most popular</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="new">Newest first</option></select></div></div>
    <div class="cars" id="grid"></div>
    <p id="empty" class="empty" hidden>No cars match your filters. <button class="link" id="reset2" type="button">Reset filters</button></p>
    <div class="center-cta"><button class="btn-o" id="more" type="button">Load more cars</button></div>
  </div>
</section>
${extra}
${seoText ? `<section class="container seo-text">${seoText}</section>` : ''}
${faqBlock(faq)}`;
  page({ file, url, title, desc, body, ld: [crumbLD(crumbList), { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] });
}

const R = ['Home', '/'];
const seoGeneric = (what) => `<h2>${what}: how it works</h2><p>Choose your car, send us your documents on WhatsApp and we deliver it to your door. Prices shown are per day and include basic insurance. Weekly and monthly plans are cheaper per day, and you can switch the currency from the top bar.</p><p>All cars are serviced regularly, fully insured and cleaned before every handover. Need something that isn't listed? Message us and we'll find it for you.</p>`;

// Main rent + buy
listPage({ file: 'rent-a-car-dubai.html', url: '/rent-a-car-dubai', title: 'Rent a Car Dubai from AED 75/Day | Luxury, SUV & Economy – ' + cfg.short, desc: 'Rent a car in Dubai from AED 75/day. Browse 55+ SUVs, luxury, sports, convertible and economy cars with free delivery and no hidden fees.', h1: 'Rent a Car in Dubai', intro: 'Car hire on a daily, weekly or monthly basis. Free delivery, transparent prices and 24/7 support.', crumbList: [R, ['Rent a Car Dubai']], seoText: seoGeneric('Car rental in Dubai') });
listPage({ file: 'buy-used-cars-dubai.html', url: '/buy-used-cars-dubai', title: 'Buy Used Cars in Dubai | Certified GCC Spec Cars – ' + cfg.short, desc: 'Buy certified used cars in Dubai. Inspected GCC-spec SUVs, sedans, sports and economy cars with finance support.', h1: 'Used Cars for Sale in Dubai', intro: 'Inspected, GCC-spec cars with clear history. Filter by brand, price and year.', mode: 'buy', crumbList: [R, ['Buy a Car']], seoText: '<h2>Buying a used car in Dubai</h2><p>Every car is checked by our team and comes with a service history. Finance, insurance and registration support are available. Message us on WhatsApp to arrange a viewing or test drive.</p>', faq: [['Are the cars GCC spec?', 'Yes. All cars listed are GCC spec unless stated otherwise.'], ['Can I get car finance?', 'Yes, we can connect you with banks for finance. Use the EMI calculator on any car page to estimate payments.'], ['Can I test drive before buying?', 'Absolutely. Send us a message and we will arrange a test drive.']] });

CATPAGES.forEach(c => listPage({ file: c.url.slice(1) + '.html', url: c.url, title: `${c.name} | Best Prices from AED ${Math.min(...RENT.filter(x => x.cat === c.cat).map(x => x.day))}/Day – ${cfg.short}`, desc: `${c.name}: ${RENT.filter(x => x.cat === c.cat).length} cars available with free delivery, flexible deposits and daily, weekly and monthly plans.`, h1: c.name, intro: `Choose from ${RENT.filter(x => x.cat === c.cat).length} ${CAT[c.cat].toLowerCase()} cars available for rent in Dubai today.`, data: { cat: c.cat }, crumbList: [R, ['Rent a Car Dubai', '/rent-a-car-dubai'], [c.name]], seoText: seoGeneric(c.name) }));
SEATPAGES.forEach(c => listPage({ file: c.url.slice(1) + '.html', url: c.url, title: `${c.name} | ${cfg.short}`, desc: `${c.name}. Spacious vehicles for families and groups with free delivery in Dubai.`, h1: c.name, intro: `Cars and vans with ${c.seats}+ seats for families, tours and group travel.`, data: { seats: c.seats }, crumbList: [R, ['Rent a Car Dubai', '/rent-a-car-dubai'], [c.name]], seoText: seoGeneric(c.name) }));
PLANPAGES.forEach(c => listPage({ file: c.url.slice(1) + '.html', url: c.url, title: `${c.name} | Best Rates – ${cfg.short}`, desc: `${c.name}. Flexible plans with transparent pricing and free delivery across Dubai.`, h1: c.name, intro: c.nodep ? 'Cars you can rent with zero security deposit.' : `Prices shown ${c.plan === 'day' ? 'per day' : c.plan === 'week' ? 'per week' : 'per month'}. Longer rentals get lower daily rates.`, data: { plan: c.plan, nodep: c.nodep ? '1' : '' }, crumbList: [R, ['Rent a Car Dubai', '/rent-a-car-dubai'], [c.name]], seoText: seoGeneric(c.name) }));
brandsRent.forEach(b => listPage({ file: rentBrandUrl(b).slice(1) + '.html', url: rentBrandUrl(b), title: `Rent ${b} in Dubai | ${RENT.filter(x => x.brand === b).length} Models from AED ${Math.min(...RENT.filter(x => x.brand === b).map(x => x.day))}/Day – ${cfg.short}`, desc: `Rent a ${b} in Dubai with free delivery. Compare models, prices and book on WhatsApp.`, h1: `Rent ${b} in Dubai`, intro: `${RENT.filter(x => x.brand === b).length} ${b} models available for daily, weekly and monthly rental.`, data: { brand: b }, crumbList: [R, ['Rent a Car Dubai', '/rent-a-car-dubai'], [`${b}`]], seoText: seoGeneric(`${b} rental`) }));
brandsBuy.forEach(b => listPage({ file: buyBrandUrl(b).slice(1) + '.html', url: buyBrandUrl(b), title: `Buy Used ${b} in Dubai – ${cfg.short}`, desc: `Used ${b} cars for sale in Dubai. GCC spec, inspected and ready to drive.`, h1: `Used ${b} for Sale in Dubai`, intro: `${BUY.filter(x => x.brand === b).length} certified used ${b} cars available.`, mode: 'buy', data: { brand: b }, crumbList: [R, ['Buy a Car', '/buy-used-cars-dubai'], [b]] }));
AREAS.forEach(a => listPage({ file: areaUrl(a).slice(1) + '.html', url: areaUrl(a), title: `Rent a Car in ${a.replace(/\(.*\)/, '').trim()} | Free Delivery – ${cfg.short}`, desc: `Car rental in ${a} with free delivery and pickup. Luxury, SUV and economy cars from AED 75/day.`, h1: `Rent a Car in ${a}`, intro: `We deliver to ${a} and collect from your door. Choose a car below and message us on WhatsApp.`, crumbList: [R, ['Rent a Car Dubai', '/rent-a-car-dubai'], [a]], seoText: seoGeneric(`Car rental in ${a}`) }));

/* ---------- Detail pages ---------- */
const FEATS = { suv: ['Spacious cabin', 'Panoramic roof', 'Apple CarPlay', 'Rear camera', 'Cruise control', '4x4 capable'], luxury: ['Leather seats', 'Massage seats', 'Premium sound', 'Ambient lighting', 'Adaptive cruise', 'Rear entertainment'], sports: ['Launch control', 'Sport exhaust', 'Carbon trim', 'Track modes', 'Bluetooth audio', 'Parking sensors'], convertible: ['Open-top driving', 'Heated seats', 'Wind deflector', 'Bluetooth audio', 'Parking sensors', 'Cruise control'], economy: ['Fuel efficient', 'Bluetooth audio', 'USB charging', 'Air conditioning', 'Rear sensors', 'Easy parking'], van: ['Large luggage space', 'Dual A/C', 'Seat belts all rows', 'USB charging', 'Sliding door', 'Ideal for groups'] };
const specs = c => [['Brand', c.brand], ['Model', c.model], ['Year', c.year], ['Type', CAT[c.cat]], ['Seats', c.seats], ['Doors', c.doors], ['Transmission', c.trans], ['Fuel', c.fuel], ...(c.hp ? [['Power', c.hp + ' HP']] : []), ['Luggage', (c.bags || 2) + ' bags']];
const thumbs = img => [0, 1, 2, 3, 4].map(i => `<button type="button" class="thumb${i === 0 ? ' on' : ''}" data-i="${i}"><img src="${img}" alt="" loading="lazy" style="${['', 'object-position:20% 60%;transform:scale(1.5)', 'object-position:80% 60%;transform:scale(1.5)', 'object-position:50% 90%;transform:scale(1.6)', 'object-position:50% 20%;transform:scale(1.4)'][i]}"></button>`).join('');

RENT.forEach(c => {
  const name = `${c.year} ${c.brand} ${c.model}`;
  const similar = RENT.filter(x => x.cat === c.cat && x.id !== c.id).slice(0, 3);
  const crumbList = [R, ['Rent a Car Dubai', '/rent-a-car-dubai'], [CAT[c.cat] + ' Rental', CATPAGES.find(p => p.cat === c.cat).url], [`${c.brand} ${c.model}`]];
  const body = `
<div class="container page-top">${crumbs(crumbList)}</div>
<section class="container det">
  <div class="det-main">
    <h1>${name} Rental in Dubai</h1>
    <p class="sub">${CAT[c.cat]} · ${c.seats} seats · ${c.trans} · ${c.fuel}${c.deposit === 0 ? ' · <span class="nodep">No deposit</span>' : ''}</p>
    <div class="gal"><div class="gal-main"><img id="gMain" src="${c.img}" alt="${name} for rent in Dubai"></div><div class="gal-thumbs" data-img="${c.img}">${thumbs(c.img)}</div></div>
    <h2>Specifications</h2>
    <div class="spec-grid">${specs(c).map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
    <h2>About this car</h2>
    <p>The ${name} is a great choice for ${c.cat === 'economy' ? 'budget-friendly city driving' : c.cat === 'van' ? 'group and family travel' : c.cat === 'sports' ? 'an unforgettable drive' : 'comfort and style'} in Dubai. It comes fully insured, freshly cleaned and delivered to your hotel, home or the airport.</p>
    <h2>Features</h2>
    <ul class="feat">${FEATS[c.cat].map(f => `<li><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#check"/></svg> ${f}</li>`).join('')}</ul>
    <h2>Rental rates &amp; terms</h2>
    <table class="tbl"><tr><th>Daily</th><td>${money(c.day)}</td><th>Weekly</th><td>${money(c.week)}</td></tr><tr><th>Monthly</th><td>${money(c.month)}</td><th>Security deposit</th><td>${c.deposit === 0 ? 'No deposit' : money(c.deposit)}</td></tr><tr><th>Mileage</th><td>${c.km} km / day</td><th>Insurance</th><td>Basic included</td></tr><tr><th>Minimum age</th><td>${c.day >= 1500 ? '25' : '21'} years</td><th>Delivery</th><td>Free over 3 days</td></tr></table>
  </div>
  <aside class="book" id="book" data-day="${c.day}" data-week="${c.week}" data-month="${c.month}" data-deposit="${c.deposit}" data-name="${esc(name)}" data-wa="${cfg.whatsapp}" data-email="${cfg.email}">
    <div class="book-price"><small>from</small> ${money(c.day, 'lg')} <small>/ day</small></div>
    <label>Pickup date<input type="date" id="bFrom"></label>
    <label>Return date<input type="date" id="bTo"></label>
    <label>Pickup area<select id="bLoc">${['Dubai', ...AREAS].map(a => `<option>${a}</option>`).join('')}</select></label>
    <div class="book-total"><span id="bDays">1 day</span><b id="bTotal" data-aed="${c.day}">AED ${c.day}</b></div>
    <small class="muted">${c.deposit === 0 ? 'No security deposit' : 'Refundable deposit: AED ' + c.deposit.toLocaleString('en-US')} · ${c.km} km/day included</small>
    <a class="btn-wa wide" id="bWa" target="_blank" rel="noopener" href="${waLink('Hi, I would like to rent the ' + name)}">${WAICON} Book on WhatsApp</a>
    <a class="btn-o wide" id="bMail" href="mailto:${cfg.email}?subject=${encodeURIComponent('Rental enquiry: ' + name)}"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#mail"/></svg> Enquire by email</a>
    <a class="btn-o wide" href="tel:${cfg.phone.replace(/\s/g, '')}"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#phone"/></svg> Call ${cfg.phone}</a>
  </aside>
</section>
<section class="container similar"><h2>Similar cars</h2><div class="cars">${similar.map(x => card(x, 'rent')).join('')}</div></section>`;
  page({ file: `cars/${c.slug}.html`, url: `/cars/${c.slug}`, title: `Rent ${name} in Dubai from AED ${c.day}/Day – ${cfg.short}`, desc: `Rent the ${name} in Dubai from AED ${c.day}/day. ${c.seats} seats, ${c.trans.toLowerCase()}, ${c.fuel.toLowerCase()}. Free delivery and WhatsApp booking.`, body, img: c.img, ld: [crumbLD(crumbList), { '@context': 'https://schema.org', '@type': 'Product', name: `${name} Rental`, image: SITE + c.img, brand: { '@type': 'Brand', name: c.brand }, offers: { '@type': 'Offer', priceCurrency: 'AED', price: c.day, availability: 'https://schema.org/InStock', url: `${SITE}/cars/${c.slug}` } }] });
});

BUY.forEach(c => {
  const name = `${c.year} ${c.brand} ${c.model}`;
  const similar = BUY.filter(x => x.cat === c.cat && x.id !== c.id).slice(0, 3);
  const crumbList = [R, ['Buy a Car', '/buy-used-cars-dubai'], [c.brand, buyBrandUrl(c.brand)], [c.model]];
  const body = `
<div class="container page-top">${crumbs(crumbList)}</div>
<section class="container det">
  <div class="det-main">
    <h1>${name} for Sale in Dubai</h1>
    <p class="sub">${CAT[c.cat]} · ${c.km.toLocaleString('en-US')} km · ${c.spec} · ${c.trans}</p>
    <div class="gal"><div class="gal-main"><img id="gMain" src="${c.img}" alt="${name} for sale in Dubai"></div><div class="gal-thumbs" data-img="${c.img}">${thumbs(c.img)}</div></div>
    <h2>Car details</h2>
    <div class="spec-grid">${[['Brand', c.brand], ['Model', c.model], ['Year', c.year], ['Mileage', c.km.toLocaleString('en-US') + ' km'], ['Type', CAT[c.cat]], ['Seats', c.seats], ['Transmission', c.trans], ['Fuel', c.fuel], ['Specs', c.spec], ['Warranty', 'Available']].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
    <h2>About this car</h2>
    <p>This ${name} has been inspected by our team and comes with a clean history report. Finance, insurance and registration support are available. Message us to arrange a viewing or a test drive.</p>
    <h2>Features</h2>
    <ul class="feat">${FEATS[c.cat].map(f => `<li><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#check"/></svg> ${f}</li>`).join('')}</ul>
  </div>
  <aside class="book" id="buyBox" data-price="${c.price}" data-name="${esc(name)}" data-wa="${cfg.whatsapp}" data-email="${cfg.email}">
    <div class="book-price">${money(c.price, 'lg')}</div>
    <div class="emi"><b>EMI calculator</b>
      <label>Down payment <output id="dpOut">20%</output><input type="range" id="dp" min="0" max="60" value="20" step="5"></label>
      <label>Tenure <output id="yrOut">4 years</output><input type="range" id="yr" min="1" max="5" value="4"></label>
      <div class="book-total"><span>Estimated monthly</span><b id="emiOut">—</b></div><small class="muted">Indicative at 4.5% p.a. Final rate depends on the bank.</small></div>
    <a class="btn-wa wide" id="bWa" target="_blank" rel="noopener" href="${waLink('Hi, I am interested in buying the ' + name)}">${WAICON} Enquire on WhatsApp</a>
    <a class="btn-o wide" id="bMail" href="mailto:${cfg.email}?subject=${encodeURIComponent('Buy enquiry: ' + name)}"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#mail"/></svg> Enquire by email</a>
    <a class="btn-o wide" href="tel:${cfg.phone.replace(/\s/g, '')}"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#phone"/></svg> Call ${cfg.phone}</a>
  </aside>
</section>
<section class="container similar"><h2>Similar cars for sale</h2><div class="cars">${similar.map(x => card(x, 'buy')).join('')}</div></section>`;
  page({ file: `cars-for-sale/${c.slug}.html`, url: `/cars-for-sale/${c.slug}`, title: `${name} for Sale in Dubai – AED ${c.price.toLocaleString('en-US')} | ${cfg.short}`, desc: `Buy a used ${name} in Dubai for AED ${c.price.toLocaleString('en-US')}. ${c.km.toLocaleString('en-US')} km, ${c.spec}. Finance and test drive available.`, body, img: c.img, ld: [crumbLD(crumbList), { '@context': 'https://schema.org', '@type': 'Product', name, image: SITE + c.img, offers: { '@type': 'Offer', priceCurrency: 'AED', price: c.price, availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/UsedCondition' } }] });
});

/* ---------- Home ---------- */
(function () {
  let h = fs.readFileSync(path.join(ROOT, 'src/home.html'), 'utf8');
  h = h.replace('<!--BRANDCHIPS-->', brandsRent.map(b => `<a href="${rentBrandUrl(b)}" class="bchip">${brandLogo(b)}${b}</a>`).join(''))
    .replace('<!--BRANDGRID-->', brandsRent.slice(0, 18).map(b => `<a href="${rentBrandUrl(b)}" class="brand reveal">${brandLogo(b, 'blogo big')}<span>${b}</span></a>`).join(''));
  page({ file: 'index.html', url: '/', title: `Rent a Car Dubai | Luxury, Sports & Economy Car Rental – ${cfg.short}`, desc: 'Rent a car in Dubai with free delivery, flexible daily, weekly and monthly rates and 24/7 support. Also buy or sell your car.', body: h });
})();

/* ---------- Sell page ---------- */
const brandOpts = [...new Set([...RENT, ...BUY].map(c => c.brand))].sort().map(b => `<option>${b}</option>`).join('');
page({
  file: 'sell-my-car-dubai.html', url: '/sell-my-car-dubai', title: `Sell My Car in Dubai – Free Valuation | ${cfg.short}`, desc: 'Sell your car in Dubai free. Get a quick valuation and a fast sale with no listing fees.', ld: [crumbLD([R, ['Sell My Car']])],
  body: `
<div class="container page-top">${crumbs([R, ['Sell My Car']])}<h1>Sell My Car in Dubai</h1><p class="intro">Free valuation. No listing fees. Fast, safe and simple.</p></div>
<section class="container form-wrap">
  <form class="form-card" data-wa-form data-subject="Sell my car enquiry" data-wa="${cfg.whatsapp}" data-email="${cfg.email}">
    <h2>Tell us about your car</h2>
    <div class="fgrid">
      <label>Brand<select name="Brand" required><option value="">Select brand</option>${brandOpts}<option>Other</option></select></label>
      <label>Model<input name="Model" required placeholder="e.g. X5, Corolla"></label>
      <label>Year<select name="Year" required>${Array.from({ length: 16 }, (_, i) => `<option>${2026 - i}</option>`).join('')}</select></label>
      <label>Mileage (km)<input name="Mileage" type="number" min="0" required placeholder="e.g. 45000"></label>
      <label>Specs<select name="Specs"><option>GCC</option><option>American</option><option>European</option><option>Japanese</option><option>Other</option></select></label>
      <label>Expected price (AED)<input name="Expected price" type="number" min="0" placeholder="Optional"></label>
      <label>Your name<input name="Name" required></label>
      <label>Mobile / WhatsApp<input name="Phone" required inputmode="tel" placeholder="+971 50 000 0000"></label>
    </div>
    <label>Notes<textarea name="Notes" rows="3" placeholder="Service history, accidents, extras…"></textarea></label>
    <div class="form-actions"><button class="btn-wa big" type="submit">${WAICON} Send on WhatsApp</button><button class="btn-o big" type="button" data-mail><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#mail"/></svg> Send by email</button></div>
    <p class="form-ok" hidden>Thanks! Your details are ready in WhatsApp. We'll reply with a valuation shortly.</p>
  </form>
  <div class="side-card"><h3>How it works</h3><ol class="steps-list"><li><b>Share your details</b>Fill in the form with your car's basics.</li><li><b>Get a valuation</b>We reply with a fair market price in minutes.</li><li><b>Inspection &amp; paperwork</b>We help with transfer, so you get paid safely.</li></ol>
  <h3>Why sell with us</h3><ul class="feat one"><li><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#check"/></svg> Free valuation</li><li><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#check"/></svg> No listing fees</li><li><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#check"/></svg> Same-day payment</li><li><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#check"/></svg> Paperwork handled</li></ul></div>
</section>`
});

/* ---------- Info pages ---------- */
const info = (file, url, title, h1, desc, inner, ld = []) => page({ file, url, title: `${title} | ${cfg.short}`, desc, ld: [crumbLD([R, [h1]]), ...ld], body: `<div class="container page-top">${crumbs([R, [h1]])}<h1>${h1}</h1></div><section class="container prose">${inner}</section>` });

info('aboutus.html', '/aboutus', 'About Us', 'About Us', 'Learn about our Dubai car rental, used car and car selling services.', `
<p class="lead">We're a Dubai-based car company helping residents and visitors rent, buy and sell cars with honest prices and real support.</p>
<div class="stat-row"><div><b>120+</b><span>Cars in fleet</span></div><div><b>15,000+</b><span>Happy customers</span></div><div><b>24/7</b><span>Support</span></div><div><b>4.9<svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#star"/></svg></b><span>Average rating</span></div></div>
<h2>Our story</h2><p>We started with a simple idea: renting a car in Dubai should be easy, transparent and stress-free. Today we serve tourists, expats and businesses across the emirate.</p>
<h2>What we value</h2><div class="cards3"><div class="feature"><div class="ico"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#award"/></svg></div><h3>Honesty</h3><p>Clear pricing and no hidden charges, ever.</p></div><div class="feature"><div class="ico"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#bolt"/></svg></div><h3>Speed</h3><p>Booking in minutes and delivery to your door.</p></div><div class="feature"><div class="ico"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#shield"/></svg></div><h3>Safety</h3><p>Well-maintained, fully insured cars.</p></div></div>`);

info('contactus.html', '/contactus', 'Contact Us', 'Contact Us', 'Contact us by phone, WhatsApp or email for car rental, buying and selling in Dubai.', `
<div class="contact-grid">
  <div class="cards3 stack"><div class="feature"><div class="ico"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#phone"/></svg></div><h3>Call us</h3><p><a href="tel:${cfg.phone.replace(/\s/g, '')}">${cfg.phone}</a></p></div><div class="feature"><div class="ico"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#whatsapp"/></svg></div><h3>WhatsApp</h3><p><a href="${WA}" target="_blank" rel="noopener">Chat with us now</a></p></div><div class="feature"><div class="ico"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#mail"/></svg></div><h3>Email</h3><p><a href="mailto:${cfg.email}">${cfg.email}</a></p></div><div class="feature"><div class="ico"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#pin"/></svg></div><h3>Visit</h3><p>${cfg.address}<br>${cfg.hours}</p></div></div>
  <form class="form-card" data-wa-form data-subject="Website enquiry" data-wa="${cfg.whatsapp}" data-email="${cfg.email}"><h2>Send a message</h2>
    <label>Name<input name="Name" required></label><label>Phone<input name="Phone" required inputmode="tel"></label><label>Email<input name="Email" type="email"></label>
    <label>Message<textarea name="Message" rows="4" required></textarea></label>
    <div class="form-actions"><button class="btn-wa big" type="submit">${WAICON} Send on WhatsApp</button><button class="btn-o big" type="button" data-mail><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#mail"/></svg> Send by email</button></div><p class="form-ok" hidden>Thanks! Your message is ready in WhatsApp.</p></form>
</div>
<iframe class="map" title="Our location" loading="lazy" src="https://www.google.com/maps?q=Business+Bay+Dubai&output=embed"></iframe>`);

const reviews = [['Ahmed K.', 'Tourist · UK', 'Car arrived at my hotel on time and spotless. Smooth process from start to finish.'], ['Sara M.', 'Resident · Dubai', 'Great prices and an easy monthly rental. The team replied on WhatsApp within minutes.'], ['Raj P.', 'Visitor · India', 'Rented a supercar for a weekend. Amazing condition and friendly staff.'], ['Olga V.', 'Tourist · Russia', 'Delivery to the airport was perfect. Would definitely rent again.'], ['Khalid A.', 'Resident · Dubai', 'Sold my car through them in two days. Paperwork was handled for me.'], ['Emma R.', 'Tourist · Germany', 'Clear terms, no surprises at return. Highly recommended.'], ['Faisal H.', 'Business · Dubai', 'We rent vans for staff trips. Reliable service and fair pricing.'], ['Priya S.', 'Resident · Dubai', 'Bought a used SUV here. Honest advice and a smooth test drive.'], ['Daniel T.', 'Tourist · USA', 'The convertible made our trip. Easy pickup and great communication.']];
info('testimonials.html', '/testimonials', 'Customer Testimonials', 'Customer Testimonials', 'Read what customers say about renting, buying and selling cars with us in Dubai.', `<div class="reviews three">${reviews.map(([n, w, t]) => `<div class="review"><div class="stars"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#star"/></svg><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#star"/></svg><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#star"/></svg><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#star"/></svg><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#star"/></svg></div><p>"${t}"</p><div class="who"><div class="avatar">${n[0]}</div><div><b>${n}</b><small>${w}</small></div></div></div>`).join('')}</div>`);

const faqAll = [['What documents do I need to rent a car in Dubai?', 'Tourists need a passport, visa or entry stamp and a valid driving licence. Residents need an Emirates ID and a valid licence. An International Driving Permit may be required depending on your licence country.'], ['What is the minimum age to rent?', 'The minimum age is 21 for most cars and 25 for sports and luxury cars.'], ['Do you deliver the car?', 'Yes, we deliver to hotels, homes and airports across Dubai. Delivery is free on rentals of 3 days or more.'], ['Is a security deposit required?', 'Most cars require a refundable deposit. Many economy cars have zero-deposit options.'], ['What is the daily mileage limit?', 'Each car includes a daily mileage allowance, shown on the car page. Extra kilometres are charged at a clear per-km rate.'], ['Is insurance included?', 'Basic comprehensive insurance is included. Optional full cover is available.'], ['Can I rent for a month or longer?', 'Yes. Weekly and monthly rentals have much lower daily rates.'], ['How do I pay?', 'You can pay by card, cash or bank transfer. Payment details are confirmed when you book.'], ['Can I drive to other emirates or countries?', 'You can drive across the UAE. Cross-border travel needs prior approval and extra insurance.'], ['What happens if I get a fine?', 'Traffic fines are charged to the renter. We will share the details and the amount.'], ['Can I cancel my booking?', 'Yes. Free cancellation applies up to 24 hours before pickup. Please see our terms for details.'], ['How do I sell my car through you?', 'Fill in the form on our Sell My Car page and we will send you a free valuation.']];
page({ file: 'Dubai-Car-Rental-FAQs.html', url: '/Dubai-Car-Rental-FAQs', title: `Dubai Car Rental FAQs | ${cfg.short}`, desc: 'Answers to common questions about renting a car in Dubai: documents, deposit, insurance, delivery and more.', ld: [crumbLD([R, ['FAQs']]), { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqAll.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }], body: `<div class="container page-top">${crumbs([R, ['FAQs']])}<h1>Dubai Car Rental FAQs</h1></div><section class="container prose"><div class="faq">${faqAll.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>` });

info('terms.html', '/terms', 'Terms & Conditions', 'Terms &amp; Conditions', 'Terms and conditions for renting, buying and selling cars with us.', `<p class="muted">Sample terms for placeholder use. Replace with your company's legal text before launch.</p><h2>1. Eligibility</h2><p>Renters must hold a valid driving licence and meet the minimum age for the selected vehicle.</p><h2>2. Booking &amp; payment</h2><p>Bookings are confirmed once payment or a deposit is received. Prices are quoted in AED and may be shown in other currencies for convenience.</p><h2>3. Security deposit</h2><p>A refundable security deposit may be required and is returned after the car is inspected on return.</p><h2>4. Mileage &amp; fuel</h2><p>Each rental includes a daily mileage allowance. Cars should be returned with the same fuel level.</p><h2>5. Fines &amp; tolls</h2><p>Traffic fines and Salik tolls incurred during the rental are the renter's responsibility.</p><h2>6. Cancellation</h2><p>Free cancellation up to 24 hours before pickup. Later cancellations may incur a fee.</p><h2>7. Liability</h2><p>Renters are responsible for damage not covered by insurance and for any breach of UAE traffic law.</p>`);
info('privacy.html', '/privacy', 'Privacy Policy', 'Privacy Policy', 'How we collect, use and protect your personal information.', `<p class="muted">Sample policy for placeholder use. Replace with your company's legal text before launch.</p><h2>Information we collect</h2><p>We collect the details you share with us, such as your name, phone number, email and documents needed to complete a rental or sale.</p><h2>How we use it</h2><p>We use your information to process bookings, respond to enquiries and improve our service. We do not sell your data.</p><h2>Data security</h2><p>We take reasonable steps to protect your information from unauthorised access.</p><h2>Contact</h2><p>For privacy questions, email <a href="mailto:${cfg.email}">${cfg.email}</a>.</p>`);
page({ file: 'report-problem.html', url: '/report-problem', title: `Report a Problem | ${cfg.short}`, desc: 'Report an issue with a booking, a listing or the website.', ld: [crumbLD([R, ['Report a Problem']])], body: `<div class="container page-top">${crumbs([R, ['Report a Problem']])}<h1>Report a Problem</h1><p class="intro">Tell us what went wrong and we'll fix it quickly.</p></div><section class="container form-wrap one"><form class="form-card" data-wa-form data-subject="Problem report" data-wa="${cfg.whatsapp}" data-email="${cfg.email}"><div class="fgrid"><label>Name<input name="Name" required></label><label>Phone<input name="Phone" required></label><label>Issue type<select name="Issue type"><option>Booking</option><option>Car condition</option><option>Payment</option><option>Website</option><option>Other</option></select></label><label>Booking ref (optional)<input name="Booking ref"></label></div><label>Describe the problem<textarea name="Details" rows="5" required></textarea></label><div class="form-actions"><button class="btn-wa big" type="submit">${WAICON} Send on WhatsApp</button><button class="btn-o big" type="button" data-mail><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#mail"/></svg> Send by email</button></div><p class="form-ok" hidden>Thanks! We've got your report ready in WhatsApp.</p></form></section>` });
info('country-driving-license-valid-UAE.html', '/country-driving-license-valid-UAE', 'Driving Licence Guide', 'Which Driving Licences Are Valid in the UAE?', 'A guide to which foreign driving licences can be used to rent a car in Dubai.', `<p class="muted">General guidance only. Rules can change, so please confirm your licence with us before booking.</p><h2>Usually accepted without an IDP</h2><p>Licences from GCC countries, the UK, USA, Canada, Australia, New Zealand, Ireland, most EU countries, Japan, South Korea, Singapore and several others are generally accepted for rentals by visitors.</p><h2>May need an International Driving Permit</h2><p>Visitors with licences from other countries, including India, Pakistan, Egypt and others, may be asked for an International Driving Permit (IDP) with their home licence.</p><h2>Residents</h2><p>UAE residents should use a valid UAE licence. Some residents may use a foreign licence for a limited time after getting a residence visa.</p><h2>Not sure?</h2><p><a href="${WA}" target="_blank" rel="noopener">Message us on WhatsApp</a> with a photo of your licence and we'll confirm.</p>`);

/* ---------- 404, sitemap, robots, data.js ---------- */
page({ file: '404.html', url: '/404', title: 'Page not found', desc: 'Page not found', noindex: true, body: `<section class="container nf"><h1>404</h1><p>Sorry, we couldn't find that page.</p><a class="btn-s big" href="/">Back to home</a> <a class="btn-o big" href="/rent-a-car-dubai">Browse cars</a></section>` });
const today = new Date().toISOString().slice(0, 10);
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(u => `<url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
out('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
out('assets/js/data.js', `window.OCD=window.OCD||{};window.OCD.RENT=${JSON.stringify(RENT)};window.OCD.BUY=${JSON.stringify(BUY)};window.OCD.AREAS=${JSON.stringify(AREAS)};`);
out('data/cars.json', JSON.stringify({ rent: RENT, buy: BUY }, null, 2));
console.log(`Built ${pages.length} pages (rent cars: ${RENT.length}, buy cars: ${BUY.length}).`);
