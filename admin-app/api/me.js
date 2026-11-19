// GET /api/me — quem está logado e o endereço da página pública.
import { send, handler } from './_lib/http.js';
import { requireAdmin, publicSite } from './_lib/auth.js';

export default handler(['GET'], async (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  send(res, 200, { email: session.email, site: publicSite() }, { 'Cache-Control': 'no-store' });
});
