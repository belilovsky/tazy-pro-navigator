import { access, readFile, stat } from 'node:fs/promises';
import {
  audiences,
  complianceLanes,
  coreKpis,
  documents,
  engineeringSystems,
  financeDefaults,
  financePresets,
  fundingStack,
  gates,
  criticalPath,
  dealBreakers,
  marketSignals,
  markets,
  modules,
  navigation,
  products,
  qualityTrace,
  readinessLanes,
  siteConstraints,
  stageTabs
} from '../src/data.js';

const requiredAssets = [
  'manifest.webmanifest',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/generated/overview-og.jpg',
  'assets/generated/factory-cutaway.webp',
  'assets/generated/production-chain.webp',
  'assets/generated/engineering-plan.webp',
  'assets/generated/overview-hero.webp',
  'assets/generated/market-access.webp',
  'assets/generated/product-lineup.webp',
  'assets/generated/quality-passport.webp',
  'assets/generated/data-room.webp'
];

const errors = [];
const moduleIds = new Set(modules.map((item) => item.id));
const releaseToken = '20260613-nav2';
const indexHtml = await readFile('index.html', 'utf8');
const appJs = await readFile('src/app.js', 'utf8');

for (const stage of stageTabs) {
  for (const id of stage.modules) {
    if (!moduleIds.has(id)) {
      errors.push(`Stage ${stage.id} references missing module ${id}`);
    }
  }
}

for (const item of modules) {
  if (!Array.isArray(item.position) || item.position.length !== 2) {
    errors.push(`Module ${item.id} has invalid position`);
  }
  if (!item.equipment.length || !item.utilities.length || !item.controls.length) {
    errors.push(`Module ${item.id} has incomplete engineering card`);
  }
}

for (const system of engineeringSystems) {
  if (!/^P\d+$/.test(system.id)) {
    errors.push(`Engineering point ${system.id} does not match P-number convention`);
  }
}

for (const [key, value] of Object.entries(financeDefaults)) {
  if (!Number.isFinite(value) || value <= 0) {
    errors.push(`Finance default ${key} must be positive number`);
  }
}

if (navigation.length < 10) errors.push('Navigation should cover the full navigator surface');
if (new Set(navigation.map(([id]) => id)).size !== navigation.length) {
  errors.push('Navigation contains duplicate section ids');
}
if (audiences.length < 5) errors.push('Audience modes should cover investor, bank, akimat, projector and science');
if (coreKpis.length < 6) errors.push('Core KPIs should expose capex, first ask, revenue, EBITDA, payback and DSCR');
if (products.length !== 4) errors.push('Product architecture should expose four core lines');
if (documents.length !== 10) errors.push('Document room should keep 10 folders from the brief');
if (gates.length < 5) errors.push('Financing gates are incomplete');
if (markets.length < 4) errors.push('Market map should cover Kazakhstan, EAEU, China and GCC/Iran lanes');
if (marketSignals.length !== 4) errors.push('Market evidence should keep four compact signal cards');
if (complianceLanes.length !== 4) errors.push('Compliance lanes should cover EAEU/Russia, China, GCC/Iran and laboratory readiness');
if (readinessLanes.length !== 4) errors.push('Readiness lanes should cover team, OPEX, calendar and competitors');
if (siteConstraints.length !== 3) errors.push('Site constraints should cover site height/expansion, ecology/SZZ and permits');
if (!modules.some((item) => item.id === 'M15')) errors.push('Module map should include M15 office and sanitary support block');
if (dealBreakers.filter((item) => item.severity === 'critical').length < 2) {
  errors.push('Deal-breakers should keep at least two critical items');
}
if (criticalPath.length !== 8 || !criticalPath.every((item, index) => item.id === `G${index}`)) {
  errors.push('Critical path should keep ordered G0-G7 gates');
}
if (qualityTrace.length < 5) errors.push('Quality trace should show the end-to-end batch path');
if (financePresets.length < 3) errors.push('Finance presets should include conservative/base/upside');
if (fundingStack.length < 4) errors.push('Funding stack should include tranche, CAPEX, Damu/leasing and innovation lanes');
if (coreKpis.find((item) => item.id === 'revenue')?.value !== 321) {
  errors.push('Base revenue KPI should stay aligned to 321 mln KZT');
}
if (coreKpis.find((item) => item.id === 'ebitda')?.value !== 46) {
  errors.push('Base EBITDA KPI should stay aligned to 46 mln KZT');
}
if (coreKpis.find((item) => item.id === 'payback')?.value !== '3,3–3,8') {
  errors.push('Base payback KPI should stay aligned to 3.3-3.8 years corridor');
}

for (const asset of requiredAssets) {
  try {
    await access(asset);
  } catch {
    errors.push(`Missing asset: ${asset}`);
  }
}

if (!indexHtml.includes(`./styles.css?v=${releaseToken}`)) {
  errors.push(`index.html should cache-bust styles.css with ${releaseToken}`);
}
if (!indexHtml.includes(`./src/app.js?v=${releaseToken}`)) {
  errors.push(`index.html should cache-bust app.js with ${releaseToken}`);
}
if (!appJs.includes(`./data.js?v=${releaseToken}`)) {
  errors.push(`src/app.js should cache-bust data.js with ${releaseToken}`);
}
if (!indexHtml.includes('https://tazy.pro/assets/generated/overview-og.jpg')) {
  errors.push('index.html should use the optimized overview-og.jpg for Open Graph');
}
if (!indexHtml.includes('<meta name="robots" content="index, follow">')) {
  errors.push('index.html should stay publicly indexable for the tazy.pro domain');
}
if (!indexHtml.includes('property="og:image:width" content="1200"')) {
  errors.push('index.html should expose Open Graph image width');
}
if (!indexHtml.includes('name="twitter:card" content="summary_large_image"')) {
  errors.push('index.html should expose Twitter/X large summary card metadata');
}
if (!indexHtml.includes('rel="apple-touch-icon" href="./assets/icons/apple-touch-icon.png"')) {
  errors.push('index.html should expose an Apple touch icon');
}
if (!indexHtml.includes('<link rel="manifest" href="./manifest.webmanifest">')) {
  errors.push('index.html should link the web manifest');
}
const manifestJson = JSON.parse(await readFile('manifest.webmanifest', 'utf8'));
const iconSizes = new Set((manifestJson.icons ?? []).map((icon) => icon.sizes));
if (!iconSizes.has('192x192') || !iconSizes.has('512x512')) {
  errors.push('manifest should expose 192x192 and 512x512 PNG icons');
}
const ogImageStats = await stat('assets/generated/overview-og.jpg');
if (ogImageStats.size > 350 * 1024) {
  errors.push('Open Graph image should stay below 350 KB');
}

if (errors.length) {
  throw new Error(`Static check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

console.log('static-check: ok');
