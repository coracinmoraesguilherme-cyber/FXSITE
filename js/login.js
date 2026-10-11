(() => {
  const f = document.getElementById('f'), erro = document.getElementById('erro'), btn = document.getElementById('entrar');
  f.addEventListener('submit', async e => {
    e.preventDefault();
    erro.textContent = ''; btn.disabled = true;
    try {
      const r = await FX.post('/api/login', { usuario: f.usuario.value, senha: f.senha.value });
      location.replace(r.user.mustChange ? 'senha.html' : 'painel.html');
    } catch (err) {
      erro.textContent = err.message;
      f.senha.value = ''; f.senha.focus(); btn.disabled = false;
    }
  });
})();
