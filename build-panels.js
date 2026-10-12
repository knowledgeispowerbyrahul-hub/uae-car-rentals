const fs = require('fs');
const path = require('path');

const WORKSPACE = path.resolve(__dirname);

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

const rawCsv = fs.readFileSync(path.join(WORKSPACE, 'companies.csv'), 'utf8').trim().split('\n');
const usedSlugs = new Set();
const allClients = [];

let deployedDb = {};
const dbFile = path.join(WORKSPACE, 'deployed-sites.json');
if (fs.existsSync(dbFile)) {
  try { deployedDb = JSON.parse(fs.readFileSync(dbFile, 'utf8')); } catch(e) {}
}

for (let i = 1; i <= 60; i++) {
  const row = parseCSVLine(rawCsv[i]);
  const name = row[0].trim();
  if (!name) continue;

  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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

  const waVerifiedRaw = (row[3] || '').trim();
  let waStatus = 'pending';
  if (/yes/i.test(waVerifiedRaw)) waStatus = 'yes';
  else if (/no/i.test(waVerifiedRaw)) waStatus = 'no';

  const webStatus = (row[4] || '').trim() || 'No Website';
  const issueDetails = (row[5] || '').trim();
  const locationRaw = row.slice(8).join(', ').trim() || 'Dubai, United Arab Emirates';
  const port = 4321 + i;

  // City detection (Dubai, Abu Dhabi, Sharjah, Ajman)
  let city = 'Dubai';
  const locLower = locationRaw.toLowerCase();
  if (locLower.includes('abu dhabi') || locLower.includes('al reem') || locLower.includes('al zahiyah') || locLower.includes('al danah') || locLower.includes('khalidiya') || locLower.includes('mussafah')) {
    city = 'Abu Dhabi';
  } else if (locLower.includes('sharjah') || locLower.includes('al majaz') || locLower.includes('al nahda')) {
    city = 'Sharjah';
  } else if (locLower.includes('ajman')) {
    city = 'Ajman';
  }

  const cityClass = city === 'Dubai' ? 'city-dubai' : (city === 'Abu Dhabi' ? 'city-abudhabi' : (city === 'Sharjah' ? 'city-sharjah' : 'city-ajman'));
  const liveUrl = (deployedDb[i] && deployedDb[i].liveUrl) ? deployedDb[i].liveUrl : `/${uniqueSlug}/index.html`;

  allClients.push({
    id: i,
    name,
    folder: uniqueSlug,
    phone,
    whatsapp: waDigits,
    waStatus,
    funnel: i <= 5 ? 'in_process' : 'new',
    webStatus,
    city,
    cityClass,
    location: locationRaw,
    port,
    liveUrl,
    assignedTo: i <= 30 ? 'Rahul' : 'Het',
    websiteChanges: '',
    notes: issueDetails ? 'Issue: ' + issueDetails : '',
    archived: false
  });
}

// Exactly 30 websites for Rahul (#1 to #30) and 30 websites for Het (#31 to #60)
const rahulClients = allClients.slice(0, 30);
const hetClients = allClients.slice(30, 60);

console.log(`Rahul's Panel has ${rahulClients.length} clients (#1 to #30)`);
console.log(`Het's Panel has ${hetClients.length} clients (#31 to #60)`);

// Read full 400+ notepad tracker text to embed inside the modal
let trackerTxt = '';
const trackerFile = path.join(WORKSPACE, 'LIVE-AND-PENDING-WEBSITES.txt');
if (fs.existsSync(trackerFile)) {
  trackerTxt = fs.readFileSync(trackerFile, 'utf8');
}

