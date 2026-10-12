const fs = require('fs');
const path = require('path');
const https = require('https');

const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'deployed-sites.json'), 'utf8'));

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.get(url, { timeout: 10000 }, (res) => {
        resolve({ statusCode: res.statusCode, ok: res.statusCode === 200 || res.statusCode === 308 || res.statusCode === 307 });
      });
      req.on('error', (err) => resolve({ statusCode: 0, ok: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ statusCode: 0, ok: false, error: 'TIMEOUT' }); });
    } catch(e) {
      resolve({ statusCode: 0, ok: false, error: e.message });
    }
  });
}

async function verifyAll() {
  console.log('Verifying all 60 live websites...\n');
  let pass = 0;
  let fail = 0;
  for (let i = 1; i <= 60; i++) {
    const site = db[i];
    if (!site || !site.liveUrl) {
      console.log(`❌ #${i}: Missing URL in DB`);
      fail++;
      continue;
    }
    const res = await checkUrl(site.liveUrl);
    if (res.ok) {
      console.log(`✅ #${String(i).padStart(2, '0')}: [HTTP ${res.statusCode}] ${site.name} -> ${site.liveUrl}`);
      pass++;
    } else {
      console.log(`❌ #${String(i).padStart(2, '0')}: [HTTP ${res.statusCode}] ${site.name} -> ${site.liveUrl} (${res.error || 'Failed'})`);
      fail++;
    }
  }
  console.log(`\n================================`);
  console.log(`Verification Summary:`);
  console.log(`- Working (HTTP 200 OK): ${pass} / 60`);
  console.log(`- Failed: ${fail} / 60`);
  console.log(`================================`);
}

verifyAll();
