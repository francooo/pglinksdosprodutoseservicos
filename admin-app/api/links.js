// Gestão dos links (exige admin):
//   GET  /api/admin/links                    — todos os links, inclusive ocultos
//   POST /api/admin/links                    — cria  {title, description, url, category, icon, tag?, footer?, visible?}
//   PUT  /api/admin/links?id=<id>            — altera os campos enviados
//   POST /api/admin/links?action=reorder     — {category, ids:[...]} na nova ordem
import { db, CATEGORIES } from './_lib/db.js';
import { send, query, readJson, handler, httpError } from './_lib/http.js';
import { requireAdmin } from './_lib/auth.js';

export const ICONS = ['cart', 'badge', 'chat', 'home', 'cube', 'spark', 'store', 'ball', 'book', 'mic', 'pen', 'play',
  'game', 'bag', 'shirt', 'heart', 'passport', 'candle', 'building', 'grid'];
const FOOTERS = ['canais', 'lojas'];

const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'link';

/** Valida e normaliza os campos enviados. Com partial=true, só os presentes. */
function clean(b, partial) {
  const out = {};
  const has = k => b[k] !== undefined;
  if (!partial || has('title')) {
    const t = String(b.title || '').trim().replace(/\s+/g, ' ');
    if (!t || t.length > 60) throw httpError(400, 'Título obrigatório (até 60 caracteres)');
    if (t.split(' ').length > 5) throw httpError(400, 'Título com no máximo 5 palavras (regra do design system)');
    out.title = t;
  }
  if (!partial || has('description')) {
    const d = String(b.description || '').trim().replace(/\s+/g, ' ');
    if (d.length > 140) throw httpError(400, 'Descrição com até 140 caracteres (uma linha)');
    out.description = d;
  }
  if (!partial || has('url')) {
    let u;
    try { u = new URL(String(b.url || '').trim()); } catch { throw httpError(400, 'URL inválida'); }
    if (u.protocol !== 'https:') throw httpError(400, 'A URL precisa começar com https://');
    out.url = u.href;
  }
  if (!partial || has('category')) {
    if (!CATEGORIES.includes(b.category)) throw httpError(400, 'Categoria inválida');
    out.category = b.category;
  }
  if (!partial || has('icon')) {
    if (!ICONS.includes(b.icon)) throw httpError(400, 'Ícone inválido');
    out.icon = b.icon;
  }
  if (has('tag')) {
    const tag = String(b.tag || '').trim();
    if (tag.length > 14) throw httpError(400, 'Tag com até 14 caracteres');
    out.tag = tag || null;
  }
  if (has('footer')) {
    if (b.footer && !FOOTERS.includes(b.footer)) throw httpError(400, 'Rodapé inválido');
    out.footer = b.footer || null;
  }
  if (has('visible')) out.visible = !!b.visible;
  return out;
}

const COLS = `id, title, description, url, category, icon, tag, position, visible, footer, created_at, updated_at`;

export default handler(['GET', 'POST', 'PUT'], async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const sql = db();
  const params = query(req);

  if (req.method === 'GET') {
    const links = await sql.query(
      `SELECT ${COLS} FROM links ORDER BY array_position($1::text[], category), position, title`, [CATEGORIES]);
    return send(res, 200, { links, icons: ICONS }, { 'Cache-Control': 'no-store' });
  }

  const b = await readJson(req);

  if (req.method === 'POST' && params.get('action') === 'reorder') {
    if (!CATEGORIES.includes(b.category) || !Array.isArray(b.ids) || b.ids.length > 200) {
      throw httpError(400, 'Dados de ordenação inválidos');
    }
    const ids = b.ids.map(String);
    await sql.query(
      `UPDATE links SET position = x.pos * 10, updated_at = now()
         FROM unnest($1::text[]) WITH ORDINALITY AS x(id, pos)
        WHERE links.id = x.id AND links.category = $2`, [ids, b.category]);
    return send(res, 200, { ok: true });
  }

  if (req.method === 'POST') {
    const f = clean(b, false);
    let id = slugify(f.title);
    const taken = new Set((await sql.query(`SELECT id FROM links WHERE id LIKE $1`, [id + '%'])).map(r => r.id));
    for (let n = 2; taken.has(id); n++) id = `${slugify(f.title)}-${n}`;
    const [row] = await sql.query(
      `INSERT INTO links (id, title, description, url, category, icon, tag, footer, visible, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,
               (SELECT coalesce(max(position), 0) + 10 FROM links WHERE category = $5))
       RETURNING ${COLS}`,
      [id, f.title, f.description, f.url, f.category, f.icon, f.tag ?? null, f.footer ?? null, f.visible ?? true]);
    return send(res, 201, { link: row });
  }

  // PUT
  const id = params.get('id');
  if (!id) throw httpError(400, 'Informe o id');
  const f = clean(b, true);
  const keys = Object.keys(f);
  if (!keys.length) throw httpError(400, 'Nada para alterar');
  if (f.category) {
    // Ao mudar de categoria, o link vai para o fim da nova categoria.
    keys.push('position');
    const [{ next }] = await sql.query(
      `SELECT coalesce(max(position), 0) + 10 AS next FROM links WHERE category = $1 AND id <> $2`, [f.category, id]);
    f.position = next;
  }
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const rows = await sql.query(
    `UPDATE links SET ${sets}, updated_at = now() WHERE id = $1 RETURNING ${COLS}`,
    [id, ...keys.map(k => f[k])]);
  if (!rows.length) throw httpError(404, 'Link não encontrado');
  send(res, 200, { link: rows[0] });
});