function generatePanelHtml(panelNum, ownerName, clients, otherPanelUrl, otherPanelLabel) {
  const startId = clients[0].id;
  const endId = clients[clients.length - 1].id;
  const accentColor = panelNum === 1 ? '#38bdf8' : '#a855f7';
  const accentGlow = panelNum === 1 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UAE Car Rental – ${ownerName}'s Sales Panel (Sites ${startId}–${endId})</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #090a0f;
    --surface: #11131a;
    --surface-hover: #161922;
    --border: #1e222d;
    --border-light: #2a3040;
    --text: #e2e8f0;
    --muted: #717d96;
    --subtle: #4a5568;
    --accent: ${accentColor};
    --accent-glow: ${accentGlow};
    --green: #10b981;
    --green-glow: rgba(16, 185, 129, 0.18);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    font-size: 13px;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
  }

  /* Header */
  header {
    border-bottom: 1px solid var(--border);
    padding: 10px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    position: sticky;
    top: 0;
    background: rgba(9, 10, 15, 0.96);
    backdrop-filter: blur(12px);
    z-index: 100;
  }
  .h-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .h-logo {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .h-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 10px #10b981;
  }
  .panel-badge {
    background: var(--accent-glow);
    color: var(--accent);
    border: 1px solid var(--accent);
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
    letter-spacing: 0.3px;
  }
  .h-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  button, .btn {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.12s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  button:hover, .btn:hover {
    border-color: var(--border-light);
    color: #fff;
    background: var(--surface-hover);
  }
  .btn-accent {
    background: var(--accent);
    border-color: var(--accent);
    color: #000;
    font-weight: 600;
  }
  .btn-accent:hover {
    filter: brightness(1.1);
    color: #000;
    background: var(--accent);
  }
  .btn-call {
    background: #10b981 !important;
    border-color: #10b981 !important;
    color: #fff !important;
    font-weight: 700 !important;
    padding: 5px 10px !important;
    border-radius: 5px !important;
    box-shadow: 0 2px 8px var(--green-glow);
    font-size: 11px !important;
  }
  .btn-call:hover {
    background: #059669 !important;
    transform: translateY(-1px);
  }
  .btn-wa {
    background: #25d366 !important;
    border-color: #25d366 !important;
    color: #fff !important;
    font-weight: 700 !important;
    padding: 5px 9px !important;
    border-radius: 5px !important;
    font-size: 11px !important;
  }
  .btn-wa:hover {
    background: #128c7e !important;
    transform: translateY(-1px);
  }
  .btn-visit {
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: #38bdf8;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 11px;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .btn-visit:hover {
    background: #38bdf8;
    color: #000;
  }

  .wrap {
    max-width: 1600px;
    margin: 0 auto;
    padding: 18px 24px 60px;
  }

  /* Sales Pipeline Funnel */
  .pipe-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .pipe-pill {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 6px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    transition: all 0.12s;
    white-space: nowrap;
    font-size: 12px;
  }
  .pipe-pill:hover {
    border-color: var(--border-light);
  }
  .pipe-pill.active {
    background: var(--surface-hover);
    border-color: var(--accent);
    color: #fff;
  }
  .pipe-count {
    background: rgba(255, 255, 255, 0.08);
    font-size: 11px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 4px;
    color: #cbd5e1;
  }
  .pipe-pill.active .pipe-count {
    background: var(--accent-glow);
    color: var(--accent);
  }

  /* Controls */
  .controls {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .search-wrap {
    position: relative;
    flex: 1;
    min-width: 260px;
    max-width: 460px;
  }
  .search-wrap input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 8px 12px 8px 32px;
    border-radius: 6px;
    color: #fff;
    font-size: 12px;
    outline: none;
    font-family: inherit;
    transition: border-color 0.12s;
  }
  .search-wrap input:focus {
    border-color: var(--accent);
  }
  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    font-size: 12px;
  }
  .filters {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  select.select-min {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 7px 10px;
    border-radius: 6px;
    font-size: 12px;
    outline: none;
    cursor: pointer;
    font-family: inherit;
  }

  /* City Location Badges */
  .city-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
  }
  .city-dubai {
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.3);
  }
  .city-abudhabi {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  .city-sharjah {
    background: rgba(168, 85, 247, 0.15);
    color: #c084fc;
    border: 1px solid rgba(168, 85, 247, 0.3);
  }
  .city-ajman {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  /* Table */
  .table-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }
  .table-scroll {
    overflow-x: auto;
    max-height: calc(100vh - 230px);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    text-align: left;
  }
  thead {
    position: sticky;
    top: 0;
    background: #0d0f15;
    z-index: 10;
    border-bottom: 1px solid var(--border);
  }
  th {
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.4px;
    white-space: nowrap;
  }
  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.1s;
  }
  tbody tr:hover {
    background: rgba(255, 255, 255, 0.025);
  }
  td {
    padding: 8px 12px;
    vertical-align: middle;
  }

  .co-title {
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
  }
  .co-title:hover {
    color: var(--accent);
  }
  .co-sub {
    font-size: 11px;
    color: var(--muted);
  }

  .tag {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
    border: 1px solid transparent;
  }
  .tag-yes { background: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.2); }
  .tag-no { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }
  .tag-pending { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border-color: rgba(245, 158, 11, 0.2); }

  .select-wa {
    padding: 3px 6px;
    border-radius: 5px;
    font-size: 10px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    outline: none;
    border: 1px solid var(--border);
    background: #0d0f15;
    transition: all 0.15s;
  }
  .select-wa.wa-yes {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border-color: rgba(16, 185, 129, 0.35);
  }
  .select-wa.wa-no {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border-color: rgba(239, 68, 68, 0.35);
  }
  .select-wa.wa-pending {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
    border-color: rgba(245, 158, 11, 0.35);
  }

  .btn-wa.dimmed {
    opacity: 0.6;
    background: #1f2937 !important;
    border-color: #374151 !important;
    color: #9ca3af !important;
  }

  .select-status {
    background: #0d0f15;
    border: 1px solid var(--border);
    color: var(--text);
    padding: 5px 8px;
    border-radius: 5px;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    outline: none;
  }
  .select-status:focus {
    border-color: var(--accent);
  }

  /* Inline Row Quick Notes */
  .row-quick-note {
    width: 100%;
    min-width: 180px;
    max-width: 260px;
    background: #090a0f;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: #e2e8f0;
    font-size: 11px;
    font-family: inherit;
    padding: 6px 8px;
    resize: vertical;
    min-height: 32px;
    height: 32px;
    transition: all 0.15s;
    outline: none;
    line-height: 1.3;
  }
  .row-quick-note:focus {
    border-color: var(--accent);
    background: #11131a;
    min-height: 60px;
    box-shadow: 0 0 0 2px var(--accent-glow);
  }
  .note-saved-indicator {
    font-size: 9px;
    color: #10b981;
    font-weight: 600;
    margin-top: 2px;
    display: none;
  }

  /* Modals */
  .modal-bg {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }
  .modal-bg.open {
    opacity: 1;
    pointer-events: auto;
  }
  .modal-card {
    background: #11131a;
    border: 1px solid var(--border-light);
    border-radius: 10px;
    width: 100%;
    max-width: 600px;
    padding: 20px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  }
  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .modal-title {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
  }
  .modal-x {
    background: transparent;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-size: 16px;
  }
  .modal-body {
    margin-bottom: 16px;
    color: var(--text);
    font-size: 12px;
  }
  .modal-foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .notepad-textarea {
    width: 100%;
    height: 420px;
    background: #090a0f;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    line-height: 1.5;
    padding: 12px;
    outline: none;
    resize: none;
  }

  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1e2433;
    border: 1px solid var(--border-light);
    color: #fff;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    z-index: 2000;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.2s ease;
  }
  .toast.show {
    opacity: 1;
    transform: translateY(0);
  }
