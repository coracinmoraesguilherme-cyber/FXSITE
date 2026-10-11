(async () => {
  const grade = document.getElementById('grade');
  const el = (tag, cls, texto) => { const e = document.createElement(tag); if (cls) e.className = cls; if (texto) e.textContent = texto; return e; };
  try {
    const { staff } = await FX.get('/api/staff');
    if (!staff.length) { grade.append(el('p', 'sub', 'Os perfis da staff vão aparecer aqui em breve.')); return; }
    for (const s of staff) {
      const a = el('a', 'scard');
      a.href = 'Staffperfil.html?u=' + encodeURIComponent(s.id);
      a.append(el('b', '', s.nome));
      if (s.handle) a.append(el('small', '', s.handle));
      if (s.role) a.append(el('span', 'tag', s.role));
      if (s.tagline) a.append(el('span', '', s.tagline));
      grade.append(a);
    }
  } catch (e) { grade.append(el('p', 'sub', 'Não foi possível carregar a lista agora.')); }
})();
