// Migração aditiva: comunicados antigos continuam disponíveis e sem autoria inventada.
export function migrarPermissoes(banco) {
  banco.transaction(() => {
    for (const [tabela, nome, tipo] of [
      ['usuarios', 'publicar_avisos', 'INTEGER NOT NULL DEFAULT 0 CHECK (publicar_avisos IN (0,1))'],
      ['usuarios', 'orgao', "TEXT NOT NULL DEFAULT ''"],
      ['notificacoes', 'autor_id', 'INTEGER REFERENCES usuarios(id) ON DELETE SET NULL'],
      ['notificacoes', 'orgao', "TEXT NOT NULL DEFAULT ''"],
      ['notificacoes', 'atualizado_em', 'TEXT'],
    ]) {
      if (!banco.prepare(`SELECT 1 FROM pragma_table_info(?) WHERE name = ?`).get(tabela, nome)) {
        banco.exec(`ALTER TABLE ${tabela} ADD COLUMN ${nome} ${tipo}`);
      }
    }
    banco.exec('CREATE INDEX IF NOT EXISTS idx_notificacoes_autor ON notificacoes(autor_id)');
  })();
}
