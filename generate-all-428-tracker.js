const fs = require('fs');
const path = require('path');

const WORKSPACE = path.resolve(__dirname);
const DB_FILE = path.join(WORKSPACE, 'deployed-sites.json');
const CSV_FILE = path.join(WORKSPACE, 'companies.csv');

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

function run() {
  let db = {};
  if (fs.existsSync(DB_FILE)) {
    try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e) {}
  }

  const rawLines = fs.readFileSync(CSV_FILE, 'utf8').trim().split('\n');
  const companies = [];

  for (let i = 1; i < rawLines.length; i++) {
    const cols = parseCSVLine(rawLines[i]);
    const name = cols[0] ? cols[0].trim() : '';
    if (!name) continue;

    const phone = cols[1] ? cols[1].trim() : '+971 50 000 0000';
    const wa = cols[2] ? cols[2].trim() : '';
    const issue = cols[5] ? cols[5].trim() : '';
    const location = cols.slice(8).join(', ').trim() || 'Dubai, UAE';

    companies.push({
      id: i,
      name,
      phone,
      whatsapp: wa || `https://wa.me/${phone.replace(/[^0-9]/g, '')}`,
      issue,
      location,
      assignedTo: i <= 30 ? 'Rahul' : (i <= 60 ? 'Het' : 'Pending Batch'),
      isLive: i <= 60,
      liveUrl: db[i] ? db[i].liveUrl : null
    });
  }

  const rahulSites = companies.filter(c => c.assignedTo === 'Rahul');
  const hetSites = companies.filter(c => c.assignedTo === 'Het');
  const pendingSites = companies.filter(c => !c.isLive);

  // 1. Generate Plain Text File
  let txt = `=========================================================================\n`;
  txt += `UAE CAR RENTAL NETWORK - 400+ CLIENT MASTER TRACKER\n`;
  txt += `Generated: ${new Date().toISOString()}\n`;
  txt += `=========================================================================\n\n`;
  txt += `TOTAL CLIENT DATABASE: ${companies.length} Companies\n`;
  txt += `🟢 TOTAL LIVE WEBSITES: 60 / ${companies.length}\n`;
  txt += `   - RAHUL'S SALES BATCH: 30 Live Websites (#001 to #030)\n`;
  txt += `   - HET'S SALES BATCH:   30 Live Websites (#031 to #060)\n`;
  txt += `⏳ PENDING DEPLOYMENTS:   ${pendingSites.length} Companies (#061 to #${String(companies.length).padStart(3, '0')})\n\n`;

  txt += `[LIVE CRM SALES PANELS]:\n`;
  txt += `1. RAHUL'S PANEL (Sites 1-30):  https://panel1-uae.vercel.app\n`;
  txt += `2. HET'S PANEL   (Sites 31-60): https://panel2-uae.vercel.app\n\n`;

  txt += `=========================================================================\n`;
  txt += `👤 1. RAHUL'S SALES CLIENTS (30 LIVE WEBSITES)\n`;
  txt += `=========================================================================\n`;
  rahulSites.forEach(s => {
    txt += `[LIVE - RAHUL] #${String(s.id).padStart(3, '0')} - ${s.name}\n`;
    txt += `               Live URL: ${s.liveUrl || 'Pending update'}\n`;
    txt += `               Phone:    ${s.phone}\n`;
    txt += `               WhatsApp: ${s.whatsapp}\n`;
    txt += `               Location: ${s.location}\n\n`;
  });

  txt += `=========================================================================\n`;
  txt += `👤 2. HET'S SALES CLIENTS (30 LIVE WEBSITES)\n`;
  txt += `=========================================================================\n`;
  hetSites.forEach(s => {
    txt += `[LIVE - HET]   #${String(s.id).padStart(3, '0')} - ${s.name}\n`;
    txt += `               Live URL: ${s.liveUrl || 'Pending update'}\n`;
    txt += `               Phone:    ${s.phone}\n`;
    txt += `               WhatsApp: ${s.whatsapp}\n`;
    txt += `               Location: ${s.location}\n\n`;
  });

  txt += `=========================================================================\n`;
  txt += `⏳ PENDING CLIENTS QUEUE (${pendingSites.length} COMPANIES - SITES #061 to #${String(companies.length).padStart(3, '0')})\n`;
  txt += `=========================================================================\n`;
  pendingSites.forEach(s => {
    txt += `[PENDING] #${String(s.id).padStart(3, '0')} - ${s.name}\n`;
    txt += `          Phone:    ${s.phone}\n`;
    txt += `          WhatsApp: ${s.whatsapp}\n`;
    txt += `          Location: ${s.location}\n\n`;
  });

  fs.writeFileSync(path.join(WORKSPACE, 'LIVE-AND-PENDING-WEBSITES.txt'), txt);
  fs.writeFileSync(path.join(WORKSPACE, 'NOTEPAD-BATCH-TRACKER.txt'), txt);

  // 2. Generate Markdown File
  let md = `# UAE Car Rental Network – 400+ Client Master Sales Tracker\n\n`;
  md += `**Last Updated:** ${new Date().toLocaleString()} (Local Time)\n\n`;
  md += `### Summary Metrics:\n`;
  md += `- **Total Companies in Database:** ${companies.length}\n`;
  md += `- **🟢 Total Live Websites on Vercel:** 60\n`;
  md += `  - **👤 Rahul's Sales Batch:** 30 Live Websites (#1 to #30)\n`;
  md += `  - **👤 Het's Sales Batch:** 30 Live Websites (#31 to #60)\n`;
  md += `- **⏳ Pending Deployments:** ${pendingSites.length} Companies (#61 to #${companies.length})\n\n`;

  md += `### 🌐 Live CRM Sales Panels:\n`;
  md += `- **Rahul's Sales Panel (Sites #1–30):** [https://panel1-uae.vercel.app](https://panel1-uae.vercel.app)\n`;
  md += `- **Het's Sales Panel (Sites #31–60):** [https://panel2-uae.vercel.app](https://panel2-uae.vercel.app)\n\n`;

  md += `## 👤 1. Rahul's Live Sales Clients (30)\n\n`;
  md += `| # | Company Name | Live Vercel Website | Phone | WhatsApp | Location |\n`;
  md += `| :- | :--- | :--- | :--- | :--- | :--- |\n`;
  rahulSites.forEach(s => {
    md += `| ${s.id} | **${s.name}** | [${s.liveUrl || 'Link'}](${s.liveUrl || '#'}) | \`${s.phone}\` | [Chat](${s.whatsapp}) | ${s.location} |\n`;
  });

  md += `\n## 👤 2. Het's Live Sales Clients (30)\n\n`;
  md += `| # | Company Name | Live Vercel Website | Phone | WhatsApp | Location |\n`;
  md += `| :- | :--- | :--- | :--- | :--- | :--- |\n`;
  hetSites.forEach(s => {
    md += `| ${s.id} | **${s.name}** | [${s.liveUrl || 'Link'}](${s.liveUrl || '#'}) | \`${s.phone}\` | [Chat](${s.whatsapp}) | ${s.location} |\n`;
  });

  md += `\n## ⏳ Pending Clients Queue (${pendingSites.length})\n\n`;
  md += `| # | Company Name | Status | Phone | Location |\n`;
  md += `| :- | :--- | :--- | :--- | :--- |\n`;
  pendingSites.slice(0, 100).forEach(s => {
    md += `| ${s.id} | ${s.name} | ⏳ Pending Next Batch | \`${s.phone}\` | ${s.location} |\n`;
  });
  if (pendingSites.length > 100) {
    md += `\n*(Showing first 100 pending clients in table; see [LIVE-AND-PENDING-WEBSITES.txt](file://LIVE-AND-PENDING-WEBSITES.txt) for the full 427-client list)*\n`;
  }

  fs.writeFileSync(path.join(WORKSPACE, 'LIVE-AND-PENDING-WEBSITES.md'), md);
  console.log(`Successfully generated master tracker for all ${companies.length} companies!`);
  console.log(`- Rahul: ${rahulSites.length} Live`);
  console.log(`- Het: ${hetSites.length} Live`);
  console.log(`- Pending: ${pendingSites.length}`);
}

run();
