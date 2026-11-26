import { createChatHandler, CHAT_LIMITS } from './chat.mjs';

/** Create once per server so rate limits survive between requests. */
export function createNodeChatHandler(options = {}) {
  const handle = createChatHandler(options);
  return async function handleNodeChat(req, res) {
    try {
      const chunks = []; let length = 0;
      for await (const chunk of req) {
        length += chunk.length;
        if (length > CHAT_LIMITS.requestBytes) {
          res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
          res.end(JSON.stringify({ error: { code: 'REQUEST_TOO_LARGE', message: 'Message is too large.' } }));
          return;
        }
        chunks.push(chunk);
      }
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      // Fixed server URL; never trust forwarded Host/IP headers from direct clients.
      const origin = options.env?.AI_SERVER_ORIGIN || `http://127.0.0.1:${req.socket.localPort}`;
      const request = new Request(new URL('/api/chat', origin), { method: req.method, headers, ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: Buffer.concat(chunks) }) });
      const response = await handle(request, { clientKey: req.socket.remoteAddress || 'shared-anonymous' });
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ error: { code: 'AI_UNAVAILABLE', message: 'The AI service is unavailable.' } }));
    }
  };
}
