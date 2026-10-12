const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = path.resolve(__dirname);
const TEMPLATE_DIR = path.join(WORKSPACE, 'rental-company-site');

// 10 Curated Luxury Automotive Color Palettes
const PALETTES = [
  {
    name: 'gold',
    primary: '#d4af37',   // Royal Metallic Gold
    secondary: '#f59e0b', // Radiant Amber Gold
    lightGold: '#fef3c7'
  },
  {
    name: 'crimson',
    primary: '#e11d48',   // High-Performance Crimson Red
    secondary: '#f43f5e', // Racing Rose
    lightGold: '#ffe4e6'
  },
  {
    name: 'sapphire',
    primary: '#0284c7',   // Electric Sapphire Blue
    secondary: '#0ea5e9', // Sky Cyan
    lightGold: '#e0f2fe'
  },
  {
    name: 'emerald',
    primary: '#059669',   // Trust Emerald
    secondary: '#10b981', // Vivid Mint
    lightGold: '#d1fae5'
  },
  {
    name: 'amber',
    primary: '#d97706',   // Sunset Amber Gold
    secondary: '#f59e0b', // Warm Amber
    lightGold: '#fef3c7'
  },
  {
    name: 'indigo',
    primary: '#6366f1',   // Cyber Indigo
    secondary: '#818cf8', // Lavender Iris
    lightGold: '#e0e7ff'
  },
  {
    name: 'violet',
    primary: '#7c3aed',   // Royal Purple
    secondary: '#a855f7', // Radiant Violet
    lightGold: '#f3e8ff'
  },
  {
    name: 'orange',
    primary: '#ea580c',   // Hyper Orange
    secondary: '#f97316', // Sunset Orange
    lightGold: '#ffedd5'
  },
  {
    name: 'teal',
    primary: '#0891b2',   // Aegean Teal
    secondary: '#06b6d4', // Bright Cyan
    lightGold: '#cffafe'
  },
  {
    name: 'obsidian',
    primary: '#334155',   // Stealth Slate
    secondary: '#64748b', // Cool Platinum
    lightGold: '#f1f5f9'
  }
];

// Determine brand color theme based on company name
function pickTheme(name, index) {
  const n = name.toLowerCase();
  if (/ferrari|sport|speed|f1|racing|turbo|red|monza/i.test(n)) return PALETTES[1]; // crimson
  if (/lambo|lamborghini|orange|hyper|drift|flame|beast/i.test(n)) return PALETTES[7]; // orange
  if (/luxury|royal|vip|prestige|gold|diamond|king|crown|pearl/i.test(n)) return PALETTES[0]; // gold
  if (/no deposit|zero deposit|deposit|swift|eco|green|safe|trust/i.test(n)) return PALETTES[3]; // emerald
  if (/black|dark|night|moon|shadow|stealth|obsidian|carbon/i.test(n)) return PALETTES[9]; // obsidian
  if (/exotic|prime|cyber|matrix|vision|neon|star/i.test(n)) return PALETTES[5]; // indigo
  if (/marina|sea|water|blue|sky|ocean|drive|express/i.test(n)) return PALETTES[2]; // sapphire
  if (/barsha|desert|sun|amber|elite|grand/i.test(n)) return PALETTES[4]; // amber
  if (/exclusive|palace|imperial|majestic|purple/i.test(n)) return PALETTES[6]; // violet
  if (/coast|breeze|oasis|palm|wave|coast/i.test(n)) return PALETTES[8]; // teal
  return PALETTES[index % PALETTES.length];
}

// Generate stylized wordmark logo without any icon
function generateBranding(name) {
  let clean = name.replace(/\s*\|\s*.*$/, '')
                  .replace(/\s*-\s*.*$/, '')
                  .replace(/LLC|L\.L\.C|RENT\s+A\s+CAR|CAR\s+RENTAL|RENTAL/gi, '')
                  .trim();
  if (!clean) clean = name.split(/[\s|-]/)[0] || 'DUBAI';

  const words = clean.split(/\s+/).filter(Boolean);
  let main = '';
  let accent = '';

  if (words.length === 1) {
    main = words[0].toUpperCase();
    accent = 'Rent A Car';
  } else if (words.length === 2) {
    main = words[0].toUpperCase();
    accent = words[1];
  } else {
    main = words.slice(0, 2).join(' ').toUpperCase();
    accent = words.slice(2).join(' ');
    if (accent.length > 20) accent = accent.slice(0, 20);
  }

  const logoHtml = `<span class="wm">${main}<em>${accent}</em></span>`;
  const short = (words[0] + (words[1] ? ' ' + words[1] : '')).trim();

  return { short, logoHtml };
}

// Generate SVG favicon & site icon matching brand theme
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
  </g>
  <path d="M14 47.5h36" stroke="${s}" stroke-width="2.2" stroke-linecap="round" opacity="0.8"/>
