// shoot-pw.mjs — screenshot driver using stock Chromium via playwright-core.
// Usage: node tools/shoot-pw.mjs --url <url> --out <file.jpg> --width 1280 --height 800 [--mobile] [--wait 1500]
// Run from /tmp/pwtest (where playwright-core is installed) or set NODE_PATH.
// Prints console errors from the page, if any. Exits 1 on a page error.

import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
}
const url = arg('--url');
const out = arg('--out');
const width = Number(arg('--width', '1280'));
const height = Number(arg('--height', '800'));
const mobile = args.includes('--mobile');
const waitMs = Number(arg('--wait', '1500'));
if (!url || !out) {
  console.error('usage: node tools/shoot-pw.mjs --url <url> --out <file> [--width N] [--height N] [--mobile] [--wait ms]');
  process.exit(2);
}

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROME || '/home/hatch/workspace/pw-chromium/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-gpu'],
});
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('favicon.ico')) errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(waitMs);
  await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
  if (errors.length) {
    console.error('PAGE ERRORS:\n' + errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('ok: ' + out);
  }
} finally {
  await browser.close();
}
