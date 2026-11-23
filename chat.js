// Canais da rede e conversas individuais persistidos. Rascunhos são locais à aba.
export function criarComunicacao({api, esc, id, obterToken}) {
  const rascunhos = new Map();
  let atual, imagensAtivas;
  const novoId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2,'0')).join('');
  const referenciaFoto = valor => /^\/api\/colegas\/[1-9]\d*\/foto(?:\?v=[a-zA-Z0-9_-]{1,128})?$/.test(valor||'') ? valor : '';
  function foto(pessoa) {
    const referencia=referenciaFoto(pessoa?.foto);
    const iniciais=pessoa?.iniciais||String(pessoa?.nome||pessoa?.autor||'?').trim().split(/\s+/).slice(0,2).map(p=>p[0]).join('');
    return `<span class="chat-avatar"${referencia?` data-chat-foto="${esc(referencia)}"`:''}><span class="chat-foto chat-iniciais" aria-hidden="true">${esc(iniciais)}</span>${referencia?'<img class="chat-foto" alt="" hidden>':''}</span>`;
  }
  async function carregarFoto(elemento, contexto) {
    const referencia=elemento.dataset.chatFoto;
    if(imagensAtivas!==contexto||!elemento.isConnected)return;
    let promessa=contexto.cache.get(referencia);
    if(!promessa) {
      promessa=(async()=>{
        const resposta=await fetch(referencia,{headers:{Authorization:'Bearer '+obterToken()},signal:AbortSignal.any([contexto.controller.signal,AbortSignal.timeout(15000)])});
        if(!resposta.ok||!['image/jpeg','image/png','image/webp'].includes((resposta.headers.get('Content-Type')||'').split(';')[0])||Number(resposta.headers.get('Content-Length'))>2*1024*1024)return null;
        const blob=await resposta.blob();
        if(imagensAtivas!==contexto||!blob.size||blob.size>2*1024*1024)return null;
        const url=URL.createObjectURL(blob);contexto.urls.add(url);return url;
      })().catch(()=>null);
      contexto.cache.set(referencia,promessa);
    }
    const url=await promessa;
    if(!url||imagensAtivas!==contexto||!elemento.isConnected)return;
    const imagem=elemento.querySelector('img');
    imagem.onload=()=>{if(imagensAtivas===contexto&&elemento.isConnected){imagem.hidden=false;elemento.querySelector('.chat-iniciais').hidden=true;}};
    imagem.src=url;
  }
  function observarFotos(raiz=document) {
    const contexto=imagensAtivas;if(!contexto)return;
    raiz.querySelectorAll('[data-chat-foto]:not([data-chat-foto-observada])').forEach(elemento=>{
      elemento.dataset.chatFotoObservada='1';
      if(contexto.observer)contexto.observer.observe(elemento);else carregarFoto(elemento,contexto);
    });
  }
  function ativarFotos() {
    const contexto=imagensAtivas={controller:new AbortController(),cache:new Map(),urls:new Set()};
    if('IntersectionObserver' in window)contexto.observer=new IntersectionObserver(entradas=>{
      for(const entrada of entradas)if(entrada.isIntersecting){contexto.observer.unobserve(entrada.target);carregarFoto(entrada.target,contexto);}
    },{rootMargin:'150px'});
    observarFotos();
  }
  const pessoa = p => `${foto(p)}<span><strong>${esc(p.nome)}</strong><small>${[p.area,p.cargo,p.unidade].filter(Boolean).map(esc).join(' · ')||'Profissional da rede'}</small></span>`;
  function mensagem(m) {
    const instante = new Date(String(m.criado_em||'').replace(' ','T')+'Z');
    const quando = Number.isNaN(instante.getTime()) ? m.hora : instante.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'});
    return `<article class="mensagem" data-mensagem="${Number(m.id)}"><div class="chat-autor">${foto(m)}<span><strong>${esc(m.autor)}</strong> <small>${esc(quando)}</small></span></div><p>${esc(m.texto)}</p></article>`;
  }
  function parar() {
    if(atual)clearTimeout(atual.timer);
    atual=null;
    if(imagensAtivas) {
      imagensAtivas.controller.abort();imagensAtivas.observer?.disconnect();
      for(const url of imagensAtivas.urls)URL.revokeObjectURL(url);
      imagensAtivas=null;
    }
  }
  async function renderizar(params) {
    const q=params.get('q')||'', area=params.get('area')||'', pagina=params.get('pagina_colegas')||'1';
    const [canais,conversas,diretorio,areas] = await Promise.all([api('/canais'),api('/conversas'),api('/colegas?'+new URLSearchParams({q,area,pagina}),{comMeta:true}),api('/areas')]);
    const colegas=diretorio.dados;
    const diretorioAberto=(!params.has('conversa')&&!params.has('canal'))||['q','area','pagina_colegas'].some(c=>params.has(c));
    const paginaLink=(valor,texto)=>{const p=new URLSearchParams(params);p.set('pagina_colegas',String(valor));return `<a class="botao" href="#mensagens?${esc(p.toString())}">${texto}</a>`;};
    const paginacao=diretorio.meta.paginas>1?`<nav class="acoes" aria-label="Páginas de colegas">${diretorio.meta.pagina>1?paginaLink(diretorio.meta.pagina-1,'Colegas anteriores'):''}<span>Página ${diretorio.meta.pagina} de ${diretorio.meta.paginas}</span>${diretorio.meta.pagina<diretorio.meta.paginas?paginaLink(diretorio.meta.pagina+1,'Próximos colegas'):''}</nav>`:'';
    const conversa=conversas.find(c=>String(c.id)===params.get('conversa'));
    const canal=conversa?null:canais.find(c=>String(c.id)===params.get('canal'))||(!params.has('conversa')?canais[0]:null);
    const filtros=`<details class="cartao chat-diretorio"${diretorioAberto?' open':''}><summary><h2>Encontrar um colega</h2></summary><form class="filtros" data-form="filtros"><input type="hidden" name="pagina_colegas" value="1"><label>Nome do colega<input name="q" type="search" value="${esc(q)}" placeholder="Buscar pelo nome"></label><label>Área profissional<select name="area" aria-label="Área profissional"><option value="">Todas as áreas</option>${areas.map(a=>`<option${a===area?' selected':''}>${esc(a)}</option>`).join('')}</select></label><button>Buscar colegas</button></form><p class="muted">Confira o nome, a área e a foto antes de iniciar uma conversa.</p><div class="chat-colegas">${colegas.length?colegas.map(p=>`<article class="chat-colega">${pessoa(p)}<button type="button" data-chat-colega="${Number(p.id)}" aria-label="Conversar com ${esc(p.nome)}">Conversar</button></article>`).join(''):'<p class="vazio">Nenhum colega encontrado com esses filtros.</p>'}</div>${paginacao}<p role="status" data-chat-diretorio-status></p></details>`;
    const navegacao=`<div class="chat-navegacao"><section aria-labelledby="chat-conversas-titulo"><h2 id="chat-conversas-titulo">Minhas conversas</h2><nav class="chat-conversas" aria-label="Conversas individuais">${conversas.length?conversas.map(c=>`<a class="botao chat-conversa" href="#mensagens?conversa=${id(c.id)}" ${conversa?.id===c.id?'aria-current="page"':''}>${pessoa(c.colega)}</a>`).join(''):'<p class="muted">Escolha um colega para iniciar uma conversa individual.</p>'}</nav></section><section aria-labelledby="chat-canais-titulo"><h2 id="chat-canais-titulo">Canais da rede</h2><nav class="filtros canais" aria-label="Canais de comunicação">${canais.map(c=>`<a class="botao" href="#mensagens?canal=${id(c.id)}" ${canal?.id===c.id?'aria-current="page"':''}>${esc(c.nome.replace(/^#+\s*/,''))}</a>`).join('')||'<p class="muted">A coordenação ainda não criou canais de comunicação.</p>'}</nav></section></div>`;
    if(!conversa&&!canal)return filtros+navegacao+'<div class="vazio">Selecione uma conversa ou um canal para ver as mensagens.</div>';
    const chave=conversa?'conversa:'+conversa.id:'canal:'+canal.id;
    const endpoint=(conversa?'/conversas/':'/canais/')+id((conversa||canal).id)+'/mensagens';
    const {dados,meta} = await api(endpoint,{comMeta:true});
    return filtros+navegacao+`<section class="chat-conteudo" aria-label="Conversa selecionada"><h2>${conversa?'Conversa com '+esc(conversa.colega.nome):esc(canal.nome.replace(/^#+\s*/,''))}</h2><p class="muted">${conversa?'Somente você e este colega têm acesso a esta conversa.':esc(canal.subtitulo)}</p><div class="chat-estado"><span data-chat-status role="status">Atualização automática</span><button type="button" data-chat-reconectar hidden>Tentar reconectar</button></div><button type="button" data-chat-anteriores ${meta.temAnteriores?'':'hidden'}>Carregar mensagens anteriores</button><div class="mensagens" data-chat-endpoint="${esc(endpoint)}" data-chat-chave="${esc(chave)}" ${canal?`data-canal="${esc(canal.id)}"`:''} data-cursor="${dados.at(-1)?.id||0}" role="log" aria-label="Mensagens ${conversa?'da conversa':'do canal'}" aria-live="polite" tabindex="0">${dados.map(mensagem).join('')||'<div class="vazio">Nenhuma mensagem. Inicie a conversa.</div>'}</div><button type="button" data-chat-novas hidden>Ver novas mensagens ↓</button><form class="formulario" data-form="mensagem" data-chat-endpoint="${esc(endpoint)}" data-chat-chave="${esc(chave)}" ${canal?`data-canal="${esc(canal.id)}"`:''}><label>Sua mensagem<textarea name="texto" required maxlength="2000" placeholder="Escreva sua mensagem">${esc(rascunhos.get(chave)?.texto||'')}</textarea></label><small>${conversa?'Conversa individual.':'Canal compartilhado com os profissionais da rede.'} Até 2.000 caracteres.</small><button>Enviar mensagem</button></form></section>`;
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
    observarFotos(box);
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
      const resposta=await api(ctx.endpoint+'?depois='+ctx.cursor,{comMeta:true});
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
    ativarFotos();
    document.querySelectorAll('[data-chat-colega]').forEach(botao=>botao.onclick=async()=>{
      botao.disabled=true;
      const estado=document.querySelector('[data-chat-diretorio-status]');
      try {
        const conversa=await api('/conversas',{method:'POST',body:{usuarioId:Number(botao.dataset.chatColega)}});
        if(botao.isConnected)location.hash='mensagens?conversa='+id(conversa.id);
      } catch(erro) {if(estado?.isConnected)estado.textContent=erro.message;}
      finally {botao.disabled=false;}
    });
    const box=document.querySelector('.mensagens[data-chat-endpoint]');
    if (!box) return;
    const ctx=atual={box,endpoint:box.dataset.chatEndpoint,chave:box.dataset.chatChave,cursor:Number(box.dataset.cursor),ids:new Set(Array.from(box.children).map(e=>Number(e.dataset.mensagem)).filter(Boolean)),ocupado:false,
      status:document.querySelector('[data-chat-status]'),reconectar:document.querySelector('[data-chat-reconectar]'),novas:document.querySelector('[data-chat-novas]')};
    box.scrollTop=box.scrollHeight;
    ctx.novas.onclick=()=>{box.scrollTop=box.scrollHeight;ctx.novas.hidden=true;};
    ctx.reconectar.onclick=()=>atualizar(ctx);
    box.addEventListener('scroll',()=>{if(box.scrollHeight-box.scrollTop-box.clientHeight<80)ctx.novas.hidden=true;});
    const form=document.querySelector('[data-form=mensagem]');
    form.elements.texto.addEventListener('input',()=>rascunhos.set(ctx.chave,{texto:form.elements.texto.value,clientId:novoId()}));
    const anteriores=document.querySelector('[data-chat-anteriores]');
    anteriores.onclick=async()=>{
      anteriores.disabled=true;
      try {
        const resposta=await api(ctx.endpoint+'?antes='+Math.min(...ctx.ids),{comMeta:true});
        if(atual!==ctx)return;
        inserir(ctx,resposta.dados,true);anteriores.hidden=!resposta.meta.temAnteriores;
      } catch(erro) {if(atual===ctx)ctx.status.textContent=erro.message;}
      finally {anteriores.disabled=false;}
    };
    atualizar(ctx);
  }
  async function enviar(form) {
    const chave=form.dataset.chatChave, entrada=form.elements.texto;
    if (!entrada.value.trim()) throw new Error('Escreva sua mensagem antes de enviar.');
    let rascunho=rascunhos.get(chave);
    if (!rascunho || rascunho.texto!==entrada.value) {
      rascunho={texto:entrada.value,clientId:novoId()};rascunhos.set(chave,rascunho);
    }
    entrada.disabled=true;
    try {
      const enviada=await api(form.dataset.chatEndpoint,{method:'POST',body:rascunho});
      if (rascunhos.get(chave)===rascunho) {
        rascunhos.delete(chave);
        if(atual?.chave===chave)document.querySelector('[data-form=mensagem]').elements.texto.value='';
      }
      if (atual?.chave===chave) {inserir(atual,[enviada]);atual.box.scrollTop=atual.box.scrollHeight;atual.novas.hidden=true;atualizar(atual);}
    } finally {entrada.disabled=false;if(form.isConnected)entrada.focus();}
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&atual)atualizar(atual);});
  window.addEventListener('online',()=>{if(atual)atualizar(atual);});
  return {renderizar,ativar,parar,enviar};
}
