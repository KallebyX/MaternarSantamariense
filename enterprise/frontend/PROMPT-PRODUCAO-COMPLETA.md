# 🚀 Prompt Completo - Sistema Maternar Santamariense em Produção

## Contexto
Tenho um sistema de gestão hospitalar para maternidade chamado "Maternar Santamariense" que atualmente funciona apenas com dados mockados. Preciso que TUDO funcione em produção real, com backend funcional, banco de dados, autenticação real e todas as funcionalidades operacionais.

## Stack Atual
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Apollo Client
- **Backend**: Node.js + Express + GraphQL + TypeScript (estrutura básica existe)
- **Banco de Dados**: PostgreSQL (configurado mas não implementado)
- **Autenticação**: JWT (estrutura existe mas usa mock)

## O que precisa ser feito:

### 1. Backend Completo e Funcional
- Implementar TODOS os resolvers GraphQL que atualmente retornam dados mockados
- Conectar corretamente com PostgreSQL usando Prisma ou TypeORM
- Implementar autenticação real com JWT e bcrypt
- Criar sistema de permissões (ADMIN, USER, MANAGER)
- Implementar upload de arquivos para avatares e documentos
- WebSockets para chat em tempo real
- Sistema de notificações push

### 2. Banco de Dados
- Criar todas as tabelas necessárias:
  - users (com campos: id, email, password, firstName, lastName, position, department, avatar, role, etc)
  - projects (gestão de projetos hospitalares)
  - courses (sistema de treinamento)
  - policies (políticas e protocolos)
  - calendar_events (agenda)
  - chat_messages (mensagens)
  - gamification (pontos, badges, conquistas)
  - health_assessments (avaliações de saúde)
  - notifications
- Implementar relacionamentos corretos
- Criar migrations e seeders com dados iniciais

### 3. Funcionalidades que DEVEM funcionar:

#### Sistema de Login
- Login real com email/senha
- Recuperação de senha por email
- Sessão persistente
- Logout funcional

#### Dashboard
- Estatísticas reais do banco de dados
- Gráficos com dados verdadeiros
- Widgets atualizando em tempo real

#### Gestão de Usuários
- CRUD completo de usuários
- Upload de foto de perfil
- Diferentes níveis de acesso

#### Chat/Mensagens
- Chat em tempo real usando Socket.io
- Histórico de mensagens persistente
- Notificações de novas mensagens
- Status online/offline real

#### Gamificação
- Sistema de pontos real
- Conquistas desbloqueáveis
- Ranking atualizado dinamicamente
- Histórico de atividades

#### Agenda/Calendário
- Criar, editar, deletar eventos
- Notificações de compromissos
- Integração com Google Calendar (opcional)

#### Qualifica Profissional
- Sistema de cursos com progresso real
- Upload de certificados
- Tracking de tempo de estudo
- Avaliações e quizzes

#### Projetos
- Gestão completa de projetos
- Kanban board funcional
- Comentários e anexos
- Timeline de atividades

### 4. Integrações Necessárias
- Email (SendGrid ou similar) para:
  - Confirmação de cadastro
  - Recuperação de senha
  - Notificações
- Storage (S3 ou similar) para arquivos
- Push notifications (OneSignal ou FCM)

### 5. Configurações de Produção
- Variáveis de ambiente corretas
- CORS configurado
- Rate limiting
- Logs estruturados
- Monitoramento (Sentry ou similar)
- Cache (Redis) para performance

### 6. Deploy
- Dockerizar toda aplicação
- docker-compose para desenvolvimento
- Configurar CI/CD (GitHub Actions)
- Deploy no Railway, Render ou AWS
- Domínio personalizado com HTTPS

### 7. Segurança
- Sanitização de inputs
- Proteção contra SQL injection
- Rate limiting por IP
- Headers de segurança
- Validação de dados no backend

## Dados do Sistema

### Usuário Admin Padrão
- Email: admin@maternarsantamariense.com
- Nome: Laura Pellegrin
- Cargo: Acadêmica de Enfermagem | Bolsista PROBIC
- Senha: (você define uma segura)

### Estrutura de Permissões
- **ADMIN**: Acesso total
- **MANAGER**: Gestão de equipes e projetos
- **USER**: Acesso básico

## Resultado Esperado
Um sistema COMPLETAMENTE FUNCIONAL em produção onde:
- Usuários podem fazer login com credenciais reais
- Todos os dados são persistidos no banco
- Chat funciona em tempo real
- Notificações são enviadas
- Upload de arquivos funciona
- Sistema de pontos e gamificação é calculado dinamicamente
- Todas as funcionalidades CRUD funcionam
- Sistema está pronto para uso real em produção

## Observações Importantes
1. O frontend já está pronto e usa Apollo Client - mantenha compatibilidade
2. As queries e mutations GraphQL já estão definidas no frontend
3. O design e UX devem ser mantidos
4. Foque em fazer TUDO funcionar de verdade
5. Remova TODOS os mocks e dados falsos
6. O sistema deve estar pronto para ser usado por uma equipe hospitalar real

## Arquivos Importantes
- `/enterprise/backend/src/` - código do backend
- `/enterprise/frontend/src/graphql/` - queries e mutations
- `docker-compose.yml` - configuração Docker
- `.env.example` - variáveis de ambiente

Por favor, implemente TUDO que é necessário para ter um sistema hospitalar completo e funcional em produção. Não deixe NADA mockado ou fake. Queremos um sistema real, profissional e pronto para uso.

---

**IMPORTANTE**: Este é um sistema crítico de saúde. Toda funcionalidade deve ser implementada com cuidado, segurança e confiabilidade. Dados de pacientes e profissionais de saúde são sensíveis e devem ser protegidos adequadamente.