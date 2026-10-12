const fs = require('fs');
const path = require('path');

const WORKSPACE = path.resolve(__dirname);
const DB_FILE = path.join(WORKSPACE, 'deployed-sites.json');
const B100_FILE = path.join(WORKSPACE, 'BATCH-1-100-WEBSITES.txt');

let deployed = {};
if (fs.existsSync(DB_FILE)) {
  try { deployed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e) {}
}

const b100 = fs.readFileSync(B100_FILE, 'utf8');
const entries = b100.split('------------------------------------------------------------').map(e => e.trim()).filter(Boolean);

const allSites = entries.map(e => {
  const nameMatch = e.match(/\[(\d+)\]\s+(.+)/);
  const folderMatch = e.match(/Folder:\s+\/([^\s]+)/);
  const phoneMatch = e.match(/Phone:\s+([^\s].+)/);
  const waMatch = e.match(/WhatsApp:\s+https:\/\/wa\.me\/([^\s]+)/);
  return {
    id: parseInt(nameMatch[1], 10),
    name: nameMatch[2].trim(),
    folder: folderMatch[1].trim(),
    phone: phoneMatch ? phoneMatch[1].trim() : '',
    whatsapp: waMatch ? waMatch[1].trim() : ''
  };
});

const liveSites = [];
const pendingSites = [];

allSites.forEach(s => {
  if (deployed[s.id] && deployed[s.id].liveUrl) {
    liveSites.push({ ...s, liveUrl: deployed[s.id].liveUrl });
  } else {
    pendingSites.push(s);
  }
});

// 1. Generate Markdown Notes
let md = `# UAE Car Rental Network - Live vs Pending Status Tracker\n\n`;
md += `**Last Updated:** ${new Date().toLocaleString()} (Local Time)\n\n`;
md += `### Summary Overview:\n`;
md += `- **Total Tracked Sites:** 100\n`;
md += `- **🟢 Live on Vercel:** ${liveSites.length} / 100\n`;
md += `- **⏳ Pending Deployment:** ${pendingSites.length} / 100\n\n`;

md += `### Live Management Panels:\n`;
md += `- **Panel 1 (Sites #1 to #50):** [https://panel1-uae.vercel.app](https://panel1-uae.vercel.app)\n`;
md += `- **Panel 2 (Sites #51 to #100):** [https://panel2-uae.vercel.app](https://panel2-uae.vercel.app)\n\n`;

md += `## 🟢 Live Websites (${liveSites.length})\n\n`;
md += `| # | Company Name | Live Vercel Link | Phone | Folder |\n`;
md += `| :--- | :--- | :--- | :--- | :--- |\n`;
liveSites.forEach(s => {
  md += `| ${s.id} | **${s.name}** | [${s.liveUrl}](${s.liveUrl}) | \`${s.phone}\` | \`/${s.folder}\` |\n`;
});

md += `\n## ⏳ Pending Websites (${pendingSites.length})\n\n`;
md += `| # | Company Name | Status | Phone | Folder |\n`;
md += `| :--- | :--- | :--- | :--- | :--- |\n`;
pendingSites.forEach(s => {
  md += `| ${s.id} | ${s.name} | ⏳ In Queue | \`${s.phone}\` | \`/${s.folder}\` |\n`;
});

fs.writeFileSync(path.join(WORKSPACE, 'LIVE-AND-PENDING-WEBSITES.md'), md);

// 2. Generate Plain Text Notepad File
let txt = `=====================================================\n`;
txt += `UAE CAR RENTAL NETWORK - LIVE & PENDING STATUS NOTES\n`;
txt += `Updated: ${new Date().toISOString()}\n`;
txt += `=====================================================\n\n`;
txt += `TOTAL SITES: 100\n`;
txt += `LIVE ON VERCEL: ${liveSites.length}\n`;
txt += `PENDING:        ${pendingSites.length}\n\n`;

txt += `[MANAGEMENT PANELS]:\n`;
txt += `Panel 1 (Sites 1-50):   https://panel1-uae.vercel.app\n`;
txt += `Panel 2 (Sites 51-100):  https://panel2-uae.vercel.app\n\n`;

txt += `=====================================================\n`;
txt += `🟢 LIVE WEBSITES (${liveSites.length})\n`;
txt += `=====================================================\n`;
liveSites.forEach(s => {
  txt += `[LIVE] #${String(s.id).padStart(3, '0')} - ${s.name}\n`;
  txt += `       URL:    ${s.liveUrl}\n`;
  txt += `       Phone:  ${s.phone}\n`;
  txt += `       Folder: /${s.folder}\n\n`;
});

txt += `=====================================================\n`;
txt += `⏳ PENDING WEBSITES (${pendingSites.length})\n`;
txt += `=====================================================\n`;
pendingSites.forEach(s => {
  txt += `[PENDING] #${String(s.id).padStart(3, '0')} - ${s.name} (${s.folder})\n`;
});

fs.writeFileSync(path.join(WORKSPACE, 'LIVE-AND-PENDING-WEBSITES.txt'), txt);
fs.writeFileSync(path.join(WORKSPACE, 'NOTEPAD-BATCH-TRACKER.txt'), txt);

console.log(`Synced tracker notes:`);
console.log(`- 🟢 Live: ${liveSites.length}`);
console.log(`- ⏳ Pending: ${pendingSites.length}`);
console.log(`Saved to:`);
console.log(`1. LIVE-AND-PENDING-WEBSITES.md`);
console.log(`2. LIVE-AND-PENDING-WEBSITES.txt`);
console.log(`3. NOTEPAD-BATCH-TRACKER.txt`);
