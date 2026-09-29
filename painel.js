/* Painel de gestão do Maternar Santa-mariense.
 *
 * Interface administrativa ligada 100% à API (backend/): equipe e senhas,
 * biblioteca de arquivos enviados e CRUD completo de todo o conteúdo
 * (treinamentos, Qualifica, acervo por política, produtos do PPGSMI,
 * documentos, protocolos, links, eventos, projetos e avisos).
 *
 * Frontend estático servido pela API na UFN. Os ícones Lucide são SVGs locais;
 * o navegador não depende de um CDN ou de uma etapa de build.
 */
'use strict';

const API = '/api';
const CHAVE_TOKEN = 'maternar.token';
const CHAVE_USUARIO = 'maternar.usuario';

const sessao = {
  token: localStorage.getItem(CHAVE_TOKEN) || '',
  usuario: null,
  get gestor() { return ['Gestor', 'Administrador'].includes(this.usuario?.perfil); },
  get admin() { return this.usuario?.perfil === 'Administrador'; },
};
try { sessao.usuario = JSON.parse(localStorage.getItem(CHAVE_USUARIO) || 'null'); } catch { /* sessão inválida */ }

/* ------------------------------------------------------------------ API --- */

class ErroApi extends Error {
  constructor(mensagem, status) { super(mensagem); this.status = status; }
}

async function pedir(caminho, { metodo = 'GET', corpo, formulario } = {}) {
  if (metodo === 'GET' && /^\/cursos(?:\/[^/?]+)?$/.test(caminho)) caminho += '?gestao=1';
  const cabecalhos = {};
  if (sessao.token) cabecalhos.Authorization = 'Bearer ' + sessao.token;
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  let resposta;
  try {
    resposta = await fetch(API + caminho, {
      method: metodo,
      headers: cabecalhos,
      signal: AbortSignal.timeout(formulario ? 90000 : 15000),
      body: formulario || (corpo !== undefined ? JSON.stringify(corpo) : undefined),
    });
  } catch (erro) {
    throw new ErroApi(erro.name === 'TimeoutError' ? 'O servidor demorou a responder. Tente novamente.' : 'Não foi possível conectar ao servidor. Tente novamente.', 0);
  }
  let dados = null;
  try { dados = await resposta.json(); } catch { /* sem corpo JSON */ }
  if (resposta.status === 401 && sessao.token) {
    encerrarSessao('Sessão expirada. Entre novamente.');
    throw new ErroApi('Sessão expirada.', 401);
  }
  if (!resposta.ok) throw new ErroApi(dados?.erro || `Falha na requisição (${resposta.status}).`, resposta.status);
  return dados?.dados;
}

/* ------------------------------------------------------------- utilidades - */

/** Cria um elemento sem passar por innerHTML (nada de HTML vindo de dados). */
function el(tag, atributos = {}, filhos = []) {
  const no = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos)) {
    if (valor === undefined || valor === null || valor === false) continue;
    if (chave === 'texto') no.textContent = valor;
    else if (chave === 'classe') no.className = valor;
    else if (chave === 'estilo') no.setAttribute('style', valor);
    else if (chave.startsWith('on')) no.addEventListener(chave.slice(2), valor);
    else if (chave === 'dados') Object.assign(no.dataset, valor);
    else no.setAttribute(chave, valor === true ? '' : valor);
  }
  for (const filho of [].concat(filhos)) if (filho) no.append(filho);
  return no;
}

function recado(texto, tipo = 'ok') {
  const caixa = document.getElementById('recado');
  const nota = el('div', { classe: 'aviso ' + tipo, texto });
  caixa.append(nota);
  setTimeout(() => nota.remove(), 6000);
}

function avisoEm(alvo, texto, tipo = 'erro') {
  const destino = typeof alvo === 'string' ? document.getElementById(alvo) : alvo;
  destino.replaceChildren(texto ? el('div', { classe: 'aviso ' + tipo, texto }) : '');
}

const naoVazio = v => v !== undefined && v !== null && String(v).trim() !== '';

/**
 * Só devolve o endereço se for navegável: http(s) ou caminho relativo do próprio
 * servidor (uploads/, acervo/…). Barra javascript:, data: e afins vindos do banco.
 */
