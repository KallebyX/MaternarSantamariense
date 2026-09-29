// CRUD genérico declarativo.
//
// Cada recurso descreve tabela, campos e quem pode escrever; daqui saem as cinco
// rotas REST (listar, obter, criar, atualizar, remover) com validação, log e
// respostas no mesmo formato do resto da API. Leitura é pública por padrão
// (o protótipo e a landing consomem sem token); escrita exige Gestor/Admin.
import { db, registrarLog } from '../db/connection.js';
import { autenticar, exigirPapel } from '../auth/middleware.js';
import { erro, ok, urlValida } from './http.js';

export const GESTAO = ['Gestor', 'Administrador'];

/** Converte o valor recebido no corpo para o formato gravado na coluna. */
function converter(campo, valor) {
  switch (campo.tipo) {
    case 'int': {
      const n = Number(valor);
      return Number.isFinite(n) ? Math.trunc(n) : 0;
    }
    case 'int-nulo': {
      if (valor === '' || valor === null || valor === undefined) return null;
      const n = Number(valor);
      return Number.isFinite(n) ? Math.trunc(n) : null;
    }
    case 'bool':
      return valor === true || valor === 1 || valor === '1' || valor === 'true' ? 1 : 0;
    case 'json':
      return JSON.stringify(Array.isArray(valor) ? (campo.itens === 'int' ? valor.map(Number) : valor) : []);
    default:
      return String(valor ?? '').trim();
  }
}

/** Valor gravado quando o campo não vem no corpo de um POST. */
function padrao(campo) {
  if (typeof campo.padrao === 'function') return campo.padrao();
  if (campo.padrao !== undefined) return campo.padrao;
  if (campo.tipo === 'int-nulo') return null;
  return converter(campo, campo.tipo === 'json' ? [] : '');
}

/**
 * Traduz violações de restrição do SQLite em respostas 409 legíveis.
 * Devolve a mensagem quando reconhece o erro; relança o que não for de restrição.
 */
function mensagemDeRestricao(err) {
  const codigo = err?.code || '';
  if (!codigo.startsWith('SQLITE_CONSTRAINT')) throw err;
  if (codigo.includes('UNIQUE')) return 'Já existe um registro com estes dados (valor duplicado).';
  if (codigo.includes('FOREIGNKEY')) return 'Registro vinculado inexistente ou ainda em uso.';
  if (codigo.includes('CHECK')) return 'Valor fora das opções aceitas para este campo.';
  if (codigo.includes('NOTNULL')) return 'Campo obrigatório não informado.';
  return 'Não foi possível gravar: restrição do banco de dados.';
}

/** Lê e valida os campos do corpo. `parcial` ignora o que não foi enviado (PUT). */
function lerCorpo(recurso, corpo, parcial) {
  const dados = {};
  for (const [nome, campo] of Object.entries(recurso.campos)) {
    const bruto = corpo?.[nome];
    if (bruto === undefined) {
      if (parcial) continue;
      if (campo.obrigatorio) return { mensagem: `Campo obrigatório: ${nome}` };
      dados[nome] = padrao(campo);
      continue;
    }
    if (campo.obrigatorio && String(bruto ?? '').trim() === '') {
      return { mensagem: `Campo obrigatório: ${nome}` };
    }
    if (!campo.tipo && typeof bruto !== 'string') return { mensagem: `Campo de texto inválido: ${nome}.` };
    if (['int', 'int-nulo'].includes(campo.tipo) && bruto !== null && !['number', 'string'].includes(typeof bruto)) return { mensagem: `Valor numérico inválido em ${nome}.` };
    if (campo.valores && !campo.valores.includes(String(bruto))) {
      return { mensagem: `Valor inválido em ${nome}. Use: ${campo.valores.join(', ')}` };
    }
    if (campo.tipo === 'json' && (!Array.isArray(bruto) || bruto.some(v => campo.itens === 'int' ? !Number.isInteger(Number(v)) || Number(v) < 1 : typeof v !== 'string'))) return { mensagem: `Lista inválida em ${nome}.` };
    if (campo.tipo === 'bool' && ![true,false,0,1,'0','1','true','false'].includes(bruto)) return { mensagem: `Valor booleano inválido em ${nome}.` };
    if (campo.tipo === 'int-nulo' && bruto !== '' && bruto !== null && (!Number.isInteger(Number(bruto)) || Number(bruto) < 1)) return { mensagem: `Identificador inválido em ${nome}.` };
    if (['url', 'capa'].includes(nome) && !urlValida(bruto)) return { mensagem: `Endereço inválido em ${nome}.` };
    if (campo.tipo === 'int' && (bruto === null || !Number.isSafeInteger(Number(bruto)) || Number(bruto) < (campo.minimo ?? 0) || (campo.maximo !== undefined && Number(bruto) > campo.maximo))) {
      return { mensagem: `Valor numérico inválido em ${nome}.` };
    }
    dados[nome] = converter(campo, bruto);
  }
  return { dados };
}

