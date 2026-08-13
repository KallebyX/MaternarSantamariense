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

- `index.html` — **landing pública** (`/`): apresentação do projeto, entrada na
  plataforma, solicitação de acesso e verificação de certificado.
- `app.html` — plataforma usada pelos profissionais (`/app`); versão standalone do
  protótipo, com tudo embutido (JS, logos).
- `painel.html` + `painel.js` — **painel de gestão** (`/painel`), restrito a Gestor e
  Administrador: equipe e senhas, biblioteca de uploads e CRUD completo de todo o
  conteúdo, ligado à API.
- `Maternar Santa-mariense.dc.html` — fonte editável do protótipo (requer `support.js`, `image-slot.js` e os PNGs na mesma pasta).
- `support.js`, `image-slot.js` — runtime do protótipo.
- `logo_materno.png`, `logo_ufn.png`, `logo_maternar_icon.png` — logos.
- `_redirects` — apelidos `/app` e `/painel` em hospedagem estática.

## Painel de gestão

Em `/painel`, a coordenação (Gestor/Administrador) administra a plataforma sem
tocar em banco de dados:

- **Equipe e senhas** — convida a equipe já com a senha que vai repassar (ou uma
  sugerida pela plataforma), redefine senhas, aprova solicitações, ajusta perfis e
  situações. Sem SMTP na VM, a senha aparece na tela uma única vez para repasse
  pessoal, marcada como provisória para troca no primeiro acesso.
- **Biblioteca de uploads** — envia treinamentos, políticas, materiais, produtos do
  PPGSMI e capacitações do Qualifica (PDF, Office, imagens, vídeo, áudio, ZIP). O
  endereço gerado é reaproveitado em qualquer conteúdo.
- **CRUD completo** — cursos e aulas, módulos e materiais do Qualifica, trilhas,
  áreas de política e materiais do acervo, protocolos, documentos, links, produtos
  do PPGSMI, projetos de pesquisa, avisos, agenda, canais, conquistas e tarefas.
  Todo formulário aceita anexar um arquivo enviado na hora.
- **Registros e backup** — trilha de auditoria das ações e cópia do banco em JSON.

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

Para publicar no GitHub Pages: Settings → Pages → branch `main`, pasta `/ (root)` —
o `index.html` (landing) serve como entrada e o protótipo fica em `app.html`. Sem o
backend, a landing mostra os números de referência e os formulários avisam que o
acesso é pela rede da Prefeitura.