function enderecoSeguro(valor) {
  if (!valor) return null;
  try {
    const url = new URL(String(valor).trim(), location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

const formatarData = v => (v ? String(v).slice(0, 10).split('-').reverse().join('/') : '—');
const formatarBytes = b => {
  const n = Number(b) || 0;
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
};

async function confirmar(pergunta) {
  return window.confirm(pergunta);
}

/* ------------------------------------------------ declaração dos recursos - */

const NIVEIS = ['Básico', 'Intermediário', 'Avançado'];
const TIPOS_QUALIFICA = ['Capacitações online', 'Capacitações presenciais', 'Capacitações livres'];
const CATEGORIAS_ARQUIVO = ['Treinamento', 'Política', 'Material', 'Produto PPGSMI',
  'Qualifica Profissional', 'Protocolo', 'Documento', 'Outro'];

const RECURSOS = {
  cursos: {
    titulo: 'Cursos e treinamentos',
    descricao: 'Trilhas formais da plataforma. Cada curso recebe aulas em “Aulas dos cursos”; ao concluir todas, o profissional emite certificado.',
    rota: 'cursos', singular: 'curso', rotulo: r => r.titulo, categoriaArquivo: 'Treinamento',
    colunas: [
      { campo: 'id', rotulo: 'Código' },
      { campo: 'titulo', rotulo: 'Título' },
      { campo: 'area', rotulo: 'Área' },
      { campo: 'horas', rotulo: 'Horas' },
      { campo: 'nivel', rotulo: 'Nível', tipo: 'etiqueta' },
      { rotulo: 'Aulas', calculo: r => (r.aulas || []).length },
      { campo: 'situacao', rotulo: 'Publicação', tipo: 'etiqueta' },
      { campo: 'inscritos', rotulo: 'Participantes com progresso' },
    ],
    campos: [
      { nome: 'titulo', rotulo: 'Título', obrigatorio: true, largo: true },
      { nome: 'area', rotulo: 'Área', obrigatorio: true },
      { nome: 'horas', rotulo: 'Carga horária (h)', tipo: 'numero', obrigatorio: true },
      { nome: 'nivel', rotulo: 'Nível', tipo: 'selecao', opcoes: NIVEIS, permiteVazio: true, padrao: 'Básico' },
      { nome: 'tag', rotulo: 'Etiqueta' },
      { nome: 'publicado', rotulo: 'Publicar curso (todas as aulas devem ter conteúdo)', tipo: 'booleano' },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'area', largo: true },
      { nome: 'capa', rotulo: 'Capa (imagem)', tipo: 'arquivo', largo: true },
    ],
  },
  aulas: {
    titulo: 'Aulas dos cursos',
    descricao: 'Cadastre as aulas, envie seus arquivos e depois publique o curso em Cursos. Alterações de conteúdo retornam o curso a rascunho para revisão. A ordem começa em 0.',
    rota: 'aulas', singular: 'aula', rotulo: r => r.titulo, categoriaArquivo: 'Treinamento',
    colunas: [
      { campo: 'curso_id', rotulo: 'Curso', referencia: 'cursos' },
      { campo: 'ordem', rotulo: 'Ordem' },
      { campo: 'titulo', rotulo: 'Título' },
      { campo: 'duracao', rotulo: 'Duração' },
      { campo: 'url', rotulo: 'Arquivo', tipo: 'link' },
    ],
    campos: [
      { nome: 'curso_id', rotulo: 'Curso', tipo: 'ref', recurso: 'cursos', obrigatorio: true, largo: true },
      { nome: 'ordem', rotulo: 'Ordem (0, 1, 2…)', tipo: 'numero' },
      { nome: 'titulo', rotulo: 'Título da aula', obrigatorio: true },
      { nome: 'duracao', rotulo: 'Duração (ex.: 18 min)' },
      { nome: 'url', rotulo: 'Vídeo, PDF ou slides da aula', tipo: 'arquivo', largo: true },
    ],
  },
  'qualifica-modulos': {
    titulo: 'Qualifica Profissional — módulos',
    descricao: 'Capacitações online, presenciais e livres do Qualifica Profissional.',
    rota: 'qualifica-modulos', singular: 'módulo', rotulo: r => r.titulo,
    categoriaArquivo: 'Qualifica Profissional',
    colunas: [
      { campo: 'id', rotulo: '#' },
      { campo: 'titulo', rotulo: 'Módulo' },
      { campo: 'tipo', rotulo: 'Tipo', tipo: 'etiqueta' },
      { campo: 'aulas', rotulo: 'Aulas' },
      { campo: 'duracao', rotulo: 'Duração' },
      { campo: 'nivel', rotulo: 'Nível' },
    ],
    campos: [
      { nome: 'titulo', rotulo: 'Título', obrigatorio: true, largo: true },
      { nome: 'tipo', rotulo: 'Tipo de capacitação', tipo: 'selecao', opcoes: TIPOS_QUALIFICA, padrao: 'Capacitações livres' },
      { nome: 'aulas', rotulo: 'Quantidade de aulas', tipo: 'numero' },
      { nome: 'duracao', rotulo: 'Duração (ex.: 4h)' },
      { nome: 'nivel', rotulo: 'Nível', tipo: 'selecao', opcoes: NIVEIS, permiteVazio: true },
      { nome: 'cor', rotulo: 'Cor do cartão', tipo: 'cor' },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'area', largo: true },
      { nome: 'url', rotulo: 'Material principal', tipo: 'arquivo', largo: true },
    ],
  },
  'qualifica-recursos': {
    titulo: 'Qualifica Profissional — materiais',
    descricao: 'Vídeos, apostilas e links de cada módulo do Qualifica.',
    rota: 'qualifica-recursos', singular: 'material', rotulo: r => r.titulo,
    categoriaArquivo: 'Qualifica Profissional',
    colunas: [
      { campo: 'modulo_id', rotulo: 'Módulo', referencia: 'qualifica-modulos' },
      { campo: 'titulo', rotulo: 'Título' },
      { campo: 'tipo', rotulo: 'Tipo', tipo: 'etiqueta' },
      { campo: 'fonte', rotulo: 'Fonte' },
      { campo: 'url', rotulo: 'Acesso', tipo: 'link' },
    ],
    campos: [
      { nome: 'modulo_id', rotulo: 'Módulo', tipo: 'ref', recurso: 'qualifica-modulos', obrigatorio: true, largo: true },
      { nome: 'titulo', rotulo: 'Título', obrigatorio: true },
      { nome: 'tipo', rotulo: 'Tipo (Vídeo, Apostila, Link…)' },
      { nome: 'fonte', rotulo: 'Fonte / autoria' },
      { nome: 'url', rotulo: 'Arquivo ou endereço', tipo: 'arquivo', obrigatorio: true, largo: true },
    ],
  },
  trilhas: {
    titulo: 'Trilhas de formação',
    descricao: 'Sequências recomendadas de módulos do Qualifica por função na rede.',
    rota: 'trilhas', singular: 'trilha', rotulo: r => r.nome,
    colunas: [
      { campo: 'nome', rotulo: 'Trilha' },
      { campo: 'descricao', rotulo: 'Descrição' },
      { campo: 'modulos', rotulo: 'Módulos', tipo: 'lista' },
    ],
    campos: [
      { nome: 'nome', rotulo: 'Nome da trilha', obrigatorio: true, largo: true },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'area', largo: true },
      { nome: 'modulos', rotulo: 'Códigos dos módulos, separados por vírgula', tipo: 'tags', largo: true,
        dica: 'Use os números da coluna “#” em Qualifica — módulos.' },
    ],
  },
  politicas: {
    titulo: 'Áreas de política pública',
    descricao: 'Áreas que organizam o acervo (Saúde da Mulher, da Criança, Saúde Mental…). Remover uma área remove seus materiais.',
    rota: 'politicas', singular: 'área', rotulo: r => r.nome,
    colunas: [
      { campo: 'id', rotulo: '#' },
      { campo: 'nome', rotulo: 'Área' },
      { campo: 'ordem', rotulo: 'Ordem' },
      { rotulo: 'Materiais', calculo: r => (r.materiais || []).length },
      { campo: 'descricao', rotulo: 'Descrição' },
    ],
    campos: [
      { nome: 'nome', rotulo: 'Nome da área', obrigatorio: true, largo: true },
      { nome: 'cor', rotulo: 'Cor', tipo: 'cor' },
      { nome: 'ordem', rotulo: 'Ordem de exibição', tipo: 'numero' },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'area', largo: true },
    ],
  },
  materiais: {
    titulo: 'Materiais do acervo',
    descricao: 'Protocolos, cadernos, cartilhas e fluxogramas publicados em cada área de política pública.',
    rota: 'materiais', singular: 'material', rotulo: r => r.titulo, categoriaArquivo: 'Material',
    colunas: [
      { campo: 'politica_id', rotulo: 'Área', referencia: 'politicas' },
      { campo: 'titulo', rotulo: 'Título' },
      { campo: 'tipo', rotulo: 'Tipo', tipo: 'etiqueta' },
      { campo: 'tags', rotulo: 'Etiquetas', tipo: 'lista' },
      { campo: 'url', rotulo: 'Acesso', tipo: 'link' },
    ],
    campos: [
      { nome: 'politica_id', rotulo: 'Área de política pública', tipo: 'ref', recurso: 'politicas', obrigatorio: true, largo: true },
      { nome: 'titulo', rotulo: 'Título', obrigatorio: true, largo: true },
      { nome: 'tipo', rotulo: 'Tipo (Protocolo, Caderno, Cartilha…)' },
      { nome: 'tags', rotulo: 'Etiquetas de busca, separadas por vírgula', tipo: 'tags' },
      { nome: 'url', rotulo: 'Arquivo ou endereço', tipo: 'arquivo', obrigatorio: true, largo: true },
    ],
  },
  produtos: {
    titulo: 'Produtos e ferramentas',
    descricao: 'Aplicativos, portais e publicações, com contagem das aberturas e dos cliques de download na plataforma.',
    rota: 'produtos', singular: 'produto', rotulo: r => r.titulo, categoriaArquivo: 'Produto PPGSMI',
    colunas: [
      { campo: 'tipo', rotulo: 'Tipo', tipo: 'etiqueta' },
      { campo: 'ano', rotulo: 'Ano' },
      { campo: 'titulo', rotulo: 'Título' },
      { campo: 'visualizacoes', rotulo: 'Aberturas' },
      { campo: 'downloads', rotulo: 'Cliques em baixar' },
      { campo: 'url', rotulo: 'Arquivo', tipo: 'link' },
    ],
    campos: [
      { nome: 'titulo', rotulo: 'Título', obrigatorio: true, largo: true },
      { nome: 'tipo', rotulo: 'Tipo (E-book, Cartilha, Guia…)', obrigatorio: true },
      { nome: 'ano', rotulo: 'Ano', tipo: 'numero' },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'area', largo: true },
      { nome: 'url', rotulo: 'Arquivo do produto', tipo: 'arquivo', largo: true },
      { nome: 'capa', rotulo: 'Capa', tipo: 'arquivo', largo: true },
    ],
  },
  documentos: {
    titulo: 'Documentos e POPs',
    descricao: 'Documentos internos da rede com versão, setor responsável e situação de revisão.',
    rota: 'documentos', singular: 'documento', rotulo: r => r.titulo, categoriaArquivo: 'Documento',
    colunas: [
      { campo: 'titulo', rotulo: 'Título' },
      { campo: 'categoria', rotulo: 'Categoria' },
      { campo: 'setor', rotulo: 'Setor' },
      { campo: 'status', rotulo: 'Situação', tipo: 'etiqueta' },
      { campo: 'versao', rotulo: 'Versão' },
      { campo: 'atualizado', rotulo: 'Atualizado' },
      { campo: 'url', rotulo: 'Arquivo', tipo: 'link' },
    ],
    campos: [
      { nome: 'titulo', rotulo: 'Título', obrigatorio: true, largo: true },
      { nome: 'tipo', rotulo: 'Tipo' },
      { nome: 'categoria', rotulo: 'Categoria' },
      { nome: 'setor', rotulo: 'Setor' },
      { nome: 'autor', rotulo: 'Autor' },
      { nome: 'status', rotulo: 'Situação', tipo: 'selecao', opcoes: ['Aprovado', 'Em revisão', 'Vencido'], padrao: 'Em revisão' },
      { nome: 'versao', rotulo: 'Versão' },
      { nome: 'atualizado', rotulo: 'Atualizado em', tipo: 'data' },
      { nome: 'expira', rotulo: 'Expira em', tipo: 'data' },
      { nome: 'tags', rotulo: 'Etiquetas, separadas por vírgula', tipo: 'tags', largo: true },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'area', largo: true },
      { nome: 'url', rotulo: 'Arquivo', tipo: 'arquivo', largo: true },
    ],
  },
  protocolos: {
    titulo: 'Protocolos vigentes',
    descricao: 'Protocolos assistenciais da rede, com versão e sinalização de revisão pendente.',
    rota: 'protocolos', singular: 'protocolo', rotulo: r => r.nome, categoriaArquivo: 'Protocolo',
    colunas: [
      { campo: 'nome', rotulo: 'Protocolo' },
      { campo: 'setor', rotulo: 'Setor' },
      { campo: 'versao', rotulo: 'Versão' },
      { campo: 'paginas', rotulo: 'Páginas' },
      { campo: 'atualizado', rotulo: 'Atualizado' },
      { campo: 'pendente', rotulo: 'Revisão', tipo: 'bool', rotulosBool: ['Pendente', 'Em dia'] },
      { campo: 'url', rotulo: 'Arquivo', tipo: 'link' },
    ],
    campos: [
      { nome: 'nome', rotulo: 'Nome do protocolo', obrigatorio: true, largo: true },
      { nome: 'setor', rotulo: 'Setor' },
      { nome: 'versao', rotulo: 'Versão' },
      { nome: 'paginas', rotulo: 'Páginas', tipo: 'numero' },
      { nome: 'atualizado', rotulo: 'Atualizado em', tipo: 'data' },
      { nome: 'prazo', rotulo: 'Prazo de revisão' },
      { nome: 'pendente', rotulo: 'Revisão pendente', tipo: 'booleano' },
      { nome: 'url', rotulo: 'Arquivo do protocolo', tipo: 'arquivo', largo: true },
    ],
  },
  links: {
    titulo: 'Links úteis',
    descricao: 'Endereços externos e internos que a rede consulta com frequência.',
    rota: 'links', singular: 'link', rotulo: r => r.titulo,
    colunas: [
      { campo: 'titulo', rotulo: 'Título' },
      { campo: 'categoria', rotulo: 'Categoria', tipo: 'etiqueta' },
      { campo: 'url', rotulo: 'Endereço', tipo: 'link' },
      { campo: 'descricao', rotulo: 'Descrição' },
    ],
    campos: [
      { nome: 'titulo', rotulo: 'Título', obrigatorio: true, largo: true },
      { nome: 'url', rotulo: 'Endereço (https://…)', obrigatorio: true, largo: true },
      { nome: 'categoria', rotulo: 'Categoria' },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'area', largo: true },
    ],
  },
  eventos: {
    titulo: 'Agenda de eventos',
    descricao: 'Capacitações presenciais, rodas de conversa e reuniões da rede.',
    rota: 'eventos', singular: 'evento', rotulo: r => r.titulo,
    colunas: [
      { campo: 'dia', rotulo: 'Dia' },
      { campo: 'mes', rotulo: 'Mês' },
      { campo: 'ano', rotulo: 'Ano' },
      { campo: 'hora', rotulo: 'Hora' },
      { campo: 'titulo', rotulo: 'Evento' },
      { campo: 'local', rotulo: 'Local' },
    ],
    campos: [
      { nome: 'titulo', rotulo: 'Evento', obrigatorio: true, largo: true },
      { nome: 'dia', rotulo: 'Dia (1–31)', tipo: 'numero', obrigatorio: true },
      { nome: 'ano', rotulo: 'Ano', tipo: 'numero', obrigatorio: true, padrao: new Date().getFullYear() },
      { nome: 'mes', rotulo: 'Mês (1–12)', tipo: 'numero', obrigatorio: true, padrao: new Date().getMonth() + 1 },
      { nome: 'hora', rotulo: 'Hora (ex.: 14:00)', obrigatorio: true },
      { nome: 'local', rotulo: 'Local' },
      { nome: 'cor', rotulo: 'Cor', tipo: 'cor' },
    ],
  },
  projetos: {
    titulo: 'Projetos de pesquisa',
    descricao: 'Registros atuais e históricos do NEPeS. Consulte a situação e a autorização informadas na fonte de cada projeto.',
    rota: 'projetos', singular: 'projeto', rotulo: r => r.titulo,
    colunas: [
      { campo: 'titulo', rotulo: 'Projeto' },
      { campo: 'responsavel', rotulo: 'Responsável' },
      { campo: 'instituicao', rotulo: 'Instituição' },
      { campo: 'ano_referencia', rotulo: 'Ano da fonte' },
      { campo: 'historico', rotulo: 'Acervo', calculo: r => r.historico ? 'Histórico' : 'Atual' },
      { campo: 'status', rotulo: 'Situação', tipo: 'etiqueta' },
      { campo: 'situacao_origem', rotulo: 'Situação na fonte (AUT. CEP)' },
      { campo: 'periodo_origem', rotulo: 'Período na fonte' },
      { campo: 'autorizacao', rotulo: 'Autorização' },
    ],
    campos: [
      { nome: 'titulo', rotulo: 'Título do projeto', obrigatorio: true, largo: true },
      { nome: 'responsavel', rotulo: 'Responsável', obrigatorio: true },
      { nome: 'instituicao', rotulo: 'Instituição' },
      { nome: 'local', rotulo: 'Local de execução' },
      { nome: 'inicio', rotulo: 'Início' },
      { nome: 'fim', rotulo: 'Término' },
      { nome: 'status', rotulo: 'Situação', tipo: 'selecao', opcoes: ['Ativo', 'Encerrado', 'Histórico'], somenteEdicao: true },
      { nome: 'autorizacao', rotulo: 'Autorização NEPeS' },
    ],
  },
  notificacoes: {
    titulo: 'Avisos da coordenação',
    descricao: 'Avisos exibidos na plataforma. Sem destinatário, o aviso vale para toda a rede.',
    rota: 'notificacoes', rotaListagem: 'notificacoes/todas', singular: 'aviso',
    rotulo: r => r.titulo, semEdicao: true,
    colunas: [
      { campo: 'titulo', rotulo: 'Aviso' },
      { campo: 'texto', rotulo: 'Texto' },
      { campo: 'usuario_id', rotulo: 'Destinatário', referencia: 'usuarios', vazio: 'Toda a rede' },
      { campo: 'criado_em', rotulo: 'Publicado', tipo: 'data' },
    ],
    campos: [
      { nome: 'titulo', rotulo: 'Título do aviso', obrigatorio: true, largo: true },
      { nome: 'texto', rotulo: 'Mensagem', tipo: 'area', largo: true },
      { nome: 'usuario_id', rotulo: 'Destinatário (vazio = toda a rede)', tipo: 'ref', recurso: 'usuarios', largo: true },
    ],
  },
  conquistas: {
    titulo: 'Conquistas',
    descricao: 'Selos de gamificação exibidos no perfil dos profissionais.',
    rota: 'conquistas', singular: 'conquista', rotulo: r => r.nome,
    colunas: [
      { campo: 'nome', rotulo: 'Conquista' },
      { campo: 'nivel', rotulo: 'Nível' },
      { campo: 'descricao', rotulo: 'Descrição' },
    ],
    campos: [
      { nome: 'nome', rotulo: 'Nome', obrigatorio: true, largo: true },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'area', largo: true },
      { nome: 'cor', rotulo: 'Cor', tipo: 'cor' },
      { nome: 'nivel', rotulo: 'Nível', tipo: 'numero', obrigatorio: true, padrao: 1 },
    ],
  },
  canais: {
    titulo: 'Canais de comunicação',
    descricao: 'Canais por serviço usados na comunicação entre as equipes.',
    rota: 'canais', singular: 'canal', rotulo: r => r.nome,
    colunas: [
      { campo: 'id', rotulo: 'Código' },
      { campo: 'nome', rotulo: 'Canal' },
      { campo: 'subtitulo', rotulo: 'Descrição' },
      { campo: 'mensagens', rotulo: 'Mensagens' },
    ],
    campos: [
      { nome: 'nome', rotulo: 'Nome do canal', obrigatorio: true, largo: true },
      { nome: 'subtitulo', rotulo: 'Descrição curta', largo: true },
    ],
  },
  tarefas: {
    titulo: 'Tarefas da coordenação',
    descricao: 'Pendências internas do NEPeS, com prioridade e responsável.',
    rota: 'tarefas', singular: 'tarefa', rotulo: r => r.titulo,
    colunas: [
      { campo: 'titulo', rotulo: 'Tarefa' },
      { campo: 'prioridade', rotulo: 'Prioridade', tipo: 'etiqueta' },
      { campo: 'responsavel', rotulo: 'Responsável' },
      { campo: 'prazo', rotulo: 'Prazo' },
    ],
    campos: [
      { nome: 'titulo', rotulo: 'Tarefa', obrigatorio: true, largo: true },
      { nome: 'prioridade', rotulo: 'Prioridade', tipo: 'selecao', opcoes: ['Alta', 'Média', 'Baixa'], padrao: 'Média' },
      { nome: 'responsavel', rotulo: 'Responsável' },
      { nome: 'prazo', rotulo: 'Prazo' },
      { nome: 'coluna', rotulo: 'Coluna do quadro (0, 1, 2)', tipo: 'numero' },
    ],
  },
};