</svg>`;

  fs.writeFileSync(path.join(outDir, 'assets/img/favicon.svg'), svgIcon);
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgIcon);
  fs.writeFileSync(path.join(outDir, 'assets/img/site-icon.svg'), svgIcon);
}

// Copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

// Parse CSV row
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Parse companies.csv
const rawCsv = fs.readFileSync(path.join(WORKSPACE, 'companies.csv'), 'utf8').trim().split('\n');
const clients = [];
const usedSlugs = new Set();

// Existing running 5 websites to preserve
const EXISTING_FIVE = new Set([
  'qas-dubai-car-rental',
  'fast-motors-car-rental',
  'adres-car-rental',
  'al-barsha-rent-a-car',
  'swift-car-rental'
]);

for (let i = 1; i < rawCsv.length; i++) {
  const row = parseCSVLine(rawCsv[i]);
  const name = row[0].trim();
  if (!name) continue;

  let slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!slug) slug = 'company-' + i;

  // Normalize slug for first 5 if needed
  if (slug === 'qas-dubai-car-rental') slug = 'qas-dubai-car-rental';
  else if (slug === 'fast-motors-car-rental-llc') slug = 'fast-motors-car-rental';
  else if (slug === 'adres-car-rental') slug = 'adres-car-rental';
  else if (slug === 'rent-a-car-al-barsha') slug = 'al-barsha-rent-a-car';
  else if (slug.startsWith('swift-car-rental')) slug = 'swift-car-rental';

  let uniqueSlug = slug;
  let counter = 2;
  while (usedSlugs.has(uniqueSlug)) {
    uniqueSlug = slug + '-' + counter;
    counter++;
  }
  usedSlugs.add(uniqueSlug);

  const phone = row[1] ? row[1].trim() : '+971 50 000 0000';
  const rawWa = row[2] ? row[2].trim() : '';
  let waDigits = rawWa.replace(/https:\/\/wa\.me\//, '').replace(/[^0-9]/g, '');
  if (!waDigits) waDigits = phone.replace(/[^0-9]/g, '');
  if (!waDigits) waDigits = '971500000000';

  const webLink = row[6] ? row[6].trim() : '';
  let domain = webLink ? webLink.replace(/\/$/, '') : `https://www.${uniqueSlug}.ae`;
  if (!domain.startsWith('http')) domain = 'https://' + domain;

  const gMaps = row[7] ? row[7].trim() : `https://www.google.com/maps/search/${encodeURIComponent(name)}+Dubai`;
  const locationRaw = row.slice(8).join(', ').trim() || 'Dubai, United Arab Emirates';
  const address = locationRaw.includes('UAE') || locationRaw.includes('United Arab Emirates') ? locationRaw : `${locationRaw}, United Arab Emirates`;

  const branding = generateBranding(name);
  const theme = pickTheme(name, i);
  const port = 4321 + i; // Port increment

  clients.push({
    index: i,
    name,
    folder: uniqueSlug,
    short: branding.short,
    logoHtml: branding.logoHtml,
    domain,
    phone,
    whatsapp: waDigits,
    email: `booking@${uniqueSlug.replace(/-+/g, '')}.ae`,
    address,
    googleMaps: gMaps,
    tagline: `Premium car rental services by ${branding.short} in Dubai. Instant delivery & transparent booking.`,
    port,
    theme
  });
}

console.log(`Loaded ${clients.length} companies from companies.csv.`);

// Build client website
function buildClientSite(client, total) {
  const targetDir = path.join(WORKSPACE, client.folder);

  // If this is one of the existing 5 and already built, keep it untouched
  if (EXISTING_FIVE.has(client.folder) && fs.existsSync(path.join(targetDir, 'index.html'))) {
    console.log(`[${client.index}/${total}] Skipping existing running site: ${client.folder} (Port ${client.port})`);
    return;
  }

  console.log(`[${client.index}/${total}] Building: ${client.name} -> ${client.folder} (Port ${client.port})`);

  // 1. Create target directory
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // 2. Copy source template folders (data, src, assets/css, assets/js)
  copyDir(path.join(TEMPLATE_DIR, 'data'), path.join(targetDir, 'data'));
  copyDir(path.join(TEMPLATE_DIR, 'src'), path.join(targetDir, 'src'));
  fs.mkdirSync(path.join(targetDir, 'assets/css'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'assets/js'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'assets/img'), { recursive: true });

  copyDir(path.join(TEMPLATE_DIR, 'assets/css'), path.join(targetDir, 'assets/css'));
  copyDir(path.join(TEMPLATE_DIR, 'assets/js'), path.join(targetDir, 'assets/js'));

  // 3. Symlink heavy media from rental-company-site to save disk space
  const relTemplateImg = path.relative(path.join(targetDir, 'assets/img'), path.join(TEMPLATE_DIR, 'assets/img'));
  fs.symlinkSync(path.join(relTemplateImg, 'cars'), path.join(targetDir, 'assets/img/cars'));
  fs.symlinkSync(path.join(relTemplateImg, 'brands'), path.join(targetDir, 'assets/img/brands'));
  fs.symlinkSync(path.join(relTemplateImg, 'hero-dubai.jpg'), path.join(targetDir, 'assets/img/hero-dubai.jpg'));
  fs.symlinkSync(path.join(relTemplateImg, 'hero-showroom.jpg'), path.join(targetDir, 'assets/img/hero-showroom.jpg'));
  fs.symlinkSync(path.join(relTemplateImg, 'icons.svg'), path.join(targetDir, 'assets/img/icons.svg'));

  // 4. Generate custom brand favicon
  generateBrandIcons(client, targetDir);

  // 5. Write customized site.config.json
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

  // 6. Write customized package.json
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

  // 7. Write customized serve.js with dedicated port
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

  // 8. Customize style.css color palette
  let styleCss = fs.readFileSync(path.join(TEMPLATE_DIR, 'assets/css/style.css'), 'utf8');
  styleCss = styleCss.replace(/--gold:\s*[^;]+;/, `--gold: ${client.theme.primary};`)
                     .replace(/--gold-2:\s*[^;]+;/, `--gold-2: ${client.theme.secondary};`);
  fs.writeFileSync(path.join(targetDir, 'assets/css/style.css'), styleCss);

  // 9. Adapt build.js
  let buildJs = fs.readFileSync(path.join(TEMPLATE_DIR, 'build.js'), 'utf8');
  // Update brand wordmark in header & footer
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

  // 10. Execute build.js to generate all pages
  execSync('node build.js', { cwd: targetDir, stdio: 'ignore' });
}

