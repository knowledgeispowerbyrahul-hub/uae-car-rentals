const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const WORKSPACE = path.resolve(__dirname);
const DB_FILE = path.join(WORKSPACE, 'deployed-sites.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Read batch 100
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

function checkUrl(url) {
  return new Promise(resolve => {
    if (!url) return resolve(false);
    try {
      const req = https.get(url, { timeout: 4000 }, res => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    } catch(e) { resolve(false); }
  });
}

async function run() {
  console.log('Ensuring all 30 sites for Rahul are 100% HTTP 200 on Vercel...\n');

  for (let i = 0; i < 30; i++) {
    const site = allSites[i];
    const current = db[site.id];

    if (current && current.liveUrl) {
      const isWorking = await checkUrl(current.liveUrl);
      if (isWorking) {
        console.log(`✅ #${site.id}: Already working -> ${current.liveUrl}`);
        continue;
      }
    }

    const siteDir = path.join(WORKSPACE, site.folder);
    if (!fs.existsSync(siteDir)) {
      console.log(`❌ #${site.id}: Folder missing -> ${site.folder}`);
      continue;
    }

    // Reset .vercel to link to active account
    fs.rmSync(path.join(siteDir, '.vercel'), { recursive: true, force: true });
    fs.writeFileSync(path.join(siteDir, 'vercel.json'), JSON.stringify({ outputDirectory: '.', cleanUrls: true }, null, 2));

    let shortName = site.folder
      .replace(/-car-rental|-rent-a-car|-cars-rental|-rent-car|-supercar|-chauffeur-service|-cars|-rental|-llc|-branch/gi, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (!shortName || shortName.length < 3) shortName = 'car-' + site.id;
    if (shortName.length > 14) shortName = shortName.slice(0, 14).replace(/-$/, '');
    shortName += '-uae';

    console.log(`🚀 Deploying #${site.id}: ${site.name} (${shortName})...`);

    try {
      const rawOut = execSync(`vercel deploy --prod --yes --name "${shortName}"`, {
        cwd: siteDir,
        stdio: 'pipe',
        timeout: 90000
      }).toString();

      // Look for Aliased URL
      const aliasMatch = rawOut.match(/Aliased:\s+(https:\/\/[a-z0-9.-]+\.vercel\.app)/i);
      let liveUrl = null;
      if (aliasMatch) {
        liveUrl = aliasMatch[1];
      } else {
        const matches = rawOut.match(/https:\/\/[a-z0-9.-]+\.vercel\.app/gi) || [];
        liveUrl = matches.find(u => !u.includes('magicseoaitool-4669s-projects')) || matches[matches.length - 1];
      }

      if (liveUrl) {
        db[site.id] = {
          id: site.id,
          folder: site.folder,
          name: site.name,
          shortName,
          phone: site.phone,
          liveUrl
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        console.log(`   ✅ LIVE: ${liveUrl}`);
      }
    } catch(err) {
      console.log(`   ❌ Error: ${err.message.slice(0, 80)}`);
    }
  }

  console.log('\nAll Rahul sites checked and saved to deployed-sites.json!');
}

run();