/** Menu lateral: cada entrada aponta para uma seção própria ou um recurso CRUD. */
const MENU = [
  { grupo: 'Início', itens: [
    { id: 'visao', rotulo: 'Visão geral', icone: 'layout-dashboard' },
    { id: 'perfil', rotulo: 'Meu perfil', icone: 'user-round' },
  ] },
  { grupo: 'Equipe', itens: [
    { id: 'equipe', rotulo: 'Equipe e senhas', icone: 'users-round' },
  ] },
  { grupo: 'Arquivos', itens: [
    { id: 'biblioteca', rotulo: 'Biblioteca de uploads', icone: 'folder-up' },
  ] },
  { grupo: 'Formação', itens: [
    { id: 'cursos', rotulo: 'Cursos', icone: 'graduation-cap' },
    { id: 'aulas', rotulo: 'Aulas dos cursos', icone: 'circle-play' },
    { id: 'qualifica-modulos', rotulo: 'Qualifica — módulos', icone: 'layers' },
    { id: 'qualifica-recursos', rotulo: 'Qualifica — materiais', icone: 'library-big' },
    { id: 'trilhas', rotulo: 'Trilhas', icone: 'route' },
  ] },
  { grupo: 'Acervo', itens: [
    { id: 'politicas', rotulo: 'Áreas de política', icone: 'landmark' },
    { id: 'materiais', rotulo: 'Materiais', icone: 'book-open' },
    { id: 'protocolos', rotulo: 'Protocolos', icone: 'clipboard-check' },
    { id: 'documentos', rotulo: 'Documentos e POPs', icone: 'files' },
    { id: 'links', rotulo: 'Links úteis', icone: 'link' },
  ] },
  { grupo: 'PPGSMI', itens: [
    { id: 'produtos', rotulo: 'Produtos', icone: 'package' },
    { id: 'projetos', rotulo: 'Projetos de pesquisa', icone: 'flask-conical' },
  ] },
  { grupo: 'Rede', itens: [
    { id: 'notificacoes', rotulo: 'Avisos', icone: 'bell' },
    { id: 'eventos', rotulo: 'Agenda', icone: 'calendar-days' },
    { id: 'canais', rotulo: 'Canais', icone: 'messages-square' },
    { id: 'conquistas', rotulo: 'Conquistas', icone: 'award' },
    { id: 'tarefas', rotulo: 'Tarefas', icone: 'list-checks' },
  ] },
  { grupo: 'Sistema', itens: [
    { id: 'registros', rotulo: 'Registros e backup', icone: 'database-backup', somenteAdmin: true },
  ] },
];

/* ------------------------------------------------------- caches de apoio -- */

const cache = { opcoes: new Map(), biblioteca: null };

function invalidarCache(recurso) {
  cache.opcoes.delete(recurso);
  if (recurso === 'arquivos') cache.biblioteca = null;
}

/** Opções de um campo de referência (curso, módulo, área, usuário). */
async function opcoesDe(nomeRecurso) {
  if (cache.opcoes.has(nomeRecurso)) return cache.opcoes.get(nomeRecurso);
  const rota = nomeRecurso === 'usuarios' ? '/usuarios' : '/' + (RECURSOS[nomeRecurso]?.rota || nomeRecurso);
  const rotulo = nomeRecurso === 'usuarios'
    ? (r => `${r.nome} — ${r.unidade || r.perfil}`)
    : (RECURSOS[nomeRecurso]?.rotulo || (r => r.titulo || r.nome || r.id));
  const lista = await pedir(rota);
  const opcoes = lista.map(r => ({ valor: String(r.id), texto: rotulo(r) }));
  cache.opcoes.set(nomeRecurso, opcoes);
  return opcoes;
}

async function biblioteca() {
  if (!cache.biblioteca) {
    cache.biblioteca = await pedir('/arquivos');
  }
  return cache.biblioteca;
}

/* -------------------------------------------------------- formulário modal */

const modal = document.getElementById('modal');
const formModal = document.getElementById('form-modal');
let aoSalvarModal = null;
let geracaoModal = 0, uploadsModal = 0;
modal.addEventListener('close', () => { geracaoModal++; aoSalvarModal = null; });

document.getElementById('modal-cancelar').addEventListener('click', () => modal.close());

formModal.addEventListener('submit', async evento => {
  evento.preventDefault();
  if (!aoSalvarModal || uploadsModal) return;
  const botao = document.getElementById('modal-salvar');
  botao.disabled = true;
  try {
    await aoSalvarModal();
  } catch (erro) {
    avisoEm('modal-aviso', erro.message);
  } finally {
    botao.disabled = false;
  }
});

/** Monta o controle de um campo conforme o tipo declarado. */
async function montarCampo(campo, valor) {
  valor ??= campo.padrao;
  const id = 'campo-' + campo.nome;
  const envolver = filho => el('div', { classe: campo.largo ? 'largo' : '' },
    [el('label', { for: id, texto: campo.rotulo + (campo.obrigatorio ? ' *' : '') }), filho,
      campo.dica ? el('div', { classe: 'mono', estilo: 'color:var(--texto-fraco);margin-top:5px;letter-spacing:.04em;text-transform:none;font-size:11.5px', texto: campo.dica }) : null]);

  if (campo.tipo === 'area') {
    return envolver(el('textarea', { id, name: campo.nome, required: campo.obrigatorio }, [valor ?? '']));
  }
  if (campo.tipo === 'selecao' || campo.tipo === 'ref') {
    const opcoes = campo.tipo === 'ref'
      ? await opcoesDe(campo.recurso)
      : campo.opcoes.map(o => ({ valor: o, texto: o }));
    const select = el('select', { id, name: campo.nome, required: campo.obrigatorio });
    if (!campo.obrigatorio && (campo.tipo === 'ref' || campo.permiteVazio)) {
      select.append(el('option', { value: '', texto: campo.tipo === 'ref' ? '— nenhum —' : '— não informado —' }));
    }
    for (const opcao of opcoes) {
      select.append(el('option', { value: opcao.valor, texto: opcao.texto, selected: String(valor ?? '') === opcao.valor }));
    }
    return envolver(select);
  }
  if (campo.tipo === 'booleano') {
    return el('div', { classe: campo.largo ? 'largo' : '' }, [
      el('label', { for: id, texto: campo.rotulo }),
      el('input', { id, name: campo.nome, type: 'checkbox', checked: !!valor }),
    ]);
  }
  if (campo.tipo === 'arquivo') return envolver(await montarCampoArquivo(campo, valor));

  const tipos = { numero: 'number', data: 'date', cor: 'color' };
  return envolver(el('input', {
    id, name: campo.nome, type: tipos[campo.tipo] || 'text',
    value: campo.tipo === 'tags' ? [].concat(valor || []).join(', ') : (valor ?? (campo.tipo === 'cor' ? '#153A62' : '')),
    required: campo.obrigatorio,
  }));
}

