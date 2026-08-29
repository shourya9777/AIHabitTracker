# AI Habit Tracker — React → EJS conversion

This is the frontend converted from a React SPA (Vite + React Router) to a
server-rendered **Express + EJS** app. The backend is untouched.

## What changed & why

EJS is a server-side templating engine, not a frontend framework, so a
literal drop-in isn't possible — a few things had to change shape to keep
the same look and behaviour:

| Old (React)                          | New (EJS)                                                   |
|---------------------------------------|--------------------------------------------------------------|
| `react-router-dom` client routes      | Real Express routes (`/`, `/login`, `/dashboard`, ...)       |
| JSX components                        | `.ejs` views + partials (`views/partials/*.ejs`)             |
| `useState`/`useEffect`/Context        | Plain vanilla JS modules in `public/js/*.js`                 |
| `AuthContext` / `ProtectedRoute`      | `public/js/auth-guard.js` (checks the JWT client-side, same as before) |
| `axios` instance                      | `public/js/api.js` (fetch wrapper, same interceptor behaviour) |
| `recharts` charts (Insights/Stats)    | `Chart.js` (CDN) in `public/js/charts.js`                     |
| Hand-rolled SVG/CSS charts (heatmap, progress ring, weekly grid) | Reimplemented as HTML strings in `public/js/*.js`, same markup/classes |
| `react-markdown`                      | `marked` (CDN) in `public/js/markdown.js`                     |
| `lucide-react` / `react-icons`        | `lucide` static build (CDN) via `data-lucide` attributes      |
| `canvas-confetti` (already vanilla under the hood) | same library, loaded via CDN               |
| `date-fns`                            | Reimplemented the handful of used helpers with native `Date` in `public/js/date-helpers.js` (no bundler to tree-shake a big date lib for a few functions) |
| Tailwind (Vite plugin)                | Same `index.css` → built with the Tailwind CLI                |

The JWT auth model is unchanged: the token still lives in `localStorage`
and is sent as a `Bearer` header — that's why pages still need a small
client-side guard script rather than true server-side sessions.

`@dnd-kit` was a dependency in the original `package.json` but wasn't
actually used anywhere in the source, so it was dropped.

## Pages converted (all of them)

- Landing (incl. the orbiting-habits hero animation)
- Login / Register
- Dashboard — habits list, toggle/complete with confetti, create/edit/
  delete/archive modal, AI weekly report, morning motivation, streak
  recovery card, weekly grid, 90-day heatmap, AI habit-suggestion wizard
- Habits — full list, search, category filter, active/archived tabs
- Weekly — week navigation, summary cards, weekly grid
- Insights — AI weekly report (cached per week like the original),
  completions-by-day / week-vs-week / category charts, per-habit
  performance bars, active streak board
- Stats — highlight cards (best/longest/needs attention), 7-day and
  30-day bar charts, category pie chart, top-habits list, per-habit
  cards, plus the floating AI chat widget

## Running it

```bash
cd frontend
npm install
cp .env.example .env       # point API_URL at your backend
npm run build:css          # compiles public/css/input.css -> output.css
npm start                  # or `npm run dev` to also watch CSS
```

The backend is unchanged — run it exactly as before (see the original
`backend/` folder and its own README instructions).

## Not yet run/tested

I wrote this without network access (couldn't `npm install`), so it's
carefully written against the original React logic but not
execution-tested. Do `npm install && npm run build:css && npm start`
early and flag anything that misbehaves — happy to fix it.
