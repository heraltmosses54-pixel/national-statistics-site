// charts.js — hand-written SVG charts. No libraries, no network.
// Every function returns an SVG string with a viewBox, so charts scale
// from a desktop column to a phone screen without re-rendering.

export const TEAL = '#0e5f5c';
export const TEAL_LIGHT = '#3a8a86';
export const AMBER = '#e8a33d';
export const RED = '#b3402e';
export const INK = '#12211f';
export const GRID = '#dfe6e3';

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function niceTicks(min, max, count) {
  const span = max - min || 1;
  const step = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step)));
  const norm = step / mag;
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  const stepNice = nice * mag;
  const start = Math.ceil(min / stepNice) * stepNice;
  const ticks = [];
  for (let v = start; v <= max + 1e-9; v += stepNice) ticks.push(+v.toFixed(2));
  return ticks;
}

function fmt(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
}

// Line chart with dots and value labels. series = { years, values, unit }.
export function lineChart(series, options = {}) {
  const width = options.width || 640;
  const height = options.height || 300;
  const padL = 52, padR = 16, padT = 26, padB = 34;
  const values = series.values;
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min > 0) min = Math.min(0, min - (max - min) * 0.15);
  if (max < 0) max = 0;
  const pad = (max - min) * 0.12;
  min -= pad; max += pad;
  const x = (i) => padL + (i * (width - padL - padR)) / (values.length - 1);
  const y = (v) => padT + ((max - v) * (height - padT - padB)) / (max - min);
  const ticks = niceTicks(min, max, 4);
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(series.label)} chart" xmlns="http://www.w3.org/2000/svg">`;
  for (const t of ticks) {
    svg += `<line x1="${padL}" y1="${y(t)}" x2="${width - padR}" y2="${y(t)}" stroke="${GRID}" stroke-width="1"/>`;
    svg += `<text x="${padL - 8}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="#5a6b68">${fmt(t)}</text>`;
  }
  if (min < 0 && max > 0) {
    svg += `<line x1="${padL}" y1="${y(0)}" x2="${width - padR}" y2="${y(0)}" stroke="#9aa8a5" stroke-width="1"/>`;
  }
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  svg += `<polyline points="${points}" fill="none" stroke="${TEAL}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  values.forEach((v, i) => {
    const negative = v < 0;
    svg += `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${negative ? RED : TEAL}" stroke="#fff" stroke-width="1.5"/>`;
    // Value label above the point, unless it would collide with the top
    // gridline label — then put it below the point instead.
    const topTickY = y(ticks[ticks.length - 1]) + 4;
    const aboveY = y(v) - 9;
    const labelY = aboveY < topTickY + 12 ? y(v) + 16 : aboveY;
    svg += `<text x="${x(i)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="${negative ? RED : INK}">${fmt(v)}</text>`;
    svg += `<text x="${x(i)}" y="${height - 12}" text-anchor="middle" font-size="11" fill="#5a6b68">${series.years[i]}</text>`;
  });
  svg += '</svg>';
  return svg;
}

// Vertical bar chart. series = { years, values, unit }.
export function barChart(series, options = {}) {
  const width = options.width || 640;
  const height = options.height || 300;
  const padL = 52, padR = 16, padT = 26, padB = 34;
  const values = series.values;
  let min = Math.min(0, ...values);
  let max = Math.max(...values);
  const pad = (max - min) * 0.1;
  min -= pad; max += pad;
  const slot = (width - padL - padR) / values.length;
  const barW = Math.min(52, slot * 0.6);
  const x = (i) => padL + i * slot + (slot - barW) / 2;
  const y = (v) => padT + ((max - v) * (height - padT - padB)) / (max - min);
  const ticks = niceTicks(min, max, 4);
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(series.label)} chart" xmlns="http://www.w3.org/2000/svg">`;
  for (const t of ticks) {
    svg += `<line x1="${padL}" y1="${y(t)}" x2="${width - padR}" y2="${y(t)}" stroke="${GRID}" stroke-width="1"/>`;
    svg += `<text x="${padL - 8}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="#5a6b68">${fmt(t)}</text>`;
  }
  svg += `<line x1="${padL}" y1="${y(0)}" x2="${width - padR}" y2="${y(0)}" stroke="#9aa8a5" stroke-width="1"/>`;
  values.forEach((v, i) => {
    const top = y(Math.max(v, 0));
    const bottom = y(Math.min(v, 0));
    const negative = v < 0;
    svg += `<rect x="${x(i).toFixed(1)}" y="${top.toFixed(1)}" width="${barW}" height="${Math.max(1, bottom - top).toFixed(1)}" rx="3" fill="${negative ? RED : (options.color || TEAL)}"/>`;
    const labelY = negative ? bottom + 14 : top - 7;
    svg += `<text x="${(x(i) + barW / 2).toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="${negative ? RED : INK}">${fmt(v)}</text>`;
    svg += `<text x="${(x(i) + barW / 2).toFixed(1)}" y="${height - 12}" text-anchor="middle" font-size="11" fill="#5a6b68">${series.years[i]}</text>`;
  });
  svg += '</svg>';
  return svg;
}

