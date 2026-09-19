# APEX

APEX is a fictional racing telemetry intelligence system built as an interactive engineering-room interface. It explores speed, driver behavior, sectors, fuel, tires, G-force, and lap rhythm using clearly labeled simulated data.

## Features

- Driver, lap, and sector selectors that update the full telemetry surface
- Deterministic telemetry generation with internally consistent speed, RPM, throttle, brake, gear, fuel, and G-force relationships
- Responsive telemetry chart with synchronized hover cursor and sector emphasis
- SVG Monarch GP circuit map with live car marker
- Live and replay modes with play, pause, restart, and scrub controls
- Sector analysis, session summary, fuel state, tire state, and driver context
- Responsive engineering layout for desktop and mobile
- Keyboard-focusable controls and reduced-motion support

## Stack

React 19, TypeScript, Vite, Recharts, Lucide React, Framer Motion dependency available for future motion surfaces, and CSS custom properties for the visual system.

## Run Locally

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
npm run preview
```

## Architecture

The telemetry model lives in `src/data.ts`. Drivers, laps, telemetry points, sector ranges, and calculation helpers are kept outside the UI. `src/App.tsx` owns the current session selection and composes the workstation panels. `src/App.css` contains the dark graphite, red-accented engineering visual system and responsive layouts.

Telemetry is generated deterministically from driver characteristics and lap number. No `Math.random()` values or external telemetry services are used. The application is a fictional demo and makes no claim of affiliation with any real driver, team, circuit, or series.

## Known Limitations

The current portfolio slice focuses on the primary overview and telemetry workflow. Navigation labels are present for the broader product information architecture, while the data layer is intentionally compact and uses the Monarch GP circuit as the active session.
