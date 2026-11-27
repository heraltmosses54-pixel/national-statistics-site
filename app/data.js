// NusaStats data — real published figures for Indonesia.
// Sources: BPS (Badan Pusat Statistik) annual publications and World Bank
// indicators, latest complete year 2024 unless a year is stated. Values are
// rounded for display; see the "Sources & notes" section on each page.

export const META = {
  country: 'Indonesia',
  referenceYear: 2024,
  sources: 'BPS (Badan Pusat Statistik) and World Bank, 2024',
};

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

// Headline indicators shown on the dashboard.
export const KPIS = [
  { id: 'population', label: 'Population', value: '281.6', unit: 'million', year: 2024, change: '+0.9% a year', note: 'BPS population projection' },
  { id: 'gdp', label: 'GDP (current prices)', value: 'Rp 22,139', unit: 'trillion', year: 2024, change: '+5.03% real growth', note: 'BPS national accounts' },
  { id: 'gdpCapita', label: 'GDP per capita', value: 'US$ 4,925', unit: '', year: 2024, change: 'from US$ 3,870 in 2020', note: 'World Bank / BPS' },
  { id: 'inflation', label: 'Inflation (Dec, y-on-y)', value: '1.57', unit: '%', year: 2024, change: 'down from 2.61% in 2023', note: 'BPS consumer prices' },
  { id: 'unemployment', label: 'Unemployment rate', value: '4.76', unit: '%', year: 2024, change: 'lowest since 2019', note: 'BPS labour force survey, August' },
  { id: 'poverty', label: 'Poverty rate', value: '8.57', unit: '%', year: 2024, change: '24.06 million people', note: 'BPS, September' },
];

// Time series, 2019-2024. Each series: { label, unit, source, values: [..] }.
export const SERIES = {
  population: { label: 'Population', unit: 'million people', source: 'BPS population projection', values: [268.1, 270.2, 272.7, 275.8, 278.7, 281.6] },
  gdpGrowth: { label: 'Real GDP growth', unit: '% per year', source: 'BPS national accounts', values: [5.02, -2.07, 3.7, 5.31, 5.05, 5.03] },
  gdpNominal: { label: 'GDP, current prices', unit: 'Rp trillion', source: 'BPS national accounts', values: [15833, 15434, 16970, 19588, 20892, 22139] },
  inflation: { label: 'Inflation (December, y-on-y)', unit: '%', source: 'BPS consumer price index', values: [2.72, 1.68, 1.87, 5.51, 2.61, 1.57] },
  unemployment: { label: 'Open unemployment rate (August)', unit: '%', source: 'BPS labour force survey', values: [5.28, 7.07, 6.49, 5.86, 5.32, 4.76] },
  poverty: { label: 'Poverty rate', unit: '% of population', source: 'BPS, September', values: [9.22, 10.19, 9.71, 9.57, 9.36, 8.57] },
  exports: { label: 'Exports of goods', unit: 'US$ billion', source: 'BPS foreign trade', values: [167.7, 163.2, 231.6, 291.9, 258.8, 264.7] },
  imports: { label: 'Imports of goods', unit: 'US$ billion', source: 'BPS foreign trade', values: [171.3, 141.6, 196.2, 237.4, 221.9, 233.7] },
  lifeExpectancy: { label: 'Life expectancy at birth', unit: 'years', source: 'BPS / World Bank', values: [71.4, 71.7, 72.2, 73.2, 73.9, 74.2] },
  hdi: { label: 'Human Development Index', unit: 'index (0-100)', source: 'BPS', values: [71.92, 71.94, 72.29, 73.55, 74.39, 75.02] },
  gdpPerCapita: { label: 'GDP per capita', unit: 'US$', source: 'World Bank, World Development Indicators', values: [4107, 3854, 4287, 4731, 4876, 4925] },
  fertility: { label: 'Total fertility rate', unit: 'births per woman', source: 'World Bank, World Development Indicators', values: [2.21, 2.19, 2.17, 2.15, 2.13, 2.12] },
  urbanShare: { label: 'Urban population', unit: '% of population', source: 'World Bank, World Development Indicators', values: [55.7, 56.3, 56.9, 57.5, 58.1, 58.8] },
};

// GDP by sector, share of GDP 2024 (%). Source: BPS national accounts.
export const SECTORS = [
  { name: 'Manufacturing', share: 18.7 },
  { name: 'Wholesale & retail trade', share: 12.9 },
  { name: 'Agriculture, forestry & fishing', share: 12.5 },
  { name: 'Construction', share: 10.0 },
  { name: 'Mining & quarrying', share: 8.6 },
  { name: 'Transport & storage', share: 4.7 },
  { name: 'Information & communication', share: 4.4 },
  { name: 'Financial services', share: 4.2 },
  { name: 'Public administration', share: 3.5 },
  { name: 'Education', share: 3.4 },
  { name: 'Real estate', share: 2.8 },
  { name: 'Health & social work', share: 1.2 },
  { name: 'Other services', share: 13.1 },
];

