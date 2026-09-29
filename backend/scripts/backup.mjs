import { resolve } from 'node:path';
import { chmodSync } from 'node:fs';
import { db } from '../src/db/connection.js';
if (!process.argv[2]) {
  console.error('Uso: node scripts/backup.mjs /caminho/privado/maternar-backup.db');
  process.exitCode=1;
} else {
  try { await db.backup(resolve(process.argv[2])); chmodSync(resolve(process.argv[2]),0o600); console.log('Backup SQLite concluído. Inclua também a pasta de uploads.'); }
  catch(error) { console.error('Não foi possível gerar o backup:',error.message); process.exitCode=1; }
}
db.close();
