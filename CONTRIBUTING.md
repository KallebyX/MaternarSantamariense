# Guia de Contribuição

Obrigado pelo interesse em contribuir com o projeto Maternar Santa Mariense! Este documento fornece diretrizes para garantir um processo de contribuição eficiente e padronizado.

## Sumário

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Commits e Branches](#commits-e-branches)
- [Pull Requests](#pull-requests)
- [Testes](#testes)
- [Documentação](#documentação)

---

## Código de Conduta

Este projeto adota um Código de Conduta que esperamos que todos os participantes sigam. Por favor, leia [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) para entender quais ações serão e não serão toleradas.

### Princípios

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros contribuidores

---

## Como Contribuir

### Reportando Bugs

1. Verifique se o bug já não foi reportado em [Issues](https://github.com/seu-repo/issues)
2. Se não encontrar, crie uma nova issue usando o template de bug
3. Inclua:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (OS, browser, versões)

### Sugerindo Melhorias

1. Abra uma issue com a tag `enhancement`
2. Descreva claramente a funcionalidade proposta
3. Explique o caso de uso e benefícios
4. Aguarde feedback antes de implementar

### Contribuindo com Código

1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Escreva/atualize testes
5. Abra um Pull Request

---

## Configuração do Ambiente

### Pré-requisitos

```bash
# Versões mínimas
node >= 18.0.0
npm >= 9.0.0
docker >= 24.0.0
docker-compose >= 2.0.0
```

### Setup Inicial

```bash
# 1. Clone o repositório
git clone https://github.com/seu-repo/MaternarSantamariense.git
cd MaternarSantamariense

# 2. Inicie os serviços com Docker
docker-compose up -d

# 3. Configure o backend
cd enterprise/backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed:enhanced

# 4. Configure o frontend
cd ../frontend
cp .env.example .env
npm install

# 5. Inicie em modo desenvolvimento
# Terminal 1 - Backend
cd enterprise/backend && npm run dev

# Terminal 2 - Frontend
cd enterprise/frontend && npm run dev
```

### IDE Recomendada

**VS Code** com as seguintes extensões:

- ESLint
- Prettier
- Prisma
- GraphQL
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

```json
// .vscode/settings.json recomendado
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Padrões de Código

### TypeScript

```typescript
// Use interfaces para objetos
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type para unions e primitivos
type Role = 'ADMIN' | 'MANAGER' | 'USER';
type ID = string;

// Prefira const e arrow functions
const getUserById = async (id: string): Promise<User> => {
  return prisma.user.findUnique({ where: { id } });
};

// Use async/await ao invés de .then()
// Bom
const user = await getUserById(id);

// Evite
getUserById(id).then(user => { ... });
```

### React

```tsx
// Use functional components
const MyComponent: React.FC<Props> = ({ title, children }) => {
  const [state, setState] = useState<string>('');

  // Handlers com prefixo handle
  const handleClick = () => {
    setState('clicked');
  };

  return (
    <div className="container">
      <h1>{title}</h1>
      {children}
    </div>
  );
};

// Custom hooks com prefixo use
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, login, logout };
};
```

### CSS (Tailwind)

```tsx
// Prefira classes Tailwind
<button className="px-4 py-2 bg-maternar-blue text-white rounded-lg hover:bg-maternar-blue-600">
  Enviar
</button>

// Para classes muito longas, use cn() ou clsx()
import { cn } from '@/lib/utils';

<div className={cn(
  'flex items-center justify-center',
  'p-4 rounded-lg',
  isActive && 'bg-maternar-blue text-white',
  disabled && 'opacity-50 cursor-not-allowed'
)} />
```

### GraphQL

```graphql
# Queries com prefixo get ou sem prefixo
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}

# Mutations com verbos de ação
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
  }
}

# Fragments para campos reutilizáveis
fragment UserBasicInfo on User {
  id
  name
  email
  avatar
}
```

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Arquivos React | PascalCase | `UserProfile.tsx` |
| Arquivos utils | camelCase | `formatDate.ts` |
| Componentes | PascalCase | `<UserCard />` |
| Funções | camelCase | `getUserById()` |
| Constantes | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| Tipos/Interfaces | PascalCase | `interface User` |
| Enums | PascalCase | `enum Role` |

---

## Commits e Branches

### Branches

```bash
# Feature branches
feature/nome-da-feature

# Bug fixes
fix/descricao-do-bug

# Hotfixes (produção)
hotfix/descricao-urgente

# Melhorias de documentação
docs/descricao

# Refatorações
refactor/descricao
```

### Commits (Conventional Commits)

```bash
# Formato
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

**Tipos permitidos:**

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `style` | Formatação (sem mudança de código) |
| `refactor` | Refatoração |
| `test` | Testes |
| `chore` | Tarefas de build, CI, etc. |
| `perf` | Melhorias de performance |

**Exemplos:**

```bash
feat(auth): adicionar login com Google OAuth

fix(chat): corrigir mensagens duplicadas no WebSocket

docs(readme): atualizar instruções de instalação

refactor(hooks): simplificar useAuth hook

test(api): adicionar testes para mutations de projeto
```

### Boas Práticas

- Commits pequenos e focados
- Uma mudança lógica por commit
- Mensagens claras e descritivas
- Referencie issues quando aplicável: `fix(api): resolver timeout (#123)`

---

## Pull Requests

### Antes de Abrir

- [ ] Código segue os padrões do projeto
- [ ] Testes passando localmente
- [ ] Lint sem erros
- [ ] Documentação atualizada (se necessário)
- [ ] Changelog atualizado (se necessário)

### Template de PR

```markdown
## Descrição

Breve descrição das mudanças.

## Tipo de Mudança

- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar

1. Passo 1
2. Passo 2
3. ...

## Checklist

- [ ] Código revisado
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] PR linkado com issue (se aplicável)

## Screenshots (se aplicável)

```

### Processo de Review

1. Pelo menos 1 aprovação necessária
2. CI deve passar (lint, testes, build)
3. Resolva todos os comentários
4. Squash commits ao fazer merge

---

## Testes

### Backend (Vitest)

```typescript
// Estrutura de teste
describe('UserService', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should create a new user', async () => {
    const user = await userService.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    expect(user).toBeDefined();
    expect(user.name).toBe('Test User');
  });

  it('should throw error for duplicate email', async () => {
    await expect(
      userService.create({ email: 'existing@example.com' })
    ).rejects.toThrow('Email already exists');
  });
});
```

### Frontend (Vitest + Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should show error for invalid email', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument();
  });
});
```

### E2E (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'admin@maternarsm.com.br');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
```

### Executando Testes

```bash
# Backend
cd enterprise/backend
npm test              # Todos os testes
npm test -- --watch   # Watch mode
npm run test:coverage # Com cobertura

# Frontend
cd enterprise/frontend
npm test              # Todos os testes
npm run test:e2e      # Testes E2E
npm run test:coverage # Com cobertura
```

---

## Documentação

### Código

- Use JSDoc para funções públicas
- Documente tipos complexos
- Comente apenas código não óbvio

```typescript
/**
 * Calcula o nível do usuário baseado no XP total.
 *
 * @param xp - Total de pontos de experiência
 * @returns Nível calculado (1-100+)
 *
 * @example
 * calculateLevel(1500) // returns 15
 */
const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};
```

### README e Docs

- Mantenha atualizado após mudanças
- Use markdown formatado
- Inclua exemplos de código
- Screenshots para funcionalidades visuais

---

## Dúvidas?

- Abra uma [Discussion](https://github.com/seu-repo/discussions)
- Entre em contato: dev@maternarsm.com.br

---

**Obrigado por contribuir!**
