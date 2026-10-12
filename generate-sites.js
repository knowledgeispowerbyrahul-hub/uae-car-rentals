const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const zlib = require('zlib');

const WORKSPACE = path.resolve(__dirname);
const TEMPLATE_DIR = path.join(WORKSPACE, 'rental-company-site');

const CLIENTS = [
  {
    folder: 'qas-dubai-car-rental',
    name: 'QAS Dubai Car Rental',
    short: 'QAS',
    logoHtml: '<span class="wm">QAS<em>Car Rental</em></span>',
    domain: 'https://www.qasdubaicarrental.com',
    phone: '+971 58 521 1777',
    whatsapp: '971585211777',
    email: 'booking@qasdubaicarrental.com',
    address: 'Al Barsha 1, Dubai, United Arab Emirates',
    googleMaps: 'https://www.google.com/maps/place/QAS+Dubai+Car+Rental/data=!4m7!3m6!1s0x3e5f5dae52fa969d:0x7b69c1eed2db3!8m2!3d25.1134916!4d55.1939812',
    tagline: 'Luxury, sports & executive car rental in Dubai. Delivered to your doorstep.',
    port: 4322,
    theme: {
      primary: '#d4af37',   // Royal Metallic Gold
      secondary: '#f59e0b', // Radiant Amber Gold
      lightGold: '#fef3c7',
      text: '#0f172a'
    }
  },
  {
    folder: 'fast-motors-car-rental',
    name: 'Fast Motors Car Rental LLC',
    short: 'FastMotors',
    logoHtml: '<span class="wm">FAST<em>Motors</em></span>',
    domain: 'https://www.fastmotorscarrental.ae',
    phone: '+971 50 754 4408',
    whatsapp: '971507544408',
    email: 'info@fastmotorscarrental.ae',
    address: 'Al Barsha / Al Quoz, Sheikh Zayed Road, Dubai, UAE',
    googleMaps: 'https://www.google.com/maps/place/FAST+MOTORS+CAR+RENTAL+LLC/data=!4m7!3m6!1s0x3e5f6bd9ba14fe33:0x87b718c1555c7fe8!8m2!3d25.1164353!4d55.2045117',
    tagline: 'High-speed supercar & prestige car rental in Dubai. Direct booking & instant delivery.',
    port: 4323,
    theme: {
      primary: '#e11d48',   // High-Performance Crimson Red
      secondary: '#f43f5e', // Racing Rose
      lightGold: '#ffe4e6',
      text: '#0f172a'
    }
  },
  {
    folder: 'adres-car-rental',
    name: 'Adres Car Rental',
    short: 'Adres',
    logoHtml: '<span class="wm">ADRES<em>Rent A Car</em></span>',
    domain: 'https://www.adrescarrental.ae',
    phone: '+971 56 811 9209',
    whatsapp: '971568119209',
    email: 'reservations@adrescarrental.ae',
    address: 'Al Barsha 1, Near Mall of the Emirates, Dubai, UAE',
    googleMaps: 'https://www.google.com/maps/place/ADRES+CAR+RENTAL/data=!4m7!3m6!1s0x3e5f6b6a0ceee47d:0x1ac264d468c0d94d!8m2!3d25.1163109!4d55.204131',
    tagline: 'Your premier address for luxury & economy car rental in Dubai. 24/7 VIP concierge.',
    port: 4324,
    theme: {
      primary: '#0284c7',   // Electric Sapphire Blue
      secondary: '#0ea5e9', // Sky Cyan
      lightGold: '#e0f2fe',
      text: '#0f172a'
    }
  },
  {
    folder: 'al-barsha-rent-a-car',
    name: 'Al Barsha Rent A Car',
    short: 'AlBarshaRAC',
    logoHtml: '<span class="wm">AL BARSHA<em>Car Rental</em></span>',
    domain: 'https://www.albarsharentacar.ae',
    phone: '+971 55 541 1362',
    whatsapp: '971555411362',
    email: 'contact@albarsharentacar.ae',
    address: 'Al Barsha, Opp. Mall of the Emirates, Dubai, UAE',
    googleMaps: 'https://www.google.com/maps/place/Rent+a+car+Al+barsha/data=!4m7!3m6!1s0x3e5f6b4061ab3c1f:0xbadf40c1b921b4a5!8m2!3d25.1165714!4d55.1957994',
    tagline: 'Top-rated car rentals in Al Barsha & all Dubai communities. Transparent pricing & free delivery.',
    port: 4325,
    theme: {
      primary: '#d97706',   // Sunset Amber Gold
      secondary: '#f59e0b', // Warm Amber
      lightGold: '#fef3c7',
      text: '#0f172a'
    }
  },
  {
    folder: 'swift-car-rental',
    name: 'Swift Car Rental | No Security Deposit',
    short: 'Swift',
    logoHtml: '<span class="wm">SWIFT<em>No Deposit RAC</em></span>',
    domain: 'https://www.swiftcarrental.ae',
    phone: '+971 54 266 1154',
    whatsapp: '971542661154',
    email: 'hello@swiftcarrental.ae',
    address: 'Al Barsha South, Dubai, United Arab Emirates',
    googleMaps: 'https://www.google.com/maps/place/Swift+Car+Rental+%7C+No+Security+Deposit/data=!4m7!3m6!1s0x3e5f6bf39645b3d3:0xc2f305f05205969d!8m2!3d25.1072614!4d55.1984091',
    tagline: 'Zero deposit car rental in Dubai. Instant verification, no credit card block, 100% stress-free.',
    port: 4326,
    theme: {
      primary: '#059669',   // Trust Emerald
      secondary: '#10b981', // Vivid Mint
      lightGold: '#d1fae5',
      text: '#0f172a'
    }
  }
];

