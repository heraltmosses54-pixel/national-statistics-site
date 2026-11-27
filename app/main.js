// main.js — router and control wiring. Hash routes, no page reloads:
// #/ dashboard, #/population, #/economy, #/prices, #/employment,
// #/regions, #/explorer. Every control on the pages is wired here.

import {
  renderDashboard, renderEconomy, renderEmployment, renderExplorer,
  renderPopulation, renderPrices, renderRegions,
} from './views.js';

const state = {
  sortKey: 'pop',
  sortDir: 'desc',
  indicator: 'population',
  fromYear: 2019,
  toYear: 2024,
};

const ROUTES = {
  '': renderDashboard,
  '/': renderDashboard,
  '/population': () => renderPopulation(state),
  '/economy': renderEconomy,
  '/prices': renderPrices,
  '/employment': renderEmployment,
  '/regions': () => renderRegions(state),
  '/explorer': () => renderExplorer(state),
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
  document.querySelectorAll('.sort-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.sortKey = btn.dataset.sort;
      state.sortDir = btn.dataset.dir;
      render();
    });
  });
  const indicator = document.getElementById('explorer-indicator');
  const from = document.getElementById('explorer-from');
  const to = document.getElementById('explorer-to');
  if (indicator) {
    indicator.addEventListener('change', () => { state.indicator = indicator.value; render(); });
    from.addEventListener('change', () => { state.fromYear = Number(from.value); render(); });
    to.addEventListener('change', () => { state.toYear = Number(to.value); render(); });
  }
}

window.addEventListener('hashchange', render);
render();
