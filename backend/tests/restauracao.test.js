import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import Database from 'better-sqlite3';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'maternar-restore-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, 'backup'), target = join(root, 'volume');
  mkdirSync(join(source, 'uploads'), { recursive: true });
  const database = new Database(join(source, 'maternar.db'));
  database.exec("CREATE TABLE usuarios(id INTEGER PRIMARY KEY, nome TEXT); INSERT INTO usuarios VALUES (1, 'Teste');");
  database.close();
  writeFileSync(join(source, 'uploads', 'teste.pdf'), '%PDF-1.4\nTeste');
  const manifest = { format: 1, users: 1, files: ['maternar.db', 'uploads/teste.pdf'].map(path => {
    const bytes = readFileSync(join(source, path));
    return { path, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
  }) };
  const save = () => writeFileSync(join(source, 'manifest.json'), JSON.stringify(manifest));
  save();
  const run = () => spawnSync(process.execPath, ['scripts/restaurar-volume.mjs', source, target], { encoding: 'utf8' });
  return { source, target, manifest, save, run };
}

test('restauração preserva banco e uploads em volume vazio e recusa repetição', t => {
  const f = fixture(t);
  mkdirSync(join(f.target, 'uploads'), { recursive: true }); // estrutura inicial da imagem
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).usuarios, 1);
  assert.deepEqual(readFileSync(join(f.target, 'maternar.db')), readFileSync(join(f.source, 'maternar.db')));
  assert.deepEqual(readFileSync(join(f.target, 'uploads/teste.pdf')), readFileSync(join(f.source, 'uploads/teste.pdf')));
  assert.notEqual(f.run().status, 0);
});

test('restauração recusa volume ocupado antes de gravar', t => {
  const f = fixture(t);
  mkdirSync(f.target);
  writeFileSync(join(f.target, 'preservar.txt'), 'dado existente');
  assert.notEqual(f.run().status, 0);
  assert.deepEqual(readdirSync(f.target), ['preservar.txt']);
  assert.equal(readFileSync(join(f.target, 'preservar.txt'), 'utf8'), 'dado existente');
});

test('restauração recusa backup adulterado sem copiar o banco', t => {
  const f = fixture(t);
  writeFileSync(join(f.source, 'uploads/teste.pdf'), 'alterado');
  assert.notEqual(f.run().status, 0);
  assert.deepEqual(readdirSync(f.target), []);
});

test('restauração recusa caminhos fora do diretório e contagem inconsistente', t => {
  const f = fixture(t);
  f.manifest.files[1].path = '../arquivo';
  f.save();
  assert.notEqual(f.run().status, 0);
  assert.deepEqual(readdirSync(f.target), []);
  f.manifest.files.pop();
  f.manifest.users = 999;
  f.save();
  assert.notEqual(f.run().status, 0);
  assert.deepEqual(readdirSync(f.target), []);
});
