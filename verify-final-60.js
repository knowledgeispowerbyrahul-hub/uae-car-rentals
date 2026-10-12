const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_FILE = path.join(__dirname, 'deployed-sites.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Update site 31
db[31] = {
  id: 31,
  folder: 'pro-car-rent-al-salam-street',
  name: 'Pro Car Rent - Al Salam Street',
  shortName: 'pro-car-rent-uae',
  phone: '+971 56 216 8666',
  liveUrl: 'https://pro-car-rent-uae.vercel.app'
};

// Map Rahul sites (1-30) to their clean production aliases
const rahulAliases = {
  1: 'https://qas-rent-tan.vercel.app',
  2: 'https://fast-motors-uae.vercel.app',
  3: 'https://adres-uae.vercel.app',
  4: 'https://al-barsha.vercel.app',
  5: 'https://swift-uae.vercel.app',
  6: 'https://exotic-ride-du-uae.vercel.app',
  7: 'https://carx-dubai-in-uae.vercel.app',
  8: 'https://luxury-uae.vercel.app',
  9: 'https://rent-ride-uae.vercel.app',
  10: 'https://leo-exotics-no-uae.vercel.app',
  11: 'https://rayan-uae.vercel.app',
  12: 'https://ferro-uae.vercel.app',
  13: 'https://autobaba-l-l-c-uae.vercel.app',
  14: 'https://dubai-rent-uae.vercel.app',
  15: 'https://luxxio-uae.vercel.app',
  16: 'https://davinci-dubai-uae.vercel.app',
  17: 'https://dubai-g63-rang-uae.vercel.app',
  18: 'https://camaro-dubai-uae.vercel.app',
  19: 'https://vintx-uae.vercel.app',
  20: 'https://dubai-wheel-dr-uae.vercel.app',
  21: 'https://black-moon-uae.vercel.app',
  22: 'https://f10-luxury-uae.vercel.app',
  23: 'https://veloce-dubai-uae.vercel.app',
  24: 'https://irc-uae.vercel.app',
  25: 'https://gulf-tiger-uae.vercel.app',
  26: 'https://abu-dhabi-with-uae.vercel.app',
  27: 'https://road-king-mzj-uae.vercel.app',
  28: 'https://shift-shams-bo-uae.vercel.app',
  29: 'https://auto-plus-abu-uae.vercel.app',
  30: 'https://harakat-uae.vercel.app'
};

for (const [id, url] of Object.entries(rahulAliases)) {
  if (db[id]) {
    db[id].liveUrl = url;
  }
}

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

function checkUrl(url) {
  return new Promise(resolve => {
    try {
      const req = https.get(url, { timeout: 6000 }, res => {
        resolve({ code: res.statusCode, ok: res.statusCode === 200 });
      });
      req.on('error', err => resolve({ code: 0, ok: false, err: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ code: 0, ok: false, err: 'TIMEOUT' }); });
    } catch(e) { resolve({ code: 0, ok: false, err: e.message }); }
  });
}

async function verifyAll60() {
  console.log('FINAL VERIFICATION OF ALL 60 WEBSITES ACROSS RAHUL & HET...\n');
  let pass = 0;
  let fail = 0;

  for (let i = 1; i <= 60; i++) {
    const s = db[i];
    const role = i <= 30 ? 'RAHUL' : 'HET';
    const res = await checkUrl(s.liveUrl);
    if (res.ok) {
      console.log(`✅ [${role}] #${String(i).padStart(2, '0')}: [HTTP ${res.code}] ${s.name} -> ${s.liveUrl}`);
      pass++;
    } else {
      console.log(`❌ [${role}] #${String(i).padStart(2, '0')}: [HTTP ${res.code}] ${s.name} -> ${s.liveUrl}`);
      fail++;
    }
  }

  console.log('\n========================================');
  console.log(`FINAL RESULT: ${pass} / 60 WORKING (HTTP 200 OK)`);
  console.log(`Failed: ${fail} / 60`);
  console.log('========================================');
}

verifyAll60();
