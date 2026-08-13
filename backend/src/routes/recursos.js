// Declaração dos recursos com CRUD completo (listar, obter, criar, atualizar,
// remover). Tudo o que o painel administra passa por aqui; as rotas legadas de
// conteudo.js seguem existindo para o que tem regra própria (id sequencial de
// projeto, contadores de produto, busca global).
import { Router } from 'express';
import { registrarCruds } from '../lib/crud.js';

const TIPOS_QUALIFICA = ['Capacitações online', 'Capacitações presenciais', 'Capacitações livres'];
const anoAtual = () => new Date().getFullYear();

export const RECURSOS = [
  {
    rota: 'politicas', tabela: 'politicas', ordem: 'ordem, nome',
    busca: ['nome', 'descricao'],
    metodos: ['obter', 'criar', 'atualizar', 'remover'], // GET /politicas vem de conteudo.js (traz materiais)
    campos: {
      nome: { obrigatorio: true },
      cor: { padrao: '#153A62' },
      descricao: {},
      ordem: { tipo: 'int' },
    },
  },
  {
    rota: 'materiais', tabela: 'materiais', ordem: 'politica_id, titulo',
    busca: ['titulo', 'tipo', 'tags'], filtros: ['politica_id'],
    campos: {
      politica_id: { tipo: 'int', obrigatorio: true },
      titulo: { obrigatorio: true },
      tipo: { padrao: 'Material' },
      url: { obrigatorio: true },
      tags: { tipo: 'json' },
    },
  },
  {
    rota: 'cursos', tabela: 'cursos', prefixo: 'c', ordem: 'titulo',
    busca: ['titulo', 'area', 'tag', 'descricao'], filtros: ['area', 'nivel'],
    metodos: ['obter', 'criar', 'atualizar', 'remover'], // GET /cursos vem de aprendizagem.js (traz aulas)
    campos: {
      titulo: { obrigatorio: true },
      area: { obrigatorio: true },
      horas: { tipo: 'int', padrao: 1 },
      nivel: { padrao: 'Básico' },
      tag: {},
      inscritos: { tipo: 'int' },
      descricao: {},
      capa: {},
    },
  },
  {
    rota: 'aulas', tabela: 'aulas', ordem: 'curso_id, ordem',
    busca: ['titulo'], filtros: ['curso_id'],
    campos: {
      curso_id: { obrigatorio: true },
      ordem: { tipo: 'int' },
      titulo: { obrigatorio: true },
      duracao: {},
      url: {},
    },
  },
  {
    rota: 'qualifica-modulos', tabela: 'qualifica_modulos', ordem: 'id',
    busca: ['titulo', 'descricao'], filtros: ['tipo'],
    campos: {
      titulo: { obrigatorio: true },
      descricao: {},
      aulas: { tipo: 'int' },
      duracao: {},
      nivel: {},
      cor: { padrao: '#153A62' },
      tipo: { padrao: 'Capacitações livres', valores: TIPOS_QUALIFICA },
      url: {},
    },
  },
  {
    rota: 'qualifica-recursos', tabela: 'qualifica_recursos', ordem: 'modulo_id, id',
    busca: ['titulo', 'fonte'], filtros: ['modulo_id'],
    campos: {
      modulo_id: { tipo: 'int', obrigatorio: true },
      titulo: { obrigatorio: true },
      tipo: {},
      url: { obrigatorio: true },
      fonte: {},
    },
  },
  {
    rota: 'trilhas', tabela: 'trilhas', ordem: 'nome',
    busca: ['nome', 'descricao'],
    campos: {
      nome: { obrigatorio: true },
      descricao: {},
      modulos: { tipo: 'json' },
    },
  },
  {
    rota: 'produtos', tabela: 'produtos', ordem: 'ano DESC, id',
    busca: ['titulo', 'descricao', 'tipo'], filtros: ['tipo', 'ano'],
    metodos: ['obter', 'criar', 'atualizar', 'remover'], // GET /produtos vem de conteudo.js (selo "mais baixado")
    campos: {
      tipo: { obrigatorio: true },
      ano: { tipo: 'int', padrao: anoAtual },
      titulo: { obrigatorio: true },
      descricao: {},
      url: {},
      capa: {},
    },
  },
  {
    rota: 'documentos', tabela: 'documentos', prefixo: 'd', ordem: 'criado_em DESC',
    busca: ['titulo', 'descricao', 'tags'], filtros: ['categoria', 'setor', 'status'],
    metodos: ['obter', 'atualizar', 'remover'], // GET/POST /documentos vêm de conteudo.js
    campos: {
      titulo: { obrigatorio: true },
      tipo: { padrao: 'Documento' },
      categoria: {},
      setor: {},
      autor: {},
      status: { padrao: 'Em revisão', valores: ['Aprovado', 'Em revisão', 'Vencido'] },
      versao: {},
      atualizado: {},
      expira: {},
      tamanho: {},
      tags: { tipo: 'json' },
      descricao: {},
      url: {},
    },
  },
  {
    rota: 'protocolos', tabela: 'protocolos', prefixo: 'pr', ordem: 'nome',
    busca: ['nome', 'setor'], filtros: ['setor'],
    metodos: ['obter', 'criar', 'atualizar', 'remover'], // GET /protocolos vem de conteudo.js
    campos: {
      nome: { obrigatorio: true },
      versao: {},
      setor: {},
      atualizado: {},
      paginas: { tipo: 'int' },
      prazo: {},
      pendente: { tipo: 'bool' },
      url: {},
    },
  },
  {
    rota: 'links', tabela: 'links', ordem: 'categoria, titulo',
    busca: ['titulo', 'categoria', 'descricao'], filtros: ['categoria'],
    metodos: ['obter', 'criar', 'atualizar', 'remover'], // GET /links vem de conteudo.js
    campos: {
      titulo: { obrigatorio: true },
      url: { obrigatorio: true },
      categoria: {},
      descricao: {},
    },
  },
  {
    rota: 'eventos', tabela: 'eventos', ordem: 'mes, dia, hora',
    busca: ['titulo', 'local'], filtros: ['mes'],
    metodos: ['obter', 'atualizar', 'remover'], // GET/POST /eventos vêm de conteudo.js
    campos: {
      dia: { tipo: 'int', obrigatorio: true },
      mes: { tipo: 'int', padrao: 8 },
      hora: { obrigatorio: true },
      titulo: { obrigatorio: true },
      local: {},
      cor: { padrao: '#1E4A7A' },
    },
    validar: d => {
      if (d.dia < 1 || d.dia > 31) return 'Dia inválido.';
      if (d.mes < 1 || d.mes > 12) return 'Mês inválido.';
      return null;
    },
  },
  {
    rota: 'projetos', tabela: 'projetos', ordem: 'criado_em DESC',
    metodos: ['obter', 'atualizar', 'remover'], // GET/POST /projetos vêm de conteudo.js
    campos: {
      titulo: { obrigatorio: true },
      responsavel: { obrigatorio: true },
      instituicao: {},
      local: {},
      inicio: {},
      fim: {},
      status: { padrao: 'Ativo', valores: ['Ativo', 'Encerrado'] },
      autorizacao: {},
    },
  },
  {
    rota: 'conquistas', tabela: 'conquistas', ordem: 'nivel, nome',
    busca: ['nome', 'descricao'],
    metodos: ['obter', 'criar', 'atualizar', 'remover'], // GET /conquistas vem de aprendizagem.js
    campos: {
      nome: { obrigatorio: true },
      descricao: {},
      cor: { padrao: '#153A62' },
      nivel: { tipo: 'int', padrao: 1 },
    },
  },
  {
    rota: 'canais', tabela: 'canais', prefixo: 'ch', ordem: 'nome',
    busca: ['nome', 'subtitulo'],
    metodos: ['obter', 'criar', 'atualizar', 'remover'], // GET /canais vem de aprendizagem.js
    campos: {
      nome: { obrigatorio: true },
      subtitulo: {},
    },
  },
  {
    rota: 'tarefas', tabela: 'tarefas', prefixo: 't', ordem: 'coluna, id',
    busca: ['titulo', 'responsavel'], filtros: ['coluna'],
    campos: {
      titulo: { obrigatorio: true },
      prioridade: { padrao: 'Média', valores: ['Alta', 'Média', 'Baixa'] },
      responsavel: {},
      prazo: {},
      coluna: { tipo: 'int' },
    },
  },
  {
    rota: 'notificacoes', tabela: 'notificacoes', ordem: 'id DESC',
    busca: ['titulo', 'texto'],
    metodos: ['criar', 'remover'], // GET /notificacoes é por usuário (aprendizagem.js)
    campos: {
      usuario_id: { tipo: 'int-nulo' }, // vazio = aviso para toda a rede
      titulo: { obrigatorio: true },
      texto: {},
    },
  },
];

export const recursosRouter = registrarCruds(Router(), RECURSOS);
