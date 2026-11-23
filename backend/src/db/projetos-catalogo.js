// A fonte fica intacta; somente vínculos inequívocos são separados automaticamente.
export const normalizarTexto = valor => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
const INSTITUICOES = [
  ['UFN', /\b(?:universidade franciscana|centro universitario franciscano|ufn|unifra)\b/g],
  ['UFSM', /\b(?:universidade federal de santa maria|ufsm)\b/g],
  ['FISMA', /\b(?:faculdade integrada de santa maria|fisma)\b/g],
  ['UFRGS', /\b(?:universidade federal do rio grande do sul|ufrgs|ufgrs)\b/g],
  ['UFPel', /\b(?:universidade federal de pelotas|ufpel)\b/g],
  ['UFSC', /\b(?:universidade federal de santa catarina|ufsc)\b/g],
  ['UNISC', /\b(?:universidade de santa cruz do sul|unisc)\b/g],
  ['ULBRA', /\b(?:universidade luterana do brasil|ulbra)\b/g],
  ['SOBRESP', /\b(?:faculdade sobresp|sobresp)\b/g],
  ['UNIPAMPA', /\b(?:universidade federal do pampa|unipampa)\b/g],
  ['UCS', /\b(?:universidade de caxias do sul|ucs)\b/g],
  ['PUCRS', /\b(?:pontificia universidade catolica do rio grande do sul|puc\/?rs)\b/g],
  ['USP', /\b(?:universidade de sao paulo|usp)\b/g],
];

function instituicoesDoTexto(valor) {
  const texto = normalizarTexto(valor);
  return [...new Set(INSTITUICOES.filter(([, regex]) => [...texto.matchAll(regex)].length).map(([nome]) => nome))];
}

export function separarVinculo(valor) {
  const original = String(valor ?? '');
  const texto = original.normalize('NFC').trim().replace(/\s+/g, ' ');
  const normalizado = normalizarTexto(texto);
  const achados = INSTITUICOES.flatMap(([nome, regex]) => [...normalizado.matchAll(regex)].map(m => ({ nome, inicio: m.index, fim: m.index + m[0].length })));
  const nomes = [...new Set(achados.map(a => a.nome))];
  if (nomes.length !== 1) return { instituicao: '', curso: '', original, revisar: !!original && !/^\?|institui[cç][aã]o n[aã]o informada$/i.test(original) };
  let curso = texto;
  // Remover da direita para não deslocar os índices da fonte normalizada.
  for (const a of achados.sort((a,b) => b.inicio-a.inicio)) curso = curso.slice(0,a.inicio)+curso.slice(a.fim);
  curso = curso.replace(/[()]/g,' ').replace(/\s+/g,' ').replace(/^[\s/.,;:–—-]+|[\s/.,;:–—-]+$/g,'').trim();
  curso = curso.replace(/\s+(?:da|do|de)$/i,'').trim();
  return { instituicao: nomes[0], curso, original, revisar: false };
}

// Instituições novas são permitidas, desde que não misturem curso ou outra instituição.
export function validarVinculo(instituicao, curso) {
  if ([instituicao,curso].some(v => typeof v !== 'string' || v.length > 500)) return 'Instituição e curso devem ser textos de até 500 caracteres.';
  if (curso.trim() && !instituicao.trim()) return 'Informe a instituição do curso/programa.';
  if (instituicoesDoTexto(instituicao).length > 1 || instituicoesDoTexto(curso).length > 1) return 'Selecione uma instituição por vínculo de curso/programa.';
  const i = separarVinculo(instituicao), c = separarVinculo(curso);
  if (i.instituicao && i.curso) return 'Informe apenas a instituição; use o campo Curso/programa para a formação.';
  if (i.instituicao && c.instituicao && i.instituicao !== c.instituicao) return 'O curso/programa informa uma instituição diferente da selecionada.';
  if (c.instituicao && !i.instituicao && normalizarTexto(instituicao) !== normalizarTexto(c.instituicao)) return 'O curso/programa informa uma instituição diferente da selecionada.';
  return null;
}

export function prepararVinculo(instituicao, curso = '') {
  const separado = separarVinculo(instituicao);
  const cursoSeparado = separarVinculo(curso);
  return { instituicao: separado.instituicao || instituicao.trim(), curso: cursoSeparado.instituicao ? cursoSeparado.curso : curso.trim() };
}
