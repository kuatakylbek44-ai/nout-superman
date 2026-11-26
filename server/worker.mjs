import { createChatHandler, isAiConfigured } from './chat.mjs';

// Bundle this entry for a Cloudflare Worker. CATALOG_URL must point to the public
// data.json published by the same app; it is configuration, never a client input.
const handlers = new WeakMap();
function handlerFor(env) {
  if (handlers.has(env)) return handlers.get(env);
  let cached, expires = 0;
  const catalog = async () => {
    if (cached && expires > Date.now()) return cached;
    const url = new URL(env.CATALOG_URL);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid catalog URL');
    const response = await fetch(url, { signal: AbortSignal.timeout(8000), redirect: 'error' });
    if (!response.ok || Number(response.headers.get('Content-Length')) > 8000000) throw new Error('Catalog unavailable');
    const value = await response.json();
    if (!Array.isArray(value.laptops)) throw new Error('Invalid catalog');
    cached = value; expires = Date.now() + 900000;
    return value;
  };
  const handler = createChatHandler({ catalog, env });
  handlers.set(env, handler);
  return handler;
}
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/health' && request.method === 'GET') return Response.json({ service: 'Superman', configured: isAiConfigured(env) }, { headers: { 'Cache-Control': 'no-store' } });
    if (path !== '/api/chat') return new Response('Not found', { status: 404 });
    // Cloudflare overwrites CF-Connecting-IP. Other hosts must use a trusted peer ID.
    return handlerFor(env)(request, { clientKey: request.headers.get('CF-Connecting-IP') || 'shared-anonymous' });
  },
};