/**
 * Campo de arquivo: aceita endereço digitado, escolha de um upload já existente
 * ou envio de um arquivo novo — que é enviado na hora e preenche o endereço.
 */
async function montarCampoArquivo(campo, valor) {
  const entrada = el('input', { id: 'campo-' + campo.nome, name: campo.nome, type: 'text',
    value: valor ?? '', required: campo.obrigatorio, placeholder: 'uploads/arquivo.pdf ou https://…' });

  const escolher = el('select', { 'aria-label': 'Escolher arquivo para ' + campo.rotulo });
  escolher.append(el('option', { value: '', texto: '— escolher da biblioteca —' }));
  for (const arquivo of await biblioteca()) {
    escolher.append(el('option', { value: arquivo.url, texto: `${arquivo.titulo} (${arquivo.categoria})` }));
  }
  escolher.addEventListener('change', () => { if (escolher.value) entrada.value = escolher.value; });

  const situacao = el('span', { classe: 'mono', estilo: 'color:var(--texto-fraco);letter-spacing:.04em;text-transform:none' });
  const seletor = el('input', { type: 'file', 'aria-label': 'Enviar arquivo para ' + campo.rotulo });
  seletor.addEventListener('change', async () => {
    const arquivo = seletor.files?.[0];
    if (!arquivo) return;
    situacao.textContent = 'Enviando…';
    const geracao = geracaoModal;
    uploadsModal++;seletor.disabled=true;document.getElementById('modal-salvar').disabled=true;
    try {
      const enviado = await enviarArquivo(arquivo, {
        titulo: arquivo.name,
        categoria: campo.categoriaArquivo || 'Outro',
      });
      entrada.value = enviado.url;
      escolher.append(el('option', { value: enviado.url, texto: `${enviado.titulo} (${enviado.categoria})`, selected: true }));
      situacao.textContent = 'Enviado: ' + enviado.original;
    } catch (erro) {
      situacao.textContent = erro.message;
    } finally {
      seletor.value = '';seletor.disabled=false;
      if(geracao===geracaoModal){uploadsModal--;document.getElementById('modal-salvar').disabled=uploadsModal>0 || !aoSalvarModal;}
    }
  });

  return el('div', {}, [entrada, el('div', { classe: 'anexo' }, [escolher, seletor, situacao])]);
}

async function enviarArquivo(arquivo, { titulo, categoria, descricao }) {
  const formulario = new FormData();
  formulario.append('arquivo', arquivo);
  if (titulo) formulario.append('titulo', titulo);
  if (categoria) formulario.append('categoria', categoria);
  if (descricao) formulario.append('descricao', descricao);
  const enviado = await pedir('/arquivos', { metodo: 'POST', formulario });
  cache.biblioteca = null;
  return enviado;
}

/** Lê o formulário do modal aplicando a conversão de cada tipo de campo. */
function lerFormulario(campos) {
  const corpo = {};
  for (const campo of campos) {
    const entrada = formModal.elements[campo.nome];
    if (!entrada) continue;
    if (campo.tipo === 'ref' && entrada.value === '' && !campo.obrigatorio) corpo[campo.nome] = null;
    else if (campo.tipo === 'booleano') corpo[campo.nome] = entrada.checked;
    else if (campo.tipo === 'tags') {
      corpo[campo.nome] = entrada.value.split(',').map(t => t.trim()).filter(Boolean);
    } else if (campo.tipo === 'numero') {
      corpo[campo.nome] = entrada.value === '' ? (campo.padrao ?? 0) : Number(entrada.value);
    } else corpo[campo.nome] = entrada.value;
  }
  return corpo;
}

/**
 * Abre o modal de formulário.
 * @param {{titulo:string, grupo?:string, descricao?:string, campos:Array, registro?:object, salvar:Function}} opcoes
 */
async function abrirFormulario(opcoes) {
  const {titulo, grupo = '', descricao = '', campos, registro = {}, salvar, rotuloSalvar = 'Salvar'} = opcoes;
  const geracao = ++geracaoModal;
  aoSalvarModal = null; uploadsModal = 0;
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-grupo').textContent = grupo;
  document.getElementById('modal-descricao').textContent = descricao;
  const botao = document.getElementById('modal-salvar');
  botao.textContent = rotuloSalvar; botao.disabled = true;
  avisoEm('modal-aviso', '');
  const area = document.getElementById('modal-campos');
  area.replaceChildren(el('div', { classe: 'largo', texto: 'Carregando…' }));
  if (!modal.open) modal.showModal();
  try {
    const controles = [];
    for (const campo of campos) controles.push(await montarCampo(campo, registro[campo.nome]));
    if (geracao !== geracaoModal || !modal.open) return;
    area.replaceChildren(...controles);
    aoSalvarModal = async () => {
      await salvar(lerFormulario(campos));
      if (geracao === geracaoModal) modal.close();
    };
    botao.disabled = false;
    area.querySelector('input,select,textarea')?.focus();
  } catch (erro) {
    if (geracao !== geracaoModal || !modal.open) return;
    avisoEm('modal-aviso', erro.message);
    area.replaceChildren(el('button', { type: 'button', classe: 'btn btn-linha', texto: 'Tentar novamente', onclick: () => abrirFormulario(opcoes) }));
  }
}

/* ---------------------------------------------------------------- tabelas - */

/** Célula formatada segundo a declaração da coluna. */
function celula(coluna, registro, referencias) {
  if (coluna.calculo) return el('td', { texto: String(coluna.calculo(registro)) });
  const valor = registro[coluna.campo];
  if (coluna.referencia) {
    const mapa = referencias[coluna.referencia];
    const texto = naoVazio(valor) ? (mapa?.get(String(valor)) || `#${valor}`) : (coluna.vazio || '—');
    return el('td', {}, [el('span', { classe: 'celula', texto })]);
  }
  if (coluna.tipo === 'bool') {
    const [sim, nao] = coluna.rotulosBool || ['Sim', 'Não'];
    return el('td', {}, [el('span', { classe: 'etiqueta ' + (valor ? 'vermelha' : 'verde'), texto: valor ? sim : nao })]);
  }
  if (coluna.tipo === 'etiqueta') {
    return el('td', {}, [naoVazio(valor) ? el('span', { classe: 'etiqueta', texto: String(valor) }) : el('span', { texto: '—' })]);
  }
  if (coluna.tipo === 'lista') {
    const itens = [].concat(valor || []);
    return el('td', { texto: itens.length ? itens.join(', ') : '—' });
  }
  if (coluna.tipo === 'data') return el('td', { texto: formatarData(valor) });
  if (coluna.tipo === 'link') {
    const endereco = enderecoSeguro(valor);
    if (!endereco) return el('td', { texto: naoVazio(valor) ? 'endereço inválido' : '—' });
    return el('td', {}, [el('a', { href: endereco, target: '_blank', rel: 'noopener', texto: 'abrir' })]);
  }
  return el('td', {}, [el('span', { classe: 'celula', texto: naoVazio(valor) ? String(valor) : '—' })]);
}

/**
 * Tabela genérica.
 * @param {{colunas:Array, registros:Array, referencias?:object, acoes?:Function, vazio?:string}} opcoes
 */
function montarTabela({ colunas, registros, referencias = {}, acoes, vazio = 'Nenhum registro ainda.' }) {
  if (!registros.length) return el('div', { classe: 'vazio', texto: vazio });
  const cabecalho = el('tr', {}, colunas.map(c => el('th', { texto: c.rotulo })));
  if (acoes) cabecalho.append(el('th', { classe: 'acoes', texto: 'Ações' }));
  const corpo = el('tbody');
  for (const registro of registros) {
    const linha = el('tr', {}, colunas.map(c => celula(c, registro, referencias)));
    if (acoes) linha.append(el('td', { classe: 'acoes' }, acoes(registro)));
    corpo.append(linha);
  }
  return el('div', {}, [
    el('p', { classe: 'ajuda-tabela', texto: 'Deslize a tabela para ver todas as colunas e ações.' }),
    el('div', { classe: 'rolagem', tabindex: '0', role: 'region', 'aria-label': 'Tabela com rolagem horizontal' }, [el('table', {}, [el('thead', {}, [cabecalho]), corpo])]),
  ]);
}

/* ------------------------------------------------------- seções genéricas - */

const conteudo = () => document.getElementById('conteudo');
const LIMITE_INICIAL = 40;

