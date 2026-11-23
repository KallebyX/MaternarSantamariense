import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const codigo=readFileSync(new URL('../../agenda.js',import.meta.url),'utf8');
const { criarAgenda }=await import('data:text/javascript;base64,'+Buffer.from(codigo).toString('base64'));
const adiar=()=>{let resolver;const promessa=new Promise(r=>resolver=r);return {promessa,resolver};};

test('resposta de mês anterior não substitui o mês ativo nem suas ações de exportar/remover',async()=>{
  const janeiro=adiar(),fevereiro=adiar(),requisicoes=[];
  const base={dia:23,ano:2026,hora:'14:00',local:'Sala',origem:'Profissionais',visibilidade:'rede',pode_editar:true};
  const api=async(caminho,opcoes={})=>{
    requisicoes.push({caminho,...opcoes});
    if(opcoes.method==='DELETE')return {mensagem:'Removido'};
    if(requisicoes.filter(r=>!r.method).length>2)return [];
    return caminho.includes('mes=1&')?janeiro.promessa:fevereiro.promessa;
  };
  const agenda=criarAgenda({api,esc:String,id:encodeURIComponent,usuario:()=>({perfil:'Profissional',equipe_agenda:'Equipe'})});
  const antiga=agenda.renderizar(new URLSearchParams('mes=1&ano=2026'));
  const atual=agenda.renderizar(new URLSearchParams('mes=2&ano=2026'));
  fevereiro.resolver([{...base,id:2,mes:2,titulo:'Atividade de fevereiro'}]);
  const html=await atual;
  assert.match(html,/fevereiro de 2026/);assert.match(html,/Atividade de fevereiro/);
  const listeners={},estado={textContent:'',setAttribute(){},focus(){}};
  const raiz={isConnected:true,querySelector:()=>({addEventListener(){}}),querySelectorAll:()=>[],addEventListener:(tipo,fn)=>listeners[tipo]=fn,outerHTML:html};
  const anterior={document:globalThis.document,confirm:globalThis.confirm,create:URL.createObjectURL,revoke:URL.revokeObjectURL};
  let arquivo,baixou=false,confirmacao;
  try{
    globalThis.document={querySelector:seletor=>seletor==='[data-agenda-root]'?raiz:estado,createElement:()=>({click(){baixou=true;}})};
    globalThis.confirm=texto=>{confirmacao=texto;return true;};
    URL.createObjectURL=blob=>{arquivo=blob;return 'blob:agenda-teste';};URL.revokeObjectURL=()=>{};
    agenda.ativar();
    janeiro.resolver([{...base,id:1,mes:1,titulo:'Atividade antiga'}]);
    assert.equal(await antiga,'');
    const clique=atributo=>({target:{closest:seletor=>seletor===`[${atributo}]`?{dataset:atributo==='data-agenda-exportar'?{agendaExportar:'2'}:{agendaRemover:'2'},parentElement:{after(){}}}:null}});
    await listeners.click(clique('data-agenda-exportar'));
    assert.equal(baixou,true);assert.match(await arquivo.text(),/SUMMARY:Atividade de fevereiro/);assert.match(await arquivo.text(),/DTSTART;TZID=America\/Sao_Paulo:20260223T140000/);
    await listeners.click(clique('data-agenda-remover'));
    assert.match(confirmacao,/Atividade de fevereiro/);
    assert.ok(requisicoes.some(r=>r.method==='DELETE'&&r.caminho==='/eventos/2'));
    assert.equal(requisicoes.at(-1).caminho,'/eventos?mes=2&ano=2026');
  }finally{
    if(anterior.document===undefined)delete globalThis.document;else globalThis.document=anterior.document;
    if(anterior.confirm===undefined)delete globalThis.confirm;else globalThis.confirm=anterior.confirm;
    URL.createObjectURL=anterior.create;URL.revokeObjectURL=anterior.revoke;
  }
});
