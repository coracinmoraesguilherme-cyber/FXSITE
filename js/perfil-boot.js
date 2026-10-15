/* Decide se a pessoa pode EDITAR (staff ativa, no próprio perfil) ou só VER, busca o perfil e carrega o editor.
   Visitante nunca recebe o editor. A permissão de gravar é imposta pelo banco (RLS), não por esta tela. */
(async () => {
  const q = new URLSearchParams(location.search);
  const aviso = (titulo, texto) => {
    const d = document.createElement('div'); d.className = 'vazio';
    const h = document.createElement('h2'); h.textContent = titulo;
    const p = document.createElement('p'); p.textContent = texto;
    const a = document.createElement('a'); a.href = 'staff.html'; a.textContent = 'Ver a equipe';
    d.append(h, p, a); document.getElementById('app').replaceChildren(d);
  };
  const user = await FX.usuario(), staff = user ? await FX.staff(user) : null;
  const ativa = !!(staff && staff.ativo);
  const pedido = (q.get('u') || '').toLowerCase();
  const alvo = /^[a-z0-9][a-z0-9_.-]{2,23}$/.test(pedido) ? pedido : (ativa ? staff.slug : '');
  if (!alvo) return aviso('Escolha um perfil', 'Abra um perfil pela lista da equipe.');

  const { data, error } = await FX.sb.from('perfis').select('slug,dados').eq('slug', alvo).maybeSingle();
  if (error) return aviso('Não foi possível carregar', 'Tente de novo em instantes.');
  const canEdit = ativa && staff.slug === alvo && q.get('ver') !== '1';
  const perfil = data ? window.FXSafe.normaliza(data.dados) : null;
  if (!perfil && !canEdit) return aviso('Perfil não encontrado', 'Esse perfil não existe, está em construção ou não está disponível.');

  window.FXCTX = { perfil, nome: staff ? staff.nome : '', alvo, canEdit, uid: user ? user.id : null, existe: !!data };
  document.body.classList.add(canEdit ? 'edit' : 'ro');
  if (perfil && perfil.p.name) document.title = 'FXSMP | ' + perfil.p.name;
  const s = document.createElement('script'); s.src = 'js/perfil.js'; document.body.append(s);
})();
