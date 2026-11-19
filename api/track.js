// POST /api/track — registra um evento anônimo da página pública.
import { db, CATEGORIES } from './_lib/db.js';
import { send, readJson, handler } from './_lib/http.js';
import { isBot, parseUA, classifySource, clip } from './_lib/ua.js';

const TYPES = new Set(['pageview', 'click', 'story_open', 'story_view', 'story_cta']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Cache curto dos ids de links válidos (evita uma consulta extra por clique).
let linkIds = null, linkIdsAt = 0;
async function validLinkIds() {
  if (!linkIds || Date.now() - linkIdsAt > 60_000) {
    const rows = await db()`SELECT id FROM links`;
    linkIds = new Set(rows.map(r => r.id));
    linkIdsAt = Date.now();
  }
  return linkIds;
}

function hostOf(url) {
  try { return new URL(url).host.replace(/^www\./, '').slice(0, 120) || null; } catch { return null; }
}

function header(req, name) {
  const v = req.headers[name];
  if (!v) return null;
  try { return clip(decodeURIComponent(v), 80); } catch { return clip(v, 80); }
}

export default handler(['POST'], async (req, res) => {
  const ua = req.headers['user-agent'] || '';
  if (isBot(ua)) return send(res, 204);

  const b = await readJson(req, 4096);
  const type = String(b.type || '');
  if (!TYPES.has(type)) return send(res, 400, { error: 'Tipo inválido' });
  if (!UUID.test(b.vid || '') || !UUID.test(b.sid || '')) return send(res, 400, { error: 'Identificadores inválidos' });

  let linkId = null, category = null, storyIndex = null;
  if (type === 'click' || type === 'story_cta') {
    linkId = clip(b.link_id, 80);
    if (!linkId || !(await validLinkIds()).has(linkId)) return send(res, 400, { error: 'Link desconhecido' });
  }
  if (b.category !== undefined && b.category !== null) {
    if (!CATEGORIES.includes(b.category)) return send(res, 400, { error: 'Categoria inválida' });
    category = b.category;
  }
  if (type === 'story_open' || type === 'story_view') {
    if (!category) return send(res, 400, { error: 'Categoria obrigatória' });
    if (type === 'story_view') {
      storyIndex = Number.isInteger(b.idx) && b.idx >= 0 && b.idx < 100 ? b.idx : null;
      if (storyIndex === null) return send(res, 400, { error: 'Índice inválido' });
    }
  }

  const utm = b.utm && typeof b.utm === 'object' ? b.utm : {};
  const utmSource = clip(utm.source, 60), utmMedium = clip(utm.medium, 60), utmCampaign = clip(utm.campaign, 80);
  const ownHost = (req.headers['x-forwarded-host'] || req.headers.host || '').replace(/^www\./, '');
  const referrerHost = hostOf(b.ref);
  const source = classifySource({ utmSource, referrerHost, ua, ownHost });
  const { device, browser, os } = parseUA(ua);

  await db().query(
    `INSERT INTO events (type, link_id, category, story_index, visitor_id, session_id, source, referrer_host,
       utm_source, utm_medium, utm_campaign, device, browser, os, country, region, city)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
    [type, linkId, category, storyIndex, b.vid, b.sid, source,
      referrerHost && referrerHost !== ownHost ? referrerHost : null,
      utmSource, utmMedium, utmCampaign, device, browser, os,
      header(req, 'x-vercel-ip-country'), header(req, 'x-vercel-ip-country-region'), header(req, 'x-vercel-ip-city')]
  );
  send(res, 204);
});
