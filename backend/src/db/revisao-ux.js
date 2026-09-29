import { db } from './connection.js';

// Remoção solicitada pela coordenação; executada uma única vez, inclusive em bases existentes.
export function revisarCatalogoUx() {
  const chave = 'catalogo-ux-20260929';
  if (db.prepare('SELECT 1 FROM app_meta WHERE chave=?').get(chave)) return;
  const recursos = db.prepare('SELECT id,modulo_id,url FROM qualifica_recursos').all();
  const modulos = new Set();
  for (const recurso of recursos) {
    let host;
    try { host = new URL(recurso.url).hostname.replace(/^www\./, ''); } catch { continue; }
    if (host !== 'pediatraluisapinheiro.com.br') continue;
    db.prepare('DELETE FROM qualifica_recursos WHERE id=?').run(recurso.id);
    modulos.add(recurso.modulo_id);
  }
  for (const modulo of modulos) db.prepare('UPDATE qualifica_modulos SET aulas=(SELECT COUNT(*) FROM qualifica_recursos WHERE modulo_id=?) WHERE id=?').run(modulo,modulo);
  db.prepare('INSERT INTO app_meta(chave,valor) VALUES (?,?)').run(chave,'1');
}