// Generate all websites
const startTime = Date.now();
for (let i = 0; i < clients.length; i++) {
  buildClientSite(clients[i], clients.length);
}

const durationSec = Math.round((Date.now() - startTime) / 1000);
console.log(`\n========================================================`);
console.log(`All ${clients.length} websites generated in ${durationSec}s!`);
console.log(`========================================================`);

// Generate an HTML Directory for easy navigation
const dirHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>427 UAE Car Rental Websites Directory</title>
<style>
  :root { --bg: #090d16; --card: #111827; --border: #1e293b; --text: #f8fafc; --muted: #94a3b8; --gold: #d4af37; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); padding: 40px 20px; }
  .wrap { max-width: 1400px; margin: 0 auto; }
  header { margin-bottom: 30px; text-align: center; }
  h1 { font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg, #d4af37, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  p.sub { color: var(--muted); margin-top: 8px; font-size: 1rem; }
  .search-bar { margin: 25px auto; max-width: 600px; }
  input { width: 100%; padding: 14px 20px; border-radius: 12px; border: 1px solid var(--border); background: var(--card); color: #fff; font-size: 1rem; outline: none; }
  input:focus { border-color: var(--gold); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.15s, border-color 0.15s; }
  .card:hover { transform: translateY(-3px); border-color: var(--gold); }
  .card h3 { font-size: 1.1rem; margin-bottom: 6px; }
  .loc { font-size: 0.85rem; color: var(--muted); margin-bottom: 12px; }
  .meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; font-size: 0.8rem; }
  .pill { background: rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 6px; }
  .pill.port { background: rgba(212,175,55,0.15); color: #f59e0b; font-weight: bold; }
  .btn-row { display: flex; gap: 8px; }
  .btn { flex: 1; text-align: center; padding: 8px 12px; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; }
  .btn-open { background: var(--gold); color: #000; }
  .btn-open:hover { opacity: 0.9; }
  .btn-wa { background: #25d366; color: #fff; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>UAE Car Rental Multi-Tenant Network</h1>
    <p class="sub">${clients.length} Standalone Websites Generated with Real Google My Business Profiles</p>
    <div class="search-bar">
      <input type="text" id="q" placeholder="Search by company name, location, or port..." onkeyup="filterCards()">
    </div>
  </header>
  <div class="grid" id="cardGrid">
    ${clients.map(c => `
      <div class="card" data-search="${c.name.toLowerCase()} ${c.address.toLowerCase()} ${c.port}">
        <div>
          <h3>${c.name}</h3>
          <p class="loc">📍 ${c.address}</p>
          <div class="meta">
            <span class="pill port">Port ${c.port}</span>
            <span class="pill">📁 /${c.folder}</span>
            <span class="pill">📞 ${c.phone}</span>
          </div>
        </div>
        <div class="btn-row">
          <a class="btn btn-open" href="/${c.folder}/index.html">Open Site</a>
          <a class="btn btn-wa" href="https://wa.me/${c.whatsapp}" target="_blank">WhatsApp</a>
        </div>
      </div>
    `).join('')}
  </div>
</div>
<script>
function filterCards() {
  const q = document.getElementById('q').value.toLowerCase();
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const text = card.getAttribute('data-search');
    card.style.display = text.includes(q) ? 'flex' : 'none';
  });
}
</script>
</body>
</html>`;

fs.writeFileSync(path.join(WORKSPACE, 'index.html'), dirHtml);
console.log('Master directory created at: index.html');
