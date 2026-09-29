# Publicação HTTPS e e-mail — 29/09/2026

O Maternar está publicado em **https://maternarsantamariense.app.ufn.edu.br**.
O domínio abre a aplicação, com certificado válido, e o envio de acesso foi
comprovado do painel de produção até a caixa de entrada do destinatário autorizado.

## Publicação e integridade

- Nginx Proxy Manager: host **25**, destino `http://10.21.19.45:8035`, HTTPS
  obrigatório e HTTP/2. Certificado Let's Encrypt **42**, válido até
  **28/12/2026 17:08:50 UTC**. Os dois hosts preexistentes foram preservados.
- HTTP 301 agora aponta para o mesmo domínio em HTTPS, sem redirecionar ao site
  institucional genérico. API, landing, painel e plataforma responderam 200.
- Login administrativo real pelo domínio confirmado no navegador. Download de
  PDF público comparado byte a byte por SHA-256 com o arquivo original.
- `/backend/.env` e `/backend/data/maternar.db` continuam retornando 404.
- Stack **maternar (254)** no environment **dockerapps (5)**, imagem
  **maternar:20260929-email1**, saudável. Image ID:
  `sha256:e6fc603e117216c02d2949c2df95959b93d5b8c6580d88516e1ee77326b70f90`.
- Sete usuários, todos os seus campos e hashes de senha preservados na atualização;
  dois administradores e cinco profissionais. Volume `maternar-dados` mantido,
  integridade SQLite `ok`, zero violações de chave estrangeira.
- Somente imagem e novas variáveis necessárias ao SMTP/endereço público foram
  alteradas. Demais variáveis preservadas, sem exportação de segredos para arquivos.
- Backup privado anterior:
  `/app/backend/data/backups/pre-email1-1790706307136.db`.
  Imagem anterior disponível para retorno: `maternar:20260929-uxqa1`.

## Envio real comprovado

O remetente **maternar@ufn.edu.br** autenticou em `smtp.office365.com:587` usando
STARTTLS com validação de certificado, tanto no diagnóstico inicial quanto no
contêiner da UFN. A senha está nas variáveis privadas da stack e não está no código,
contexto Docker, exemplos, relatório ou backup JSON do painel.

O botão **Enviar acesso** foi acionado no painel público para o cadastro
do destinatário explicitamente autorizado para este teste, cujo endereço pessoal
foi omitido da documentação pública.
O servidor SMTP aceitou a mensagem. O conector Gmail confirmou:

- Assunto: **Seu acesso — Maternar Santa-mariense**.
- Remetente: **Maternar Santa-mariense <maternar@ufn.edu.br>**.
- Entrega na **caixa de entrada**, não na pasta de spam.
- Enviado em **29/09/2026 às 15:25:54 de Brasília**; cabeçalho de recebimento
  do Gmail registra **15:26:02**.
- **SPF, DKIM e DMARC: pass**.
- Link aponta para `/redefinir.html` no domínio público correto e contém token
  de uso único. Seu valor não foi incluído nesta evidência.
- A senha vigente de Kalleby não foi alterada e o link não foi consumido pela auditoria.

## Implementação

- Convite de profissional oferece envio opcional de link de acesso.
- Contas ativas existentes podem receber um novo link pelo painel, respeitando
  permissões de Gestor/Administrador e intervalo mínimo de um minuto.
- “Esqueci minha senha” usa SMTP real. Contas ausentes, pendentes e desativadas
  recebem a mesma resposta pública; o serviço não inventa envio sem configuração.
- Links válidos por uma hora, hash persistido no banco, consumo único e invalidação
  após mudanças de senha/sessão. A conclusão revoga sessões e outros links pendentes.
- Falha de SMTP é apresentada ao gestor e registrada por código seguro. Um convite
  já criado permanece salvo e pode ter o envio repetido pelo cadastro.
- Registros e backup inclui diagnóstico de conexão/autenticação sem enviar e-mail.
- Página de redefinição responsiva, confirmação da senha, erros visíveis, tratamento
  de link inválido e de abertura de novo link na mesma aba. Sem serviços externos.
- Landing descreve corretamente hospedagem na UFN e recuperação por e-mail.

Operação e configuração: [EMAIL-ACESSO.md](EMAIL-ACESSO.md).

## QA da versão final

| Verificação | Resultado | Evidência em `backend/test-results/` |
|---|---|---|
| API, incluindo 8 novos cenários de SMTP/recuperação | 91/91 aprovados | `email-api.tap` |
| Navegador Chromium, suíte completa | 47/47, sem ignorados ou retentativas | `email-chromium.json` |
| Navegador WebKit, suíte completa | 47/47, sem ignorados ou retentativas | `email-webkit.json` |
| Nova imagem em contêiner/volume isolados na UFN | CRUD, RBAC, arquivos, cursos, certificados, chat e reinício aprovados | `email-container.txt` |
| Atualização da stack e integridade | Healthy, usuários preservados, SMTP autenticado | `email-production.json` |
| Nginx/domínio/PDF | HTTPS, login observado, arquivos privados bloqueados, PDF íntegro | `nginx-publication.json`, `nginx-domain.json` |
| Arquivos públicos da versão final | SHA-256 igual ao código validado | `email-public-assets.json` |
| Recebimento real no Gmail | Inbox e autenticação do remetente confirmados | `email-delivery.json` |

Os testes cobrem convite → SMTP com TLS → mensagem recebida → link → redefinição
→ login em banco isolado, além de expiração, permissão, falhas e revogação. Os
fluxos existentes de chat, configurações, uploads, conteúdos, cursos e certificados
passaram novamente, incluindo layouts de 320, 390, 768 e 1440 pixels.

O primeiro teste focal revelou que abrir outro link na mesma aba não reiniciava
formulário/token. O tratamento de `hashchange` corrigiu o problema antes da imagem
final. As duas execuções completas posteriores passaram. O registro inicial foi
preservado em `email-focused.txt` para rastreabilidade.

Os servidores SMTP e dados sintéticos de teste ficam fora da imagem e da base
operacional. Os recursos temporários da validação na UFN foram removidos. Cursos,
aulas e certificados operacionais continuam zerados, prontos para cadastro real.

Pacote: `dist/portainer-ufn-20260929-email1/`, sem credenciais.
SHA-256 do contexto Docker:
`754dd86c933afac9b969e48108eab0f76916ce322e9cc50a5ad482c9cf44dd94`.
Servidor local atualizado em `http://127.0.0.1:3100`; envio institucional ativado
na stack de produção. A configuração local sem SMTP informa indisponibilidade.

A evidência comprova os cenários executados nesta versão; não constitui garantia
absoluta de disponibilidade futura de redes, caixas postais ou sites de terceiros.
