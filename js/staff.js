/* Página da equipe: agrupa por cargo (hierarquia), encaixa os cartões e se atualiza sozinha. */
(() => {
  const raiz = document.getElementById('hier'), busca = document.getElementById('busca'), vazio = document.getElementById('vazio-busca');
  const el = (tag, cls, texto) => { const e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; };
  const HEX = /^#[0-9a-fA-F]{6}$/, IMGURL = /^https:\/\/[A-Za-z0-9._~:\/?#@!$&()*+,;=%-]{1,490}$/;
  const cartoes = new Map();      // slug -> elemento (atualiza no lugar, sem recriar tudo)
  let carregando = false;

  function montar(s) {            // tudo que vem do banco entra como TEXTO ou passa por validação
    const r = s.resumo && typeof s.resumo === 'object' ? s.resumo : {};
    const nome = String(r.name || s.slug), cargo = FX_CARGO(s.cargo);
    const a = el('a', 'cartao');
    a.href = 'Staffperfil.html?u=' + encodeURIComponent(s.slug);
    a.dataset.slug = s.slug; a.dataset.busca = (nome + ' ' + (r.handle || '') + ' ' + s.slug + ' ' + (r.role || '')).toLowerCase();
    a.style.setProperty('--ac', HEX.test(r.c1 || '') ? r.c1 : '#2ba4fb');
    const av = el('div', 'av');
    if (IMGURL.test(r.avatar || '')) { const i = document.createElement('img'); i.alt = ''; i.loading = 'lazy'; i.referrerPolicy = 'no-referrer'; i.src = r.avatar; i.onerror = () => { i.remove(); av.textContent = nome.charAt(0).toUpperCase(); }; av.append(i); }
    else av.textContent = nome.charAt(0).toUpperCase();
    a.append(av, el('b', '', nome));
    if (r.handle) a.append(el('small', '', String(r.handle)));
    if (r.role) a.append(el('span', 'fun', String(r.role)));
    if (r.tagline) a.append(el('span', 'frase', String(r.tagline)));
    a.setAttribute('aria-label', nome + ' — ' + cargo.label);
    return a;
  }

  function render(lista) {
    const vistos = new Set();
    for (const cargo of FX_CARGOS) {
      let sec = raiz.querySelector(`.cargo[data-cargo="${cargo.key}"]`);
      const membros = lista.filter(s => FX_CARGO(s.cargo).key === cargo.key).sort((x, y) => String((x.resumo || {}).name || x.slug).localeCompare(String((y.resumo || {}).name || y.slug), 'pt-BR'));
      if (!membros.length) { if (sec) sec.remove(); continue; }
      if (!sec) {
        sec = el('section', 'cargo'); sec.dataset.cargo = cargo.key; sec.style.setProperty('--cc', cargo.cor);
        const topo = el('div', 'cargo-topo'); topo.append(el('h2', '', cargo.label), el('span', 'n', '0'));
        sec.append(topo, el('div', 'fila'));
      }
      const fila = sec.querySelector('.fila');
      membros.forEach((s, i) => {
        vistos.add(s.slug);
        const novo = montar(s), velho = cartoes.get(s.slug);
        let c = velho;
        if (!velho) { c = novo; cartoes.set(s.slug, c); }
        else if (velho.outerHTML !== novo.outerHTML) { novo.style.animation = 'none'; velho.replaceWith(novo); c = novo; cartoes.set(s.slug, c); }
        if (fila.children[i] !== c) fila.insertBefore(c, fila.children[i] || null);   // encaixa na ordem certa (e muda de cargo se preciso)
      });
      sec.querySelector('.n').textContent = String(membros.length);
      // ordem das seções = hierarquia
      const pos = [...raiz.querySelectorAll('.cargo')].indexOf(sec);
      if (pos === -1) raiz.append(sec);
    }
    // reordena as seções conforme a hierarquia e remove cartões que sumiram
    FX_CARGOS.forEach(c => { const s = raiz.querySelector(`.cargo[data-cargo="${c.key}"]`); if (s) raiz.append(s); });
    for (const [slug, c] of cartoes) if (!vistos.has(slug)) { c.remove(); cartoes.delete(slug); }
    raiz.querySelectorAll(':scope > .fila').forEach(e => e.remove());   // esqueleto de carregamento
    if (!lista.length && !raiz.querySelector('.sub')) raiz.append(el('p', 'sub', 'Os perfis da staff vão aparecer aqui em breve.'));
    if (lista.length) raiz.querySelectorAll('p.sub').forEach(p => p.remove());
    filtrar();
  }

  function filtrar() {
    const q = busca.value.trim().toLowerCase(); let total = 0;
    for (const c of cartoes.values()) { const ok = !q || c.dataset.busca.includes(q); c.classList.toggle('some', !ok); if (ok) total++; }
    raiz.querySelectorAll('.cargo').forEach(s => { s.hidden = !s.querySelector('.cartao:not(.some)'); });
    vazio.hidden = !(q && total === 0);
  }

  async function carregar() {
    if (carregando) return; carregando = true;
    const { data, error } = await FX.sb.from('perfis').select('slug,cargo,resumo').order('slug');
    carregando = false;
    if (error) { if (!cartoes.size) { raiz.replaceChildren(el('p', 'sub', 'Não foi possível carregar a lista agora.')); } return; }
    render(data || []);
  }

  const esq = el('div', 'fila'); for (let i = 0; i < 4; i++) esq.append(el('div', 'esq')); raiz.append(esq);
  busca.addEventListener('input', filtrar);
  carregar();
  // "ao vivo": atualiza ao voltar para a aba e a cada 45 s enquanto ela está aberta
  document.addEventListener('visibilitychange', () => { if (!document.hidden) carregar(); });
  window.addEventListener('focus', carregar);
  setInterval(() => { if (!document.hidden) carregar(); }, 45000);
})();
