#!/usr/bin/env node
// Extrai os arrays de dados do protótipo (dc.html) para backend/seeds/*.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const html = readFileSync(join(repo, 'Maternar Santa-mariense.dc.html'), 'utf-8');
const outDir = join(here, '..', 'seeds');
mkdirSync(outDir, { recursive: true });

const NOMES = ['PERFIS', 'CURSOS', 'PROTOCOLOS', 'TAREFAS', 'CANAIS', 'MSGS', 'EVENTOS',
  'USUARIOS', 'PRODUTOS', 'CONQUISTAS', 'QUALIFICA', 'TRILHAS', 'NOTIFS_SEED', 'DOCS',
  'LINKS_DATA', 'EQUIPE', 'PROJETOS_PESQ', 'POLITICAS', 'QUAL_TIPO'];

function extrair(nome) {
  const m = html.match(new RegExp(`const ${nome} = ([\\[{])`));
  if (!m) throw new Error(`não achei ${nome}`);
  const abre = m[1];
  const fecha = abre === '[' ? ']' : '}';
  let i = m.index + m[0].length - 1;
  let nivel = 0;
  let emStr = null;
  for (let j = i; j < html.length; j++) {
    const c = html[j];
    if (emStr) {
      if (c === '\\') j++;
      else if (c === emStr) emStr = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { emStr = c; continue; }
    if (c === abre) nivel++;
    else if (c === fecha && --nivel === 0) {
      return vm.runInNewContext('(' + html.slice(i, j + 1) + ')');
    }
  }
  throw new Error(`bloco de ${nome} não fechou`);
}

for (const nome of NOMES) {
  const valor = extrair(nome);
  writeFileSync(join(outDir, nome + '.json'), JSON.stringify(valor, null, 1));
  const tam = Array.isArray(valor) ? valor.length : Object.keys(valor).length;
  console.log(`${nome}: ${tam}`);
}
console.log('seeds gravados em', outDir);
