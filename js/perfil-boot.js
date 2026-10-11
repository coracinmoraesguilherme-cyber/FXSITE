/* Decide se a pessoa pode EDITAR (staff logado, no próprio perfil) ou só VER, busca o perfil no servidor
   e então carrega o editor (perfil.js). Quem não é staff nunca recebe o editor em modo de edição. */
(async () => {
  const q = new URLSearchParams(location.search);
  const aviso = (titulo, texto) => {
    const app = document.getElementById('app');
    const d = document.createElement('div'); d.className = 'vazio';
    const h = document.createElement('h2'); h.textContent = titulo;
    const p = document.createElement('p'); p.textContent = texto;
    const a = document.createElement('a'); a.href = 'staff.html'; a.textContent = 'Ver a equipe';
    d.append(h, p, a); app.replaceChildren(d);
  };
  let me = null; try { me = await FX.me(); } catch (e) {}
  const pedido = (q.get('u') || '').toLowerCase();
  const alvo = /^[a-z0-9][a-z0-9_.-]{2,23}$/.test(pedido) ? pedido : (me ? me.id : '');
  if (!alvo) return aviso('Escolha um perfil', 'Abra um perfil pela lista da equipe.');

  let dados;
  try { dados = await FX.get('/api/perfil/' + encodeURIComponent(alvo)); }
  catch (e) { return aviso(e.status === 404 ? 'Perfil não encontrado' : 'Não foi possível carregar', e.status === 404 ? 'Esse perfil não existe ou não está disponível.' : 'Tente de novo em instantes.'); }

  const canEdit = !!me && !me.mustChange && me.id === alvo && q.get('ver') !== '1';
  if (!dados.perfil && !canEdit) return aviso('Perfil em construção', 'Esta pessoa ainda não montou o perfil.');

  window.FXCTX = { perfil: dados.perfil, nome: dados.nome, alvo, canEdit };
  document.body.classList.add(canEdit ? 'edit' : 'ro');
  if (dados.perfil && dados.perfil.p && dados.perfil.p.name) document.title = 'FXSMP | ' + dados.perfil.p.name;
  const s = document.createElement('script'); s.src = 'js/perfil.js'; document.body.append(s);
})();
