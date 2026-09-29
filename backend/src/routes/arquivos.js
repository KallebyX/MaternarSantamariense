// Biblioteca de arquivos: upload de treinamentos, políticas, materiais, produtos
// do PPGSMI e capacitações do Qualifica. O binário vai para data/uploads e é
// servido em /uploads/<nome>; os metadados ficam na tabela `arquivos`, de onde o
// painel copia a URL para dentro de um material, curso, produto ou documento.
import { Router } from 'express';
import multer from 'multer';
import { randomBytes } from 'node:crypto';
import { mkdirSync, unlinkSync } from 'node:fs';
import { extname, join, basename } from 'node:path';
import { db, registrarLog } from '../db/connection.js';
import { autenticar, exigirPapel } from '../auth/middleware.js';
import { config } from '../config.js';
import { erro, ok } from '../lib/http.js';

export const arquivosRouter = Router();

export const CATEGORIAS = ['Treinamento', 'Política', 'Material', 'Produto PPGSMI',
  'Qualifica Profissional', 'Protocolo', 'Documento', 'Outro'];

// Extensões aceitas — documentos, apresentações, planilhas, imagens e vídeo/áudio de aula
const EXTENSOES = new Set(['.pdf', '.doc', '.docx', '.odt', '.ppt', '.pptx', '.odp', '.xls', '.xlsx',
  '.ods', '.csv', '.txt', '.rtf', '.png', '.jpg', '.jpeg', '.webp', '.gif',
  '.mp4', '.webm', '.mp3', '.m4a', '.zip']);

mkdirSync(config.uploadDir, { recursive: true });

/**
 * O busboy (dentro do multer) entrega o nome do arquivo em latin1; sem esta
 * conversão, "Reanimação.pdf" chega como "ReanimaÃ§Ã£o.pdf".
 */
function nomeOriginal(file) {
  const bruto = String(file?.originalname || 'arquivo');
  try {
    const utf8 = Buffer.from(bruto, 'latin1').toString('utf8');
    return utf8.includes('�') ? bruto : utf8; // caractere de substituição = já era utf8
  } catch {
    return bruto;
  }
}

/** Nome de arquivo previsível e seguro: slug do original + sufixo aleatório. */
function nomeArmazenado(original) {
  const ext = extname(original).toLowerCase();
  const base = basename(original, extname(original))
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'arquivo';
  return `${base}-${randomBytes(4).toString('hex')}${ext}`;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.uploadDir),
    filename: (req, file, cb) => cb(null, nomeArmazenado(nomeOriginal(file))),
  }),
  limits: { fileSize: config.uploadMaxMb * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!EXTENSOES.has(extname(nomeOriginal(file)).toLowerCase())) {
      return cb(new Error('Formato de arquivo não aceito.'));
    }
    cb(null, true);
  },
}).single('arquivo');

function apagarDoDisco(armazenado) {
  // basename() barra qualquer tentativa de sair do diretório de uploads
  const caminho = join(config.uploadDir, basename(String(armazenado)));
  try { unlinkSync(caminho); } catch (erro) { if (erro.code !== 'ENOENT') throw erro; }
}

arquivosRouter.get('/arquivos', (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  const categoria = String(req.query.categoria || '');
  let linhas = db.prepare('SELECT * FROM arquivos ORDER BY id DESC').all();
  if (categoria && categoria !== 'Todas') linhas = linhas.filter(a => a.categoria === categoria);
  if (q) linhas = linhas.filter(a => (a.titulo + ' ' + a.descricao + ' ' + a.original).toLowerCase().includes(q));
  return ok(res, linhas, { total: linhas.length, categorias: CATEGORIAS, limiteMb: config.uploadMaxMb });
});

