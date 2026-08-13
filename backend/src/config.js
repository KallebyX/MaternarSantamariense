import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// .env simples, sem dependência externa
const envPath = join(raiz, '.env');
if (existsSync(envPath)) {
  for (const linha of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = linha.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const teste = process.env.NODE_ENV === 'test';

export const config = {
  porta: Number(process.env.PORT || 3000),
  host: process.env.HOST || '127.0.0.1',
  dbPath: teste ? ':memory:' : resolve(raiz, process.env.DB_PATH || './data/maternar.db'),
  jwtSecret: process.env.JWT_SECRET || (teste ? 'segredo-de-teste' : ''),
  jwtExpira: process.env.JWT_EXPIRA || '12h',
  staticDir: resolve(raiz, process.env.STATIC_DIR || '..'),
  uploadDir: resolve(raiz, process.env.UPLOAD_DIR || './data/uploads'),
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB || 64),
  corsOrigin: process.env.CORS_ORIGIN || '',
  raiz,
};

if (!config.jwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[config] JWT_SECRET é obrigatório em produção. Gere com: openssl rand -hex 32');
    process.exit(1);
  }
  config.jwtSecret = 'apenas-desenvolvimento';
}
