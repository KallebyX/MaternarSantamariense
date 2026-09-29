// Provisionamento explícito. Não há contas administrativas com senha padrão.
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import { db } from '../src/db/connection.js';
import { emailValido, senhaFraca } from '../src/lib/http.js';
try {
  const { nome, email, senha, cargo = '', unidade = '', senhaTemporaria = true } = JSON.parse(readFileSync(0, 'utf8'));
  if (!nome || !emailValido(email) || senhaFraca(senha)) throw new Error('Nome, e-mail ou senha inválidos.');
  db.prepare(`INSERT INTO usuarios (nome,email,senha_hash,perfil,situacao,iniciais,cargo,unidade,senha_temporaria)
    VALUES (?,?,?,'Administrador','Ativo',?,?,?,?)`).run(nome.trim(), email.trim().toLowerCase(), bcrypt.hashSync(senha,12), nome.trim().split(/\s+/).slice(0,2).map(p=>p[0]).join(''),String(cargo),String(unidade),senhaTemporaria?1:0);
  console.log('Administrador criado.');
} catch (error) { console.error(error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 'E-mail já cadastrado. Nenhuma alteração realizada.' : error.message); process.exitCode=1; }
finally { db.close(); }
