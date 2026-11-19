/* Andrews Franco · Admin — painel de acessos, cliques e gestão de links.
 * Usa /js/data.js (CATS e I, para nomes de categorias e ícones) e Chart.js para o gráfico diário.
 */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const fmt = n => (n || 0).toLocaleString('pt-BR');
  const pct = (a, b) => b ? (a / b * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%' : '—';
  const TZ = 'America/Sao_Paulo';
  const today = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
  const addDays = (d, n) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const dayLabel = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  const dateTime = iso => new Date(iso).toLocaleString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const spDate = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
  const ico = k => `<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${I[k] || I.grid}</svg></span>`;
  const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
  const catName = id => CAT[id]?.name || id || '—';
  const regionName = (() => {
    try { const dn = new Intl.DisplayNames(['pt-BR'], { type: 'region' }); return c => (/^[A-Z]{2}$/.test(c) ? dn.of(c) : c); }
    catch { return c => c; }
  })();
  const SOURCE = { direto: 'Direto', instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp', tiktok: 'TikTok',
    youtube: 'YouTube', linkedin: 'LinkedIn', x: 'X (Twitter)', google: 'Google', bing: 'Bing', email: 'E-mail', 'outro site': 'Outro site' };
  const srcName = s => SOURCE[s] || s || '—';

  const state = { from: null, to: null, tab: 'overview', stats: null, links: null, icons: [], chart: null, editing: null };

  function toast(text) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = text; t.setAttribute('role', 'status');
    document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
  }

  async function api(path, opts = {}) {
    const r = await fetch(path, {
      credentials: 'same-origin',
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }
    });
    let data = null;
    try { data = await r.json(); } catch {}
    if (r.status === 401 && !path.endsWith('/login')) { showLogin(); throw new Error('Sessão expirada'); }
    if (!r.ok) throw new Error(data?.error || `Erro ${r.status}`);
    return data;
  }

  /* ---------------- Login ---------------- */
  function showLogin() {
    $('#v-app').hidden = true; $('#v-login').hidden = false;
    setTimeout(() => $('#f-login [name=email]').focus(), 0);
  }
  function showApp(email, site) {
    $('#v-login').hidden = true; $('#v-app').hidden = false;
    $('#who').textContent = email;
    // Endereço da página pública (variável PUBLIC_SITE_URL do projeto do admin na Vercel).
    if (site) {
      const base = site.replace(/\/+$/, '');
      $('#site-link').href = base + '/'; $('#site-link').hidden = false;
      $('#notrack-on').href = base + '/?notrack=1';
      $('#notrack-off').href = base + '/?notrack=0';
      $('#notrack').hidden = false;
    }
    setPreset(7);
  }

  $('#f-login').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, btn = f.querySelector('button');
    $('#login-msg').textContent = ''; btn.disabled = true;
    try {
      const d = await api('/api/login', { method: 'POST', body: JSON.stringify({ email: f.email.value, password: f.password.value }) });
      f.password.value = '';
      showApp(d.email, d.site);
    } catch (err) { $('#login-msg').textContent = err.message; }
    btn.disabled = false;
  });

  $('#logout').addEventListener('click', async () => {
    try { await api('/api/logout', { method: 'POST' }); } catch {}
    state.stats = state.links = null;
    showLogin();
  });

  /* ---------------- Período ---------------- */
  function setPreset(days) {
    state.to = today();
    state.from = addDays(state.to, -(days - 1));
    $$('#presets button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.days === days)));
    syncInputs(); load();
  }
  function syncInputs() {
    $('#from').value = state.from; $('#to').value = state.to;
    $('#from').max = $('#to').max = today();
    const n = Math.round((new Date(state.to) - new Date(state.from)) / 864e5) + 1;
    $('#range-label').textContent = `${dayLabel(state.from)} a ${dayLabel(state.to)} · ${n} ${n === 1 ? 'dia' : 'dias'}`;
  }
  $('#presets').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setPreset(+b.dataset.days); });
  ['#from', '#to'].forEach(s => $(s).addEventListener('change', () => {
    if (!$('#from').value || !$('#to').value) return;
    state.from = $('#from').value; state.to = $('#to').value;
    if (state.from > state.to) [state.from, state.to] = [state.to, state.from];
    $$('#presets button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    syncInputs(); load();
  }));
  $$('[data-export]').forEach(b => b.addEventListener('click', () => {
    location.href = `/api/export?type=${b.dataset.export}&from=${state.from}&to=${state.to}`;
  }));

  /* ---------------- Abas ---------------- */
  $('.tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    state.tab = b.dataset.tab;
    $$('.tabs [data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== state.tab; });
    $('#period-bar').hidden = state.tab === 'manage';
    if (state.tab === 'visitors') loadVisitors();
    if (state.tab === 'manage') loadLinks();
  });

  /* ---------------- Dados ---------------- */
  let loadSeq = 0;
  async function load() {
    const seq = ++loadSeq;
    try {
      const s = await api(`/api/stats?from=${state.from}&to=${state.to}`);
      if (seq !== loadSeq) return;
      state.stats = s;
      renderOverview(); renderLinks(); renderDims(); renderStories();
      if (state.tab === 'visitors') loadVisitors();
    } catch (err) { if (err.message !== 'Sessão expirada') toast(err.message); }
  }

  function renderOverview() {
    const t = state.stats.totals;
    const clicks = t.list_clicks + t.story_clicks;
    const kpi = (v, l, s) => `<div class="card kpi"><div class="v">${v}</div><div class="l">${l}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;
    $('#kpis').innerHTML = [
      kpi(fmt(t.pageviews), 'Acessos à página', `${fmt(t.sessions)} sessões`),
      kpi(fmt(t.visitors), 'Visitantes únicos', `${fmt(t.new)} novos · ${fmt(t.returning)} recorrentes`),
      kpi(fmt(clicks), 'Cliques em links', `${fmt(t.list_clicks)} na lista · ${fmt(t.story_clicks)} nos stories`),
      kpi(t.pageviews ? (clicks / t.pageviews).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—',
        'Cliques por acesso', 'média de cliques a cada visita'),
      kpi(pct(t.clickers, t.visitors), 'Visitantes que clicaram', `${fmt(t.clickers)} de ${fmt(t.visitors)}`)
    ].join('');

    // Gráfico diário
    const canvas = $('#chart-daily');
    if (window.Chart) {
      const s = state.stats.series;
      Chart.defaults.color = '#aab3e8';
      Chart.defaults.font.family = '"DM Sans", system-ui, sans-serif';
      if (state.chart) state.chart.destroy();
      state.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: s.map(d => dayLabel(d.day)),
          datasets: [
            { label: 'Acessos', data: s.map(d => d.pageviews), borderColor: '#c9d0ff', backgroundColor: 'rgba(201,208,255,.12)', fill: true, tension: .3, pointRadius: s.length > 45 ? 0 : 3 },
            { label: 'Visitantes', data: s.map(d => d.visitors), borderColor: '#ff6b9a', backgroundColor: '#ff6b9a', tension: .3, pointRadius: s.length > 45 ? 0 : 3 },
            { label: 'Cliques', data: s.map(d => d.clicks), borderColor: '#ffe14d', backgroundColor: '#ffe14d', tension: .3, pointRadius: s.length > 45 ? 0 : 3 }
          ]
        },
        options: {
          maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
          plugins: { legend: { labels: { usePointStyle: true, boxWidth: 8 } } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,.06)' } },
            y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(255,255,255,.06)' } }
          }
        }
      });
    } else {
      canvas.parentElement.innerHTML = '<p class="empty">Não foi possível carregar o gráfico (Chart.js).</p>';
    }

    // Cliques por categoria
    const cats = state.stats.categories.map(c => ({ ...c, total: c.clicks + c.story_clicks }));
    const max = Math.max(1, ...cats.map(c => c.total));
    $('#cat-bars').innerHTML = cats.map(c => `<div class="hbar"><span><span class="cat-dot cat-${c.id}"></span>${esc(catName(c.id))}</span>
      <span class="track"><i class="cat-${c.id}" style="width:${c.total / max * 100}%"></i></span><b>${fmt(c.total)}</b></div>`).join('');

    // Top links
    const top = state.stats.links.map(l => ({ ...l, total: l.clicks + l.story_clicks })).filter(l => l.total).slice(0, 6);
    const tmax = Math.max(1, ...top.map(l => l.total));
    $('#top-links').innerHTML = top.length ? `<table><tbody>${top.map(l => `<tr>
      <td><span class="cat-dot cat-${l.category}"></span>${esc(l.title)}</td>
      <td style="width:35%"><div class="meter"><i style="width:${l.total / tmax * 100}%"></i></div></td>
      <td class="n"><b>${fmt(l.total)}</b></td></tr>`).join('')}</tbody></table>`
      : '<p class="empty">Nenhum clique no período.</p>';
  }

  function renderLinks() {
    const pv = state.stats.totals.pageviews;
    const rows = state.stats.links.map(l => ({ ...l, total: l.clicks + l.story_clicks }));
    const max = Math.max(1, ...rows.map(l => l.total));
    $('#t-links').innerHTML = `<thead><tr><th>#</th><th>Link</th><th>Categoria</th><th class="n">Lista</th><th class="n">Story</th>
      <th class="n">Total</th><th class="n">Visitantes</th><th class="n">Taxa</th><th></th></tr></thead><tbody>${rows.map((l, i) => `<tr>
      <td class="muted">${i + 1}</td>
      <td>${esc(l.title)} ${l.visible ? '' : '<span class="pill off">oculto</span>'}</td>
      <td><span class="cat-dot cat-${l.category}"></span>${esc(catName(l.category))}</td>
      <td class="n">${fmt(l.clicks)}</td><td class="n">${fmt(l.story_clicks)}</td><td class="n"><b>${fmt(l.total)}</b></td>
      <td class="n">${fmt(l.visitors)}</td><td class="n">${pct(l.total, pv)}</td>
      <td style="width:14%"><div class="meter"><i style="width:${l.total / max * 100}%"></i></div></td></tr>`).join('')}</tbody>`;
  }

  function dimTable(title, rows, label = x => esc(x)) {
    const max = Math.max(1, ...rows.map(r => r.pageviews));
    return `<div class="card"><h3>${title}</h3>${rows.length ? `<div class="tbl-wrap"><table>
      <thead><tr><th></th><th class="n">Acessos</th><th class="n">Visit.</th><th class="n">Cliques</th></tr></thead>
      <tbody>${rows.map(r => `<tr><td>${label(r.k)}<div class="meter" style="margin-top:5px"><i style="width:${r.pageviews / max * 100}%"></i></div></td>
      <td class="n">${fmt(r.pageviews)}</td><td class="n">${fmt(r.visitors)}</td><td class="n">${fmt(r.clicks)}</td></tr>`).join('')}</tbody>
      </table></div>` : '<p class="empty">Sem dados no período.</p>'}</div>`;
  }

  function renderDims() {
    const d = state.stats.dims;
    $('#dims').innerHTML = [
      dimTable('Origem do tráfego', d.sources, k => esc(srcName(k))),
      dimTable('Campanhas (UTM)', d.utm),
      dimTable('Dispositivo', d.devices, k => esc(k.charAt(0).toUpperCase() + k.slice(1))),
      dimTable('Navegador', d.browsers),
      dimTable('Sistema', d.os),
      dimTable('País', d.countries, k => esc(regionName(k))),
      dimTable('Cidade', d.cities, k => esc(k.split(' · ').map((p, i, a) => i === a.length - 1 ? regionName(p) : p).join(' · ')))
    ].join('');
  }

  function renderStories() {
    const order = state.stats.links.filter(l => l.visible).sort((a, b) => a.position - b.position);
    $('#story-cards').innerHTML = state.stats.stories.map(s => {
      const titles = order.filter(l => l.category === s.id).map(l => l.title);
      const base = s.retention.find(r => r.idx === 0)?.sessions || Math.max(0, ...s.retention.map(r => r.sessions));
      const ret = s.retention.length ? `<div class="ret">${s.retention.map(r => `<div>
          <span>${r.idx + 1}. ${esc(titles[r.idx] || 'Story ' + (r.idx + 1))}</span>
          <span class="track"><i style="width:${base ? Math.min(100, r.sessions / base * 100) : 0}%"></i></span>
          <b style="text-align:right">${base ? Math.round(r.sessions / base * 100) + '%' : '—'}</b></div>`).join('')}</div>`
        : '<p class="empty" style="color:rgba(255,255,255,.8)">Nenhum story visto no período.</p>';
      return `<div class="story-card" style="background:var(--cat-${s.id})">
        <h3>${ico(CAT[s.id].ring)}${esc(catName(s.id))}</h3>
        <div class="row"><div><b>${fmt(s.opens)}</b><small>aberturas</small></div>
          <div><b>${fmt(s.cta)}</b><small>cliques em Acessar</small></div>
          <div><b>${pct(s.cta, s.opens)}</b><small>conversão</small></div></div>${ret}</div>`;
    }).join('');
  }

  /* ---------------- Visitantes ---------------- */
  async function loadVisitors() {
    $('#t-visitors').innerHTML = '<tbody><tr><td class="muted">Carregando…</td></tr></tbody>';
    try {
      const d = await api(`/api/visitors?from=${state.from}&to=${state.to}`);
      if (!d.visitors.length) { $('#t-visitors').innerHTML = '<tbody><tr><td class="empty">Nenhum visitante no período.</td></tr></tbody>'; return; }
      $('#t-visitors').innerHTML = `<thead><tr><th>Visitante</th><th></th><th>Última visita</th><th class="n">Sessões</th><th class="n">Acessos</th>
        <th class="n">Cliques</th><th class="n">Stories</th><th>Origem</th><th>Dispositivo</th><th>Local</th></tr></thead>
        <tbody>${d.visitors.map(v => `<tr class="click" data-vid="${esc(v.id)}" tabindex="0">
          <td><code>${esc(v.id.slice(0, 8))}</code></td>
          <td>${spDate(v.first_ever) >= state.from ? '<span class="pill hi">novo</span>' : '<span class="pill">recorrente</span>'}</td>
          <td>${dateTime(v.last_seen)}</td><td class="n">${fmt(v.sessions)}</td><td class="n">${fmt(v.pageviews)}</td>
          <td class="n"><b>${fmt(v.clicks)}</b></td><td class="n">${fmt(v.stories)}</td>
          <td>${esc(srcName(v.source))}</td><td>${esc([v.device, v.browser].filter(Boolean).join(' · '))}</td>
          <td>${esc(v.place ? v.place.split(' · ').map((p, i, a) => i === a.length - 1 ? regionName(p) : p).join(' · ') : '—')}</td></tr>`).join('')}</tbody>`;
    } catch (err) { if (err.message !== 'Sessão expirada') toast(err.message); }
  }
  $('#t-visitors').addEventListener('click', e => { const tr = e.target.closest('[data-vid]'); if (tr) openVisitor(tr.dataset.vid); });
  $('#t-visitors').addEventListener('keydown', e => { const tr = e.target.closest('[data-vid]'); if (tr && e.key === 'Enter') openVisitor(tr.dataset.vid); });

  async function openVisitor(id) {
    openModal('#m-visitor');
    $('#m-visitor-title').textContent = `Visitante ${id.slice(0, 8)}`;
    $('#visitor-body').innerHTML = '<p class="muted">Carregando…</p>';
    try {
      const { events } = await api(`/api/visitors?id=${id}`);
      if (!events.length) { $('#visitor-body').innerHTML = '<p class="empty">Sem eventos.</p>'; return; }
      const last = events[0];
      const describe = e => {
        if (e.type === 'pageview') {
          const from = [srcName(e.source), e.referrer_host, e.utm_campaign && 'campanha ' + e.utm_campaign].filter(Boolean).join(' · ');
          return `Abriu a página <span class="muted">· ${esc(from)}</span>`;
        }
        if (e.type === 'click') return `Clicou em <b>${esc(e.title || e.link_id)}</b>`;
        if (e.type === 'story_cta') return `Clicou em Acessar no story <b>${esc(e.title || e.link_id)}</b>`;
        if (e.type === 'story_open') return `Abriu os stories de <b>${esc(catName(e.category))}</b>`;
        if (e.type === 'story_view') return `Viu o story ${e.story_index + 1} de ${esc(catName(e.category))}`;
        return esc(e.type);
      };
      const dot = t => t === 'pageview' ? 'pageview' : (t === 'click' || t === 'story_cta') ? 'click' : 'story';
      let html = `<p class="muted" style="margin:0 0 12px">${esc([last.device, last.browser, last.os].filter(Boolean).join(' · '))}
        ${last.city ? ' · ' + esc(last.city) + (last.country ? ', ' + esc(regionName(last.country)) : '') : ''} · ${fmt(events.length)} eventos (mais recentes primeiro)</p><ul class="journey">`;
      let sess = null;
      for (const e of events) {
        if (e.session_id !== sess) { sess = e.session_id; html += `<li class="sess">Sessão de ${dateTime(e.ts)}</li>`; }
        html += `<li><span class="when">${dateTime(e.ts)}</span><span class="dot ${dot(e.type)}"></span><span>${describe(e)}</span></li>`;
      }
      $('#visitor-body').innerHTML = html + '</ul>';
    } catch (err) { $('#visitor-body').innerHTML = `<p class="msg err">${esc(err.message)}</p>`; }
  }

  /* ---------------- Gerenciar links ---------------- */
  async function loadLinks() {
    try {
      const d = await api('/api/links');
      state.links = d.links; state.icons = d.icons;
      renderManager();
    } catch (err) { if (err.message !== 'Sessão expirada') toast(err.message); }
  }

  function renderManager() {
    $('#mgr').innerHTML = CATS.map(c => {
      const ls = state.links.filter(l => l.category === c.id);
      return `<div class="mgr-cat"><div class="card" style="padding:14px">
        <h3>${ico(c.ring)}${esc(c.name)} <span class="pill" style="margin-left:auto">${ls.filter(l => l.visible).length} visíveis · ${ls.length} no total</span></h3>
        ${ls.length ? `<ul class="mgr-list">${ls.map((l, i) => `<li class="mgr-item ${l.visible ? '' : 'hidden-link'}">
          <span class="mv"><button type="button" data-move="-1" data-id="${esc(l.id)}" aria-label="Subir" ${i === 0 ? 'disabled' : ''}>▲</button>
            <button type="button" data-move="1" data-id="${esc(l.id)}" aria-label="Descer" ${i === ls.length - 1 ? 'disabled' : ''}>▼</button></span>
          <span class="ic">${ico(l.icon)}</span>
          <span style="min-width:0"><span class="tt">${esc(l.title)}</span>
            ${l.tag ? `<span class="pill hi">${esc(l.tag)}</span>` : ''} ${l.visible ? '' : '<span class="pill off">oculto</span>'}
            ${l.footer ? `<span class="pill">rodapé: ${esc(l.footer)}</span>` : ''}
            <span class="uu" style="display:block"><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.url)}</a></span></span>
          <span class="act"><button class="btn small" type="button" data-edit="${esc(l.id)}">Editar</button>
            <button class="btn small ghost" type="button" data-toggle="${esc(l.id)}">${l.visible ? 'Ocultar' : 'Mostrar'}</button></span>
        </li>`).join('')}</ul>` : '<p class="empty">Nenhum link nesta categoria.</p>'}</div></div>`;
    }).join('');
  }

  $('#mgr').addEventListener('click', async e => {
    const mv = e.target.closest('[data-move]'), ed = e.target.closest('[data-edit]'), tg = e.target.closest('[data-toggle]');
    try {
      if (mv) {
        const link = state.links.find(l => l.id === mv.dataset.id);
        const ls = state.links.filter(l => l.category === link.category);
        const i = ls.indexOf(link), j = i + +mv.dataset.move;
        if (j < 0 || j >= ls.length) return;
        [ls[i], ls[j]] = [ls[j], ls[i]];
        await api('/api/links?action=reorder', { method: 'POST', body: JSON.stringify({ category: link.category, ids: ls.map(l => l.id) }) });
        await loadLinks(); toast('Ordem atualizada');
      } else if (tg) {
        const link = state.links.find(l => l.id === tg.dataset.toggle);
        await api(`/api/links?id=${encodeURIComponent(link.id)}`, { method: 'PUT', body: JSON.stringify({ visible: !link.visible }) });
        await loadLinks(); toast(link.visible ? 'Link ocultado' : 'Link visível de novo');
      } else if (ed) {
        openLinkForm(state.links.find(l => l.id === ed.dataset.edit));
      }
    } catch (err) { toast(err.message); }
  });

  $('#new-link').addEventListener('click', () => openLinkForm(null));

  function openLinkForm(link) {
    state.editing = link;
    const f = $('#f-link');
    $('#m-link-title').textContent = link ? 'Editar link' : 'Novo link';
    f.category.innerHTML = CATS.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    f.title.value = link?.title || ''; f.description.value = link?.description || ''; f.url.value = link?.url || '';
    f.category.value = link?.category || 'negocios'; f.footer.value = link?.footer || '';
    f.tag.value = link?.tag || ''; f.visible.checked = link ? link.visible : true;
    const current = link?.icon || 'grid';
    $('#icon-pick').innerHTML = state.icons.map(k => `<button type="button" data-icon="${k}" aria-pressed="${k === current}" title="${k}">${ico(k)}</button>`).join('');
    $('#link-msg').textContent = '';
    openModal('#m-link');
    setTimeout(() => f.title.focus(), 0);
  }
  $('#icon-pick').addEventListener('click', e => {
    const b = e.target.closest('[data-icon]'); if (!b) return;
    $$('#icon-pick button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  });

  $('#f-link').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, btn = f.querySelector('[type=submit]');
    const body = {
      title: f.title.value, description: f.description.value, url: f.url.value.trim(),
      category: f.category.value, footer: f.footer.value || null, tag: f.tag.value, visible: f.visible.checked,
      icon: $('#icon-pick [aria-pressed=true]')?.dataset.icon || 'grid'
    };
    $('#link-msg').textContent = ''; btn.disabled = true;
    try {
      if (state.editing) await api(`/api/links?id=${encodeURIComponent(state.editing.id)}`, { method: 'PUT', body: JSON.stringify(body) });
      else await api('/api/links', { method: 'POST', body: JSON.stringify(body) });
      closeModal('#m-link');
      await loadLinks(); load();
      toast(state.editing ? 'Link atualizado' : 'Link criado');
    } catch (err) { $('#link-msg').textContent = err.message; }
    btn.disabled = false;
  });

  /* ---------------- Modais ---------------- */
  let lastFocus = null;
  function openModal(sel) { lastFocus = document.activeElement; $(sel).hidden = false; }
  function closeModal(sel) { $(sel).hidden = true; if (lastFocus) lastFocus.focus(); }
  $$('.modal').forEach(m => m.addEventListener('click', e => {
    if (e.target === m || e.target.closest('[data-close]')) closeModal('#' + m.id);
  }));
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = $$('.modal').find(m => !m.hidden);
    if (open) closeModal('#' + open.id);
  });

  /* ---------------- Início ---------------- */
  api('/api/me').then(d => showApp(d.email, d.site)).catch(() => showLogin());
})();
