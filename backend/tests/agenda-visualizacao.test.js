import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { criarAgenda, dataDaRede, periodoAgenda } from '../../agenda.js';
import { criarApp } from '../src/app.js';

const esc = valor => String(valor??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalizar = valor => String(valor).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const eventos = [
  {id:1,ano:2026,mes:12,dia:31,hora:'08:30',titulo:'Formação da rede',local:'Sala Azul'},
  {id:2,ano:2026,mes:12,dia:31,hora:'14:00',titulo:'Reunião da equipe',local:'Sala Azul'},
  {id:3,ano:2027,mes:1,dia:1,hora:'09:15',titulo:'Encontro de janeiro',local:'Auditório'},
  {id:4,ano:2027,mes:12,dia:31,hora:'10:00',titulo:'Encontro do próximo ano',local:'Auditório'},
];
const agora = () => new Date('2027-01-01T01:30:00.000Z');
function renderizar(consulta='',lista=eventos) {
  const agenda = criarAgenda({
    api:async caminho=>{assert.equal(caminho,'/eventos');return lista;},esc,agora,
    combina:(q,...campos)=>normalizar(campos.join(' ')).includes(normalizar(q)),
    grade:itens=>itens.length?`<div class="grade">${itens.join('')}</div>`:'<div>Nenhum registro encontrado.</div>',
    etiqueta:texto=>`<span>${esc(texto)}</span>`,
    filtros:({q})=>`<form><input name="q" value="${esc(q)}"></form>`,
  });
  return agenda(new URLSearchParams(consulta));
}
function destino(html,texto) {
  const escapado=texto.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const href=html.match(new RegExp(`<a[^>]*href="([^"]+)"[^>]*>${escapado}</a>`))?.[1];
  assert.ok(href,`Link ausente: ${texto}`);
  return new URLSearchParams(href.replaceAll('&amp;','&').split('?')[1]);
}

test('agenda usa a data de São Paulo na virada do ano, sem deslocar o horário dos eventos',async()=>{
  assert.deepEqual(dataDaRede(agora()),{ano:2026,mes:12,dia:31});
  const html=await renderizar('visao=calendario');
  assert.match(html,/<caption>dezembro de 2026<\/caption>/);
  assert.match(html,/31\/12\/2026 · 08:30/);
  assert.match(html,/31\/12\/2026 · 14:00/);
  assert.equal(destino(html,'Hoje').get('dia'),'31');
  assert.equal(destino(html,'Hoje').get('mes'),'2026-12');
});

test('agenda posiciona domingo na última coluna e inclui fevereiro bissexto',async()=>{
  const novembro=periodoAgenda(new URLSearchParams('mes=2026-11'),agora());
  assert.equal(novembro.inicioSemana,6);assert.equal(novembro.totalDias,30);
  const fevereiro=periodoAgenda(new URLSearchParams('mes=2028-02&dia=29'),agora());
  assert.equal(fevereiro.totalDias,29);assert.equal(fevereiro.dia,29);
  const html=await renderizar('visao=calendario&mes=2028-02');
  assert.equal((html.match(/class="agenda-dia/g)||[]).length,29);
  assert.match(html,/aria-label="29 de fevereiro de 2028, 0 atividades"/);
});

test('agenda ignora meses e dias inválidos em links sem inventar uma data',()=>{
  for(const mes of ['2026-00','2026-13','2026-1','1999-12','2101-01','texto']) {
    const periodo=periodoAgenda(new URLSearchParams({mes}),agora());
    assert.equal(periodo.chave,'2026-12',mes);
  }
  for(const dia of ['0','-1','29','31','1.5','<script>']) {
    assert.equal(periodoAgenda(new URLSearchParams({mes:'2027-02',dia}),agora()).dia,null,dia);
  }
});

test('lista completa preserva eventos de todos os meses, ordem e botão ICS',async()=>{
  const html=await renderizar();
  assert.equal((html.match(/<article /g)||[]).length,4);
  assert.ok(html.indexOf('Formação da rede')<html.indexOf('Reunião da equipe'));
  assert.ok(html.indexOf('Reunião da equipe')<html.indexOf('Encontro de janeiro'));
  assert.equal((html.match(/data-acao="calendario"/g)||[]).length,4);
  assert.doesNotMatch(html,/<table>/);
  assert.equal(destino(html,'Calendário').get('mes'),'2026-12');
});

test('busca por título sem acento e por local permanece disponível na lista completa',async()=>{
  const formacao=await renderizar('q=formacao');
  assert.match(formacao,/Formação da rede/);assert.doesNotMatch(formacao,/Reunião da equipe/);
  const local=await renderizar('q=Auditorio');
  assert.match(local,/Encontro de janeiro/);assert.match(local,/Encontro do próximo ano/);
  assert.doesNotMatch(local,/Formação da rede/);
});

test('calendário limita contagem e detalhes ao mês e ano selecionados',async()=>{
  const html=await renderizar('visao=calendario&mes=2026-12');
  assert.match(html,/aria-label="31 de dezembro de 2026, 2 atividades"/);
  assert.equal((html.match(/<article /g)||[]).length,2);
  assert.doesNotMatch(html,/Encontro de janeiro|Encontro do próximo ano/);
  assert.match(html,/2 atividades encontradas/);
});

test('seleção do dia mantém horários distintos e permite voltar ao mês',async()=>{
  const html=await renderizar('visao=calendario&mes=2026-12&dia=31');
  assert.match(html,/Atividades de 31\/12\/2026/);
  assert.equal((html.match(/<article /g)||[]).length,2);
  assert.match(html,/dia selecionado/);
  const mes=destino(html,'Ver todo o mês');
  assert.equal(mes.get('mes'),'2026-12');assert.equal(mes.has('dia'),false);
  assert.equal(mes.get('visao'),'calendario');
});

test('navegação entre anos mantém a busca e remove a seleção do dia',async()=>{
  const html=await renderizar('visao=calendario&mes=2026-12&dia=31&q=Sala+Azul');
  const proximo=destino(html,'Próximo mês');
  assert.equal(proximo.get('mes'),'2027-01');assert.equal(proximo.get('q'),'Sala Azul');assert.equal(proximo.has('dia'),false);
  const janeiro=await renderizar('visao=calendario&mes=2027-01');
  assert.equal(destino(janeiro,'Mês anterior').get('mes'),'2026-12');
  assert.equal(destino(html,'Lista completa').get('q'),'Sala Azul');
});

test('navegação respeita os limites de ano aceitos pela API',async()=>{
  const primeiro=await renderizar('visao=calendario&mes=2000-01');
  const ultimo=await renderizar('visao=calendario&mes=2100-12');
  assert.match(primeiro,/<span class="agenda-limite">Mês anterior<\/span>/);
  assert.match(ultimo,/<span class="agenda-limite">Próximo mês<\/span>/);
  assert.doesNotMatch(primeiro,/mes=1999/);assert.doesNotMatch(ultimo,/mes=2101/);
});

test('busca do calendário atualiza indicadores sem perder a alternativa de lista',async()=>{
  const html=await renderizar('visao=calendario&mes=2026-12&q=reuniao');
  assert.match(html,/31 de dezembro de 2026, 1 atividade/);
  assert.equal((html.match(/<article /g)||[]).length,1);
  assert.match(html,/Reunião da equipe/);assert.doesNotMatch(html,/Formação da rede/);
  const vazio=await renderizar('visao=calendario&mes=2026-12&dia=30&q=sem+resultado');
  assert.match(vazio,/Nenhuma atividade encontrada neste dia para esta busca/);
  assert.equal(destino(vazio,'Consultar a lista completa').get('q'),'sem resultado');
});

test('mês sem eventos mantém todos os dias e um estado vazio explícito',async()=>{
  const html=await renderizar('visao=calendario&mes=2027-02');
  assert.equal((html.match(/class="agenda-dia/g)||[]).length,28);
  assert.match(html,/Nenhuma atividade encontrada neste mês/);
  assert.equal((html.match(/<article /g)||[]).length,0);
});

test('texto dos eventos e consultas são escapados e a cor livre não vira origem institucional',async()=>{
  const html=await renderizar('visao=calendario&mes=2026-12',[
    {...eventos[0],id:'" onclick="alert(1)',titulo:'<img src=x onerror=alert(1)>',local:'<script>alert(1)</script>',cor:'red;background:url(https://example.test)'},
  ]);
  assert.doesNotMatch(html,/<img|<script|onclick="|style="/);
  assert.match(html,/&lt;img/);assert.match(html,/&lt;script/);
  assert.doesNotMatch(html,/NEPeS|Maternar|background:url/);
  const consulta=await renderizar('visao=calendario&mes=2026-12&q=%22%3E%3Cscript%3E');
  assert.doesNotMatch(consulta,/<script>/);assert.match(consulta,/&quot;&gt;&lt;script&gt;/);
});

test('servidor publica o novo módulo sem abrir diretórios internos',async()=>{
  const app=criarApp();
  const modulo=await request(app).get('/agenda.js');
  assert.equal(modulo.status,200);assert.match(modulo.headers['content-type'],/javascript/);
  assert.match(modulo.text,/export function criarAgenda/);
  for(const caminho of ['/backend/tests/agenda-visualizacao.test.js','/backend/src/config.js','/.git/config']) {
    assert.equal((await request(app).get(caminho)).status,404,caminho);
  }
});
