import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const outDir = 'dist/tazy-pro-navigator';
const files = [
  'index.html',
  'styles.css',
  'favicon.svg',
  'manifest.webmanifest',
  'fonts',
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
  process.env.TAZY_ROBOTS === 'public'
    ? [
      'User-agent: *',
      'Allow: /',
      '',
      'Sitemap: https://tazy.pro/sitemap.xml',
      ''
    ].join('\n')
    : [
      'User-agent: *',
      'Disallow: /',
      ''
    ].join('\n')
);

if (process.env.TAZY_ROBOTS === 'public') {
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
}

console.log(`build-static: ${outDir}`);
