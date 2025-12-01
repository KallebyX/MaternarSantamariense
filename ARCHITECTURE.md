# Arquitetura do Sistema

> Documentação técnica da arquitetura do Maternar Santa Mariense

## Visão Geral

O sistema Maternar Santa Mariense segue uma arquitetura **monolítica modular** com separação clara entre frontend e backend, comunicação via GraphQL e suporte a comunicação em tempo real via WebSocket.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTE                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Browser   │  │   Mobile    │  │   Tablet    │                  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
│         │                │                │                          │
│         └────────────────┼────────────────┘                          │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                              │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Vite + Tailwind CSS + Apollo Client  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│         │ GraphQL (HTTP)              │ WebSocket (Socket.IO)        │
└─────────┼─────────────────────────────┼──────────────────────────────┘
          │                             │
          ▼                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js)                            │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │     Express + Apollo Server (GraphQL) + Socket.IO + Prisma    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│         │                             │                              │
└─────────┼─────────────────────────────┼──────────────────────────────┘
          │                             │
          ▼                             ▼
┌─────────────────────┐     ┌─────────────────────┐
│     PostgreSQL      │     │       Redis         │
│   (Persistência)    │     │   (Cache/Session)   │
└─────────────────────┘     └─────────────────────┘
```

---

## Camadas da Aplicação

### 1. Camada de Apresentação (Frontend)

**Tecnologias:** React 18, TypeScript, Vite, Tailwind CSS

```
frontend/src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Button, Input, Modal)
│   ├── layout/         # Layouts (Header, Sidebar, Footer)
│   └── modals/         # Modais de formulário
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks (useAuth, useCourses, etc.)
├── graphql/            # Queries, Mutations, Subscriptions
├── lib/                # Utilitários e configurações
└── locales/            # Arquivos de internacionalização
```

**Responsabilidades:**
- Renderização da interface
- Gerenciamento de estado local (Zustand)
- Cache de dados (Apollo Client)
- Validação de formulários (React Hook Form + Zod)
- Animações e transições (Framer Motion)

### 2. Camada de API (Backend)

**Tecnologias:** Node.js, Express, Apollo Server, Prisma

```
backend/src/
├── graphql/
│   ├── typeDefs.ts     # Schema GraphQL
│   ├── resolvers.ts    # Resolvers (lógica de negócio)
│   └── context.ts      # Contexto de requisição
├── services/           # Serviços de domínio
│   ├── auth.service.ts
│   ├── course.service.ts
│   ├── cache.service.ts
│   └── socket.service.ts
├── middleware/         # Middlewares Express
├── config/             # Configurações
└── utils/              # Utilitários
```

**Responsabilidades:**
- Processamento de requisições GraphQL
- Autenticação e autorização
- Lógica de negócio
- Comunicação em tempo real (WebSocket)
- Integração com banco de dados

### 3. Camada de Dados

**Tecnologias:** PostgreSQL, Prisma ORM, Redis

```
prisma/
├── schema.prisma       # Schema do banco de dados
├── migrations/         # Histórico de migrations
└── seed.ts            # Dados de seed
```

**Responsabilidades:**
- Persistência de dados (PostgreSQL)
- Cache de consultas (Redis)
- Sessions e tokens (Redis)
- ORM e migrations (Prisma)

---

## Fluxo de Dados

### Requisição GraphQL (Query/Mutation)

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│  Client  │───▶│ Apollo Client│───▶│ Apollo Server│───▶│  Prisma  │
└──────────┘    └──────────────┘    └──────────────┘    └──────────┘
                      │                    │                   │
                      ▼                    ▼                   ▼
                 ┌─────────┐         ┌─────────┐         ┌─────────┐
                 │  Cache  │         │ Context │         │PostgreSQL│
                 │(Memory) │         │ (JWT)   │         │         │
                 └─────────┘         └─────────┘         └─────────┘
```

1. **Cliente** envia requisição GraphQL
2. **Apollo Client** verifica cache local
3. Se não houver cache, envia para o **Apollo Server**
4. **Middleware** valida JWT e cria contexto
5. **Resolver** processa a requisição
6. **Prisma** executa query no PostgreSQL
7. Resposta retorna pelo mesmo caminho

### Comunicação em Tempo Real (WebSocket)

```
┌──────────┐                    ┌──────────────┐
│ Client A │◀──────────────────▶│   Socket.IO  │
└──────────┘                    │    Server    │
                                │              │
┌──────────┐                    │   (Redis     │
│ Client B │◀──────────────────▶│   PubSub)    │
└──────────┘                    └──────────────┘
```

1. Cliente conecta via WebSocket
2. Servidor mantém conexão ativa
3. Eventos são emitidos para clientes conectados
4. Redis PubSub permite escalar horizontalmente

---

## Padrões de Design

### 1. Repository Pattern (via Prisma)

```typescript
// services/user.service.ts
class UserService {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateXP(id: string, xp: number) {
    return prisma.user.update({
      where: { id },
      data: { xp: { increment: xp } }
    });
  }
}
```

### 2. Context Pattern (GraphQL)

```typescript
// graphql/context.ts
export interface Context {
  user: User | null;
  prisma: PrismaClient;
  redis: Redis;
}

export const createContext = async ({ req }): Promise<Context> => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = token ? await verifyToken(token) : null;
  return { user, prisma, redis };
};
```

### 3. Custom Hooks Pattern (React)

```typescript
// hooks/useCourses.ts
export function useCourses() {
  const { data, loading, error } = useQuery(GET_COURSES);
  const [enrollMutation] = useMutation(ENROLL_COURSE);

  const enroll = async (courseId: string) => {
    await enrollMutation({ variables: { courseId } });
  };

  return { courses: data?.courses, loading, error, enroll };
}
```

