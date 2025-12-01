<p align="center">
  <img src="logo.JPG" alt="Maternar Santa Mariense" width="200" />
</p>

<h1 align="center">Maternar Santa Mariense</h1>

<p align="center">
  <strong>Plataforma Enterprise de Gestão em Saúde Materno-Infantil</strong>
</p>

<p align="center">
  <a href="#-sobre">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-início-rápido">Início Rápido</a> •
  <a href="#-documentação">Documentação</a> •
  <a href="#-deploy">Deploy</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/status-production-green.svg" alt="Status" />
  <img src="https://img.shields.io/badge/license-proprietary-red.svg" alt="License" />
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node" />
  <img src="https://img.shields.io/badge/typescript-5.0+-blue.svg" alt="TypeScript" />
</p>

---

## Sobre

O **Maternar Santa Mariense** é uma plataforma empresarial completa desenvolvida para gestão, educação continuada e comunicação em instituições de saúde materno-infantil. O sistema integra múltiplos módulos essenciais para a operação hospitalar moderna, incluindo sistema de aprendizagem (LMS), gestão de projetos, comunicação em tempo real, gamificação e muito mais.

### Principais Características

- **Sistema de Aprendizagem (LMS)** - Cursos, certificados e trilhas de capacitação
- **Gamificação Completa** - XP, níveis, conquistas e ranking entre colaboradores
- **Chat em Tempo Real** - Comunicação instantânea via WebSocket
- **Gestão de Projetos** - Kanban board com tarefas e equipes
- **Calendário Integrado** - Eventos, reuniões e convites
- **Biblioteca de Políticas** - Documentos versionados com controle de leitura
- **Painel Administrativo** - Gestão completa do sistema

---

## Funcionalidades

### Sistema de Aprendizagem (LMS)

| Recurso | Descrição |
|---------|-----------|
| Cursos | 12+ cursos de capacitação em saúde materno-infantil |
| Aulas | Sistema de aulas com vídeos e materiais |
| Progresso | Acompanhamento individual de progresso |
| Certificados | Emissão automática após conclusão |
| XP | Sistema de pontuação por aula completada |

### Gamificação

| Recurso | Descrição |
|---------|-----------|
| XP & Níveis | Sistema de experiência com 100+ níveis |
| Conquistas | 10+ badges desbloqueáveis |
| Ranking | Leaderboard global de colaboradores |
| Streaks | Sequência de login com recompensas |

### Comunicação

| Recurso | Descrição |
|---------|-----------|
| Chat Real-time | Mensagens instantâneas via WebSocket |
| Canais | Públicos, privados e mensagens diretas |
| Status Online | Indicador de presença em tempo real |
| Typing Indicator | Indicador de digitação |

### Gestão de Projetos

| Recurso | Descrição |
|---------|-----------|
| Kanban Board | Drag-and-drop de tarefas |
| Tarefas | TODO, Em Progresso, Revisão, Concluído |
| Prioridades | Urgente, Alta, Média, Baixa |
| Equipes | Membros com diferentes permissões |

### Calendário

| Recurso | Descrição |
|---------|-----------|
| Eventos | Reuniões, treinamentos, deadlines |
| Convites | Sistema de RSVP com confirmação |
| Lembretes | Notificações automáticas |
| Visualização | Dia, semana, mês |

### Administração

| Recurso | Descrição |
|---------|-----------|
| Usuários | CRUD completo com roles (Admin/Manager/User) |
| Permissões | Sistema RBAC granular |
| Métricas | Dashboard com KPIs do sistema |
| Logs | Auditoria de ações |

---

## Tecnologias

### Backend

```
Runtime:        Node.js 18+ (LTS)
Framework:      Express.js 4.18
API:            GraphQL (Apollo Server 4.10)
ORM:            Prisma 5.20
Database:       PostgreSQL 15
Cache:          Redis 7 + ioredis
Real-time:      Socket.IO 4.7
Auth:           JWT + Bcrypt (12 rounds)
Validation:     Joi, Zod
Email:          Nodemailer
Testing:        Vitest, Supertest
```

### Frontend

```
Framework:      React 18.2 + TypeScript
Build:          Vite 5.0
Styling:        Tailwind CSS 3.4
Components:     Radix UI, Headless UI
State:          Zustand 4.4, TanStack Query
Forms:          React Hook Form + Zod
GraphQL:        Apollo Client 3.14
Charts:         Recharts 2.15
Animations:     Framer Motion 10.16
i18n:           i18next (pt-BR)
Testing:        Vitest, Playwright
```

