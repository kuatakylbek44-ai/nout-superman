import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createNodeChatHandler } from './node-adapter.mjs';
import { isAiConfigured } from './chat.mjs';

const catalog = JSON.parse(await readFile(new URL('../dist/data.json', import.meta.url), 'utf8'));
const handleChat = createNodeChatHandler({ catalog, env: process.env });
const port = Number(process.env.AI_PORT) || 8787;
http.createServer((req, res) => {
  if (req.url?.split('?')[0] === '/api/chat') return handleChat(req, res);
  if (req.url?.split('?')[0] === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ service: 'Superman', configured: isAiConfigured(process.env) }));
    return;
  }
  res.writeHead(404); res.end('Not found');
}).listen(port, process.env.AI_BIND_HOST || '127.0.0.1', () => console.log(`Superman API: http://127.0.0.1:${port}`));
