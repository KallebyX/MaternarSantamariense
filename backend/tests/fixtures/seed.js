import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import { db } from '../../src/db/connection.js';
import { seed as seedOperacional } from '../../src/db/seed.js';

const ler = nome => JSON.parse(readFileSync(new URL(nome + '.json', import.meta.url), 'utf8'));

// Não integra o contexto nem a imagem Docker. Só é importado pelos testes.
export function seed() {
  if (process.env.NODE_ENV !== 'test') throw new Error('Fixtures exigem NODE_ENV=test.');
  seedOperacional();
  if (db.prepare("SELECT 1 FROM app_meta WHERE chave='fixtures-teste'").get()) return;
  db.transaction(() => {
    const senha = bcrypt.hashSync('demo1234', 10);
    const inserir = db.prepare(`INSERT OR IGNORE INTO usuarios
      (nome,email,senha_hash,cargo,unidade,perfil,iniciais,coren,situacao)
      VALUES (?,?,?,?,?,?,?,?,?)`);
    for (const p of Object.values(ler('PERFIS'))) {
      inserir.run(p.nome,p.email,senha,p.cargo,p.unidade,p.perfil,p.iniciais,p.coren || '', 'Ativo');
    }
    for (const p of ler('USUARIOS')) {
      inserir.run(p.nome,p.email,senha,'',p.unidade,p.perfil,p.ini,'',p.situacao === 'Pendente' ? 'Pendente' : 'Ativo');
    }
    for (const c of ler('CURSOS')) {
      db.prepare('INSERT INTO cursos(id,titulo,area,horas,nivel,tag,descricao) VALUES (?,?,?,?,?,?,?)')
        .run(c.id,c.titulo,c.area,c.horas,c.nivel,c.tag,c.desc);
      c.aulas.forEach((a,i) => db.prepare('INSERT INTO aulas(curso_id,ordem,titulo,duracao) VALUES (?,?,?,?)').run(c.id,i,a.t,a.d));
    }
    for (const e of ler('EVENTOS')) db.prepare('INSERT INTO eventos(dia,mes,hora,titulo,local,cor) VALUES (?,?,?,?,?,?)').run(e.dia,e.dia <= 3 ? 8 : 7,e.hora,e.t,e.local,e.cor);
    for (const [canal,mensagens] of Object.entries(ler('MSGS'))) {
      for (const m of mensagens) db.prepare('INSERT INTO mensagens(canal_id,autor,iniciais,texto,hora) VALUES (?,?,?,?,?)').run(canal,m.q,m.i,m.t,m.h);
    }
    for (const n of ler('NOTIFS_SEED')) db.prepare('INSERT INTO notificacoes(titulo,texto) VALUES (?,?)').run(n.t,n.q);
    db.prepare("INSERT INTO app_meta(chave,valor) VALUES ('fixtures-teste','1')").run();
  })();
}
