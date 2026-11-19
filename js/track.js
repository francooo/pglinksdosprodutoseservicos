/* Andrews Franco · Stories — contagem anônima de acessos e cliques.
 * Gera um ID aleatório de visitante (localStorage) e de sessão (sessionStorage, 30 min parado).
 * Não guarda nome, e-mail, IP nem nada que identifique a pessoa.
 * Para não contar os seus próprios acessos: no admin, ative "Não contar meus acessos neste navegador".
 */
(function () {
  const SESSION_IDLE = 30 * 60 * 1000;
  const get = (s, k) => { try { return s.getItem(k); } catch { return null; } };
  const set = (s, k, v) => { try { s.setItem(k, v); } catch {} };
  const local = (() => { try { return window.localStorage; } catch { return null; } })();
  const session = (() => { try { return window.sessionStorage; } catch { return null; } })();

  const uuid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
      });

  const disabled = local && get(local, 'af_notrack') === '1';

  let vid = local && get(local, 'af_vid');
  if (!vid) { vid = uuid(); local && set(local, 'af_vid', vid); }

  function sessionId() {
    const now = Date.now();
    let sid = session && get(session, 'af_sid');
    const last = +(session && get(session, 'af_sid_t')) || 0;
    if (!sid || now - last > SESSION_IDLE) { sid = uuid(); session && set(session, 'af_sid', sid); }
    session && set(session, 'af_sid_t', String(now));
    return sid;
  }

  // Origem: UTM da URL (guardada na sessão para os eventos seguintes) e o referrer.
  const qs = new URLSearchParams(location.search);
  let utm = { source: qs.get('utm_source'), medium: qs.get('utm_medium'), campaign: qs.get('utm_campaign') };
  if (utm.source) session && set(session, 'af_utm', JSON.stringify(utm));
  else { try { utm = JSON.parse(get(session, 'af_utm') || 'null') || {}; } catch { utm = {}; } }
  const ref = document.referrer || '';

  function track(type, data) {
    if (disabled) return;
    const body = JSON.stringify(Object.assign({ type, vid, sid: sessionId(), ref, utm }, data || {}));
    try {
      if (navigator.sendBeacon && navigator.sendBeacon('/api/track', new Blob([body], { type: 'text/plain' }))) return;
    } catch {}
    try { fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }); } catch {}
  }
  window.afTrack = track;

  // Cliques em qualquer link marcado com data-id (lista, rodapé e botão "Acessar" do story).
  function onClick(e) {
    const a = e.target.closest && e.target.closest('a[data-id]');
    if (!a) return;
    if (e.type === 'auxclick' && e.button !== 1) return;
    track(a.dataset.ev || 'click', { link_id: a.dataset.id, category: a.dataset.c || null });
  }
  document.addEventListener('click', onClick, true);
  document.addEventListener('auxclick', onClick, true);

  track('pageview');
})();
