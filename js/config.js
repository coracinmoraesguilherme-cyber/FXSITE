/* Configuração PÚBLICA. Tudo aqui vai para o navegador de qualquer visitante — é assim por design.
   Use SOMENTE a chave "publishable" (sb_publishable_...). NUNCA coloque aqui uma chave "secret"
   (sb_secret_...) nem a antiga "service_role": ela ignora todas as regras de segurança.
   Depois de editar, rode:  npm run csp   */
window.FX_CONFIG = Object.freeze({
  SUPABASE_URL: 'https://vybvpzelpqzepeltogta.supabase.co',
  SUPABASE_KEY: 'sb_publishable_DUI9kFQajslTIa8g5DCFuA_FEnsmtnt',
  TURNSTILE_SITE_KEY: ''   // opcional: chave pública do Cloudflare Turnstile (anti-robô no login)
});
