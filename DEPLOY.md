# Publicação da plataforma

## Ambiente institucional — Portainer da UFN

O destino informado nesta tarefa usa Portainer + Nginx Proxy Manager. Siga o
[roteiro específico](deploy/portainer/README.md), com `deploy/portainer/stack.yml`
e o pacote sem segredos em `dist/portainer-ufn-20260929-acervo1/`. Ele usa a imagem construída no
ambiente `dockerapps`, volume persistente externo e porta interna 8035. O domínio
escolhido é `maternarsantamariense.app.ufn.edu.br`.

As opções abaixo são alternativas para uma VM própria. Não use o `build:` do
`docker-compose.yml` raiz no Web editor de uma stack sem disponibilizar o código
no host; o YAML específico do Portainer usa uma imagem já construída.

A aplicação usa **Node.js + SQLite**, com SMTP institucional para entrega de e-mails.
O ambiente da UFN está publicado por HTTPS. Consulte [configuração de e-mail](EMAIL-ACESSO.md). Um único processo serve a API (`/api/*`), o frontend
(landing em `/`, plataforma em `/app`, painel de gestão em `/painel`), os arquivos
enviados pelo painel (`/uploads/*`) e o acervo de documentos (`acervo/`).

## Opção A — VM própria com systemd + nginx

Na VM (Debian/Ubuntu, como root):

```bash
git clone https://github.com/KallebyX/MaternarSantamariense.git /opt/maternar
sudo bash /opt/maternar/deploy/deploy.sh
```

O script instala dependências, cria o usuário de serviço, gera o `JWT_SECRET`
(em `/etc/maternar/env`), sobe o serviço `maternar` no systemd e configura o
nginx como proxy na porta 80. Acesse pelo IP da VM dentro da VPN.

Atualização: rode o mesmo script de novo (faz `git pull` e reinicia).

## Opção B — Docker Compose

```bash
git clone https://github.com/KallebyX/MaternarSantamariense.git
cd MaternarSantamariense
# Salve JWT_SECRET em um .env privado e estável; não gere outro a cada deploy.
docker compose up -d --build
```

A API fica em `127.0.0.1:3000`; exponha com o nginx da VM
(`deploy/nginx.conf`) ou ajuste o `ports:` para a interface da VPN.

## Opção C — manual

```bash
cd backend
cp .env.example .env             # edite JWT_SECRET (openssl rand -hex 32)
npm ci --omit=dev
npm start                        # cria o schema e popula o banco na 1ª subida
```

## Páginas servidas

| Rota | Arquivo | Para quem |
|---|---|---|
| `/` | `index.html` | landing pública: apresentação, login, solicitação de acesso e verificação de certificado |
| `/app` | `app.html` | plataforma ligada à API usada pelos profissionais |
| `/painel` | `painel.html` + `painel.js` | painel de gestão (Gestor/Admin): equipe, senhas, uploads e CRUD de todo o conteúdo |
| `/uploads/<arquivo>` | `backend/data/uploads/` | arquivos enviados pelo painel |

A operação completa exige este backend. Hospedagem puramente estática não fornece autenticação, banco ou APIs. O servidor publica somente os arquivos do frontend e os diretórios de conteúdo autorizados; o banco, os seeds e o código interno não são acessíveis por HTTP.

## Arquivos enviados pelo painel

- Ficam em `backend/data/uploads/` (configurável por `UPLOAD_DIR`) e são servidos
  em `/uploads/...`; os metadados vão para a tabela `arquivos`.
- Limite por arquivo: `UPLOAD_MAX_MB` (padrão 64). O `client_max_body_size` do
  nginx precisa acompanhar esse valor.
- Formatos aceitos: PDF, Word, PowerPoint, Excel/CSV, texto, imagens, MP4/WebM,
  MP3/M4A e ZIP.
- **Backup**: inclua `backend/data/` inteiro (banco + uploads) na rotina.

## Banco de dados

- SQLite em `backend/data/maternar.db` (WAL). Criado e populado
  automaticamente na primeira subida com os dados reais: 17 políticas de
  saúde, 96 materiais do acervo, 157 projetos do NEPeS, cursos, produtos etc.
- **Backup**: copie o arquivo `.db` (com o serviço parado) ou use o endpoint
  `GET /api/admin/backup` (Administrador), que exporta dados em JSON sem hashes e não substitui um backup restaurável.
