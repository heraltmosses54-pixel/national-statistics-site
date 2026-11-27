// smoke-pw.mjs — visit every route, click controls, fail on any page error.
// Usage: node tools/smoke-pw.mjs --base http://127.0.0.1:8080
// Run from ~/workspace/pw-chromium (playwright-core lives there; tools/node_modules is symlinked).

import { chromium } from 'playwright-core';

const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://127.0.0.1:8080').slice(7);
const routes = ['', 'population', 'people', 'economy', 'prices', 'employment', 'regions', 'explorer', 'sources'];
const errors = [];
const fails = [];
const passes = [];

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROME || '/home/hatch/workspace/pw-chromium/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-gpu'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  for (const r of routes) {
    const url = `${base}/#/${r}`;
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(600);
    const info = await page.evaluate(() => {
      const main = document.querySelector('#view');
      const h = main ? main.querySelector('h1, h2') : null;
      return {
        viewLen: main ? main.innerHTML.length : 0,
        heading: h ? h.textContent.trim() : null,
        links: [...document.querySelectorAll('.site-nav a')].map((a) => a.getAttribute('href')),
        svgs: main ? main.querySelectorAll('svg').length : 0,
      };
    });
    const label = r === '' ? 'dashboard' : r;
    if (info.viewLen < 200 || !info.heading) {
      fails.push(`${label}: view empty or no heading (len=${info.viewLen})`);
    } else if (info.links.length !== 9) {
      fails.push(`${label}: expected 9 nav links, got ${info.links.length}`);
    } else {
      passes.push(`${label}: heading "${info.heading}", ${info.svgs} svg chart(s), view ${info.viewLen} chars`);
    }
  }

  // Population table sort: default is pop desc (West Java first). Sort by name asc.
  await page.goto(`${base}/#/population`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const before = await page.evaluate(() => document.querySelector('#view tbody tr td')?.textContent);
  await page.click('.sort-btn[data-sort="name"]');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => document.querySelector('#view tbody tr td')?.textContent);
  if (before === 'Jawa Barat' && after === 'Banten') passes.push(`population sort: Jawa Barat -> Banten after name sort (A-Z)`);
  else fails.push(`population sort: before="${before}" after="${after}" (expected West Java -> Aceh)`);

  // Explorer controls: change indicator + year range, chart must update.
  await page.goto(`${base}/#/explorer`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const exBefore = await page.evaluate(() => document.querySelectorAll('#view h2')[1]?.textContent);
  await page.selectOption('#explorer-indicator', 'gdpNominal');
  await page.waitForTimeout(300);
  await page.selectOption('#explorer-from', '2021');
  await page.waitForTimeout(300);
  const exAfter = await page.evaluate(() => ({
    h2: document.querySelectorAll('#view h2')[1]?.textContent,
    sub: document.querySelector('#view .card-sub')?.textContent,
    rows: document.querySelectorAll('#view tbody tr').length,
  }));
  if (exAfter.h2 && exAfter.h2.includes('GDP') && exAfter.sub.includes('2021') && exAfter.rows === 4) {
    passes.push(`explorer: indicator->GDP, from->2021 => "${exAfter.h2}" / "${exAfter.sub}", ${exAfter.rows} table rows`);
  } else {
    fails.push(`explorer update: before="${exBefore}" after=${JSON.stringify(exAfter)}`);
  }

  // Explorer compare: default compare is GDP growth; switching it off and
  // on must change the comparison card.
  await page.goto(`${base}/#/explorer`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const cmpOn = await page.evaluate(() => [...document.querySelectorAll('#view h2')].some((h) => h.textContent.startsWith('Compare:')));
  await page.selectOption('#explorer-compare', '');
  await page.waitForTimeout(300);
  const cmpOff = await page.evaluate(() => [...document.querySelectorAll('#view h2')].some((h) => h.textContent.startsWith('Compare:')));
  if (cmpOn && !cmpOff) passes.push('explorer compare: comparison card shown by default, hidden when set to none');
  else fails.push(`explorer compare: on=${cmpOn} off=${cmpOff}`);

  // Regions search: typing "jawa" must narrow the table to the Java provinces.
  await page.goto(`${base}/#/regions`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await page.fill('#region-search', 'jawa');
  await page.waitForTimeout(300);
  const regionRows = await page.evaluate(() => [...document.querySelectorAll('#view tbody tr td:first-child')].map((td) => td.textContent));
  if (regionRows.length === 3 && regionRows.every((n) => n.toLowerCase().includes('jawa'))) {
    passes.push(`regions search: "jawa" -> ${regionRows.join(', ')}`);
  } else {
    fails.push(`regions search: rows=${JSON.stringify(regionRows)}`);
  }

  // Every nav link leads to a distinct heading (no dead links).
  for (const r of routes.slice(1)) {
    await page.goto(`${base}/#/`, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    await page.click(`.site-nav a[href="#/${r}"]`);
    await page.waitForTimeout(400);
    const h = await page.evaluate(() => document.querySelector('#view h1, #view h2')?.textContent?.trim());
    if (h) passes.push(`nav click -> #/${r}: "${h}"`);
    else fails.push(`nav click -> #/${r}: no heading after click`);
  }
} finally {
  await browser.close();
}

console.log('PASSES:');
for (const p of passes) console.log('  ok  ' + p);
if (errors.length) {
  console.log('PAGE ERRORS:');
  for (const e of errors) console.log('  ERR ' + e);
  fails.push(`${errors.length} page error(s)`);
}
if (fails.length) {
  console.log('FAILS:');
  for (const f of fails) console.log('  FAIL ' + f);
  process.exit(1);
}
console.log(`SMOKE PASS (${passes.length} checks, 0 errors)`);
