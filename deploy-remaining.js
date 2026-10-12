const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = path.resolve(__dirname);
const DB_FILE = path.join(WORKSPACE, 'deployed-sites.json');
const CURRENT_TEAM = 'team_MZFA53BjHXHUZ8qYf9SamGIl';

// Load deployed DB
let deployed = {};
if (fs.existsSync(DB_FILE)) {
  try {
    deployed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    deployed = {};
  }
}

// Ensure 40 and 41 are properly recorded
deployed[40] = {
  id: 40,
  folder: 'spider-rent-a-car',
  name: 'Spider Rent A Car',
  shortName: 'spider',
  phone: '+971 55 722 8882',
  liveUrl: 'https://spider-delta-seven.vercel.app'
};

deployed[41] = {
  id: 41,
  folder: 'white-and-red-cars-rental',
  name: 'White and red cars rental',
  shortName: 'white-and-red',
  phone: '+971 50 252 0979',
  liveUrl: 'https://white-and-red-sigma.vercel.app'
};

fs.writeFileSync(DB_FILE, JSON.stringify(deployed, null, 2));

// Read all 100 entries from BATCH-1-100-WEBSITES.txt
const b100 = fs.readFileSync(path.join(WORKSPACE, 'BATCH-1-100-WEBSITES.txt'), 'utf8');
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

// Assign unique short names for unlinked projects
const usedShorts = new Set();
Object.values(deployed).forEach(d => {
  if (d.shortName) usedShorts.add(d.shortName);
});

allSites.forEach(s => {
  if (deployed[s.id] && deployed[s.id].shortName) {
    s.shortName = deployed[s.id].shortName;
    return;
  }
  let short = s.folder
    .replace(/-car-rental|-rent-a-car|-cars-rental|-rent-car|-supercar|-chauffeur-service|-cars|-rental|-llc|-branch|-establishment|-company/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!short || short.length < 3) short = 'car-' + s.id;
  if (short.length > 15) short = short.slice(0, 15).replace(/-$/, '');

  let unique = short;
  let c = 2;
  while (usedShorts.has(unique)) {
    unique = short + '-' + c;
    c++;
  }
  usedShorts.add(unique);
  s.shortName = unique;
});

const startNum = parseInt(process.argv[2] || '42', 10);
const endNum = parseInt(process.argv[3] || '100', 10);

console.log(`====================================================`);
console.log(`UAE CAR RENTAL NETWORK - DEPLOYING REMAINING SITES`);
console.log(`Range: Sites #${startNum} to #${endNum} of 100`);
console.log(`Already Live: ${Object.keys(deployed).length} / 100`);
console.log(`====================================================\n`);

let successCount = 0;
let failCount = 0;

for (let i = startNum - 1; i < endNum && i < allSites.length; i++) {
  const site = allSites[i];

  if (deployed[site.id] && deployed[site.id].liveUrl) {
    console.log(`[${site.id}/100] Already live: ${deployed[site.id].liveUrl}`);
    continue;
  }

  const siteDir = path.join(WORKSPACE, site.folder);
  if (!fs.existsSync(siteDir)) {
    console.error(`❌ [${site.id}/100] Directory missing: ${site.folder}`);
    failCount++;
    continue;
  }

  // Check .vercel/project.json
  const vProjectJson = path.join(siteDir, '.vercel', 'project.json');
  let hasValidLink = false;
  if (fs.existsSync(vProjectJson)) {
    try {
      const pData = JSON.parse(fs.readFileSync(vProjectJson, 'utf8'));
      if (pData.orgId === CURRENT_TEAM) {
        hasValidLink = true;
      } else {
        fs.rmSync(path.join(siteDir, '.vercel'), { recursive: true, force: true });
      }
    } catch (e) {
      fs.rmSync(path.join(siteDir, '.vercel'), { recursive: true, force: true });
    }
  }

  // Ensure vercel.json
  const vConfig = path.join(siteDir, 'vercel.json');
  fs.writeFileSync(vConfig, JSON.stringify({ outputDirectory: '.', cleanUrls: true }, null, 2));

  console.log(`[${site.id}/100] 🚀 Deploying: "${site.name}" (linked: ${hasValidLink})...`);

  const deployCmd = hasValidLink
    ? 'vercel deploy --prod --yes'
    : `vercel deploy --prod --yes --name "${site.shortName}"`;

  try {
    const rawOut = execSync(deployCmd, {
      cwd: siteDir,
      stdio: 'pipe',
      timeout: 90000
    }).toString();

    // Look for Aliased URL first
    const aliasMatch = rawOut.match(/Aliased:\s+(https:\/\/[a-z0-9.-]+\.vercel\.app)/i);
    let liveUrl = null;
    if (aliasMatch) {
      liveUrl = aliasMatch[1];
    } else {
      // Find all vercel.app URLs
      const matches = rawOut.match(/https:\/\/[a-z0-9.-]+\.vercel\.app/gi) || [];
      // Prefer ones that don't have magicseoaitool-4669s-projects
      liveUrl = matches.find(u => !u.includes('magicseoaitool-4669s-projects')) || matches[matches.length - 1];
    }

    if (liveUrl) {
      deployed[site.id] = {
        id: site.id,
        folder: site.folder,
        name: site.name,
        shortName: site.shortName,
        phone: site.phone,
        liveUrl
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(deployed, null, 2));
      console.log(`   ✅ [${site.id}/100] LIVE: ${liveUrl}`);
      successCount++;
      try { execSync('node sync-tracker-notes.js', { stdio: 'ignore' }); } catch(e) {}
    } else {
      console.log(`   ⚠️ [${site.id}/100] Deployed but URL not found in output`);
      failCount++;
    }
  } catch (err) {
    const errText = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '') + err.message;
    console.error(`   ❌ [${site.id}/100] Failed: ${err.message.slice(0, 100)}`);
    
    if (/limit/i.test(errText) && /day|deployments/i.test(errText)) {
      console.error(`\n🚨 VERCEL DAILY DEPLOYMENT LIMIT REACHED!`);
      break;
    }
    failCount++;
  }
}

console.log(`\n====================================================`);
console.log(`Batch Summary:`);
console.log(`- New Deployed in this run: ${successCount}`);
console.log(`- Failed/Skipped: ${failCount}`);
console.log(`- Total Live Overall: ${Object.keys(deployed).length} / 100`);
console.log(`====================================================`);