</style>
</head>
<body>

<header>
  <div class="h-left">
    <div class="h-logo">
      <span class="h-dot"></span>
      <span>${ownerName.toUpperCase()}'S SALES CRM</span>
    </div>
    <span class="panel-badge">Sites #${startId} to #${endId} (${clients.length} Clients)</span>
  </div>
  <div class="h-actions">
    <a class="btn" href="${otherPanelUrl}" style="border-color:var(--accent); color:var(--accent); font-weight:600;">
      ${otherPanelLabel}
    </a>
    <button onclick="openNotepad()">📝 400+ Master Database</button>
    <button onclick="exportCSV()">📥 Export CSV</button>
    <button class="btn-accent" onclick="directAll()">Show All (${clients.length})</button>
  </div>
</header>

<div class="wrap">

  <!-- Sales Pipeline Status Bar -->
  <div class="pipe-bar">
    <div class="pipe-pill active" id="pill-all" onclick="setStage('all')">
      <span>👤 ${ownerName}'s Batch</span>
      <span class="pipe-count" id="c-all">${clients.length}</span>
    </div>
    <div class="pipe-pill" id="pill-contacted" onclick="setStage('contacted')">
      <span>📞 Contacted</span>
      <span class="pipe-count" id="c-contacted">0</span>
    </div>
    <div class="pipe-pill" id="pill-interested" onclick="setStage('interested')">
      <span>🔥 Interested</span>
      <span class="pipe-count" id="c-interested">0</span>
    </div>
    <div class="pipe-pill" id="pill-in_process" onclick="setStage('in_process')">
      <span>⚙️ In Process</span>
      <span class="pipe-count" id="c-in_process">0</span>
    </div>
    <div class="pipe-pill" id="pill-paid" onclick="setStage('paid')">
      <span>💰 Paid</span>
      <span class="pipe-count" id="c-paid">0</span>
    </div>
    <div class="pipe-pill" id="pill-not_decided" onclick="setStage('not_decided')">
      <span>❓ Not Decided</span>
      <span class="pipe-count" id="c-not_decided">0</span>
    </div>
    <div class="pipe-pill" id="pill-rejected" onclick="setStage('rejected')">
      <span>❌ Rejected</span>
      <span class="pipe-count" id="c-rejected">0</span>
    </div>
  </div>

  <!-- Search & Filters -->
  <div class="controls">
    <div class="search-wrap">
      <span class="search-icon">🔍</span>
      <input type="text" id="searchInput" placeholder="Search company, phone, location, notes..." oninput="handleSearch()">
    </div>

    <div class="filters">
      <select class="select-min" id="cityFilter" onchange="handleCityFilter()">
        <option value="all">📍 Location: All Cities</option>
        <option value="Dubai">🏙️ Dubai</option>
        <option value="Abu Dhabi">🏛️ Abu Dhabi</option>
        <option value="Sharjah">🕌 Sharjah</option>
        <option value="Ajman">🏖️ Ajman</option>
      </select>

      <select class="select-min" id="waFilter" onchange="handleFilter()">
        <option value="all">WhatsApp: All</option>
        <option value="yes">Has WhatsApp</option>
        <option value="no">No WhatsApp</option>
        <option value="pending">Pending</option>
      </select>
    </div>
  </div>

  <!-- Table Box -->
  <div class="table-box">
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Company & City Location</th>
            <th>Contact Actions</th>
            <th>Funnel Stage</th>
            <th style="min-width: 220px;">📝 Quick Call Notes (Auto-Saved)</th>
            <th>Live Website</th>
          </tr>
        </thead>
        <tbody id="tb">
          <!-- Rendered via JS -->
        </tbody>
      </table>
    </div>
  </div>

