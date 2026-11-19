/* Leitura simples de user-agent e classificação da origem do tráfego. Nada de dados pessoais. */

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pagespeed|curl|wget|python|httpclient|axios|node-fetch|go-http|java\/|vercel-screenshot|uptime|monitor/i;

export function isBot(ua) {
  return !ua || BOT_RE.test(ua);
}

export function parseUA(ua = '') {
  const device = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua) ? 'tablet'
    : /Mobi|iPhone|iPod|Android/i.test(ua) ? 'celular' : 'computador';

  const browser =
    /Instagram/i.test(ua) ? 'Instagram (app)' :
    /FBAN|FBAV|FB_IAB/i.test(ua) ? 'Facebook (app)' :
    /TikTok|musical_ly|BytedanceWebview/i.test(ua) ? 'TikTok (app)' :
    /LinkedInApp/i.test(ua) ? 'LinkedIn (app)' :
    /Edg\//i.test(ua) ? 'Edge' :
    /OPR\/|Opera/i.test(ua) ? 'Opera' :
    /SamsungBrowser/i.test(ua) ? 'Samsung Internet' :
    /Firefox|FxiOS/i.test(ua) ? 'Firefox' :
    /Chrome|CriOS/i.test(ua) ? 'Chrome' :
    /Safari/i.test(ua) ? 'Safari' : 'Outro';

  const os =
    /Windows/i.test(ua) ? 'Windows' :
    /iPhone|iPad|iPod/i.test(ua) ? 'iOS' :
    /Android/i.test(ua) ? 'Android' :
    /Mac OS X|Macintosh/i.test(ua) ? 'macOS' :
    /CrOS/i.test(ua) ? 'ChromeOS' :
    /Linux/i.test(ua) ? 'Linux' : 'Outro';

  return { device, browser, os };
}

const SOURCE_RULES = [
  ['instagram', /instagram|^ig$/i],
  ['facebook', /facebook|^fb$|fb\.com|fb\.me/i],
  ['whatsapp', /whatsapp|wa\.me|^wpp$|^zap$/i],
  ['tiktok', /tiktok/i],
  ['youtube', /youtube|youtu\.be/i],
  ['linkedin', /linkedin|lnkd\.in/i],
  ['x', /^x$|twitter|t\.co$|x\.com/i],
  ['google', /google/i],
  ['bing', /bing/i],
  ['email', /mail|newsletter/i]
];

function match(value) {
  if (!value) return null;
  for (const [name, re] of SOURCE_RULES) if (re.test(value)) return name;
  return null;
}

/** Classifica a origem: UTM > referrer > navegador embutido de app > direto. */
export function classifySource({ utmSource, referrerHost, ua, ownHost }) {
  if (utmSource) return match(utmSource) || utmSource.toLowerCase().slice(0, 40);
  if (referrerHost && referrerHost !== ownHost) return match(referrerHost) || 'outro site';
  if (/Instagram/i.test(ua || '')) return 'instagram';
  if (/FBAN|FBAV|FB_IAB/i.test(ua || '')) return 'facebook';
  if (/TikTok|musical_ly/i.test(ua || '')) return 'tiktok';
  return 'direto';
}

export function clip(value, max = 120) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s ? s.slice(0, max) : null;
}
