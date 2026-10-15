/* Cliente Supabase + helpers. Carregado depois de config.js e vendor/supabase.js. */
(() => {
  const C = window.FX_CONFIG || {};
  const falha = msg => {
    document.addEventListener('DOMContentLoaded', () => {
      const d = document.createElement('div');
      d.setAttribute('role', 'alert');
      d.style.cssText = 'position:fixed;inset:0 0 auto 0;z-index:9999;background:#7f1d1d;color:#fff;padding:14px 18px;font:14px sans-serif';
      d.textContent = msg; document.body.prepend(d);
    });
    throw new Error(msg);
  };
  // Trava de segurança: recusa chave secreta/service_role no navegador.
  const chave = String(C.SUPABASE_KEY || '');
  let papel = '';
  try { papel = JSON.parse(atob(chave.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role || ''; } catch (e) {}
  if (/^sb_secret_/.test(chave) || papel === 'service_role') falha('Configuração insegura: há uma chave SECRETA no config.js. Troque pela chave publishable e gire a chave exposta no painel do Supabase.');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/.test(String(C.SUPABASE_URL || '')) || !chave || /COLE_AQUI/.test(chave)) falha('Configure SUPABASE_URL e SUPABASE_KEY em js/config.js.');
  if (!window.supabase || !window.supabase.createClient) falha('Biblioteca do Supabase ausente. Rode "npm install && npm run vendor" (veja o LEIA-ME).');

  const sb = window.supabase.createClient(C.SUPABASE_URL, chave, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }   // não aceita tokens vindos da URL
  });

  const FX = {
    sb,
    esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    // Usuário logado, validado no servidor (getUser confere o token; getSession só lê o que está guardado).
    async usuario() {
      const s = await sb.auth.getSession();
      if (!s.data || !s.data.session) return null;
      const { data, error } = await sb.auth.getUser();
      return error || !data ? null : data.user;
    },
    // Linha da tabela "staff" desta pessoa (quem é staff/admin vem do banco, nunca do navegador).
    async staff(user) {
      if (!user) return null;
      const { data, error } = await sb.from('staff').select('nome,slug,role,ativo').eq('user_id', user.id).maybeSingle();
      return error ? null : data;
    },
    async nivel() {
      const { data, error } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
      return error ? { currentLevel: 'aal1', nextLevel: 'aal1' } : data;
    },
    // Exige staff ativa. Redireciona para o login se não for.
    async exigirStaff() {
      const user = await FX.usuario();
      const staff = await FX.staff(user);
      if (!user || !staff || !staff.ativo) { if (user) await sb.auth.signOut(); location.replace('login.html'); return null; }
      return { user, staff };
    },
    async sair() { try { await sb.auth.signOut(); } catch (e) {} location.replace('login.html'); },
    msgErro(e) {
      const c = e && (e.code || ''), s = e && e.status;
      if (s === 429 || /rate_limit/.test(c)) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
      if (c === '23505') return 'Esse e-mail ou usuário já existe.';
      if (c === '23514') return 'Formato inválido ou conteúdo grande demais.';
      if (c === '42501') return 'Sem permissão. Confira se você entrou com verificação em duas etapas.';
      return 'Não foi possível concluir. Tente novamente.';
    }
  };
  window.FX = Object.freeze(FX);
})();
