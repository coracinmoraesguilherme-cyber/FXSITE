/* Cliente da API do FXSMP. Cookie de sessão é HttpOnly (o JS não enxerga); o token CSRF vem de /api/me. */
const FX = (() => {
  let csrf = '';
  async function req(metodo, url, corpo) {
    const o = { method: metodo, credentials: 'same-origin', headers: {} };
    if (corpo !== undefined) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(corpo); }
    if (metodo !== 'GET') o.headers['X-CSRF-Token'] = csrf;
    const r = await fetch(url, o);
    let j = null; try { j = await r.json(); } catch (e) {}
    if (!r.ok) { const err = new Error((j && j.erro) || 'Erro ' + r.status); err.status = r.status; throw err; }
    return j;
  }
  return {
    async me() { const j = await req('GET', '/api/me'); csrf = j.csrf || ''; return j.user; },
    setCsrf(v) { csrf = v || ''; },
    get: u => req('GET', u),
    post: (u, b) => req('POST', u, b || {}),
    put: (u, b) => req('PUT', u, b)
  };
})();
