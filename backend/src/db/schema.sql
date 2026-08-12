PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  cargo TEXT DEFAULT '',
  unidade TEXT DEFAULT '',
  perfil TEXT NOT NULL DEFAULT 'Profissional' CHECK (perfil IN ('Profissional','Gestor','Administrador')),
  iniciais TEXT DEFAULT '',
  coren TEXT DEFAULT '',
  situacao TEXT NOT NULL DEFAULT 'Pendente' CHECK (situacao IN ('Ativo','Pendente','Desativado')),
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  admissao TEXT DEFAULT '',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cursos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  area TEXT NOT NULL,
  horas INTEGER NOT NULL,
  nivel TEXT NOT NULL,
  tag TEXT DEFAULT '',
  inscritos INTEGER NOT NULL DEFAULT 0,
  descricao TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS aulas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  curso_id TEXT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  duracao TEXT DEFAULT '',
  UNIQUE (curso_id, ordem)
);

CREATE TABLE IF NOT EXISTS progresso (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id TEXT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  aula_ordem INTEGER NOT NULL,
  concluido_em TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, curso_id, aula_ordem)
);

CREATE TABLE IF NOT EXISTS qualifica_modulos (
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  aulas INTEGER NOT NULL DEFAULT 0,
  duracao TEXT DEFAULT '',
  nivel TEXT DEFAULT '',
  cor TEXT DEFAULT '#153A62',
  tipo TEXT NOT NULL DEFAULT 'Capacitações livres'
);

CREATE TABLE IF NOT EXISTS qualifica_recursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modulo_id INTEGER NOT NULL REFERENCES qualifica_modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT DEFAULT '',
  url TEXT NOT NULL,
  fonte TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS trilhas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  modulos TEXT NOT NULL DEFAULT '[]' -- JSON: ids de qualifica_modulos
);

CREATE TABLE IF NOT EXISTS politicas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  cor TEXT NOT NULL DEFAULT '#153A62',
  descricao TEXT DEFAULT '',
  ordem INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS materiais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  politica_id INTEGER NOT NULL REFERENCES politicas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Material',
  url TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]' -- JSON
);
CREATE INDEX IF NOT EXISTS idx_materiais_politica ON materiais(politica_id);

CREATE TABLE IF NOT EXISTS projetos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  instituicao TEXT DEFAULT '',
  local TEXT DEFAULT '',
  inicio TEXT DEFAULT '',
  fim TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo','Encerrado')),
  autorizacao TEXT DEFAULT '',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS protocolos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  versao TEXT DEFAULT '',
  setor TEXT DEFAULT '',
  atualizado TEXT DEFAULT '',
  paginas INTEGER DEFAULT 0,
  prazo TEXT DEFAULT '',
  pendente INTEGER NOT NULL DEFAULT 0,
  url TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS documentos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT DEFAULT '',
  categoria TEXT DEFAULT '',
  setor TEXT DEFAULT '',
  autor TEXT DEFAULT '',
  status TEXT DEFAULT 'Aprovado',
  versao TEXT DEFAULT '',
  atualizado TEXT DEFAULT '',
  expira TEXT DEFAULT '',
  tamanho TEXT DEFAULT '',
  visualizacoes INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  tags TEXT NOT NULL DEFAULT '[]', -- JSON
  descricao TEXT DEFAULT '',
  url TEXT DEFAULT '',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  categoria TEXT DEFAULT '',
  descricao TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dia INTEGER NOT NULL,
  mes INTEGER NOT NULL DEFAULT 8,
  hora TEXT NOT NULL,
  titulo TEXT NOT NULL,
  local TEXT DEFAULT '',
  cor TEXT DEFAULT '#1E4A7A',
  criado_por INTEGER REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS canais (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  subtitulo TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  canal_id TEXT NOT NULL REFERENCES canais(id) ON DELETE CASCADE,
  autor TEXT NOT NULL,
  iniciais TEXT DEFAULT '',
  texto TEXT NOT NULL,
  hora TEXT DEFAULT '',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mensagens_canal ON mensagens(canal_id);

CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  url TEXT DEFAULT '',
  capa TEXT DEFAULT '',
  visualizacoes INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS certificados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id TEXT NOT NULL REFERENCES cursos(id),
  modelo TEXT NOT NULL DEFAULT 'Multiprofissional',
  emitido_em TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (usuario_id, curso_id)
);

CREATE TABLE IF NOT EXISTS notificacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE, -- NULL = broadcast
  titulo TEXT NOT NULL,
  texto TEXT DEFAULT '',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notificacoes_lidas (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  notificacao_id INTEGER NOT NULL REFERENCES notificacoes(id) ON DELETE CASCADE,
  lida_em TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, notificacao_id)
);

CREATE TABLE IF NOT EXISTS conquistas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  cor TEXT DEFAULT '#153A62',
  nivel INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tarefas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  prioridade TEXT DEFAULT 'Média',
  responsavel TEXT DEFAULT '',
  prazo TEXT DEFAULT '',
  coluna INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quando TEXT NOT NULL DEFAULT (datetime('now')),
  usuario TEXT DEFAULT '',
  acao TEXT NOT NULL,
  detalhe TEXT DEFAULT ''
);