/** Renderiza a seção CRUD de um recurso: filtro, tabela, novo/editar/remover. */
async function secaoRecurso(nome) {
  const spec = RECURSOS[nome];
  const alvo = conteudo();
  alvo.replaceChildren(el('div', { classe: 'vazio', texto: 'Carregando registros…' }));

  const referencias = {};
  for (const coluna of spec.colunas) {
    if (coluna.referencia && !referencias[coluna.referencia]) {
      referencias[coluna.referencia] = new Map((await opcoesDe(coluna.referencia)).map(o => [o.valor, o.texto]));
    }
  }

  const rotaListagem = '/' + (spec.rotaListagem || spec.rota);
  let registros = [];
  try {
    registros = await pedir(rotaListagem);
    if (!Array.isArray(registros)) throw new ErroApi('Não foi possível carregar os registros. Tente novamente.');
  } catch (erro) {
    if (!alvo.isConnected) return;
    alvo.replaceChildren(el('div', { classe: 'aviso erro', texto: erro.message }));
    alvo.append(el('button', { classe: 'btn btn-linha', texto: 'Tentar novamente', onclick: () => irPara(nome) }));
    return;
  }

  const filtro = el('input', { type: 'search', 'aria-label': `Buscar em ${spec.titulo.toLowerCase()}`, placeholder: `Buscar em ${spec.titulo.toLowerCase()}…` });
  const contador = el('span', { classe: 'mono', estilo: 'color:var(--texto-fraco)' });
  const area = el('div');
  let limite = LIMITE_INICIAL;
  const normalizarBusca = texto => String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
  const seletoresProjetos = new Map();
  const filtrosProjetos = nome === 'projetos' ? el('div', { classe: 'filtros-projetos' }) : null;
  const valoresProjetos = {
    ano_referencia: r => r.ano_referencia ? String(r.ano_referencia) : 'sem-ano',
    historico: r => r.historico ? 'historicos' : 'atuais',
    status: r => r.status,
    instituicao: r => normalizarBusca(r.instituicao),
    situacao_origem: r => normalizarBusca(r.situacao_origem),
  };
  if (filtrosProjetos) {
    filtro.placeholder = 'Título, responsável, instituição ou local';
    for (const [campo, rotulo] of [['ano_referencia', 'Ano da fonte'], ['historico', 'Acervo'], ['status', 'Situação do projeto'], ['instituicao', 'Instituição'], ['situacao_origem', 'Situação na fonte (AUT. CEP)']]) {
      const seletor = el('select', { 'aria-label': rotulo });
      seletoresProjetos.set(campo, seletor);
      seletor.addEventListener('change', () => { limite = LIMITE_INICIAL; desenhar(); });
      filtrosProjetos.append(el('label', {}, [el('span', { texto: rotulo }), seletor]));
    }
    filtrosProjetos.append(el('button', { classe: 'btn btn-linha', type: 'button', texto: 'Limpar filtros', onclick: () => {
      filtro.value = ''; for (const seletor of seletoresProjetos.values()) seletor.value = '';
      limite = LIMITE_INICIAL; desenhar();
    } }));
  }
  function atualizarFiltrosProjetos() {
    for (const [campo, seletor] of seletoresProjetos) {
      const atual = seletor.value;
      const opcoes = new Map(registros.map(r => [valoresProjetos[campo](r), campo === 'historico' ? (r.historico ? 'Registros históricos' : 'Registros atuais') : campo === 'ano_referencia' ? (r.ano_referencia || 'Ano não informado') : String(r[campo] ?? '').trim()]).filter(([valor]) => valor));
      if (atual && !opcoes.has(atual)) opcoes.set(atual, seletor.selectedOptions[0]?.textContent || atual);
      const ordenadas = [...opcoes].sort((a, b) => campo === 'ano_referencia' ? (Number(b[0]) || 0) - (Number(a[0]) || 0) : String(a[1]).localeCompare(String(b[1]), 'pt-BR'));
      seletor.replaceChildren(el('option', { value: '', texto: 'Todos' }), ...ordenadas.map(([valor, texto]) => el('option', { value: valor, texto: String(texto) })));
      seletor.value = atual;
    }
  }

  const campoTexto = registro => spec.colunas
    .map(c => (c.calculo ? c.calculo(registro) : registro[c.campo]))
    .concat(registro.id).join(' ').toLowerCase();

  function desenhar() {
    const termo = filtro.value.trim().toLowerCase();
    const filtrados = filtrosProjetos ? registros.filter(r =>
      normalizarBusca(termo).split(' ').filter(Boolean).every(t => normalizarBusca([r.titulo, r.responsavel, r.instituicao, r.local].join(' ')).includes(t)) &&
      [...seletoresProjetos].every(([campo, seletor]) => !seletor.value || valoresProjetos[campo](r) === seletor.value))
      : termo ? registros.filter(r => campoTexto(r).includes(termo)) : registros;
    const visiveis = filtrados.slice(0, limite);
    contador.textContent = filtrosProjetos ? `Exibindo ${visiveis.length} de ${filtrados.length} resultados · ${registros.length} no acervo` : `${filtrados.length} de ${registros.length}`;
    const tabela = montarTabela({
      colunas: spec.colunas, registros: visiveis, referencias,
      acoes: registro => [
        spec.semEdicao ? null : el('button', {
          classe: 'btn btn-mini btn-linha', texto: 'Editar',
          onclick: () => editar(registro),
        }),
        el('button', {
          classe: 'btn btn-mini btn-perigo', estilo: 'margin-left:6px', texto: 'Remover',
          onclick: () => remover(registro),
        }),
      ],
      vazio: termo || [...seletoresProjetos.values()].some(s => s.value) ? 'Nenhum registro corresponde aos filtros.' : 'Nenhum registro ainda. Use “Novo” para cadastrar.',
    });
    const extras = [tabela];
    if (filtrados.length > visiveis.length) {
      extras.push(el('button', {
        classe: 'btn btn-linha', estilo: 'margin-top:12px',
        texto: `Mostrar mais (${filtrados.length - visiveis.length} restantes)`,
        onclick: () => { limite += LIMITE_INICIAL; desenhar(); },
      }));
    }
    area.replaceChildren(...extras);
  }

  filtro.addEventListener('input', () => { limite = LIMITE_INICIAL; desenhar(); });

  async function recarregar() {
    invalidarCache(nome);
    registros = await pedir(rotaListagem);
    atualizarFiltrosProjetos();
    desenhar();
  }

  function camposDe(modo) {
    return spec.campos
      .filter(c => (modo === 'criar' ? !c.somenteEdicao : true))
      .map(c => ({ ...c, categoriaArquivo: c.categoriaArquivo || spec.categoriaArquivo }));
  }

  async function criar() {
    await abrirFormulario({
      grupo: spec.titulo, titulo: `Novo ${spec.singular}`, descricao: spec.descricao,
      campos: camposDe('criar'),
      rotuloSalvar: 'Cadastrar',
      salvar: async corpo => {
        await pedir('/' + spec.rota, { metodo: 'POST', corpo });
        await recarregar();
        recado(`${spec.singular[0].toUpperCase()}${spec.singular.slice(1)} cadastrado.`);
      },
    });
  }

  async function editar(registro) {
    await abrirFormulario({
      grupo: spec.titulo, titulo: `Editar ${spec.singular}`, descricao: spec.rotulo(registro),
      campos: camposDe('editar').map(c => nome === 'projetos' && registro.historico && c.nome === 'responsavel'
        ? { ...c, obrigatorio: false, dica: 'Quando a fonte histórica não informa o responsável, mantenha o campo vazio.' } : c), registro,
      salvar: async corpo => {
        await pedir(`/${spec.rota}/${encodeURIComponent(registro.id)}`, { metodo: 'PUT', corpo });
        await recarregar();
        recado('Alterações salvas.');
      },
    });
  }

  async function remover(registro) {
    if (!await confirmar(`Remover “${spec.rotulo(registro)}”? A ação não pode ser desfeita.`)) return;
    try {
      await pedir(`/${spec.rota}/${encodeURIComponent(registro.id)}`, { metodo: 'DELETE' });
      await recarregar();
      recado('Registro removido.');
    } catch (erro) {
      recado(erro.message, 'erro');
    }
  }

  definirAcoes([el('button', { classe: 'btn btn-primario', texto: `Novo ${spec.singular}`, onclick: criar })], alvo);
  atualizarFiltrosProjetos();
  alvo.replaceChildren(el('div', { classe: 'filtros' }, [filtro, contador]), ...(filtrosProjetos ? [filtrosProjetos,
    el('p', { classe: 'nota-projetos', texto: 'Histórico identifica o arquivo de origem; não confirma andamento, conclusão ou autorização atual. A situação da fonte foi preservada separadamente.' })] : []), area);
  desenhar();
}

/* ----------------------------------------------------------- visão geral -- */

async function secaoVisao() {
  const alvo = conteudo();
  alvo.replaceChildren(el('div', { classe: 'vazio', texto: 'Carregando indicadores…' }));

  const [politicas, cursos, qualifica, produtos, protocolos, documentos, arquivos, usuarios] = await Promise.all([
    pedir('/politicas'),
    pedir('/cursos'),
    pedir('/qualifica'),
    pedir('/produtos'),
    pedir('/protocolos'),
    pedir('/documentos'),
    pedir('/arquivos'),
    pedir('/usuarios'),
  ]);

  const indicadores = [
    ['Profissionais', usuarios.length, 'equipe'],
    ['Pendentes de aprovação', usuarios.filter(u => u.situacao === 'Pendente').length, 'equipe'],
    ['Arquivos enviados', arquivos.length, 'biblioteca'],
    ['Cursos', cursos.length, 'cursos'],
    ['Módulos do Qualifica', qualifica.modulos.length, 'qualifica-modulos'],
    ['Materiais do acervo', politicas.reduce((s, p) => s + p.materiais.length, 0), 'materiais'],
    ['Protocolos', protocolos.length, 'protocolos'],
    ['Documentos', documentos.length, 'documentos'],
    ['Produtos e ferramentas', produtos.length, 'produtos'],
  ];

  const grade = el('div', { classe: 'grade' }, indicadores.map(([rotulo, valor, destino]) =>
    el('button', {
      classe: 'cartao indicador', estilo: 'text-align:left;cursor:pointer;font:inherit;color:inherit',
      onclick: () => irPara(destino),
    }, [el('span', { texto: String(valor) }), el('small', { texto: rotulo })])));

  const pendentes = usuarios.filter(u => u.situacao === 'Pendente');
  const blocos = [grade];

  if (pendentes.length) {
    blocos.push(el('div', { estilo: 'margin-top:22px' }, [
      el('h3', { estilo: 'font-size:16px;margin-bottom:10px', texto: 'Aguardando liberação de acesso' }),
      montarTabela({
        colunas: [
          { campo: 'nome', rotulo: 'Nome' },
          { campo: 'email', rotulo: 'E-mail' },
          { campo: 'unidade', rotulo: 'Unidade' },
        ],
        registros: pendentes,
        acoes: usuario => [el('button', {
          classe: 'btn btn-mini btn-primario', texto: 'Aprovar',
          onclick: async () => {
            await pedir(`/usuarios/${usuario.id}/aprovar`, { metodo: 'POST' });
            recado(`${usuario.nome} liberado.`);
            secaoVisao();
          },
        })],
      }),
    ]));
  }

  const maisBaixados = produtos.filter(p => p.downloads > 0).sort((a, b) => b.downloads - a.downloads).slice(0, 5);
  if (maisBaixados.length) {
    blocos.push(el('div', { estilo: 'margin-top:22px' }, [
      el('h3', { estilo: 'font-size:16px;margin-bottom:10px', texto: 'Produtos com mais cliques em baixar' }),
      montarTabela({
        colunas: [
          { campo: 'titulo', rotulo: 'Produto' },
          { campo: 'tipo', rotulo: 'Tipo', tipo: 'etiqueta' },
          { campo: 'visualizacoes', rotulo: 'Aberturas' },
          { campo: 'downloads', rotulo: 'Cliques em baixar' },
        ],
        registros: maisBaixados,
      }),
    ]));
  }

  definirAcoes([
    el('button', { classe: 'btn btn-primario', texto: 'Enviar arquivo', onclick: () => irPara('biblioteca') }),
    el('button', { classe: 'btn btn-linha', texto: 'Convidar profissional', onclick: () => irPara('equipe') }),
  ], alvo);
  alvo.replaceChildren(...blocos);
}

