# Nout — Өзіңе сай ноутбук

A laptop discovery website with Kazakh, Russian and English interfaces, hardware filters, comparisons, real product photos where available, and **Superman**, an optional AI assistant. The site uses HTML, CSS and JavaScript modules and can be hosted on GitHub Pages. No build step or package installation is required for the catalog.

## Run locally

Use Node.js 20.6 or newer. From the project directory:

```sh
node server.mjs
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). Open the site through this HTTP server rather than opening `index.html` directly: the application fetches its JSON files and loads JavaScript modules. Set `PORT` to use another port.

`npm start` runs the same server. On Windows, use `npm.cmd start` if PowerShell blocks `npm.ps1`. The preview server serves static files only; the optional AI API has a separate entry point.

## Features

- Use the dark dashboard with orange accents, a mobile sidebar and an optional light theme. The overview shows actual catalog counts, clickable brand bars and verified photo coverage; saved-laptop counts update as you browse.
- Switch between Қазақша, Русский and English; the selected language is remembered in the browser.
- Browse **1,993 configurations across 27 brands**, with clickable brand filters and editorial popularity ordering.
- Choose student, developer, office, creative, gaming or budget use cases.
- Combine budget, RAM, storage, GPU type/model, CPU family, screen size, operating system and weight filters. Filter by archive/manufacturer source, historical listing condition or photo availability.
- Search product names and hardware specifications, sort results, and use the three-step recommendation wizard.
- Compare up to three configurations and save favorites locally in the browser.
- Open model details, source links and the catalog explanation; download the complete JSON catalog.
- Use a responsive interface with animations, keyboard-accessible controls and reduced-motion support.
- Open Superman for model-generated guidance and validated recommendations from the catalog.

The three-step wizard and ordinary filters use deterministic selection rules. Superman generates its conversational response with an actual language model; retrieval rules only choose the catalog context supplied to it.

## Catalog, prices and photographs

The bundled snapshot is dated **2026-11-27**. Its **24 manufacturer-based configurations** include recent models; **1,969 archived configurations** come from Juan Merino's *Laptops Price Dataset*, collected on **2023-06-25**. Different RAM, CPU and GPU configurations can be separate records. This is a partial catalog, not every laptop ever sold or an automatically updated store feed.

`dist/data.json` contains the catalog itself, so browsing and filtering do not need a database or a live product API. A downloaded copy can also be used independently. The website is not an offline-installable PWA: initial page loading, external fonts and AI model downloads can still need a network connection.

The 24 curated entries use **estimated KZT budget guides**, not verified offers. Archived entries have an unknown current price (`null`); their original EUR prices are historical and are not converted into current KZT prices. Unknown specifications remain unknown. A restrictive price or hardware filter can exclude records without the required value. There is no live stock, price or availability synchronization.

**One to five stars are editorial familiarity estimates.** Five stars mean the highest level on this editorial scale. They are not measured sales, customer ratings, search statistics or benchmark scores.

Photo coverage is partial. Available real product images are matched to a model or model family; color and exact configuration can differ, and related configurations may share a photograph. Missing photos display an explicit placeholder. Image source links are shown in model details. Images remain subject to their respective rights holders; the dataset's license does not automatically license its photographs.

See [DATA-SOURCES.md](DATA-SOURCES.md) for provenance, transformations, unknown fields and attribution. The archive is published under **Apache License 2.0**; its full license and modification notice are retained in the JSON and source documentation.

- [Original dataset and published license](https://www.kaggle.com/datasets/juanmerinobermejo/laptops-price-dataset)
- [Author's repository and collection method](https://github.com/juanmerino89/laptops-data-cleaning)
- [Pinned original CSV](https://raw.githubusercontent.com/juanmerino89/laptops-data-cleaning/dcb60a556527e74dd88e2bb8b0696e77a7c3f7cf/laptops.csv)

## Superman: browser AI

The default `dist/ai-config.json` selects browser mode. Superman uses **Qwen3-0.6B-q4f16_1-MLC** through **WebLLM 0.2.89**, with inference in a Web Worker. The first download starts **only after the visitor presses the AI start button**. Opening the website or chat does not silently download the model.

Allow approximately **370 MB** for the initial model/runtime transfer and approximately **1.4 GB of GPU memory**, plus browser overhead. The device must support **WebGPU and `shader-f16`**. HTTPS or a local development origin is required. Downloads come from public model/runtime hosts; browser caching and available storage affect subsequent starts. The application reports unsupported graphics, download errors and generation failures.

Browser mode processes chat text on the visitor's device, without a provider API key. At most eight matching catalog entries enter the local prompt. Generated recommendation IDs are validated against those entries; displayed card facts come from the catalog. The compact model can still misunderstand requests, give poor advice or struggle with Kazakh. Always verify important specifications at the linked source.

Model/runtime metadata and APIs have been checked, and automated integration tests use mocks. Initial Edge testing passed WebGPU checks but encountered a network error in the browser's Cache API. The engine now uses WebLLM's supported IndexedDB cache backend and reports worker initialization errors promptly; the subsequent loading attempt was not observed through completion. **Successful end-to-end model inference in a compatible browser has not yet been verified.** Do not treat the passing tests or cache change as a device-compatibility or response-quality guarantee.

See [server/README.md](server/README.md) for the engine API, limits and troubleshooting context; [WebLLM documentation](https://webllm.mlc.ai/docs/user/basic_usage.html) describes its model loading and chat interface.

## Optional hosted AI API

Browser AI works without a hosted API. To use a remote model instead, copy `.env.example` to `.env.local` and configure a compatible provider on the server:

```dotenv
AI_API_KEY=your-server-side-key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=your-supported-model
AI_ALLOWED_ORIGINS=http://127.0.0.1:4173,https://your-account.github.io
```

The provider must support the Chat Completions endpoint and the configured JSON output mode. Then run the separate API:

```sh
node --env-file=.env.local server/standalone.mjs
```

It listens on `http://127.0.0.1:8787` by default. For local testing, set the public `dist/ai-config.json` to:

