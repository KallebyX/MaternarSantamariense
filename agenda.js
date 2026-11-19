// Consulta da agenda: datas civis da rede, sem converter o horário dos eventos.
const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const diasSemana = ['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo'];
const dois = valor => String(valor).padStart(2,'0');

export function dataDaRede(agora = new Date()) {
  const partes = new Intl.DateTimeFormat('pt-BR', {timeZone:'America/Sao_Paulo',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(agora);
  const obter = tipo => Number(partes.find(parte=>parte.type===tipo).value);
  return {ano:obter('year'),mes:obter('month'),dia:obter('day')};
}

export function periodoAgenda(params, agora = new Date()) {
  const hoje = dataDaRede(agora);
  const valor = params.get('mes') || '';
  const valido = /^(20\d{2}|2100)-(0[1-9]|1[0-2])$/.test(valor);
  const [ano,mes] = valido ? valor.split('-').map(Number) : [hoje.ano,hoje.mes];
  const totalDias = new Date(Date.UTC(ano,mes,0)).getUTCDate();
  const diaInformado = params.get('dia') || '';
  const dia = /^\d{1,2}$/.test(diaInformado) && Number(diaInformado)>=1 && Number(diaInformado)<=totalDias ? Number(diaInformado) : null;
  // Segunda-feira abre a semana, inclusive quando o mês começa no domingo.
  const inicioSemana = (new Date(Date.UTC(ano,mes-1,1)).getUTCDay()+6)%7;
  return {ano,mes,dia,totalDias,inicioSemana,hoje,chave:`${ano}-${dois(mes)}`,titulo:`${meses[mes-1]} de ${ano}`};
}

export function criarAgenda({api,esc,combina,grade,etiqueta,filtros,agora=()=>new Date()}) {
  const cartao = e => `<article class="cartao">${etiqueta(`${dois(e.dia)}/${dois(e.mes)}/${e.ano} · ${e.hora}`)}<h3>${esc(e.titulo)}</h3><p>${esc(e.local||'Local a confirmar')}</p><button data-acao="calendario" data-evento="${esc(e.id)}">Adicionar ao calendário</button></article>`;
  return async function agenda(params) {
    const lista = await api('/eventos');
    const q = params.get('q') || '';
    const periodo = periodoAgenda(params,agora());
    const calendario = params.get('visao') === 'calendario';
    const destino = alteracoes => {
      const consulta = new URLSearchParams(params);
      for(const [chave,valor] of Object.entries(alteracoes)) valor === null ? consulta.delete(chave) : consulta.set(chave,String(valor));
      return '#agenda?'+esc(consulta.toString());
    };
    const visoes = `<nav class="agenda-visoes" aria-label="Visualização da agenda"><a class="botao" href="${destino({visao:'lista',dia:null})}"${!calendario?' aria-current="page"':''}>Lista completa</a><a class="botao" href="${destino({visao:'calendario',mes:periodo.chave,dia:null})}"${calendario?' aria-current="page"':''}>Calendário</a></nav>`;
    const busca = filtros({q,placeholder:'Buscar atividade ou local'});
    const encontrados = lista.filter(e=>combina(q,e.titulo,e.local));
    if(!calendario) return visoes+busca+grade(encontrados.map(cartao));

    const {ano,mes,dia,totalDias,inicioSemana,hoje,chave,titulo} = periodo;
    const nesteMes = encontrados.filter(e=>Number(e.ano)===ano&&Number(e.mes)===mes);
    const porDia = new Map();
    for(const evento of nesteMes) porDia.set(Number(evento.dia),(porDia.get(Number(evento.dia))||0)+1);
    const mudarMes = deslocamento => {
      const data = new Date(Date.UTC(ano,mes-1+deslocamento,1));
      return `${data.getUTCFullYear()}-${dois(data.getUTCMonth()+1)}`;
    };
    const anterior = ano>2000||mes>1 ? `<a class="botao" href="${destino({mes:mudarMes(-1),dia:null})}">Mês anterior</a>` : '<span class="agenda-limite">Mês anterior</span>';
    const proximo = ano<2100||mes<12 ? `<a class="botao" href="${destino({mes:mudarMes(1),dia:null})}">Próximo mês</a>` : '<span class="agenda-limite">Próximo mês</span>';
    const celulas = Array.from({length:Math.ceil((inicioSemana+totalDias)/7)*7},(_,i)=>{
      const numero = i-inicioSemana+1;
      if(numero<1||numero>totalDias) return '<td class="agenda-fora" aria-hidden="true"></td>';
      const quantidade = porDia.get(numero)||0;
      const atual = hoje.ano===ano&&hoje.mes===mes&&hoje.dia===numero;
      const selecionado = dia===numero;
      const rotulo = `${numero} de ${titulo}, ${quantidade} ${quantidade===1?'atividade':'atividades'}${selecionado?', dia selecionado':''}`;
      return `<td><a class="agenda-dia${selecionado?' selecionado':''}${atual?' hoje':''}" href="${destino({mes:chave,dia:numero})}" aria-label="${esc(rotulo)}"${atual?' aria-current="date"':''}><span>${numero}</span>${quantidade?`<span class="agenda-quantidade" aria-hidden="true">${quantidade}</span>`:''}</a></td>`;
    });
    const linhas = [];
    for(let i=0;i<celulas.length;i+=7) linhas.push('<tr>'+celulas.slice(i,i+7).join('')+'</tr>');
    const seletor = `<form class="filtros agenda-periodo" data-form="filtros"><label>Mês e ano<input type="month" name="mes" value="${chave}" min="2000-01" max="2100-12" required></label><input type="hidden" name="visao" value="calendario"><button>Ir para o mês</button></form>`;
    const navegacao = `<nav class="agenda-navegacao" aria-label="Meses da agenda">${anterior}<a href="${destino({mes:`${hoje.ano}-${dois(hoje.mes)}`,dia:hoje.dia})}">Hoje</a>${proximo}</nav>`;
    const tabela = `<div class="agenda-calendario"><table><caption>${esc(titulo)}</caption><thead><tr>${diasSemana.map(d=>`<th scope="col"><abbr title="${d}">${d.slice(0,3)}</abbr></th>`).join('')}</tr></thead><tbody>${linhas.join('')}</tbody></table><p class="agenda-ajuda">Os números ao lado das datas indicam atividades encontradas. Selecione um dia para ver os detalhes.</p></div>`;
    const atividades = dia ? nesteMes.filter(e=>Number(e.dia)===dia) : nesteMes;
    const descricao = dia ? `Atividades de ${dois(dia)}/${dois(mes)}/${ano}` : `Atividades de ${titulo}`;
    const resumo = `<div class="agenda-resumo"><h2>${esc(descricao)}</h2>${dia?`<a href="${destino({dia:null})}">Ver todo o mês</a>`:''}<p role="status">${atividades.length} ${atividades.length===1?'atividade encontrada':'atividades encontradas'}${q?' para esta busca':''}.</p></div>`;
    const vazio = `<div class="vazio">Nenhuma atividade encontrada ${dia?'neste dia':'neste mês'}${q?' para esta busca':''}. <a href="${destino({visao:'lista',dia:null})}">Consultar a lista completa</a>.</div>`;
    return visoes+busca+seletor+navegacao+tabela+resumo+(atividades.length?grade(atividades.map(cartao)):vazio);
  };
}
