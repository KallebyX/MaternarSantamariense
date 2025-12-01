# Documentação da API GraphQL

> Referência completa da API GraphQL do Maternar Santa Mariense

## Visão Geral

A API do sistema utiliza **GraphQL** sobre HTTP, com suporte a:

- **Queries** - Leitura de dados
- **Mutations** - Criação/atualização/exclusão
- **Subscriptions** - Dados em tempo real (WebSocket)

### Endpoint

```
Produção:    https://api.maternarsm.com.br/graphql
Desenvolvimento: http://localhost:4000/graphql
```

### Autenticação

Todas as requisições (exceto login/register) requerem um token JWT no header:

```http
Authorization: Bearer <seu-token-jwt>
```

---

## Índice

- [Autenticação](#autenticação)
- [Usuários](#usuários)
- [Cursos e Treinamentos](#cursos-e-treinamentos)
- [Gamificação](#gamificação)
- [Chat e Mensagens](#chat-e-mensagens)
- [Calendário e Eventos](#calendário-e-eventos)
- [Projetos e Tarefas](#projetos-e-tarefas)
- [Políticas e Documentos](#políticas-e-documentos)
- [Links](#links)
- [Analytics](#analytics)

---

## Autenticação

### Login

```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    refreshToken
    user {
      id
      name
      email
      role
      avatar
    }
  }
}
```

**Variáveis:**
```json
{
  "email": "admin@maternarsm.com.br",
  "password": "admin123"
}
```

**Resposta:**
```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "clx1234567890",
        "name": "Administrador",
        "email": "admin@maternarsm.com.br",
        "role": "ADMIN",
        "avatar": "https://..."
      }
    }
  }
}
```

### Register

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      name
      email
    }
  }
}

input RegisterInput {
  name: String!
  email: String!
  password: String!
  department: String
  position: String
}
```

### Refresh Token

```graphql
mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    token
    refreshToken
  }
}
```

### Logout

```graphql
mutation Logout {
  logout
}
```

---

## Usuários

### Usuário Atual (me)

```graphql
query Me {
  me {
    id
    name
    email
    role
    avatar
    department
    position
    xp
    level
    currentStreak
    longestStreak
    weeklyXp
    createdAt
    lastLoginAt
    isOnline
  }
}
```

### Buscar Usuário por ID

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    role
    avatar
    department
    position
    xp
    level
  }
}
```

### Listar Usuários

```graphql
query GetUsers($filter: UserFilter, $limit: Int, $offset: Int) {
  users(filter: $filter, limit: $limit, offset: $offset) {
    id
    name
    email
    role
    department
    isOnline
  }
}

input UserFilter {
  role: Role
  department: String
  search: String
}
```

### Atualizar Perfil

```graphql
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    name
    avatar
    department
    position
  }
}

input UpdateProfileInput {
  name: String
  avatar: String
  department: String
  position: String
  phone: String
}
```

---

## Cursos e Treinamentos

### Listar Cursos

```graphql
query GetCourses($category: String, $difficulty: Difficulty) {
  courses(category: $category, difficulty: $difficulty) {
    id
    title
    description
    category
    difficulty
    duration
    thumbnail
    xpReward
    totalLessons
    enrolledCount
    createdAt
  }
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}
```

### Buscar Curso por ID

```graphql
query GetCourse($id: ID!) {
  course(id: $id) {
    id
    title
    description
    category
    difficulty
    duration
    thumbnail
    xpReward
    lessons {
      id
      title
      description
      duration
      videoUrl
      order
      xpReward
    }
  }
}
```

### Meus Cursos (Matrículas)

```graphql
query GetMyCourses {
  myCourses {
    id
    progress
    completedAt
    enrolledAt
    course {
      id
      title
      thumbnail
      totalLessons
    }
    completedLessons {
      id
      lesson {
        id
        title
      }
      completedAt
    }
  }
}
```

### Matricular em Curso

```graphql
mutation EnrollInCourse($courseId: ID!) {
  enrollInCourse(courseId: $courseId) {
    id
    progress
    enrolledAt
    course {
      id
      title
    }
  }
}
```

### Completar Aula

```graphql
mutation CompleteLesson($lessonId: ID!) {
  completeLesson(lessonId: $lessonId) {
    id
    completedAt
    xpEarned
    lesson {
      id
      title
    }
  }
}
```

---

## Gamificação

### Listar Conquistas

```graphql
query GetAchievements {
  achievements {
    id
    title
    description
    icon
    xpReward
    type
    requirement
  }
}

enum AchievementType {
  COURSE_COMPLETION
  XP_MILESTONE
  LOGIN_STREAK
  SPECIAL
  COMMUNITY
}
```

### Minhas Conquistas

```graphql
query GetMyAchievements {
  myAchievements {
    id
    unlockedAt
    achievement {
      id
      title
      description
      icon
      xpReward
    }
  }
}
```

### Leaderboard

```graphql
query GetLeaderboard($limit: Int, $period: LeaderboardPeriod) {
  leaderboard(limit: $limit, period: $period) {
    rank
    user {
      id
      name
      avatar
      department
    }
    xp
    level
  }
}

enum LeaderboardPeriod {
  WEEKLY
  MONTHLY
  ALL_TIME
}
```

---

## Chat e Mensagens

### Listar Canais

```graphql
query GetChannels {
  channels {
    id
    name
    description
    type
    memberCount
    lastMessage {
      id
      content
      createdAt
      sender {
        name
      }
    }
  }
}

enum ChannelType {
  PUBLIC
  PRIVATE
  DIRECT
}
```

### Mensagens do Canal

```graphql
query GetMessages($channelId: ID!, $limit: Int, $before: ID) {
  channelMessages(channelId: $channelId, limit: $limit, before: $before) {
    id
    content
    type
    fileUrl
    createdAt
    sender {
      id
      name
      avatar
    }
  }
}

enum MessageType {
  TEXT
  FILE
  IMAGE
  SYSTEM
}
```

### Enviar Mensagem

```graphql
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    content
    type
    createdAt
    sender {
      id
      name
    }
  }
}

input SendMessageInput {
  channelId: ID!
  content: String!
  type: MessageType
  fileUrl: String
}
```

### Entrar em Canal

```graphql
mutation JoinChannel($channelId: ID!) {
  joinChannel(channelId: $channelId) {
    id
    name
  }
}
```

### Subscription: Nova Mensagem

```graphql
subscription OnMessageSent($channelId: ID!) {
  messageSent(channelId: $channelId) {
    id
    content
    type
    createdAt
    sender {
      id
      name
      avatar
    }
  }
}
```

### Subscription: Status Online

```graphql
subscription OnUserOnlineStatus {
  userOnlineStatus {
    userId
    isOnline
    lastSeen
  }
}
```

---

## Calendário e Eventos

### Listar Eventos

```graphql
query GetEvents($start: DateTime, $end: DateTime, $type: EventType) {
  events(start: $start, end: $end, type: $type) {
    id
    title
    description
    type
    startDate
    endDate
    location
    isAllDay
    organizer {
      id
      name
    }
    attendees {
      id
      status
      user {
        id
        name
        avatar
      }
    }
  }
}

enum EventType {
  MEETING
  TRAINING
  DEADLINE
  HOLIDAY
}
```

### Buscar Evento por ID

```graphql
query GetEvent($id: ID!) {
  event(id: $id) {
    id
    title
    description
    type
    startDate
    endDate
    location
    isAllDay
    organizer {
      id
      name
    }
    attendees {
      id
      status
      user {
        id
        name
        avatar
      }
    }
  }
}
```

### Criar Evento

```graphql
mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    id
    title
    startDate
    endDate
  }
}

input CreateEventInput {
  title: String!
  description: String
  type: EventType!
  startDate: DateTime!
  endDate: DateTime!
  location: String
  isAllDay: Boolean
  attendeeIds: [ID!]
}
```

### Atualizar Presença

```graphql
mutation UpdateEventAttendance($eventId: ID!, $status: AttendeeStatus!) {
  updateEventAttendance(eventId: $eventId, status: $status) {
    id
    status
  }
}

enum AttendeeStatus {
  PENDING
  ACCEPTED
  DECLINED
  MAYBE
}
```

### Deletar Evento

```graphql
mutation DeleteEvent($id: ID!) {
  deleteEvent(id: $id)
}
```

---

## Projetos e Tarefas

### Listar Projetos

```graphql
query GetProjects($status: ProjectStatus) {
  projects(status: $status) {
    id
    name
    description
    status
    priority
    startDate
    endDate
    progress
    memberCount
    taskCount
    owner {
      id
      name
    }
  }
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}
```

### Buscar Projeto por ID

```graphql
query GetProject($id: ID!) {
  project(id: $id) {
    id
    name
    description
    status
    priority
    startDate
    endDate
    progress
    members {
      id
      role
      user {
        id
        name
        avatar
      }
    }
    tasks {
      id
      title
      status
      priority
      assignee {
        id
        name
      }
    }
  }
}
```

### Meus Projetos

```graphql
query GetMyProjects {
  myProjects {
    id
    name
    status
    progress
    role
  }
}
```

### Criar Projeto

```graphql
mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    id
    name
    status
  }
}

input CreateProjectInput {
  name: String!
  description: String
  startDate: DateTime
  endDate: DateTime
  memberIds: [ID!]
}
```

### Tarefas do Projeto

```graphql
query GetTasks($projectId: ID!, $status: TaskStatus) {
  tasks(projectId: $projectId, status: $status) {
    id
    title
    description
    status
    priority
    dueDate
    assignee {
      id
      name
      avatar
    }
  }
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### Criar Tarefa

```graphql
mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    id
    title
    status
  }
}

input CreateTaskInput {
  projectId: ID!
  title: String!
  description: String
  status: TaskStatus
  priority: TaskPriority
  dueDate: DateTime
  assigneeId: ID
}
```

### Atualizar Tarefa

```graphql
mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
  updateTask(id: $id, input: $input) {
    id
    title
    status
    priority
  }
}

input UpdateTaskInput {
  title: String
  description: String
  status: TaskStatus
  priority: TaskPriority
  dueDate: DateTime
  assigneeId: ID
}
```

### Deletar Tarefa

```graphql
mutation DeleteTask($id: ID!) {
  deleteTask(id: $id)
}
```

### Subscription: Atualização de Tarefa

```graphql
subscription OnTaskUpdated($projectId: ID!) {
  taskUpdated(projectId: $projectId) {
    id
    title
    status
    priority
  }
}
```

---

## Políticas e Documentos

### Listar Políticas

```graphql
query GetPolicies($category: String) {
  policies(category: $category) {
    id
    title
    description
    category
    version
    fileUrl
    isRequired
    createdAt
    updatedAt
    readCount
    acknowledgedCount
  }
}
```

### Buscar Política por ID

```graphql
query GetPolicy($id: ID!) {
  policy(id: $id) {
    id
    title
    description
    content
    category
    version
    fileUrl
    isRequired
    createdAt
    updatedAt
    isRead
    isAcknowledged
  }
}
```

### Marcar como Lida

```graphql
mutation MarkPolicyAsRead($policyId: ID!) {
  markPolicyAsRead(policyId: $policyId) {
    id
    readAt
  }
}
```

### Confirmar Leitura (Acknowledgment)

```graphql
mutation AcknowledgePolicy($policyId: ID!) {
  acknowledgePolicy(policyId: $policyId) {
    id
    acknowledgedAt
  }
}
```

---

## Links

### Listar Links

```graphql
query GetLinks($category: LinkCategory) {
  links(category: $category) {
    id
    title
    description
    url
    category
    icon
    isActive
    createdAt
  }
}

enum LinkCategory {
  SYSTEM
  TRAINING
  SUPPORT
  EXTERNAL
}
```

### Criar Link

```graphql
mutation CreateLink($input: CreateLinkInput!) {
  createLink(input: $input) {
    id
    title
    url
  }
}

input CreateLinkInput {
  title: String!
  description: String
  url: String!
  category: LinkCategory!
  icon: String
}
```

### Atualizar Link

```graphql
mutation UpdateLink($id: ID!, $input: UpdateLinkInput!) {
  updateLink(id: $id, input: $input) {
    id
    title
    url
    isActive
  }
}
```

### Deletar Link

```graphql
mutation DeleteLink($id: ID!) {
  deleteLink(id: $id)
}
```

---

## Analytics

### Métricas do Dashboard

```graphql
query GetDashboardMetrics {
  dashboardMetrics {
    totalUsers
    activeUsers
    totalCourses
    completedCourses
    totalProjects
    activeProjects
    totalMessages
    avgXpPerUser
  }
}
```

### Analytics Completo

```graphql
query GetAnalytics($startDate: DateTime, $endDate: DateTime) {
  analytics(startDate: $startDate, endDate: $endDate) {
    userMetrics {
      totalUsers
      newUsers
      activeUsers
      avgSessionDuration
    }
    courseMetrics {
      totalEnrollments
      completionRate
      avgProgress
      popularCourses {
        courseId
        title
        enrollments
      }
    }
    engagementMetrics {
      dailyActiveUsers
      weeklyActiveUsers
      monthlyActiveUsers
      avgMessagesPerDay
    }
    gamificationMetrics {
      totalXpDistributed
      avgXpPerUser
      topPerformers {
        userId
        name
        xp
      }
    }
  }
}
```

### Estatísticas do Usuário

```graphql
query GetUserStatistics($userId: ID!) {
  userStatistics(userId: $userId) {
    coursesCompleted
    totalXp
    achievementsUnlocked
    projectsParticipating
    messagesCount
    loginStreak
    lastActive
  }
}
```

---

## Erros

### Formato de Erro

```json
{
  "errors": [
    {
      "message": "Descrição do erro",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["fieldName"],
      "extensions": {
        "code": "UNAUTHENTICATED",
        "exception": {
          "stacktrace": ["..."]
        }
      }
    }
  ]
}
```

### Códigos de Erro Comuns

| Código | Descrição |
|--------|-----------|
| `UNAUTHENTICATED` | Token ausente ou inválido |
| `FORBIDDEN` | Sem permissão para a ação |
| `BAD_USER_INPUT` | Dados de entrada inválidos |
| `NOT_FOUND` | Recurso não encontrado |
| `INTERNAL_SERVER_ERROR` | Erro interno do servidor |

---

## Rate Limiting

| Endpoint | Limite | Janela |
|----------|--------|--------|
| Mutations | 100 | 15 min |
| Queries | 1000 | 15 min |
| Subscriptions | 10 conexões | simultâneas |

---

## Exemplos de Integração

### JavaScript/TypeScript (Apollo Client)

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${token}`,
  },
});

// Query
const { data } = await client.query({
  query: gql`
    query GetCourses {
      courses {
        id
        title
      }
    }
  `,
});

// Mutation
const { data } = await client.mutate({
  mutation: gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
      }
    }
  `,
  variables: { email: 'user@example.com', password: '123456' },
});
```

### cURL

```bash
# Query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "{ me { id name email } }"}'

# Mutation
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: \"admin@maternarsm.com.br\", password: \"admin123\") { token } }"}'
```

### Python

```python
import requests

url = "http://localhost:4000/graphql"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

query = """
    query GetCourses {
        courses {
            id
            title
        }
    }
"""

response = requests.post(url, json={"query": query}, headers=headers)
data = response.json()
```

---

## GraphQL Playground

Em ambiente de desenvolvimento, acesse o GraphQL Playground em:

```
http://localhost:4000/graphql
```

O Playground oferece:
- Documentação interativa
- Autocompletar de queries
- Histórico de requisições
- Variáveis e headers configuráveis
