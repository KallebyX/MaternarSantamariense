import { statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { db } from '../db/connection.js';
import { config } from '../config.js';
import { urlValida } from './http.js';

export function materialDisponivel(url) {
  if (!url || !urlValida(url)) return false;
  if (/^https?:\/\//i.test(url)) return true;
  let caminho;
  try { caminho = decodeURIComponent(new URL(url, 'https://maternar.local/').pathname); } catch { return false; }
  const partes = caminho.split('/').filter(Boolean);
  const pasta = partes.shift();
  if (!['uploads','acervo','cursos','qualifica','produtos'].includes(pasta)) return false;
  const raiz = pasta === 'uploads' ? config.uploadDir : resolve(config.staticDir,pasta);
  const arquivo = resolve(raiz,...partes);
  if (!arquivo.startsWith(raiz + sep)) return false;
  try { return statSync(arquivo).isFile(); } catch { return false; }
}

export function montarCurso(curso) {
  if (!curso) return null;
  const aulas = db.prepare('SELECT * FROM aulas WHERE curso_id=? ORDER BY ordem').all(curso.id);
  const conteudoCompleto = aulas.length > 0 && aulas.every(a => materialDisponivel(a.url));
  const participantes = db.prepare('SELECT COUNT(DISTINCT usuario_id) n FROM progresso WHERE curso_id=?').get(curso.id).n;
  return {...curso, aulas, inscritos:participantes, publicado:!!curso.publicado,
    disponivel:!!curso.publicado && conteudoCompleto,
    situacao:!curso.publicado ? 'Rascunho' : conteudoCompleto ? 'Publicado' : 'Conteúdo incompleto'};
}

export function cursosPublicados() {
  return db.prepare('SELECT * FROM cursos WHERE publicado=1').all().map(montarCurso).filter(c => c.disponivel);
}
