import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 4173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(reqUrl.pathname);
    if (pathname === '/') pathname = '/index.html';

    const resolvedPath = path.resolve(ROOT_DIR, `.${pathname}`);
    if (!resolvedPath.startsWith(ROOT_DIR + path.sep) && resolvedPath !== ROOT_DIR) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    const stat = await fs.stat(resolvedPath);
    const targetFile = stat.isDirectory() ? path.join(resolvedPath, 'index.html') : resolvedPath;
    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const body = await fs.readFile(targetFile);

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(body);
  } catch (err) {
    const code = err && err.code === 'ENOENT' ? 404 : 500;
    res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(code === 404 ? 'Not Found' : 'Internal Server Error');
  }
});

export { server };

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Armorer's Bench dev server running at http://127.0.0.1:${PORT}/`);
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
