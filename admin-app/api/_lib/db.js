// CÓPIA gerada por scripts/sync-admin.mjs a partir de api/_lib/db.js. Não edite aqui: edite o original e rode npm run sync-admin.
import { neon } from '@neondatabase/serverless';

let client;

/** Cliente SQL do Neon (HTTP). Use como tagged template: await db()`select ...` ou db().query(text, params). */
export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL não configurada');
    client = neon(url);
  }
  return client;
}

/** Categorias fixas da página, na ordem de exibição. */
export const CATEGORIES = ['negocios', 'cursos', 'conteudo', 'lojas'];
