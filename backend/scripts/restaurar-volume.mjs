// Usar somente com a aplicação parada e um volume vazio. Nunca sobrescreve dados.
import Database from 'better-sqlite3';
import { existsSync, lstatSync, readdirSync, mkdirSync, copyFileSync, chmodSync, chownSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const [origemArg, destinoArg] = process.argv.slice(2);
if (!origemArg || !destinoArg) throw new Error('Uso: node scripts/restaurar-volume.mjs /backup /app/backend/data');
const origem = resolve(origemArg);
const destino = resolve(destinoArg);
if (origem === destino) throw new Error('Origem e destino devem ser diferentes.');
if (existsSync(destino) && (!lstatSync(destino).isDirectory() || lstatSync(destino).isSymbolicLink())) throw new Error('Destino deve ser um diretório real.');
mkdirSync(destino, { recursive: true });
const existentes = readdirSync(destino);
if (existentes.some(n => n !== 'uploads') || (existsSync(join(destino, 'uploads')) &&
  (!lstatSync(join(destino, 'uploads')).isDirectory() || lstatSync(join(destino, 'uploads')).isSymbolicLink() || readdirSync(join(destino, 'uploads')).length))) {
  throw new Error('Volume não vazio. Restaure em outro volume; o existente foi preservado.');
}

const manifesto = JSON.parse(readFileSync(join(origem, 'manifest.json'), 'utf8'));
if (manifesto.format !== 1 || !Array.isArray(manifesto.files) || !manifesto.files.length) throw new Error('Manifesto inválido.');
const nomes = new Set();
for (const file of manifesto.files) {
  if (typeof file.path !== 'string' || !/^(maternar\.db|uploads\/[a-zA-Z0-9_.-]+)$/.test(file.path) || file.path.includes('..') || nomes.has(file.path)) throw new Error('Caminho inválido ou duplicado no backup.');
  nomes.add(file.path);
  const caminho = join(origem, file.path);
  const stat = lstatSync(caminho);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== file.size || createHash('sha256').update(readFileSync(caminho)).digest('hex') !== file.sha256) throw new Error('Backup incompleto ou corrompido.');
}
if (!nomes.has('maternar.db')) throw new Error('Backup sem banco.');
const banco = new Database(join(origem, 'maternar.db'), { readonly: true, fileMustExist: true });
try {
  if (banco.pragma('integrity_check', { simple: true }) !== 'ok' || banco.pragma('foreign_key_check').length) throw new Error('Banco inválido.');
  const usuarios = banco.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total;
  if (usuarios !== manifesto.users) throw new Error('Contagem de usuários divergente.');
} finally { banco.close(); }

mkdirSync(join(destino, 'uploads'), { recursive: true });
for (const file of manifesto.files) copyFileSync(join(origem, file.path), join(destino, file.path), 1); // COPYFILE_EXCL
function proteger(path) {
  const directory = lstatSync(path).isDirectory();
  chmodSync(path, directory ? 0o700 : 0o600);
  if (process.getuid?.() === 0) chownSync(path, 10001, 10001);
  if (directory) for (const name of readdirSync(path)) proteger(join(path, name));
}
proteger(destino);
console.log(JSON.stringify({ restaurado: true, usuarios: manifesto.users, arquivos: manifesto.files.length - 1 }));