/** Aplica o `saida` do recurso (ex.: desserializar JSON) na linha do banco. */
function apresentar(recurso, linha) {
  if (!linha) return linha;
  const pronto = { ...linha };
  for (const [nome, campo] of Object.entries(recurso.campos)) {
    if (campo.tipo === 'json' && typeof pronto[nome] === 'string') {
      try { pronto[nome] = JSON.parse(pronto[nome]); } catch { pronto[nome] = []; }
    }
    if (campo.tipo === 'bool') pronto[nome] = !!pronto[nome];
  }
  return recurso.saida ? recurso.saida(pronto) : pronto;
}

/**
 * Registra as rotas REST do recurso no router.
 *
 * @param {import('express').Router} router
 * @param {object} recurso
 *   rota      caminho REST (sem barra inicial)
 *   tabela    tabela do SQLite
 *   chave     coluna da chave primária (padrão 'id')
 *   prefixo   quando presente, a chave é TEXT e o id é gerado com este prefixo
 *   campos    { nome: { tipo, obrigatorio, valores, padrao } }
 *   ordem     cláusula ORDER BY
 *   busca     colunas varridas pelo parâmetro ?q=
 *   filtros   colunas aceitas como filtro exato na query string
 *   papeis    perfis que podem escrever (padrão Gestor/Administrador)
 *   leituraAutenticada  exige token também no GET
 *   metodos   subconjunto de listar/obter/criar/atualizar/remover a registrar
 *   saida     transforma a linha antes de devolver
 *   aoRemover callback executado antes do DELETE (limpeza de arquivos etc.)
 */