/* --------------------------------------------------------------- equipe --- */

const PERFIS = ['Profissional', 'Gestor', 'Administrador'];

async function secaoEquipe() {
  const alvo = conteudo();
  alvo.replaceChildren(el('div', { classe: 'vazio', texto: 'Carregando equipe…' }));
  let usuarios = await pedir('/usuarios');

  const busca = el('input', { type: 'search', placeholder: 'Buscar por nome, e-mail, unidade…' });
  const filtroPerfil = el('select', {}, [el('option', { value: '', texto: 'Todos os perfis' }),
    ...PERFIS.map(p => el('option', { value: p, texto: p }))]);
  const filtroSituacao = el('select', {}, [el('option', { value: '', texto: 'Todas as situações' }),
    ...['Ativo', 'Pendente', 'Desativado'].map(s => el('option', { value: s, texto: s }))]);
  const contador = el('span', { classe: 'mono', estilo: 'color:var(--texto-fraco)' });
  const area = el('div');

  async function recarregar() {
    invalidarCache('usuarios');
    usuarios = await pedir('/usuarios');
    desenhar();
  }

  /** Mostra a senha definida/sugerida para o gestor repassar ao convidado. */
  function mostrarSenha(titulo, dados) {
    const caixa = el('div', { classe: 'aviso ok', estilo: 'margin-bottom:16px' }, [
      el('div', { estilo: 'font-weight:600', texto: titulo }),
      el('div', { texto: dados.usuario ? `${dados.usuario.nome} — ${dados.usuario.email}` : '' }),
      ...(dados.emailEnvio ? [el('div', { classe: dados.emailEnvio.enviado ? 'aviso ok' : 'aviso erro', texto: dados.emailEnvio.mensagem })] : []),
      el('div', { classe: 'senha-gerada', texto: dados.senha }),
      el('div', { estilo: 'margin-top:8px;font-size:12.5px',
        texto: dados.trocaObrigatoria
          ? 'Repasse pessoalmente. A pessoa será orientada a trocar a senha no primeiro acesso.'
          : 'Repasse pessoalmente. Esta senha continua valendo até a pessoa trocá-la.' }),
      el('button', { classe: 'btn btn-mini btn-linha', estilo: 'margin-top:10px', texto: 'Copiar senha',
        onclick: async () => {
          try { await navigator.clipboard.writeText(dados.senha); recado('Senha copiada.'); }
          catch { recado('Copie manualmente: a área de transferência foi bloqueada.', 'info'); }
        } }),
    ]);
    area.prepend(caixa);
  }

  async function convidar() {
    await abrirFormulario({
      grupo: 'Equipe', titulo: 'Convidar profissional',
      descricao: 'A conta já entra ativa. Você pode enviar por e-mail um link para a pessoa definir sua própria senha, válido por 1 hora.',
      rotuloSalvar: 'Criar acesso',
      campos: [
        { nome: 'nome', rotulo: 'Nome completo', obrigatorio: true, largo: true },
        { nome: 'email', rotulo: 'E-mail institucional', obrigatorio: true, largo: true },
        { nome: 'cargo', rotulo: 'Cargo ou função' },
        { nome: 'formacao', rotulo: 'Formação profissional' },
        { nome: 'unidade', rotulo: 'Unidade / serviço' },
        { nome: 'telefone', rotulo: 'Telefone' },
        { nome: 'coren', rotulo: 'Registro profissional (COREN/CRM…)' },
        { nome: 'perfil', rotulo: 'Perfil de acesso', tipo: 'selecao',
          opcoes: sessao.admin ? PERFIS : ['Profissional', 'Gestor'] },
        { nome: 'senha', rotulo: 'Senha de acesso (mínimo 8 caracteres, com letras e números)', largo: true },
        { nome: 'trocarSenha', rotulo: 'Exigir troca de senha no primeiro acesso', tipo: 'booleano', largo: true },
        { nome: 'enviarEmail', rotulo: 'Enviar link de acesso por e-mail', tipo: 'booleano', largo: true },
      ],
      registro: { perfil: 'Profissional', trocarSenha: true },
      salvar: async corpo => {
        const dados = await pedir('/usuarios/convite', { metodo: 'POST', corpo });
        await recarregar();
        mostrarSenha('Acesso criado — senha para repassar', dados);
      },
    });
  }

  async function definirSenha(usuario) {
    await abrirFormulario({
      grupo: 'Equipe', titulo: 'Definir senha',
      descricao: `${usuario.nome} — ${usuario.email}. Deixe em branco para a plataforma sugerir uma senha.`,
      rotuloSalvar: 'Definir senha',
      campos: [
        { nome: 'senha', rotulo: 'Nova senha (mínimo 8 caracteres, com letras e números)', largo: true },
        { nome: 'trocarSenha', rotulo: 'Exigir troca no próximo acesso', tipo: 'booleano', largo: true },
      ],
      registro: { trocarSenha: true },
      salvar: async corpo => {
        const dados = await pedir(`/usuarios/${usuario.id}/senha`, { metodo: 'POST', corpo });
        await recarregar();
        mostrarSenha('Senha redefinida', dados);
      },
    });
  }

  async function enviarEmail(usuario, botao) {
    if (!await confirmar(`Enviar para ${usuario.email} um link de acesso válido por 1 hora? A senha atual continua válida até a pessoa definir uma nova.`)) return;
    botao.disabled = true;
    try {
      const dados = await pedir(`/usuarios/${usuario.id}/enviar-acesso`, { metodo: 'POST' });
      recado(dados.mensagem);
    } catch (erro) { recado(erro.message, 'erro'); }
    finally { botao.disabled = false; }
  }

  async function editar(usuario) {
    await abrirFormulario({
      grupo: 'Equipe', titulo: 'Editar cadastro', descricao: usuario.email,
      campos: [
        { nome: 'nome', rotulo: 'Nome completo', obrigatorio: true, largo: true },
        { nome: 'cargo', rotulo: 'Cargo ou função' },
        { nome: 'formacao', rotulo: 'Formação profissional' },
        { nome: 'unidade', rotulo: 'Unidade / serviço' },
        { nome: 'telefone', rotulo: 'Telefone' },
        { nome: 'coren', rotulo: 'Registro profissional' },
        ...(sessao.admin ? [{ nome: 'perfil', rotulo: 'Perfil de acesso', tipo: 'selecao', opcoes: PERFIS }] : []),
        { nome: 'situacao', rotulo: 'Situação', tipo: 'selecao', opcoes: ['Ativo', 'Pendente', 'Desativado'] },
      ],
      registro: usuario,
      salvar: async corpo => {
        const atualizado = await pedir(`/usuarios/${usuario.id}`, { metodo: 'PUT', corpo });
        invalidarCache('usuarios');
        if (atualizado.id === sessao.usuario.id) sincronizarPerfil(atualizado);
        await recarregar();
        recado('Cadastro atualizado.');
      },
    });
  }

  async function alternarSituacao(usuario) {
    const desativar = usuario.situacao !== 'Desativado';
    const acao = desativar ? 'desativar' : 'reativar';
    if (!await confirmar(`Confirma ${acao} o acesso de ${usuario.nome}?`)) return;
    try {
      await pedir(`/usuarios/${usuario.id}/${acao}`, { metodo: 'POST' });
      await recarregar();
      recado(`Acesso ${desativar ? 'desativado' : 'reativado'}.`);
    } catch (erro) { recado(erro.message, 'erro'); }
  }

  async function excluir(usuario) {
    if (!await confirmar(`Excluir definitivamente ${usuario.nome}? Progresso e certificados também são removidos.`)) return;
    try {
      await pedir(`/usuarios/${usuario.id}`, { metodo: 'DELETE' });
      await recarregar();
      recado('Usuário excluído.');
    } catch (erro) { recado(erro.message, 'erro'); }
  }

  function desenhar() {
    const termo = busca.value.trim().toLowerCase();
    const filtrados = usuarios.filter(u =>
      (!filtroPerfil.value || u.perfil === filtroPerfil.value)
      && (!filtroSituacao.value || u.situacao === filtroSituacao.value)
      && (!termo || `${u.nome} ${u.email} ${u.unidade} ${u.cargo}`.toLowerCase().includes(termo)));
    contador.textContent = `${filtrados.length} de ${usuarios.length}`;

    area.replaceChildren(montarTabela({
      colunas: [
        { campo: 'nome', rotulo: 'Nome' },
        { campo: 'email', rotulo: 'E-mail' },
        { campo: 'unidade', rotulo: 'Unidade' },
        { campo: 'cargo', rotulo: 'Função' },
        { campo: 'formacao', rotulo: 'Formação' },
        { campo: 'perfil', rotulo: 'Perfil', tipo: 'etiqueta' },
        { rotulo: 'Situação', calculo: u => u.situacao },
        { rotulo: 'Senha', calculo: u => (u.senha_temporaria ? 'provisória' : 'própria') },
      ],
      registros: filtrados,
      acoes: usuario => [
        ...(usuario.situacao === 'Ativo' ? [el('button', { classe: 'btn btn-mini btn-linha', texto: 'Enviar acesso', onclick: evento => enviarEmail(usuario, evento.currentTarget) })] : []),
        el('button', { classe: 'btn btn-mini btn-linha', texto: 'Senha', onclick: () => definirSenha(usuario) }),
        el('button', { classe: 'btn btn-mini btn-linha', estilo: 'margin-left:6px', texto: 'Editar', onclick: () => editar(usuario) }),
        usuario.situacao === 'Pendente'
          ? el('button', { classe: 'btn btn-mini btn-primario', estilo: 'margin-left:6px', texto: 'Aprovar',
            onclick: async () => {
              try { await pedir(`/usuarios/${usuario.id}/aprovar`, { metodo: 'POST' }); await recarregar(); recado('Acesso liberado.'); }
              catch (erro) { recado(erro.message, 'erro'); }
            } })
          : el('button', { classe: 'btn btn-mini btn-linha', estilo: 'margin-left:6px',
            texto: usuario.situacao === 'Desativado' ? 'Reativar' : 'Desativar',
            onclick: () => alternarSituacao(usuario) }),
        sessao.admin
          ? el('button', { classe: 'btn btn-mini btn-perigo', estilo: 'margin-left:6px', texto: 'Excluir', onclick: () => excluir(usuario) })
          : null,
      ],
      vazio: 'Nenhum profissional encontrado com esses filtros.',
    }));
  }

  for (const controle of [busca, filtroPerfil, filtroSituacao]) {
    controle.addEventListener('input', desenhar);
    controle.addEventListener('change', desenhar);
  }

  definirAcoes([el('button', { classe: 'btn btn-primario', texto: 'Convidar profissional', onclick: convidar })], alvo);
  alvo.replaceChildren(el('div', { classe: 'filtros' }, [busca, filtroPerfil, filtroSituacao, contador]), area);
  desenhar();
}

