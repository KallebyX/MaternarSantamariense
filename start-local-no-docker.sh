#!/bin/bash

echo "🚀 Iniciando Maternar Santa Mariense (sem Docker)..."
echo ""
echo "⚠️  ATENÇÃO: Esta configuração requer um banco PostgreSQL externo"
echo ""

# Verificar se as dependências foram instaladas
if [ ! -d "enterprise/backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd enterprise/backend
    npm install
    cd ../..
fi

if [ ! -d "enterprise/frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd enterprise/frontend
    npm install
    cd ../..
fi

# Criar diretório de logs se não existir
mkdir -p logs

# Parar processos existentes
pkill -f "npm run dev" 2>/dev/null

# Iniciar Backend
echo "🔧 Iniciando Backend na porta 4000..."
cd enterprise/backend
npm run dev > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Aguardar Backend iniciar
sleep 3

# Iniciar Frontend
echo "🌐 Iniciando Frontend na porta 3000..."
cd enterprise/frontend
npm run dev -- --host 0.0.0.0 > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Aguardar iniciar
sleep 5

# Mostrar IP local
IP=$(ipconfig getifaddr en0 2>/dev/null || ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

echo ""
echo "✅ Sistema iniciado!"
echo ""
echo "📍 URLs na rede local:"
echo ""
echo "🌐 Frontend: http://${IP}:3000"
echo "🔧 Backend:  http://${IP}:4000"
echo ""
echo "📍 URLs localhost:"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:4000/graphql"
echo ""
echo "⚠️  CONFIGURAÇÃO NECESSÁRIA:"
echo ""
echo "1. Configure um banco PostgreSQL (Supabase, Neon, etc)"
echo "2. Crie um arquivo .env no diretório enterprise/backend com:"
echo ""
echo "DATABASE_URL=\"postgresql://user:pass@host:5432/dbname\""
echo "JWT_SECRET=\"sua-chave-secreta\""
echo "REFRESH_TOKEN_SECRET=\"sua-chave-refresh\""
echo "CORS_ORIGINS=\"http://localhost:3000\""
echo "DISABLE_REDIS=true"
echo ""
echo "3. Execute as migrations:"
echo "   cd enterprise/backend"
echo "   npx prisma migrate deploy"
echo "   npm run db:seed:enhanced"
echo ""
echo "📝 Para parar o sistema:"
echo "   pkill -f 'npm run dev'"
echo ""
echo "🔍 Ver logs:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/frontend.log"
echo ""

# Salvar PIDs
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid