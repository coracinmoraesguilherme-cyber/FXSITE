(() => {
  const $ = id => document.getElementById(id), erro = $('erro'), sb = FX.sb;
  let email = '', captcha = '', tmr = 0;
  const TS = (window.FX_CONFIG || {}).TURNSTILE_SITE_KEY;

  if (TS) {   // anti-robô opcional (Cloudflare Turnstile)
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true;
    s.onload = () => window.turnstile.render('#cf', { sitekey: TS, callback: t => { captcha = t; }, 'expired-callback': () => { captcha = ''; } });
    document.head.append(s);
  }

  async function rotear() {
    const user = await FX.usuario(), staff = await FX.staff(user);
    if (!user || !staff || !staff.ativo) {
      await sb.auth.signOut();
      erro.textContent = 'Este e-mail não tem acesso à área da staff.'; passo(1); return;
    }
    const n = await FX.nivel();
    const verificar = n.nextLevel === 'aal2' && n.currentLevel !== 'aal2';
    const adminSem2fa = staff.role === 'admin' && n.nextLevel !== 'aal2';
    location.replace(verificar || adminSem2fa ? 'mfa.html' : 'painel.html');
  }
  function passo(n) { $('f1').hidden = n !== 1; $('f2').hidden = n !== 2; if (n === 1) $('email').focus(); else $('codigo').focus(); }
  function espera(seg) {
    clearInterval(tmr); const b = $('reenviar'); b.disabled = true;
    tmr = setInterval(() => { b.textContent = seg > 0 ? `Enviar outro código (${seg}s)` : 'Enviar outro código'; if (seg-- <= 0) { b.disabled = false; clearInterval(tmr); } }, 1000);
  }
  async function enviar() {
    const options = { shouldCreateUser: true };       // o cadastro só passa se o e-mail estiver na lista (hook no banco)
    if (TS) { if (!captcha) { erro.textContent = 'Complete a verificação anti-robô.'; return false; } options.captchaToken = captcha; }
    const { error } = await sb.auth.signInWithOtp({ email, options });
    if (TS && window.turnstile) { window.turnstile.reset(); captcha = ''; }
    if (error && (error.status === 429 || /rate_limit/.test(error.code || ''))) { erro.textContent = FX.msgErro(error); return false; }
    return true;   // resposta igual para e-mail autorizado ou não: não revela quem é staff
  }

  $('f1').addEventListener('submit', async e => {
    e.preventDefault(); erro.textContent = '';
    email = $('email').value.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { erro.textContent = 'Digite um e-mail válido.'; return; }
    $('enviar').disabled = true;
    if (await enviar()) { $('aviso2').textContent = 'Se este e-mail estiver autorizado, enviamos um código de acesso. Veja também a caixa de spam.'; passo(2); espera(60); }
    $('enviar').disabled = false;
  });
  $('f2').addEventListener('submit', async e => {
    e.preventDefault(); erro.textContent = '';
    const token = $('codigo').value.trim();
    if (!/^\d{6,10}$/.test(token)) { erro.textContent = 'Digite o código numérico recebido.'; return; }
    $('entrar').disabled = true;
    const { error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
    if (error) { erro.textContent = 'Código inválido ou expirado.'; $('codigo').value = ''; $('entrar').disabled = false; return; }
    await rotear();
  });
  $('reenviar').addEventListener('click', async () => { erro.textContent = ''; if (await enviar()) espera(60); });
  $('trocar').addEventListener('click', () => { erro.textContent = ''; passo(1); });

  FX.usuario().then(u => { if (u) rotear(); });
})();
