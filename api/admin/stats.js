// GET /api/admin/stats?from=AAAA-MM-DD&to=AAAA-MM-DD — números do painel.
import { db, CATEGORIES } from '../_lib/db.js';
import { send, query, handler, dateRange, RANGE_SQL } from '../_lib/http.js';
import { requireAdmin } from '../_lib/auth.js';

const TZ = `'America/Sao_Paulo'`;
const CLICK = `type IN ('click','story_cta')`;

function dimension(expr, where = 'TRUE') {
  return `SELECT ${expr} AS k,
            count(*) FILTER (WHERE type = 'pageview')::int AS pageviews,
            count(DISTINCT visitor_id) FILTER (WHERE type = 'pageview')::int AS visitors,
            count(*) FILTER (WHERE ${CLICK})::int AS clicks
       FROM events WHERE ${RANGE_SQL} AND ${where}
      GROUP BY 1 HAVING count(*) FILTER (WHERE type = 'pageview') > 0 OR count(*) FILTER (WHERE ${CLICK}) > 0
      ORDER BY 2 DESC, 4 DESC LIMIT 50`;
}

export default handler(['GET'], async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { from, to } = dateRange(query(req));
  send(res, 200, await getStats(from, to), { 'Cache-Control': 'no-store' });
});

/** Monta todos os números do painel para o período (datas AAAA-MM-DD, fuso de São Paulo). */
export async function getStats(from, to) {
  const sql = db(), p = [from, to];

  const [totals, newret, daily, links, sources, utm, devices, browsers, oss, countries, cities,
    storyOpens, storyViews, storyCta] = await Promise.all([
    sql.query(`SELECT count(*) FILTER (WHERE type='pageview')::int AS pageviews,
                      count(DISTINCT visitor_id) FILTER (WHERE type='pageview')::int AS visitors,
                      count(DISTINCT session_id)::int AS sessions,
                      count(*) FILTER (WHERE type='click')::int AS list_clicks,
                      count(*) FILTER (WHERE type='story_cta')::int AS story_clicks,
                      count(DISTINCT visitor_id) FILTER (WHERE ${CLICK})::int AS clickers
                 FROM events WHERE ${RANGE_SQL}`, p),
    sql.query(`WITH v AS (SELECT DISTINCT visitor_id FROM events WHERE ${RANGE_SQL}),
                    f AS (SELECT e.visitor_id, min(e.ts) AS first FROM events e JOIN v USING (visitor_id) GROUP BY 1)
               SELECT count(*) FILTER (WHERE first >= ($1::date::timestamp AT TIME ZONE ${TZ}))::int AS new,
                      count(*) FILTER (WHERE first <  ($1::date::timestamp AT TIME ZONE ${TZ}))::int AS returning
                 FROM f`, p),
    sql.query(`SELECT to_char((ts AT TIME ZONE ${TZ})::date, 'YYYY-MM-DD') AS day,
                      count(*) FILTER (WHERE type='pageview')::int AS pageviews,
                      count(DISTINCT visitor_id) FILTER (WHERE type='pageview')::int AS visitors,
                      count(*) FILTER (WHERE ${CLICK})::int AS clicks
                 FROM events WHERE ${RANGE_SQL} GROUP BY 1 ORDER BY 1`, p),
    sql.query(`SELECT l.id, l.title, l.category, l.visible, l.position,
                      count(e.id) FILTER (WHERE e.type='click')::int AS clicks,
                      count(e.id) FILTER (WHERE e.type='story_cta')::int AS story_clicks,
                      count(DISTINCT e.visitor_id)::int AS visitors
                 FROM links l
                 LEFT JOIN events e ON e.link_id = l.id AND e.type IN ('click','story_cta')
                      AND e.ts >= ($1::date::timestamp AT TIME ZONE ${TZ})
                      AND e.ts <  (($2::date + 1)::timestamp AT TIME ZONE ${TZ})
                GROUP BY l.id
                ORDER BY count(e.id) DESC, array_position($3::text[], l.category), l.position`, [from, to, CATEGORIES]),
    sql.query(dimension(`coalesce(source, 'direto')`), p),
    sql.query(dimension(`concat_ws(' / ', utm_source, utm_medium, utm_campaign)`, 'utm_source IS NOT NULL'), p),
    sql.query(dimension(`coalesce(device, '—')`), p),
    sql.query(dimension(`coalesce(browser, '—')`), p),
    sql.query(dimension(`coalesce(os, '—')`), p),
    sql.query(dimension(`coalesce(country, 'desconhecido')`), p),
    sql.query(dimension(`concat_ws(' · ', city, region, country)`, 'city IS NOT NULL'), p),
    sql.query(`SELECT category, count(*)::int AS opens, count(DISTINCT visitor_id)::int AS visitors
                 FROM events WHERE ${RANGE_SQL} AND type='story_open' GROUP BY 1`, p),
    sql.query(`SELECT category, story_index AS idx, count(DISTINCT session_id)::int AS sessions
                 FROM events WHERE ${RANGE_SQL} AND type='story_view' GROUP BY 1, 2 ORDER BY 1, 2`, p),
    sql.query(`SELECT category, count(*)::int AS clicks
                 FROM events WHERE ${RANGE_SQL} AND type='story_cta' GROUP BY 1`, p)
  ]);

  // Série diária completa (dias sem eventos entram com zero).
  const byDay = new Map(daily.map(d => [d.day, d]));
  const series = [];
  for (let d = new Date(from + 'T12:00:00Z'); d.toISOString().slice(0, 10) <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = d.toISOString().slice(0, 10);
    series.push(byDay.get(day) || { day, pageviews: 0, visitors: 0, clicks: 0 });
  }

  const categories = CATEGORIES.map(id => {
    const ls = links.filter(l => l.category === id);
    return {
      id,
      links: ls.length,
      clicks: ls.reduce((s, l) => s + l.clicks, 0),
      story_clicks: ls.reduce((s, l) => s + l.story_clicks, 0),
      story_opens: storyOpens.find(s => s.category === id)?.opens || 0,
      story_visitors: storyOpens.find(s => s.category === id)?.visitors || 0
    };
  });

  const stories = CATEGORIES.map(id => ({
    id,
    opens: storyOpens.find(s => s.category === id)?.opens || 0,
    cta: storyCta.find(s => s.category === id)?.clicks || 0,
    retention: storyViews.filter(v => v.category === id).map(v => ({ idx: v.idx, sessions: v.sessions }))
  }));

  return {
    range: { from, to },
    totals: { ...totals[0], ...newret[0] },
    series, links, categories, stories,
    dims: { sources, utm, devices, browsers, os: oss, countries, cities }
  };
}