- Backup restaurável sem parar o servidor: `node scripts/backup.mjs /caminho/privado/maternar-backup.db`. A API SQLite de backup gera uma cópia consistente, incluindo os hashes. Copie também os uploads.
- Restauração: pare o serviço, preserve uma cópia do diretório atual, coloque o backup como `backend/data/maternar.db` em um diretório sem WAL/SHM antigos, restaure os uploads e as permissões do usuário de serviço e reinicie.
- O seed inicial usa `app_meta` para não recriar conteúdos excluídos pela coordenação. Não apague o banco para atualizar o catálogo.

## Primeiro acesso

A inicialização normal não cria usuários demonstrativos nem senhas padrão. Em uma instalação nova, provisione o administrador com `node scripts/criar-admin.mjs`, recebendo JSON privado por stdin (nome, email e senha). Importe a equipe com `node scripts/importar-equipe.mjs`; use `--simular` para validar primeiro. Na entrega atual para a UFN, o volume `maternar-dados` já recebeu por backup privado os cinco profissionais e os administradores Luiz e Kalleby; não repita a importação nem recrie essas contas para essa implantação.

Novos cadastros feitos pela landing entram como **Pendente** até aprovação de um
Gestor/Admin (`POST /api/usuarios/:id/aprovar`).

Como não há SMTP na VM, **quem cria a senha da equipe é o próprio Gestor/Admin**,
no painel (Equipe e senhas):

- *Convidar profissional* cria a conta já **Ativa** com a senha digitada pelo
  gestor — ou, se o campo ficar em branco, com uma senha sugerida pela plataforma.
  A senha aparece uma única vez na tela, para repasse pessoal.
- *Senha* redefine a senha de qualquer pessoa da equipe (um Gestor não altera
  contas de Administrador; só outro Administrador faz isso).
- Por padrão a senha entra marcada como provisória: a pessoa precisa trocar
  em “Meu perfil” antes de usar as demais funções autenticadas. Desmarque “Exigir troca” para manter a senha combinada.
- Política mínima de senha: 8 caracteres, com letras e números.

## Mapa da API

Respostas no envelope `{ ok, dados, erro }`. Autenticação: `Authorization: Bearer <token>`.

| Método e rota | Acesso | Descrição |
|---|---|---|
| GET /api/saude | público | healthcheck |
| POST /api/auth/login · /registro · /recuperar | público | autenticação |
| POST /api/auth/logout | autenticado | revoga sessões do usuário |
| GET /api/resumo | público | contagem de profissionais ativos |
| GET /api/auth/eu | autenticado | dados do usuário logado |
| PUT /api/usuarios/eu · /eu/senha | autenticado | perfil e troca de senha |
| GET /api/usuarios?q=&perfil=&situacao= · GET /:id | Gestor+ | equipe |
| POST /api/usuarios/convite | Gestor+ | cria acesso com a senha definida pelo gestor (ou sugerida) |
| POST /api/usuarios/:id/senha | Gestor+ | define/redefine a senha de alguém da equipe |
| PUT /api/usuarios/:id · POST /:id/aprovar · /:id/desativar · /:id/reativar | Gestor+ | cadastro e situação |
| PUT /api/usuarios/:id/perfil · DELETE /api/usuarios/:id | Admin | perfil de acesso e exclusão |
| GET /api/politicas · /politicas/:id/materiais?q= | público | acervo por política |
| POST /api/politicas/:id/materiais | Gestor+ | adicionar material |
| GET /api/projetos?q=&status= · POST /api/projetos · POST /:id/encerrar | público / Gestor+ | registro NEPeS |
| GET /api/cursos · /cursos/:id · /qualifica · /conquistas | público | catálogo; cursos somente publicados e com conteúdo |
| GET /api/cursos?gestao=1 · /cursos/:id?gestao=1 | Gestor+ | cursos e rascunhos para gestão |
| GET /api/aulas · /aulas/:id | Gestor+ | cadastro das aulas; consumo profissional pela rota do curso |
| GET /api/progresso · POST /api/cursos/:id/aulas/:ordem/concluir | autenticado | progresso (+40 XP/aula) |
| POST /api/certificados · GET /api/certificados/meus | autenticado | emissão (curso completo) |
| GET /api/certificados/verificar/:codigo | público | verificação anti-fraude |
| GET /api/produtos · POST /:id/visualizacao · /:id/download | público | contadores de produtos e ferramentas |
| GET /api/eventos · POST /api/eventos | público / Gestor+ | agenda |
| GET /api/canais · GET·POST /api/canais/:id/mensagens | autenticado | mensagens |
| GET /api/documentos?q= · POST /api/documentos | público / Gestor+ | documentos |
| GET /api/links · GET /api/protocolos | público | recursos |
| GET /api/notificacoes · POST /:id/lida | autenticado | notificações |
| GET /api/busca?q= | público | busca global por título e tag |
| GET /api/arquivos?q=&categoria= | público | biblioteca de uploads |
| POST /api/arquivos (multipart, campo `arquivo`) | Gestor+ | upload de treinamento, política, material, produto… |
| PUT · DELETE /api/arquivos/:id · POST /:id/download | Gestor+ / público | metadados, remoção e contador |
| GET /api/admin/logs · /backup · /estatisticas | Admin | administração |

