/* Andrews Franco · Stories — renderização e visualizador de story
 * Depende de js/data.js (AV, I, FX, CATS, L, MARQUEE, FOOT) e, opcionalmente, de js/track.js (window.afTrack).
 * Os links vêm de /api/links (gerenciados no admin). Enquanto a API responde, ou se ela falhar,
 * a página usa a lista L do data.js, então nunca fica vazia.
 */
(function () {
  const ico = k => `<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${I[k] || I.grid}</svg></span>`;
  const ext = 'target="_blank" rel="noopener"';
  const esc = s => String(s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const track = (type, data) => { if (window.afTrack) window.afTrack(type, data); };

  const rings = document.getElementById('s-rings');
  const groups = document.getElementById('s-groups');
  const vw = document.getElementById('s-viewer');

  /* Links do data.js com o campo footer derivado de FOOT (mesmo formato da API). */
  const footerOf = t => { for (const f of FOOT) if (f.items.includes(t)) return f.h.toLowerCase(); return undefined; };
  let LINKS = L.map(x => Object.assign({}, x, { footer: footerOf(x.t) }));

  /* Círculos de story */
  rings.innerHTML = CATS.map(c =>
    `<button class="s-ring" type="button" id="sr-${c.id}" data-c="${c.id}" aria-label="Ver destaques: ${c.name}"><span class="r"><span>${ico(c.ring)}</span></span><small>${c.name}</small></button>`
  ).join('');

  /* Faixa animada (texto duplicado para o loop contínuo) */
  const mq = MARQUEE.map(s => s + '  ✦  ').join('');
  document.getElementById('s-mq').textContent = mq + mq;

  /* Seções, linhas numeradas e rodapé */
  function render() {
    let n = 0;
    groups.innerHTML = CATS.map(c => {
      const it = LINKS.filter(x => x.c === c.id);
      if (!it.length) return '';
      return `<div class="s-sec" id="${c.id}"><h2>${ico(c.ring)}${c.name}</h2><span>${it.length} ${it.length === 1 ? 'link' : 'links'}</span></div>
  <ul class="s-list">${it.map(x => {
        n++;
        return `<li class="s-row"><a href="${esc(x.u)}" ${ext} data-id="${esc(x.id)}" data-c="${x.c}" style="--fx:${FX[x.i] || 'fx-pulse'}"><span class="s-rt"><span class="s-tline"><span class="s-rowico">${ico(x.i)}</span><span>${esc(x.t)}${x.tag ? `<span class="s-tag">${esc(x.tag)}</span>` : ''}</span></span></span><span class="s-rd">${esc(x.d)}</span><span class="s-rn">${String(n).padStart(2, '0')}${ico('arrow')}</span></a></li>`;
      }).join('')}</ul>`;
    }).join('');

    const cols = [
      {h:'Categorias', items:CATS.filter(c => LINKS.some(x => x.c === c.id)).map(c => ({t:c.name, u:'#' + c.id, int:1}))},
      {h:'Canais', items:LINKS.filter(x => x.footer === 'canais')},
      {h:'Lojas',  items:LINKS.filter(x => x.footer === 'lojas')}
    ].filter(c => c.items.length);
    document.getElementById('foot-cols').innerHTML = cols.map(c =>
      `<div><h3>${c.h}</h3><ul>${c.items.map(x => x.int
        ? `<li><a href="${x.u}">${esc(x.t)}</a></li>`
        : `<li><a href="${esc(x.u)}" ${ext} data-id="${esc(x.id)}" data-c="${x.c}">${esc(x.t)}</a></li>`).join('')}</ul></div>`
    ).join('');
  }
  render();

  /* Busca os links atualizados do admin e redesenha só se algo mudou. */
  (async function () {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const r = await fetch('/api/links', { signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) return;
      const data = await r.json();
      if (!Array.isArray(data.links) || !data.links.length) return;
      if (JSON.stringify(data.links) === JSON.stringify(LINKS)) return;
      LINKS = data.links;
      render();
    } catch { /* mantém os links do data.js */ }
  })();

  document.getElementById('to-top').addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  /* Visualizador de story */
  const DUR = 5000;
  let items = [], idx = 0, timer = null, cat = null, opener = null, started = 0, left = DUR;

  function startTimer(ms) {
    clearTimeout(timer);
    left = ms; started = Date.now();
    timer = setTimeout(next, ms);
  }

  function show() {
    const x = items[idx];
    vw.innerHTML = `<div class="s-story" style="--sbg:${cat.bg};--dur:${DUR}ms;--fx:${FX[x.i] || 'fx-pulse'}" role="dialog" aria-modal="true" aria-label="Destaques: ${cat.name}">
   <div class="s-bars">${items.map((_, k) => `<i class="${k < idx ? 'done' : k === idx ? 'now' : ''}"><b></b></i>`).join('')}</div>
   <div class="s-meta"><img src="${AV}" alt=""><b>${cat.name}</b><span class="s-count">${idx + 1} de ${items.length}</span><button class="s-close" type="button" id="s-close" aria-label="Fechar">×</button></div>
   <button class="s-tap l" type="button" id="s-prev" aria-label="Anterior"></button><button class="s-tap r" type="button" id="s-next" aria-label="Próximo"></button>
   <div class="s-body"><div class="s-big">${ico(x.i)}</div><h2>${esc(x.t)}</h2><p>${esc(x.d)}</p></div>
   <a class="s-cta" href="${esc(x.u)}" ${ext} data-id="${esc(x.id)}" data-c="${x.c}" data-ev="story_cta">Acessar ${ico('arrow')}</a></div>`;
    startTimer(DUR);
    document.getElementById('s-close').focus({preventScroll:true});
    track('story_view', { category: cat.id, idx });
  }

  function next() {
    if (idx < items.length - 1) { idx++; show(); return; }
    const ci = CATS.indexOf(cat);
    if (ci < CATS.length - 1) open(CATS[ci + 1].id); else close();
  }
  function prev() { if (idx > 0) { idx--; show(); } }

  function open(id) {
    cat = CATS.find(c => c.id === id);
    items = LINKS.filter(x => x.c === id);
    if (!items.length) return next();
    idx = 0; vw.hidden = false;
    track('story_open', { category: id });
    show();
  }

  function close() {
    clearTimeout(timer);
    vw.hidden = true; vw.innerHTML = '';
    if (opener) { opener.focus({preventScroll:true}); opener = null; }
  }

  rings.addEventListener('click', e => {
    const b = e.target.closest('.s-ring');
    if (b) { opener = b; open(b.dataset.c); }
  });
  vw.addEventListener('click', e => {
    if (e.target === vw || e.target.closest('#s-close')) close();
    else if (e.target.closest('#s-next')) next();
    else if (e.target.closest('#s-prev')) prev();
  });
  document.addEventListener('keydown', e => {
    if (vw.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  /* Pausa o story quando a aba fica oculta e retoma de onde parou */
  document.addEventListener('visibilitychange', () => {
    const st = vw.querySelector('.s-story');
    if (vw.hidden || !st) return;
    if (document.hidden) {
      clearTimeout(timer);
      left = Math.max(0, left - (Date.now() - started));
      st.classList.add('paused');
    } else {
      st.classList.remove('paused');
      startTimer(left);
    }
  });
})();
