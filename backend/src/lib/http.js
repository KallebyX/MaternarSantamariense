// Helpers de validação e resposta padronizada
export function erro(res, status, mensagem) {
  return res.status(status).json({ ok: false, dados: null, erro: mensagem });
}

export function ok(res, dados, meta) {
  const corpo = { ok: true, dados, erro: null };
  if (meta) corpo.meta = meta;
  return res.json(corpo);
}

/** Valida campos obrigatórios do body; devolve mensagem de erro ou null. */
export function exigir(body, campos) {
  for (const c of campos) {
    const v = body?.[c];
    if (v !== null && v !== undefined && !['string','number'].includes(typeof v)) return `Campo inválido: ${c}`;
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim())) {
      return `Campo obrigatório: ${c}`;
    }
  }
  return null;
}

export const emailValido = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ''));

/** Aceita endereços web e caminhos locais, após a mesma normalização do navegador. */
export function urlValida(valor) {
  if (typeof valor !== 'string' || /[\u0000-\u001f\u007f\\]/.test(valor)) return false;
  try {
    const url = new URL(valor.trim(), 'https://maternar.local/');
    return ['https:', 'http:'].includes(url.protocol);
  } catch { return false; }
}

export const tagsValidas = valor => Array.isArray(valor) && valor.every(v => typeof v === 'string');

export function validarTextos(corpo, campos) {
  for (const campo of campos) {
    if (corpo?.[campo] !== undefined && typeof corpo[campo] !== 'string') return `Campo inválido: ${campo}`;
  }
  if (corpo?.nome !== undefined && !corpo.nome.trim()) return 'Informe o nome.';
  return null;
}

export const SENHA_MINIMA = 8;

/** Devolve mensagem de erro se a senha não atender à política, ou null. */
export function senhaFraca(senha) {
  const s = String(senha ?? '');
  if (Buffer.byteLength(s, 'utf8') > 72) return 'A senha deve ter no máximo 72 bytes.';
  if (s.length < SENHA_MINIMA) return `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`;
  if (!/[A-Za-zÀ-ÿ]/.test(s) || !/\d/.test(s)) return 'A senha deve combinar letras e números.';
  return null;
}
