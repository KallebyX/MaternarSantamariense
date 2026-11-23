import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const raiz=fileURLToPath(new URL('../../',import.meta.url));
test('contexto Portainer inclui módulos e estilos publicados sem dados privados',()=>{
  const script="import importlib.util,json; s=importlib.util.spec_from_file_location('preparar','deploy/portainer/preparar.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(json.dumps([r for p,r in m.source_files()]))";
  const arquivos=JSON.parse(execFileSync('python3',['-c',script],{cwd:raiz,encoding:'utf8'}));
  const app=readFileSync(new URL('../../app.js',import.meta.url),'utf8');
  for(const [,nome] of app.matchAll(/from ['"]\.\/([^'"]+)['"]/g))assert.ok(arquivos.includes(nome),'Módulo ausente: '+nome);
  const html=readFileSync(new URL('../../app.html',import.meta.url),'utf8');
  for(const [,nome] of html.matchAll(/href="\/([^"?]+\.css)"/g))assert.ok(arquivos.includes(nome),'CSS ausente: '+nome);
  assert.ok(arquivos.includes('backend/src/db/ajustes-catalogo.js'));
  assert.ok(arquivos.includes('acervo/mulher/protocolos/ficha-de-compartilhamento-de-informacao.pdf'));
  assert.ok(!arquivos.some(n=>/^(backend\/data\/|\.env)|\.(db|eml)$/.test(n)));
});