### Infraestrutura

```
Containers:     Docker + Docker Compose
Orchestration:  Kubernetes (manifests inclusos)
IaC:            Terraform templates
Hosting:        Render.com (Blueprint ready)
CI/CD:          GitHub Actions
```

---

## Início Rápido

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- Git

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/MaternarSantamariense.git
cd MaternarSantamariense

# Inicie os serviços (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# Execute as migrations (primeira vez)
docker-compose exec backend npx prisma migrate dev

# Popule o banco com dados de exemplo
docker-compose exec backend npm run db:seed:enhanced

# Acesse o sistema
open http://localhost:3000
```

### Credenciais de Teste

| Role | Email | Senha |
|------|-------|-------|
| **Admin** | admin@maternarsm.com.br | admin123 |
| **Gestora** | maria.coordenadora@maternarsm.com.br | user123 |
| **Enfermeira** | ana.enfermeira@maternarsm.com.br | user123 |
| **Pediatra** | joao.pediatra@maternarsm.com.br | user123 |

### URLs de Acesso

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | Aplicação web |
| GraphQL | http://localhost:4000/graphql | API GraphQL + Playground |
| Health | http://localhost:4000/health | Health check endpoint |

---

## Estrutura do Projeto

```
MaternarSantamariense/
├── enterprise/
│   ├── backend/                    # API Node.js + GraphQL
│   │   ├── src/
│   │   │   ├── graphql/           # Schema e Resolvers
│   │   │   │   ├── typeDefs.ts    # Definições GraphQL
│   │   │   │   ├── resolvers.ts   # Lógica de negócio
│   │   │   │   └── context.ts     # Contexto de requisição
│   │   │   ├── services/          # Serviços
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── course.service.ts
│   │   │   │   ├── cache.service.ts
│   │   │   │   └── socket.service.ts
│   │   │   ├── config/            # Configurações
│   │   │   ├── middleware/        # Middlewares Express
│   │   │   └── utils/             # Utilitários
│   │   ├── prisma/
│   │   │   └── schema.prisma      # Schema do banco
│   │   └── scripts/
│   │       └── seed-enhanced.ts   # Seeds de dados
│   │
│   ├── frontend/                   # React SPA
│   │   ├── src/
│   │   │   ├── components/        # Componentes React
│   │   │   │   ├── ui/           # Componentes base
│   │   │   │   ├── layout/       # Layout components
│   │   │   │   └── modals/       # Modais de formulário
│   │   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── hooks/            # Custom hooks
│   │   │   ├── graphql/          # Queries e Mutations
│   │   │   └── lib/              # Utilitários
│   │   └── public/                # Arquivos estáticos
│   │
│   ├── infrastructure/            # Configs de deploy
│   │   ├── kubernetes/           # Manifests K8s
│   │   └── terraform/            # IaC templates
│   │
│   └── microservices/             # Serviços standalone
│       ├── auth-service/
│       └── user-service/
│
├── docker-compose.yml             # Orquestração local
├── render.yaml                    # Deploy Render.com
└── docs/                          # Documentação adicional
```

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura do sistema |
| [API.md](./API.md) | Documentação da API GraphQL |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Guia de contribuição |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de versões |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Guia de deploy |

---

## Deploy

### Render.com (Recomendado)

O projeto inclui um `render.yaml` pronto para deploy:

```bash
# 1. Faça push para o GitHub
git push origin main

# 2. No Render Dashboard
# https://dashboard.render.com
# New → Blueprint → Conectar repositório

# 3. Configure as variáveis de ambiente
# CORS_ORIGINS, JWT_SECRET, etc.
```

**Estimativa de custos:**

| Plano | Custo/mês | Recursos |
|-------|-----------|----------|
| Free | $0 | Hiberna após 15min inatividade |
| Starter | $24 | Backend + PostgreSQL + Redis |
| Professional | $70 | Alta performance + SLA |

### Docker Local

```bash
# Desenvolvimento
docker-compose up -d

# Produção
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Aplicar manifests
kubectl apply -f enterprise/infrastructure/kubernetes/
```

---

## Comandos Úteis

### Docker

```bash
# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar serviços
docker-compose down

