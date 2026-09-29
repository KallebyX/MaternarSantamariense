// Conversas persistidas pela API. Rascunhos ficam apenas na memória desta aba.
export function criarComunicacao({api, esc, id}) {
  const rascunhos = new Map();
  let atual;
  const novoId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2,'0')).join('');
  function mensagem(m) {
    const instante = new Date(m.criado_em.replace(' ','T')+'Z');
    const quando = Number.isNaN(instante.getTime()) ? m.hora : instante.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'});
    return `<article class="mensagem" data-mensagem="${m.id}"><strong>${esc(m.autor)}</strong> <small>${esc(quando)}</small><p>${esc(m.texto)}</p></article>`;
  }
  function parar() {
    if (!atual) return;
    clearTimeout(atual.timer);
    atual = null;
  }
  async function renderizar(params) {
    const canais = await api('/canais');
    if (!canais.length) return '<div class="vazio">A coordenação ainda não criou canais de comunicação.</div>';
    const canal = canais.find(c=>c.id===params.get('canal')) || canais[0];
    const {dados,meta} = await api('/canais/'+id(canal.id)+'/mensagens',{comMeta:true});
    return `<nav class="filtros canais" aria-label="Canais de comunicação">${canais.map(c=>`<a class="botao" href="#mensagens?canal=${id(c.id)}" ${c.id===canal.id?'aria-current="page"':''}>${esc(c.nome)}</a>`).join('')}</nav><h2>${esc(canal.nome)}</h2><p class="muted">${esc(canal.subtitulo)}</p><div class="chat-estado"><span data-chat-status role="status">Atualização automática</span><button type="button" data-chat-reconectar hidden>Tentar reconectar</button></div><button type="button" data-chat-anteriores ${meta.temAnteriores?'':'hidden'}>Carregar mensagens anteriores</button><div class="mensagens" data-canal="${esc(canal.id)}" data-cursor="${dados.at(-1)?.id||0}" role="log" aria-label="Mensagens do canal" aria-live="polite" tabindex="0">${dados.map(mensagem).join('')||'<div class="vazio">Nenhuma mensagem neste canal. Inicie a conversa.</div>'}</div><button type="button" data-chat-novas hidden>Ver novas mensagens ↓</button><form class="formulario" data-form="mensagem" data-canal="${esc(canal.id)}"><label>Sua mensagem<textarea name="texto" required maxlength="2000" placeholder="Escreva para a equipe">${esc(rascunhos.get(canal.id)?.texto||'')}</textarea></label><small>Canal compartilhado com os profissionais da rede. Até 2.000 caracteres.</small><button>Enviar mensagem</button></form>`;
  }
  function inserir(ctx, mensagens, anteriores=false) {
    const box=ctx.box, altura=box.scrollHeight, topo=box.scrollTop;
    const seguir=altura-topo-box.clientHeight<80;
    let adicionadas=0;
    for (const m of mensagens) {
      if (ctx.ids.has(m.id)) continue;
      box.querySelector('.vazio')?.remove();
      const seguinte=Array.from(box.children).find(el=>Number(el.dataset.mensagem)>m.id);
      if (seguinte) seguinte.insertAdjacentHTML('beforebegin',mensagem(m));
      else box.insertAdjacentHTML('beforeend',mensagem(m));
      ctx.ids.add(m.id);adicionadas++;
    }
    if (anteriores) box.scrollTop=topo+box.scrollHeight-altura;
    else if (seguir) box.scrollTop=box.scrollHeight;
    else if (adicionadas) ctx.novas.hidden=false;
  }
  async function atualizar(ctx) {
    if (atual!==ctx || ctx.ocupado) return;
    clearTimeout(ctx.timer);
    if (document.hidden) { ctx.timer=setTimeout(()=>atualizar(ctx),2000);return; }
    ctx.ocupado=true;
    let demora=2000;
    try {
      const resposta=await api('/canais/'+id(ctx.canal)+'/mensagens?depois='+ctx.cursor,{comMeta:true});
      if (atual!==ctx) return;
      inserir(ctx,resposta.dados);
      ctx.cursor=resposta.dados.at(-1)?.id||ctx.cursor;
      ctx.status.textContent='Atualização automática';ctx.reconectar.hidden=true;
      if (resposta.meta.maisNovas) demora=0;
    } catch (erro) {
      if (atual===ctx) { ctx.status.textContent=erro.message+' Seu rascunho está preservado.';ctx.reconectar.hidden=false; }
    } finally {
      ctx.ocupado=false;
      if (atual===ctx) ctx.timer=setTimeout(()=>atualizar(ctx),demora);
    }
  }
  function ativar() {
    const box=document.querySelector('.mensagens[data-canal]');
    if (!box) return;
    const ctx=atual={box,canal:box.dataset.canal,cursor:Number(box.dataset.cursor),ids:new Set(Array.from(box.children).map(e=>Number(e.dataset.mensagem)).filter(Boolean)),ocupado:false,
      status:document.querySelector('[data-chat-status]'),reconectar:document.querySelector('[data-chat-reconectar]'),novas:document.querySelector('[data-chat-novas]')};
    box.scrollTop=box.scrollHeight;
    ctx.novas.onclick=()=>{box.scrollTop=box.scrollHeight;ctx.novas.hidden=true;};
    ctx.reconectar.onclick=()=>atualizar(ctx);
    box.addEventListener('scroll',()=>{if(box.scrollHeight-box.scrollTop-box.clientHeight<80)ctx.novas.hidden=true;});
    const form=document.querySelector('[data-form=mensagem]');
    form.elements.texto.addEventListener('input',()=>rascunhos.set(ctx.canal,{texto:form.elements.texto.value,clientId:novoId()}));
    const anteriores=document.querySelector('[data-chat-anteriores]');
    anteriores.onclick=async()=>{
      anteriores.disabled=true;
      try {
        const resposta=await api('/canais/'+id(ctx.canal)+'/mensagens?antes='+Math.min(...ctx.ids),{comMeta:true});
        if(atual!==ctx)return;
        inserir(ctx,resposta.dados,true);anteriores.hidden=!resposta.meta.temAnteriores;
      } catch(erro) {if(atual===ctx)ctx.status.textContent=erro.message;}
      finally {anteriores.disabled=false;}
    };
    atualizar(ctx);
  }
  async function enviar(form) {
    const canal=form.dataset.canal, entrada=form.elements.texto;
    if (!entrada.value.trim()) throw new Error('Escreva sua mensagem antes de enviar.');
    let rascunho=rascunhos.get(canal);
    if (!rascunho || rascunho.texto!==entrada.value) {
      rascunho={texto:entrada.value,clientId:novoId()};rascunhos.set(canal,rascunho);
    }
    entrada.disabled=true;
    try {
      const enviada=await api('/canais/'+id(canal)+'/mensagens',{method:'POST',body:rascunho});
      if (rascunhos.get(canal)===rascunho) {
        rascunhos.delete(canal);
        if(atual?.canal===canal)document.querySelector('[data-form=mensagem]').elements.texto.value='';
      }
      if (atual?.canal===canal) {inserir(atual,[enviada]);atual.box.scrollTop=atual.box.scrollHeight;atual.novas.hidden=true;atualizar(atual);}
    } finally {entrada.disabled=false;if(form.isConnected)entrada.focus();}
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&atual)atualizar(atual);});
  window.addEventListener('online',()=>{if(atual)atualizar(atual);});
  return {renderizar,ativar,parar,enviar};
}
