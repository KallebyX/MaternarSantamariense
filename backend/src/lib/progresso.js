import { db } from '../db/connection.js';

export const XP_POR_AULA = 40;

/** Deve executar na transação que altera/remove o conteúdo. */
export function invalidarProgresso(cursoId, ordem) {
  const filtro = ordem === undefined ? 'curso_id = ?' : 'curso_id = ? AND aula_ordem = ?';
  const parametros = ordem === undefined ? [cursoId] : [cursoId, ordem];
  const afetados = db.prepare(`SELECT usuario_id, COUNT(*) total FROM progresso WHERE ${filtro} GROUP BY usuario_id`).all(...parametros);
  const atualizar = db.prepare('UPDATE usuarios SET xp = MAX(0, xp - ?) WHERE id = ?');
  for (const { usuario_id, total } of afetados) atualizar.run(total * XP_POR_AULA, usuario_id);
  db.prepare(`DELETE FROM progresso WHERE ${filtro}`).run(...parametros);
}
