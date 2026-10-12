const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'deployed-sites.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

const cleanMap = {
  42: { liveUrl: 'https://aerocar-mu.vercel.app', shortName: 'aerocar' },
  43: { liveUrl: 'https://fantazya-eta.vercel.app', shortName: 'fantazya' },
  44: { liveUrl: 'https://spectre-khaki-three.vercel.app', shortName: 'spectre' },
  45: { liveUrl: 'https://al-shayea-fawn.vercel.app', shortName: 'al-shayea' },
  46: { liveUrl: 'https://afamia-dusky.vercel.app', shortName: 'afamia' },
  47: { liveUrl: 'https://alyah-kappa.vercel.app', shortName: 'alyah' },
  48: { liveUrl: 'https://tilal-al-emarat-gray.vercel.app', shortName: 'tilal-al-emarat' },
  49: { liveUrl: 'https://arkan-gray.vercel.app', shortName: 'arkan' },
  50: { liveUrl: 'https://for-you-self-three.vercel.app', shortName: 'for-you' },
  51: { liveUrl: 'https://al-fada.vercel.app', shortName: 'al-fada' },
  52: { liveUrl: 'https://tiger-woad.vercel.app', shortName: 'tiger' },
  53: { liveUrl: 'https://al-sharjah.vercel.app', shortName: 'al-sharjah' },
  54: { liveUrl: 'https://sunasco.vercel.app', shortName: 'sunasco' },
  55: { liveUrl: 'https://aldalil-phi.vercel.app', shortName: 'aldalil' },
  56: { liveUrl: 'https://atlantic-iota.vercel.app', shortName: 'atlantic' },
  57: { liveUrl: 'https://al-fareed.vercel.app', shortName: 'al-fareed' },
  58: { liveUrl: 'https://perfect-pied.vercel.app', shortName: 'perfect' },
  59: { liveUrl: 'https://al-mahra-six.vercel.app', shortName: 'al-mahra' },
  60: { liveUrl: 'https://golden-cup-flax.vercel.app', shortName: 'golden-cup' }
};

for (const [id, data] of Object.entries(cleanMap)) {
  if (db[id]) {
    db[id].liveUrl = data.liveUrl;
    if (data.shortName) db[id].shortName = data.shortName;
  }
}

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
console.log('Successfully updated sites 42-60 with clean production URLs in deployed-sites.json');
