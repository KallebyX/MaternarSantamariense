import { readFileSync } from 'node:fs';
import { db } from './connection.js';

export const historicoProjetos = JSON.parse(readFileSync(new URL('../../seeds/PROJETOS_HISTORICOS_20260929.json', import.meta.url), 'utf8'));

/** Importa somente os campos publicáveis, conservando situação e período da fonte. */
export function importarProjetosHistoricos() {
  if (db.prepare('SELECT 1 FROM app_meta WHERE chave=?').get(historicoProjetos.chave)) return null;
  return db.transaction(() => {
    const resultado = { inseridos: 0, preservados: 0, referenciasAtuais: 0 };
    const inserir = db.prepare(`INSERT INTO projetos
      (id,titulo,responsavel,instituicao,local,inicio,fim,status,autorizacao,ano_referencia,historico,situacao_origem,periodo_origem)
      VALUES (@id,@titulo,@responsavel,@instituicao,@local,@inicio,@fim,@status,@autorizacao,@ano_referencia,@historico,@situacao_origem,@periodo_origem)`);
    const existe = db.prepare('SELECT 1 FROM projetos WHERE id=?');
    for (const projeto of historicoProjetos.projetos) {
      if (existe.get(projeto.id)) {
        resultado.preservados++;
        continue;
      }
      inserir.run(projeto);
      resultado.inseridos++;
    }
    const referencia = db.prepare('UPDATE projetos SET ano_referencia=? WHERE id=? AND ano_referencia IS NULL');
    for (const atual of historicoProjetos.referenciasAtuais) resultado.referenciasAtuais += referencia.run(atual.ano_referencia, atual.id).changes;
    db.prepare('INSERT INTO app_meta(chave,valor) VALUES (?,?)').run(historicoProjetos.chave, JSON.stringify(resultado));
    return resultado;
  })();
}