// Employment by sector, share of the employed, 2024 (%). Source: BPS Sakernas.
export const EMPLOYMENT_SECTORS = [
  { name: 'Agriculture, forestry & fishing', share: 28.5 },
  { name: 'Wholesale & retail trade', share: 18.8 },
  { name: 'Manufacturing', share: 13.9 },
  { name: 'Public admin, education & health', share: 11.5 },
  { name: 'Construction', share: 7.8 },
  { name: 'Accommodation & food services', share: 6.9 },
  { name: 'Transport & storage', share: 4.6 },
  { name: 'Other services', share: 8.0 },
];

// Age structure 2024: share of total population by 5-year band, male / female.
// Shares are rounded and sum to about 100. Source: BPS population projection.
export const AGE_BANDS = [
  { band: '0–4', male: 4.2, female: 4.0 },
  { band: '5–9', male: 4.3, female: 4.1 },
  { band: '10–14', male: 4.4, female: 4.2 },
  { band: '15–19', male: 4.4, female: 4.2 },
  { band: '20–24', male: 4.4, female: 4.2 },
  { band: '25–29', male: 4.3, female: 4.1 },
  { band: '30–34', male: 4.1, female: 3.9 },
  { band: '35–39', male: 3.9, female: 3.7 },
  { band: '40–44', male: 3.6, female: 3.5 },
  { band: '45–49', male: 3.3, female: 3.1 },
  { band: '50–54', male: 2.8, female: 2.7 },
  { band: '55–59', male: 2.4, female: 2.3 },
  { band: '60–64', male: 2.0, female: 1.9 },
  { band: '65–69', male: 1.5, female: 1.4 },
  { band: '70–74', male: 1.0, female: 0.9 },
  { band: '75+', male: 0.7, female: 0.7 },
];

// Provinces, 2024. Population in millions (BPS projection), area in km2,
// GDP share is the province's share of national GDP, approximate.
export const PROVINCES = [
  { name: 'Jawa Barat', pop: 49.94, area: 35378, gdpShare: 14.3 },
  { name: 'Jawa Timur', pop: 41.81, area: 47800, gdpShare: 14.4 },
  { name: 'Jawa Tengah', pop: 37.89, area: 32801, gdpShare: 8.4 },
  { name: 'Sumatera Utara', pop: 15.59, area: 72981, gdpShare: 5.0 },
  { name: 'Banten', pop: 12.43, area: 9663, gdpShare: 3.5 },
  { name: 'DKI Jakarta', pop: 10.56, area: 664, gdpShare: 16.6 },
  { name: 'Sulawesi Selatan', pop: 9.36, area: 46717, gdpShare: 3.1 },
  { name: 'Lampung', pop: 9.22, area: 34624, gdpShare: 2.0 },
  { name: 'Sumatera Selatan', pop: 8.84, area: 91592, gdpShare: 2.8 },
  { name: 'Riau', pop: 6.73, area: 87024, gdpShare: 3.6 },
  { name: 'Sumatera Barat', pop: 5.76, area: 42013, gdpShare: 1.7 },
  { name: 'Kalimantan Barat', pop: 5.61, area: 147307, gdpShare: 1.4 },
];

// Consumer-price inflation by expenditure group, 2024 (%, annual average).
// Source: BPS consumer price index. Groups follow the CPI basket.
export const CPI_GROUPS = [
  { name: 'Food, beverages & tobacco', inflation: 2.1 },
  { name: 'Clothing & footwear', inflation: 1.1 },
  { name: 'Housing, water & electricity', inflation: 0.6 },
  { name: 'Household equipment', inflation: 1.2 },
  { name: 'Health', inflation: 1.9 },
  { name: 'Transport', inflation: 1.0 },
  { name: 'Information & communication', inflation: -0.3 },
  { name: 'Recreation, sport & culture', inflation: 1.0 },
  { name: 'Education', inflation: 1.7 },
  { name: 'Restaurants & accommodation', inflation: 1.9 },
  { name: 'Personal care & other services', inflation: 3.0 },
];

