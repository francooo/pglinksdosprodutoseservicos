// GET /api/admin/visitors?from&to          — visitantes do período (mais recentes primeiro)
// GET /api/admin/visitors?id=<uuid>        — jornada completa de um visitante
import { db } from './_lib/db.js';
import { send, query, handler, dateRange, RANGE_SQL } from './_lib/http.js';
import { requireAdmin } from './_lib/auth.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default handler(['GET'], async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const params = query(req);
  const id = params.get('id');
  if (id) {
    if (!UUID.test(id)) return send(res, 400, { error: 'Visitante inválido' });
    return send(res, 200, { id, events: await getJourney(id) }, { 'Cache-Control': 'no-store' });
  }
  const { from, to } = dateRange(params);
  send(res, 200, { range: { from, to }, visitors: await listVisitors(from, to) }, { 'Cache-Control': 'no-store' });
});

/** Eventos de um visitante, do mais recente para o mais antigo. */
export function getJourney(id) {
  return db().query(
    `SELECT e.ts, e.type, e.link_id, l.title, e.category, e.story_index, e.session_id,
            e.source, e.referrer_host, e.utm_source, e.utm_medium, e.utm_campaign,
            e.device, e.browser, e.os, e.city, e.region, e.country
       FROM events e LEFT JOIN links l ON l.id = e.link_id
      WHERE e.visitor_id = $1 ORDER BY e.ts DESC LIMIT 500`, [id]);
}

/** Visitantes com atividade no período. */
export function listVisitors(from, to) {
  return db().query(
    `WITH r AS (SELECT * FROM events WHERE ${RANGE_SQL}),
          firsts AS (SELECT visitor_id, min(ts) AS first_ever FROM events
                      WHERE visitor_id IN (SELECT DISTINCT visitor_id FROM r) GROUP BY 1)
     SELECT r.visitor_id AS id,
            min(r.ts) AS first_seen, max(r.ts) AS last_seen, f.first_ever,
            count(DISTINCT r.session_id)::int AS sessions,
            count(*) FILTER (WHERE r.type='pageview')::int AS pageviews,
            count(*) FILTER (WHERE r.type IN ('click','story_cta'))::int AS clicks,
            count(*) FILTER (WHERE r.type='story_open')::int AS stories,
            (array_agg(r.source ORDER BY r.ts))[1] AS source,
            (array_agg(r.device ORDER BY r.ts DESC))[1] AS device,
            (array_agg(r.browser ORDER BY r.ts DESC))[1] AS browser,
            (array_agg(concat_ws(' · ', r.city, r.country) ORDER BY r.ts DESC))[1] AS place
       FROM r JOIN firsts f USING (visitor_id)
      GROUP BY r.visitor_id, f.first_ever
      ORDER BY max(r.ts) DESC
      LIMIT 300`, [from, to]);
}
