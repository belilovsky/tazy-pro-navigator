import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const outDir = 'dist/tazy-pro-navigator';
const files = [
  'index.html',
  'styles.css',
  'manifest.webmanifest',
  'src',
  'assets'
];

await rm(outDir, { force: true, recursive: true });
await mkdir(outDir, { recursive: true });

for (const file of files) {
  await cp(file, join(outDir, file), { recursive: true });
}

await writeFile(
  join(outDir, 'robots.txt'),
  [
    'User-agent: *',
    'Disallow: /',
    ''
  ].join('\n')
);

console.log(`build-static: ${outDir}`);
