import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const outDir = 'dist/tazy-pro-navigator';
const files = [
  'index.html',
  'styles.css',
  'favicon.svg',
  'manifest.webmanifest',
  'assets/icons',
  'fonts',
  'src'
];

const generatedAssets = [
  'overview-og.jpg',
  'factory-cutaway.webp',
  'production-chain.webp',
  'engineering-plan.webp',
  'overview-hero.webp',
  'market-access.webp',
  'product-lineup.webp',
  'quality-passport.webp',
  'data-room.webp'
];

await rm(outDir, { force: true, recursive: true });
await mkdir(outDir, { recursive: true });

for (const file of files) {
  await cp(file, join(outDir, file), { recursive: true });
}

await mkdir(join(outDir, 'assets/generated'), { recursive: true });
for (const asset of generatedAssets) {
  await cp(join('assets/generated', asset), join(outDir, 'assets/generated', asset));
}

await writeFile(
  join(outDir, 'robots.txt'),
  [
    'User-agent: *',
    'Allow: /',
    '',
    'Sitemap: https://tazy.pro/sitemap.xml',
    ''
  ].join('\n')
);

await writeFile(
  join(outDir, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url><loc>https://tazy.pro/</loc></url>',
    '</urlset>',
    ''
  ].join('\n')
);

console.log(`build-static: ${outDir}`);
