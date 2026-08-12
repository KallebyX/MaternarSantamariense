# Maternar Santa-mariense — Frontend (protótipo v2)

Plataforma de educação permanente e comunicação da rede materno-infantil de Santa Maria.
Desenvolvida pela UFN / PPGSMI em parceria com o NEPES — Prefeitura de Santa Maria.

## Backend (API + banco local)

O diretório `backend/` traz a API REST (Express) com banco **SQLite** local,
servindo também o frontend e o acervo — pronto para deploy em VM na rede da
VPN. Veja **[DEPLOY.md](DEPLOY.md)** para as opções (script automatizado,
Docker Compose ou manual) e o mapa completo de endpoints.

```bash
cd backend && npm install && npm start   # http://127.0.0.1:3000
```

## Conteúdo

- `index.html` — versão standalone (tudo embutido: JS, logos). Abre direto no navegador e funciona no GitHub Pages.
- `Maternar Santa-mariense.dc.html` — fonte editável do protótipo (requer `support.js`, `image-slot.js` e os PNGs na mesma pasta).
- `support.js`, `image-slot.js` — runtime do protótipo.
- `logo_materno.png`, `logo_ufn.png`, `logo_maternar_icon.png` — logos.

## Novidades desta versão (ata de alterações)

- "Enfermeira" → "Profissional de saúde"; perfil "Gestão" → "Gestor" (menu Coordenação / Gestor)
- Logos Maternar no login/rodapé + espaços para NinMaHub, NEPES e Brasão da Prefeitura
- Página "Sobre o projeto" (UFN + PPGSMI, parceria NEPES/Prefeitura)
- Certificados com 3 modelos por área (cores, chancela, assinaturas) + código de verificação
- Qualifica Profissional com submenu: capacitações online / presenciais / livres
- Menu Políticas Públicas de Saúde (Mulher, Criança, Idoso, Homem, Saúde Mental, Atenção Primária)
- Contadores de visualizações/downloads nos Produtos PPGSMI + selo "Mais baixado"
- Kanban removido → repositório de projetos de pesquisa autorizados (NEPES) com busca e filtro
- Busca global por títulos e tags

## Como substituir 100% o repositório

```bash
git clone https://github.com/KallebyX/MaternarSantamariense.git
cd MaternarSantamariense
git rm -rf .            # remove tudo do repo (mantém o .git)
cp -r /caminho/do/github-export/* .
git add -A
git commit -m "v2: protótipo completo substituindo versão anterior"
git push origin main
```

Para publicar no GitHub Pages: Settings → Pages → branch `main`, pasta `/ (root)` — o `index.html` já serve como entrada.
