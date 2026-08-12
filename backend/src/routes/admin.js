// Painel de administração: logs, backup em JSON, estatísticas da VM
import { Router } from 'express';
import { statSync } from 'node:fs';
import { db, registrarLog } from '../db/connection.js';
import { autenticar, exigirPapel } from '../auth/middleware.js';
import { ok } from '../lib/http.js';
import { config } from '../config.js';

export const adminRouter = Router();
adminRouter.use(autenticar, exigirPapel('Administrador'));

const TABELAS = ['usuarios', 'cursos', 'aulas', 'progresso', 'qualifica_modulos', 'qualifica_recursos',
  'trilhas', 'politicas', 'materiais', 'projetos', 'protocolos', 'documentos', 'links', 'eventos',
  'canais', 'mensagens', 'produtos', 'certificados', 'notificacoes', 'notificacoes_lidas',
  'conquistas', 'tarefas', 'logs'];

adminRouter.get('/logs', (req, res) => {
  const limite = Math.min(Number(req.query.limite) || 200, 1000);
  return ok(res, db.prepare('SELECT * FROM logs ORDER BY id DESC LIMIT ?').all(limite));
});

// Backup completo do banco em JSON (sem hashes de senha)
adminRouter.get('/backup', (req, res) => {
  const dump = { gerado_em: new Date().toISOString(), versao: 1, tabelas: {} };
  for (const t of TABELAS) {
    let linhas = db.prepare(`SELECT * FROM ${t}`).all();
    if (t === 'usuarios') linhas = linhas.map(({ senha_hash, ...resto }) => resto);
    dump.tabelas[t] = linhas;
  }
  registrarLog(req.usuario.email, 'backup', 'download do banco em JSON');
  res.setHeader('Content-Disposition', `attachment; filename="maternar-backup-${new Date().toISOString().slice(0, 10)}.json"`);
  return res.json(dump);
});

adminRouter.get('/estatisticas', (req, res) => {
  const contagens = {};
  for (const t of TABELAS) contagens[t] = db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c;
  let tamanhoDb = 0;
  try { tamanhoDb = config.dbPath === ':memory:' ? 0 : statSync(config.dbPath).size; } catch { /* banco ainda não persistido */ }
  const mem = process.memoryUsage();
  return ok(res, {
    contagens,
    banco: { caminho: config.dbPath, bytes: tamanhoDb },
    processo: { uptimeSegundos: Math.round(process.uptime()), rssBytes: mem.rss, heapUsadoBytes: mem.heapUsed, node: process.version },
  });
});
