// Grava os links de js/data.js na tabela links.
// Uso: npm run db:seed            (só insere os que ainda não existem)
//      npm run db:seed -- --force (sobrescreve os existentes com o conteúdo do data.js)
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) { console.error('Defina DATABASE_URL no .env'); process.exit(1); }
const sql = neon(url);
const force = process.argv.includes('--force');

const code = readFileSync(new URL('../js/data.js', import.meta.url), 'utf8');
const { L, FOOT } = vm.runInNewContext(code + '\n;({ L, FOOT })', {});

const footerOf = title => {
  for (const col of FOOT) if (col.items.includes(title)) return col.h.toLowerCase();
  return null;
};

let inserted = 0, updated = 0;
for (const [i, x] of L.entries()) {
  if (!x.id) throw new Error(`Item sem id em data.js: ${x.t}`);
  const row = [x.id, x.t, x.d || '', x.u, x.c, x.i, x.tag || null, (i + 1) * 10, footerOf(x.t)];
  const res = force
    ? await sql.query(`INSERT INTO links (id,title,description,url,category,icon,tag,position,footer)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO UPDATE SET title=$2, description=$3, url=$4, category=$5, icon=$6, tag=$7,
          position=$8, footer=$9, updated_at=now()
        RETURNING (xmax = 0) AS inserted`, row)
    : await sql.query(`INSERT INTO links (id,title,description,url,category,icon,tag,position,footer)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO NOTHING RETURNING true AS inserted`, row);
  if (res[0]?.inserted) inserted++; else if (res.length) updated++;
}
const [{ count }] = await sql`SELECT count(*)::int AS count FROM links`;
console.log(`Inseridos: ${inserted} · atualizados: ${updated} · total na tabela: ${count}`);
