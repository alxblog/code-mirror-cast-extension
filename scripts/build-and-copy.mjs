import { exec } from 'child_process';
import { promisify } from 'util';
import { rm, cp } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const root = new URL('..', import.meta.url).pathname;
const frontendPath = path.join(root, 'frontend');
const extensionPublicPath = path.join(root, 'extension', 'out', 'public');

async function buildFrontend() {
  console.log('🛠️  Build frontend...');
  await execAsync('npm run build', { cwd: frontendPath });
}

async function copyFrontendDist() {
  console.log('📁 Copy frontend dist to extension/public...');
  await rm(extensionPublicPath, { recursive: true, force: true });
  await cp(path.join(frontendPath, 'dist'), extensionPublicPath, {
    recursive: true
  });
}

await buildFrontend();
await copyFrontendDist();
console.log('✅ Done!');
