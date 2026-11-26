# Superman AI

Superman has two genuine model execution modes. Neither mode silently substitutes a rules-only chatbot.

## Default: on-device AI on GitHub Pages

`dist/ai-config.json` selects `browser`. The UI calls `createSuperman()` from `dist/superman-engine.js`. Loading starts only when the visitor explicitly calls `loadModel()` by clicking the model start/download control. `reply()` without a loaded model rejects with `MODEL_NOT_LOADED`.

The runtime is pinned to `@mlc-ai/web-llm@0.2.89`, loaded from jsDelivr. `dist/superman-worker.js` runs the model outside the UI thread. The selected model is `Qwen3-0.6B-q4f16_1-MLC`, from MLC's official prebuilt model list. Official model metadata reports 335,372,288 bytes of weights; tokenizers, WebAssembly and runtime increase the initial transfer, so the interface budgets approximately **370 MB**. Official estimated GPU memory is **1,403.34 MB**, rounded to **1.4 GB**. Download/cache behavior varies by browser and network.

WebGPU and `shader-f16` support are checked before downloading. An unsupported browser or device receives a clear error. The compact model can be slow or inaccurate, especially in less common languages; kk/ru/en are requested in prompts, but fluency is not guaranteed. This is a local model, not a claim of ChatGPT-level quality. Runtime and model files are fetched publicly from jsDelivr, GitHub, and Hugging Face; chat text is processed locally in browser mode and is not sent to a model provider.

Only up to eight real catalog entries are placed in local context. Existing filters, explicit KZT budgets, purpose words and model/brand matches select the shortlist. This retrieval step is deterministic; the actual conversational response comes from the LLM. JSON grammar restricts recommendation IDs, and application validation checks them again. Card reasons/specs come from catalog data. Model-written guidance can still be mistaken and must not be treated as verified product specifications.

```js
import { createSuperman } from './superman-engine.js';
const ai = createSuperman({
  getCatalog: () => data,
  getFilters: () => filters,
  getLocale: () => language, // kk | ru | en
  onProgress: report => updateProgress(report),
});
await ai.loadModel(); // explicit visitor action; downloads approximately 370 MB first time
const result = await ai.reply(message, [{ role: 'user', content: 'Earlier question' }]);
// result: { reply, recommendations: [{ id, reason }], provider: 'on-device', locale, model }
ai.interrupt();
await ai.reset();
await ai.unload();
```

Render `reply`, reasons and error messages with `textContent`, never `innerHTML`. Display status/progress using the `status` and numeric `progress` fields. The raw progress `detail` is optional technical text.

## Optional: hosted model API

GitHub Pages serves static files and does not run this Node/Worker backend. To use a hosted model, deploy the server separately and set public `dist/ai-config.json` to:

```json
{ "mode": "remote", "endpoint": "https://your-api-host.example/api/chat" }
```

Only the endpoint belongs in browser configuration. Provider credentials must remain in the server host's secret/environment settings. There is no provider key in this project.

`createChatHandler({catalog, env})` in `server/chat.mjs` is a portable Fetch `Request => Response` handler. `catalog` can be an array, `{laptops:[...]}`, or an async loader. Create the handler once so limiter state survives requests. The Node adapter uses the socket's peer address, not spoofable forwarded headers. Cloudflare's Worker adapter uses its platform-overwritten `CF-Connecting-IP` header.

Required settings: `AI_API_KEY`, `AI_MODEL`. `AI_BASE_URL` defaults to `https://api.openai.com/v1`. The model/provider must support `/chat/completions`, `max_completion_tokens`, and JSON structured output. Default mode is `json_schema`; set `AI_RESPONSE_FORMAT=json_object` only for a provider that supports JSON mode but not schemas. No automatic fallback triggers extra billable calls.