/* ----------------------------------------------------------- biblioteca --- */

async function secaoBiblioteca() {
  const alvo = conteudo();
  alvo.replaceChildren(el('div', { classe: 'vazio', texto: 'Carregando biblioteca…' }));
  cache.biblioteca = null;
  let arquivos = await biblioteca();

  const busca = el('input', { type: 'search', placeholder: 'Buscar por título ou nome do arquivo…' });
  const filtroCategoria = el('select', {}, [el('option', { value: '', texto: 'Todas as categorias' }),
    ...CATEGORIAS_ARQUIVO.map(c => el('option', { value: c, texto: c }))]);
  const contador = el('span', { classe: 'mono', estilo: 'color:var(--texto-fraco)' });
  const area = el('div');

  async function recarregar() {
    cache.biblioteca = null;
    arquivos = await biblioteca();
    desenhar();
  }

  async function enviar() {
    await abrirFormulario({
      grupo: 'Biblioteca', titulo: 'Enviar arquivo',
      descricao: 'Treinamentos, políticas, materiais, produtos do PPGSMI e capacitações. Depois de enviar, use o endereço do arquivo ao cadastrar o conteúdo.',
      rotuloSalvar: 'Enviar',
      campos: [
        { nome: 'titulo', rotulo: 'Título', largo: true },
        { nome: 'categoria', rotulo: 'Categoria', tipo: 'selecao', opcoes: CATEGORIAS_ARQUIVO },
        { nome: 'descricao', rotulo: 'Descrição', tipo: 'area', largo: true },
      ],
      registro: { categoria: 'Material' },
      salvar: async corpo => {
        const seletor = document.getElementById('seletor-arquivo');
        const arquivo = seletor?.files?.[0];
        if (!arquivo) throw new Error('Escolha o arquivo a enviar.');
        const enviado = await enviarArquivo(arquivo, {
          titulo: corpo.titulo || arquivo.name,
          categoria: corpo.categoria,
          descricao: corpo.descricao,
        });
        await recarregar();
        recado(`“${enviado.titulo}” enviado.`);
      },
    });
    // O seletor de arquivo entra depois: precisa ser um input de verdade no modal.
    const campos = document.getElementById('modal-campos');
    campos.prepend(el('div', { classe: 'largo' }, [
      el('label', { for: 'seletor-arquivo', texto: 'Arquivo *' }),
      el('input', { id: 'seletor-arquivo', type: 'file', required: true }),
      el('div', { estilo: 'font-size:11.5px;color:var(--texto-fraco);margin-top:5px',
        texto: 'PDF, Word, PowerPoint, Excel, imagens, vídeo (MP4/WebM), áudio ou ZIP.' }),
    ]));
  }

  async function editar(arquivo) {
    await abrirFormulario({
      grupo: 'Biblioteca', titulo: 'Editar arquivo', descricao: arquivo.original,
      campos: [
        { nome: 'titulo', rotulo: 'Título', obrigatorio: true, largo: true },
        { nome: 'categoria', rotulo: 'Categoria', tipo: 'selecao', opcoes: CATEGORIAS_ARQUIVO },
        { nome: 'descricao', rotulo: 'Descrição', tipo: 'area', largo: true },
      ],
      registro: arquivo,
      salvar: async corpo => {
        await pedir(`/arquivos/${arquivo.id}`, { metodo: 'PUT', corpo });
        await recarregar();
        recado('Arquivo atualizado.');
      },
    });
  }

  async function remover(arquivo) {
    if (!await confirmar(`Remover “${arquivo.titulo}” da biblioteca? O arquivo sai do servidor.`)) return;
    try {
      await pedir(`/arquivos/${arquivo.id}`, { metodo: 'DELETE' });
      await recarregar();
      recado('Arquivo removido.');
    } catch (erro) {
      if (erro.status === 409
        && await confirmar(`${erro.message}\n\nRemover mesmo assim? Os registros ficarão com o endereço quebrado.`)) {
        await pedir(`/arquivos/${arquivo.id}?forcar=true`, { metodo: 'DELETE' });
        await recarregar();
        recado('Arquivo removido à força.', 'info');
      } else if (erro.status !== 409) recado(erro.message, 'erro');
    }
  }

  function desenhar() {
    const termo = busca.value.trim().toLowerCase();
    const filtrados = arquivos.filter(a =>
      (!filtroCategoria.value || a.categoria === filtroCategoria.value)
      && (!termo || `${a.titulo} ${a.original} ${a.descricao}`.toLowerCase().includes(termo)));
    contador.textContent = `${filtrados.length} de ${arquivos.length}`;

    area.replaceChildren(montarTabela({
      colunas: [
        { campo: 'titulo', rotulo: 'Título' },
        { campo: 'categoria', rotulo: 'Categoria', tipo: 'etiqueta' },
        { campo: 'original', rotulo: 'Arquivo' },
        { rotulo: 'Tamanho', calculo: a => formatarBytes(a.bytes) },
        { campo: 'downloads', rotulo: 'Cliques em baixar' },
        { campo: 'enviado_por', rotulo: 'Enviado por' },
        { campo: 'criado_em', rotulo: 'Data', tipo: 'data' },
      ],
      registros: filtrados,
      acoes: arquivo => [
        el('a', { classe: 'btn btn-mini btn-linha', href: enderecoSeguro(arquivo.url) || '#', target: '_blank', rel: 'noopener', texto: 'Abrir' }),
        el('button', { classe: 'btn btn-mini btn-linha', estilo: 'margin-left:6px', texto: 'Copiar endereço',
          onclick: async () => {
            try { await navigator.clipboard.writeText(arquivo.url); recado('Endereço copiado: ' + arquivo.url); }
            catch { recado('Endereço: ' + arquivo.url, 'info'); }
          } }),
        el('button', { classe: 'btn btn-mini btn-linha', estilo: 'margin-left:6px', texto: 'Editar', onclick: () => editar(arquivo) }),
        el('button', { classe: 'btn btn-mini btn-perigo', estilo: 'margin-left:6px', texto: 'Remover', onclick: () => remover(arquivo) }),
      ],
      vazio: 'Nenhum arquivo enviado ainda. Use “Enviar arquivo”.',
    }));
  }

  for (const controle of [busca, filtroCategoria]) {
    controle.addEventListener('input', desenhar);
    controle.addEventListener('change', desenhar);
  }

  definirAcoes([el('button', { classe: 'btn btn-primario', texto: 'Enviar arquivo', onclick: enviar })], alvo);
  alvo.replaceChildren(el('div', { classe: 'filtros' }, [busca, filtroCategoria, contador]), area);
  desenhar();
}

/* ------------------------------------------------------------- meu perfil - */

function sincronizarPerfil(eu) {
  sessao.usuario = eu;
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify({ nome: eu.nome, perfil: eu.perfil }));
  document.getElementById('quem-sou').textContent = eu.nome;
  document.getElementById('perfil-sou').textContent = `${eu.perfil} · ${eu.unidade || 'rede municipal'}`;
}

async function secaoPerfil(atualizado) {
  const alvo = conteudo();
  const eu = atualizado || await pedir('/auth/eu');
  sincronizarPerfil(eu);

  const dados = el('div', { classe: 'cartao' }, [
    el('h3', { estilo: 'font-size:16px;margin-bottom:12px', texto: 'Meus dados' }),
    montarTabela({
      colunas: [
        { campo: 'nome', rotulo: 'Nome' },
        { campo: 'email', rotulo: 'E-mail' },
        { campo: 'perfil', rotulo: 'Perfil', tipo: 'etiqueta' },
        { campo: 'unidade', rotulo: 'Unidade' },
        { campo: 'cargo', rotulo: 'Função' },
        { campo: 'formacao', rotulo: 'Formação' },
        { campo: 'telefone', rotulo: 'Telefone' },
        { campo: 'xp', rotulo: 'XP' },
      ],
      registros: [eu],
    }),
  ]);

  const formSenha = el('form', {}, [
    el('label', { for: 'atual', texto: 'Senha atual' }),
    el('input', { id: 'atual', name: 'senhaAtual', type: 'password', required: true, autocomplete: 'current-password' }),
    el('div', { estilo: 'height:12px' }),
    el('label', { for: 'nova', texto: 'Nova senha (mínimo 8 caracteres, com letras e números)' }),
    el('input', { id: 'nova', name: 'senhaNova', type: 'password', required: true, minlength: 8, autocomplete: 'new-password' }),
    el('label', { for: 'confirmar-nova', texto: 'Confirme a nova senha' }),
    el('input', { id: 'confirmar-nova', name: 'confirmacao', type: 'password', required: true, minlength: 8, autocomplete: 'new-password' }),
    el('button', { classe: 'btn btn-escuro', type: 'submit', estilo: 'margin-top:16px', texto: 'Trocar senha' }),
  ]);
  const avisoSenha = el('div');
  formSenha.addEventListener('submit', async evento => {
    evento.preventDefault();
    const botao = formSenha.querySelector('button');
    if (botao.disabled) return;
    botao.disabled = true;
    try {
      if (formSenha.elements.senhaNova.value !== formSenha.elements.confirmacao.value) throw new Error('As senhas não conferem.');
      const novaSessao = await pedir('/usuarios/eu/senha', {
        metodo: 'PUT',
        corpo: { senhaAtual: formSenha.senhaAtual.value, senhaNova: formSenha.senhaNova.value },
      });
      sessao.token = novaSessao.token;
      sessao.usuario = novaSessao.usuario;
      localStorage.setItem(CHAVE_TOKEN, sessao.token);
      formSenha.reset();
      avisoEm(avisoSenha, 'Senha atualizada.', 'ok');
      document.getElementById('banner-senha').classList.add('oculto');
    } catch (erro) {
      avisoEm(avisoSenha, erro.message);
    } finally {
      botao.disabled = false;
    }
  });

  definirAcoes([el('button', {
    classe: 'btn btn-linha', texto: 'Editar meus dados',
    onclick: () => abrirFormulario({
      grupo: 'Meu perfil', titulo: 'Editar meus dados',
      campos: [
        { nome: 'nome', rotulo: 'Nome completo', obrigatorio: true, largo: true },
        { nome: 'cargo', rotulo: 'Cargo ou função' },
        { nome: 'formacao', rotulo: 'Formação profissional' },
        { nome: 'unidade', rotulo: 'Unidade / serviço' },
        { nome: 'telefone', rotulo: 'Telefone' },
      ],
      registro: eu,
      salvar: async corpo => {
        const atualizado = await pedir('/usuarios/eu', { metodo: 'PUT', corpo });
        invalidarCache('usuarios');
        sincronizarPerfil(atualizado);
        if (alvo.isConnected) await secaoPerfil(atualizado);
        recado('Dados atualizados.');
      },
    }),
  })], alvo);

  alvo.replaceChildren(dados, el('div', { classe: 'cartao', estilo: 'margin-top:16px;max-width:460px' }, [
    el('h3', { estilo: 'font-size:16px;margin-bottom:12px', texto: 'Trocar minha senha' }),
    formSenha, avisoSenha,
  ]));
}

