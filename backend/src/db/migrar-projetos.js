const identificador = nome => '"' + nome.replaceAll('"', '""') + '"';

/** Acrescenta metadados de origem e a classificação histórica sem reinterpretar registros. */
export function migrarProjetos(banco) {
  return banco.transaction(() => {
    const colunas = [
      ['ano_referencia', 'INTEGER'],
      ['historico', 'INTEGER NOT NULL DEFAULT 0 CHECK (historico IN (0,1))'],
      ['situacao_origem', "TEXT NOT NULL DEFAULT ''"],
      ['periodo_origem', "TEXT NOT NULL DEFAULT ''"],
    ];
    for (const [nome, tipo] of colunas) {
      if (!banco.prepare("SELECT 1 FROM pragma_table_info('projetos') WHERE name=?").get(nome)) {
        banco.exec(`ALTER TABLE projetos ADD COLUMN ${identificador(nome)} ${tipo}`);
      }
    }
    const sql = banco.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='projetos'").get().sql;
    if (!/CHECK\s*\(\s*status\s+IN\s*\([^)]*'Histórico'/i.test(sql)) {
      const regraAnterior = /CHECK\s*\(\s*status\s+IN\s*\(\s*'Ativo'\s*,\s*'Encerrado'\s*\)\s*\)/i;
      if (!regraAnterior.test(sql)) throw new Error('Restrição de status dos projetos não reconhecida; migração cancelada.');
      // O catálogo atual não possui referências de outras tabelas para projetos.
      // Recusar um esquema externo diferente evita disparar cascatas de exclusão.
      for (const tabela of banco.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()) {
        if (banco.prepare(`PRAGMA foreign_key_list(${identificador(tabela.name)})`).all().some(f => f.table === 'projetos')) {
          throw new Error('Projetos possui uma referência externa não prevista; migração cancelada.');
        }
      }
      const objetos = banco.prepare("SELECT sql FROM sqlite_master WHERE tbl_name='projetos' AND type IN ('index','trigger') AND sql IS NOT NULL").all();
      const nomes = banco.prepare("PRAGMA table_xinfo('projetos')").all().filter(c => c.hidden === 0).map(c => identificador(c.name)).join(',');
      const corpo = sql.slice(sql.indexOf('(')).replace(regraAnterior, "CHECK (status IN ('Ativo','Encerrado','Histórico'))");
      const antes = banco.prepare('SELECT COUNT(*) n FROM projetos').get().n;
      banco.exec(`CREATE TABLE projetos_migracao_status ${corpo}`);
      banco.exec(`INSERT INTO projetos_migracao_status(${nomes}) SELECT ${nomes} FROM projetos`);
      banco.exec('DROP TABLE projetos');
      // Recriar diretamente com o nome original conserva views sem reescrever seus SQLs.
      banco.exec(`CREATE TABLE projetos ${corpo}`);
      banco.exec(`INSERT INTO projetos(${nomes}) SELECT ${nomes} FROM projetos_migracao_status`);
      banco.exec('DROP TABLE projetos_migracao_status');
      for (const objeto of objetos) banco.exec(objeto.sql);
      if (banco.prepare('SELECT COUNT(*) n FROM projetos').get().n !== antes) throw new Error('Contagem de projetos divergente; migração cancelada.');
    }
    banco.exec('CREATE INDEX IF NOT EXISTS idx_projetos_referencia ON projetos(ano_referencia, historico, status)');
  })();
}