arquivosRouter.post('/arquivos', autenticar, exigirPapel('Gestor', 'Administrador'), (req, res) => {
  upload(req, res, err => {
    if (err) {
      const limite = err.code === 'LIMIT_FILE_SIZE';
      return erro(res, limite ? 413 : 400,
        limite ? `Arquivo acima do limite de ${config.uploadMaxMb} MB.` : (err.message || 'Falha no upload.'));
    }
    if (!req.file) return erro(res, 400, 'Envie o arquivo no campo "arquivo".');
    const original = nomeOriginal(req.file);
    const categoria = CATEGORIAS.includes(req.body?.categoria) ? req.body.categoria : 'Material';
    const titulo = String(req.body?.titulo || '').trim() || original;
    const url = 'uploads/' + req.file.filename;
    try {
      const info = db.prepare(`INSERT INTO arquivos
        (titulo, categoria, descricao, original, armazenado, mime, bytes, url, enviado_por)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(titulo, categoria, String(req.body?.descricao || '').trim(), original,
          req.file.filename, req.file.mimetype || '', req.file.size, url, req.usuario.email);
      registrarLog(req.usuario.email, 'upload-arquivo', `${categoria}: ${titulo}`);
      return res.status(201).json({
        ok: true, erro: null,
        dados: db.prepare('SELECT * FROM arquivos WHERE id = ?').get(info.lastInsertRowid),
      });
    } catch (e) {
      // O callback do multer roda fora da cadeia do Express: trata aqui em vez de lançar.
      try { apagarDoDisco(req.file.filename); }
      catch (falhaLimpeza) { console.error('[arquivos] Falha ao remover upload não registrado:', falhaLimpeza); }
      console.error('[arquivos]', e);
      return erro(res, 500, 'Não foi possível registrar o arquivo enviado.');
    }
  });
});

arquivosRouter.put('/arquivos/:id', autenticar, exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const atual = db.prepare('SELECT * FROM arquivos WHERE id = ?').get(req.params.id);
  if (!atual) return erro(res, 404, 'Arquivo não encontrado.');
  const categoria = CATEGORIAS.includes(req.body?.categoria) ? req.body.categoria : atual.categoria;
  db.prepare('UPDATE arquivos SET titulo = ?, categoria = ?, descricao = ? WHERE id = ?')
    .run(String(req.body?.titulo || atual.titulo).trim(), categoria,
      req.body?.descricao === undefined ? atual.descricao : String(req.body.descricao).trim(), atual.id);
  registrarLog(req.usuario.email, 'atualizar-arquivo', atual.titulo);
  return ok(res, db.prepare('SELECT * FROM arquivos WHERE id = ?').get(atual.id));
});

arquivosRouter.delete('/arquivos/:id', autenticar, exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const arquivo = db.prepare('SELECT * FROM arquivos WHERE id = ?').get(req.params.id);
  if (!arquivo) return erro(res, 404, 'Arquivo não encontrado.');
  const caminho = valor => {
    try { return decodeURIComponent(new URL(valor, 'https://maternar.local/').pathname); }
    catch { return null; }
  };
  const destino = caminho(arquivo.url);
  const vinculos = [['materiais', 'url'], ['documentos', 'url'], ['produtos', 'url'],
    ['protocolos', 'url'], ['qualifica_recursos', 'url'], ['aulas', 'url'],
    ['cursos', 'capa'], ['produtos', 'capa'], ['qualifica_modulos', 'url'], ['links', 'url']];
  const emUso = vinculos.reduce((total, [tabela, campo]) => total + db.prepare(`SELECT ${campo} valor FROM ${tabela}`).all()
    .filter(({ valor }) => valor && caminho(valor) === destino).length, 0);
  if (emUso && req.query.forcar !== 'true') {
    return erro(res, 409, `Arquivo referenciado em ${emUso} registro(s). Remova os vínculos ou use ?forcar=true.`);
  }
  apagarDoDisco(arquivo.armazenado);
  db.prepare('DELETE FROM arquivos WHERE id = ?').run(arquivo.id);
  registrarLog(req.usuario.email, 'remover-arquivo', arquivo.titulo);
  return ok(res, { removido: arquivo.id });
});

arquivosRouter.post('/arquivos/:id/download', (req, res) => {
  const r = db.prepare('UPDATE arquivos SET downloads = downloads + 1 WHERE id = ?').run(req.params.id);
  if (!r.changes) return erro(res, 404, 'Arquivo não encontrado.');
  return ok(res, db.prepare('SELECT id, downloads FROM arquivos WHERE id = ?').get(req.params.id));
});
