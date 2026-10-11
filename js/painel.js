(async () => {
  const me = await FX.me().catch(() => null);
  if (!me) return location.replace('login.html');
  if (me.mustChange) return location.replace('senha.html');
  document.getElementById('nome').textContent = me.nome;
  document.getElementById('ver').href = 'Staffperfil.html?u=' + encodeURIComponent(me.id) + '&ver=1';
  if (me.role === 'admin') document.getElementById('adm').hidden = false;
  document.getElementById('sair').addEventListener('click', async () => {
    try { await FX.post('/api/logout'); } catch (e) {}
    location.replace('login.html');
  });
})();
