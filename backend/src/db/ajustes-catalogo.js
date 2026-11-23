import { readFileSync, existsSync, statSync } from 'node:fs';

const origem = JSON.parse(readFileSync(new URL('./catalogo-origem-20261123.json', import.meta.url), 'utf8'));
const produtos = JSON.parse(readFileSync(new URL('../../seeds/PRODUTOS.json', import.meta.url), 'utf8'));
const qualifica = JSON.parse(readFileSync(new URL('../../seeds/QUALIFICA.json', import.meta.url), 'utf8'));
export const CHAVE_AJUSTES_CATALOGO = 'ajustes-catalogo-20261123';
export const PDFS_CATALOGO = [
  'acervo/mulher/protocolos/ficha-de-compartilhamento-de-informacao',
  'acervo/crianca/links-uteis/guia-para-encontrar-os-laudos-do-evoya',
  'acervo/saude-bucal/protocolos/protocolo-cirurgia-2018-1',
  'acervo/saude-bucal/protocolos/protocolo-endo-2018-1',
  'acervo/saude-bucal/protocolos/protocolo-pediatria-2019-1',
  'acervo/saude-bucal/protocolos/protocolo-perio-2018-1',
  'acervo/saude-bucal/protocolos/protocolo-pne-2018-1',
  'acervo/pics/material-curso-introdutorio',
];
const URL_COREN = 'https://www.portalcoren-rs.gov.br/index.php?categoria=publicacoes&pagina=protocolos-enfermagem-municipais';
function destino(url) {
  if (url === 'https://www.portalcoren-rs.gov.br/docs/ProtocolosEnfermagem/') return URL_COREN;
  if (url === 'https://amamos.lapinf.ufn.edu.br/buscar/categoria') return 'https://amamos.lapinf.ufn.edu.br/';
  return url;
}
const normalizarUrl = url => destino(url).replace(/\/$/, '');

/** Uma transação única, com cópia das linhas alteradas e respeito a edições da gestão. */
export function ajustarCatalogo(banco) {
  if (banco.prepare('SELECT 1 FROM app_meta WHERE chave=?').get(CHAVE_AJUSTES_CATALOGO)) return;
  return banco.transaction(() => {
    const anteriores = {};
    const guardar = (tabela, linha) => (anteriores[tabela] ??= []).push(linha);
    function adicionarProduto(produto) {
      if (banco.prepare('SELECT url FROM produtos').all().some(p => normalizarUrl(p.url) === normalizarUrl(produto.url))) return;
      banco.prepare('INSERT INTO produtos(tipo,ano,titulo,descricao,url,capa) VALUES (?,?,?,?,?,?)')
        .run(produto.tipo, produto.ano, produto.titulo, produto.desc, produto.url, produto.capa || '');
    }
    const curso = qualifica[0];
    for (const modulo of origem.qualifica) {
      for (const [titulo, tipo, url, fonte] of modulo.rec) {
        if (titulo === 'Curso Introdutório Online') continue;
        // Só mover recursos reconhecidos e inalterados. Outros recursos do painel permanecem.
        const linhas = banco.prepare('SELECT * FROM qualifica_recursos WHERE modulo_id=? AND titulo=? AND tipo=? AND fonte=? AND (url=? OR url=?)')
          .all(modulo.id, titulo, tipo, fonte, url, destino(url));
        for (const linha of linhas) {
          const produto = produtos.find(p => normalizarUrl(p.url) === normalizarUrl(linha.url));
          if (!produto) continue;
          guardar('qualifica_recursos', linha);
          adicionarProduto(produto);
          banco.prepare('DELETE FROM qualifica_recursos WHERE id=?').run(linha.id);
        }
      }
      const atual = banco.prepare('SELECT * FROM qualifica_modulos WHERE id=?').get(modulo.id);
      if (!atual || atual.titulo !== modulo.t || atual.descricao !== modulo.d) continue;
      const recursos = banco.prepare('SELECT * FROM qualifica_recursos WHERE modulo_id=?').all(modulo.id);
      if (!recursos.length) {
        guardar('qualifica_modulos', atual);
        banco.prepare('DELETE FROM qualifica_modulos WHERE id=?').run(atual.id);
      } else if (modulo.id === curso.id && recursos.length === 1 && recursos[0].titulo === curso.rec[0][0] && recursos[0].url === curso.rec[0][2]) {
        guardar('qualifica_modulos', atual);
        banco.prepare("UPDATE qualifica_modulos SET titulo=?,descricao=?,aulas=0,duracao='',nivel='',tipo='Capacitações online' WHERE id=?")
          .run(curso.t, curso.d, atual.id);
      }
    }
    // Retirar somente trilhas herdadas que perderam todos os módulos; preservar trilhas editadas.
    for (const trilha of banco.prepare('SELECT * FROM trilhas').all()) {
      const ids = JSON.parse(trilha.modulos);
      const existentes = ids.filter(id => banco.prepare('SELECT 1 FROM qualifica_modulos WHERE id=?').get(id));
      if (existentes.length === ids.length) continue;
      guardar('trilhas', trilha);
      const stock = origem.trilhas.find(t => t.id === trilha.id && t.n === trilha.nome && t.d === trilha.descricao);
      if (!existentes.length && stock) banco.prepare('DELETE FROM trilhas WHERE id=?').run(trilha.id);
      else banco.prepare('UPDATE trilhas SET modulos=? WHERE id=?').run(JSON.stringify(existentes), trilha.id);
    }
    const reanimacao = produtos.find(p => p.url === 'https://www.sbp.com.br/especiais/reanimacao-/');
    const antigo = origem.produtos[4];
    for (const linha of banco.prepare('SELECT * FROM produtos WHERE url=? AND titulo IN (?,?) AND descricao IN (?,?)')
      .all(antigo.url, antigo.titulo, reanimacao.titulo, antigo.desc, reanimacao.desc)) {
      guardar('produtos', linha);
      banco.prepare('UPDATE produtos SET tipo=?,titulo=?,descricao=?,url=? WHERE id=?')
        .run(reanimacao.tipo, reanimacao.titulo, reanimacao.desc, reanimacao.url, linha.id);
    }
    for (const base of PDFS_CATALOGO) {
      if (!existsSync(new URL('../../../' + base + '.pdf', import.meta.url))) throw new Error('PDF do catálogo ausente: ' + base);
      for (const tabela of ['materiais', 'documentos', 'protocolos', 'produtos', 'qualifica_recursos']) {
        for (const linha of banco.prepare(`SELECT * FROM ${tabela} WHERE url IN (?,?)`).all(base + '.docx', '/' + base + '.docx')) {
          guardar(tabela, linha);
          banco.prepare(`UPDATE ${tabela} SET url=? WHERE id=?`).run(linha.url.replace(/\.docx$/, '.pdf'), linha.id);
          if (tabela === 'documentos') banco.prepare('UPDATE documentos SET tamanho=? WHERE id=?')
            .run(`${Math.ceil(statSync(new URL('../../../' + base + '.pdf', import.meta.url)).size / 1024)} KB`, linha.id);
        }
      }
    }
    banco.prepare('INSERT INTO app_meta(chave,valor) VALUES (?,?)').run(CHAVE_AJUSTES_CATALOGO,
      JSON.stringify({ em: new Date().toISOString(), anteriores }));
  })();
}
