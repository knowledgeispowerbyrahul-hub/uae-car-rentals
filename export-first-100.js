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
const first100 = [];

for (let i = 1; i <= 100; i++) {
  const row = parseCSVLine(rawCsv[i]);
  const name = row[0].trim();
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

  const port = 4321 + i;
  const locationRaw = row.slice(8).join(', ').trim() || 'Dubai, UAE';

  first100.push({
    id: i,
    name,
    folder: uniqueSlug,
    phone,
    whatsapp: waDigits,
    port,
    location: locationRaw
  });
}

// Generate Markdown table
let md = '# First 100 UAE Car Rental Websites (Batch 1)\n\n';
md += 'Total: **100 Websites** (IDs #1 to #100)\n\n';
md += '| # | Company Name | Folder | Phone | WhatsApp | Port | Live Link |\n';
md += '|---|---|---|---|---|---|---|\n';

first100.forEach(c => {
  md += '| ' + c.id + ' | **' + c.name + '** | `' + c.folder + '` | ' + c.phone + ' | [' + c.whatsapp + '](https://wa.me/' + c.whatsapp + ') | ' + c.port + ' | [http://localhost:3333/' + c.folder + '/index.html](http://localhost:3333/' + c.folder + '/index.html) |\n';
});

fs.writeFileSync(path.join(WORKSPACE, 'BATCH-1-100-WEBSITES.md'), md);

// Generate clean Plain Text list
let txt = '=== BATCH 1: FIRST 100 UAE CAR RENTAL WEBSITES ===\n';
txt += 'Generated on: ' + new Date().toISOString() + '\n\n';

first100.forEach(c => {
  txt += '[' + String(c.id).padStart(3, '0') + '] ' + c.name + '\n';
  txt += '      Folder:   /' + c.folder + '\n';
  txt += '      Phone:    ' + c.phone + '\n';
  txt += '      WhatsApp: https://wa.me/' + c.whatsapp + '\n';
  txt += '      Port:     ' + c.port + '\n';
  txt += '      Local:    http://localhost:3333/' + c.folder + '/index.html\n';
  txt += '------------------------------------------------------------\n';
});

fs.writeFileSync(path.join(WORKSPACE, 'BATCH-1-100-WEBSITES.txt'), txt);

// Generate initial NOTEPAD-BATCH-TRACKER.txt
const trackerText = `=====================================================
UAE CAR RENTAL NETWORK - DEPLOYMENT & NOTEPAD TRACKER
=====================================================

Active Account: knowledgeispowerbyrahul-hub (GitHub)
Goal: Deploy in batches (10 repos per batch / new email)

[BATCH 1: SITES 1 to 10]
- Status: READY TO DEPLOY
- Target Email / Account: knowledgeispowerbyrahul-hub
- Repos to create:
  1. qas-dubai-car-rental           -> [ ] Pending
  2. fast-motors-car-rental        -> [ ] Pending
  3. adres-car-rental              -> [ ] Pending
  4. al-barsha-rent-a-car          -> [ ] Pending
  5. swift-car-rental              -> [ ] Pending
  6. al-wissam-car-rental          -> [ ] Pending
  7. al-fadhel-car-rental          -> [ ] Pending
  8. armani-car-rental-no-deposit  -> [ ] Pending
  9. al-andalous-rent-a-car        -> [ ] Pending
  10. al-tameem-cars-buses-rental  -> [ ] Pending

[BATCH 2: SITES 11 to 20]
- Status: Queued
- Target Email / Account: [Add next email here]

[BATCH 3: SITES 21 to 30]
- Status: Queued
- Target Email / Account: [Add next email here]

[NOTES & LOGS]:
- All 100 sites list saved in: BATCH-1-100-WEBSITES.md and BATCH-1-100-WEBSITES.txt
- Use the CRM Notepad tool on http://localhost:3333 to update notes in real-time.
`;

fs.writeFileSync(path.join(WORKSPACE, 'NOTEPAD-BATCH-TRACKER.txt'), trackerText);

console.log('Successfully generated:');
console.log('1. BATCH-1-100-WEBSITES.md');
console.log('2. BATCH-1-100-WEBSITES.txt');
console.log('3. NOTEPAD-BATCH-TRACKER.txt');