---

## Modelo de Dados

### Diagrama ER Simplificado

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │──────▶│CourseEnrollment │◀──────│   Course    │
└─────────────┘       └─────────────────┘       └─────────────┘
      │                                               │
      │ 1:N                                          │ 1:N
      ▼                                               ▼
┌─────────────┐                               ┌─────────────┐
│UserAchievement│                              │   Lesson    │
└─────────────┘                               └─────────────┘
      │                                               │
      │ N:1                                          │ N:1
      ▼                                               ▼
┌─────────────┐                               ┌────────────────┐
│ Achievement │                               │LessonCompletion│
└─────────────┘                               └────────────────┘

┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │──────▶│  ChannelMember  │◀──────│   Channel   │
└─────────────┘       └─────────────────┘       └─────────────┘
                              │
                              │ 1:N
                              ▼
                      ┌─────────────┐
                      │   Message   │
                      └─────────────┘

┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │──────▶│  ProjectMember  │◀──────│   Project   │
└─────────────┘       └─────────────────┘       └─────────────┘
                                                      │
                                                      │ 1:N
                                                      ▼
                                                ┌─────────────┐
                                                │    Task     │
                                                └─────────────┘
```

### Entidades Principais

| Entidade | Descrição | Relacionamentos |
|----------|-----------|-----------------|
| User | Usuários do sistema | Enrollments, Achievements, Messages |
| Course | Cursos do LMS | Lessons, Enrollments |
| Lesson | Aulas dos cursos | Completions |
| Achievement | Conquistas gamificadas | UserAchievements |
| Channel | Canais de chat | Members, Messages |
| Project | Projetos kanban | Members, Tasks |
| Event | Eventos do calendário | Attendees |
| Policy | Políticas/documentos | Reads, Acknowledgments |

---

## Segurança

### Autenticação (JWT)

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Login   │────▶│ Verify Pass  │────▶│ Generate JWT │
└──────────┘     └──────────────┘     └──────────────┘
                        │                     │
                        ▼                     ▼
                 ┌─────────────┐       ┌─────────────┐
                 │   Bcrypt    │       │ Access Token│
                 │  (12 rounds)│       │  (7 days)   │
                 └─────────────┘       └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │Refresh Token│
                                       │  (30 days)  │
                                       └─────────────┘
```

### Autorização (RBAC)

```typescript
enum Role {
  ADMIN = 'ADMIN',     // Acesso total
  MANAGER = 'MANAGER', // Gestão de equipe
  USER = 'USER'        // Acesso básico
}

// Exemplo de verificação
const isAdmin = (context: Context) => {
  if (context.user?.role !== 'ADMIN') {
    throw new AuthenticationError('Unauthorized');
  }
};
```

### Camadas de Segurança

| Camada | Tecnologia | Função |
|--------|------------|--------|
| Transporte | HTTPS | Criptografia em trânsito |
| Headers | Helmet.js | Proteção contra XSS, clickjacking |
| Rate Limit | express-rate-limit | 1000 req/15min |
| CORS | cors | Origens permitidas |
| Sanitização | middleware | Limpeza de inputs |
| Autenticação | JWT | Tokens seguros |
| Autorização | RBAC | Controle de acesso |

---

## Cache

### Estratégia de Cache

```
┌─────────────────────────────────────────────────────────┐
│                      Redis Cache                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Sessions   │  │   Queries   │  │  Rankings   │     │
│  │  (30 min)   │  │  (5 min)    │  │  (1 hour)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Implementação

```typescript
// services/cache.service.ts
class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl = 300): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  }
}
```

---

## Escalabilidade

### Horizontal Scaling

```
                    ┌─────────────┐
                    │Load Balancer│
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Backend 1  │ │  Backend 2  │ │  Backend 3  │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           ▼
              ┌─────────────────────────┐
              │   PostgreSQL + Redis    │
              │      (Managed)          │
              └─────────────────────────┘
```

### Estratégias Implementadas

1. **Stateless Backend** - Sem estado no servidor
2. **Redis Session Store** - Sessions centralizadas
3. **Connection Pooling** - Prisma connection pool
4. **CDN Ready** - Assets estáticos otimizados
5. **Docker Containers** - Deploy consistente

---

## Monitoramento

### Health Checks

```typescript
// GET /health
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "websocket": "active"
  }
}
```

### Logging

```typescript
// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## Ambiente de Desenvolvimento

### Docker Compose

```yaml
services:
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: maternar
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  redis:
    image: redis:7-alpine

  backend:
    build: ./enterprise/backend
    depends_on:
      - database
      - redis
    ports:
      - "4000:4000"

  frontend:
    build: ./enterprise/frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"
```

### Variáveis de Ambiente

```bash
# Backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/maternar
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

---

## Decisões Arquiteturais

### Por que GraphQL?

- **Flexibilidade** - Cliente define os dados que precisa
- **Tipagem** - Schema fortemente tipado
- **Documentação** - Auto-documentado via schema
- **Eficiência** - Reduz over/under-fetching

### Por que Monolito Modular?

- **Simplicidade** - Mais fácil de desenvolver e manter
- **Performance** - Sem latência de rede entre serviços
- **Consistência** - Transações ACID garantidas
- **Custo** - Menos infraestrutura necessária

### Por que PostgreSQL?

- **Confiabilidade** - ACID compliant
- **Recursos** - JSON, full-text search, extensões
- **Prisma** - Excelente suporte do ORM
- **Custo** - Open source, managed services baratos

---

## Referências

- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [React Patterns](https://reactpatterns.com/)
- [The Twelve-Factor App](https://12factor.net/)
