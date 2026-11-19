// POST /api/admin/logout — encerra a sessão.
import { send, handler } from '../_lib/http.js';
import { clearSession, checkOrigin } from '../_lib/auth.js';

export default handler(['POST'], async (req, res) => {
  checkOrigin(req);
  clearSession(res);
  send(res, 200, { ok: true });
});
