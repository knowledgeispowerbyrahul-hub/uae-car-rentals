const https = require('https');
const fs = require('fs');
const path = require('path');

const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'deployed-sites.json'), 'utf8'));

function check(url) {
  return new Promise(resolve => {
    try {
      const req = https.get(url, { timeout: 4000 }, res => {
        resolve(res.statusCode);
      });
      req.on('error', () => resolve(0));
      req.on('timeout', () => { req.destroy(); resolve(0); });
    } catch(e) { resolve(0); }
  });
}

async function testAliases() {
  for (let i = 1; i <= 31; i++) {
    const s = db[i];
    if (!s) continue;
    const testUrl = `https://${s.shortName}.vercel.app`;
    const code = await check(testUrl);
    console.log(`#${i} ${s.shortName} -> ${testUrl}: ${code}`);
  }
}

testAliases();
