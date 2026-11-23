/** Agenda coletiva: as regras de autoria/equipe são sempre verificadas na API. */
export function criarAgenda({api,esc,id,usuario}) {
  const origens=['NEPeS','Maternar','Profissionais'];
  const cores={'NEPeS':'#6b46a5',Maternar:'#17688a',Profissionais:'#357348'};
  let paramsAtuais=new URLSearchParams(), eventos=[];
  const gestao=()=>['Gestor','Administrador'].includes(usuario().perfil);
  const pad=n=>String(n).padStart(2,'0');
  const dataEvento=e=>`${e.ano}-${pad(e.mes)}-${pad(e.dia)}`;
  const combina=(q,e)=>[e.titulo,e.local,e.equipe].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
  function formulario(e={}) {
    const hoje=new Date(), data=e.id?dataEvento(e):`${paramsAtuais.get('ano')||hoje.getFullYear()}-${pad(paramsAtuais.get('mes')||hoje.getMonth()+1)}-${Number(paramsAtuais.get('ano'))===hoje.getFullYear()&&Number(paramsAtuais.get('mes'))===hoje.getMonth()+1?pad(hoje.getDate()):'01'}`;
    const selecionado=(a,b)=>a===b?' selected':'';
    return `<form class="formulario agenda-formulario" data-agenda-form="${e.id||''}">
      <label>Atividade<input name="titulo" required maxlength="250" value="${esc(e.titulo||'')}"></label>
      <div class="agenda-campos"><label>Data<input type="date" name="data" value="${data}" required min="2000-01-01" max="2100-12-31"></label><label>Início<input type="time" name="hora" value="${esc(e.hora||'09:00')}" required></label><label>Término (opcional)<input type="time" name="fim" value="${esc(e.fim||'')}"></label></div>
      <label>Local<input name="local" maxlength="250" value="${esc(e.local||'')}"></label>
      ${gestao()?`<label>Publicado por<select name="origem">${origens.map(o=>`<option${selecionado(e.origem||'Maternar',o)}>${o}</option>`).join('')}</select></label>`:'<input type="hidden" name="origem" value="Profissionais"><p class="muted">Publicado como atividade dos profissionais.</p>'}
      <label>Quem pode ver<select name="visibilidade"><option value="rede"${selecionado(e.visibilidade||'rede','rede')}>Toda a rede</option><option value="equipe"${selecionado(e.visibilidade,'equipe')}>Somente a equipe da unidade</option></select></label>
      ${gestao()?`<label>Unidade / equipe<input name="equipe" maxlength="180" value="${esc(e.equipe||usuario().equipe_agenda||'')}" placeholder="Obrigatória para atividades da equipe"></label>`:`<p class="muted">Sua equipe: ${esc(usuario().equipe_agenda||'a gestão precisa vincular você a uma equipe para usar atividades restritas')}.</p>`}
      <button>${e.id?'Salvar alterações':'Adicionar atividade'}</button><p data-agenda-erro role="alert" hidden></p>
    </form>`;
  }
  function cartao(e) {
    return `<article class="cartao agenda-atividade" id="agenda-evento-${e.id}" style="--agenda-cor:${cores[e.origem]||cores.Maternar}"><span class="agenda-origem">${esc(e.origem||'Maternar')}</span><h3>${esc(e.titulo)}</h3><p><time datetime="${dataEvento(e)}T${e.hora}">${pad(e.dia)}/${pad(e.mes)}/${e.ano} · ${esc(e.hora)}${e.fim?'–'+esc(e.fim):''}</time></p><p>${esc(e.local||'Local a confirmar')}</p><p class="muted">${e.visibilidade==='equipe'?'Equipe: '+esc(e.equipe):'Toda a rede'}${e.equipe&&e.visibilidade!=='equipe'?' · '+esc(e.equipe):''}</p><div class="acoes"><button type="button" data-agenda-exportar="${e.id}">Adicionar ao meu calendário</button>${e.pode_editar?`<button type="button" data-agenda-remover="${e.id}">Remover atividade</button>`:''}</div>${e.pode_editar?`<details class="agenda-editar"><summary>Editar atividade</summary>${formulario(e)}</details>`:''}</article>`;
  }
  async function renderizar(params=new URLSearchParams()) {
    paramsAtuais=new URLSearchParams(params);
    const hoje=new Date();
    const numeroMes=Number(params.get('mes')),numeroAno=Number(params.get('ano'));
    const mes=Number.isInteger(numeroMes)&&numeroMes>=1&&numeroMes<=12?numeroMes:hoje.getMonth()+1;
    const ano=Number.isInteger(numeroAno)&&numeroAno>=2000&&numeroAno<=2100?numeroAno:hoje.getFullYear();
    paramsAtuais.set('mes',mes);paramsAtuais.set('ano',ano);
    eventos=await api(`/eventos?mes=${mes}&ano=${ano}`);
    const q=params.get('q')||'',origem=params.get('origem')||'';
    const filtrados=eventos.filter(e=>(!origem||e.origem===origem)&&combina(q,e));
    const inicio=new Date(ano,mes-1,1),dias=new Date(ano,mes,0).getDate(),vazios=(inicio.getDay()+6)%7;
    const titulo=inicio.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
    const destino=delta=>{const d=new Date(ano,mes-1+delta,1);const p=new URLSearchParams(paramsAtuais);p.set('mes',d.getMonth()+1);p.set('ano',d.getFullYear());return '#agenda?'+p.toString();};
    const celulas=Array.from({length:vazios},()=>'<div class="agenda-dia agenda-dia-vazio" aria-hidden="true"></div>');
    for(let dia=1;dia<=dias;dia++) {
      const lista=filtrados.filter(e=>e.dia===dia),atual=hoje.getFullYear()===ano&&hoje.getMonth()+1===mes&&hoje.getDate()===dia;
      celulas.push(`<div class="agenda-dia${atual?' agenda-hoje':''}"${atual?' aria-current="date"':''}><span class="agenda-numero">${dia}${atual?'<span class="sr-only"> (hoje)</span>':''}</span>${lista.map(e=>`<a class="agenda-marcacao" href="#agenda-evento-${e.id}" data-agenda-ir="${e.id}" style="--agenda-cor:${cores[e.origem]||cores.Maternar}" title="${esc(e.origem+' · '+e.hora+' · '+e.titulo)}"><span>${esc(e.hora)}</span><span>${esc(e.titulo)}</span><span class="sr-only"> · ${esc(e.origem)}</span></a>`).join('')}</div>`);
    }
    return `<section data-agenda-root aria-label="Agenda coletiva">
      <p>Consulte os encontros da rede e organize atividades com a equipe da sua unidade.</p>
      <form class="filtros" data-agenda-filtro><label>Busca<input type="search" name="q" value="${esc(q)}" placeholder="Atividade, local ou equipe"></label><label>Publicado por<select name="origem"><option value="">Todos</option>${origens.map(o=>`<option${o===origem?' selected':''}>${o}</option>`).join('')}</select></label><button>Filtrar</button></form>
      <nav class="agenda-navegacao" aria-label="Navegar pelos meses">${ano>2000||mes>1?`<a class="botao" href="${esc(destino(-1))}" aria-label="Mês anterior">← Anterior</a>`:'<span></span>'}<h2>${esc(titulo)}</h2>${ano<2100||mes<12?`<a class="botao" href="${esc(destino(1))}" aria-label="Próximo mês">Próximo →</a>`:'<span></span>'}</nav>
      <ul class="agenda-legenda" aria-label="Legenda">${origens.map(o=>`<li><span style="background:${cores[o]}" aria-hidden="true"></span>${o}</li>`).join('')}</ul>
      <div class="agenda-calendario" aria-label="Calendário de ${esc(titulo)}"><div class="agenda-semana">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=>`<span>${d}</span>`).join('')}</div><div class="agenda-dias">${celulas.join('')}</div></div>
      <p role="status" data-agenda-status>${filtrados.length} atividade(s) em ${esc(titulo)}.</p>
      <details class="cartao agenda-nova"><summary>Adicionar atividade</summary>${formulario()}</details>
      <h2>Atividades do mês</h2><div class="lista agenda-lista">${filtrados.map(cartao).join('')||'<div class="vazio">Nenhuma atividade para os filtros selecionados.</div>'}</div>
    </section>`;
  }
  async function atualizar(mensagem) {
    const raiz=document.querySelector('[data-agenda-root]');
    if (!raiz) return;
    const html=await renderizar(paramsAtuais);
    if (!raiz.isConnected) return;
    raiz.outerHTML=html;ativar();
    const status=document.querySelector('[data-agenda-status]');
    if(status){status.textContent=mensagem+' '+status.textContent;status.setAttribute('tabindex','-1');status.focus({preventScroll:true});}
  }
  function exportar(e) {
    const limpar=v=>String(v||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
    const dia=dataEvento(e).replaceAll('-','');
    const linhas=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Maternar//Agenda//PT-BR','BEGIN:VEVENT',`UID:evento-${e.id}@maternar`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;TZID=America/Sao_Paulo:${dia}T${e.hora.replace(':','')}00`,...(e.fim?[`DTEND;TZID=America/Sao_Paulo:${dia}T${e.fim.replace(':','')}00`]:[]),`SUMMARY:${limpar(e.titulo)}`,`LOCATION:${limpar(e.local)}`,'END:VEVENT','END:VCALENDAR',''];
    const url=URL.createObjectURL(new Blob([linhas.join('\r\n')],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`maternar-evento-${e.id}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function ativar() {
    const raiz=document.querySelector('[data-agenda-root]');if(!raiz)return;
    raiz.querySelector('[data-agenda-filtro]').addEventListener('submit',e=>{e.preventDefault();const dados=new FormData(e.currentTarget),p=new URLSearchParams(paramsAtuais);for(const k of ['q','origem'])dados.get(k)?p.set(k,dados.get(k)):p.delete(k);location.hash='agenda?'+p;});
    raiz.querySelectorAll('[data-agenda-form]').forEach(form=>form.addEventListener('submit',async e=>{
      e.preventDefault();const botao=form.querySelector('button'),aviso=form.querySelector('[data-agenda-erro]');botao.disabled=true;aviso.hidden=true;
      try{
        const dados=Object.fromEntries(new FormData(form)),[ano,mes,dia]=dados.data.split('-').map(Number);delete dados.data;
        await api('/eventos'+(form.dataset.agendaForm?'/'+id(form.dataset.agendaForm):''),{method:form.dataset.agendaForm?'PUT':'POST',body:{...dados,ano,mes,dia}});
        if(paramsAtuais.get('mes')!==String(mes)||paramsAtuais.get('ano')!==String(ano)){paramsAtuais.set('mes',mes);paramsAtuais.set('ano',ano);location.hash='agenda?'+paramsAtuais;}
        else await atualizar('Atividade salva.');
      }catch(erro){aviso.textContent=erro.message;aviso.hidden=false;}finally{botao.disabled=false;}
    }));
    raiz.addEventListener('click',async e=>{
      const ir=e.target.closest('[data-agenda-ir]');
      if(ir){e.preventDefault();const cartao=document.getElementById('agenda-evento-'+ir.dataset.agendaIr);cartao?.scrollIntoView({behavior:'smooth',block:'center'});cartao?.setAttribute('tabindex','-1');cartao?.focus({preventScroll:true});return;}
      const exp=e.target.closest('[data-agenda-exportar]');if(exp){const evento=eventos.find(x=>String(x.id)===exp.dataset.agendaExportar);if(evento)exportar(evento);return;}
      const remover=e.target.closest('[data-agenda-remover]');if(!remover)return;
      const evento=eventos.find(x=>String(x.id)===remover.dataset.agendaRemover);if(!evento)return;
      if(!confirm('Remover a atividade “'+evento.titulo+'”?'))return;
      remover.disabled=true;
      try{await api('/eventos/'+id(evento.id),{method:'DELETE'});await atualizar('Atividade removida.');}catch(erro){const aviso=document.createElement('p');aviso.setAttribute('role','alert');aviso.textContent=erro.message;remover.parentElement.after(aviso);}finally{remover.disabled=false;}
    });
  }
  return {renderizar,ativar};
}
