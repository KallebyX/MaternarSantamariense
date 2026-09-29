import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const teste = process.env.NODE_ENV === 'test';

// .env simples, sem dependência externa
const envPath = join(raiz, '.env');
if (!teste && existsSync(envPath)) {
  for (const linha of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = linha.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

// A suíte não lê credenciais locais nem deixa uploads fictícios no volume real.
const uploadsTeste = teste && !process.env.UPLOAD_DIR ? mkdtempSync(join(tmpdir(), 'maternar-uploads-test-')) : null;
if (uploadsTeste) process.once('exit', () => rmSync(uploadsTeste, { recursive: true, force: true }));

export const config = {
  porta: Number(process.env.PORT || 3000),
  host: process.env.HOST || '127.0.0.1',
  dbPath: process.env.DB_PATH ? resolve(raiz, process.env.DB_PATH) : teste ? ':memory:' : resolve(raiz, './data/maternar.db'),
  jwtSecret: process.env.JWT_SECRET || (teste ? 'segredo-de-teste' : ''),
  jwtExpira: process.env.JWT_EXPIRA || '12h',
  staticDir: resolve(raiz, process.env.STATIC_DIR || '..'),
  uploadDir: resolve(raiz, process.env.UPLOAD_DIR || uploadsTeste || './data/uploads'),
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB || 64),
  corsOrigin: process.env.CORS_ORIGIN || '',
  publicUrl: process.env.PUBLIC_URL || '',
  smtp: {
    enabled: process.env.SMTP_ENABLED === 'true',
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD_FILE
      ? readFileSync(process.env.SMTP_PASSWORD_FILE, 'utf8').trimEnd()
      : process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  },
  raiz,
};

if (!config.jwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[config] JWT_SECRET é obrigatório em produção. Gere com: openssl rand -hex 32');
    process.exit(1);
  }
  config.jwtSecret = 'apenas-desenvolvimento';
}
