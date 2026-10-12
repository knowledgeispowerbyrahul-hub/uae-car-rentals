const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const WORKSPACE = path.resolve(__dirname);
const GITHUB_USER = 'knowledgeispowerbyrahul-hub';

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

console.log(`Loaded ${allSites.length} exact sites.`);

// Fetch existing repos
const existingRepos = new Set();
try {
  const repoListRaw = execSync(`gh repo list ${GITHUB_USER} --limit 200 --json name -q ".[].name"`, { stdio: 'pipe' }).toString();
  repoListRaw.trim().split('\n').filter(Boolean).forEach(r => existingRepos.add(r.trim()));
} catch (e) {
  console.error("Could not fetch repo list:", e.message);
}

console.log(`Currently on GitHub: ${existingRepos.size} repos.`);

const startNum = parseInt(process.argv[2] || '1', 10);
const endNum = parseInt(process.argv[3] || '100', 10);

console.log(`Targeting sites #${startNum} to #${endNum}...`);

for (let i = startNum - 1; i < endNum && i < allSites.length; i++) {
  const site = allSites[i];
  const siteDir = path.join(WORKSPACE, site.folder);

  if (!fs.existsSync(siteDir)) {
    console.error(`Folder missing: ${site.folder}`);
    continue;
  }

  console.log(`\n========================================`);
  console.log(`[${site.id}/100] ${site.name} -> ${site.folder}`);
  console.log(`========================================`);

  try {
    // 1. git init if needed
    const gitDir = path.join(siteDir, '.git');
    if (!fs.existsSync(gitDir)) {
      execSync('git init -b main', { cwd: siteDir, stdio: 'pipe' });
      execSync(`git config user.name "${GITHUB_USER}"`, { cwd: siteDir, stdio: 'pipe' });
      execSync(`git config user.email "341474264+${GITHUB_USER}@users.noreply.github.com"`, { cwd: siteDir, stdio: 'pipe' });
    }

    // 2. .gitignore
    fs.writeFileSync(path.join(siteDir, '.gitignore'), '.DS_Store\nnode_modules\n.vercel\n');

    // 3. Stage & Commit
    execSync('git add -A', { cwd: siteDir, stdio: 'pipe' });
    try {
      execSync(`git commit -m "Initial release: ${site.name} standalone website"`, { cwd: siteDir, stdio: 'pipe' });
    } catch (e) {}

    // 4. Create repo if needed
    if (!existingRepos.has(site.folder)) {
      console.log(`Creating GitHub repo: ${GITHUB_USER}/${site.folder}...`);
      try {
        execSync(`gh repo create ${GITHUB_USER}/${site.folder} --public`, { cwd: siteDir, stdio: 'pipe' });
        existingRepos.add(site.folder);
        execSync('sleep 1.5');
      } catch (err) {}
    } else {
      console.log(`Repo already exists on GitHub.`);
    }

    // 5. Remote and push
    try {
      execSync(`git remote remove origin`, { cwd: siteDir, stdio: 'pipe' });
    } catch(e) {}
    execSync(`git remote add origin https://github.com/${GITHUB_USER}/${site.folder}.git`, { cwd: siteDir, stdio: 'pipe' });

    console.log(`Pushing main branch...`);
    execSync(`git push -u origin main --force`, { cwd: siteDir, stdio: 'pipe' });

    console.log(`✅ LIVE ON GITHUB: https://github.com/${GITHUB_USER}/${site.folder}`);
  } catch (err) {
    console.error(`❌ Error on ${site.folder}:`, err.message);
  }
}

console.log('\nPass completed!');
