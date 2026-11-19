// GET /api/links — links visíveis da página pública, na ordem de exibição.
import { db, CATEGORIES } from './_lib/db.js';
import { send, handler } from './_lib/http.js';

export default handler(['GET'], async (req, res) => {
  const rows = await db().query(
    `SELECT id, title, description, url, category, icon, tag, footer
       FROM links WHERE visible
      ORDER BY array_position($1::text[], category), position, title`,
    [CATEGORIES]
  );
  const links = rows.map(r => ({
    id: r.id, t: r.title, d: r.description, u: r.url, c: r.category, i: r.icon,
    ...(r.tag ? { tag: r.tag } : {}), ...(r.footer ? { footer: r.footer } : {})
  }));
  send(res, 200, { links }, { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' });
});
