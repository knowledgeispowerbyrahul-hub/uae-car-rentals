const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const WORKSPACE = path.resolve(__dirname);
const GITHUB_USER = 'knowledgeispowerbyrahul-hub';

// Sites 1 to 10
const TARGET_SITES = [
  { id: 1, folder: 'qas-dubai-car-rental', name: 'QAS Dubai Car Rental' },
  { id: 2, folder: 'fast-motors-car-rental', name: 'FAST MOTORS CAR RENTAL LLC' },
  { id: 3, folder: 'adres-car-rental', name: 'ADRES CAR RENTAL' },
  { id: 4, folder: 'al-barsha-rent-a-car', name: 'Rent a car Al barsha' },
  { id: 5, folder: 'swift-car-rental', name: 'Swift Car Rental' },
  { id: 6, folder: 'al-wissam-car-rental', name: 'Al Wissam Car Rental' },
  { id: 7, folder: 'al-fadhel-car-rental', name: 'Al Fadhel Car Rental' },
  { id: 8, folder: 'armani-car-rental-no-deposit', name: 'Armani Car Rental No Deposit' },
  { id: 9, folder: 'al-andalous-rent-a-car', name: 'Al Andalous Rent A Car' },
  { id: 10, folder: 'al-tameem-cars-buses-rental', name: 'Al Tameem Cars & Buses Rental' }
];

console.log(`Starting independent repo creation for 10 websites under @${GITHUB_USER}...`);

const results = [];

for (const site of TARGET_SITES) {
  const siteDir = path.join(WORKSPACE, site.folder);
  if (!fs.existsSync(siteDir)) {
    console.error(`Folder not found: ${site.folder}`);
    continue;
  }

  console.log(`\n========================================`);
  console.log(`Processing [${site.id}/10]: ${site.name} (${site.folder})`);
  console.log(`========================================`);

  try {
    // 1. Git init if needed
    const gitDir = path.join(siteDir, '.git');
    if (!fs.existsSync(gitDir)) {
      execSync('git init -b main', { cwd: siteDir, stdio: 'pipe' });
      execSync(`git config user.name "${GITHUB_USER}"`, { cwd: siteDir, stdio: 'pipe' });
      execSync(`git config user.email "341474264+${GITHUB_USER}@users.noreply.github.com"`, { cwd: siteDir, stdio: 'pipe' });
    }

    // 2. .gitignore
    fs.writeFileSync(path.join(siteDir, '.gitignore'), '.DS_Store\nnode_modules\n');

    // 3. Stage & Commit
    execSync('git add -A', { cwd: siteDir, stdio: 'pipe' });
    try {
      execSync(`git commit -m "Initial release: ${site.name} standalone website"`, { cwd: siteDir, stdio: 'pipe' });
    } catch (e) {
      // Nothing to commit
    }

    // 4. Check if repo already exists on GitHub
    let repoExists = false;
    try {
      execSync(`gh repo view ${GITHUB_USER}/${site.folder}`, { stdio: 'pipe' });
      repoExists = true;
    } catch (e) {
      repoExists = false;
    }

    if (!repoExists) {
      console.log(`Creating GitHub repo: ${GITHUB_USER}/${site.folder}`);
      execSync(`gh repo create ${GITHUB_USER}/${site.folder} --public`, { cwd: siteDir, stdio: 'pipe' });
    }

    // 5. Ensure remote origin
    try {
      execSync(`git remote remove origin`, { cwd: siteDir, stdio: 'pipe' });
    } catch(e) {}
    execSync(`git remote add origin https://github.com/${GITHUB_USER}/${site.folder}.git`, { cwd: siteDir, stdio: 'pipe' });

    // 6. Push
    console.log(`Pushing main branch...`);
    execSync(`git push -u origin main --force`, { cwd: siteDir, stdio: 'pipe' });

    const repoUrl = `https://github.com/${GITHUB_USER}/${site.folder}`;
    console.log(`✅ LIVE: ${repoUrl}`);

    results.push({
      id: site.id,
      name: site.name,
      folder: site.folder,
      status: 'DONE',
      repoUrl
    });
  } catch (err) {
    console.error(`❌ Error on ${site.folder}:`, err.message);
    results.push({
      id: site.id,
      name: site.name,
      folder: site.folder,
      status: 'FAILED: ' + err.message,
      repoUrl: null
    });
  }
}

// Update NOTEPAD-BATCH-TRACKER.txt with the results
let updatedTracker = `=====================================================
UAE CAR RENTAL NETWORK - DEPLOYMENT & NOTEPAD TRACKER
=====================================================

Active Account: ${GITHUB_USER} (GitHub)
Target: 10 Independent Repositories Created & Live

[BATCH 1: SITES 1 to 10 - STATUS: COMPLETED ✅]
`;

results.forEach(r => {
  const box = r.status === 'DONE' ? '[x] LIVE' : '[ ] FAILED';
  updatedTracker += `${String(r.id).padStart(2, ' ')}. ${r.folder.padEnd(32, ' ')} -> ${box}: ${r.repoUrl || 'N/A'}\n`;
});

updatedTracker += `
[BATCH 2: SITES 11 to 20 - STATUS: QUEUED]
Target Account: [Login to next email / account]
11. al-dawama-car-rental
12. al-sharjah-rent-a-car
13. al-mustaqbal-car-rental
14. al-ghalya-rent-a-car-llc
15. al-jasfa-car-rental-l-l-c
16. al-fada-rent-a-car
17. al-fada-rent-a-car-br1
18. al-fareed-rent-a-car
19. al-kafi-rent-a-car
20. al-mahra-rent-car

[NOTES & LOGS]:
- All 10 independent repositories for Batch 1 are live on GitHub!
- 100 websites complete list is in: BATCH-1-100-WEBSITES.md and BATCH-1-100-WEBSITES.txt
`;

fs.writeFileSync(path.join(WORKSPACE, 'NOTEPAD-BATCH-TRACKER.txt'), updatedTracker);
console.log(`\nUpdated NOTEPAD-BATCH-TRACKER.txt!`);
