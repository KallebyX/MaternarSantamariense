import { SMTPServer } from 'smtp-server';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Servidor SMTP real de teste, isolado em loopback; STARTTLS obrigatório.
export async function smtpLocal() {
  const dir = mkdtempSync(join(tmpdir(), 'maternar-smtp-test-'));
  const key = join(dir, 'key.pem'), cert = join(dir, 'cert.pem');
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key,
    '-out', cert, '-days', '2', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { stdio: 'ignore' });
  const state = { messages: [], reject: false, tls: false };
  const ca = readFileSync(cert);
  const server = new SMTPServer({
    key: readFileSync(key), cert: ca, logger: false,
    onAuth(auth, session, callback) {
      state.tls = session.secure;
      callback(auth.username === 'smtp-test' && auth.password === 'smtp-test-password' && session.secure
        ? null : new Error('Authentication refused'), { user: auth.username });
    },
    onData(stream, session, callback) {
      let raw = ''; stream.on('data', chunk => { raw += chunk.toString(); });
      stream.on('end', () => {
        if (state.reject) return callback(Object.assign(new Error('Message rejected'), { responseCode: 550 }));
        const [headers, ...parts] = raw.split('\r\n\r\n');
        const body = parts.join('\r\n\r\n');
        const text = /Content-Transfer-Encoding: base64/i.test(headers)
          ? Buffer.from(body.replace(/\s/g, ''), 'base64').toString()
          : body.replace(/=\r?\n/g, '').replace(/=([a-f0-9]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        state.messages.push({ to: session.envelope.rcptTo[0].address, text, raw });
        callback();
      });
    },
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { state, config: { enabled: true, host: 'localhost', port: server.server.address().port, secure: false,
    user: 'smtp-test', password: 'smtp-test-password', from: 'maternar@example.test', ca },
    async close() { await new Promise(resolve => server.close(resolve)); rmSync(dir, { recursive: true, force: true }); } };
}
