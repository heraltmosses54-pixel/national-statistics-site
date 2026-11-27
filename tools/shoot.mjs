// shoot.mjs — screenshot driver for the NusaStats site.
// Drives the system Chrome over CDP with Node's built-in WebSocket.
// Usage: node tools/shoot.mjs --url <url> --out <file.jpg> --width 1280 --height 800 [--mobile] [--wait 1500]
// Prints console errors from the page, if any. Exits 1 on a page error.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

// This Chromium build refuses to start without a Hatch WebGL domain policy:
// a file whose first line is the contract version, then one registrable
// domain per line, ending with a newline, plus its SHA-256. Our pages do
// not use WebGL; the policy just satisfies the startup check.
const DOMAINS_FILE = '/tmp/webgl-domains.txt';
writeFileSync(DOMAINS_FILE, 'hatch-webgl-allowed-domains-v1\nexample.com\nexample.org\n');
const DOMAINS_SHA = createHash('sha256').update('hatch-webgl-allowed-domains-v1\nexample.com\nexample.org\n').digest('hex');

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
  console.error('usage: node tools/shoot.mjs --url <url> --out <file> [--width N] [--height N] [--mobile] [--wait ms]');
  process.exit(2);
}

const PORT = 9223;
const chrome = spawn('/opt/meta-chromium/chrome', [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--disable-features=LocalNetworkAccessChecks',
  `--hatch-webgl-allowed-domains-file=${DOMAINS_FILE}`,
  `--hatch-webgl-allowed-domains-sha256=${DOMAINS_SHA}`,
  `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/chrome-stats-shoot',
  // Open the target URL as the startup tab: navigating to a loopback
  // address from about:blank trips Chrome's Local Network Access check.
  url,
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTarget() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page');
      if (page) return page;
    } catch { /* not up yet */ }
    await sleep(500);
  }
  throw new Error('no CDP page target');
}

let exitCode = 0;
try {
  const target = await getTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  // The startup tab already opened the target URL: a second navigation
  // issued over CDP counts as page-initiated and trips Chrome's Local
  // Network Access check for loopback targets, so only navigate when the
  // tab is somewhere else.
  const here = await send('Runtime.evaluate', { expression: 'location.href', returnByValue: true });
  if (!here || !here.result || here.result.value !== url) {
    await send('Page.navigate', { url });
  }
  await sleep(waitMs);
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  if (errors.length) {
    console.error('PAGE ERRORS:\n' + errors.join('\n'));
    exitCode = 1;
  } else {
    console.log('ok: ' + out);
  }
  ws.close();
} catch (err) {
  console.error('shoot failed: ' + err.message);
  exitCode = 1;
} finally {
  chrome.kill('SIGKILL');
}
process.exit(exitCode);
