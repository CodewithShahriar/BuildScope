# BuildScope

BuildScope is a custom construction cost estimating application for San Francisco projects. It helps users model project scope, compare scenarios, review cost breakdowns, assess schedule and risk, and generate a polished estimate report from a modern web interface.

## Preview

### New Estimate

![BuildScope new estimate preview](img/Screenshot%202026-05-22%20150930.png)

### Scenario Comparison

![BuildScope scenario comparison preview](img/Screenshot%202026-05-22%20151006.png)

### Cost Breakdown

![BuildScope cost breakdown preview](img/Screenshot%202026-05-22%20151026.png)

## Features

- Live construction cost estimates based on size, property type, location zone, finish quality, site access, permit complexity, and schedule urgency.
- Step-by-step project wizard with immediate cost, timeline, and risk feedback.
- Dashboard views for final cost, cost per square foot, timeline, confidence, risk score, and cost distribution.
- Scenario comparison for finish tiers, sustainability upgrades, and fast-track scheduling.
- Detailed line-item cost breakdown.
- Report preview for sharing project assumptions and estimate outputs.
- Browser-local saved projects.
- Responsive interface built for desktop and mobile use.

## Tech Stack

- React 19
- TanStack Start, Router, and Query
- Vite 7
- TypeScript
- Tailwind CSS 4
- Radix UI primitives
- Recharts
- Framer Motion
- Cloudflare Workers/Vite deployment support

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview a production build locally:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

Format the codebase:

```bash
npm run format
```

## Project Structure

```text
src/
  components/       Shared application shell and UI components
  hooks/            Project state and responsive helpers
  lib/              Estimate logic, utilities, and error page rendering
  routes/           TanStack route modules
public/             Static public assets
vite.config.ts      Vite, TanStack Start, Tailwind, React, and Cloudflare config
wrangler.jsonc      Cloudflare Worker configuration
```

## Core Routes

- `/` - public overview and entry point
- `/wizard` - project estimate wizard
- `/dashboard` - live estimate dashboard
- `/breakdown` - detailed cost breakdown
- `/compare` - scenario comparison
- `/report` - project report preview
- `/projects` - locally saved estimates

## Deployment

The app is configured for a Cloudflare-ready production build through Vite and TanStack Start. `npm run build` outputs the production assets into `dist/`, including the worker bundle generated for deployment.

Before deploying, confirm the Worker name and environment settings in `wrangler.jsonc`.

## Notes

BuildScope estimates are indicative planning tools. Final project budgets should be validated against current contractor pricing, permit requirements, site conditions, and professional review.

## Contributors

1. Macklin Adenine ([https://github.com/CodeCraftsman20](https://github.com/CodeCraftsman20))
2. Abid Shahriar ([https://github.com/CodewithShahriar](https://github.com/CodewithShahriar))
