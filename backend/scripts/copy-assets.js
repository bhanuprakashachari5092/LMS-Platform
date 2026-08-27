const fs = require('fs');
const path = require('path');

const srcAssets = path.join(__dirname, '../src/assets');
const destAssets = path.join(__dirname, '../dist/assets');

if (fs.existsSync(srcAssets)) {
  fs.cpSync(srcAssets, destAssets, { recursive: true });
  console.log('[BUILD] Copied assets to dist/assets successfully.');
}
