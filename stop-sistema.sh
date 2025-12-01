#!/bin/bash

echo "🛑 Parando Maternar Santa Mariense..."
echo ""

# Parar processos usando PIDs salvos
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "🔧 Parando Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
    fi
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "🌐 Parando Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    fi
    rm .frontend.pid
fi

# Garantir que todos os processos relacionados sejam parados
echo "🔄 Finalizando processos restantes..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "npx vite" 2>/dev/null
pkill -f "node --import tsx/esm" 2>/dev/null

echo ""
echo "✅ Sistema parado com sucesso!"
echo ""