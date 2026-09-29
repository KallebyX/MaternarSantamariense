# E-mail de acesso do Maternar

O remetente é `maternar@ufn.edu.br`. O envio usa SMTP autenticado, com STARTTLS
obrigatório na porta 587, validação de certificado e TLS 1.2 ou superior.
A configuração pública do domínio UFN e a autenticação testada identificaram o
servidor `smtp.office365.com`. A TI pode fornecer outro servidor autorizado no futuro.

## Uso no painel

- Em **Equipe e senhas**, use **Enviar acesso** no cadastro ativo e confirme o
  destinatário. O endereço vem do cadastro, nunca de um campo livre do envio.
- Ao **Convidar profissional**, marque **Enviar link de acesso por e-mail**.
  Se o SMTP falhar, o cadastro permanece criado e o painel informa a falha;
  tente enviar novamente pelo cadastro depois de um minuto.
- O e-mail contém o endereço de login e um link para definir uma senha. Nenhuma
  senha existente é recuperada de seu hash ou incluída na mensagem.
- Solicitar/enviar um link não modifica a senha vigente. O link expira em uma hora,
  é de uso único e deixa de valer após alteração de senha, encerramento de sessão
  que invalide a versão de acesso ou desativação da conta. Ao usá-lo, as sessões
  anteriores e os demais links pendentes do usuário são invalidados.
- Em **Registros e backup**, **Verificar conexão de e-mail** verifica conexão,
  TLS e autenticação sem enviar mensagens. A aceitação SMTP não garante chegada
  na caixa de entrada; o destinatário deve confirmar recebimento ou conferir spam.

Na página inicial, **Esqueci minha senha** envia instruções somente para contas
ativas. A resposta é a mesma para e-mails ausentes, pendentes ou desativados.
Sem SMTP configurado, a página informa indisponibilidade. Há limite por IP e
intervalo mínimo de um minuto por conta; falhas ficam registradas sem segredo/token.

## Configuração privada

`PUBLIC_URL` deve ser a origem HTTPS pública, sem caminho, credencial ou parâmetros.
`SMTP_ENABLED=true`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
`SMTP_FROM` e `SMTP_PASSWORD` ficam nas variáveis privadas da stack. Para a UFN,
`SMTP_SECURE=false` significa STARTTLS obrigatório na porta 587; não significa
conexão sem criptografia. A senha também pode vir de `SMTP_PASSWORD_FILE` em
ambientes que montem um arquivo de segredo. Não inclua credenciais em pacotes,
imagem Docker, relatórios ou backups JSON do painel.

Os tokens são aleatórios de 256 bits; só seu hash é salvo no banco. O token vai
no fragmento do link, não no caminho/query que o proxy registra. A página remove
o fragmento da barra de endereço, não carrega serviços externos e não envia Referer.

## Verificação

A suíte da API exercita envio de mensagem pelo protocolo SMTP com STARTTLS e
certificado explicitamente confiado de um servidor local isolado, falha de envio,
permissões, preservação da senha, expiração, consumo único e revogação de sessão.
Os testes de navegador percorrem convite → mensagem recebida pelo servidor de
teste → link → nova senha → login, além de diagnóstico e estados inválidos.
Esse servidor, seus certificados e dados estão restritos aos testes e ficam fora
da imagem de produção. A aplicação não tem transporte simulado ou fallback de envio.
