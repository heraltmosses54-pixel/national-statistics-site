// views.js — one renderer per route. Each returns an HTML string for #view.
// All figures come from data.js; every control the pages show is wired in
// main.js and does something real (sorting, filtering, chart updates).

import {
  AGE_BANDS, CPI_GROUPS, EMPLOYMENT_SECTORS, KPIS, META, PEOPLE, PROVINCES,
  RELEASES, SECTORS, SERIES, YEARS, density, tradeBalance,
} from './data.js';
import {
  barChart, donutChart, groupedBarChart, hbarChart, lineChart, pyramidChart,
} from './charts.js';

function sourceNote(text) {
  return `<p class="source-note">Source: ${text}. Figures rounded for display.</p>`;
}

function card(title, subtitle, body, extraClass = '') {
  return `<section class="card ${extraClass}">
    <h2>${title}</h2>${subtitle ? `<p class="card-sub">${subtitle}</p>` : ''}${body}
  </section>`;
}

function kpiCard(k) {
  return `<article class="kpi">
    <p class="kpi-label">${k.label}</p>
    <p class="kpi-value">${k.value} <span class="kpi-unit">${k.unit}</span></p>
    <p class="kpi-change">${k.change}</p>
    <p class="kpi-note">${k.note}, ${k.year}</p>
  </article>`;
}

function seriesFor(key) {
  return { label: SERIES[key].label, unit: SERIES[key].unit, years: YEARS, values: SERIES[key].values };
}

function valueTable(key, fromYear, toYear) {
  const s = SERIES[key];
  const rows = YEARS.map((y, i) => ({ year: y, value: s.values[i] }))
    .filter((r) => r.year >= fromYear && r.year <= toYear);
  return `<table class="data-table"><thead><tr><th>Year</th><th>${s.label} (${s.unit})</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><td>${r.year}</td><td>${r.value}</td></tr>`).join('')}</tbody></table>`;
}

export function renderDashboard() {
  const growth = seriesFor('gdpGrowth');
  const inflation = seriesFor('inflation');
  return `
  <div class="hero">
    <p class="eyebrow">Portal Statistik Indonesia &middot; Data 2019&ndash;2024</p>
    <h1>Indonesia in numbers</h1>
    <p class="lede">The country's people, economy, prices and regions &mdash; the latest
    published figures, charted and explained, in one place.</p>
  </div>
  <div class="kpi-grid">${KPIS.map(kpiCard).join('')}</div>
  <div class="grid-2">
    ${card('Economic growth', 'Real GDP growth, % per year', lineChart(growth))}
    ${card('Inflation', 'Consumer prices, December year-on-year, %', lineChart(inflation))}
  </div>
  ${sourceNote(META.sources)}
  <div class="grid-2">
    ${card('Latest releases', 'Publication schedule', `
      <ul class="releases">${RELEASES.map((r) => `
        <li><time>${r.date}</time><strong>${r.title}</strong><span>${r.detail}</span></li>`).join('')}
      </ul>`)}
    ${card('People at a glance', 'Indonesia, 2024', `
      <ul class="people">${PEOPLE.map((p) => `
        <li><strong>${p.value}</strong><span>${p.label}</span><em>${p.note}</em></li>`).join('')}
      </ul>`)}
  </div>`;
}

function provinceRows(sortKey, dir) {
  const rows = PROVINCES.map((p) => ({ ...p, density: density(p) }));
  const key = sortKey || 'pop';
  rows.sort((a, b) => (dir === 'asc' ? a[key] - b[key] : b[key] - a[key]));
  if (key === 'name') rows.sort((a, b) => (dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  return rows;
}

export function provinceTable(sortKey = 'pop', dir = 'desc') {
  const rows = provinceRows(sortKey, dir);
  const th = (key, label) => {
    const active = sortKey === key;
    const arrow = active ? (dir === 'asc' ? ' &uarr;' : ' &darr;') : '';
    const next = active ? (dir === 'asc' ? 'desc' : 'asc') : 'asc';
    return `<th><button class="sort-btn" data-sort="${key}" data-dir="${next}" aria-sort="${active ? dir : 'none'}">${label}${arrow}</button></th>`;
  };
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr>${th('name', 'Province')}${th('pop', 'Population (million)')}${th('area', 'Area (km&sup2;)')}${th('density', 'Density (/km&sup2;)')}${th('gdpShare', 'Share of GDP (%)')}</tr></thead>
    <tbody>${rows.map((p) => `<tr><td>${p.name}</td><td>${p.pop.toFixed(2)}</td><td>${p.area.toLocaleString('en-US')}</td><td>${p.density.toLocaleString('en-US')}</td><td>${p.gdpShare.toFixed(1)}</td></tr>`).join('')}</tbody>
  </table></div>
  <p class="source-note">Tap a column heading to sort. Population: BPS projection 2024; area: BPS; GDP share: approximate, 2024.</p>`;
}

