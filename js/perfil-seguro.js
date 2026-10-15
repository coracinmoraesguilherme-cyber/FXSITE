/* Sanitizador do perfil — roda no NAVEGADOR sobre tudo que vem do banco (e antes de salvar).
   Nunca confie no que está no banco: o perfil é público e escrito por outra pessoa.
   Reconstrói o objeto só com campos e valores permitidos (lista branca). */
(function (raiz) {
  'use strict';
  const FONTES = ['Montserrat', 'Inter', 'Fraunces', 'Space Grotesk', 'JetBrains Mono'];
  const CARD = ['glass', 'solid', 'outline', 'flat'], BTN = ['pill', 'solid', 'outline', 'soft'];
  const LAYOUT = ['classic', 'center', 'sidebar'], ALIGN = ['left', 'center'], DENS = ['compact', 'normal', 'airy'];
  const TAMANHOS = ['full', 'half', 'third'];
  const REDES = ['Discord', 'Instagram', 'Twitter/X', 'YouTube', 'TikTok', 'GitHub', 'Site', 'Outro'];
  const CAMPOS = { text: ['text'], info: ['items'], tags: ['items'], links: ['items'], music: ['url'], video: ['url'],
    gallery: ['items'], cards: ['items'], quote: ['text', 'by'], highlight: ['text', 'url'], sep: [] };
  const COR = /^#[0-9a-fA-F]{6}$/;
  const URLOK = /^https?:\/\/[^\s"'<>`\\]{1,2000}$/;
  const tem = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  let removidos = 0;                       // quantas imagens "data:" antigas foram descartadas
  const txt = (v, max) => (typeof v === 'string' ? v.replace(/\u0000/g, '').slice(0, max) : '');
  const url = v => { v = typeof v === 'string' ? v.trim() : ''; if (/^data:/i.test(v)) removidos++; return v && URLOK.test(v) ? v : ''; };
  const num = (v, min, max, pad) => { v = Number(v); return Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : pad; };
  const cor = (v, pad) => (typeof v === 'string' && COR.test(v) ? v : pad);
  const enu = (v, l, pad) => (l.includes(v) ? v : pad);
  const novoId = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0');

  // linhas de "items": remove linhas com data: (imagens embutidas antigas) e limita tamanho
  function itens(v) {
    if (typeof v !== 'string') return '';
    return v.replace(/\u0000/g, '').split('\n').filter(l => { if (/data:image\//i.test(l)) { removidos++; return false; } return true; })
      .join('\n').slice(0, 20000);
  }

  function normaliza(x) {
    removidos = 0;
    if (!x || typeof x !== 'object' || Array.isArray(x) || !x.p || typeof x.p !== 'object' || !x.t || typeof x.t !== 'object' ||
        !Array.isArray(x.tabs) || !x.tabs.length) return null;
    const p = x.p, t = x.t;
    const out = {
      p: { name: txt(p.name, 60), handle: txt(p.handle, 40), role: txt(p.role, 60), tagline: txt(p.tagline, 160),
        bio: txt(p.bio, 1500), long: txt(p.long, 8000), avatar: url(p.avatar), banner: url(p.banner),
        showBanner: p.showBanner !== false, blur: num(p.blur, 0, 30, 0), overlay: num(p.overlay, 0, 100, 25) },
      t: { c1: cor(t.c1, '#2ba4fb'), c2: cor(t.c2, '#1d7fe0'), bg: cor(t.bg, '#162342'), font: enu(t.font, FONTES, 'Montserrat'),
        card: enu(t.card, CARD, 'solid'), btn: enu(t.btn, BTN, 'outline'), radius: num(t.radius, 0, 60, 8), glow: t.glow === true,
        layout: enu(t.layout, LAYOUT, 'classic'), nav: t.nav !== false, align: enu(t.align, ALIGN, 'left'),
        density: enu(t.density, DENS, 'normal'), titles: t.titles !== false },
      social: [], tabs: []
    };
    for (const s of (Array.isArray(x.social) ? x.social : []).slice(0, 12))
      if (s && typeof s === 'object') out.social.push({ k: enu(s.k, REDES, 'Outro'), u: url(s.u) });
    const usados = new Set(); let total = 0;
    for (const tb of x.tabs.slice(0, 12)) {
      if (!tb || typeof tb !== 'object') continue;
      const aba = { n: txt(tb.n, 40) || 'Aba', b: [] };
      for (const b of (Array.isArray(tb.b) ? tb.b : []).slice(0, 60)) {
        if (!b || typeof b !== 'object' || typeof b.type !== 'string' || !tem(CAMPOS, b.type) || ++total > 200) continue;
        let id = typeof b.id === 'string' && /^[a-z0-9]{1,12}$/.test(b.id) ? b.id : novoId();
        while (usados.has(id)) id = novoId();
        usados.add(id);
        const d = {}, src = b.d && typeof b.d === 'object' ? b.d : {};
        for (const k of CAMPOS[b.type]) d[k] = k === 'url' ? url(src.url) : k === 'items' ? itens(src.items) : txt(src[k], k === 'by' ? 100 : 5000);
        aba.b.push({ id, type: b.type, title: txt(b.title, 100), size: enu(b.size, TAMANHOS, 'full'), hide: b.hide === true, d });
      }
      out.tabs.push(aba);
    }
    return out.tabs.length ? out : null;
  }
  const api = { normaliza, imagensRemovidas: () => removidos };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else raiz.FXSafe = api;
})(typeof window !== 'undefined' ? window : globalThis);
