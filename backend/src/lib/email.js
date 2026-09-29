import nodemailer from 'nodemailer';
import { randomBytes, createHash } from 'node:crypto';
import { config } from '../config.js';
import { db, registrarLog } from '../db/connection.js';
import { emailValido } from './http.js';

export const hashToken = token => createHash('sha256').update(token).digest('hex');
const VALIDADE_MS = 60 * 60 * 1000;

export function emailConfigurado() {
  try {
    const url = new URL(config.publicUrl);
    const localTeste = process.env.NODE_ENV === 'test' && ['localhost', '127.0.0.1'].includes(url.hostname);
    return !!(config.smtp.enabled && config.smtp.host && config.smtp.user && config.smtp.password
      && emailValido(config.smtp.from) && (url.protocol === 'https:' || localTeste)
      && !url.username && !url.password && !url.search && !url.hash && url.pathname === '/');
  } catch { return false; }
}

export function transporteEmail() {
  return nodemailer.createTransport({
    host: config.smtp.host, port: config.smtp.port, secure: config.smtp.secure,
    requireTLS: !config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.password },
    tls: { minVersion: 'TLSv1.2', ...(config.smtp.ca ? { ca: config.smtp.ca } : {}) },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    disableFileAccess: true, disableUrlAccess: true, logger: false, debug: false,
  });
}

// Somente códigos conhecidos: respostas SMTP podem conter destinatários ou segredos.
function falhaSegura(error) {
  return ['EAUTH', 'ETIMEDOUT', 'ECONNECTION', 'ESOCKET', 'EENVELOPE', 'EMESSAGE'].includes(error?.code)
    ? error.code : 'SMTP_ERROR';
}

export async function verificarEmail() {
  if (!emailConfigurado()) return { configurado: false, autenticado: false };
  const transport = transporteEmail();
  try { await transport.verify(); return { configurado: true, autenticado: true }; }
  catch (error) { return { configurado: true, autenticado: false, codigo: falhaSegura(error) }; }
  finally { transport.close(); }
}

export async function enviarAcesso(usuario, autor, motivo = 'acesso') {
  if (!emailConfigurado()) return { enviado: false, mensagem: 'Envio de e-mail indisponível. Procure a coordenação.' };
  if (usuario.situacao !== 'Ativo') return { enviado: false, mensagem: 'A conta precisa estar ativa para receber acesso.' };
  const agora = Date.now();
  if (db.prepare('SELECT 1 FROM acessos_email WHERE usuario_id = ? AND criado_em > ?').get(usuario.id, agora - 60000)) {
    return { enviado: false, mensagem: 'Aguarde um minuto antes de solicitar outro e-mail.' };
  }
  db.prepare('DELETE FROM acessos_email WHERE expira_em < ?').run(agora - 86400000);
  const token = randomBytes(32).toString('hex');
  const hash = hashToken(token);
  // Fragmento não é transmitido ao servidor web nem ao cabeçalho Referer.
  const link = new URL('/redefinir.html', config.publicUrl).href + '#' + token;
  db.prepare('INSERT INTO acessos_email (token_hash, usuario_id, token_version, criado_em, expira_em) VALUES (?, ?, ?, ?, ?)')
    .run(hash, usuario.id, usuario.token_version || 0, agora, agora + VALIDADE_MS);
  const transport = transporteEmail();
  try {
    const result = await transport.sendMail({
      from: { name: 'Maternar Santa-mariense', address: config.smtp.from },
      to: { name: usuario.nome, address: usuario.email },
      subject: motivo === 'recuperacao' ? 'Redefina sua senha — Maternar Santa-mariense' : 'Seu acesso — Maternar Santa-mariense',
      text: `Olá, ${usuario.nome}!\n\nSeu acesso ao Maternar Santa-mariense está disponível.\nE-mail de login: ${usuario.email}\n\nDefina sua senha pelo link abaixo, válido por 1 hora e para um único uso:\n${link}\n\nA solicitação não altera sua senha atual até a confirmação no link. Se você não esperava esta mensagem, ignore-a.\n\nPlataforma: ${config.publicUrl}\nEquipe Maternar Santa-mariense`,
    });
    if (!result.accepted?.some(address => String(address).toLowerCase() === usuario.email.toLowerCase())) {
      throw Object.assign(new Error('Destinatário não aceito'), { code: 'EENVELOPE' });
    }
    db.prepare('UPDATE acessos_email SET enviado = 1 WHERE token_hash = ?').run(hash);
    registrarLog(autor, 'enviar-acesso-email', `${usuario.email}: aceito pelo servidor SMTP`);
    return { enviado: true, mensagem: 'E-mail de acesso aceito pelo servidor. O link é válido por 1 hora; confira também a caixa de spam.' };
  } catch (error) {
    // Inutiliza o link mesmo se a conexão cair após a aceitação pelo servidor.
    db.prepare('UPDATE acessos_email SET usado_em = ? WHERE token_hash = ?').run(Date.now(), hash);
    registrarLog(autor, 'falha-email', falhaSegura(error));
    return { enviado: false, mensagem: 'O envio não foi confirmado. Aguarde um minuto e tente enviar novamente pelo cadastro da equipe.' };
  } finally { transport.close(); }
}