Set `AI_ALLOWED_ORIGINS` to exact visitor origins, including the GitHub Pages origin (`https://username.github.io`, without repository path). For a deployed Node server, configure `AI_SERVER_ORIGIN` to its public origin. Same-origin calls are accepted; cross-origin calls must match the list. CORS is browser access control, not authentication: non-browser clients can still call a public endpoint.

Local standalone API:

```sh
node --env-file=.env.local server/standalone.mjs
```

This binds to `127.0.0.1:8787`; set `AI_BIND_HOST` explicitly for a deployment. `/api/health` exposes only service name and whether required settings are present, not whether a paid provider call has succeeded. Add `.env` and `.env.*` (except `.env.example`) to `.gitignore` before creating local secret files.

To integrate into the existing local preview server, create `createNodeChatHandler({catalog, env:process.env})` once, route `/api/chat` to it, and continue serving static files as before. This integration is separate from the core backend implementation.

The optional `server/worker.mjs` entry can be bundled for a separate Cloudflare Worker. Set `CATALOG_URL` to the fixed public catalog URL. It caches the catalog for 15 minutes. No deployment or cloud resource is created by these files.

## API contract

`POST /api/chat`, `Content-Type: application/json`:

```json
{
  "message": "Оқуға 500 мың теңгеге дейін ноутбук керек",
  "locale": "kk",
  "history": [{ "role": "user", "content": "Күнде алып жүремін" }],
  "filters": { "purpose": "student", "maxPrice": 500000, "minRam": 16 }
}
```

Success: `{reply, recommendations:[{id,reason}], provider:"model", locale, notice}`. Error: `{error:{code,message},locale}` with HTTP 400/403/413/415/422/429/502/503/504 as appropriate. Missing credentials return `503 AI_NOT_CONFIGURED`. They do not return fake AI answers. Messages and histories are sent to the configured provider only in remote mode.

Supported filter fields: purpose, maxPrice, minRam, minStorage, gpuType, gpuQuery, cpuFamily, maxWeight, minScreen, maxScreen, os, brands, query. Client-supplied system/developer history messages are rejected. Provider text/IDs are validated; HTML and external URLs are rejected. Recommendation reasons are assembled from trusted catalog facts rather than model-invented measurements.

## Limits and deployment considerations

Default per-process/per-isolate limits are 6 requests per peer per minute, 250 requests per day globally, three concurrent provider calls, 25-second provider timeout, a 20 KB request body, 1,600-character current message, eight history messages, and a 1,400-token completion limit. Node adapters derive peer identity from the socket. A deployment behind a reverse proxy must use its documented trusted client identity rather than blindly accepting arbitrary `X-Forwarded-For` values.

These counters are **in-memory**, so restarts reset them and multiple instances do not share them. They are suitable for a small controlled preview, not a global spending guarantee. Before a public paid API launch, use a shared limiter/host access controls and provider spending limits. Application errors never return provider response bodies or credentials.

## Verification

`node --test tests/chat.test.mjs tests/superman-engine.test.mjs` covers provider requests, locale, CORS, input bounds, fake IDs, HTML, unknown prices, rate limits, on-device explicit loading, unsupported GPU and remote mode. Provider/model calls in tests are mocked. CDN/model metadata endpoints and runtime APIs were verified; successful end-to-end model inference still needs a compatible browser and model download.

## Primary references

- [OpenAI quickstart](https://developers.openai.com/api/docs/quickstart)
- [Chat Completions request contract](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)
- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=chat)
- [WebLLM basic usage](https://webllm.mlc.ai/docs/user/basic_usage.html)
- [WebLLM Web Worker integration](https://webllm.mlc.ai/docs/user/advanced_usage.html#using-web-workers)
- [Pinned runtime package](https://www.jsdelivr.com/package/npm/@mlc-ai/web-llm?version=0.2.89)
- [MLC Qwen3 model](https://huggingface.co/mlc-ai/Qwen3-0.6B-q4f16_1-MLC)
- [WebLLM official model records](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts)
- [GitHub Pages static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