# Reset completo (remove volumes)
docker-compose down -v
```

### Backend

```bash
cd enterprise/backend

# Desenvolvimento
npm run dev

# Build
npm run build

# Prisma Studio (GUI do banco)
npx prisma studio

# Migrations
npx prisma migrate dev

# Seed de dados
npm run db:seed:enhanced
```

### Frontend

```bash
cd enterprise/frontend

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview do build
npm run preview

# Testes
npm test

# Testes E2E
npm run test:e2e
```

---

## Segurança

O sistema implementa múltiplas camadas de segurança:

| Recurso | Implementação |
|---------|---------------|
| Autenticação | JWT (7 dias) + Refresh Token (30 dias) |
| Senhas | Bcrypt com 12 rounds |
| Autorização | RBAC (Admin, Manager, User) |
| Rate Limiting | 1000 requests / 15 min |
| Headers | Helmet.js |
| CORS | Configurável por ambiente |
| Sanitização | Input sanitization middleware |

---

## Performance

| Otimização | Descrição |
|------------|-----------|
| Cache Redis | Sessions, queries, rankings |
| Connection Pool | Prisma connection pooling |
| Compressão | gzip em todas respostas |
| Code Splitting | Vite dynamic imports |
| Lazy Loading | Componentes carregados sob demanda |
| CDN Ready | Assets estáticos otimizados |

---

## Banco de Dados

### Modelos Prisma (16 entidades)

```
User              Usuários e autenticação
Course            Cursos do LMS
Lesson            Aulas dos cursos
CourseEnrollment  Matrículas
LessonCompletion  Progresso das aulas
Achievement       Conquistas
UserAchievement   Conquistas desbloqueadas
Message           Mensagens do chat
Channel           Canais de comunicação
ChannelMember     Membros dos canais
Event             Eventos do calendário
EventAttendee     Participantes de eventos
Project           Projetos
ProjectMember     Membros de projetos
Task              Tarefas
Policy            Políticas e documentos
```

---

## Paleta de Cores

O tema visual foi extraído da logo oficial:

```css
/* Cores principais */
--maternar-blue:   #1E4A7A;  /* Azul institucional */
--maternar-green:  #7AB844;  /* Verde saúde */
--maternar-pink:   #D42E5B;  /* Rosa maternidade */
--maternar-gray:   #9B9B9B;  /* Cinza neutro */
```

---

## Troubleshooting

### Porta ocupada

```bash
lsof -i :4000
kill -9 <PID>
```

### Erro de conexão com banco

```bash
docker-compose restart database
docker-compose ps  # Aguardar status "healthy"
```

### Reset completo

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npm run db:seed:enhanced
```

### Logs de debug

```bash
# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend
```

---

## Status do Projeto

```
Backend GraphQL     ████████████████████  100%
WebSocket/Realtime  ████████████████████  100%
Frontend UI         ████████████████████  100%
Gamificação         ████████████████████  100%
Sistema de Cursos   ████████████████████  100%
Chat em Tempo Real  ████████████████████  100%
Calendário          ████████████████████  100%
Gestão de Projetos  ████████████████████  100%
Políticas           ████████████████████  100%
Cache Redis         ████████████████████  100%
Segurança           ████████████████████  100%
Documentação        ████████████████████  100%
```

---

## Roadmap

### v2.1.0 (Próxima)
- [ ] Notificações push (PWA)
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Integração com e-SUS
- [ ] App mobile (React Native)

### v3.0.0 (Futuro)
- [ ] Módulo de telemedicina
- [ ] IA para triagem
- [ ] Integração com prontuário eletrônico
- [ ] Multi-tenancy

---

## Contribuição

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes sobre como contribuir com o projeto.

---

## Licença

**Proprietário** © 2025 Maternar Santa Mariense

Este software é proprietário e confidencial. Uso não autorizado é proibido.

---

## Suporte

- **Email**: suporte@maternarsm.com.br
- **Issues**: Use o GitHub Issues para reportar bugs
- **Documentação**: Consulte os arquivos `.md` no repositório

---

<p align="center">
  <strong>Maternar Santa Mariense v2.0.0</strong><br>
  <em>Tecnologia a serviço da saúde materno-infantil</em>
</p>

<p align="center">
  Desenvolvido com React, TypeScript, GraphQL e dedicação
</p>
