const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = path.resolve(__dirname);
const DB_FILE = path.join(WORKSPACE, 'deployed-sites.json');

// Load deployed sites DB
let deployed = {};
if (fs.existsSync(DB_FILE)) {
  try {
    deployed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    deployed = {};
  }
}

// Pre-fill already deployed sites
deployed[1] = {
  id: 1,
  folder: 'qas-dubai-car-rental',
  name: 'QAS Dubai Car Rental',
  shortName: 'qas-rent',
  liveUrl: 'https://qas-rent-tan.vercel.app'
};
deployed[2] = {
  id: 2,
  folder: 'fast-motors-car-rental',
  name: 'FAST MOTORS CAR RENTAL LLC',
  shortName: 'fast-motors-rent',
  liveUrl: 'https://fast-motors-rent-resxspf35-carrental3.vercel.app'
};
deployed[3] = {
  id: 3,
  folder: 'adres-car-rental',
  name: 'ADRES CAR RENTAL',
  shortName: 'adres-rent',
  liveUrl: 'https://adres-rent-3418o6o97-carrental3.vercel.app'
};
deployed[4] = {
  id: 4,
  folder: 'al-barsha-rent-a-car',
  name: 'Rent a car Al barsha',
  shortName: 'al-barsha',
  liveUrl: 'https://al-barsha.vercel.app'
};

// Read all 100 exact folders from BATCH-1-100-WEBSITES.txt
const b100 = fs.readFileSync(path.join(WORKSPACE, 'BATCH-1-100-WEBSITES.txt'), 'utf8');
const entries = b100.split('------------------------------------------------------------').map(e => e.trim()).filter(Boolean);

const allSites = entries.map(e => {
  const nameMatch = e.match(/\[(\d+)\]\s+(.+)/);
  const folderMatch = e.match(/Folder:\s+\/([^\s]+)/);
  const phoneMatch = e.match(/Phone:\s+([^\s].+)/);
  return {
    id: parseInt(nameMatch[1], 10),
    name: nameMatch[2].trim(),
    folder: folderMatch[1].trim(),
    phone: phoneMatch ? phoneMatch[1].trim() : ''
  };
});

// Assign unique short names for Vercel
const usedShorts = new Set(['panel1-uae', 'panel2-uae', 'qas-rent', 'al-barsha']);

allSites.forEach(s => {
  if (deployed[s.id] && deployed[s.id].shortName) {
    s.shortName = deployed[s.id].shortName;
    usedShorts.add(s.shortName);
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

fs.writeFileSync(DB_FILE, JSON.stringify(deployed, null, 2));

const startNum = parseInt(process.argv[2] || '1', 10);
const endNum = parseInt(process.argv[3] || '100', 10);

console.log(`====================================================`);
console.log(`UAE CAR RENTAL NETWORK - VERCEL BULK DEPLOYER`);
console.log(`Targeting: Sites #${startNum} to #${endNum} (Total 100 sites)`);
console.log(`Currently Live in DB: ${Object.keys(deployed).length} / 100`);
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

  // 1. Remove old .vercel
  const oldVercel = path.join(siteDir, '.vercel');
  if (fs.existsSync(oldVercel)) {
    fs.rmSync(oldVercel, { recursive: true, force: true });
  }

  // 2. Ensure vercel.json
  const vConfig = path.join(siteDir, 'vercel.json');
  fs.writeFileSync(vConfig, JSON.stringify({ outputDirectory: '.', cleanUrls: true }, null, 2));

  console.log(`[${site.id}/100] Deploying: ${site.name} -> short name: ${site.shortName}...`);

  try {
    const rawOut = execSync(`vercel deploy --prod --yes --name "${site.shortName}"`, {
      cwd: siteDir,
      stdio: 'pipe',
      timeout: 45000
    }).toString();

    // Find all vercel.app URLs in output
    const matches = rawOut.match(/https:\/\/[a-z0-9.-]+\.vercel\.app/gi) || [];
    let liveUrl = null;
    if (matches.length > 0) {
      // Pick the last matching URL (typically the aliased URL)
      liveUrl = matches[matches.length - 1];
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
      console.log(`   ✅ LIVE: ${liveUrl}`);
      successCount++;
      try { execSync('node sync-tracker-notes.js', { stdio: 'ignore' }); } catch(e) {}
    } else {
      console.log(`   ⚠️ Deployed but URL not matched in stdout`);
    }
  } catch (err) {
    const errText = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '') + err.message;
    console.error(`   ❌ Failed:`, err.message.slice(0, 80));
    
    // Check if daily limit was hit
    if (/limit/i.test(errText) && /day|deployments/i.test(errText)) {
      console.error(`\n🚨 VERCEL DAILY DEPLOYMENT LIMIT REACHED!`);
      console.error(`Vercel limits Hobby accounts to 100 deployments / 24h.`);
      break;
    }
    failCount++;
  }
}

console.log(`\n====================================================`);
console.log(`Batch Summary:`);
console.log(`- New Deployed: ${successCount}`);
console.log(`- Failed/Skipped: ${failCount}`);
console.log(`- Total Live Now: ${Object.keys(deployed).length} / 100`);
console.log(`====================================================`);
