// Move a mesma navegação entre a coluna de desktop e um diálogo nativo no celular.
// O diálogo fornece foco contido, Escape e conteúdo de fundo inerte.
export function iniciarNavegacaoMobile({ root, sidebar, open, close, label, breakpoint = 900 }) {
  const container = document.querySelector(root);
  const lateral = document.querySelector(sidebar);
  const abrir = document.querySelector(open);
  const fechar = document.querySelector(close);
  if (!container || !lateral || !abrir || !fechar) return;
  const lugar = document.createComment('navegação desktop');
  lateral.before(lugar);
  const dialogo = document.createElement('dialog');
  dialogo.id = 'menu-mobile-dialog';
  dialogo.className = 'mobile-navigation-drawer';
  dialogo.setAttribute('aria-label', label);
  document.body.append(dialogo);
  abrir.setAttribute('aria-controls', dialogo.id);
  const tela = window.matchMedia(`(max-width: ${breakpoint}px)`);
  let devolverFoco = true;
  const atualizarEstado = () => {
    abrir.setAttribute('aria-expanded', String(dialogo.open));
    document.body.classList.toggle('mobile-navigation-open', dialogo.open);
  };
  const encerrar = (restaurarFoco = true) => {
    if (dialogo.open) { devolverFoco = restaurarFoco; dialogo.close(); }
    atualizarEstado();
  };
  abrir.addEventListener('click', () => {
    if (!tela.matches || dialogo.open) return;
    devolverFoco = true;
    dialogo.showModal();
    atualizarEstado();
    fechar.focus({ preventScroll: true });
    lateral.querySelector('[aria-current="page"], .ativo')?.scrollIntoView({ block: 'nearest' });
  });
  fechar.addEventListener('click', () => encerrar());
  dialogo.addEventListener('close', () => {
    atualizarEstado();
    if (devolverFoco && abrir.getClientRects().length) abrir.focus({ preventScroll: true });
  });
  dialogo.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controles = [...dialogo.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')]
      .filter(elemento => elemento.getClientRects().length);
    const primeiro = controles[0], ultimo = controles.at(-1);
    if (event.shiftKey && document.activeElement === primeiro) {
      event.preventDefault(); ultimo?.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault(); primeiro?.focus();
    }
  });
  dialogo.addEventListener('click', event => {
    if (event.target !== dialogo) return;
    const r = dialogo.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) encerrar();
  });
  lateral.addEventListener('click', event => {
    if (event.target.closest('a, #menu button, #sair')) encerrar(false);
  });
  // A sessão pode expirar enquanto a navegação está no diálogo, fora do root.
  new MutationObserver(() => {
    if (container.hidden || container.classList.contains('oculto')) encerrar(false);
  }).observe(container, { attributes: true, attributeFilter: ['hidden', 'class'] });
  window.addEventListener('hashchange', () => encerrar(false));
  const reposicionar = () => {
    encerrar(false);
    if (tela.matches) dialogo.append(lateral);
    else lugar.after(lateral);
  };
  tela.addEventListener('change', reposicionar);
  reposicionar();
}