```json
{
  "mode": "remote",
  "endpoint": "http://127.0.0.1:8787/api/chat"
}
```

For a published site, deploy that API separately, use its HTTPS endpoint and configure exact allowed origins. A GitHub Pages origin is `https://your-account.github.io`, without the repository path. Set `AI_SERVER_ORIGIN` to the deployed Node server's public origin as appropriate. To restore browser inference, set `mode` back to `browser`.

**Keep credentials in server environment settings only.** Never place a provider key in `dist/`, the repository or browser configuration. Local `.env` files are ignored by Git; `.env.example` contains placeholders. Remote mode sends the conversation to the configured provider. Missing credentials return an explicit configuration error.

The API implements input bounds, timeouts, exact-origin CORS, catalog-ID validation and request/concurrency limits. Its rate counters are in memory and reset on restart; multiple instances do not share them. They are not a global spending cap. A public paid deployment needs host/provider spending controls and an appropriate shared limiter. Full setup and the optional Worker adapter are documented in [server/README.md](server/README.md).

## Publish on GitHub Pages

The canonical site is **https://kuatakylbek44-ai.github.io/nout-superman/**. This repository publishes the **contents of `dist/`** from the root of the remote `gh-pages` branch. In **Settings → Pages**, the source is **Deploy from a branch → gh-pages → / (root)**. No bundling command or custom Actions workflow is needed.

After committing and checking the changes on `main`, publish with the existing `github` remote (`https://github.com/kuatakylbek44-ai/nout-superman.git`). From the project directory in PowerShell:

```powershell
git push github main
if ($LASTEXITCODE -ne 0) { throw 'Source push failed' }
$pagesCommit = git subtree split --prefix=dist HEAD
if ($LASTEXITCODE -ne 0) { throw 'Pages source split failed' }
git push github "${pagesCommit}:gh-pages"
if ($LASTEXITCODE -ne 0) { throw 'Pages push failed' }
```

Use the newly generated subtree commit for every publication. An existing local `deploy-pages` branch may point to an older release; do not publish it without regenerating it. A push to `main` alone does not update the Pages site. Wait for the Pages deployment to finish and verify the canonical site and its assets.

The current asset release marker is `v=dashboard-20261127`. It is applied consistently to stylesheet URLs, the entry script, and local JavaScript module imports. For a future release, update every occurrence of that marker together so the browser loads one consistent module graph. GitHub Pages can cache responses for ten minutes; a fresh release URL such as [the dashboard release](https://kuatakylbek44-ai.github.io/nout-superman/?v=dashboard-20261127#overview) or a hard reload also refreshes a previously cached HTML entry point. Keep the canonical URL above for permanent links.

The older `https://nomad-laptop-finder.kobeevalmas2.chatgpt.site/` is a separate Sites deployment. Publishing to GitHub does not update that mirror; it requires its own publication. Relative asset paths support the GitHub repository URL.

GitHub Pages hosts static files and cannot execute `server/standalone.mjs`. The default browser AI mode runs on the visitor's device; remote AI requires a separately hosted endpoint. Deploying this repository does not create that service or configure provider credentials.

## Update data and contacts

Edit `dist/profile.json` for the site's public contact links. Add manufacturer-based configurations to `dist/data.json` with genuine source URLs, verification dates and accurate configuration details. Preserve `null` for facts that cannot be verified.

The reproducible archive import uses a pinned 2023 source file:

```sh
node scripts/import-catalog.mjs
```

Or pass a local source CSV:

```sh
node scripts/import-catalog.mjs /absolute/path/to/laptops.csv
```

The importer preserves existing manufacturer records and photo metadata associated with stable IDs. It recreates the historical archive; it does not fetch today's prices or newly released models. After changes, update source documentation and run the checks below.

## Tests

```sh
npm test
```

On Windows, `npm.cmd test` avoids PowerShell script-policy issues. The equivalent direct command is:

```sh
node --test tests/catalog.test.mjs tests/data.test.mjs tests/dashboard.test.mjs tests/chat.test.mjs tests/superman-engine.test.mjs
```

The tests cover combined filters, unknown values, ranking, catalog provenance and deduplication, historical price handling, localized AI requests, CORS, request limits, fabricated IDs, explicit model loading and unsupported GPU behavior. Provider calls and model inference are mocked. Browser layout, real downloads and actual model output need separate manual verification.

## Main files

| Path | Purpose |
| --- | --- |
| `dist/index.html`, `dist/styles.css`, `dist/app.js` | Static interface and interactions |
| `dist/i18n.js`, `dist/info-content.js` | Three-language UI and catalog explanation |
| `dist/dashboard.css`, `dist/dashboard.js` | Dark/light dashboard, catalogue metrics, brand chart and mobile navigation |
| `dist/catalog.js`, `dist/data.json` | Filter/ranking logic and bundled catalog |
| `dist/assets/photos/` | Available real product photographs |
| `dist/profile.json` | Public owner/contact information |
| `dist/superman-engine.js`, `dist/superman-worker.js` | Browser AI engine and worker |
| `dist/ai-config.json` | Public AI mode/endpoint configuration, no secrets |
| `server/` | Optional provider API, adapters and detailed AI documentation |
| `scripts/import-catalog.mjs` | Reproducible historical dataset import |
| `tests/` | Node.js test suites |
| `DATA-SOURCES.md` | Data attribution, limitations and archive license |
