const fs = require('fs');
const path = require('path');
const os = require('os');

const homeDir = os.homedir();
const zebarBaseDir = path.join(homeDir, '.glzr', 'zebar');
const targetPackDir = path.join(zebarBaseDir, 'packs', 'nord');
const projectDir = __dirname;

console.log(`Deploying Nordic Frosted Glass Zebar pack to: ${targetPackDir}`);

// Ensure target directory exists
if (!fs.existsSync(targetPackDir)) {
  fs.mkdirSync(targetPackDir, { recursive: true });
}

// 1. Copy zpack.json
const zpackSource = path.join(projectDir, 'zpack.json');
const zpackTarget = path.join(targetPackDir, 'zpack.json');
fs.copyFileSync(zpackSource, zpackTarget);
console.log('Copied zpack.json');

// 2. Copy entire dist directory recursively (glazewm, komorebi, vanilla)
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const distSource = path.join(projectDir, 'dist');
const distTarget = path.join(targetPackDir, 'dist');
copyDirRecursive(distSource, distTarget);
console.log('Copied all dist variants successfully.');

// 3. Copy resources if present (preview images)
const resourcesSource = path.join(projectDir, 'resources');
const resourcesTarget = path.join(targetPackDir, 'resources');
if (fs.existsSync(resourcesSource)) {
  copyDirRecursive(resourcesSource, resourcesTarget);
  console.log('Copied resources successfully.');
}

// 4. Ensure top-level ~/.glzr/zebar/nord and packs/quangbhdang.nord exist for compatibility
const directPackDir = path.join(zebarBaseDir, 'nord');
if (!fs.existsSync(directPackDir)) {
  try {
    fs.symlinkSync(targetPackDir, directPackDir, 'junction');
    console.log('Created junction ~/.glzr/zebar/nord');
  } catch {
    copyDirRecursive(targetPackDir, directPackDir);
  }
}

const quangbhdangDir = path.join(zebarBaseDir, 'packs', 'quangbhdang.nord');
if (!fs.existsSync(quangbhdangDir)) {
  try {
    fs.symlinkSync(targetPackDir, quangbhdangDir, 'junction');
    console.log('Created junction ~/.glzr/zebar/packs/quangbhdang.nord');
  } catch {
    copyDirRecursive(targetPackDir, quangbhdangDir);
  }
}

console.log('Deployment complete!');