// Helper: Copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Generate brand SVG & PNG favicons for client
function generateBrandIcons(client, outDir) {
  const p = client.theme.primary;
  const s = client.theme.secondary;

  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141a29"/>
      <stop offset="100%" stop-color="#080c14"/>
    </linearGradient>
    <linearGradient id="brandG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${s}"/>
      <stop offset="100%" stop-color="${p}"/>
    </linearGradient>
    <linearGradient id="rimG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${s}" stop-opacity="0.25"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="${p}" flood-opacity="0.5"/>
    </filter>
  </defs>

  <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#bgG)" stroke="url(#rimG)" stroke-width="1.8"/>
  <path d="M10 24h18M8 32h12M12 40h10" stroke="${p}" stroke-width="1.2" stroke-linecap="round" opacity="0.22"/>

  <g filter="url(#glow)">
    <path d="M12 37c.8-3.2 3.2-5.8 6.5-6.8l6.2-4.5c2.6-1.9 5.8-2.7 9-2.2l7.2 1.1c2.8.4 5.2 2.2 6.3 4.8l2.5 5.8c3.2.6 5.3 2.4 5.3 5 0 2.6-2.2 4.2-5.5 4.2H17.5c-3.3 0-5.5-1.6-5.5-4.2 0-1.2.4-2.3 0-3.2z" fill="url(#brandG)"/>
    <path d="M26.2 26.2l-4.2 4.2h15.2l-3.2-3.8c-1.8-1.2-4.8-1.5-7.8-.4z" fill="#080c14" opacity="0.9"/>
    <path d="M38.8 30.4h8.2l-1.8-3.4c-.8-1.4-2.2-2.3-3.8-2.5l-2.6-.3z" fill="#080c14" opacity="0.9"/>
    <circle cx="21" cy="42" r="5" fill="#080c14" stroke="${s}" stroke-width="2"/>
    <circle cx="21" cy="42" r="2" fill="${p}"/>
    <circle cx="43" cy="42" r="5" fill="#080c14" stroke="${s}" stroke-width="2"/>
    <circle cx="43" cy="42" r="2" fill="${p}"/>
    <path d="M50 38.5l4-.8c1-.2 1.8.4 2 1.2v.2c-.2.8-1 1.4-2 1.2l-4-.8v-1z" fill="#fef08a"/>
  </g>
  <path d="M14 47.5h36" stroke="${s}" stroke-width="2.2" stroke-linecap="round" opacity="0.8"/>
</svg>`;

  fs.writeFileSync(path.join(outDir, 'assets/img/favicon.svg'), svgIcon);
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgIcon);
  fs.writeFileSync(path.join(outDir, 'assets/img/site-icon.svg'), svgIcon);
}

// Build client website
function buildClientSite(client) {
  const targetDir = path.join(WORKSPACE, client.folder);
  console.log(`\n========================================`);
  console.log(`Generating site: ${client.name} (${client.folder})`);
  console.log(`========================================`);

  // 1. Create target directory
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // 2. Copy source template files
  copyDir(path.join(TEMPLATE_DIR, 'assets'), path.join(targetDir, 'assets'));
  copyDir(path.join(TEMPLATE_DIR, 'data'), path.join(targetDir, 'data'));
  copyDir(path.join(TEMPLATE_DIR, 'src'), path.join(targetDir, 'src'));

  // 3. Write customized site.config.json
  const config = {
    name: client.name,
    short: client.short,
    domain: client.domain,
    phone: client.phone,
    whatsapp: client.whatsapp,
    email: client.email,
    address: client.address,
    hours: 'Open 24/7',
    tagline: client.tagline,
    googleMaps: client.googleMaps,
    theme: client.theme
  };
  fs.writeFileSync(path.join(targetDir, 'site.config.json'), JSON.stringify(config, null, 2));

  // 4. Write customized package.json
  const pkg = {
    name: client.folder,
    version: '1.0.0',
    private: true,
    scripts: {
      build: 'node build.js',
      start: 'node serve.js'
    }
  };
  fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2));

  // 5. Write customized serve.js with dedicated port
  const serveJs = `const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.webp': 'image/webp', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  let f = path.join(root, p);
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  if (!fs.existsSync(f)) { res.writeHead(404, { 'Content-Type': 'text/html' }); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(${client.port}, () => console.log('http://localhost:${client.port}'));
`;
  fs.writeFileSync(path.join(targetDir, 'serve.js'), serveJs);

  // 6. Customize style.css color palette
  let styleCss = fs.readFileSync(path.join(TEMPLATE_DIR, 'assets/css/style.css'), 'utf8');
  styleCss = styleCss.replace(/--gold:\s*[^;]+;/, `--gold: ${client.theme.primary};`)
                     .replace(/--gold-2:\s*[^;]+;/, `--gold-2: ${client.theme.secondary};`);
  fs.writeFileSync(path.join(targetDir, 'assets/css/style.css'), styleCss);

  // 7. Generate brand icons
  generateBrandIcons(client, targetDir);

  // 8. Copy and adapt build.js
  let buildJs = fs.readFileSync(path.join(TEMPLATE_DIR, 'build.js'), 'utf8');
  // Update brand logo in header & footer
  buildJs = buildJs.replace(
    /<span class="wm">Your<em>Brand<\/em><\/span>/g,
    client.logoHtml
  ).replace(
    /<span class="wm" style="color:#fff">Your<em>Brand<\/em><\/span>/g,
    client.logoHtml.replace('class="wm"', 'class="wm" style="color:#fff"')
  );

  // Update theme-color in head
  buildJs = buildJs.replace(
    /<meta name="theme-color" content="[^"]+">/,
    `<meta name="theme-color" content="${client.theme.primary}">`
  );

  fs.writeFileSync(path.join(targetDir, 'build.js'), buildJs);

  // 9. Execute build.js to generate all 160 pages in target directory
  console.log(`Compiling static pages for ${client.name}...`);
  execSync('node build.js', { cwd: targetDir, stdio: 'inherit' });
  console.log(`✓ Completed: ${client.folder} (Ready at port ${client.port})`);
}

// Run for all 5 clients
for (const client of CLIENTS) {
  buildClientSite(client);
}

console.log('\n======================================================');
console.log('All 5 independent websites generated successfully!');
console.log('======================================================');