export function renderPopulation(state) {
  const pop = seriesFor('population');
  return `
  <h1 class="page-title">Population &amp; demographics</h1>
  <p class="lede">281.6 million people in 2024, growing about 0.9% a year. More than half
  live on Java, and the median Indonesian is about 30 years old.</p>
  <div class="grid-2">
    ${card('Population, 2019&ndash;2024', 'Million people &mdash; BPS projection', lineChart(pop))}
    ${card('Age structure, 2024', 'Share of total population by age group', pyramidChart(AGE_BANDS))}
  </div>
  ${sourceNote('BPS population projection 2024')}
  ${card('People at a glance', 'Indonesia, 2024', `
    <ul class="people">${PEOPLE.map((p) => `
      <li><strong>${p.value}</strong><span>${p.label}</span><em>${p.note}</em></li>`).join('')}
    </ul>`)}
  ${card('Provinces by population', 'Twelve largest provinces, 2024 &mdash; tap a heading to sort', provinceTable(state.sortKey, state.sortDir))}
  ${card('Population by year', 'Million people', valueTable('population', 2019, 2024))}`;
}

export function renderEconomy() {
  const nominal = seriesFor('gdpNominal');
  const growth = seriesFor('gdpGrowth');
  const donut = donutChart(SECTORS);
  const tradeRows = YEARS.map((y, i) => ({
    year: y, exports: SERIES.exports.values[i], imports: SERIES.imports.values[i], balance: tradeBalance(i),
  }));
  return `
  <h1 class="page-title">Economy</h1>
  <p class="lede">GDP reached Rp 22,139 trillion in 2024, growing 5.03%. Manufacturing is
  still the largest sector, and goods trade ran a US$ 31.0 billion surplus.</p>
  <div class="grid-2">
    ${card('GDP, current prices', 'Rp trillion &mdash; BPS national accounts', barChart(nominal))}
    ${card('Real GDP growth', '% per year &mdash; the 2020 contraction and the recovery', lineChart(growth))}
  </div>
  <div class="grid-2">
    ${card('What the economy makes', 'Share of GDP by sector, 2024', `<div class="donut-wrap">${donut.svg}${donut.legend}</div>`)}
    ${card('Trade in goods', 'Exports and imports, US$ billion', groupedBarChart(
      { label: 'Exports', years: YEARS, values: SERIES.exports.values },
      { label: 'Imports', years: YEARS, values: SERIES.imports.values },
    ) + `<p class="legend-line"><span class="swatch" style="background:#0e5f5c"></span>Exports <span class="swatch" style="background:#e8a33d"></span>Imports</p>`)}
  </div>
  ${sourceNote('BPS national accounts and foreign trade statistics, 2024')}
  ${card('Trade balance by year', 'US$ billion', `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>Year</th><th>Exports</th><th>Imports</th><th>Balance</th></tr></thead>
    <tbody>${tradeRows.map((r) => `<tr><td>${r.year}</td><td>${r.exports}</td><td>${r.imports}</td><td>${r.balance >= 0 ? '+' : ''}${r.balance}</td></tr>`).join('')}</tbody>
  </table></div>`)}
  ${card('GDP by sector, 2024', 'Share of GDP, %', hbarChart(SECTORS.map((s) => ({ name: s.name, value: s.share })), { suffix: '%' }))}
  ${card('GDP by year', 'Rp trillion, current prices', valueTable('gdpNominal', 2019, 2024))}`;
}

export function renderPrices() {
  const inflation = seriesFor('inflation');
  return `
  <h1 class="page-title">Prices &amp; inflation</h1>
  <p class="lede">Inflation ended 2024 at 1.57% year-on-year &mdash; the lowest December
  reading since 2020, after the 5.51% spike of 2022. Food and personal care
  rose fastest; communication prices fell slightly.</p>
  <div class="grid-2">
    ${card('Inflation, 2019&ndash;2024', 'December year-on-year, % &mdash; BPS consumer price index', lineChart(inflation))}
    ${card('Inflation by group, 2024', '% change over the year, by CPI expenditure group', hbarChart(
      [...CPI_GROUPS].sort((a, b) => b.inflation - a.inflation).map((g) => ({ name: g.name, value: g.inflation })),
      { suffix: '%', labelWidth: 220 },
    ))}
  </div>
  ${sourceNote('BPS consumer price index, 2024')}
  ${card('Inflation by year', 'December year-on-year, %', valueTable('inflation', 2019, 2024))}
  ${card('About the CPI', 'How the figures are made', `<p class="prose">The consumer price index
    tracks the prices of a fixed basket of goods and services in 90 cities. The basket's weights
    come from the 2022 cost-of-living survey: food, beverages and tobacco is the largest group at
    about a quarter of the basket, followed by housing and transport. Inflation is published on the
    first working days of each month.</p>`)}`;
}

