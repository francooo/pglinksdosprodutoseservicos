/* Utilidades HTTP que funcionam tanto na Vercel quanto no servidor local (scripts/dev.mjs). */

export function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(data === undefined ? '' : JSON.stringify(data));
}

export function sendText(res, status, body, contentType, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', contentType);
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(body);
}

export function query(req) {
  return new URL(req.url, 'http://localhost').searchParams;
}

/** Lê o corpo como JSON, com limite de tamanho. Lança erro com .status em caso de problema. */
export async function readJson(req, limit = 16 * 1024) {
  let raw;
  // Na Vercel o corpo já pode vir lido em req.body (objeto ou string).
  let pre;
  try { pre = req.body; } catch { pre = undefined; }
  if (pre !== undefined && pre !== null && pre !== '') {
    if (typeof pre === 'object' && !Buffer.isBuffer(pre)) {
      if (JSON.stringify(pre).length > limit) throw httpError(413, 'Corpo muito grande');
      return pre;
    }
    raw = Buffer.isBuffer(pre) ? pre.toString('utf8') : String(pre);
  } else {
    raw = await new Promise((resolve, reject) => {
      let size = 0; const chunks = [];
      req.on('data', c => {
        size += c.length;
        if (size <= limit) chunks.push(c); // acima do limite, só descarta até o fim
      });
      req.on('end', () => size > limit
        ? reject(httpError(413, 'Corpo muito grande'))
        : resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }
  if (raw.length > limit) throw httpError(413, 'Corpo muito grande');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw httpError(400, 'JSON inválido'); }
}

export function httpError(status, message) {
  const e = new Error(message); e.status = status; return e;
}

/** Envolve um handler: trata métodos permitidos e erros. */
export function handler(methods, fn) {
  return async (req, res) => {
    if (!methods.includes(req.method)) {
      return send(res, 405, { error: 'Método não permitido' }, { Allow: methods.join(', ') });
    }
    try {
      await fn(req, res);
    } catch (e) {
      if (e.status) return send(res, e.status, { error: e.message });
      console.error(e);
      send(res, 500, { error: 'Erro interno' });
    }
  };
}

/** Converte ?from=AAAA-MM-DD&to=AAAA-MM-DD (dias no fuso de São Paulo) em parâmetros validados. */
export function dateRange(params) {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  let from = params.get('from'), to = params.get('to');
  if (!re.test(to || '')) to = today;
  if (!re.test(from || '')) {
    const d = new Date(to + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - 6);
    from = d.toISOString().slice(0, 10);
  }
  if (from > to) [from, to] = [to, from];
  return { from, to };
}

/** Trecho SQL de filtro por período ($1 = from, $2 = to), em dias de São Paulo. */
export const RANGE_SQL = `ts >= ($1::date::timestamp AT TIME ZONE 'America/Sao_Paulo')
  AND ts < (($2::date + 1)::timestamp AT TIME ZONE 'America/Sao_Paulo')`;