// People indicators, 2024. Source: BPS / APJII.
export const PEOPLE = [
  { label: 'Life expectancy', value: '74.2 years', note: 'up from 71.4 in 2019' },
  { label: 'Human Development Index', value: '75.02', note: 'high human development' },
  { label: 'Mean years of schooling', value: '9.1 years', note: 'expected: 13.2 years' },
  { label: 'Adult literacy rate', value: '98.0%', note: 'population aged 15+' },
  { label: 'Internet users', value: '221.6 million', note: 'APJII survey 2024' },
  { label: 'Median age', value: '30.5 years', note: 'more than half the population is under 31' },
];

// Latest releases (publication schedule, BPS).
export const RELEASES = [
  { date: '5 Feb 2025', title: 'GDP, fourth quarter 2024', detail: 'Economy grew 5.02% y-on-y in Q4; full-year 2024 growth 5.03%.' },
  { date: '2 Jan 2025', title: 'Inflation, December 2024', detail: 'Annual inflation 1.57%, the lowest December reading since 2020.' },
  { date: '5 Nov 2024', title: 'Labour force, August 2024', detail: 'Open unemployment 4.76%; 144.6 million people in work.' },
  { date: '15 Jan 2025', title: 'Foreign trade, December 2024', detail: 'Exports US$ 23.8 billion in December; 2024 surplus US$ 31.0 billion.' },
  { date: '30 Sep 2024', title: 'Poverty, March 2024', detail: 'Poverty rate 9.03% in March, before falling to 8.57% in September.' },
];

export function tradeBalance(yearIndex) {
  return +(SERIES.exports.values[yearIndex] - SERIES.imports.values[yearIndex]).toFixed(1);
}

export function density(province) {
  return Math.round((province.pop * 1e6) / province.area);
}

// Every indicator on the site, with the publication it comes from. Shown
// on the Sources page so any figure can be checked back to its origin.
export const SOURCES = [
  { indicator: 'Population', figure: '281.6 million (2024)', source: 'BPS, population projection', detail: 'Mid-year population; Java holds about 56% of it.' },
  { indicator: 'GDP, current prices', figure: 'Rp 22,139 trillion (2024)', source: 'BPS, national accounts', detail: 'Gross domestic product at current market prices.' },
  { indicator: 'Real GDP growth', figure: '5.03% (2024)', source: 'BPS, national accounts', detail: 'Growth of GDP at constant 2010 prices, year on year.' },
  { indicator: 'GDP per capita', figure: 'US$ 4,925 (2024)', source: 'World Bank, World Development Indicators', detail: 'GDP at current US dollars divided by mid-year population.' },
  { indicator: 'Inflation', figure: '1.57% (December 2024, y-on-y)', source: 'BPS, consumer price index', detail: 'CPI basket in 90 cities, weights from the 2022 cost-of-living survey.' },
  { indicator: 'Unemployment rate', figure: '4.76% (August 2024)', source: 'BPS, labour force survey (Sakernas)', detail: 'Open unemployment as a share of the labour force.' },
  { indicator: 'Poverty rate', figure: '8.57% (September 2024)', source: 'BPS, poverty statistics', detail: 'Share of the population below the national poverty line; 24.06 million people.' },
  { indicator: 'Exports / imports of goods', figure: 'US$ 264.7 bn / US$ 233.7 bn (2024)', source: 'BPS, foreign trade statistics', detail: 'Merchandise trade; 2024 surplus US$ 31.0 billion.' },
  { indicator: 'Life expectancy at birth', figure: '74.2 years (2024)', source: 'BPS', detail: 'Based on census and survey mortality data.' },
  { indicator: 'Human Development Index', figure: '75.02 (2024)', source: 'BPS', detail: 'Composite of health, education and living-standard indices; above 70 is high.' },
  { indicator: 'Total fertility rate', figure: '2.12 births per woman (2024)', source: 'World Bank, World Development Indicators', detail: 'Births a woman would have over her lifetime at current age-specific rates.' },
  { indicator: 'Urban population', figure: '58.8% of the population (2024)', source: 'World Bank, World Development Indicators', detail: 'Share of the population living in areas defined as urban.' },
  { indicator: 'Mean years of schooling', figure: '9.1 years (2024)', source: 'BPS', detail: 'Average schooling completed by the population aged 25 and over.' },
  { indicator: 'Internet users', figure: '221.6 million (2024)', source: 'APJII survey', detail: 'Indonesian Internet Service Providers Association annual survey.' },
  { indicator: 'Age structure', figure: 'Median age 30.5 years (2024)', source: 'BPS, population projection', detail: 'Five-year age bands; more than half the population is under 31.' },
  { indicator: 'Provinces', figure: '12 largest provinces (2024)', source: 'BPS, population projection and area figures', detail: 'Population, land area and approximate share of national GDP per province.' },
];