export function renderEmployment() {
  const unemp = seriesFor('unemployment');
  return `
  <h1 class="page-title">Employment</h1>
  <p class="lede">Unemployment fell to 4.76% in August 2024, the lowest since 2019, with
  144.6 million people in work. Agriculture still employs the most people &mdash;
  more than one in four workers &mdash; and about 59% of workers are in informal employment.</p>
  <div class="grid-2">
    ${card('Unemployment, 2019&ndash;2024', 'Open unemployment rate, August, % &mdash; BPS labour force survey', lineChart(unemp))}
    ${card('Where people work', 'Share of the employed by sector, 2024', hbarChart(
      [...EMPLOYMENT_SECTORS].sort((a, b) => b.share - a.share).map((s) => ({ name: s.name, value: s.share })),
      { suffix: '%' },
    ))}
  </div>
  ${sourceNote('BPS labour force survey (Sakernas), August 2024')}
  ${card('Unemployment by year', 'Open unemployment rate, August, %', valueTable('unemployment', 2019, 2024))}
  ${card('Formal and informal work', 'BPS, August 2024', `<p class="prose">About 59% of
    workers are in informal employment &mdash; self-employed without help, unpaid family workers and
    casual workers. Informal work is most common in agriculture and trade, and least common among
    workers with a university degree.</p>`)}`;
}

export function renderRegions(state) {
  const top = [...PROVINCES].sort((a, b) => b.pop - a.pop);
  return `
  <h1 class="page-title">Regions &amp; provinces</h1>
  <p class="lede">Java holds about 56% of the population on 7% of the land. Jakarta is the
  densest province by far &mdash; about 15,900 people per km&sup2;, against a national
  average of about 148 &mdash; and the largest single share of GDP.</p>
  ${card('Largest provinces', 'Population, millions, 2024', hbarChart(top.map((p) => ({ name: p.name, value: p.pop })), { suffix: 'm' }))}
  ${card('All provinces in the table', 'Twelve largest provinces, 2024 &mdash; tap a heading to sort', provinceTable(state.sortKey, state.sortDir))}
  ${sourceNote('BPS population projection and area figures, 2024')}`;
}

const EXPLORER_INDICATORS = [
  'population', 'gdpGrowth', 'gdpNominal', 'inflation', 'unemployment',
  'poverty', 'exports', 'imports', 'lifeExpectancy', 'hdi',
];

export function renderExplorer(state) {
  const key = EXPLORER_INDICATORS.includes(state.indicator) ? state.indicator : 'population';
  const s = SERIES[key];
  const from = Math.min(state.fromYear || 2019, state.toYear || 2024);
  const to = Math.max(state.fromYear || 2019, state.toYear || 2024);
  const years = YEARS.filter((y) => y >= from && y <= to);
  const values = YEARS.filter((y) => y >= from && y <= to).map((y) => s.values[YEARS.indexOf(y)]);
  const chartSeries = { label: s.label, unit: s.unit, years, values };
  const yearOptions = (selected) => YEARS.map((y) => `<option value="${y}"${y === selected ? ' selected' : ''}>${y}</option>`).join('');
  const chart = values.length > 1 ? lineChart(chartSeries) : barChart(chartSeries);
  return `
  <h1 class="page-title">Data explorer</h1>
  <p class="lede">Pick an indicator and a year range. The chart and the table update
  together &mdash; every figure here is a published BPS or World Bank value.</p>
  <section class="card explorer-controls">
    <h2>Choose what to see</h2>
    <div class="controls">
      <label>Indicator
        <select id="explorer-indicator">${EXPLORER_INDICATORS.map((k) => `<option value="${k}"${k === key ? ' selected' : ''}>${SERIES[k].label} (${SERIES[k].unit})</option>`).join('')}</select>
      </label>
      <label>From
        <select id="explorer-from">${yearOptions(from)}</select>
      </label>
      <label>To
        <select id="explorer-to">${yearOptions(to)}</select>
      </label>
    </div>
    <p class="source-note">Source: ${s.source}.</p>
  </section>
  ${card(s.label, `${s.unit} &middot; ${from}&ndash;${to}`, chart)}
  ${card('Values', `${s.label}, ${from}&ndash;${to}`, `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>Year</th><th>${s.label} (${s.unit})</th></tr></thead>
    <tbody>${years.map((y, i) => `<tr><td>${y}</td><td>${values[i]}</td></tr>`).join('')}</tbody>
  </table></div>`)}`;
}