</div>

<!-- 400+ Master Database Notepad Modal -->
<div class="modal-bg" id="notepadModal">
  <div class="modal-card" style="max-width: 780px;">
    <div class="modal-head">
      <div class="modal-title">📝 400+ UAE Car Rental Master Database Tracker</div>
      <button class="modal-x" onclick="closeNotepad()">✕</button>
    </div>
    <div class="modal-body">
      <div style="font-size:11px; color:var(--muted); margin-bottom:8px;">
        Tracking all 400+ companies. Notes auto-save to browser storage.
      </div>
      <textarea class="notepad-textarea" id="notepadText" oninput="saveNotepad()"></textarea>
    </div>
    <div class="modal-foot">
      <button class="btn-sm" onclick="downloadNotepad()">📥 Save as .txt</button>
      <button class="btn-accent btn-sm" onclick="closeNotepad()">Done</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
const INITIAL_DATA = ${JSON.stringify(clients, null, 2)};
const STORAGE_KEY = 'uae_crm_clients_p${panelNum}';
const NOTEPAD_KEY = 'uae_crm_notepad_master';
const ROW_NOTES_PREFIX = 'uae_crm_note_p${panelNum}_';

let list = [];
let stage = 'all';
let q = '';
let wa = 'all';
let city = 'all';

function init() {
  const s = localStorage.getItem(STORAGE_KEY);
  if (s) {
    try { 
      const parsed = JSON.parse(s);
      list = INITIAL_DATA.map(initItem => {
        const found = parsed.find(p => p.id === initItem.id);
        return found ? { 
          ...initItem, 
          funnel: found.funnel || initItem.funnel, 
          notes: (found.notes !== undefined) ? found.notes : initItem.notes,
          waStatus: found.waStatus || initItem.waStatus
        } : initItem;
      });
    } catch(e) { 
      list = JSON.parse(JSON.stringify(INITIAL_DATA)); 
    }
  } else {
    list = JSON.parse(JSON.stringify(INITIAL_DATA));
    save();
  }

  const note = localStorage.getItem(NOTEPAD_KEY);
  document.getElementById('notepadText').value = note || ${JSON.stringify(trackerTxt)};

  updateCounts();
  render();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  updateCounts();
}

function saveRowNote(id, text) {
  localStorage.setItem(ROW_NOTES_PREFIX + id, text);
  const item = list.find(x => x.id === id);
  if (item) item.notes = text;
  save();

  const ind = document.getElementById('saved-' + id);
  if (ind) {
    ind.style.display = 'block';
    clearTimeout(ind._t);
    ind._t = setTimeout(() => { ind.style.display = 'none'; }, 1500);
  }
}

