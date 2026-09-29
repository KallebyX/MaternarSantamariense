import { db } from './connection.js';

export const URL_COREN = 'https://www.portalcoren-rs.gov.br/index.php?categoria=publicacoes&pagina=protocolos-enfermagem-municipais';
export const TOOLNURSE = {
  titulo: 'ToolNurse — UFN',
  url: 'https://toolnurse.ufn.edu.br/',
  descricao: 'Ferramenta digital da UFN com formulário de avaliação da criança por faixa etária.',
};

/** Migração única: preserva conteúdos e alterações futuras feitas pelo painel. */
export function atualizarCatalogo() {
  const chave = 'catalogo-links-20260929';
  if (db.prepare('SELECT 1 FROM app_meta WHERE chave = ?').get(chave)) return;
  const anterior = 'https://www.portalcoren-rs.gov.br/docs/ProtocolosEnfermagem/';
  for (const tabela of ['produtos', 'qualifica_recursos']) {
    db.prepare(`UPDATE ${tabela} SET url = ? WHERE url = ?`).run(URL_COREN, anterior);
  }
  db.prepare("UPDATE links SET url = '/app#inicio', descricao = 'Acesso à plataforma Maternar e às atividades da rede.' WHERE url = '#portal'").run();
  db.prepare("UPDATE links SET url = '/app#mensagens', descricao = 'Fale com a coordenação pelos canais de comunicação da plataforma.' WHERE url = '#suporte'").run();
  db.prepare("UPDATE links SET url = 'https://telessauders.ufrgs.br/' WHERE url = 'https://www.ufrgs.br/telessauders/'").run();
  if (!db.prepare("SELECT 1 FROM produtos WHERE rtrim(url, '/') = ?").get(TOOLNURSE.url.slice(0, -1))) {
    db.prepare('INSERT INTO produtos(tipo, ano, titulo, descricao, url) VALUES (?, ?, ?, ?, ?)')
      .run('Aplicativo', 0, TOOLNURSE.titulo, TOOLNURSE.descricao, TOOLNURSE.url);
  }
  if (!db.prepare("SELECT 1 FROM links WHERE rtrim(url, '/') = ?").get(TOOLNURSE.url.slice(0, -1))) {
    db.prepare('INSERT INTO links(titulo, categoria, descricao, url) VALUES (?, ?, ?, ?)')
      .run(TOOLNURSE.titulo, 'Ferramentas UFN', TOOLNURSE.descricao, TOOLNURSE.url);
  }
  db.prepare('INSERT INTO app_meta(chave, valor) VALUES (?, ?)').run(chave, '1');
}
