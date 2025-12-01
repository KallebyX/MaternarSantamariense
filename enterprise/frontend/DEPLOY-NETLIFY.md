# 🚀 Deploy Rápido no Netlify - Maternar Santamariense

## Opção 1: Deploy via Netlify Drop (Mais Rápido - 2 minutos)

1. **Acesse o Netlify Drop**
   - Abra: https://app.netlify.com/drop

2. **Arraste a pasta `dist`**
   - Localize a pasta: `/Users/kalleby/Downloads/MaternarSantamariense/enterprise/frontend/dist`
   - Arraste e solte a pasta `dist` inteira na área indicada no site

3. **Pronto!**
   - O site estará online em segundos
   - Você receberá um link como: `https://amazing-name-123456.netlify.app`

## Opção 2: Deploy via Linha de Comando (5 minutos)

### Instalação do Netlify CLI:
```bash
# Se ainda não tiver o Netlify CLI instalado:
npm install -g netlify-cli
```

### Deploy:
```bash
# Na pasta do projeto frontend
cd /Users/kalleby/Downloads/MaternarSantamariense/enterprise/frontend

# Fazer o deploy
netlify deploy --prod --dir=dist
```

### Primeiro deploy:
1. Será solicitado login (abrirá o navegador)
2. Crie uma conta gratuita se não tiver
3. Escolha "Create & configure a new site"
4. Escolha um nome para o site ou deixe automático

## 🔗 Informações de Acesso

### Login de Teste:
- **Email**: admin@maternar.com
- **Senha**: admin123

### URLs Disponíveis:
- Dashboard: `/dashboard`
- Qualifica Profissional: `/qualifica-profissional`
- Perfil: `/profile`
- Configurações: `/settings`

## ⏰ Duração

- O site ficará online **indefinidamente** na conta gratuita
- Limite gratuito: 100GB de bandwidth/mês (mais que suficiente para testes)
- Se quiser remover depois, acesse o painel do Netlify

## 📱 Compartilhar

Após o deploy, você pode:
1. Compartilhar o link diretamente
2. Gerar um QR Code em: https://qr-code-generator.com/
3. Testar em diferentes dispositivos

## 🛠️ Atualização Rápida

Para atualizar o site após mudanças:
```bash
# Recompilar
npm run build

# Reenviar
netlify deploy --prod --dir=dist
```

## 💡 Dicas

- O site é totalmente responsivo
- Funciona offline após primeira visita (PWA)
- Todos os dados são mockados (não precisa backend)
- Performance otimizada para mobile

---

**Tempo estimado total**: 2-5 minutos para estar online!