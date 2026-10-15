(async () => {
  const ctx = await FX.exigirStaff(); if (!ctx) return;
  if (ctx.staff.role !== 'admin') return location.replace('painel.html');
  const n = await FX.nivel();
  if (n.currentLevel !== 'aal2') return location.replace('mfa.html');   // (a regra de verdade está no banco; isto é só a tela)
  const sb = FX.sb, $ = id => document.getElementById(id), lista = $('lista'), erro = $('erro');
  const ATRIBUIVEIS = FX_CARGOS.filter(c => c.key !== 'dono');      // "Dono(a)" só pelo SQL
  for (const c of ATRIBUIVEIS) { const o = document.createElement('option'); o.value = c.key; o.textContent = c.label; $('cargo').append(o); }
  $('cargo').value = 'construtor';
  const el = (tag, cls, texto) => { const e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; };

  async function carregar() {
    const { data, error } = await sb.from('staff').select('id,email,slug,nome,cargo,role,ativo,user_id,criado_em').order('criado_em');
    if (error) { erro.textContent = FX.msgErro(error); return; }
    lista.replaceChildren();
    for (const c of data) {
      const tr = el('tr');
      tr.append(el('td', '', c.email), el('td', '', c.slug), el('td', '', c.nome));
      const tdc = el('td');
      if (c.role === 'admin' || c.cargo === 'dono') tdc.append(el('span', 'tag a', FX_CARGO(c.cargo).label));
      else {
        const sel = el('select'); sel.setAttribute('aria-label', 'Cargo de ' + c.nome);
        for (const x of ATRIBUIVEIS) { const o = el('option', '', x.label); o.value = x.key; sel.append(o); }
        sel.value = c.cargo;
        sel.onchange = async () => {
          erro.textContent = '';
          const r = await sb.from('staff').update({ cargo: sel.value }).eq('id', c.id).select('id');
          if (r.error || !r.data || !r.data.length) erro.textContent = r.error ? FX.msgErro(r.error) : 'Nada foi alterado (sem permissão).';
          await carregar();
        };
        tdc.append(sel);
      }
      tr.append(tdc);
      const sit = el('td');
      if (c.role === 'admin') sit.append(el('span', 'tag a', 'Conta primária'));
      sit.append(c.ativo ? el('span', 'tag v', 'Autorizada') : el('span', 'tag x', 'Desativada'));
      sit.append(el('span', 'tag', c.user_id ? 'Já entrou' : 'Ainda não entrou'));
      tr.append(sit);
      const ac = el('td');
      if (c.role !== 'admin') {
        const b = el('button', 'btn-s', c.ativo ? 'Desativar' : 'Reativar'); b.type = 'button';
        b.onclick = async () => {
          if (c.ativo && !confirm('Desativar ' + c.email + '? A pessoa perde o acesso e o perfil some do público agora.')) return;
          erro.textContent = '';
          const r = await sb.from('staff').update({ ativo: !c.ativo }).eq('id', c.id).select('id');
          if (r.error || !r.data || !r.data.length) erro.textContent = r.error ? FX.msgErro(r.error) : 'Nada foi alterado (sem permissão).';
          await carregar();
        };
        ac.append(b);
      }
      tr.append(ac); lista.append(tr);
    }
  }
  $('f').addEventListener('submit', async e => {
    e.preventDefault(); erro.textContent = ''; $('criar').disabled = true;
    const row = { email: $('email').value.trim().toLowerCase(), slug: $('slug').value.trim().toLowerCase(), nome: $('nome').value.trim(), cargo: $('cargo').value };
    const { error } = await sb.from('staff').insert(row);
    if (error) erro.textContent = FX.msgErro(error); else { $('f').reset(); $('cargo').value = 'construtor'; await carregar(); }
    $('criar').disabled = false;
  });
  carregar();
})();
