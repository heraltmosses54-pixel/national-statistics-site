// main.js — router and control wiring. Hash routes, no page reloads:
// #/ dashboard, #/population, #/people, #/economy, #/prices, #/employment,
// #/regions, #/explorer, #/sources. Every control on the pages is wired here.

import {
  provinceTable, renderDashboard, renderEconomy, renderEmployment,
  renderExplorer, renderPeople, renderPopulation, renderPrices, renderRegions,
  renderSources,
} from './views.js';

const state = {
  sortKey: 'pop',
  sortDir: 'desc',
  indicator: 'population',
  fromYear: 2019,
  toYear: 2024,
  compare: 'gdpGrowth',
  regionFilter: '',
};

const ROUTES = {
  '': renderDashboard,
  '/': renderDashboard,
  '/population': () => renderPopulation(state),
  '/people': renderPeople,
  '/economy': renderEconomy,
  '/prices': renderPrices,
  '/employment': renderEmployment,
  '/regions': () => renderRegions(state),
  '/explorer': () => renderExplorer(state),
  '/sources': renderSources,
};

function currentRoute() {
  const hash = window.location.hash || '#/';
  return hash.startsWith('#') ? hash.slice(1) : hash;
}

function render() {
  const route = currentRoute();
  const view = ROUTES[route] || ROUTES['/'];
  const el = document.getElementById('view');
  el.innerHTML = view();
  document.querySelectorAll('.site-nav a').forEach((a) => {
    const target = a.getAttribute('href');
    a.classList.toggle('active', target === `#${route}` || (route === '' && target === '#/'));
    a.setAttribute('aria-current', a.classList.contains('active') ? 'page' : 'false');
  });
  window.scrollTo(0, 0);
  bindControls();
}

function bindControls() {
  document.querySelectorAll('.sort-btn:not([data-bound])').forEach((btn) => {
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      state.sortKey = btn.dataset.sort;
      state.sortDir = btn.dataset.dir;
      render();
    });
  });
  const indicator = document.getElementById('explorer-indicator');
  const from = document.getElementById('explorer-from');
  const to = document.getElementById('explorer-to');
  const compare = document.getElementById('explorer-compare');
  if (indicator && !indicator.dataset.bound) {
    indicator.dataset.bound = '1';
    indicator.addEventListener('change', () => { state.indicator = indicator.value; render(); });
    from.addEventListener('change', () => { state.fromYear = Number(from.value); render(); });
    to.addEventListener('change', () => { state.toYear = Number(to.value); render(); });
    if (compare) compare.addEventListener('change', () => { state.compare = compare.value || ''; render(); });
  }
  const regionSearch = document.getElementById('region-search');
  if (regionSearch && !regionSearch.dataset.bound) {
    regionSearch.dataset.bound = '1';
    regionSearch.addEventListener('input', () => {
      state.regionFilter = regionSearch.value;
      // Re-render just the table, so the search box keeps focus.
      const cardEl = regionSearch.closest('.card');
      const html = provinceTable(state.sortKey, state.sortDir, state.regionFilter);
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const oldTable = cardEl.querySelector('.table-wrap');
      const oldNote = cardEl.querySelector('.source-note');
      if (oldTable) oldTable.replaceWith(tmp.querySelector('.table-wrap'));
      if (oldNote) oldNote.replaceWith(tmp.querySelector('.source-note'));
      bindControls();
    });
  }
}

window.addEventListener('hashchange', render);
render();
