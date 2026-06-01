import { access } from 'node:fs/promises';
import {
  audiences,
  documents,
  engineeringSystems,
  financeDefaults,
  financePresets,
  fundingStack,
  gates,
  criticalPath,
  dealBreakers,
  markets,
  modules,
  navigation,
  products,
  qualityTrace,
  stageTabs
} from '../src/data.js';

const requiredAssets = [
  'manifest.webmanifest',
  'assets/generated/factory-cutaway.png',
  'assets/generated/production-chain.png',
  'assets/generated/engineering-plan.png',
  'assets/generated/overview-hero.png'
];

const errors = [];
const moduleIds = new Set(modules.map((item) => item.id));

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
if (products.length !== 4) errors.push('Product architecture should expose four core lines');
if (documents.length !== 10) errors.push('Document room should keep 10 folders from the brief');
if (gates.length < 5) errors.push('Financing gates are incomplete');
if (markets.length < 4) errors.push('Market map should cover Kazakhstan, EAEU, China and GCC/Iran lanes');
if (dealBreakers.filter((item) => item.severity === 'critical').length < 2) {
  errors.push('Deal-breakers should keep at least two critical items');
}
if (criticalPath.length !== 8 || !criticalPath.every((item, index) => item.id === `G${index}`)) {
  errors.push('Critical path should keep ordered G0-G7 gates');
}
if (qualityTrace.length < 5) errors.push('Quality trace should show the end-to-end batch path');
if (financePresets.length < 3) errors.push('Finance presets should include conservative/base/upside');
if (fundingStack.length < 4) errors.push('Funding stack should include tranche, CAPEX, Damu/leasing and innovation lanes');

for (const asset of requiredAssets) {
  try {
    await access(asset);
  } catch {
    errors.push(`Missing asset: ${asset}`);
  }
}

if (errors.length) {
  throw new Error(`Static check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

console.log('static-check: ok');