### CRUD completo dos conteúdos

Cada recurso abaixo responde ao conjunto REST inteiro — `GET /api/<recurso>`,
`GET /api/<recurso>/:id`, `POST`, `PUT` e `DELETE`, com as exceções próprias de
cursos, notificações e projetos descritas nas rotas acima. Escrita exige **Gestor+**.
Aulas e tarefas exigem Gestor+ também na leitura; canais e notificações exigem
autenticação. Cursos públicos incluem apenas os publicados e completos; a gestão
de rascunhos usa `?gestao=1`. As demais bibliotecas de conteúdo têm leitura pública:

`politicas`, `materiais`, `cursos`, `aulas`, `qualifica-modulos`,
`qualifica-recursos`, `trilhas`, `produtos`, `documentos`, `protocolos`, `links`,
`eventos`, `projetos`, `notificacoes`, `conquistas`, `canais`, `tarefas`.

### Comunicação

`GET /api/canais/:id/mensagens` retorna as 50 mensagens mais recentes em ordem
crescente. `?antes=<id>` carrega mensagens anteriores; `?depois=<id>` carrega até
200 novas. A resposta inclui `meta.temAnteriores` e `meta.maisNovas`. Os cursores
não podem ser usados juntos. Mensagens só são acessíveis com sessão válida.

`POST` recebe `texto` (string não vazia, até 2.000 caracteres) e `clientId`
opcional. O frontend envia um identificador aleatório por mensagem; repetir a
mesma solicitação devolve o registro já persistido, sem duplicar. Reutilizar o
identificador para outro texto ou canal retorna 409. A autoria vem da sessão.

O navegador consulta novas mensagens a cada dois segundos enquanto a aba está
visível. Rascunhos por canal ficam em memória; recarregar ou fechar a aba os apaga.
Falhas exibem o estado de conexão e permitem tentar novamente. O chat usa HTTP
normal, sem configuração adicional de WebSocket. Os canais são compartilhados
com os profissionais da rede, inclusive o canal da coordenação.

Filtros aceitos na listagem: `?q=` (busca textual) e o campo de vínculo — por
exemplo `?politica_id=3`, `?curso_id=c1`, `?modulo_id=2`, `?categoria=`, `?setor=`.
Violação de restrição do banco (duplicado, vínculo inexistente, valor fora da
lista) volta como **409** ou **400** com mensagem legível, não como erro 500.

## Testes

```bash
cd backend && npm test    # testes de API, importação e arquivos
npm run test:e2e          # jornadas reais no navegador; banco separado
```

Cobrem autenticação e perfis, o acervo e os projetos do NEPeS, certificados,
criação de senha pelo gestor, upload/remoção de arquivos e o CRUD dos conteúdos.


## Verificações após publicar

Verifique `/`, `/app`, `/painel`, `/api/saude`, um arquivo real de `acervo/` e um upload. Teste login, carregamento do perfil, edição/releitura, publicação de conteúdo pelo gestor e acesso pelo profissional. `/backend/data/maternar.db`, `/backend/.env` e `/backend/seeds/PERFIS.json` devem retornar 404. Healthcheck sozinho não comprova a jornada completa.

Defina `TRUST_PROXY=1` somente quando o processo estiver atrás de um único proxy confiável. Mantenha o Node ouvindo em localhost e use HTTPS no endereço de publicação. Docker usa um volume persistente para banco/uploads; o proxy deve encaminhar `/uploads` ao processo para acessar esse volume.

A imagem Docker inclui landing, plataforma, painel, scripts, estilos, logos e todos os diretórios do acervo. O computador local não tem Docker; a imagem de entrega foi construída diretamente no ambiente da UFN pela API autenticada do Portainer. Consulte `PROGRESS.md` para o resultado dos testes remotos e o estado da publicação.