// Horizontal bar list. items = [{ name, value }], sorted by the caller.
export function hbarChart(items, options = {}) {
  const rowH = options.rowHeight || 30;
  const labelW = options.labelWidth || 190;
  const width = options.width || 640;
  const height = items.length * rowH + 16;
  const max = Math.max(...items.map((d) => d.value));
  const barX = labelW + 8;
  const barMaxW = width - barX - 64;
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" xmlns="http://www.w3.org/2000/svg">`;
  items.forEach((d, i) => {
    const cy = 8 + i * rowH + rowH / 2;
    const w = Math.max(2, (d.value / max) * barMaxW);
    svg += `<text x="${labelW}" y="${cy + 4}" text-anchor="end" font-size="12" fill="${INK}">${esc(d.name)}</text>`;
    svg += `<rect x="${barX}" y="${cy - 8}" width="${w.toFixed(1)}" height="16" rx="3" fill="${options.color || TEAL}"/>`;
    svg += `<text x="${barX + w + 8}" y="${cy + 4}" font-size="12" font-weight="600" fill="${INK}">${fmt(d.value)}${options.suffix || ''}</text>`;
  });
  svg += '</svg>';
  return svg;
}

// Donut chart with a legend. items = [{ name, share }]; top 6 shown, rest as Other.
export function donutChart(items, options = {}) {
  const size = options.size || 220;
  const cx = size / 2, cy = size / 2, r = size / 2 - 14, hole = r * 0.58;
  const palette = [TEAL, AMBER, '#2e7d6b', '#c97b2d', '#7fb069', '#5b7fa6', '#8a6fb8'];
  const sorted = [...items].sort((a, b) => b.share - a.share);
  const top = sorted.slice(0, 6);
  const rest = sorted.slice(6).reduce((s, d) => s + d.share, 0);
  const shown = rest > 0 ? [...top, { name: 'Other sectors', share: +rest.toFixed(1) }] : top;
  const total = shown.reduce((s, d) => s + d.share, 0);
  let angle = -90;
  let svg = `<svg viewBox="0 0 ${size} ${size}" role="img" xmlns="http://www.w3.org/2000/svg">`;
  shown.forEach((d, i) => {
    const frac = d.share / total;
    const a0 = (angle * Math.PI) / 180;
    const a1 = ((angle + frac * 360) * Math.PI) / 180;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi1 = cx + hole * Math.cos(a1), yi1 = cy + hole * Math.sin(a1);
    const xi0 = cx + hole * Math.cos(a0), yi0 = cy + hole * Math.sin(a0);
    svg += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${hole} ${hole} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z" fill="${palette[i % palette.length]}" stroke="#fff" stroke-width="1.5"/>`;
    angle += frac * 360;
  });
  svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}">100%</text>`;
  svg += `<text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="11" fill="#5a6b68">of GDP</text>`;
  svg += '</svg>';
  let legend = '<ul class="legend">';
  shown.forEach((d, i) => {
    legend += `<li><span class="swatch" style="background:${palette[i % palette.length]}"></span>${esc(d.name)} <b>${fmt(d.share)}%</b></li>`;
  });
  legend += '</ul>';
  return { svg, legend };
}

