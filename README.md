# Armorer's Bench (`FM 9-1005`)

An interactive, zero-build modular firearm configurator, ballistics calculator, production Bill of Materials (BOM) estimator, and 2D indoor firing range styled after a U.S. military technical field manual.

---

## Key Features

* **Interactive Assembly Workbench (`svgRenderer.js`):**
  * Dynamic vector weapon assembly adapting across 8 platform layouts (`carbine`, `ak`, `bullpup`, `smg`, `sniper`, `shotgun`, `lmg`, `pistol`).
  * Supports **Exploded View** (separating receivers, stocks, magazines, LMG hinged feed covers, barrels, optics, muzzles, and underbarrel gear), **Cerakote Finishes**, and clickable **Callout Labels** for all 10 stations.
* **Collapsible Component Selector & SVG Cards (`partSvg.js`, `uiRenderer.js`):**
  * Clicking any part or callout label on the gun sketch opens the collapsible left sidebar for that component slot.
  * Each part card renders a centered procedural vector thumbnail, price/weight, and top stat highlights, while full descriptions, material breakdowns, and live stat deltas appear in the floating inspection tooltip (`tooltip.js`).
* **Technical Data Sheet & BOM (`ballistics.js`, `manufacturing.js`):**
  * Live composite stats (Damage, Fire Rate, Range, Accuracy, Control, Mobility, Penetration), derived metrics (Muzzle Velocity, ADS Time, Reload Cycle, Sound Pressure dB, DPS, Est. TTK, MOA), 0–120m ballistic retention curve, baseline pinning, and mechanical synergy detection.
  * Aggregated raw feedstock Bill of Materials (in grams and USD), CNC machinist labor pay, and manufacturing hours across 14 commodity materials.
* **Mechanical Compatibility Engine (`compatibility.js`):**
  * Cross-slot validation enforcing firearm architecture, coilgun vs. chemical action isolation, physical hardware clearances (bayonets, suppressors, UBGLs, integral SD shrouds, double bipods), and caliber/platform rules, with automatic multi-pass incompatibility resolution.
* **Indoor Firing Range & Procedural Audio (`firingRange.js`, `audio.js`):**
  * Interactive 2D target canvas at `25 m / 50 m / 100 m` with distance-based damage falloff, time-decayed vertical recoil stack, barrel heat/cooling penalties, 8-pellet shotgun spread, fire selector (`AUTO`, `BURST`, `SEMI`, `BOLT-ACTION`), and Web Audio API synthesized gunshots and multi-stage reloads.
* **Presets, JSON Import/Export & Persistence (`presets.js`, `state.js`):**
  * 14 real-world-inspired presets, build randomization, `localStorage` saved-builds rack, and validated JSON manifest export/import.

---

## Running Locally

Because the app uses native ES Modules (`<script type="module">`), it must be served over HTTP rather than opened directly via `file://`.

### Start the built-in static server (Node.js v20+)

```bash
node scripts/dev-server.js
```

Or via npm:

```bash
npm start
# On Windows PowerShell if npm.ps1 is blocked by execution policy:
npm.cmd start
```

Then open: **http://127.0.0.1:4173/**

*(Custom port: set the `PORT` environment variable, e.g. `PORT=8080 node scripts/dev-server.js`.)*

---

## Running Unit Tests

The test suite uses Node's built-in `node:test` runner with zero external dependencies:

```bash
node --test tests/ballistics.test.js tests/compatibility.test.js tests/manufacturing.test.js tests/partSvg.test.js
```

Or via npm (`npm test` / `npm.cmd test`).

---

## Controls & Shortcuts

| Action | Effect |
| :--- | :--- |
| **Click gun part or callout label** | Opens the left sidebar for that component slot |
| **Click `×` or press `Esc`** | Collapses the left sidebar (or closes the JSON modal) |
| **Hover component card** | Previews stat deltas on the Technical Data Sheet and opens detailed tooltip |
| **Click `Test Fire` or press `Space`** | Fires a test round with recoil/brass/flash animations and audio |
| **Press `R`** | Reloads magazine and resets barrel heat |
| **Hold Left-Click on Range Canvas** | Fires according to the active fire mode (`SEMI` / `BURST` / `AUTO` / `BOLT-ACTION`) |

---

## Project Structure

```text
├── index.html                 # Field-manual 3-region layout & modals
├── package.json               # ESM scripts (start, test)
├── css/styles.css             # Drafting mat grid, metric ruler & keyframes
├── scripts/dev-server.js      # Zero-dependency static HTTP server
├── js/
│   ├── main.js                # App initialization & event orchestration
│   ├── state.js               # Centralized state & localStorage persistence
│   ├── audio.js               # Web Audio API procedural sound synthesis
│   ├── tailwind-config.js     # Custom paper/ink/olive/rust Tailwind theme
│   ├── data/
│   │   ├── catalog.js         # 10 categories, 90+ parts, finishes, material $/g rates
│   │   └── presets.js         # 14 pre-configured weapon builds
│   ├── engine/
│   │   ├── ballistics.js      # Stat computation, synergies, falloff & memoization
│   │   ├── compatibility.js   # Cross-slot mechanical rules & auto-resolver
│   │   ├── manufacturing.js   # Raw feedstock grams, scrap factors & labor BOM
│   │   └── utils.js           # Helpers (clamp, getPartById, formatGrams, escapeHtml)
│   └── ui/
│       ├── svgRenderer.js     # Main 920×380 procedural weapon assembly SVG
│       ├── partSvg.js         # 180×68 component card thumbnail SVGs
│       ├── uiRenderer.js      # Sidebar cards, spec sheet, falloff chart & BOM
│       ├── tooltip.js         # Floating comparison & material breakdown tooltip
│       └── firingRange.js     # 2D range canvas, recoil, cooling & burst fire
└── tests/
    ├── ballistics.test.js
    ├── compatibility.test.js
    ├── manufacturing.test.js
    └── partSvg.test.js
```
