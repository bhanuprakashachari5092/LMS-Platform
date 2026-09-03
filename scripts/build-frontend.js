const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Determine root directory and frontend directory safely
const cwd = process.cwd();
const rootDir = fs.existsSync(path.join(cwd, 'frontend')) ? cwd : path.resolve(cwd, '..');
const frontendDir = path.join(rootDir, 'frontend');

console.log('[VERCEL-BUILD] Root directory:', rootDir);
console.log('[VERCEL-BUILD] Frontend directory:', frontendDir);

if (!fs.existsSync(frontendDir)) {
  console.error('[VERCEL-BUILD] ERROR: Frontend directory not found at:', frontendDir);
  process.exit(1);
}

try {
  // Execute vite build inside frontend directory
  console.log('[VERCEL-BUILD] Starting Vite build...');
  execSync('npx vite build', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });
  console.log('[VERCEL-BUILD] Vite build completed successfully.');

  // Sync dist to multiple expected locations to guarantee Vercel finds it
  const frontendDist = path.join(frontendDir, 'dist');
  if (fs.existsSync(frontendDist)) {
    const rootDist = path.join(rootDir, 'dist');
    const rootPublic = path.join(rootDir, 'public');

    try {
      fs.cpSync(frontendDist, rootDist, { recursive: true, force: true });
      fs.cpSync(frontendDist, rootPublic, { recursive: true, force: true });
      console.log('[VERCEL-BUILD] Successfully mirrored dist to root/dist and root/public');
    } catch (copyErr) {
      console.warn('[VERCEL-BUILD] Mirror warning (non-fatal):', copyErr.message);
    }
  }

  console.log('[VERCEL-BUILD] Build process completed.');
} catch (err) {
  console.error('[VERCEL-BUILD] Build failed:', err.message);
  process.exit(1);
}
