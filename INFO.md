# 🚀 Sistema Maternar Santa Mariense - Status

## 📍 Frontend
✅ **Rodando em:** http://localhost:3000

## ⚠️ Backend
O backend precisa de um banco PostgreSQL para funcionar. 

### Opções para rodar o backend:

#### 1. Use um banco PostgreSQL online gratuito:
- **Supabase:** https://supabase.com (grátis até 500MB)
- **Neon:** https://neon.tech (grátis até 3GB)
- **Aiven:** https://aiven.io (trial grátis)

#### 2. Configure o banco:
1. Crie uma conta em um dos serviços acima
2. Copie a URL de conexão PostgreSQL
3. Edite o arquivo `enterprise/backend/.env` e coloque a URL em `DATABASE_URL`
4. Execute no terminal:
   ```bash
   cd enterprise/backend
   npx prisma migrate deploy
   npm run db:seed:enhanced
   npm run dev
   ```

#### 3. Ou use Docker (se tiver instalado):
```bash
docker run -d \
  --name maternar-postgres \
  -e POSTGRES_USER=maternar \
  -e POSTGRES_PASSWORD=maternar123 \
  -e POSTGRES_DB=maternarsm \
  -p 5432:5432 \
  postgres:15-alpine
```

Depois configure `.env` com:
```
DATABASE_URL="postgresql://maternar:maternar123@localhost:5432/maternarsm"
```

## 🔑 Credenciais de Login
- **Email:** admin@maternarsm.com.br
- **Senha:** admin123

## 📝 Scripts Úteis
- **Iniciar sistema:** `./start-sistema.sh`
- **Parar sistema:** `./stop-sistema.sh`
- **Ver logs:** `tail -f logs/backend.log`