import { iniciarNavegacaoMobile } from './mobile-navigation.js';
import { criarComunicacao } from './chat.js';
// A API é a fonte de verdade; o navegador guarda somente a sessão.
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const id = v => encodeURIComponent(v);
let token = localStorage.getItem('maternar.token') || '';
let usuario, timer;
let sequencia = 0;
const menu = [
  ['inicio','Início','Seu espaço de aprendizagem e comunicação com a rede.'],
  ['cursos','Meus cursos','Formações, aulas e acompanhamento do seu progresso.'],
  ['qualifica','Qualifica Profissional','Capacitações e recursos para sua prática profissional.'],
  ['politicas','Políticas de saúde','Materiais organizados por área de atenção.'],
  ['protocolos','Protocolos','Referências disponibilizadas pela coordenação.'],
  ['documentos','Documentos','Biblioteca da rede municipal de saúde.'],
  ['produtos','Produtos e ferramentas','Materiais e ferramentas de apoio à prática profissional.'],
  ['projetos','Projetos de pesquisa','Pesquisas cadastradas no NEPeS.'],
  ['agenda','Agenda','Encontros, capacitações e atividades da rede.'],
  ['mensagens','Comunicação','Converse com a equipe nos canais da rede.'],
  ['avisos','Avisos','Comunicados da coordenação para você e para a rede.'],
  ['certificados','Meus certificados','Comprovantes dos cursos que você concluiu.'],
  ['links','Links úteis','Serviços e referências da rede.'],
  ['perfil','Meu perfil','Seus dados profissionais e sua senha de acesso.'],
  ['sobre','Sobre o projeto','Educação permanente para fortalecer o cuidado materno-infantil.'],
];
function salvarSessao(dados) {
  token = dados.token || token; usuario = dados.usuario || usuario;
  localStorage.setItem('maternar.token', token);
  localStorage.setItem('maternar.usuario', JSON.stringify({nome:usuario.nome, perfil:usuario.perfil}));
}
function limparSessao() {
  localStorage.removeItem('maternar.token'); localStorage.removeItem('maternar.usuario');
  token=''; location.replace('/#acesso');
}
async function api(caminho, {method='GET', body, comMeta=false}={}) {
  let resposta;
  try { resposta=await fetch('/api'+caminho,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)}); }
  catch { throw new Error('Não foi possível conectar. Verifique sua conexão e tente novamente.'); }
  const dados=await resposta.json().catch(()=>null);
  if (resposta.status===401) { limparSessao(); throw new Error('Sua sessão expirou. Entre novamente.'); }
  if (!resposta.ok || !dados?.ok) throw new Error(dados?.erro || 'Não foi possível carregar os dados.');
  return comMeta ? dados : dados.dados;
}
function avisar(texto) { clearTimeout(timer); $('#mensagem').textContent=texto; $('#mensagem').hidden=false; timer=setTimeout(()=>$('#mensagem').hidden=true,6000); }
function urlSegura(valor) {
  if (!valor) return '';
  try { const u=new URL(valor,location.origin+'/'); return ['https:','http:'].includes(u.protocol)?u.href:''; } catch { return ''; }
}
function link(url, texto='Abrir material', extra='') {
  const seguro=urlSegura(url);
  return seguro?`<a class="botao" href="${esc(seguro)}" target="_blank" rel="noopener noreferrer" ${extra}>${esc(texto)} ↗</a>`:'<span class="muted">Conteúdo aguardando publicação.</span>';
}
const etiqueta = (texto, verde=false) => `<span class="etiqueta${verde?' verde':''}">${esc(texto)}</span>`;
const vazio = texto => `<div class="vazio">${esc(texto)}</div>`;
const grade = itens => itens.length?`<div class="grade">${itens.join('')}</div>`:vazio('Nenhum registro encontrado.');
const data = valor => valor ? new Date(valor.replace(' ','T')+'Z').toLocaleDateString('pt-BR') : '—';
function filtros({q='',opcoes=[],selecionado='',label='Filtrar',placeholder='Buscar por título'}={}) {
  return `<form class="filtros" data-form="filtros"><label>Busca<input name="q" type="search" placeholder="${esc(placeholder)}" value="${esc(q)}"></label>${opcoes.length?`<label>${esc(label)}<select name="filtro"><option value="">Todos</option>${opcoes.map(o=>`<option value="${esc(o)}"${o===selecionado?' selected':''}>${esc(o)}</option>`).join('')}</select></label>`:''}<button>Aplicar</button></form>`;
}
const combina = (termo,...campos) => !termo || campos.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(termo.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
const rotaAtual = () => { const [rota='inicio',query=''] = location.hash.slice(1).split('?'); return {rota:rota||'inicio', params:new URLSearchParams(query)}; };
function ir(rota) { if(location.hash==='#'+rota) carregar(); else location.hash=rota; }
function cartaoMaterial(m,contexto='') {
  return `<article class="cartao">${etiqueta(m.tipo||contexto||'Material')}<h3>${esc(m.titulo||m.nome)}</h3><p>${esc(m.descricao||m.fonte||contexto)}</p>${m.tags?.length?`<p>${m.tags.map(esc).join(' · ')}</p>`:''}<div class="acoes">${link(m.url)}</div></article>`;
}
function cartaoCurso(c,progresso) {
  const feitas=progresso.filter(p=>p.curso_id===c.id).length;
  return `<article class="cartao">${c.capa?`<img class="capa" src="${esc(urlSegura(c.capa))}" alt="" loading="lazy">`:''}${etiqueta(c.area)}<h3>${esc(c.titulo)}</h3><p>${esc(c.descricao)}</p><small>${esc(c.horas)} horas · ${esc(c.nivel)}</small><progress value="${feitas}" max="${c.aulas.length||1}" aria-label="Progresso em ${esc(c.titulo)}"></progress><small>${feitas} de ${c.aulas.length} aulas concluídas</small><div class="acoes"><a class="botao" href="#curso?curso=${id(c.id)}">Acessar curso</a></div></article>`;
}
async function inicio() {
  const [cursos,p,avisos,certificados]=await Promise.all([api('/cursos'),api('/progresso'),api('/notificacoes'),api('/certificados/meus')]);
  return `<div class="cartao destaque"><h2>Olá, ${esc(usuario.nome.split(' ')[0])}.</h2><p>${esc(usuario.cargo||'Profissional de saúde')}${usuario.unidade?' · '+esc(usuario.unidade):''}</p><a href="#cursos">Continuar minha aprendizagem →</a></div><div class="estatisticas"><div class="cartao"><strong>${p.progresso.length}</strong><span>Aulas concluídas</span></div><div class="cartao"><strong>${certificados.length}</strong><span>Certificados</span></div><div class="cartao"><strong>${avisos.filter(n=>!n.lida).length}</strong><span>Avisos não lidos</span></div></div><h2>Formações da rede</h2>${grade(cursos.slice(0,3).map(c=>cartaoCurso(c,p.progresso)))}<h2 class="secao-titulo">Comunicados recentes</h2>${avisos.length?`<div class="lista">${avisos.slice(0,3).map(n=>`<article class="cartao"><h3>${esc(n.titulo)}</h3><p>${esc(n.texto)}</p><a href="#avisos">Ver comunicados →</a></article>`).join('')}</div>`:vazio('Você está em dia. Novos comunicados aparecerão aqui.')}`;
}
async function cursos(params) {
  const [lista,p]=await Promise.all([api('/cursos'),api('/progresso')]);
  const q=params.get('q')||'', area=params.get('filtro')||'';
  if(!lista.length)return vazio('Nenhum curso publicado no momento. As formações serão disponibilizadas pela coordenação após o cadastro das aulas.');
  return filtros({q,opcoes:[...new Set(lista.map(c=>c.area))],selecionado:area,label:'Área'})+grade(lista.filter(c=>(!area||c.area===area)&&combina(q,c.titulo,c.descricao)).map(c=>cartaoCurso(c,p.progresso)));
}
async function curso(params) {
  const [c,p]=await Promise.all([api('/cursos/'+id(params.get('curso'))),api('/progresso')]);
  const feitas=new Set(p.progresso.filter(a=>a.curso_id===c.id).map(a=>a.aula_ordem));
  return `<p><a href="#cursos">← Voltar aos cursos</a></p><div class="cartao bloco">${etiqueta(c.area)}<h2>${esc(c.titulo)}</h2><p>${esc(c.descricao)}</p><p>${esc(c.horas)} horas · ${feitas.size}/${c.aulas.length} aulas concluídas</p><progress value="${feitas.size}" max="${c.aulas.length||1}" aria-label="Progresso do curso"></progress></div><div class="lista">${c.aulas.map((a,i)=>`<article class="cartao curso-aula"><div>${etiqueta(feitas.has(a.ordem)?'Concluída':`Aula ${i+1}`,feitas.has(a.ordem))}<h3>${esc(a.titulo)}</h3><p>${esc(a.duracao)}</p></div><div class="acoes">${link(a.url,'Acessar aula')}${a.url&&!feitas.has(a.ordem)?`<button data-acao="concluir" data-curso="${esc(c.id)}" data-ordem="${a.ordem}">Concluir aula</button>`:''}</div></article>`).join('')||vazio('A coordenação ainda não publicou as aulas deste curso.')}</div>${c.aulas.length&&feitas.size===c.aulas.length?`<div class="cartao destaque" style="margin-top:24px"><h2>Curso concluído</h2><p>Seu progresso foi salvo. Você já pode emitir o certificado.</p><button data-acao="emitir" data-curso="${esc(c.id)}">Emitir certificado</button></div>`:''}`;
}
async function qualifica(params) {
  const dados=await api('/qualifica'),q=params.get('q')||'',tipo=params.get('filtro')||'',trilha=params.get('trilha');
  const t=dados.trilhas.find(t=>String(t.id)===trilha);
  return filtros({q,opcoes:['Capacitações online','Capacitações presenciais','Capacitações livres'],selecionado:tipo,label:'Modalidade'})+(!trilha&&dados.trilhas.length?`<h2>Trilhas de aprendizagem</h2><div class="grade bloco">${dados.trilhas.map(t=>`<article class="cartao"><h3>${esc(t.nome)}</h3><p>${esc(t.descricao)}</p><a href="#qualifica?trilha=${t.id}">Ver módulos →</a></article>`).join('')}</div>`:'')+(t?`<div class="cartao bloco"><h2>${esc(t.nome)}</h2><p>${esc(t.descricao)}</p><a href="#qualifica">Ver todas as capacitações</a></div>`:'')+grade(dados.modulos.filter(m=>(!t||t.modulos.map(Number).includes(m.id))&&(!tipo||m.tipo===tipo)&&combina(q,m.titulo,m.descricao)).map(m=>`<article class="cartao">${etiqueta(m.tipo)}<h3>${esc(m.titulo)}</h3><p>${esc(m.descricao)}</p>${m.duracao||m.nivel?`<small>${[m.duracao,m.nivel].filter(Boolean).map(esc).join(' · ')}</small>`:''}<small>${m.recursos.length} recursos disponíveis</small>${m.url?`<div class="acoes">${link(m.url,'Acessar capacitação')}</div>`:''}<ul>${m.recursos.map(r=>`<li>${link(r.url,r.titulo)}<p><small>${esc(r.fonte)}</small></p></li>`).join('')}</ul>${!m.url&&!m.recursos.length?'<p>Materiais aguardando publicação.</p>':''}</article>`));
}
async function politicas(params) {
  const lista=await api('/politicas'),q=params.get('q')||'',area=params.get('filtro')||'';
  const blocos=lista.filter(p=>!area||p.nome===area).map(p=>{
    const materiais=p.materiais.filter(m=>combina(q,m.titulo,...m.tags));
    if(q&&!materiais.length)return '';
    return `<section class="bloco"><h2>${esc(p.nome)}</h2><p class="muted">${esc(p.descricao)}</p>${materiais.length?grade(materiais.map(m=>cartaoMaterial(m))):vazio('O acervo desta área está em organização pela coordenação.')}</section>`;
  }).join('');
  return filtros({q,opcoes:lista.map(p=>p.nome),selecionado:area,label:'Área de atenção'})+(blocos||vazio('Nenhum material encontrado.'));
}
async function biblioteca(rota,params) {
  const lista=await api('/'+rota),q=params.get('q')||'',f=params.get('filtro')||'';
  return filtros({q,opcoes:[...new Set(lista.map(m=>m.setor||m.categoria).filter(Boolean))],selecionado:f,label:'Área'})+grade(lista.filter(m=>(!f||(m.setor||m.categoria)===f)&&combina(q,m.nome,m.titulo,m.descricao,...(m.tags||[]))).map(m=>cartaoMaterial(m,m.setor||m.categoria)));
}
async function produtos(params) {
  const lista=await api('/produtos'),q=params.get('q')||'';
  const baixavel=url=>{try{return /\.(pdf|docx?|pptx?|xlsx?|odt|ods|odp|zip|mp[34]|m4a|webm|txt|csv|rtf|png|jpe?g|webp|gif)$/i.test(new URL(url,location.origin).pathname);}catch{return false;}};
  return filtros({q})+grade(lista.filter(p=>combina(q,p.titulo,p.descricao,p.tipo)).map(p=>`<article class="cartao">${etiqueta(p.tipo+(p.ano?' · '+p.ano:''))}${p.maisBaixado?etiqueta('Mais cliques em baixar',true):''}<h3>${esc(p.titulo)}</h3><p>${esc(p.descricao)}</p><small>${p.visualizacoes} aberturas · ${p.downloads} cliques em baixar</small><div class="acoes">${link(p.url,'Abrir produto',`data-contador="visualizacao" data-produto="${p.id}"`)}${p.url&&baixavel(p.url)?link(p.url,'Baixar',`data-contador="download" data-produto="${p.id}" download`):''}</div></article>`));
}
async function projetos(params) {
  const consulta=new URLSearchParams(params);
  if(!consulta.has('status')&&consulta.has('filtro'))consulta.set('status',consulta.get('filtro'));
  consulta.delete('filtro');consulta.set('limite','24');
  const {dados:lista,meta}=await api('/projetos?'+consulta.toString(),{comMeta:true});
  const selecionar=(nome,rotulo,opcoes)=>`<label>${esc(rotulo)}<select name="${nome}" aria-label="${esc(rotulo)}"><option value="">Todos</option>${opcoes.map(opcao=>{
    const [valor,texto]=Array.isArray(opcao)?opcao:[String(opcao),String(opcao)];
    return `<option value="${esc(valor)}"${consulta.get(nome)===valor?' selected':''}>${esc(texto)}</option>`;
  }).join('')}</select></label>`;
  const formulario=`<form class="filtros filtros-projetos" data-form="filtros"><label class="busca-projetos">Busca<input name="q" type="search" placeholder="Título, responsável, instituição ou local" value="${esc(consulta.get('q')||'')}"></label>${selecionar('ano','Ano da fonte',[...meta.opcoes.anos,...(meta.opcoes.semAno?[['sem-ano','Ano não informado']]:[])])}${selecionar('escopo','Acervo',[['atuais','Registros atuais'],['historicos','Registros históricos']])}${selecionar('status','Situação do projeto',meta.opcoes.situacoes)}${selecionar('instituicao','Instituição',meta.opcoes.instituicoes)}${selecionar('situacao_origem','Situação na fonte (AUT. CEP)',meta.opcoes.situacoesOrigem)}<div class="acoes"><button>Aplicar filtros</button><a href="#projetos">Limpar filtros</a></div></form>`;
  const inicio=meta.total?(meta.pagina-1)*meta.limite+1:0,fim=Math.min(meta.pagina*meta.limite,meta.total);
  const paginaLink=(pagina,texto)=>{const destino=new URLSearchParams(consulta);destino.set('pagina',String(pagina));return `<a class="botao" href="#projetos?${esc(destino.toString())}">${texto}</a>`;};
  const navegacao=meta.paginas>1?`<nav class="paginacao-projetos" aria-label="Páginas dos projetos">${meta.pagina>1?paginaLink(meta.pagina-1,'Página anterior'):''}<span>Página ${meta.pagina} de ${meta.paginas}</span>${meta.pagina<meta.paginas?paginaLink(meta.pagina+1,'Próxima página'):''}</nav>`:'';
  const cartoes=lista.length?grade(lista.map(p=>`<article class="cartao projeto" data-projeto-id="${esc(p.id)}">${etiqueta(p.historico?'Acervo histórico':'Cadastro atual')} ${etiqueta(p.ano_referencia?'Fonte: '+p.ano_referencia:'Ano não informado')}<h3>${esc(p.titulo)}</h3><dl><dt>Situação do projeto</dt><dd>${esc(p.status)}</dd><dt>Responsável</dt><dd>${esc(p.responsavel||'Não informado')}</dd><dt>Instituição</dt><dd>${esc(p.instituicao||'Não informada')}</dd><dt>Local</dt><dd>${esc(p.local||'Não informado')}</dd><dt>Período cadastrado</dt><dd>${esc([p.inicio,p.fim].filter(v=>v&&v!=='—').join(' — ')||'Não informado')}</dd>${p.historico?`<dt>Período na fonte</dt><dd>${esc(p.periodo_origem||'Não informado')}</dd><dt>Situação na fonte (AUT. CEP)</dt><dd>${esc(p.situacao_origem||'Não informada')}</dd>`:''}<dt>${p.historico?'Registro NEPeS':'Autorização NEPeS'}</dt><dd>${esc(p.autorizacao||'Não informada')}</dd></dl></article>`)):vazio('Nenhum projeto corresponde aos filtros. Altere a busca ou limpe os filtros.');
  return formulario+`<p class="resultado-projetos" role="status">${inicio}–${fim} de ${meta.total} projetos encontrados · ${meta.totalGeral} no acervo</p><p class="nota-projetos">Os registros históricos preservam as informações da fonte. A classificação “Histórico” não confirma andamento, conclusão ou autorização atual.</p>`+cartoes+navegacao;
}
async function agenda(params) {
  const lista=await api('/eventos'), q=params.get('q')||'';
  return filtros({q,placeholder:'Buscar atividade ou local'})+grade(lista.filter(e=>combina(q,e.titulo,e.local)).map(e=>`<article class="cartao">${etiqueta(`${String(e.dia).padStart(2,'0')}/${String(e.mes).padStart(2,'0')}/${e.ano} · ${e.hora}`)}<h3>${esc(e.titulo)}</h3><p>${esc(e.local||'Local a confirmar')}</p><button data-acao="calendario" data-evento="${e.id}">Adicionar ao calendário</button></article>`));
}
const comunicacao=criarComunicacao({api,esc,id});
const mensagens=params=>comunicacao.renderizar(params);
async function avisos() {
  const lista=await api('/notificacoes');
  return lista.length?`<div class="lista">${lista.map(n=>`<article class="cartao">${etiqueta(n.lida?'Lido':'Novo',!n.lida)}<h2>${esc(n.titulo)}</h2><p>${esc(n.texto)}</p><small>${data(n.criado_em)}</small>${!n.lida?`<div class="acoes"><button data-acao="lida" data-notificacao="${n.id}">Marcar como lido</button></div>`:''}</article>`).join('')}</div>`:vazio('Nenhum comunicado no momento.');
}
async function certificados() {
  const lista=await api('/certificados/meus');
  return lista.length?grade(lista.map(c=>`<article class="cartao">${etiqueta(c.area)}<h3>${esc(c.curso)}</h3><p>${c.horas} horas · Emitido em ${data(c.emitido_em)}</p><small>${esc(c.codigo)}</small><div class="acoes"><button data-acao="certificado" data-codigo="${esc(c.codigo)}">Ver certificado</button></div></article>`)):vazio('Conclua todas as aulas de um curso para emitir seu primeiro certificado.');
}
async function perfil() {
  usuario=await api('/auth/eu');
  salvarSessao({usuario});atualizarIdentidade();
  const campos=[['nome','Nome completo'],['cargo','Profissão na SMS'],['unidade','Local de atuação'],['telefone','Telefone'],['formacao','Formação profissional']];
  return `${usuario.senha_temporaria?'<div class="aviso bloco">Você está usando uma senha provisória. Defina sua nova senha para acessar a plataforma.</div>':''}${!usuario.senha_temporaria?`<div class="cartao bloco"><h2>Dados profissionais</h2><form class="formulario" data-form="perfil">${campos.map(([c,n])=>`<label>${n}<input name="${c}" value="${esc(usuario[c])}" ${c==='nome'?'required':''} maxlength="180"></label>`).join('')}<dl><dt>E-mail</dt><dd>${esc(usuario.email)}</dd><dt>Formação</dt><dd data-formacao-salva>${esc(usuario.formacao||'Não informada')}</dd><dt>CPF</dt><dd>${usuario.cpf?esc(usuario.cpf.slice(0,3)+'.***.***-'+usuario.cpf.slice(-2)):'Não informado'}</dd><dt>Perfil</dt><dd>${esc(usuario.perfil)}</dd></dl><button>Salvar perfil</button></form></div>`:''}<div class="cartao"><h2>Alterar senha</h2><form class="formulario" data-form="senha"><label>Senha atual<input name="senhaAtual" type="password" autocomplete="current-password" required></label><label>Nova senha<input name="senhaNova" type="password" autocomplete="new-password" minlength="8" required></label><small>Use pelo menos 8 caracteres, com letras e números.</small><label>Confirme a nova senha<input name="confirmacao" type="password" autocomplete="new-password" minlength="8" required></label><button>Atualizar senha</button></form></div>`;
}
async function busca(params) {
  const q=params.get('q')||'';
  if(q.trim().length<2)return vazio('Digite pelo menos dois caracteres na busca.');
  const lista=await api('/busca?q='+id(q));
  return `<p>Resultados para <strong>${esc(q)}</strong></p>`+grade(lista.map(r=>`<article class="cartao">${etiqueta(r.tipo)}<h3>${esc(r.titulo)}</h3><p>${esc(r.contexto)}</p><div class="acoes">${r.url?link(r.url):`<a class="botao" href="#${r.tipo==='curso'?'curso?curso='+id(r.id):r.tipo==='projeto'?'projetos?q='+id(r.titulo):'documentos?q='+id(r.titulo)}">Ver detalhes</a>`}</div></article>`));
}
async function carregar() {
  const seq=++sequencia;
  comunicacao.parar();
  const {rota,params}=rotaAtual();
  if(usuario.senha_temporaria&&rota!=='perfil') { ir('perfil'); return; }
  const m=menu.find(m=>m[0]===rota);
  $('#titulo').textContent=m?.[1]||(rota==='curso'?'Sala de aula':rota==='busca'?'Busca na plataforma':'Página não encontrada');
  $('#descricao').textContent=m?.[2]||'';
  $('#conteudo').innerHTML='<p role="status">Carregando…</p>';
  document.querySelectorAll('#menu a').forEach(a=>{ if(a.hash==='#'+rota || rota==='curso'&&a.hash==='#cursos')a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  try {
    const funcoes={inicio,cursos,curso,qualifica,politicas,produtos,projetos,agenda,mensagens,avisos,certificados,perfil,busca};
    let html;
    if(funcoes[rota]) html=await funcoes[rota](params);
    else if(['protocolos','documentos','links'].includes(rota))html=await biblioteca(rota,params);
    else if(rota==='sobre')html='<article class="cartao"><h2>Conhecimento que fortalece o cuidado</h2><p>O Maternar Santa-mariense é uma plataforma de educação permanente e comunicação da rede materno-infantil de Santa Maria.</p><p>Desenvolvida pela Universidade Franciscana (UFN), por meio do Programa de Pós-Graduação em Saúde Materno Infantil (PPGSMI), em parceria com o Núcleo de Educação Permanente em Saúde (NEPeS) da Prefeitura de Santa Maria.</p><p>Aqui, os profissionais encontram formações, materiais de referência e espaços de troca com a rede.</p><div class="acoes"><img src="/logo_ufn.png" alt="Universidade Franciscana" width="90"><img src="/logo_nepes.jpg" alt="NEPeS" width="90"><img src="/logo_prefeitura.png" alt="Prefeitura de Santa Maria" width="75"></div></article>';
    else html=vazio('Esta página não existe. Use o menu para continuar.');
    if(seq!==sequencia)return;
    $('#conteudo').innerHTML=html||vazio('Nenhum registro encontrado com esses filtros.');
    if(rota==='mensagens')comunicacao.ativar();
  } catch(error) { if(seq===sequencia)$('#conteudo').innerHTML=`<div class="erro" role="alert">${esc(error.message)} <button data-acao="recarregar">Tentar novamente</button></div>`; }
}
async function mostrarCertificado(codigo) {
  const c=await api('/certificados/verificar/'+id(codigo));
  $('#folha-certificado').innerHTML=`<span class="logo-maternar logo-maternar--completa"><img src="/logo_maternar.png" alt="Maternar Santa-mariense" width="2000" height="2000"></span><h2>Certificado de conclusão</h2><p>Certificamos que</p><p class="portador">${esc(c.portador)}</p><p>concluiu o curso <strong>${esc(c.curso)}</strong>, com carga horária de <strong>${c.horas} horas</strong>.</p><p>Emitido em ${data(c.emitido_em)}.</p><p>UFN · PPGSMI · NEPeS — Prefeitura de Santa Maria</p><small>Código de verificação: ${esc(c.codigo)}<br>Consulte a autenticidade em ${esc(location.origin)}/#certificado</small>`;
  $('#certificado').showModal();
}
function baixarCalendario(e) {
  const escapar=v=>String(v||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,'\\$&');
  const dia=`${e.ano}${String(e.mes).padStart(2,'0')}${String(e.dia).padStart(2,'0')}`;
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Maternar//Agenda//PT-BR','BEGIN:VEVENT',`UID:evento-${e.id}@maternar`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;TZID=America/Sao_Paulo:${dia}T${e.hora.replace(':','')}00`,`SUMMARY:${escapar(e.titulo)}`,`LOCATION:${escapar(e.local)}`,'END:VEVENT','END:VCALENDAR',''].join('\r\n');
  const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='evento-maternar.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener('click',async event=>{
  const contador=event.target.closest('[data-contador]');
  if(contador)api(`/produtos/${id(contador.dataset.produto)}/${contador.dataset.contador}`,{method:'POST'}).catch(e=>avisar(e.message));
  const b=event.target.closest('[data-acao]');if(!b)return;
  b.disabled=true;
  try {
    const a=b.dataset.acao;
    if(a==='concluir'){await api(`/cursos/${id(b.dataset.curso)}/aulas/${id(b.dataset.ordem)}/concluir`,{method:'POST'});avisar('Aula concluída. Progresso salvo.');await carregar();}
    if(a==='emitir'){await api('/certificados',{method:'POST',body:{cursoId:b.dataset.curso}});avisar('Certificado disponível.');ir('certificados');}
    if(a==='lida'){await api('/notificacoes/'+id(b.dataset.notificacao)+'/lida',{method:'POST'});await carregar();}
    if(a==='certificado')await mostrarCertificado(b.dataset.codigo);
    if(a==='recarregar')await carregar();
    if(a==='calendario'){const eventos=await api('/eventos');const e=eventos.find(e=>String(e.id)===b.dataset.evento);if(e)baixarCalendario(e);}
  }catch(error){avisar(error.message);}finally{b.disabled=false;}
});
document.addEventListener('submit',async event=>{
  const form=event.target;if(!form.dataset.form)return;
  event.preventDefault();const dados=Object.fromEntries(new FormData(form));
  if(form.dataset.form==='filtros'){ const {rota,params}=rotaAtual();for(const [k,v]of Object.entries(dados))v?params.set(k,v):params.delete(k);if(rota==='projetos'){params.delete('pagina');params.delete('filtro');}ir(rota+'?'+params.toString());return; }
  const botao=form.querySelector('button');botao.disabled=true;
  form.querySelector('[role=alert]')?.remove();
  try {
    if(form.dataset.form==='perfil'){
      usuario=await api('/usuarios/eu',{method:'PUT',body:dados});
      salvarSessao({usuario});atualizarIdentidade();
      if(form.isConnected) {
        // Atualiza também o resumo da formação com o valor confirmado pelo servidor.
        for(const [nome,valor] of Object.entries(usuario)) {
          const entrada=form.elements.namedItem(nome);
          if(entrada instanceof HTMLInputElement)entrada.value=valor??'';
        }
        const formacao=form.querySelector('[data-formacao-salva]');
        if(formacao)formacao.textContent=usuario.formacao||'Não informada';
      }
      avisar('Perfil atualizado.');
    }
    if(form.dataset.form==='senha'){
      if(dados.senhaNova!==dados.confirmacao)throw new Error('As senhas não conferem.');
      const nova=await api('/usuarios/eu/senha',{method:'PUT',body:dados});salvarSessao(nova);montarMenu();avisar('Senha atualizada.');await carregar();
    }
    if(form.dataset.form==='mensagem'){await comunicacao.enviar(form);avisar('Mensagem enviada.');}
  }catch(error){const aviso=document.createElement('p');aviso.className='erro';aviso.setAttribute('role','alert');aviso.textContent=error.message;form.append(aviso);}finally{botao.disabled=false;}
});
$('.pular').addEventListener('click',e=>{e.preventDefault();$('#conteudo').focus();});
$('#busca-global').addEventListener('submit',e=>{e.preventDefault();ir('busca?q='+id(new FormData(e.target).get('q')));});
$('#sair').addEventListener('click',async()=>{try{await api('/auth/logout',{method:'POST'});}catch{}finally{limparSessao();}});
$('#fechar-certificado').addEventListener('click',()=>$('#certificado').close());
$('#imprimir-certificado').addEventListener('click',()=>window.print());
function atualizarIdentidade(){$('#nome-usuario').textContent=usuario.nome;$('#unidade-usuario').textContent=usuario.unidade||usuario.perfil;}
function montarMenu(){const itens=usuario.senha_temporaria?menu.filter(m=>m[0]==='perfil'):menu;$('#menu').innerHTML=itens.map(m=>`<a href="#${m[0]}">${m[1]}</a>`).join('')+(!usuario.senha_temporaria&&['Gestor','Administrador'].includes(usuario.perfil)?'<a href="/painel">Painel de gestão ↗</a>':'');}
window.addEventListener('hashchange',()=>{carregar();window.scrollTo({top:0,behavior:'instant'});$('#titulo').focus({preventScroll:true});});
async function iniciar(){
  if(!token)return limparSessao();
  try{usuario=await api('/auth/eu');salvarSessao({usuario});atualizarIdentidade();montarMenu();$('#estado-inicial').hidden=true;$('#plataforma').hidden=false;await carregar();}
  catch(error){if(token){$('#estado-inicial').replaceChildren();const p=document.createElement('p');p.textContent=error.message;const b=document.createElement('button');b.textContent='Tentar novamente';b.onclick=iniciar;$('#estado-inicial').append(p,b);}}
}
iniciarNavegacaoMobile({root:'#plataforma',sidebar:'#navegacao-lateral',open:'#abrir-menu',close:'#fechar-menu',label:'Navegação principal'});
iniciar();
