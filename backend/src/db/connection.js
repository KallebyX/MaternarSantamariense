import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

const here = dirname(fileURLToPath(import.meta.url));

if (config.dbPath !== ':memory:') {
  mkdirSync(dirname(config.dbPath), { recursive: true });
}

export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(readFileSync(join(here, 'schema.sql'), 'utf-8'));

// Colunas acrescentadas depois da primeira versão: o CREATE TABLE IF NOT EXISTS
// do schema não altera tabelas já criadas, então aplicamos aqui.
const COLUNAS_NOVAS = [
  ['usuarios', 'senha_temporaria', "INTEGER NOT NULL DEFAULT 0"],
  ['usuarios', 'telefone', "TEXT DEFAULT ''"],
  ['aulas', 'url', "TEXT DEFAULT ''"],
  ['cursos', 'capa', "TEXT DEFAULT ''"],
  ['qualifica_modulos', 'url', "TEXT DEFAULT ''"],
];
for (const [tabela, coluna, definicao] of COLUNAS_NOVAS) {
  const existe = db.prepare(`SELECT 1 FROM pragma_table_info(?) WHERE name = ?`).get(tabela, coluna);
  if (!existe) db.exec(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`);
}

export function registrarLog(usuario, acao, detalhe = '') {
  db.prepare('INSERT INTO logs (usuario, acao, detalhe) VALUES (?, ?, ?)')
    .run(usuario || '', acao, String(detalhe).slice(0, 500));
}
