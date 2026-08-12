import express from 'express';
import { existsSync } from 'node:fs';
import { config } from './config.js';
import { authRouter } from './auth/routes.js';
import { usuariosRouter } from './routes/usuarios.js';
import { conteudoRouter } from './routes/conteudo.js';
import { aprendizagemRouter } from './routes/aprendizagem.js';
import { adminRouter } from './routes/admin.js';
import { erro, ok } from './lib/http.js';

export function criarApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true); // atrás do nginx na VM
  app.use(express.json({ limit: '1mb' }));

  // Cabeçalhos de segurança
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (config.corsOrigin) {
      res.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      if (req.method === 'OPTIONS') return res.sendStatus(204);
    }
    next();
  });

  app.get('/api/saude', (req, res) => ok(res, { status: 'ok', horario: new Date().toISOString() }));
  app.use('/api/auth', authRouter);
  app.use('/api/usuarios', usuariosRouter);
  app.use('/api', conteudoRouter);
  app.use('/api', aprendizagemRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', (req, res) => erro(res, 404, 'Rota não encontrada.'));

  // Frontend estático (index.html + acervo/) — a mesma VM serve tudo
  if (existsSync(config.staticDir)) {
    app.use(express.static(config.staticDir, { index: 'index.html', dotfiles: 'ignore' }));
  }

  // Tratador de erros: loga no servidor, resposta genérica ao cliente
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed') return erro(res, 400, 'JSON inválido no corpo da requisição.');
    console.error('[api]', err);
    return erro(res, 500, 'Erro interno. Tente novamente ou contate a administração.');
  });

  return app;
}
