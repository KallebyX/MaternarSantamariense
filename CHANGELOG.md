# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Planejado
- Notificações push (PWA)
- Relatórios exportáveis (PDF/Excel)
- Integração com e-SUS
- App mobile (React Native)

---

## [2.0.0] - 2025-01-13

### Resumo
Versão de produção completa com todas as funcionalidades implementadas, incluindo sistema de gamificação, LMS, chat em tempo real, gestão de projetos e painel administrativo.

### Adicionado

#### Backend
- **Sistema de Autenticação Completo**
  - JWT com access token (7 dias) e refresh token (30 dias)
  - Bcrypt com 12 rounds para hash de senhas
  - Sistema RBAC com 3 roles (Admin, Manager, User)

- **API GraphQL Completa**
  - 30+ queries implementadas
  - 15+ mutations implementadas
  - 3 subscriptions para real-time

- **Sistema de Gamificação**
  - XP e níveis (100+ níveis)
  - 10+ conquistas desbloqueáveis
  - Ranking/leaderboard global
  - Streaks de login

- **Sistema de Cursos (LMS)**
  - 12 cursos de capacitação em saúde
  - 26 aulas com suporte a vídeo
  - Progresso individual por usuário
  - Sistema de certificados

- **Chat em Tempo Real**
  - WebSocket via Socket.IO
  - 6 canais (públicos e privados)
  - Suporte a arquivos e imagens
  - Indicadores de digitação e presença

- **Gestão de Projetos**
  - Kanban board completo
  - Tasks com prioridades e status
  - Membros de projeto com roles
  - Subscriptions para atualizações

- **Calendário e Eventos**
  - CRUD completo de eventos
  - Sistema de convites (RSVP)
  - Tipos: reunião, treinamento, deadline, feriado

- **Biblioteca de Políticas**
  - Documentos versionados
  - Controle de leitura obrigatória
  - Sistema de acknowledgment

- **Cache e Performance**
  - Redis para cache de sessões
  - Cache de queries frequentes
  - Connection pooling com Prisma

#### Frontend
- **18 Páginas Implementadas**
  - Dashboard, Profile, Training, Chat
  - Calendar, Projects, Gamification
  - Analytics, Policies, Links
  - Settings, Admin, Documents
  - CourseDetail, ProjectDetail, UserManagement
  - Login, NotFound

- **Componentes UI**
  - 18+ componentes base reutilizáveis
  - Sistema de Toast notifications
  - Modais de formulário
  - Loading states e skeletons

- **Funcionalidades UX**
  - Busca global (Cmd/Ctrl+K)
  - Centro de notificações real-time
  - PDF Viewer integrado
  - Upload drag & drop
  - Gráficos interativos (Recharts)

- **8 Custom Hooks**
  - useAuth, useCourses, useChat
  - useProjects, useCalendar
  - useGamification, usePolicies, useLinks

- **Acessibilidade**
  - ARIA labels completos
  - Navegação por teclado
  - Contraste WCAG 2.1 AA
  - Touch-friendly (44x44px mínimo)

#### Infraestrutura
- **Docker Compose** para desenvolvimento local
- **Kubernetes manifests** para produção
- **Render.yaml** para deploy rápido
- **GitHub Actions** para CI/CD

#### Banco de Dados
- **16 modelos Prisma** completos
- **Seed de dados realistas** (1000+ linhas)
  - 8 usuários diversificados
  - 12 cursos de saúde materno-infantil
  - 26 aulas com XP
  - 10 conquistas
  - 6 canais de chat
  - 8 eventos de calendário
  - 5 projetos com 15 tarefas
  - 6 políticas/documentos
  - 12 links úteis

### Alterado
- Migração completa de REST para GraphQL
- Refatoração de componentes para TypeScript strict
- Otimização de queries com Prisma
- Melhoria de performance com lazy loading

### Segurança
- Rate limiting (1000 req/15min)
- Helmet.js para headers de segurança
- CORS configurável por ambiente
- Input sanitization em todas as rotas
- Audit logging com Winston

---

## [1.0.0] - 2024-12-01

### Resumo
Versão inicial do sistema com estrutura base e funcionalidades principais em desenvolvimento.

### Adicionado

#### Backend
- Estrutura inicial Node.js + Express
- Configuração do Prisma ORM
- Schema inicial do banco de dados
- Autenticação básica com JWT
- Endpoints REST básicos

#### Frontend
- Estrutura React + Vite + TypeScript
- Configuração do Tailwind CSS
- Tema visual baseado na logo
- Componentes básicos de UI
- Roteamento com React Router
- Páginas placeholder

#### Infraestrutura
- Docker Compose inicial
- Configuração de ambiente de desenvolvimento
- Scripts de inicialização

### Limitações da v1.0.0
- Dados mock em todas as páginas
- Sem integração real com backend
- Sem WebSocket/real-time
- Sem sistema de cache
- Documentação incompleta

---

## Tipos de Mudanças

- **Adicionado** para novas funcionalidades
- **Alterado** para mudanças em funcionalidades existentes
- **Descontinuado** para funcionalidades que serão removidas
- **Removido** para funcionalidades removidas
- **Corrigido** para correções de bugs
- **Segurança** para vulnerabilidades corrigidas

---

## Links

- [Comparar versões](https://github.com/seu-repo/MaternarSantamariense/compare)
- [Releases](https://github.com/seu-repo/MaternarSantamariense/releases)

---

## Contribuidores

- **Equipe de Desenvolvimento** - Arquitetura e implementação
- **Equipe Maternar Santa Maria** - Requisitos e validação

---

## Licença

Proprietário © 2025 Maternar Santa Mariense
