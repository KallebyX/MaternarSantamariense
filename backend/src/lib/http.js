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
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim())) {
      return `Campo obrigatório: ${c}`;
    }
  }
  return null;
}

export const emailValido = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ''));

export const SENHA_MINIMA = 8;

/** Devolve mensagem de erro se a senha não atender à política, ou null. */
export function senhaFraca(senha) {
  const s = String(senha ?? '');
  if (s.length < SENHA_MINIMA) return `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`;
  if (!/[A-Za-zÀ-ÿ]/.test(s) || !/\d/.test(s)) return 'A senha deve combinar letras e números.';
  return null;
}
