// Servidor local para testar a página, o admin e as rotas /api sem precisar da Vercel.
// Uso: npm run dev   →  http://localhost:3000  e  http://localhost:3000/admin
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = +process.env.PORT || 3000;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon'
};

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  try {
    if (path.startsWith('/api/')) {
      const file = join(root, normalize(path).replace(/[/\\]+$/, '') + '.js');
      if (!file.startsWith(join(root, 'api')) || file.includes('_lib')) throw Object.assign(new Error(), { code: 'ENOENT' });
      await stat(file);
      const mod = await import(pathToFileURL(file).href + '?t=' + Date.now());
      return await mod.default(req, res);
    }
    let file = join(root, normalize(path));
    if (!file.startsWith(root)) throw Object.assign(new Error(), { code: 'ENOENT' });
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
    else if (!extname(file) && await stat(file + '.html').catch(() => null)) file += '.html';
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch (e) {
    if (e.code !== 'ENOENT') console.error(e);
    if (!res.headersSent) {
      res.writeHead(e.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(e.code === 'ENOENT' ? 'Não encontrado' : 'Erro');
    }
  }
}).listen(port, () => console.log(`http://localhost:${port}  ·  admin: http://localhost:${port}/admin`));
