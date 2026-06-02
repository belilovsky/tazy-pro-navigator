const target = process.env.TAZY_NAVIGATOR_URL ?? 'http://127.0.0.1:4181/';
const playwrightModule = process.env.PLAYWRIGHT_MODULE ?? 'playwright';
const widths = (process.env.SMOKE_WIDTHS ?? '375,390,768,1024,1440,1920')
  .split(',')
  .map((item) => Number(item.trim()))
  .filter(Boolean);

let imported;
try {
  imported = await import(playwrightModule);
} catch (error) {
  throw new Error(
    `Playwright is not available. Set PLAYWRIGHT_MODULE to an importable module or absolute index.js path.\n${error.message}`
  );
}

const playwright = imported.default ?? imported;
const browser = await playwright.chromium.launch({ headless: true });
const results = [];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(target, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `/tmp/tazy-pro-navigator-${width}.png`, fullPage: false });

  await page.locator('[data-stage="stage2"]').click();
  await page.locator('[data-module="M4"]').first().click();
  await page.locator('[data-audience="bank"]').click();

  let financeNavTop = null;
  if (width <= 390) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('[data-nav-link="finance"]').click();
    await page.waitForTimeout(150);
    financeNavTop = await page.evaluate(() =>
      Math.round(document.querySelector('#finance')?.getBoundingClientRect().top ?? -1)
    );
  }

  await page.locator('#finance').scrollIntoViewIfNeeded();
  await page.locator('[data-finance-preset="upside"]').evaluate((element) => element.click());
  await page.locator('#carcasses').evaluate((element) => {
    element.value = 28;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });

  const metrics = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    audience: document.querySelector('#audienceSummary')?.textContent,
    moduleTitle: document.querySelector('#moduleDetail h3')?.textContent,
    modulePreview: document.querySelector('#chainModulePreview strong')?.textContent,
    activePreset: document.querySelector('[data-finance-preset].is-active strong')?.textContent,
    capexCard: document.querySelector('#scenarioCards .scenario-card strong')?.textContent,
    stage: document.querySelector('#chainMap')?.dataset.stage,
    stageActive: document.querySelector('[data-stage-control="true"][aria-pressed="true"]')?.dataset.stage || null,
    chainChipCount: document.querySelectorAll('.chain-chip').length,
    activeChainChips: Array.from(document.querySelectorAll('.chain-chip.is-active')).map((item) => item.dataset.module),
    activeHotspot: document.querySelector('.hotspot.is-active')?.dataset.module || null,
    chainReferenceOpen: document.querySelector('.reference-toggle')?.open || false,
    moduleCount: document.querySelectorAll('.chain-chip').length,
    h1Count: document.querySelectorAll('h1').length,
    navActive: document.querySelectorAll('[data-nav-link].is-active').length
  }));
  metrics.financeNavTop = financeNavTop;

  results.push({ width, errors, metrics });
  await page.close();
}

await browser.close();

const failed = results.some((item) =>
  item.errors.length ||
  item.metrics.overflow ||
  item.metrics.navActive !== 1 ||
  item.metrics.h1Count !== 1 ||
  (item.width <= 390 && (item.metrics.financeNavTop === null || item.metrics.financeNavTop > 120)) ||
  item.metrics.stageActive !== 'stage2' ||
  !item.metrics.activeChainChips.includes('M4') ||
  item.metrics.chainChipCount === 0
);
console.log(JSON.stringify(results, null, 2));

if (failed) {
  throw new Error('Browser smoke failed');
}
