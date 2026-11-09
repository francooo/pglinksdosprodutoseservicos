/* Andrews Franco · Stories — renderização e visualizador de story
 * Depende de js/data.js (AV, I, FX, CATS, L, MARQUEE, FOOT).
 */
(function () {
  const ico = k => `<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg></span>`;
  const ext = 'target="_blank" rel="noopener"';
  const esc = s => s.replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

  const rings = document.getElementById('s-rings');
  const groups = document.getElementById('s-groups');
  const vw = document.getElementById('s-viewer');

  /* Círculos de story */
  rings.innerHTML = CATS.map(c =>
    `<button class="s-ring" type="button" id="sr-${c.id}" data-c="${c.id}" aria-label="Ver destaques: ${c.name}"><span class="r"><span>${ico(c.ring)}</span></span><small>${c.name}</small></button>`
  ).join('');

  /* Seções e linhas numeradas */
  let n = 0;
  groups.innerHTML = CATS.map(c => {
    const it = L.filter(x => x.c === c.id);
    return `<div class="s-sec" id="${c.id}"><h2>${ico(c.ring)}${c.name}</h2><span>${it.length} ${it.length === 1 ? 'link' : 'links'}</span></div>
  <ul class="s-list">${it.map(x => {
      n++;
      return `<li class="s-row"><a href="${x.u}" ${ext} style="--fx:${FX[x.i]}"><span class="s-rt"><span class="s-tline"><span class="s-rowico">${ico(x.i)}</span><span>${esc(x.t)}${x.tag ? `<span class="s-tag">${esc(x.tag)}</span>` : ''}</span></span></span><span class="s-rd">${esc(x.d)}</span><span class="s-rn">${String(n).padStart(2, '0')}${ico('arrow')}</span></a></li>`;
    }).join('')}</ul>`;
  }).join('');

  /* Faixa animada (texto duplicado para o loop contínuo) */
  const mq = MARQUEE.map(s => s + '  ✦  ').join('');
  document.getElementById('s-mq').textContent = mq + mq;

  /* Rodapé */
  const pick = t => L.find(x => x.t === t);
  const cols = [{h:'Categorias', items:CATS.map(c => ({t:c.name, u:'#' + c.id, int:1}))}]
    .concat(FOOT.map(f => ({h:f.h, items:f.items.map(pick).filter(Boolean)})));
  document.getElementById('foot-cols').innerHTML = cols.map(c =>
    `<div><h3>${c.h}</h3><ul>${c.items.map(x => `<li><a href="${x.u}" ${x.int ? '' : ext}>${esc(x.t)}</a></li>`).join('')}</ul></div>`
  ).join('');

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
    vw.innerHTML = `<div class="s-story" style="--sbg:${cat.bg};--dur:${DUR}ms;--fx:${FX[x.i]}" role="dialog" aria-modal="true" aria-label="Destaques: ${cat.name}">
   <div class="s-bars">${items.map((_, k) => `<i class="${k < idx ? 'done' : k === idx ? 'now' : ''}"><b></b></i>`).join('')}</div>
   <div class="s-meta"><img src="${AV}" alt=""><b>${cat.name}</b><span class="s-count">${idx + 1} de ${items.length}</span><button class="s-close" type="button" id="s-close" aria-label="Fechar">×</button></div>
   <button class="s-tap l" type="button" id="s-prev" aria-label="Anterior"></button><button class="s-tap r" type="button" id="s-next" aria-label="Próximo"></button>
   <div class="s-body"><div class="s-big">${ico(x.i)}</div><h2>${esc(x.t)}</h2><p>${esc(x.d)}</p></div>
   <a class="s-cta" href="${x.u}" ${ext}>Acessar ${ico('arrow')}</a></div>`;
    startTimer(DUR);
    document.getElementById('s-close').focus({preventScroll:true});
  }

  function next() {
    if (idx < items.length - 1) { idx++; show(); return; }
    const ci = CATS.indexOf(cat);
    if (ci < CATS.length - 1) open(CATS[ci + 1].id); else close();
  }
  function prev() { if (idx > 0) { idx--; show(); } }

  function open(id) {
    cat = CATS.find(c => c.id === id);
    items = L.filter(x => x.c === id);
    if (!items.length) return next();
    idx = 0; vw.hidden = false; show();
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