export function registrarCrud(router, recurso) {
  const {
    rota, tabela, chave = 'id', campos, ordem = chave,
    busca = [], filtros = [], papeis = GESTAO, leituraAutenticada = false,
    metodos = ['listar', 'obter', 'criar', 'atualizar', 'remover'],
  } = recurso;
  const nomes = Object.keys(campos);
  const escrita = [autenticar, exigirPapel(...papeis)];
  const leitura = recurso.leituraPapeis ? [autenticar, exigirPapel(...recurso.leituraPapeis)] : leituraAutenticada ? [autenticar] : [];
  const tem = m => metodos.includes(m);
  const buscarPorId = id => db.prepare(`SELECT * FROM ${tabela} WHERE ${chave} = ?`).get(id);

  /** Id de tabelas com chave TEXT (cursos, documentos, protocolos…). */
  const gerarId = corpo => {
    const informado = String(corpo?.[chave] || '').trim();
    if (informado && /^[a-zA-Z0-9_-]{1,40}$/.test(informado) && !buscarPorId(informado)) return informado;
    for (let tentativa = 0; tentativa < 20; tentativa++) {
      const id = recurso.prefixo + Date.now().toString(36) + tentativa.toString(36);
      if (!buscarPorId(id)) return id;
    }
    return recurso.prefixo + Math.random().toString(36).slice(2, 10);
  };

  if (tem('listar')) router.get(`/${rota}`, ...leitura, (req, res) => {
    let linhas = db.prepare(`SELECT * FROM ${tabela} ORDER BY ${ordem}`).all().map(l => apresentar(recurso, l));
    for (const filtro of filtros) {
      const valor = req.query[filtro];
      if (valor !== undefined && valor !== '') linhas = linhas.filter(l => String(l[filtro]) === String(valor));
    }
    const q = String(req.query.q || '').toLowerCase().trim();
    if (q && busca.length) {
      linhas = linhas.filter(l => busca.some(c => {
        const v = l[c];
        return Array.isArray(v)
          ? v.some(item => String(item).toLowerCase().includes(q))
          : String(v ?? '').toLowerCase().includes(q);
      }));
    }
    return ok(res, linhas, { total: linhas.length });
  });

  if (tem('obter')) router.get(`/${rota}/:id`, ...leitura, (req, res) => {
    const linha = buscarPorId(req.params.id);
    if (!linha) return erro(res, 404, 'Registro não encontrado.');
    return ok(res, apresentar(recurso, linha));
  });

  if (tem('criar')) router.post(`/${rota}`, ...escrita, (req, res) => {
    const { dados, mensagem } = lerCorpo(recurso, req.body, false);
    if (mensagem) return erro(res, 400, mensagem);
    if (recurso.validar) {
      const problema = recurso.validar(dados, req);
      if (problema) return erro(res, 400, problema);
    }
    const colunas = [...nomes];
    const valores = nomes.map(n => dados[n]);
    let id = null;
    if (recurso.prefixo) {
      id = gerarId(req.body);
      colunas.unshift(chave);
      valores.unshift(id);
    }
    let info;
    try {
      info = db.transaction(() => {
        const resultado = db.prepare(
          `INSERT INTO ${tabela} (${colunas.join(', ')}) VALUES (${colunas.map(() => '?').join(', ')})`,
        ).run(...valores);
        recurso.aposCriar?.(buscarPorId(id ?? resultado.lastInsertRowid));
        return resultado;
      })();
    } catch (err) {
      return erro(res, 409, mensagemDeRestricao(err));
    }
    if (!recurso.prefixo) id = info.lastInsertRowid;
    registrarLog(req.usuario.email, `criar-${rota}`, String(dados.titulo || dados.nome || id));
    return res.status(201).json({ ok: true, dados: apresentar(recurso, buscarPorId(id)), erro: null });
  });

  if (tem('atualizar')) router.put(`/${rota}/:id`, ...escrita, (req, res) => {
    const atual = buscarPorId(req.params.id);
    if (!atual) return erro(res, 404, 'Registro não encontrado.');
    const { dados, mensagem } = lerCorpo(recurso, req.body, true);
    if (mensagem) return erro(res, 400, mensagem);
    const alterar = Object.keys(dados);
    if (!alterar.length) return erro(res, 400, 'Envie ao menos um campo para atualizar.');
    if (recurso.validar) {
      const problema = recurso.validar({ ...atual, ...dados }, req);
      if (problema) return erro(res, 400, problema);
    }
    try {
      db.transaction(() => {
        db.prepare(`UPDATE ${tabela} SET ${alterar.map(c => `${c} = ?`).join(', ')} WHERE ${chave} = ?`)
          .run(...alterar.map(c => dados[c]), req.params.id);
        recurso.aposAtualizar?.(atual, dados);
      })();
    } catch (err) {
      return erro(res, 409, mensagemDeRestricao(err));
    }
    registrarLog(req.usuario.email, `atualizar-${rota}`, req.params.id);
    return ok(res, apresentar(recurso, buscarPorId(req.params.id)));
  });

  if (tem('remover')) router.delete(`/${rota}/:id`, ...escrita, (req, res) => {
    const linha = buscarPorId(req.params.id);
    if (!linha) return erro(res, 404, 'Registro não encontrado.');
    if (recurso.aoRemover) {
      const problema = recurso.aoRemover(linha, req);
      if (problema) return erro(res, 409, problema);
    }
    try {
      db.transaction(() => {
        recurso.antesRemover?.(linha);
        db.prepare(`DELETE FROM ${tabela} WHERE ${chave} = ?`).run(req.params.id);
        recurso.aposRemover?.(linha);
      })();
    } catch (err) {
      return erro(res, 409, mensagemDeRestricao(err));
    }
    registrarLog(req.usuario.email, `remover-${rota}`, String(linha.titulo || linha.nome || req.params.id));
    return ok(res, { removido: req.params.id });
  });
}

/** Registra vários recursos de uma vez. */
export function registrarCruds(router, recursos) {
  for (const recurso of recursos) registrarCrud(router, recurso);
  return router;
}
