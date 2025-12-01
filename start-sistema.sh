#!/bin/bash

echo "🚀 Iniciando Maternar Santa Mariense..."
echo ""

# Criar diretório de logs
mkdir -p logs

# Parar processos existentes
echo "🔄 Parando processos existentes..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "npx vite" 2>/dev/null

# Aguardar processos pararem
sleep 2

# Iniciar Backend
echo "🔧 Iniciando Backend na porta 4000..."
cd enterprise/backend
npm run dev > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Aguardar Backend iniciar
echo "⏳ Aguardando Backend inicializar..."
sleep 5

# Iniciar Frontend
echo "🌐 Iniciando Frontend na porta 3000..."
cd enterprise/frontend
npx vite --host 0.0.0.0 > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Aguardar Frontend iniciar
sleep 3

# Mostrar IP local
IP=$(ipconfig getifaddr en0 2>/dev/null || ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

clear

echo ""
echo "✅ Sistema Maternar Santa Mariense iniciado com sucesso!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 URLs de Acesso:"
echo ""
echo "🌐 Frontend (Local):    http://localhost:3000"
echo "🌐 Frontend (Rede):     http://${IP}:3000"
echo ""
echo "🔧 Backend GraphQL:     http://localhost:4000/graphql"
echo "📊 Health Check:        http://localhost:4000/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔑 Credenciais de Acesso:"
echo ""
echo "👤 Admin:"
echo "   Email: admin@maternarsm.com.br"
echo "   Senha: admin123"
echo ""
echo "👤 Gestora:"
echo "   Email: maria.coordenadora@maternarsm.com.br"
echo "   Senha: user123"
echo ""
echo "👤 Enfermeira:"
echo "   Email: ana.enfermeira@maternarsm.com.br"
echo "   Senha: user123"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Comandos Úteis:"
echo ""
echo "🛑 Parar sistema:       ./stop-sistema.sh"
echo "📋 Ver logs:            tail -f logs/backend.log"
echo "                        tail -f logs/frontend.log"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Salvar PIDs
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# Abrir navegador (macOS)
if command -v open &> /dev/null; then
    sleep 2
    open "http://localhost:3000"
fi