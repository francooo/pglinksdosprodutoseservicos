// Aplica db/schema.sql no banco do DATABASE_URL.  Uso: npm run db:migrate
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) { console.error('Defina DATABASE_URL no .env'); process.exit(1); }
const sql = neon(url);

const text = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
  .replace(/--.*$/gm, '');
const statements = text.split(';').map(s => s.trim()).filter(Boolean);

for (const stmt of statements) {
  await sql.query(stmt);
  console.log('ok:', stmt.split('\n')[0].slice(0, 70));
}
console.log(`\n${statements.length} comandos aplicados.`);
