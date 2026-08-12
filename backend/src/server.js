import { criarApp } from './app.js';
import { seed } from './db/seed.js';
import { config } from './config.js';

const contagens = seed(); // idempotente: cria schema e popula na primeira subida
console.log('[db]', contagens);

const app = criarApp();
app.listen(config.porta, config.host, () => {
  console.log(`[maternar-api] escutando em http://${config.host}:${config.porta} — frontend: ${config.staticDir}`);
});
