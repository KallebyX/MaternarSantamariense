# Deploy na VM (rede privada / VPN)

A plataforma é autocontida: **Node.js + SQLite** — sem serviços externos, ideal para
uma VM acessada via VPN. Um único processo serve a API (`/api/*`), o frontend
(landing em `/`, plataforma em `/app`, painel de gestão em `/painel`), os arquivos
enviados pelo painel (`/uploads/*`) e o acervo de documentos (`acervo/`).

## Opção A — script automatizado (systemd + nginx, recomendado)

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
JWT_SECRET=$(openssl rand -hex 32) docker compose up -d --build
```

A API fica em `127.0.0.1:3000`; exponha com o nginx da VM
(`deploy/nginx.conf`) ou ajuste o `ports:` para a interface da VPN.

## Opção C — manual

```bash
cd backend
cp .env.example .env             # edite JWT_SECRET (openssl rand -hex 32)
npm install --omit=dev
npm start                        # cria o schema e popula o banco na 1ª subida
```

## Páginas servidas

| Rota | Arquivo | Para quem |
|---|---|---|
| `/` | `index.html` | landing pública: apresentação, login, solicitação de acesso e verificação de certificado |
| `/app` | `app.html` | plataforma (protótipo) usada pelos profissionais |
| `/painel` | `painel.html` + `painel.js` | painel de gestão (Gestor/Admin): equipe, senhas, uploads e CRUD de todo o conteúdo |
| `/uploads/<arquivo>` | `backend/data/uploads/` | arquivos enviados pelo painel |

Em hospedagem estática (Netlify/GitHub Pages) o `_redirects` mantém os mesmos
apelidos; sem backend, a landing exibe os números de referência e os formulários
avisam que o acesso é pela rede da Prefeitura.

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
  `GET /api/admin/backup` (Administrador), que baixa o banco inteiro em JSON.
- Re-seed: o seed é idempotente; apagar o `.db` e reiniciar recria tudo.

## Usuários iniciais (troque as senhas!)

| Perfil | E-mail | Senha |
|---|---|---|
| Profissional | ana.ferraz@maternarsm.com.br | demo1234 |
| Gestor | maria.rocha@maternarsm.com.br | demo1234 |
| Administrador | kalleby@maternarsm.com.br | demo1234 |

Novos cadastros feitos pela landing entram como **Pendente** até aprovação de um
Gestor/Admin (`POST /api/usuarios/:id/aprovar`).

Como não há SMTP na VM, **quem cria a senha da equipe é o próprio Gestor/Admin**,
no painel (Equipe e senhas):

- *Convidar profissional* cria a conta já **Ativa** com a senha digitada pelo
  gestor — ou, se o campo ficar em branco, com uma senha sugerida pela plataforma.
  A senha aparece uma única vez na tela, para repasse pessoal.
- *Senha* redefine a senha de qualquer pessoa da equipe (um Gestor não altera
  contas de Administrador; só outro Administrador faz isso).
- Por padrão a senha entra marcada como provisória: a pessoa vê um aviso e troca
  em “Meu perfil”. Desmarque “Exigir troca” para manter a senha combinada.
- Política mínima de senha: 8 caracteres, com letras e números.

## Mapa da API

Respostas no envelope `{ ok, dados, erro }`. Autenticação: `Authorization: Bearer <token>`.

| Método e rota | Acesso | Descrição |
|---|---|---|
| GET /api/saude | público | healthcheck |
| POST /api/auth/login · /registro · /recuperar | público | autenticação |
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
| GET /api/cursos · /cursos/:id · /qualifica · /conquistas | público | catálogo |
| GET /api/progresso · POST /api/cursos/:id/aulas/:ordem/concluir | autenticado | progresso (+40 XP/aula) |
| POST /api/certificados · GET /api/certificados/meus | autenticado | emissão (curso completo) |
| GET /api/certificados/verificar/:codigo | público | verificação anti-fraude |
| GET /api/produtos · POST /:id/visualizacao · /:id/download | público | contadores PPGSMI |
| GET /api/eventos · POST /api/eventos | público / autenticado | agenda |
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
`GET /api/<recurso>/:id`, `POST`, `PUT` e `DELETE`. Leitura é pública (a landing e
o protótipo consomem sem token) e escrita exige **Gestor+**:

`politicas`, `materiais`, `cursos`, `aulas`, `qualifica-modulos`,
`qualifica-recursos`, `trilhas`, `produtos`, `documentos`, `protocolos`, `links`,
`eventos`, `projetos`, `notificacoes`, `conquistas`, `canais`, `tarefas`.

Filtros aceitos na listagem: `?q=` (busca textual) e o campo de vínculo — por
exemplo `?politica_id=3`, `?curso_id=c1`, `?modulo_id=2`, `?categoria=`, `?setor=`.
Violação de restrição do banco (duplicado, vínculo inexistente, valor fora da
lista) volta como **409** ou **400** com mensagem legível, não como erro 500.

## Testes

```bash
cd backend && npm test    # 33 testes, banco em memória
```

Cobrem autenticação e perfis, o acervo e os projetos do NEPeS, certificados,
criação de senha pelo gestor, upload/remoção de arquivos e o CRUD dos conteúdos.
