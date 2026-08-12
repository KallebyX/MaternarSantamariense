# Deploy na VM (rede privada / VPN)

A plataforma é autocontida: **Node.js + SQLite** — sem serviços externos, ideal para
uma VM acessada via VPN. Um único processo serve a API (`/api/*`), o frontend
(`index.html`) e o acervo de documentos (`acervo/`).

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

Novos cadastros entram como **Pendente** até aprovação de um Gestor/Admin
(`POST /api/usuarios/:id/aprovar`). Sem SMTP na VM, a recuperação de senha
registra a solicitação nos logs para a coordenação atender.

## Mapa da API

Respostas no envelope `{ ok, dados, erro }`. Autenticação: `Authorization: Bearer <token>`.

| Método e rota | Acesso | Descrição |
|---|---|---|
| GET /api/saude | público | healthcheck |
| POST /api/auth/login · /registro · /recuperar | público | autenticação |
| GET /api/auth/eu | autenticado | dados do usuário logado |
| PUT /api/usuarios/eu · /eu/senha | autenticado | perfil e troca de senha |
| GET /api/usuarios · POST /:id/aprovar · /:id/desativar · /convite | Gestor+ | gestão de usuários |
| PUT /api/usuarios/:id/perfil | Admin | promover/rebaixar perfil |
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
| GET /api/admin/logs · /backup · /estatisticas | Admin | administração |

## Testes

```bash
cd backend && npm test    # 16 testes, banco em memória
```
