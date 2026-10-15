/* Hierarquia de cargos (ordem = do mais alto ao mais baixo). Usado pela página da equipe e pelo painel de contas.
   O cargo real vem do banco (só a administração altera); aqui ficam só nomes e cores. */
window.FX_CARGOS = Object.freeze([
  { key: 'dono',       label: 'Dono(a)',        cor: '#fbbf24' },
  { key: 'admin',      label: 'Admin',          cor: '#f87171' },
  { key: 'mod',        label: 'Mod (Discord)',  cor: '#a78bfa' },
  { key: 'interprete', label: 'Intérprete',     cor: '#4ade80' },
  { key: 'construtor', label: 'Construtor',     cor: '#38bdf8' }
]);
window.FX_CARGO = key => window.FX_CARGOS.find(c => c.key === key) || window.FX_CARGOS[window.FX_CARGOS.length - 1];
