import { readFileSync, statSync } from 'node:fs';
import { db } from './connection.js';
import { PDFS_CATALOGO } from './ajustes-catalogo.js';

export const catalogoDrive = JSON.parse(readFileSync(new URL('../../seeds/DRIVE_20260929.json', import.meta.url), 'utf8'));
const politicasOriginais = JSON.parse(readFileSync(new URL('../../seeds/POLITICAS.json', import.meta.url), 'utf8'));

/** O inventário e seus hashes continuam descrevendo os originais do Drive. */
export function urlPublicaAcervo(material) {
  return PDFS_CATALOGO.some(base => material.url === base + '.docx')
    ? material.url.replace(/\.docx$/, '.pdf') : material.url;
}

function politicaDoMaterial(material) {
  const peloNome = db.prepare('SELECT id FROM politicas WHERE nome = ?').get(material.politica);
  if (peloNome) return peloNome.id;

  // Uma área renomeada no painel conserva a identidade pelos materiais já associados.
  const urlsAnteriores = politicasOriginais.find(p => p.n === material.politica)?.mats.map(m => m[2]) || [];
  const ids = new Set(urlsAnteriores.flatMap(url => [url, url.replace(/\.pdf$/, '.docx')])
    .flatMap(url => db.prepare('SELECT DISTINCT politica_id FROM materiais WHERE ltrim(url, ?) = ?').all('/', url).map(r => r.politica_id)));
  if (ids.size === 1) return [...ids][0];
  throw new Error(`Não foi possível identificar a área do acervo: ${material.politica}`);
}

function urlDaFonte(material, url) {
  const normalizada = String(url || '').replace(/^\/+/, '');
  if ([material.url, urlPublicaAcervo(material)].includes(normalizada)) return true;
  try {
    const fonte = new URL(url);
    return ['drive.google.com', 'docs.google.com'].includes(fonte.hostname)
      && (fonte.pathname.split('/').includes(material.driveId) || fonte.searchParams.get('id') === material.driveId);
  } catch { return false; }
}

/** Importação única da reconciliação do Drive; nunca reverte edições ou exclusões do painel. */
export function importarAcervoDrive() {
  if (db.prepare('SELECT 1 FROM app_meta WHERE chave = ?').get(catalogoDrive.chave)) return null;
  return db.transaction(() => {
    const resultado = { materiais: 0, documentos: 0, protocolos: 0, fontes: [] };
    const documentos = db.prepare('SELECT id, url FROM documentos').all();
    const protocolos = db.prepare('SELECT id, url FROM protocolos').all();
    for (const material of catalogoDrive.materiais) {
      const urlPublica = urlPublicaAcervo(material);
      const politicaId = politicaDoMaterial(material);
      let registro = db.prepare('SELECT id, url FROM materiais WHERE politica_id = ?').all(politicaId).find(r => urlDaFonte(material, r.url));
      if (!registro) {
        registro = { id: db.prepare('INSERT INTO materiais(politica_id, titulo, tipo, url, tags) VALUES (?, ?, ?, ?, ?)')
          .run(politicaId, material.titulo, material.tipo, urlPublica, JSON.stringify(material.tags)).lastInsertRowid };
        resultado.materiais++;
      }
      let documento = documentos.find(r => r.id === `drive-${material.driveId}` || urlDaFonte(material, r.url));
      if (!documento) {
        documento = { id: `drive-${material.driveId}`, url: urlPublica };
        db.prepare(`INSERT INTO documentos(id, titulo, tipo, categoria, setor, autor, status, versao, atualizado, expira, tamanho, tags, descricao, url)
          VALUES (?, ?, ?, ?, ?, '', 'Em revisão', '', '', '', ?, ?, ?, ?)`)
          .run(documento.id, material.titulo, material.tipo, material.politica, material.politica,
            `${Math.ceil((urlPublica === material.url ? material.bytes : statSync(new URL('../../../' + urlPublica, import.meta.url)).size) / 1024)} KB`, JSON.stringify(material.tags),
            `Material disponibilizado no acervo da rede — ${material.politica}.`, urlPublica);
        documentos.push(documento);
        resultado.documentos++;
      }
      let protocolo = null;
      if (material.tipo === 'Protocolo') {
        protocolo = protocolos.find(r => r.id === `drive-${material.driveId}` || urlDaFonte(material, r.url));
        if (!protocolo) {
          protocolo = { id: `drive-${material.driveId}`, url: urlPublica };
          db.prepare(`INSERT INTO protocolos(id, nome, setor, paginas, pendente, url) VALUES (?, ?, ?, ?, 1, ?)`)
            .run(protocolo.id, material.titulo, material.politica, material.paginas, urlPublica);
          protocolos.push(protocolo);
          resultado.protocolos++;
        }
      }
      resultado.fontes.push({ driveId: material.driveId, sha256: material.sha256, materialId: registro.id, documentoId: documento.id, protocoloId: protocolo?.id || null });
    }
    db.prepare('INSERT INTO app_meta(chave, valor) VALUES (?, ?)').run(catalogoDrive.chave, JSON.stringify(resultado));
    return resultado;
  })();
}
