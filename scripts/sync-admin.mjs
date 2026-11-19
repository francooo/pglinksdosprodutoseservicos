// Copia para admin-app/ os arquivos que o projeto do admin compartilha com a página pública.
// Cada projeto da Vercel só enxerga a própria pasta, por isso as cópias ficam versionadas.
// Uso: npm run sync-admin            (copia)
//      npm run sync-admin -- --check (só confere; sai com erro se alguma cópia estiver desatualizada)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const FILES = [
  ['api/_lib/db.js', 'admin-app/api/_lib/db.js', 'js'],
  ['api/_lib/http.js', 'admin-app/api/_lib/http.js', 'js'],
  ['css/tokens.css', 'admin-app/shared/tokens.css', 'css'],
  ['js/data.js', 'admin-app/shared/data.js', 'js'],
  ['assets/avatar-andrews-franco.jpg', 'admin-app/shared/avatar-andrews-franco.jpg', 'bin'],
  ['assets/favicon.svg', 'admin-app/shared/favicon.svg', 'bin']
];
const check = process.argv.includes('--check');
let stale = 0;

for (const [src, dst, kind] of FILES) {
  let body = readFileSync(root + src);
  if (kind !== 'bin') {
    const note = `CÓPIA gerada por scripts/sync-admin.mjs a partir de ${src}. Não edite aqui: edite o original e rode npm run sync-admin.`;
    body = Buffer.from((kind === 'css' ? `/* ${note} */\n` : `// ${note}\n`) + body.toString('utf8'));
  }
  const current = existsSync(root + dst) ? readFileSync(root + dst) : null;
  const same = current && current.equals(body);
  if (check) {
    if (!same) { stale++; console.log('desatualizado:', dst); }
    continue;
  }
  if (!same) {
    mkdirSync(dirname(root + dst), { recursive: true });
    writeFileSync(root + dst, body);
    console.log('copiado:', src, '→', dst);
  }
}
if (check) {
  if (stale) { console.error(`${stale} arquivo(s) desatualizado(s). Rode: npm run sync-admin`); process.exit(1); }
  console.log('Cópias do admin em dia.');
} else {
  console.log('Sincronização concluída.');
}
