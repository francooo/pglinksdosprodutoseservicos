// GET /api/admin/me — quem está logado.
import { send, handler } from '../_lib/http.js';
import { requireAdmin } from '../_lib/auth.js';

export default handler(['GET'], async (req, res) => {
  const session = requireAdmin(req, res);
  if (!session) return;
  send(res, 200, { email: session.email });
});
