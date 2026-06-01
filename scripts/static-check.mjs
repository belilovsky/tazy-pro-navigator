import { access } from 'node:fs/promises';
import {
  documents,
  engineeringSystems,
  financeDefaults,
  gates,
  modules,
  navigation,
  products,
  stageTabs
} from '../src/data.js';

const requiredAssets = [
  'manifest.webmanifest',
  'assets/drafts/factory-cutaway.png',
  'assets/drafts/production-chain.png',
  'assets/drafts/engineering-plan.png',
  'assets/drafts/dashboard-overview.png'
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
if (products.length !== 4) errors.push('Product architecture should expose four core lines');
if (documents.length !== 10) errors.push('Document room should keep 10 folders from the brief');
if (gates.length < 5) errors.push('Financing gates are incomplete');

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