function getRowNote(id) {
  const local = localStorage.getItem(ROW_NOTES_PREFIX + id);
  if (local !== null) return local;
  const item = list.find(x => x.id === id);
  return item ? (item.notes || '') : '';
}

function saveNotepad() {
  localStorage.setItem(NOTEPAD_KEY, document.getElementById('notepadText').value);
}

function openNotepad() { document.getElementById('notepadModal').classList.add('open'); }
function closeNotepad() { document.getElementById('notepadModal').classList.remove('open'); }
function downloadNotepad() {
  const val = document.getElementById('notepadText').value;
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(val);
  a.download = 'uae-400-companies-tracker.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function updateCounts() {
  document.getElementById('c-all').innerText = list.length;
  document.getElementById('c-contacted').innerText = list.filter(c => c.funnel === 'contacted').length;
  document.getElementById('c-interested').innerText = list.filter(c => c.funnel === 'interested').length;
  document.getElementById('c-in_process').innerText = list.filter(c => c.funnel === 'in_process').length;
  document.getElementById('c-paid').innerText = list.filter(c => c.funnel === 'paid').length;
  document.getElementById('c-not_decided').innerText = list.filter(c => c.funnel === 'not_decided').length;
  document.getElementById('c-rejected').innerText = list.filter(c => c.funnel === 'rejected').length;
}

function getFiltered() {
  return list.filter(c => {
    if (stage !== 'all' && c.funnel !== stage) return false;
    if (wa !== 'all' && c.waStatus !== wa) return false;
    if (city !== 'all' && c.city !== city) return false;
    if (q) {
      const rowNote = getRowNote(c.id);
      const match = (c.name + ' ' + c.phone + ' ' + c.location + ' ' + c.city + ' ' + (c.notes || '') + ' ' + rowNote).toLowerCase();
      if (!match.includes(q.toLowerCase())) return false;
    }
    return true;
  });
}

function directAll() {
  stage = 'all';
  q = '';
  wa = 'all';
  city = 'all';
  document.getElementById('searchInput').value = '';
  document.getElementById('waFilter').value = 'all';
  document.getElementById('cityFilter').value = 'all';
  document.querySelectorAll('.pipe-pill').forEach(p => p.classList.remove('active'));
  document.getElementById('pill-all')?.classList.add('active');
  render();
  toast('Showing all ' + list.length + ' clients');
}

function setStage(st) {
  stage = st;
  document.querySelectorAll('.pipe-pill').forEach(p => p.classList.remove('active'));
  document.getElementById('pill-' + st)?.classList.add('active');
  render();
}

function handleSearch() {
  q = document.getElementById('searchInput').value.trim();
  render();
}

function handleFilter() {
  wa = document.getElementById('waFilter').value;
  render();
}

function handleCityFilter() {
  city = document.getElementById('cityFilter').value;
  render();
}

function changeStatus(id, newStatus) {
  const c = list.find(x => x.id === id);
  if (c) {
    c.funnel = newStatus;
    save();
    updateCounts();
    toast('Stage updated to ' + newStatus);
  }
}

