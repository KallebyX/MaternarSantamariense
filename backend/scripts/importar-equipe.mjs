// Entrada privada JSON por stdin; nunca gravar senhas ou CPFs em seeds/versionamento.
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import { db, registrarLog } from '../src/db/connection.js';
import { emailValido, senhaFraca } from '../src/lib/http.js';

export function importarEquipe(linhas, { simular = false } = {}) {
  if (!Array.isArray(linhas) || !linhas.length) throw new Error('Informe uma lista de cadastros.');
  const emails = new Set();
  const preparados = linhas.map((r, i) => {
    const email = String(r.email || '').trim().toLowerCase();
    const nome = String(r.nome || '').trim();
    const cpf = String(r.cpf || '').replace(/\D/g, '');
    if (!nome || !emailValido(email) || emails.has(email)) throw new Error(`Cadastro ${i + 1}: nome/e-mail inválido ou repetido.`);
    if (cpf && !/^\d{11}$/.test(cpf)) throw new Error(`Cadastro ${i + 1}: CPF deve conter 11 dígitos.`);
    if (senhaFraca(r.senha)) throw new Error(`Cadastro ${i + 1}: senha não atende aos requisitos.`);
    emails.add(email);
    const existente = db.prepare('SELECT id, cpf FROM usuarios WHERE email = ?').get(email);
    if (existente?.cpf && existente.cpf !== cpf) throw new Error(`Cadastro ${i + 1}: CPF diverge do cadastro existente.`);
    if (cpf && db.prepare('SELECT 1 FROM usuarios WHERE cpf = ? AND email != ?').get(cpf, email)) throw new Error(`Cadastro ${i + 1}: CPF vinculado a outro e-mail.`);
    return { nome, email, cpf, cargo: String(r.cargo || '').trim(), unidade: String(r.unidade || '').trim(),
      formacao: String(r.formacao || '').trim(), iniciais: nome.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase(),
      senha: r.senha, existente: !!existente };
  });
  if (!simular) db.transaction(() => {
    const inserir = db.prepare(`INSERT INTO usuarios (nome,email,cpf,formacao,cargo,unidade,iniciais,senha_hash,perfil,situacao)
      VALUES (@nome,@email,@cpf,@formacao,@cargo,@unidade,@iniciais,@hash,'Profissional','Ativo')`);
    for (const p of preparados) {
      // Reexecução não reseta senha, perfil, situação ou edições já feitas pelo usuário.
      if (!p.existente) inserir.run({ ...p, hash: bcrypt.hashSync(p.senha, 12) });
    }
    registrarLog('importacao-local', 'importar-equipe', `${preparados.filter(p => !p.existente).length} novos cadastros`);
  })();
  return preparados.map(({ nome, existente }) => ({ nome, resultado: existente ? 'já cadastrado; preservado' : simular ? 'pronto para importar' : 'criado' }));
}
if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  try {
    console.log(JSON.stringify(importarEquipe(JSON.parse(readFileSync(0, 'utf8')), { simular: process.argv.includes('--simular') }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { db.close(); }
}