// Grouped vertical bar chart for two series on the same years.
export function groupedBarChart(seriesA, seriesB, options = {}) {
  const width = options.width || 640;
  const height = options.height || 300;
  const padL = 52, padR = 16, padT = 26, padB = 34;
  const all = [...seriesA.values, ...seriesB.values];
  let min = Math.min(0, ...all);
  let max = Math.max(...all);
  const pad = (max - min) * 0.1;
  min -= pad; max += pad;
  const slot = (width - padL - padR) / seriesA.values.length;
  const barW = Math.min(26, slot * 0.32);
  const y = (v) => padT + ((max - v) * (height - padT - padB)) / (max - min);
  const ticks = niceTicks(min, max, 4);
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(seriesA.label)} and ${esc(seriesB.label)}" xmlns="http://www.w3.org/2000/svg">`;
  for (const t of ticks) {
    svg += `<line x1="${padL}" y1="${y(t)}" x2="${width - padR}" y2="${y(t)}" stroke="${GRID}" stroke-width="1"/>`;
    svg += `<text x="${padL - 8}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="#5a6b68">${fmt(t)}</text>`;
  }
  svg += `<line x1="${padL}" y1="${y(0)}" x2="${width - padR}" y2="${y(0)}" stroke="#9aa8a5" stroke-width="1"/>`;
  seriesA.values.forEach((v, i) => {
    const gx = padL + i * slot + slot / 2;
    const v2 = seriesB.values[i];
    svg += `<rect x="${(gx - barW - 2).toFixed(1)}" y="${y(Math.max(v, 0)).toFixed(1)}" width="${barW}" height="${Math.max(1, y(Math.min(v, 0)) - y(Math.max(v, 0))).toFixed(1)}" rx="2" fill="${TEAL}"/>`;
    svg += `<rect x="${(gx + 2).toFixed(1)}" y="${y(Math.max(v2, 0)).toFixed(1)}" width="${barW}" height="${Math.max(1, y(Math.min(v2, 0)) - y(Math.max(v2, 0))).toFixed(1)}" rx="2" fill="${AMBER}"/>`;
    svg += `<text x="${gx.toFixed(1)}" y="${height - 12}" text-anchor="middle" font-size="11" fill="#5a6b68">${seriesA.years[i]}</text>`;
  });
  svg += '</svg>';
  return svg;
}

// Population pyramid. bands = [{ band, male, female }] (shares of population, %).
export function pyramidChart(bands, options = {}) {
  const width = options.width || 640;
  const rowH = 22;
  const height = bands.length * rowH + 34;
  const maxShare = Math.max(...bands.map((b) => Math.max(b.male, b.female)));
  const half = (width - 64) / 2;
  const mid = width / 2;
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Population pyramid" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<text x="${mid - half / 2}" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="${TEAL}">Male</text>`;
  svg += `<text x="${mid + half / 2}" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="#b97f22">Female</text>`;
  bands.forEach((b, i) => {
    const y = 24 + i * rowH;
    const mw = (b.male / maxShare) * half;
    const fw = (b.female / maxShare) * half;
    svg += `<rect x="${(mid - mw).toFixed(1)}" y="${y}" width="${mw.toFixed(1)}" height="16" fill="${TEAL}"/>`;
    svg += `<rect x="${mid}" y="${y}" width="${fw.toFixed(1)}" height="16" fill="${AMBER}"/>`;
    svg += `<text x="${mid}" y="${y + 12}" text-anchor="middle" font-size="10.5" fill="${INK}">${esc(b.band)}</text>`;
    if (i % 4 === 0) {
      svg += `<text x="${mid - mw - 5}" y="${y + 12}" text-anchor="end" font-size="10" fill="#5a6b68">${fmt(b.male)}%</text>`;
      svg += `<text x="${mid + fw + 5}" y="${y + 12}" font-size="10" fill="#5a6b68">${fmt(b.female)}%</text>`;
    }
  });
  svg += `<line x1="${mid}" y1="22" x2="${mid}" y2="${height - 4}" stroke="#9aa8a5" stroke-width="1"/>`;
  svg += '</svg>';
  return svg;
}
