(async () => {
  const ctx = await FX.exigirStaff(); if (!ctx) return;
  const { user, staff } = ctx, n = await FX.nivel();
  if ((n.nextLevel === 'aal2' && n.currentLevel !== 'aal2') || (staff.role === 'admin' && n.nextLevel !== 'aal2')) return location.replace('mfa.html');
  document.getElementById('nome').textContent = staff.nome;
  document.getElementById('ver').href = 'Staffperfil.html?u=' + encodeURIComponent(staff.slug) + '&ver=1';
  document.getElementById('mfa-sub').textContent = n.nextLevel === 'aal2' ? 'Ativada nesta conta.' : 'Proteja a sua conta com um app autenticador.';
  if (staff.role === 'admin') document.getElementById('adm').hidden = false;
  document.getElementById('sair').addEventListener('click', () => FX.sair());
})();
