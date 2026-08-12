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

export function registrarLog(usuario, acao, detalhe = '') {
  db.prepare('INSERT INTO logs (usuario, acao, detalhe) VALUES (?, ?, ?)')
    .run(usuario || '', acao, String(detalhe).slice(0, 500));
}
