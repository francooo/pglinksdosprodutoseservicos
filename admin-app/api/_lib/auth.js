import { scrypt as _scrypt, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
import { send, httpError } from './http.js';

const scrypt = promisify(_scrypt);
const COOKIE = 'af_admin';
const MAX_AGE = 7 * 24 * 3600; // 7 dias
const N = 16384, R = 8, P = 1, KEYLEN = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export async function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, 'base64url');
  const got = await scrypt(password, Buffer.from(saltB64, 'base64url'), expected.length, { N: +n, r: +r, p: +p });
  return got.length === expected.length && timingSafeEqual(got, expected);
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('SESSION_SECRET não configurada (mínimo 16 caracteres)');
  return s;
}

function sign(data) {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

export function setSession(res, admin) {
  const payload = Buffer.from(JSON.stringify({
    id: admin.id, email: admin.email, exp: Math.floor(Date.now() / 1000) + MAX_AGE
  })).toString('base64url');
  const value = `${payload}.${sign(payload)}`;
  res.setHeader('Set-Cookie',
    `${COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Strict`);
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

/** Devolve {id,email} do admin logado, ou null. */
export function getSession(req) {
  const value = readCookie(req, COOKIE);
  if (!value) return null;
  const [payload, sig] = value.split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const got = Buffer.from(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Date.now() / 1000) return null;
    return { id: data.id, email: data.email };
  } catch { return null; }
}

/**
 * Exige admin logado. Para métodos que alteram dados, confere também a origem da requisição.
 * Devolve a sessão, ou responde 401/403 e devolve null.
 */
export function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) { send(res, 401, { error: 'Não autenticado' }); return null; }
  if (!['GET', 'HEAD'].includes(req.method)) {
    try { checkOrigin(req); } catch (e) { send(res, e.status, { error: e.message }); return null; }
  }
  return session;
}

/** Endereço da página pública (variável opcional PUBLIC_SITE_URL), ou null. */
export function publicSite() {
  try {
    const u = new URL(process.env.PUBLIC_SITE_URL || '');
    return u.protocol === 'https:' || u.hostname === 'localhost' ? u.origin : null;
  } catch { return null; }
}

/** Proteção extra contra CSRF: se houver Origin, precisa ser o mesmo host. */
export function checkOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  let originHost;
  try { originHost = new URL(origin).host; } catch { originHost = ''; }
  if (originHost !== host) throw httpError(403, 'Origem não permitida');
}
