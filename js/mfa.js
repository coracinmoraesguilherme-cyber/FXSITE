(async () => {
  const ctx = await FX.exigirStaff(); if (!ctx) return;
  const sb = FX.sb, $ = id => document.getElementById(id), erro = $('erro');
  if (ctx.staff.role === 'admin') { $('obrig').hidden = false; $('voltar').hidden = true; }
  const n = await FX.nivel();
  if (n.currentLevel === 'aal2') { $('verif').hidden = false; $('verif').firstChild.textContent = 'A verificação em duas etapas já está ativa nesta sessão.'; $('voltar').hidden = false; return; }

  const { data: lf } = await sb.auth.mfa.listFactors();
  const verificados = (lf && lf.totp) || [];
  let factorId;
  if (verificados.length) { factorId = verificados[0].id; $('verif').hidden = false; }
  else {
    for (const f of (lf && lf.all) || []) if (f.factor_type === 'totp' && f.status === 'unverified') await sb.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'FXSMP' });
    if (error) { erro.textContent = FX.msgErro(error); return; }
    factorId = data.id; $('qr').src = data.totp.qr_code; $('seg').textContent = data.totp.secret; $('enroll').hidden = false;
  }
  $('f').hidden = false; $('codigo').focus();
  $('f').addEventListener('submit', async e => {
    e.preventDefault(); erro.textContent = '';
    const code = $('codigo').value.trim();
    if (!/^\d{6}$/.test(code)) { erro.textContent = 'Digite os 6 dígitos do app.'; return; }
    $('ok').disabled = true;
    const ch = await sb.auth.mfa.challenge({ factorId });
    const v = ch.error ? ch : await sb.auth.mfa.verify({ factorId, challengeId: ch.data.id, code });
    if (v.error) { erro.textContent = 'Código incorreto ou expirado.'; $('codigo').value = ''; $('ok').disabled = false; return; }
    location.replace('painel.html');
  });
})();
