// Leitura e publicação delegada de comunicados, sem abrir o painel administrativo.
export function criarAvisos({ api, esc, usuario }) {
  let gerenciando = false;
  let publicados = [];
  const podePublicar = () => ['Gestor', 'Administrador'].includes(usuario()?.perfil) || !!usuario()?.publicar_avisos;
  const data = valor => valor ? new Date(valor.replace(' ', 'T') + 'Z').toLocaleDateString('pt-BR') : '';
  const orgaos = ['NEPeS', 'Políticas de Saúde', 'Superintendência da APS'];
  const cartao = (n, editar = false) => `<article class="cartao"><h2>${esc(n.titulo)}</h2><p style="white-space:pre-wrap">${esc(n.texto)}</p><small>${esc(n.orgao || 'Coordenação')} · ${esc(data(n.criado_em))}${n.atualizado_em ? ' · Atualizado em ' + esc(data(n.atualizado_em)) : ''}</small>${editar ? `<p>${n.usuario_id ? 'Destinatário: ' + esc(n.destinatario || 'Profissional') : 'Toda a rede'}</p><div class="acoes"><button type="button" data-aviso-editar="${n.id}">Editar</button><button type="button" data-aviso-excluir="${n.id}">Excluir</button></div>` : `<div class="acoes">${n.lida ? '<span class="etiqueta">Lido</span>' : `<button type="button" data-aviso-lida="${n.id}">Marcar como lido</button>`}</div>`}</article>`;

  async function renderizar() {
    const lista = await api('/notificacoes');
    if (!podePublicar()) gerenciando = false;
    publicados = gerenciando ? await api('/notificacoes/todas') : [];
    return `<section data-avisos><p data-aviso-estado role="status"></p>${podePublicar() ? `<div class="acoes bloco"><button type="button" data-aviso-modo>${gerenciando ? 'Voltar aos avisos' : 'Gerenciar comunicados'}</button></div>` : ''}${gerenciando ? `<p>Publique comunicados do seu órgão para a rede. Você pode atualizar ou excluir os comunicados sob sua responsabilidade.</p><div class="cartao bloco"><h2 data-aviso-form-titulo>Novo comunicado</h2><form class="formulario" data-aviso-form><label>Título<input name="titulo" maxlength="180" required></label><label>Mensagem<textarea name="texto" maxlength="10000" rows="5"></textarea></label>${['Gestor', 'Administrador'].includes(usuario()?.perfil) ? `<label>Órgão<select name="orgao"><option value="">Coordenação</option>${orgaos.map(o => `<option>${esc(o)}</option>`).join('')}</select></label>` : `<p>Publicado por ${esc(usuario()?.orgao || 'seu órgão')}.</p>`}<p data-aviso-destino>Toda a rede</p><div class="acoes"><button>Publicar comunicado</button><button type="button" data-aviso-cancelar hidden>Cancelar edição</button></div></form></div><div class="lista">${publicados.map(n => cartao(n, true)).join('') || '<div class="vazio">Você ainda não publicou comunicados.</div>'}</div>` : `<div class="lista">${lista.map(n => cartao(n)).join('') || '<div class="vazio">Nenhum comunicado no momento.</div>'}</div>`}</section>`;
  }

  function ativar() {
    const raiz = document.querySelector('[data-avisos]');
    if (!raiz) return;
    const estado = raiz.querySelector('[data-aviso-estado]');
    const form = raiz.querySelector('[data-aviso-form]');
    let editando;
    const atualizar = async () => {
      const html = await renderizar();
      if (raiz.isConnected) { raiz.outerHTML = html; ativar(); }
    };
    const cancelar = () => {
      editando = undefined; form.reset();
      raiz.querySelector('[data-aviso-form-titulo]').textContent = 'Novo comunicado';
      raiz.querySelector('[data-aviso-destino]').textContent = 'Toda a rede';
      form.querySelector('button').textContent = 'Publicar comunicado';
      form.querySelector('[data-aviso-cancelar]').hidden = true;
    };
    raiz.addEventListener('click', async event => {
      const botao = event.target.closest('button');
      if (!botao || !raiz.contains(botao)) return;
      try {
        if (botao.hasAttribute('data-aviso-modo')) { gerenciando = !gerenciando; await atualizar(); }
        if (botao.hasAttribute('data-aviso-cancelar')) cancelar();
        if (botao.hasAttribute('data-aviso-editar')) {
          const n = publicados.find(n => String(n.id) === botao.dataset.avisoEditar);
          if (!n) return;
          editando = n; form.elements.titulo.value = n.titulo; form.elements.texto.value = n.texto;
          if (form.elements.orgao) form.elements.orgao.value = n.orgao;
          raiz.querySelector('[data-aviso-form-titulo]').textContent = 'Editar comunicado';
          raiz.querySelector('[data-aviso-destino]').textContent = n.usuario_id ? 'Destinatário: ' + (n.destinatario || 'Profissional') : 'Toda a rede';
          form.querySelector('button').textContent = 'Salvar alterações';
          form.querySelector('[data-aviso-cancelar]').hidden = false;
          form.elements.titulo.focus();
        }
        if (botao.hasAttribute('data-aviso-excluir')) {
          if (!window.confirm('Excluir este comunicado?')) return;
          botao.disabled = true;
          await api('/notificacoes/' + encodeURIComponent(botao.dataset.avisoExcluir), { method: 'DELETE' }); await atualizar();
        }
        if (botao.hasAttribute('data-aviso-lida')) {
          botao.disabled = true;
          await api('/notificacoes/' + encodeURIComponent(botao.dataset.avisoLida) + '/lida', { method: 'POST' }); await atualizar();
        }
      } catch (erro) { estado.textContent = erro.message; botao.disabled = false; }
    });
    form?.addEventListener('submit', async event => {
      event.preventDefault();
      const botao = form.querySelector('button'); botao.disabled = true; estado.textContent = '';
      try {
        const dados = Object.fromEntries(new FormData(form));
        // Mantém o destinatário de um aviso individual editado no painel.
        if (editando) dados.usuario_id = editando.usuario_id;
        await api('/notificacoes' + (editando ? '/' + encodeURIComponent(editando.id) : ''), { method: editando ? 'PUT' : 'POST', body: dados });
        await atualizar();
      } catch (erro) { estado.textContent = erro.message; }
      finally { botao.disabled = false; }
    });
  }
  return { renderizar, ativar };
}
