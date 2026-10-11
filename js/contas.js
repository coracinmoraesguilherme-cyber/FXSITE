(async () => {
  const me = await FX.me().catch(() => null);
  if (!me) return location.replace('login.html');
  if (me.role !== 'admin') return location.replace('painel.html');
  const $ = id => document.getElementById(id), lista = $('lista'), erro = $('erro'), box = $('senhabox');

  const el = (tag, cls, texto) => { const e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; };
  const fmt = ts => new Date(ts).toLocaleDateString('pt-BR');

  function mostraSenha(conta, senha, titulo) {
    box.replaceChildren(
      el('b', '', titulo + ' — ' + conta.id),
      el('code', '', senha),
      el('small', '', 'Copie agora e envie à pessoa por um canal privado. Esta senha não aparece de novo e precisa ser trocada no primeiro login.')
    );
    const copiar = el('button', 'btn-s', 'Copiar senha'); copiar.type = 'button'; copiar.style.marginTop = '10px';
    copiar.onclick = async () => { try { await navigator.clipboard.writeText(senha); copiar.textContent = 'Copiado!'; } catch (e) { copiar.textContent = 'Selecione e copie manualmente'; } };
    box.append(copiar); box.hidden = false;
  }

  async function agir(fn) { erro.textContent = ''; try { await fn(); await carregar(); } catch (e) { erro.textContent = e.message; } }

  async function carregar() {
    const { contas } = await FX.get('/api/admin/contas');
    lista.replaceChildren();
    for (const c of contas) {
      const tr = el('tr');
      tr.append(el('td', '', c.id), el('td', '', c.nome));
      const sit = el('td');
      if (c.role === 'admin') sit.append(el('span', 'tag a', 'Conta primária'));
      sit.append(c.ativo ? el('span', 'tag v', 'Ativa') : el('span', 'tag x', 'Desativada'));
      if (c.mustChange) sit.append(el('span', 'tag', 'Senha provisória'));
      tr.append(sit);
      const acoes = el('td');
      if (c.role !== 'admin') {
        const r = el('button', 'btn-s', 'Resetar senha'); r.type = 'button';
        r.onclick = () => { if (confirm('Gerar nova senha provisória para ' + c.id + '? A senha atual deixa de funcionar.')) agir(async () => { const j = await FX.post('/api/admin/contas/' + c.id + '/resetar'); mostraSenha(j.conta, j.senhaProvisoria, 'Nova senha provisória'); }); };
        const s = el('button', 'btn-s', c.ativo ? 'Desativar' : 'Reativar'); s.type = 'button';
        s.onclick = () => { if (!c.ativo || confirm('Desativar ' + c.id + '? A pessoa perde o acesso agora.')) agir(() => FX.post('/api/admin/contas/' + c.id + '/status', { ativo: !c.ativo })); };
        acoes.append(r, s);
      } else acoes.append(el('small', '', 'Criada em ' + fmt(c.criadoEm)));
      tr.append(acoes); lista.append(tr);
    }
  }

  $('f').addEventListener('submit', async e => {
    e.preventDefault(); erro.textContent = ''; $('criar').disabled = true;
    try {
      const j = await FX.post('/api/admin/contas', { usuario: $('usuario').value, nome: $('nome').value });
      mostraSenha(j.conta, j.senhaProvisoria, 'Conta criada'); $('f').reset(); await carregar();
    } catch (err) { erro.textContent = err.message; }
    $('criar').disabled = false;
  });
  carregar().catch(e => { erro.textContent = e.message; });
})();
