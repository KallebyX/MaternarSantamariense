/** Evolui a agenda existente sem remover eventos nem reinterpretar sua autoria. */
export function migrarAgenda(banco) {
  banco.transaction(() => {
    for (const [nome, definicao] of [
      ['origem', "TEXT NOT NULL DEFAULT 'Maternar'"],
      ['visibilidade', "TEXT NOT NULL DEFAULT 'rede'"],
      ['equipe', "TEXT NOT NULL DEFAULT ''"],
      ['fim', "TEXT NOT NULL DEFAULT ''"],
    ]) {
      if (!banco.prepare("SELECT 1 FROM pragma_table_info('eventos') WHERE name=?").get(nome)) {
        banco.exec(`ALTER TABLE eventos ADD COLUMN ${nome} ${definicao}`);
      }
    }
    if (!banco.prepare("SELECT 1 FROM pragma_table_info('usuarios') WHERE name='equipe_agenda'").get()) {
      banco.exec("ALTER TABLE usuarios ADD COLUMN equipe_agenda TEXT NOT NULL DEFAULT ''");
    }
    banco.exec('CREATE INDEX IF NOT EXISTS eventos_data ON eventos(ano, mes, dia, hora)');
  })();
}
