// POST /api/admin/login — {email, password} → cookie de sessão.
import { db } from './_lib/db.js';
import { send, readJson, handler } from './_lib/http.js';
import { verifyPassword, setSession, checkOrigin, publicSite } from './_lib/auth.js';

const MAX_FAILS = 5;          // tentativas erradas…
const WINDOW_MIN = 15;        // …dentro desta janela bloqueiam o e-mail
const DUMMY = 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$' + 'A'.repeat(86);

export default handler(['POST'], async (req, res) => {
  checkOrigin(req);
  const b = await readJson(req, 2048);
  const email = String(b.email || '').trim().toLowerCase().slice(0, 200);
  const password = String(b.password || '').slice(0, 200);
  if (!email || !password) return send(res, 400, { error: 'Informe e-mail e senha' });

  const sql = db();
  const [{ fails }] = await sql.query(
    `SELECT count(*)::int AS fails FROM login_attempts
      WHERE email = $1 AND NOT ok AND ts > now() - ($2 || ' minutes')::interval`, [email, String(WINDOW_MIN)]);
  if (fails >= MAX_FAILS) {
    return send(res, 429, { error: `Muitas tentativas. Tente de novo em ${WINDOW_MIN} minutos.` });
  }

  const [admin] = await sql`SELECT id, email, password_hash FROM admins WHERE email = ${email}`;
  const ok = await verifyPassword(password, admin ? admin.password_hash : DUMMY) && !!admin;
  await sql`INSERT INTO login_attempts (email, ok) VALUES (${email}, ${ok})`;
  if (!ok) {
    await new Promise(r => setTimeout(r, 400 + fails * 300)); // atraso progressivo
    return send(res, 401, { error: 'E-mail ou senha incorretos' });
  }
  setSession(res, admin);
  send(res, 200, { email: admin.email, site: publicSite() });
});
