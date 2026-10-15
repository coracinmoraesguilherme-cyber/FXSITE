(async () => {
  const grade = document.getElementById('grade');
  const el = (tag, cls, texto) => { const e = document.createElement(tag); if (cls) e.className = cls; if (texto) e.textContent = texto; return e; };
  const { data, error } = await FX.sb.from('perfis').select('slug,resumo').order('slug');
  if (error) { grade.append(el('p', 'sub', 'Não foi possível carregar a lista agora.')); return; }
  if (!data.length) { grade.append(el('p', 'sub', 'Os perfis da staff vão aparecer aqui em breve.')); return; }
  for (const s of data) {
    const r = s.resumo || {}, a = el('a', 'scard');
    a.href = 'Staffperfil.html?u=' + encodeURIComponent(s.slug);
    a.append(el('b', '', String(r.name || s.slug)));
    if (r.handle) a.append(el('small', '', String(r.handle)));
    if (r.role) a.append(el('span', 'tag', String(r.role)));
    if (r.tagline) a.append(el('span', '', String(r.tagline)));
    grade.append(a);
  }
})();
