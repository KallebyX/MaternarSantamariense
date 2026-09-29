let token = '';
const form = document.getElementById('redefinir');
const resultado = document.getElementById('resultado');
function mensagem(texto, erro = false) {
  resultado.textContent = texto;
  resultado.className = erro ? 'erro' : 'sucesso';
}
function lerLink() {
  token = location.hash.slice(1);
  history.replaceState(null, '', location.pathname);
  form.reset();
  form.hidden = !/^[a-f0-9]{64}$/.test(token);
  if (form.hidden) mensagem('Link inválido. Volte para o acesso e solicite um novo e-mail em “Esqueci minha senha”.', true);
  else mensagem('');
}
lerLink();
window.addEventListener('hashchange', lerLink);
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (form.senha.value !== form.confirmacao.value) return mensagem('As senhas não conferem.', true);
  const button = form.querySelector('button');
  button.disabled = true;
  button.textContent = 'Salvando…';
  try {
    const response = await fetch('/api/auth/redefinir', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, senhaNova: form.senha.value }),
    });
    const body = await response.json();
    if (!response.ok || !body.ok) throw new Error(body.erro || 'Não foi possível atualizar a senha.');
    form.reset(); form.hidden = true;
    mensagem(body.dados.mensagem);
  } catch (error) {
    mensagem(error instanceof TypeError ? 'Não foi possível conectar. Confira sua conexão e tente novamente.' : error.message, true);
  } finally { button.disabled = false; button.textContent = 'Salvar nova senha'; }
});
