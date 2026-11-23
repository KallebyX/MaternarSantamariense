// Identidade visível no diretório e nas conversas. Uploads usam o token da sessão.
export const AREAS_PROFISSIONAIS = ['Políticas', 'Enfermagem', 'Técnico de Enfermagem', 'Medicina', 'Odontologia', 'Outros'];
export function campoArea(usuario, esc) {
  return `<label>Área profissional<select name="area" aria-label="Área profissional">${AREAS_PROFISSIONAIS.map(a=>`<option value="${esc(a)}"${a===(usuario.area||'Outros')?' selected':''}>${esc(a)}</option>`).join('')}</select></label>`;
}
export function criarFotoPerfil({esc, obterToken, aoSalvar}) {
  function renderizar(usuario) {
    const temFoto=/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(usuario.foto||'');
    return `<section class="cartao perfil-foto-card" aria-labelledby="perfil-foto-titulo"><h2 id="perfil-foto-titulo">Foto de perfil</h2><p>Ajude seus colegas a reconhecer você no diretório e no chat.</p>${temFoto?`<img class="perfil-foto-preview" src="${esc(usuario.foto)}" alt="Sua foto de perfil">`:'<p class="muted">Você ainda não adicionou uma foto.</p>'}<form class="formulario" data-perfil-foto><label>Selecionar foto<input type="file" name="foto" accept="image/jpeg,image/png,image/webp" required></label><small>JPG, PNG ou WebP. Até 2 MB.</small><div class="acoes"><button>Salvar foto</button>${temFoto?'<button type="button" data-perfil-foto-remover>Remover foto</button>':''}</div><p role="status" data-perfil-foto-status></p></form></section>`;
  }
  async function enviar(method, body) {
    const resposta=await fetch('/api/usuarios/eu/foto',{method,headers:{Authorization:'Bearer '+obterToken()},body,signal:AbortSignal.timeout(20000)});
    const dados=await resposta.json().catch(()=>null);
    if(!resposta.ok||!dados?.ok)throw new Error(dados?.erro||'Não foi possível salvar a foto. Tente novamente.');
    await aoSalvar(dados.dados);
  }
  function ativar() {
    const form=document.querySelector('[data-perfil-foto]');
    if(!form)return;
    async function executar(method) {
      const estado=form.querySelector('[data-perfil-foto-status]');
      const botoes=[...form.querySelectorAll('button')];
      botoes.forEach(b=>b.disabled=true);
      estado.textContent='Salvando foto…';
      try {
        let corpo;
        if(method==='POST') {
          const arquivo=form.elements.foto.files[0];
          if(!arquivo)throw new Error('Selecione uma foto para continuar.');
          if(!['image/jpeg','image/png','image/webp'].includes(arquivo.type))throw new Error('Use uma foto JPG, PNG ou WebP.');
          if(arquivo.size>2*1024*1024)throw new Error('A foto deve ter até 2 MB.');
          corpo=new FormData();corpo.append('foto',arquivo);
        }
        await enviar(method,corpo);
        if(form.isConnected)estado.textContent=method==='DELETE'?'Foto removida.':'Foto atualizada.';
      } catch(erro) {if(form.isConnected)estado.textContent=erro.message;}
      finally {botoes.forEach(b=>b.disabled=false);}
    }
    form.addEventListener('submit',event=>{event.preventDefault();executar('POST');});
    form.querySelector('[data-perfil-foto-remover]')?.addEventListener('click',()=>executar('DELETE'));
  }
  return {renderizar,ativar};
}