/* ------------------------------------------------------ registros e backup */

async function secaoRegistros() {
  const alvo = conteudo();
  alvo.replaceChildren(el('div', { classe: 'vazio', texto: 'Carregando registros…' }));
  const [logs, estatisticas, email] = await Promise.all([
    pedir('/admin/logs?limite=200'),
    pedir('/admin/estatisticas'),
    pedir('/admin/email'),
  ]);

  const contagens = Object.entries(estatisticas.contagens)
    .sort((a, b) => b[1] - a[1])
    .map(([tabela, total]) => el('span', { classe: 'etiqueta', estilo: 'margin:0 6px 6px 0', texto: `${tabela}: ${total}` }));

  definirAcoes([
    el('button', {
      classe: 'btn btn-linha', texto: 'Baixar backup (JSON)',
      onclick: async () => {
        try {
          const resposta = await fetch(API + '/admin/backup', { headers: { Authorization: 'Bearer ' + sessao.token } });
          if (!resposta.ok) throw new Error('Falha ao gerar o backup.');
          const blob = await resposta.blob();
          const endereco = URL.createObjectURL(blob);
          const link = el('a', { href: endereco, download: `maternar-backup-${new Date().toISOString().slice(0, 10)}.json` });
          document.body.append(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(endereco);
          recado('Backup gerado.');
        } catch (erro) { recado(erro.message, 'erro'); }
      },
    }),
    el('button', { classe: 'btn btn-linha', texto: 'Atualizar', onclick: secaoRegistros }),
  ], alvo);

  alvo.replaceChildren(
    el('div', { classe: 'cartao', estilo: 'margin-bottom:16px' }, [
      el('h3', { texto: 'E-mail de acesso' }),
      el('p', { texto: email.configurado ? `Remetente: ${email.remetente}. O envio de acesso fica disponível no cadastro da equipe.` : 'O envio de e-mail ainda não está configurado neste ambiente.' }),
      el('button', { classe: 'btn btn-linha', texto: 'Verificar conexão de e-mail', onclick: async evento => {
        const botao = evento.currentTarget; botao.disabled = true;
        try {
          const dados = await pedir('/admin/email/verificar', { metodo: 'POST' });
          recado(dados.autenticado ? 'Conexão e autenticação SMTP confirmadas. Nenhum e-mail foi enviado nesta verificação.' : 'Não foi possível autenticar no servidor de e-mail. Verifique a configuração com a TI.', dados.autenticado ? 'ok' : 'erro');
        } catch (erro) { recado(erro.message, 'erro'); }
        finally { botao.disabled = false; }
      } }),
    ]),
    el('div', { classe: 'cartao' }, [
      el('h3', { estilo: 'font-size:16px;margin-bottom:10px', texto: 'Banco de dados' }),
      el('div', { estilo: 'margin-bottom:12px;color:var(--texto-suave)',
        texto: `${formatarBytes(estatisticas.banco.bytes)} em ${estatisticas.banco.caminho} · Node ${estatisticas.processo.node} · no ar há ${Math.round(estatisticas.processo.uptimeSegundos / 60)} min` }),
      el('div', {}, contagens),
    ]),
    el('h3', { estilo: 'font-size:16px;margin:22px 0 10px', texto: 'Últimas ações registradas' }),
    montarTabela({
      colunas: [
        { campo: 'quando', rotulo: 'Quando' },
        { campo: 'usuario', rotulo: 'Usuário' },
        { campo: 'acao', rotulo: 'Ação', tipo: 'etiqueta' },
        { campo: 'detalhe', rotulo: 'Detalhe' },
      ],
      registros: logs,
    }),
  );
}

/* ------------------------------------------------------------- navegação -- */

const SECOES_PROPRIAS = {
  visao: { grupo: 'Início', titulo: 'Visão geral', descricao: 'Situação da plataforma e atalhos para o que precisa de atenção.', render: secaoVisao },
  perfil: { grupo: 'Início', titulo: 'Meu perfil', descricao: 'Seus dados e a troca da sua senha.', render: secaoPerfil },
  equipe: { grupo: 'Equipe', titulo: 'Equipe e senhas', descricao: 'Cadastre a equipe, defina e redefina senhas, aprove solicitações e ajuste perfis de acesso.', render: secaoEquipe },
  biblioteca: { grupo: 'Arquivos', titulo: 'Biblioteca de uploads', descricao: 'Todo arquivo enviado à plataforma fica aqui e pode ser vinculado a qualquer conteúdo.', render: secaoBiblioteca },
  registros: { grupo: 'Sistema', titulo: 'Registros e backup', descricao: 'Trilha de auditoria das ações e cópia completa do banco em JSON.', render: secaoRegistros },
};

function definirAcoes(botoes, origem) {
  if (origem && !origem.isConnected) return;
  document.getElementById('secao-acoes').replaceChildren(...botoes.filter(Boolean));
}

let secaoAtual = '';

async function irPara(id) {
  if (id === 'registros' && !sessao.admin) return irPara('visao');
  const propria = Object.hasOwn(SECOES_PROPRIAS, id) ? SECOES_PROPRIAS[id] : null;
  const recurso = Object.hasOwn(RECURSOS, id) ? RECURSOS[id] : null;
  if (!propria && !recurso) return irPara('visao');
  secaoAtual = id;
  // Cada navegação possui seu próprio destino. Respostas antigas só alteram
  // o nó já removido, sem substituir o conteúdo da seção mais recente.
  const alvo = conteudo().cloneNode(false);
  conteudo().replaceWith(alvo);
  if (location.hash !== '#' + id) location.hash = id;
  for (const botao of document.querySelectorAll('#menu button')) {
    const ativo = botao.dataset.secao === id;
    botao.classList.toggle('ativo', ativo);
    if (ativo) {
      botao.setAttribute('aria-current', 'page');
      botao.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    }
    else botao.removeAttribute('aria-current');
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.getElementById('secao-grupo').textContent = propria ? propria.grupo : tituloGrupo(id);
  document.getElementById('secao-titulo').textContent = propria ? propria.titulo : recurso.titulo;
  document.getElementById('secao-descricao').textContent = propria ? propria.descricao : recurso.descricao;
  definirAcoes([]);

  try {
    if (propria) await propria.render();
    else await secaoRecurso(id);
  } catch (erro) {
    if (erro.status !== 401 && alvo.isConnected) alvo.replaceChildren(
      el('div', { classe: 'aviso erro', texto: erro.message }),
      el('button', { classe: 'btn btn-linha', texto: 'Tentar novamente', onclick: () => irPara(id) }),
    );
  }
}

function tituloGrupo(id) {
  for (const grupo of MENU) if (grupo.itens.some(i => i.id === id)) return grupo.grupo;
  return '';
}

function montarMenu() {
  const menu = document.getElementById('menu');
  menu.replaceChildren();
  for (const grupo of MENU) {
    const itens = grupo.itens.filter(item => !item.somenteAdmin || sessao.admin);
    if (!itens.length) continue;
    menu.append(el('div', { classe: 'grupo mono', texto: grupo.grupo }));
    for (const item of itens) {
      menu.append(el('button', {
        type: 'button', dados: { secao: item.id }, onclick: () => irPara(item.id),
      }, [iconeMenu(item.icone),
        el('span', { texto: item.rotulo })]));
    }
  }
}

function iconeMenu(nome) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  for (const [chave, valor] of Object.entries({ class: 'icone-menu', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' })) svg.setAttribute(chave, valor);
  const uso = document.createElementNS(ns, 'use');
  uso.setAttribute('href', `/assets/lucide.svg#${nome}`);
  svg.append(uso);
  return svg;
}

window.addEventListener('hashchange', () => {
  const id = location.hash.replace('#', '') || 'visao';
  if (id !== secaoAtual) irPara(id);
});

document.addEventListener('click', evento => {
  const destino = evento.target.closest('[data-ir]');
  if (destino) { evento.preventDefault(); irPara(destino.dataset.ir); }
});

/* ---------------------------------------------------------------- sessão -- */

function encerrarSessao(mensagem) {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
  sessao.token = '';
  sessao.usuario = null;
  document.getElementById('app').classList.add('oculto');
  document.getElementById('tela-login').classList.remove('oculto');
  if (mensagem) avisoEm('aviso-login', mensagem, 'info');
}

document.getElementById('sair').addEventListener('click', async () => {
  try { await pedir('/auth/logout', { metodo: 'POST' }); } finally { encerrarSessao('Sessão encerrada.'); }
});

document.getElementById('form-login').addEventListener('submit', async evento => {
  evento.preventDefault();
  const form = evento.target;
  avisoEm('aviso-login', 'Verificando credenciais…', 'info');
  try {
    const dados = await pedir('/auth/login', {
      metodo: 'POST',
      corpo: { email: form.email.value.trim(), senha: form.senha.value },
    });
    if (!['Gestor', 'Administrador'].includes(dados.usuario.perfil)) {
      localStorage.setItem(CHAVE_TOKEN, dados.token);
      location.replace('/app');
      return;
    }
    sessao.token = dados.token;
    sessao.usuario = dados.usuario;
    localStorage.setItem(CHAVE_TOKEN, dados.token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify({ nome: dados.usuario.nome, perfil: dados.usuario.perfil }));
    iniciar();
  } catch (erro) {
    avisoEm('aviso-login', erro.message);
  }
});

async function iniciar() {
  if (!sessao.token) return encerrarSessao();
  let eu;
  try {
    eu = await pedir('/auth/eu');
  } catch {
    return encerrarSessao('Entre novamente para continuar.');
  }
  sessao.usuario = eu;
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify({ nome: eu.nome, perfil: eu.perfil }));
  if (!sessao.gestor || eu.senha_temporaria) return location.replace(eu.senha_temporaria ? '/app#perfil' : '/app');

  document.getElementById('tela-login').classList.add('oculto');
  document.getElementById('app').classList.remove('oculto');
  document.getElementById('quem-sou').textContent = eu.nome;
  document.getElementById('perfil-sou').textContent = `${eu.perfil} · ${eu.unidade || 'rede municipal'}`;
  document.getElementById('banner-senha').classList.toggle('oculto', !eu.senha_temporaria);

  cache.opcoes.clear();
  cache.biblioteca = null;
  montarMenu();
  await irPara(location.hash.replace('#', '') || 'visao');
}

iniciar();
