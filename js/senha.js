(async () => {
  const me = await FX.me().catch(() => null);
  if (!me) return location.replace('login.html');
  const f = document.getElementById('f'), erro = document.getElementById('erro'), btn = document.getElementById('salvar');
  if (me.mustChange) { document.getElementById('aviso').hidden = false; document.getElementById('voltar').hidden = true; }
  f.addEventListener('submit', async e => {
    e.preventDefault(); erro.className = 'erro'; erro.textContent = '';
    if (f.nova.value !== f.conf.value) { erro.textContent = 'As senhas novas não são iguais.'; return; }
    btn.disabled = true;
    try {
      const r = await FX.post('/api/senha', { atual: f.atual.value, nova: f.nova.value });
      FX.setCsrf(r.csrf);
      location.replace('painel.html');
    } catch (err) { erro.textContent = err.message; btn.disabled = false; }
  });
})();
