// views.js — one renderer per route. Each returns an HTML string for #view.
// All figures come from data.js; every control the pages show is wired in
// main.js and does something real (sorting, filtering, chart updates).

import {
  AGE_BANDS, CPI_GROUPS, EMPLOYMENT_SECTORS, KPIS, META, PEOPLE, PROVINCES,
  RELEASES, SECTORS, SERIES, SOURCES, YEARS, density, tradeBalance,
} from './data.js';
import {
  AMBER, TEAL, barChart, donutChart, groupedBarChart, hbarChart, lineChart,
  multiLineChart, pyramidChart,
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
  const perCapita = seriesFor('gdpPerCapita');
  const poverty = seriesFor('poverty');
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
  <div class="grid-2">
    ${card('GDP per person', 'GDP per capita, current US$ &mdash; World Bank', lineChart(perCapita))}
    ${card('Poverty', 'Share of the population below the poverty line, %', lineChart(poverty))}
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

function provinceRows(sortKey, dir, filter = '') {
  const rows = PROVINCES.map((p) => ({ ...p, density: density(p) }));
  const q = filter.trim().toLowerCase();
  const kept = q ? rows.filter((p) => p.name.toLowerCase().includes(q)) : rows;
  const key = sortKey || 'pop';
  kept.sort((a, b) => (dir === 'asc' ? a[key] - b[key] : b[key] - a[key]));
  if (key === 'name') kept.sort((a, b) => (dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  return kept;
}

export function provinceTable(sortKey = 'pop', dir = 'desc', filter = '') {
  const rows = provinceRows(sortKey, dir, filter);
  const th = (key, label) => {
    const active = sortKey === key;
    const arrow = active ? (dir === 'asc' ? ' &uarr;' : ' &darr;') : '';
    const next = active ? (dir === 'asc' ? 'desc' : 'asc') : 'asc';
    return `<th><button class="sort-btn" data-sort="${key}" data-dir="${next}" aria-sort="${active ? dir : 'none'}">${label}${arrow}</button></th>`;
  };
  const body = rows.length ? rows.map((p) => `<tr><td>${p.name}</td><td>${p.pop.toFixed(2)}</td><td>${p.area.toLocaleString('en-US')}</td><td>${p.density.toLocaleString('en-US')}</td><td>${p.gdpShare.toFixed(1)}</td></tr>`).join('')
    : `<tr><td colspan="5">No province matches &ldquo;${filter}&rdquo;.</td></tr>`;
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr>${th('name', 'Province')}${th('pop', 'Population (million)')}${th('area', 'Area (km&sup2;)')}${th('density', 'Density (/km&sup2;)')}${th('gdpShare', 'Share of GDP (%)')}</tr></thead>
    <tbody>${body}</tbody>
  </table></div>
  <p class="source-note">Tap a column heading to sort. Population: BPS projection 2024; area: BPS; GDP share: approximate, 2024.</p>`;
}

export function renderPeople() {
  const life = seriesFor('lifeExpectancy');
  const hdi = seriesFor('hdi');
  const fertility = seriesFor('fertility');
  const urban = seriesFor('urbanShare');
  return `
  <h1 class="page-title">People &amp; wellbeing</h1>
  <p class="lede">Indonesians live longer and study longer than a decade ago: life
  expectancy reached 74.2 years in 2024 and the Human Development Index
  75.02. Families are smaller &mdash; 2.12 children per woman &mdash; and
  58.8% of the population now lives in towns and cities.</p>
  <div class="grid-2">
    ${card('Life expectancy', 'Years at birth &mdash; BPS', lineChart(life))}
    ${card('Human Development Index', 'Index 0&ndash;100 &mdash; BPS', lineChart(hdi))}
  </div>
  <div class="grid-2">
    ${card('Fertility', 'Births per woman &mdash; World Bank', lineChart(fertility))}
    ${card('Urban population', 'Share of the population in urban areas, % &mdash; World Bank', lineChart(urban))}
  </div>
  ${sourceNote('BPS and World Bank, World Development Indicators, 2024')}
  ${card('People at a glance', 'Indonesia, 2024', `
    <ul class="people">${PEOPLE.map((p) => `
      <li><strong>${p.value}</strong><span>${p.label}</span><em>${p.note}</em></li>`).join('')}
    </ul>`)}
  ${card('Life expectancy by year', 'Years at birth', valueTable('lifeExpectancy', 2019, 2024))}
  ${card('About these measures', 'What the numbers mean', `<p class="prose">Life expectancy is
    the years a newborn would live if mortality stayed as it is today. The Human Development Index
    combines health, schooling and income into one number from 0 to 100; Indonesia passed 75 in
    2024, the &ldquo;high human development&rdquo; band. The fertility rate is the children a woman
    would have at current birth rates &mdash; it has fallen every year since 2019, and at 2.12 it
    sits just above the replacement level of about 2.1.</p>`)}`;
}

export function renderSources() {
  return `
  <h1 class="page-title">Sources &amp; methodology</h1>
  <p class="lede">Every figure on this site is a published value. This page lists each
  one with its source, so anything here can be checked back to the
  publication it came from.</p>
  <section class="card">
    <h2>Where each figure comes from</h2>
    <div class="table-wrap"><table class="data-table sources-table">
      <thead><tr><th>Indicator</th><th>Figure</th><th>Source</th><th>Note</th></tr></thead>
      <tbody>${SOURCES.map((s) => `<tr><td>${s.indicator}</td><td>${s.figure}</td><td>${s.source}</td><td>${s.detail}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>
  ${card('How the site is built', 'Method and limits', `<p class="prose">All figures are
    stored in the site's own files and shown as published; nothing is fetched from the network.
    Values are rounded for display &mdash; for example, provincial GDP shares are approximate
    because the underlying regional accounts are published with more detail than this site
    repeats. Series cover 2019&ndash;2024, the latest complete six years at the time of writing.
    Where two publishers differ &mdash; BPS and the World Bank publish slightly different life
    expectancy figures, for example &mdash; the page names the publisher its figure comes from.
    Figures are revised by their publishers from time to time; the year on each card is the
    reference year of the value shown.</p>`)}
  ${card('Publishers', 'The two main sources', `<p class="prose">BPS &mdash; Badan Pusat
    Statistik &mdash; is Indonesia's national statistics office: it runs the census, the
    labour force survey, the consumer price survey and the national accounts. The World Bank's
    World Development Indicators re-publish national figures on a common basis so countries can
    be compared &mdash; that is where the GDP-per-capita, fertility and urban-share series come
    from. The APJII internet-user figure comes from the Indonesian Internet Service Providers
    Association's annual survey.</p>`)}`;
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
  const q = state.regionFilter || '';
  return `
  <h1 class="page-title">Regions &amp; provinces</h1>
  <p class="lede">Java holds about 56% of the population on 7% of the land. Jakarta is the
  densest province by far &mdash; about 15,900 people per km&sup2;, against a national
  average of about 148 &mdash; and the largest single share of GDP.</p>
  ${card('Largest provinces', 'Population, millions, 2024', hbarChart(top.map((p) => ({ name: p.name, value: p.pop })), { suffix: 'm' }))}
  <section class="card">
    <h2>All provinces in the table</h2>
    <p class="card-sub">Twelve largest provinces, 2024 &mdash; tap a heading to sort</p>
    <p><input class="search-input" id="region-search" type="search" placeholder="Search a province, e.g. Jawa&hellip;" value="${q.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" aria-label="Search provinces"></p>
    ${provinceTable(state.sortKey, state.sortDir, q)}
  </section>
  ${sourceNote('BPS population projection and area figures, 2024')}`;
}

const EXPLORER_INDICATORS = [
  'population', 'gdpGrowth', 'gdpNominal', 'gdpPerCapita', 'inflation',
  'unemployment', 'poverty', 'exports', 'imports', 'lifeExpectancy', 'hdi',
  'fertility', 'urbanShare',
];

function changeSinceFirst(values, fromYear) {
  const first = values[0];
  const last = values[values.length - 1];
  if (first === 0) return 'n/a';
  const pct = ((last - first) / Math.abs(first)) * 100;
  return `${last >= first ? '+' : ''}${pct.toFixed(1)}% since ${fromYear}`;
}

export function renderExplorer(state) {
  const key = EXPLORER_INDICATORS.includes(state.indicator) ? state.indicator : 'population';
  const compareKey = EXPLORER_INDICATORS.includes(state.compare) && state.compare !== key ? state.compare : null;
  const s = SERIES[key];
  const from = Math.min(state.fromYear || 2019, state.toYear || 2024);
  const to = Math.max(state.fromYear || 2019, state.toYear || 2024);
  const years = YEARS.filter((y) => y >= from && y <= to);
  const values = YEARS.filter((y) => y >= from && y <= to).map((y) => s.values[YEARS.indexOf(y)]);
  const chartSeries = { label: s.label, unit: s.unit, years, values };
  const yearOptions = (selected) => YEARS.map((y) => `<option value="${y}"${y === selected ? ' selected' : ''}>${y}</option>`).join('');
  const chart = values.length > 1 ? lineChart(chartSeries) : barChart(chartSeries);
  const compareOptions = EXPLORER_INDICATORS.filter((k) => k !== key).map((k) => `<option value="${k}"${k === state.compare ? ' selected' : ''}>${SERIES[k].label}</option>`).join('');
  const compareSeries = compareKey ? SERIES[compareKey] : null;
  const compareValues = compareSeries ? YEARS.filter((y) => y >= from && y <= to).map((y) => compareSeries.values[YEARS.indexOf(y)]) : null;
  const compareChart = compareSeries && years.length > 1 ? multiLineChart([
    { label: s.label, years, values, color: TEAL },
    { label: compareSeries.label, years, values: compareValues, color: AMBER },
  ]) : '';
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
      <label>Compare with
        <select id="explorer-compare"><option value="">No comparison</option>${compareOptions}</select>
      </label>
    </div>
    <p class="source-note">Source: ${s.source}.</p>
  </section>
  ${card(s.label, `${s.unit} &middot; ${from}&ndash;${to} &middot; ${changeSinceFirst(values, from)}`, chart)}
  ${compareChart ? card(`Compare: ${s.label} vs ${compareSeries.label}`, `Both rebased to 100 in ${from} so different units can be compared`, compareChart) : ''}
  ${card('Values', `${s.label}, ${from}&ndash;${to}`, `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>Year</th><th>${s.label} (${s.unit})</th>${compareSeries ? `<th>${compareSeries.label} (${compareSeries.unit})</th>` : ''}</tr></thead>
    <tbody>${years.map((y, i) => `<tr><td>${y}</td><td>${values[i]}</td>${compareSeries ? `<td>${compareValues[i]}</td>` : ''}</tr>`).join('')}</tbody>
  </table></div>`)}`;
}
