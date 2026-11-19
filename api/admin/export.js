// GET /api/admin/export?type=events|links&from&to — CSV (separador ; e BOM, para abrir certo no Excel em português).
import { db, CATEGORIES } from '../_lib/db.js';
import { sendText, query, handler, dateRange, RANGE_SQL } from '../_lib/http.js';
import { requireAdmin } from '../_lib/auth.js';

const TZ = `'America/Sao_Paulo'`;

function csv(rows, columns) {
  const cell = v => {
    if (v === null || v === undefined) return '';
    const s = v instanceof Date ? v.toISOString() : String(v);
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map(c => c[1]).join(';')];
  for (const r of rows) lines.push(columns.map(c => cell(r[c[0]])).join(';'));
  return '﻿' + lines.join('\r\n') + '\r\n';
}

export default handler(['GET'], async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const params = query(req);
  const { from, to } = dateRange(params);
  const type = params.get('type') === 'links' ? 'links' : 'events';
  sendText(res, 200, await buildCsv(type, from, to), 'text/csv; charset=utf-8', {
    'Content-Disposition': `attachment; filename="af-${type}-${from}_a_${to}.csv"`,
    'Cache-Control': 'no-store'
  });
});

/** Gera o CSV ('links' = resumo por link; 'events' = eventos brutos) do período. */
export async function buildCsv(type, from, to) {
  const sql = db();
  let body;

  if (type === 'links') {
    const rows = await sql.query(
      `SELECT l.id, l.title, l.category, l.url, l.visible,
              count(e.id) FILTER (WHERE e.type='click')::int AS clicks,
              count(e.id) FILTER (WHERE e.type='story_cta')::int AS story_clicks,
              count(DISTINCT e.visitor_id)::int AS visitors
         FROM links l
         LEFT JOIN events e ON e.link_id = l.id AND e.type IN ('click','story_cta')
              AND e.ts >= ($1::date::timestamp AT TIME ZONE ${TZ})
              AND e.ts <  (($2::date + 1)::timestamp AT TIME ZONE ${TZ})
        GROUP BY l.id ORDER BY array_position($3::text[], l.category), l.position`, [from, to, CATEGORIES]);
    body = csv(rows, [['id', 'id'], ['title', 'titulo'], ['category', 'categoria'], ['url', 'url'],
      ['visible', 'visivel'], ['clicks', 'cliques_lista'], ['story_clicks', 'cliques_story'],
      ['visitors', 'visitantes_que_clicaram']]);
  } else {
    const rows = await sql.query(
      `SELECT to_char(ts AT TIME ZONE ${TZ}, 'YYYY-MM-DD HH24:MI:SS') AS ts, type, link_id, category, story_index,
              visitor_id, session_id, source, referrer_host, utm_source, utm_medium, utm_campaign,
              device, browser, os, country, region, city
         FROM events WHERE ${RANGE_SQL} ORDER BY events.ts LIMIT 100000`, [from, to]);
    body = csv(rows, [['ts', 'data_hora'], ['type', 'tipo'], ['link_id', 'link'], ['category', 'categoria'],
      ['story_index', 'story_indice'], ['visitor_id', 'visitante'], ['session_id', 'sessao'], ['source', 'origem'],
      ['referrer_host', 'site_de_origem'], ['utm_source', 'utm_source'], ['utm_medium', 'utm_medium'],
      ['utm_campaign', 'utm_campaign'], ['device', 'dispositivo'], ['browser', 'navegador'], ['os', 'sistema'],
      ['country', 'pais'], ['region', 'estado'], ['city', 'cidade']]);
  }
  return body;
}
