import { createHash } from 'node:crypto';

export const AREAS_PROFISSIONAIS = ['Políticas', 'Enfermagem', 'Técnico de Enfermagem', 'Medicina', 'Odontologia', 'Outros'];

/** Migração aditiva: preserva contas, canais e histórico já existentes. */
export function migrarComunicacao(banco) {
  banco.transaction(() => {
    for (const [nome, definicao] of [['area', "TEXT NOT NULL DEFAULT 'Outros'"], ['foto', "TEXT NOT NULL DEFAULT ''"], ['foto_versao', "TEXT NOT NULL DEFAULT ''"]]) {
      if (!banco.prepare("SELECT 1 FROM pragma_table_info('usuarios') WHERE name=?").get(nome)) {
        banco.exec(`ALTER TABLE usuarios ADD COLUMN ${nome} ${definicao}`);
      }
    }
    for (const {id} of banco.prepare("SELECT id FROM usuarios WHERE foto<>'' AND foto_versao=''").all()) {
      const {foto} = banco.prepare('SELECT foto FROM usuarios WHERE id=?').get(id);
      banco.prepare('UPDATE usuarios SET foto_versao=? WHERE id=?').run(createHash('sha256').update(foto).digest('hex').slice(0,20),id);
    }
    banco.exec(`
      CREATE TABLE IF NOT EXISTS conversas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_menor INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        usuario_maior INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        criado_em TEXT NOT NULL DEFAULT (datetime('now')),
        CHECK(usuario_menor < usuario_maior),
        UNIQUE(usuario_menor, usuario_maior)
      );
      CREATE TABLE IF NOT EXISTS mensagens_diretas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversa_id INTEGER NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        autor TEXT NOT NULL,
        iniciais TEXT NOT NULL DEFAULT '',
        texto TEXT NOT NULL,
        client_id TEXT,
        hora TEXT NOT NULL DEFAULT '',
        criado_em TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE UNIQUE INDEX IF NOT EXISTS mensagens_diretas_envio_unico ON mensagens_diretas(usuario_id, client_id) WHERE client_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS mensagens_diretas_cursor ON mensagens_diretas(conversa_id, id);
      CREATE INDEX IF NOT EXISTS conversas_destinatario ON conversas(usuario_maior);
    `);
  })();
}
