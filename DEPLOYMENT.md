# Guia de Deploy

> Instruções completas para deploy do Maternar Santa Mariense em diferentes ambientes

## Sumário

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Deploy Local (Docker)](#deploy-local-docker)
- [Deploy no Render.com](#deploy-no-rendercom)
- [Deploy no Kubernetes](#deploy-no-kubernetes)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [CI/CD](#cicd)
- [Monitoramento](#monitoramento)
- [Troubleshooting](#troubleshooting)

---

## Visão Geral

O sistema pode ser implantado em diferentes ambientes:

| Ambiente | Tecnologia | Custo | Uso Recomendado |
|----------|------------|-------|-----------------|
| Local | Docker Compose | $0 | Desenvolvimento |
| Render.com | PaaS | $0-70/mês | Produção simples |
| Kubernetes | Container Orchestration | Variável | Produção escalável |
| VPS/Cloud | Docker | Variável | Controle total |

---

## Pré-requisitos

### Ferramentas Necessárias

```bash
# Docker (para builds)
docker --version  # >= 24.0.0

# Git (para deploy)
git --version     # >= 2.0.0

# Node.js (opcional, para builds locais)
node --version    # >= 18.0.0
```

### Serviços Externos

- **PostgreSQL 15** - Banco de dados principal
- **Redis 7** - Cache e sessions
- **Domínio** (opcional) - Para HTTPS e URLs customizadas

---

## Deploy Local (Docker)

### Desenvolvimento

```bash
# 1. Clone o repositório
git clone https://github.com/seu-repo/MaternarSantamariense.git
cd MaternarSantamariense

# 2. Inicie todos os serviços
docker-compose up -d

# 3. Execute as migrations
docker-compose exec backend npx prisma migrate dev

# 4. Popule o banco (opcional)
docker-compose exec backend npm run db:seed:enhanced

# 5. Acesse
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
```

### Produção (Docker Compose)

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com valores de produção

# 2. Build das imagens
docker-compose -f docker-compose.prod.yml build

# 3. Inicie os serviços
docker-compose -f docker-compose.prod.yml up -d

# 4. Migrations em produção
docker-compose exec backend npx prisma migrate deploy
```

### docker-compose.yml (Desenvolvimento)

```yaml
version: '3.8'

services:
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: maternar
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./enterprise/backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres@database:5432/maternar
      REDIS_URL: redis://redis:6379
      JWT_SECRET: development-secret-key
      NODE_ENV: development
    ports:
      - "4000:4000"
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./enterprise/backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./enterprise/frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: http://localhost:4000
      VITE_WS_URL: ws://localhost:4000
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./enterprise/frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

---

## Deploy no Render.com

O Render.com é a opção recomendada para deploys rápidos e gerenciados.

### Passo a Passo

#### 1. Preparar o Repositório

```bash
# Certifique-se de que o render.yaml está na raiz
ls render.yaml
```

#### 2. Conectar ao Render

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **New +** → **Blueprint**
3. Conecte seu repositório GitHub
4. Selecione o repositório do projeto

#### 3. Configurar Blueprint

O `render.yaml` define todos os serviços automaticamente:

```yaml
# render.yaml
services:
  # Backend API
  - type: web
    name: maternar-api
    env: node
    region: oregon
    buildCommand: cd enterprise/backend && npm ci && npm run build
    startCommand: cd enterprise/backend && npm run start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: maternar-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: maternar-redis
          type: redis
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: CORS_ORIGINS
        sync: false

  # Frontend SPA
  - type: web
    name: maternar-frontend
    env: static
    buildCommand: cd enterprise/frontend && npm ci && npm run build
    staticPublishPath: ./enterprise/frontend/dist
    headers:
      - path: /*
        name: Cache-Control
        value: no-cache
    routes:
      - type: rewrite
        source: /*
        destination: /index.html

  # Redis Cache
  - type: redis
    name: maternar-redis
    region: oregon
    plan: free
    maxmemoryPolicy: allkeys-lru

# Database
databases:
  - name: maternar-db
    region: oregon
    plan: free
    databaseName: maternar
    user: maternar_user
```

#### 4. Variáveis de Ambiente

Após o deploy inicial, configure no dashboard:

| Variável | Valor | Serviço |
|----------|-------|---------|
| `CORS_ORIGINS` | URL do frontend | Backend |
| `VITE_API_URL` | URL do backend | Frontend |
| `VITE_WS_URL` | URL WebSocket | Frontend |

#### 5. Executar Migrations

```bash
# Via Render Shell ou CLI
cd enterprise/backend
npx prisma migrate deploy
npm run db:seed:enhanced
```

### Custos Render.com

| Plano | Backend | Database | Redis | Total |
|-------|---------|----------|-------|-------|
| Free | $0 | $0 | $0 | **$0/mês** |
| Starter | $7 | $7 | $10 | **$24/mês** |
| Pro | $25 | $25 | $20 | **$70/mês** |

> **Nota:** O plano Free hiberna após 15 minutos de inatividade.

---

## Deploy no Kubernetes

Para ambientes que requerem maior escalabilidade e controle.

### Estrutura de Manifests

```
enterprise/infrastructure/kubernetes/
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
├── backend/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
├── frontend/
│   ├── deployment.yaml
│   └── service.yaml
├── database/
│   ├── statefulset.yaml
│   └── service.yaml
└── ingress.yaml
```

### Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: maternar
  labels:
    app: maternar
```

### Backend Deployment

```yaml
# backend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: maternar-backend
  namespace: maternar
spec:
  replicas: 3
  selector:
    matchLabels:
      app: maternar-backend
  template:
    metadata:
      labels:
        app: maternar-backend
    spec:
      containers:
        - name: backend
          image: your-registry/maternar-backend:latest
          ports:
            - containerPort: 4000
          envFrom:
            - configMapRef:
                name: maternar-config
            - secretRef:
                name: maternar-secrets
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Ingress com TLS

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: maternar-ingress
  namespace: maternar
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - api.maternarsm.com.br
        - app.maternarsm.com.br
      secretName: maternar-tls
  rules:
    - host: api.maternarsm.com.br
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: maternar-backend
                port:
                  number: 4000
    - host: app.maternarsm.com.br
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: maternar-frontend
                port:
                  number: 80
```

### Deploy

```bash
# Criar namespace
kubectl apply -f namespace.yaml

# Aplicar configs e secrets
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml

# Deploy dos serviços
kubectl apply -f backend/
kubectl apply -f frontend/
kubectl apply -f database/

# Ingress
kubectl apply -f ingress.yaml

# Verificar status
kubectl get pods -n maternar
kubectl get services -n maternar
```

---

## Variáveis de Ambiente

### Backend

```bash
# Obrigatórias
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=sua-chave-secreta-muito-longa
NODE_ENV=production

# Opcionais
PORT=4000
CORS_ORIGINS=https://app.maternarsm.com.br
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
LOG_LEVEL=info
SENTRY_DSN=https://...@sentry.io/...
```

### Frontend

```bash
# Obrigatórias
VITE_API_URL=https://api.maternarsm.com.br
VITE_WS_URL=wss://api.maternarsm.com.br

# Opcionais
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

### Gerando JWT_SECRET

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd enterprise/backend && npm ci
          cd ../frontend && npm ci

      - name: Run tests
        run: |
          cd enterprise/backend && npm test
          cd ../frontend && npm test

      - name: Build
        run: |
          cd enterprise/backend && npm run build
          cd ../frontend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            -H "Content-Type: application/json" \
            https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys
```

### Deploy Hooks

Configure webhooks no Render para deploy automático:

1. No dashboard do Render, acesse Settings
2. Copie o Deploy Hook URL
3. Adicione como secret no GitHub: `RENDER_DEPLOY_HOOK`

---

## Monitoramento

### Health Check Endpoint

```bash
# GET /health
curl https://api.maternarsm.com.br/health
```

Resposta:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "version": "2.0.0",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Logs

```bash
# Docker
docker-compose logs -f backend

# Kubernetes
kubectl logs -f deployment/maternar-backend -n maternar

# Render
# Dashboard → Service → Logs
```

### Métricas Recomendadas

| Métrica | Alerta |
|---------|--------|
| Response Time | > 2s |
| Error Rate | > 1% |
| CPU Usage | > 80% |
| Memory Usage | > 85% |
| Database Connections | > 90% pool |

### Ferramentas Sugeridas

- **Sentry** - Error tracking
- **Datadog/New Relic** - APM
- **Grafana + Prometheus** - Métricas
- **PagerDuty** - Alertas

---

## Troubleshooting

### Erro de Conexão com Banco

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps database

# Testar conexão
docker-compose exec database psql -U postgres -c "SELECT 1"

# Verificar variável DATABASE_URL
echo $DATABASE_URL
```

### Erro de Conexão com Redis

```bash
# Verificar se o Redis está rodando
docker-compose ps redis

# Testar conexão
docker-compose exec redis redis-cli ping
```

### Migrations Falhando

```bash
# Reset do banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset

# Forçar migration
npx prisma migrate deploy --force
```

### Build Falhando

```bash
# Limpar cache
docker-compose build --no-cache

# Verificar logs detalhados
docker-compose build backend 2>&1 | tee build.log
```

### Frontend Não Conecta ao Backend

1. Verifique `VITE_API_URL` no frontend
2. Verifique `CORS_ORIGINS` no backend
3. Verifique se as URLs incluem protocolo (`https://`)

### WebSocket Não Conecta

1. Verifique `VITE_WS_URL` (deve usar `wss://` em produção)
2. Verifique configuração de proxy/load balancer
3. Verifique se o Upgrade de conexão está permitido

---

## Checklist de Deploy

### Antes do Deploy

- [ ] Testes passando
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations testadas
- [ ] Backup do banco (se atualizando)

### Após o Deploy

- [ ] Health check respondendo
- [ ] Login funcionando
- [ ] Funcionalidades principais OK
- [ ] Logs sem erros críticos
- [ ] Monitoramento ativo

### Rollback

```bash
# Docker
docker-compose down
docker-compose pull  # versão anterior
docker-compose up -d

# Kubernetes
kubectl rollout undo deployment/maternar-backend -n maternar

# Render
# Dashboard → Manual Deploy → Select previous commit
```

---

## Suporte

- **Email**: devops@maternarsm.com.br
- **Issues**: GitHub Issues
- **Docs**: Ver documentação completa no repositório
