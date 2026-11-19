// Cria (ou troca a senha de) um usuário do admin.
// Uso: npm run create-admin                      (pergunta e-mail e senha)
//      npm run create-admin -- --delete email@x  (remove um usuário)
import { createInterface } from 'node:readline/promises';
import { neon } from '@neondatabase/serverless';
import { hashPassword } from '../admin-app/api/_lib/auth.js';

const url = process.env.DATABASE_URL;
if (!url) { console.error('Defina DATABASE_URL no .env'); process.exit(1); }
const sql = neon(url);
const args = process.argv.slice(2);
const arg = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

if (arg('--delete')) {
  const email = arg('--delete').trim().toLowerCase();
  const res = await sql`DELETE FROM admins WHERE email = ${email} RETURNING id`;
  console.log(res.length ? `Removido: ${email}` : `Não encontrado: ${email}`);
  process.exit(0);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const email = (arg('--email') || await rl.question('E-mail: ')).trim().toLowerCase();
const password = arg('--password') || await rl.question('Senha (mínimo 10 caracteres): ');
rl.close();

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { console.error('E-mail inválido'); process.exit(1); }
if (password.length < 10) { console.error('A senha precisa ter pelo menos 10 caracteres'); process.exit(1); }

const hash = await hashPassword(password);
await sql`INSERT INTO admins (email, password_hash) VALUES (${email}, ${hash})
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`;
console.log(`Admin pronto: ${email}`);