function changeWaStatus(id, newStatus) {
  const c = list.find(x => x.id === id);
  if (c) {
    c.waStatus = newStatus;
    save();
    render();
    const label = newStatus === 'yes' ? '🟢 Has WA' : (newStatus === 'no' ? '🔴 No WA' : '🟡 Pending');
    toast(c.name + ': WhatsApp set to ' + label);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function render() {
  const items = getFiltered();
  const tb = document.getElementById('tb');
  if (items.length === 0) {
    tb.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--muted);">No matching clients found.</td></tr>';
    return;
  }

  tb.innerHTML = items.map(c => {
    const waClass = c.waStatus === 'yes' ? 'tag-yes' : (c.waStatus === 'no' ? 'tag-no' : 'tag-pending');
    const waUrl = \`https://wa.me/\${c.whatsapp}?text=\${encodeURIComponent("Hello " + c.name + ", here is your live website.")}\`;
    const siteUrl = c.liveUrl || '#';
    const currentNote = getRowNote(c.id);

    return \`
      <tr>
        <td style="color:var(--subtle); font-family:'JetBrains Mono'; font-size:11px; font-weight:700;">#\${String(c.id).padStart(3, '0')}</td>
        
        <td>
          <a class="co-title" href="\${siteUrl}" target="_blank">\${escapeHtml(c.name)} ↗</a>
          <div style="display:flex; align-items:center; gap:6px; margin-top:3px; flex-wrap:wrap;">
            <span class="city-badge \${c.cityClass}">📍 \${c.city}</span>
            <span class="co-sub">\${escapeHtml(c.location)}</span>
          </div>
        </td>

        <td>
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <a class="btn-call" href="tel:\${(c.phone||'').replace(/[^0-9+]/g, '')}">📞 Call</a>
            <a class="btn-wa \${c.waStatus === 'no' ? 'dimmed' : ''}" href="\${waUrl}" target="_blank" title="Open WhatsApp Chat">💬 WA</a>
            <select class="select-wa wa-\${c.waStatus}" onchange="changeWaStatus(\${c.id}, this.value)" title="Click to select WhatsApp status">
              <option value="yes" \${c.waStatus === 'yes' ? 'selected' : ''}>🟢 Has WA</option>
              <option value="no" \${c.waStatus === 'no' ? 'selected' : ''}>🔴 No WA</option>
              <option value="pending" \${c.waStatus === 'pending' ? 'selected' : ''}>🟡 Pending</option>
            </select>
          </div>
          <div style="font-size:10px; color:var(--muted); font-family:'JetBrains Mono'; margin-top:3px;">\${c.phone}</div>
        </td>

        <td>
          <select class="select-status" onchange="changeStatus(\${c.id}, this.value)">
            <option value="new" \${c.funnel === 'new' ? 'selected' : ''}>New Lead</option>
            <option value="contacted" \${c.funnel === 'contacted' ? 'selected' : ''}>📞 Contacted</option>
            <option value="interested" \${c.funnel === 'interested' ? 'selected' : ''}>🔥 Interested</option>
            <option value="in_process" \${c.funnel === 'in_process' ? 'selected' : ''}>⚙️ In Process</option>
            <option value="paid" \${c.funnel === 'paid' ? 'selected' : ''}>💰 Paid</option>
            <option value="not_decided" \${c.funnel === 'not_decided' ? 'selected' : ''}>❓ Not Decided</option>
            <option value="rejected" \${c.funnel === 'rejected' ? 'selected' : ''}>❌ Rejected</option>
          </select>
        </td>

        <td>
          <textarea class="row-quick-note" placeholder="Write call note..." oninput="saveRowNote(\${c.id}, this.value)">\${escapeHtml(currentNote)}</textarea>
          <div class="note-saved-indicator" id="saved-\${c.id}">✓ Saved</div>
        </td>

        <td>
          <a class="btn-visit" href="\${siteUrl}" target="_blank">🌐 Live Website ↗</a>
        </td>
      </tr>
    \`;
  }).join('');
}

function exportCSV() {
  const headers = ['ID', 'Company', 'City', 'Location', 'Phone', 'WhatsApp', 'Funnel Stage', 'Call Notes', 'Live URL'];
  const rows = list.map(c => [
    c.id, '"' + c.name.replace(/"/g, '""') + '"', c.city, '"' + c.location.replace(/"/g, '""') + '"',
    '"' + c.phone + '"', c.whatsapp, c.funnel,
    '"' + (getRowNote(c.id)||'').replace(/"/g, '""') + '"', c.liveUrl
  ]);
  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
  const a = document.createElement('a');
  a.href = encodeURI(csv);
  a.download = '${ownerName.toLowerCase()}-sales-clients.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNotepad();
});

window.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>`;
}

// Generate Panel 1 (Rahul) and Panel 2 (Het)
fs.mkdirSync(path.join(WORKSPACE, 'panel1'), { recursive: true });
fs.mkdirSync(path.join(WORKSPACE, 'panel2'), { recursive: true });

const html1 = generatePanelHtml(1, 'Rahul', rahulClients, 'https://panel2-het.vercel.app', '👤 Switch to Het\'s Panel (#31–60) →');
const html2 = generatePanelHtml(2, 'Het', hetClients, 'https://panel1-rahul.vercel.app', '← 👤 Switch to Rahul\'s Panel (#1–30)');

fs.writeFileSync(path.join(WORKSPACE, 'panel1/index.html'), html1);
fs.writeFileSync(path.join(WORKSPACE, 'panel2/index.html'), html2);
fs.writeFileSync(path.join(WORKSPACE, 'panel1.html'), html1);
fs.writeFileSync(path.join(WORKSPACE, 'panel2.html'), html2);

console.log('Successfully generated:');
console.log('1. Rahul Sales Panel: Sites 1 to 30 (with Dubai, Abu Dhabi, Sharjah location badges and filter)');
console.log('2. Het Sales Panel: Sites 31 to 60 (with Dubai, Abu Dhabi, Sharjah location badges and filter)');
