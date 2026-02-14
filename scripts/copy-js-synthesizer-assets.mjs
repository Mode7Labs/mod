import { mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcRoot = path.join(rootDir, 'node_modules', 'js-synthesizer');
const destRoot = path.join(rootDir, 'packages', 'demo', 'public', 'js-synthesizer');

const assets = [
  path.join(srcRoot, 'dist', 'js-synthesizer.js'),
  path.join(srcRoot, 'dist', 'js-synthesizer.worklet.js'),
  path.join(srcRoot, 'externals', 'libfluidsynth-2.4.6.js'),
];

const copyAssets = async () => {
  await mkdir(destRoot, { recursive: true });
  for (const asset of assets) {
    if (!existsSync(asset)) {
      console.warn(`[js-synthesizer] Missing asset: ${asset}`);
      continue;
    }
    const dest = path.join(destRoot, path.basename(asset));
    await copyFile(asset, dest);
  }
};

copyAssets().catch((err) => {
  console.error('[js-synthesizer] Failed to copy assets', err);
  process.exitCode = 1;
});
