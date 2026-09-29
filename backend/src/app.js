import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from './config.js';
import { authRouter } from './auth/routes.js';
import { usuariosRouter } from './routes/usuarios.js';
import { conteudoRouter } from './routes/conteudo.js';
import { aprendizagemRouter } from './routes/aprendizagem.js';
import { arquivosRouter } from './routes/arquivos.js';
import { recursosRouter } from './routes/recursos.js';
import { adminRouter } from './routes/admin.js';
import { erro, ok } from './lib/http.js';

export function criarApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
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

  app.use('/api', (req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.get('/api/saude', (req, res) => ok(res, { status: 'ok', horario: new Date().toISOString() }));
  app.use('/api/auth', authRouter);
  app.use('/api/usuarios', usuariosRouter);
  // Rotas com regra própria primeiro; o CRUD genérico completa o que falta.
  app.use('/api', conteudoRouter);
  app.use('/api', aprendizagemRouter);
  app.use('/api', arquivosRouter);
  app.use('/api', recursosRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', (req, res) => erro(res, 404, 'Rota não encontrada.'));

  // Arquivos enviados pelo painel (fora do diretório do frontend)
  app.use('/uploads', express.static(config.uploadDir, {
    dotfiles: 'deny',
    setHeaders: res => res.setHeader('X-Content-Type-Options', 'nosniff'),
  }));

  // Frontend estático: index.html é a landing pública, app.html é a plataforma.
  if (existsSync(config.staticDir)) {
    app.get(['/app', '/plataforma'], (req, res, next) => {
      const arquivo = join(config.staticDir, 'app.html');
      return existsSync(arquivo) ? res.sendFile(arquivo) : next();
    });
    app.get('/painel', (req, res, next) => {
      const arquivo = join(config.staticDir, 'painel.html');
      return existsSync(arquivo) ? res.sendFile(arquivo) : next();
    });
    // Publicação explícita: nunca servir código, seeds, backups ou o banco.
    for (const pasta of ['acervo', 'cursos', 'qualifica', 'produtos']) {
      app.use('/' + pasta, express.static(join(config.staticDir, pasta), { dotfiles: 'deny' }));
    }
    const publicos = ['index.html', 'app.html', 'app.js', 'chat.js', 'app.css', 'painel.html', 'painel.js', 'redefinir.html', 'redefinir.js',
      'assets/lucide.svg', 'assets/lucide-LICENSE.txt',
      'logo_maternar_icon.png', 'logo_materno.png', 'logo_ufn.png', 'logo_nepes.jpg',
      'logo_ninmahub.png', 'logo_prefeitura.png', 'logo_gestar.png'];
    app.get('/', (req, res) => res.sendFile(join(config.staticDir, 'index.html')));
    for (const arquivo of publicos) app.get('/' + arquivo, (req, res) => res.sendFile(join(config.staticDir, arquivo)));
    app.get('/favicon.ico', (req, res) => res.sendFile(join(config.staticDir, 'logo_maternar_icon.png')));
  }

  app.use((req, res) => erro(res, 404, 'Página não encontrada.'));

  // Tratador de erros: loga no servidor, resposta genérica ao cliente
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed') return erro(res, 400, 'JSON inválido no corpo da requisição.');
    if (err?.type === 'entity.too.large') return erro(res, 413, 'Requisição acima do limite permitido.');
    console.error('[api]', err.message);
    return erro(res, 500, 'Erro interno. Tente novamente ou contate a administração.');
  });

  return app;
}
