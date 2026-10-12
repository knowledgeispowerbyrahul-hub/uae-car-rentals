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
const clients = [];

for (let i = 1; i < rawCsv.length; i++) {
  const row = parseCSVLine(rawCsv[i]);
  const name = row[0].trim();
  if (!name) continue;

  let slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!slug) slug = 'company-' + i;

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
  const webLink = (row[6] || '').trim();
  const gMaps = (row[7] || '').trim() || `https://www.google.com/maps/search/${encodeURIComponent(name)}+Dubai`;
  const locationRaw = row.slice(8).join(', ').trim() || 'Dubai, United Arab Emirates';
  const port = 4321 + i;

  let funnel = 'new';
  if (i <= 5) funnel = 'in_process';

  clients.push({
    id: i,
    name,
    folder: uniqueSlug,
    phone,
    whatsapp: waDigits,
    waStatus,
    funnel,
    webStatus,
    issueDetails,
    webLink,
    gMaps,
    location: locationRaw,
    port,
    websiteChanges: i <= 5 ? 'Custom luxury theme, port ' + port : '',
    notes: issueDetails ? 'Issue: ' + issueDetails : '',
    archived: false,
    updatedAt: new Date().toISOString()
  });
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UAE Car Rental Lead Funnel & Batch Tracker</title>
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
    --accent: #38bdf8;
    --accent-glow: rgba(56, 189, 248, 0.15);
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

  /* Minimal Header */
  header {
    border-bottom: 1px solid var(--border);
    padding: 10px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    position: sticky;
    top: 0;
    background: rgba(9, 10, 15, 0.94);
    backdrop-filter: blur(12px);
    z-index: 100;
  }
  .h-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .h-logo {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.2px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .h-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
  }
  .h-badge {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .h-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Buttons */
  button, .btn {
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
    transition: all 0.12s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  button:hover, .btn:hover {
    background: var(--surface-hover);
    border-color: var(--border-light);
    color: #fff;
  }
  .btn-primary {
    background: var(--accent);
    color: #04101e;
    font-weight: 600;
    border: none;
  }
  .btn-primary:hover {
    background: #7dd3fc;
    color: #000;
  }
  .btn-notepad {
    border-color: #38bdf8;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.08);
  }
  .btn-notepad:hover {
    background: #38bdf8;
    color: #000;
  }
  .btn-sm {
    padding: 3px 8px;
    font-size: 11px;
    border-radius: 4px;
  }
  .btn-danger {
    color: #f87171;
    border-color: rgba(248, 113, 113, 0.2);
    background: rgba(248, 113, 113, 0.05);
  }
  .btn-danger:hover {
    background: #ef4444;
    color: #fff;
    border-color: #ef4444;
  }

  /* Main Wrap */
  .wrap {
    max-width: 1600px;
    margin: 0 auto;
    padding: 14px 24px;
  }

  /* Minimal Pipeline Bar */
  .pipe-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .pipe-pill {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 5px 11px;
    border-radius: 6px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
    transition: all 0.12s ease;
  }
  .pipe-pill:hover {
    border-color: var(--border-light);
    color: var(--text);
  }
  .pipe-pill.active {
    background: var(--surface-hover);
    border-color: var(--accent);
    color: #fff;
  }
  .pipe-pill.batch100-active {
    border-color: #10b981;
    color: #34d399;
    background: rgba(16, 185, 129, 0.08);
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
    background: rgba(56, 189, 248, 0.2);
    color: var(--accent);
  }

  /* Controls Line */
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
    padding: 7px 12px 7px 32px;
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
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    outline: none;
    cursor: pointer;
    font-family: inherit;
  }
  select.select-min:focus {
    border-color: var(--accent);
  }

  /* Minimal Table */
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
    padding: 9px 12px;
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.4px;
    white-space: nowrap;
  }
  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: background 0.1s;
  }
  tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }
  tbody tr.archived {
    opacity: 0.5;
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
  }
  .co-title:hover {
    color: var(--accent);
  }
  .co-sub {
    font-size: 11px;
    color: var(--muted);
    margin-top: 1px;
  }
  .co-path {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--subtle);
  }

  /* Badges */
  .tag {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    border: 1px solid transparent;
  }
  .tag-yes { background: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.2); cursor: pointer; }
  .tag-no { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(239, 68, 68, 0.2); cursor: pointer; }
  .tag-pending { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border-color: rgba(245, 158, 11, 0.2); cursor: pointer; }

  .select-status {
    background: #0d0f15;
    border: 1px solid var(--border);
    color: var(--text);
    padding: 4px 7px;
    border-radius: 5px;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    outline: none;
  }
  .select-status:focus {
    border-color: var(--accent);
  }

  /* Changes & notes text */
  .note-line {
    max-width: 250px;
    color: var(--muted);
    font-size: 11px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .note-line:hover { color: #fff; }
  .has-chg {
    color: var(--accent);
    font-weight: 500;
    margin-bottom: 1px;
  }

  /* Minimal Footer Pagination */
  .p-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    border-top: 1px solid var(--border);
    font-size: 11px;
    color: var(--muted);
  }
  .p-btns {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  /* Minimal Modals */
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
    max-width: 520px;
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
    font-weight: 600;
    color: #fff;
  }
  .modal-x {
    background: transparent;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-size: 16px;
    padding: 0;
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

  .fg {
    margin-bottom: 10px;
  }
  .fl {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  .fi, .ft, .fs {
    width: 100%;
    background: #090a0f;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 7px 10px;
    color: #fff;
    font-size: 12px;
    font-family: inherit;
    outline: none;
  }
  .fi:focus, .ft:focus, .fs:focus {
    border-color: var(--accent);
  }
  .ft { min-height: 55px; resize: vertical; }

  /* Notepad Area */
  .notepad-textarea {
    width: 100%;
    height: 380px;
    background: #090a0f;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: #38bdf8;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
    padding: 12px;
    outline: none;
    resize: none;
  }
  .notepad-textarea:focus {
    border-color: var(--accent);
  }

  /* Minimal Toast */
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
      <span>UAE Car Rentals</span>
    </div>
    <span class="h-badge">427 Sites</span>
  </div>
  <div class="h-actions">
    <!-- NOTEPAD & BATCH 1 BUTTONS -->
    <button class="btn-notepad" onclick="openNotepad()">📝 Notepad & Tracker</button>
    <button class="btn" id="btnBatch100" onclick="toggleBatch100()">🎯 Batch 1 (1–100 Only)</button>
    <button class="btn-primary" onclick="directAll()">🌐 All (427)</button>
    <button onclick="exportCSV()">Export CSV</button>
    <button onclick="exportJSON()">Backup</button>
    <button onclick="resetDefaults()">Reset</button>
  </div>
</header>

<div class="wrap">

  <!-- Minimal Pipeline Status Bar -->
  <div class="pipe-bar">
    <div class="pipe-pill active" id="pill-all" onclick="setStage('all')">
      <span>All Active</span>
      <span class="pipe-count" id="c-all">427</span>
    </div>
    <div class="pipe-pill" id="pill-batch" onclick="toggleBatch100()">
      <span>🎯 1st 100 Sites</span>
      <span class="pipe-count">100</span>
    </div>
    <div class="pipe-pill" id="pill-interested" onclick="setStage('interested')">
      <span>🔥 Interested</span>
      <span class="pipe-count" id="c-interested">0</span>
    </div>
    <div class="pipe-pill" id="pill-in_process" onclick="setStage('in_process')">
      <span>⚙️ In Process</span>
      <span class="pipe-count" id="c-in_process">5</span>
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
    <div class="pipe-pill" id="pill-archived" onclick="setStage('archived')">
      <span>📦 Archived</span>
      <span class="pipe-count" id="c-archived">0</span>
    </div>
  </div>

  <!-- Search & Filters -->
  <div class="controls">
    <div class="search-wrap">
      <span class="search-icon">🔍</span>
      <input type="text" id="searchInput" placeholder="Search company, phone, location..." oninput="handleSearch()">
    </div>

    <div class="filters">
      <select class="select-min" id="waFilter" onchange="handleFilter()">
        <option value="all">WhatsApp: All</option>
        <option value="yes">Has WhatsApp</option>
        <option value="no">No WhatsApp</option>
        <option value="pending">Pending</option>
      </select>

      <select class="select-min" id="pageSizeSelect" onchange="changeSize(this.value)">
        <option value="50">50 / page</option>
        <option value="100">100 / page</option>
        <option value="all">Show All</option>
      </select>
    </div>
  </div>

  <!-- Table Box -->
  <div class="table-box">
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th style="width: 36px;">#</th>
            <th>Company</th>
            <th>WhatsApp</th>
            <th>Funnel Status</th>
            <th>Changes & Notes</th>
            <th>Site Preview</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody id="tb">
          <!-- JS generated rows -->
        </tbody>
      </table>
    </div>

    <!-- Minimal Pagination -->
    <div class="p-foot">
      <div>
        Showing <span id="pStart">1</span>–<span id="pEnd">50</span> of <span id="pTotal">427</span>
      </div>
      <div class="p-btns">
        <button class="btn-sm" id="btnPrev" onclick="prevP()">Prev</button>
        <span id="pNums"></span>
        <button class="btn-sm" id="btnNext" onclick="nextP()">Next</button>
      </div>
    </div>
  </div>

</div>

<!-- NOTEPAD SLIDE MODAL -->
<div class="modal-bg" id="notepadModal">
  <div class="modal-card" style="max-width: 680px;">
    <div class="modal-head">
      <div class="modal-title">📝 Deployment Notepad & Batch Tracker</div>
      <button class="modal-x" onclick="closeNotepad()">✕</button>
    </div>
    <div class="modal-body">
      <div style="font-size:11px; color:var(--muted); margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Auto-saves on typing to browser localStorage.</span>
        <span>Account: <strong>knowledgeispowerbyrahul-hub</strong></span>
      </div>
      <textarea class="notepad-textarea" id="notepadText" oninput="saveNotepad()" placeholder="Write notes, batch tracking, repo links here..."></textarea>
    </div>
    <div class="modal-foot" style="justify-content: space-between;">
      <div style="display:flex; gap:6px;">
        <button class="btn-sm" onclick="loadNotepadTemplate()">Load 10 Repos Template</button>
        <button class="btn-sm" onclick="downloadNotepad()">📥 Save as .txt</button>
      </div>
      <button class="btn-primary btn-sm" onclick="closeNotepad()">Done</button>
    </div>
  </div>
</div>

<!-- Confirmation Popup Modal for Archive -->
<div class="modal-bg" id="archiveModal">
  <div class="modal-card">
    <div class="modal-head">
      <div class="modal-title">Archive Company</div>
      <button class="modal-x" onclick="closeArchiveModal()">✕</button>
    </div>
    <div class="modal-body" id="archiveModalText">
      Hide this company from the active list and move to Archive?
    </div>
    <div class="modal-foot">
      <button onclick="closeArchiveModal()">Cancel</button>
      <button class="btn-danger" id="confirmArchiveBtn" onclick="confirmArchive()">Move to Archive</button>
    </div>
  </div>
</div>

<!-- Edit Modal -->
<div class="modal-bg" id="editModal">
  <div class="modal-card">
    <div class="modal-head">
      <div class="modal-title">Edit Details</div>
      <button class="modal-x" onclick="closeEditModal()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="eId">
      <div class="fg">
        <label class="fl">Company Name</label>
        <input type="text" class="fi" id="eName">
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div class="fg">
          <label class="fl">Phone</label>
          <input type="text" class="fi" id="ePhone">
        </div>
        <div class="fg">
          <label class="fl">WhatsApp</label>
          <input type="text" class="fi" id="eWa">
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div class="fg">
          <label class="fl">WhatsApp Status</label>
          <select class="fs" id="eWaStatus">
            <option value="yes">Has WhatsApp</option>
            <option value="no">No WhatsApp</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div class="fg">
          <label class="fl">Funnel Stage</label>
          <select class="fs" id="eFunnel">
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="in_process">In Process</option>
            <option value="paid">Paid</option>
            <option value="not_decided">Not Decided</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div class="fg">
        <label class="fl">Website Changes</label>
        <textarea class="ft" id="eChanges" placeholder="Change requests, custom pricing, banner updates..."></textarea>
      </div>
      <div class="fg">
        <label class="fl">Internal Notes</label>
        <textarea class="ft" id="eNotes" placeholder="Client notes..."></textarea>
      </div>
    </div>
    <div class="modal-foot">
      <button onclick="closeEditModal()">Cancel</button>
      <button class="btn-primary" onclick="saveEdit()">Save</button>
    </div>
  </div>
</div>

<div class="toast" id="toast">Saved</div>

<script>
const INITIAL_DATA = ${JSON.stringify(clients, null, 2)};
let list = [];
let stage = 'all';
let q = '';
let wa = 'all';
let page = 1;
let size = 50;
let onlyBatch100 = false;
let pendingArchiveId = null;

const DEFAULT_NOTEPAD = \`=====================================================
UAE CAR RENTAL NETWORK - DEPLOYMENT & NOTEPAD TRACKER
=====================================================
Active GitHub: knowledgeispowerbyrahul-hub

[BATCH 1: SITES 1 to 10]
- Target Account: knowledgeispowerbyrahul-hub
1. qas-dubai-car-rental          -> [ ] Pending
2. fast-motors-car-rental       -> [ ] Pending
3. adres-car-rental             -> [ ] Pending
4. al-barsha-rent-a-car         -> [ ] Pending
5. swift-car-rental             -> [ ] Pending
6. al-wissam-car-rental         -> [ ] Pending
7. al-fadhel-car-rental         -> [ ] Pending
8. armani-car-rental-no-deposit -> [ ] Pending
9. al-andalous-rent-a-car       -> [ ] Pending
10. al-tameem-cars-buses-rental -> [ ] Pending

[BATCH 2: SITES 11 to 20]
- Target Account: [Add next email]

[NOTES & LOGS]:
- First 100 sites list saved in BATCH-1-100-WEBSITES.txt & .md\`;

function init() {
  const s = localStorage.getItem('uae_crm_min_v1');
  if (s) {
    try { list = JSON.parse(s); } catch(e) { list = JSON.parse(JSON.stringify(INITIAL_DATA)); }
  } else {
    list = JSON.parse(JSON.stringify(INITIAL_DATA));
    save();
  }

  // Init notepad
  const note = localStorage.getItem('crm_notepad_notes');
  document.getElementById('notepadText').value = note || DEFAULT_NOTEPAD;

  updateCounts();
  render();
}

function save() {
  localStorage.setItem('uae_crm_min_v1', JSON.stringify(list));
  updateCounts();
}

function saveNotepad() {
  const val = document.getElementById('notepadText').value;
  localStorage.setItem('crm_notepad_notes', val);
}

function openNotepad() {
  document.getElementById('notepadModal').classList.add('open');
}

function closeNotepad() {
  document.getElementById('notepadModal').classList.remove('open');
}

function loadNotepadTemplate() {
  if (confirm("Reset notepad to default 10-repos checklist template?")) {
    document.getElementById('notepadText').value = DEFAULT_NOTEPAD;
    saveNotepad();
    toast('Loaded 10-repos template');
  }
}

function downloadNotepad() {
  const val = document.getElementById('notepadText').value;
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(val);
  a.download = 'NOTEPAD-BATCH-TRACKER.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('Notepad downloaded');
}

function toggleBatch100() {
  onlyBatch100 = !onlyBatch100;
  page = 1;
  const btn = document.getElementById('btnBatch100');
  const pill = document.getElementById('pill-batch');
  
  if (onlyBatch100) {
    btn.style.background = '#10b981';
    btn.style.color = '#04101e';
    pill.classList.add('batch100-active');
    toast('Showing Batch 1 (1–100 Only)');
  } else {
    btn.style.background = '';
    btn.style.color = '';
    pill.classList.remove('batch100-active');
    toast('Showing All Websites');
  }
  render();
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function updateCounts() {
  const act = list.filter(c => !c.archived);
  document.getElementById('c-all').innerText = act.length;
  document.getElementById('c-interested').innerText = act.filter(c => c.funnel === 'interested').length;
  document.getElementById('c-in_process').innerText = act.filter(c => c.funnel === 'in_process').length;
  document.getElementById('c-paid').innerText = act.filter(c => c.funnel === 'paid').length;
  document.getElementById('c-not_decided').innerText = act.filter(c => c.funnel === 'not_decided').length;
  document.getElementById('c-rejected').innerText = act.filter(c => c.funnel === 'rejected').length;
  document.getElementById('c-archived').innerText = list.filter(c => c.archived).length;
}

function getFiltered() {
  return list.filter(c => {
    if (onlyBatch100 && c.id > 100) return false;

    if (stage === 'archived') {
      if (!c.archived) return false;
    } else {
      if (c.archived) return false;
      if (stage !== 'all' && c.funnel !== stage) return false;
    }
    if (wa !== 'all' && c.waStatus !== wa) return false;
    if (q) {
      const match = (c.name + ' ' + c.phone + ' ' + c.location + ' ' + c.folder + ' ' + (c.websiteChanges || '')).toLowerCase();
      if (!match.includes(q.toLowerCase())) return false;
    }
    return true;
  });
}

function directAll() {
  stage = 'all';
  q = '';
  wa = 'all';
  size = 'all';
  onlyBatch100 = false;
  page = 1;
  document.getElementById('searchInput').value = '';
  document.getElementById('waFilter').value = 'all';
  document.getElementById('pageSizeSelect').value = 'all';
  
  const btn = document.getElementById('btnBatch100');
  btn.style.background = '';
  btn.style.color = '';
  document.getElementById('pill-batch')?.classList.remove('batch100-active');

  document.querySelectorAll('.pipe-pill').forEach(p => p.classList.remove('active'));
  document.getElementById('pill-all')?.classList.add('active');
  render();
  toast('Showing all 427 sites');
}

function setStage(st) {
  stage = st;
  page = 1;
  document.querySelectorAll('.pipe-pill').forEach(p => p.classList.remove('active'));
  document.getElementById('pill-' + st)?.classList.add('active');
  render();
}

function handleSearch() {
  q = document.getElementById('searchInput').value.trim();
  page = 1;
  render();
}

function handleFilter() {
  wa = document.getElementById('waFilter').value;
  page = 1;
  render();
}

function changeSize(val) {
  size = val === 'all' ? 'all' : parseInt(val, 10);
  page = 1;
  render();
}

function render() {
  const filtered = getFiltered();
  const total = filtered.length;
  const effSize = size === 'all' ? total : size;
  const totalPages = Math.ceil(total / (effSize || 1)) || 1;
  if (page > totalPages) page = totalPages;

  const start = size === 'all' ? 0 : (page - 1) * effSize;
  const items = size === 'all' ? filtered : filtered.slice(start, start + effSize);

  document.getElementById('pStart').innerText = total === 0 ? 0 : start + 1;
  document.getElementById('pEnd').innerText = size === 'all' ? total : Math.min(start + effSize, total);
  document.getElementById('pTotal').innerText = total;
  document.getElementById('btnPrev').disabled = (page === 1 || size === 'all');
  document.getElementById('btnNext').disabled = (page === totalPages || size === 'all');

  const tb = document.getElementById('tb');
  if (items.length === 0) {
    tb.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--muted);">No matching companies.</td></tr>';
    return;
  }

  tb.innerHTML = items.map(c => {
    const waClass = c.waStatus === 'yes' ? 'tag-yes' : (c.waStatus === 'no' ? 'tag-no' : 'tag-pending');
    const waLabel = c.waStatus === 'yes' ? '● Has WA' : (c.waStatus === 'no' ? '● No WA' : '● Pending');
    const waUrl = \`https://wa.me/\${c.whatsapp}?text=\${encodeURIComponent("Hello " + c.name + ", here is your live website.")}\`;

    return \`
      <tr class="\${c.archived ? 'archived' : ''}">
        <td style="color:var(--subtle); font-family:'JetBrains Mono'; font-size:11px;">\${c.id}</td>
        
        <td>
          <a class="co-title" href="/\${c.folder}/index.html" target="_blank">\${c.name} ↗</a>
          <div class="co-sub">📍 \${c.location}</div>
          <div class="co-path">/\${c.folder}</div>
        </td>

        <td>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="tag \${waClass}" onclick="cycleWA(\${c.id})" title="Click to cycle status">\${waLabel}</span>
            \${c.waStatus === 'yes' ? \`<a class="btn-sm" href="\${waUrl}" target="_blank" style="padding:1px 5px; font-size:10px;">Chat</a>\` : ''}
          </div>
          <div style="font-size:10px; color:var(--muted); font-family:'JetBrains Mono'; margin-top:2px;">\${c.phone}</div>
        </td>

        <td>
          <select class="select-status" onchange="changeStatus(\${c.id}, this.value)">
            <option value="new" \${c.funnel === 'new' ? 'selected' : ''}>New Lead</option>
            <option value="contacted" \${c.funnel === 'contacted' ? 'selected' : ''}>Contacted</option>
            <option value="interested" \${c.funnel === 'interested' ? 'selected' : ''}>🔥 Interested</option>
            <option value="in_process" \${c.funnel === 'in_process' ? 'selected' : ''}>⚙️ In Process</option>
            <option value="paid" \${c.funnel === 'paid' ? 'selected' : ''}>💰 Paid</option>
            <option value="not_decided" \${c.funnel === 'not_decided' ? 'selected' : ''}>❓ Not Decided</option>
            <option value="rejected" \${c.funnel === 'rejected' ? 'selected' : ''}>❌ Rejected</option>
          </select>
        </td>

        <td>
          <div class="note-line" onclick="openEdit(\${c.id})">
            \${c.websiteChanges ? \`<div class="has-chg">⚙️ \${c.websiteChanges}</div>\` : ''}
            <div>\${c.notes || '<span style=\"color:var(--subtle);\">+ Add note / changes</span>'}</div>
          </div>
        </td>

        <td>
          <a class="btn-sm" href="/\${c.folder}/index.html" target="_blank">🌐 Live Site</a>
        </td>

        <td style="text-align: right; white-space:nowrap;">
          <button class="btn-sm" onclick="openEdit(\${c.id})">Edit</button>
          \${c.archived ? \`
            <button class="btn-sm" onclick="restore(\${c.id})">Restore</button>
          \` : \`
            <button class="btn-sm btn-danger" onclick="reqArchive(\${c.id})">Archive</button>
          \`}
        </td>
      </tr>
    \`;
  }).join('');
}

function prevP() { if (page > 1) { page--; render(); } }
function nextP() { const totalPages = Math.ceil(getFiltered().length / (size === 'all' ? 1 : size)); if (page < totalPages) { page++; render(); } }

function cycleWA(id) {
  const c = list.find(x => x.id === id);
  if (!c) return;
  c.waStatus = c.waStatus === 'pending' ? 'yes' : (c.waStatus === 'yes' ? 'no' : 'pending');
  save();
  render();
  toast(c.name + ': ' + c.waStatus.toUpperCase());
}

function changeStatus(id, val) {
  const c = list.find(x => x.id === id);
  if (!c) return;
  c.funnel = val;
  save();
  render();
  toast(c.name + ': ' + val);
}

function reqArchive(id) {
  const c = list.find(x => x.id === id);
  if (!c) return;
  pendingArchiveId = id;
  document.getElementById('archiveModalText').innerHTML = \`Move <strong>\${c.name}</strong> to archive? It will be hidden from the active list.\`;
  document.getElementById('archiveModal').classList.add('open');
}

function closeArchiveModal() {
  document.getElementById('archiveModal').classList.remove('open');
  pendingArchiveId = null;
}

function confirmArchive() {
  if (!pendingArchiveId) return;
  const c = list.find(x => x.id === pendingArchiveId);
  if (c) {
    c.archived = true;
    save();
    render();
    toast('Moved to Archive');
  }
  closeArchiveModal();
}

function restore(id) {
  const c = list.find(x => x.id === id);
  if (c) {
    c.archived = false;
    save();
    render();
    toast('Restored to Active');
  }
}

function openEdit(id) {
  const c = list.find(x => x.id === id);
  if (!c) return;
  document.getElementById('eId').value = c.id;
  document.getElementById('eName').value = c.name;
  document.getElementById('ePhone').value = c.phone;
  document.getElementById('eWa').value = c.whatsapp;
  document.getElementById('eWaStatus').value = c.waStatus;
  document.getElementById('eFunnel').value = c.funnel;
  document.getElementById('eChanges').value = c.websiteChanges || '';
  document.getElementById('eNotes').value = c.notes || '';
  document.getElementById('editModal').classList.add('open');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('open');
}

function saveEdit() {
  const id = parseInt(document.getElementById('eId').value, 10);
  const c = list.find(x => x.id === id);
  if (!c) return;
  c.name = document.getElementById('eName').value.trim();
  c.phone = document.getElementById('ePhone').value.trim();
  c.whatsapp = document.getElementById('eWa').value.replace(/[^0-9]/g, '');
  c.waStatus = document.getElementById('eWaStatus').value;
  c.funnel = document.getElementById('eFunnel').value;
  c.websiteChanges = document.getElementById('eChanges').value.trim();
  c.notes = document.getElementById('eNotes').value.trim();
  save();
  closeEditModal();
  render();
  toast('Changes saved');
}

function exportCSV() {
  const headers = ['ID', 'Company', 'Folder', 'Phone', 'WhatsApp', 'WA Status', 'Funnel', 'Changes', 'Notes', 'Archived'];
  const rows = list.map(c => [
    c.id, \`"\${c.name.replace(/"/g, '""')}"\`, c.folder, \`"\${c.phone}"\`, c.whatsapp, c.waStatus, c.funnel,
    \`"\${(c.websiteChanges||'').replace(/"/g, '""')}"\`, \`"\${(c.notes||'').replace(/"/g, '""')}"\`, c.archived ? 'YES' : 'NO'
  ]);
  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
  const a = document.createElement('a');
  a.href = encodeURI(csv);
  a.download = 'leads_export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportJSON() {
  const str = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(list, null, 2));
  const a = document.createElement('a');
  a.href = str;
  a.download = 'leads_backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function resetDefaults() {
  if (confirm('Reset to defaults?')) {
    list = JSON.parse(JSON.stringify(INITIAL_DATA));
    save();
    render();
    toast('Reset complete');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeArchiveModal();
    closeEditModal();
    closeNotepad();
  }
});

window.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>`;

fs.writeFileSync(path.join(WORKSPACE, 'index.html'), html);
fs.writeFileSync(path.join(WORKSPACE, 'crm-dashboard.html'), html);
console.log('Recompiled index.html with Notepad & Batch 1 tools');
