const { execSync } = require('child_process');
const path = require('path');

const dest = path.join(__dirname, '..', 'public', 'logo.png');
const url = 'https://i.imgur.com/VHCRCEn.png';

try {
  execSync(`curl -L ${url} -o "${dest}"`, { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to download logo:', err);
}
