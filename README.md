# NusaStats — Portal Statistik Indonesia

[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/heraltmosses54-pixel/national-statistics-site/rank.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/heraltmosses54-pixel/national-statistics-site/reward.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)

A national statistics site for Indonesia, running entirely from static files
with no network request, on desktop and on phone. An original design with its
own name, text and charts — no copied brand, text or images.

## What it is

- **Dashboard** — six headline indicators (population, GDP, GDP per capita,
  inflation, unemployment, poverty), growth and inflation charts, latest
  releases, people at a glance.
- **Population** — population trend, an age pyramid, people indicators, and a
  sortable table of the twelve largest provinces.
- **Economy** — GDP and growth charts, GDP by sector (donut and bars), exports
  vs imports, and a trade-balance table.
- **Prices** — inflation series and inflation by CPI expenditure group.
- **Employment** — unemployment series, employment by sector, formal vs
  informal work.
- **Regions** — largest provinces chart and the sortable province table.
- **Data explorer** — pick any indicator and a year range; the chart and the
  table update together.

Every figure is a real published value (BPS and World Bank, latest complete
year 2024), labelled with its source and year. Every nav link leads to a real
page; every control (sorting, indicator and year selectors) works.

## How it is built

- `app/index.html` — the shell: header, navigation, footer.
- `app/style.css` — all styling, including the phone layout.
- `app/data.js` — every figure, with its source.
- `app/charts.js` — hand-written SVG charts (line, bar, grouped bar,
  horizontal bar, donut, population pyramid). No libraries.
- `app/views.js` — one renderer per route.
- `app/main.js` — hash router and control wiring.
- `main.ts` — the hand-in program (Node 22, stdlib only): copies `app/` and
  `screenshots/` to the output directory and writes `dossier.json` with the
  vendored `vendor/makefun-frontend.ts` library.

## Run it

Serve `app/` with any static server and open it in a browser:

```sh
cd app && python3 -m http.server 8080
```

Build the hand-in output:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots live in `screenshots/`; `shots.json` records which view each one
shows.
