import http from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function createRuntimeProxyServer({ targetPort }) {
return http.createServer((req, res) => {
  const upstream = http.request({ hostname: '127.0.0.1', port: targetPort, method: req.method, path: req.url, headers: { ...req.headers, host: `127.0.0.1:${targetPort}` } }, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
    upstreamRes.pipe(res);
  });
  const cancelled = () => { if (!res.writableEnded) upstream.destroy(); };
  res.once('close', cancelled); req.once('aborted', cancelled);
  upstream.on('error', () => { if (res.destroyed) return; if (!res.headersSent) res.writeHead(502); res.end('Upstream unavailable'); });
  req.pipe(upstream);
});
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
const listenPort = Number(process.env.RUNTIME_PROXY_PORT);
const targetPort = Number(process.env.RUNTIME_PROXY_TARGET_PORT);
if (!Number.isInteger(listenPort) || !Number.isInteger(targetPort) || listenPort === targetPort) throw new Error('Distinct runtime proxy ports are required');
const server = createRuntimeProxyServer({ targetPort });
server.listen(listenPort, '127.0.0.1', () => console.log(`UI proxy listening on 127.0.0.1:${listenPort}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
