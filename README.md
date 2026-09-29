# Maternar Santa-mariense

Plataforma de educação permanente e comunicação da rede materno-infantil de Santa Maria. Frontend em HTML/CSS/JavaScript e API Express com SQLite persistente.

## Executar

Requer Node.js 20 ou superior.

```bash
cd backend
npm ci
cp .env.example .env
# Configure JWT_SECRET com um segredo aleatório antes de publicar.
npm start
```

Abra http://127.0.0.1:3000. Nesta sessão a aplicação local está sendo usada na porta 3100.

- `/`: apresentação, login, solicitação de acesso, recuperação de senha e verificação pública de certificado.
- `/app`: plataforma profissional integrada à API: cursos, progresso, certificados, Qualifica, políticas, protocolos, documentos, produtos, pesquisas, agenda, mensagens, avisos, busca e perfil.
- `/painel`: gestão de equipe, convites, senhas, aprovação de solicitações, uploads e CRUD dos conteúdos. Exportação administrativa e registros de auditoria.
- `/api`: API REST; mapa de rotas e operação em [DEPLOY.md](DEPLOY.md).

## Portainer da UFN

A implantação institucional está preparada para Docker Standalone no ambiente
`dockerapps`, com persistência em volume e proxy HTTPS no domínio solicitado
`maternarsantamariense.app.ufn.edu.br`. Consulte o [roteiro de Portainer](deploy/portainer/README.md)
para a stack, construção da imagem, transferência privada do banco, testes e
configuração do Nginx Proxy Manager. O relatório em [PROGRESS.md](PROGRESS.md)
registra as etapas; a [publicação HTTPS e entrega de e-mail](PUBLICACAO-EMAIL-2026-09-29.md) estão verificadas.

A versão `maternar:20260929-mobile2` está ativa e saudável na stack institucional.
A [revisão de mobile, posicionamento e logos](ENTREGA-MOBILE-2026-09-29.md) registra as correções e a conferência no domínio público.
A [entrega do acervo, histórico, GESTAR e persistência](ENTREGA-ACERVO-PERFIL-2026-09-29.md)
registra os 704 projetos, filtros e a validação final em produção.
O [relatório de Links úteis e sidebar](REVISAO-LINKS-SIDEBAR-2026-09-29.md) documenta
a navegação validada, os ícones Lucide, os ajustes responsivos e as evidências.
O painel envia links de acesso por `maternar@ufn.edu.br`; veja [como operar o e-mail](EMAIL-ACESSO.md).
A [revisão de UX e QA](REVISAO-UX-QA-2026-09-29.md) reúne as correções do chat,
configurações, layouts e a remoção da referência de Luisa Pinheiro.
A [auditoria E2E de 29/09/2026](AUDITORIA-E2E-2026-09-29.md) reúne os testes,
as correções, a validação da atualização e as pendências para a abertura pública.
Após a auditoria, os cursos demonstrativos foram zerados e o cadastro passou a
exigir publicação explícita. Consulte o [guia de cursos e certificados](GUIA-CURSOS-CERTIFICADOS.md).

O navegador guarda apenas o token e um resumo da sessão. Dados profissionais, progresso, mensagens e avisos lidos são persistidos no servidor. Senhas provisórias exigem troca; troca e redefinição de senha revogam os tokens anteriores.

## Fonte editável

A plataforma ativa é `app.html`, `app.css`, `app.js` e `chat.js`. A landing é `index.html`. O painel é `painel.html` e `painel.js`. Não há etapa de bundle nem CDN obrigatória.

Os ícones do painel usam Lucide Static 1.48.0, com apenas os 22 SVGs necessários
reunidos em `assets/lucide.svg`. A licença acompanha o arquivo. Ao mudar o nome
de um ícone em `MENU` (`painel.js`), execute `cd backend && npm run icons` e inclua
o SVG gerado na entrega. O pacote npm é usado apenas no desenvolvimento; os
ícones publicados funcionam sem CDN e sem carregar JavaScript adicional.

`Maternar Santa-mariense.dc.html`, `support.js` e `image-slot.js` são arquivos do protótipo anterior, preservados como referência e não publicados pelo backend. Não use `extract-seeds` para sobrescrever dados operacionais.

## Banco e importação

O banco local fica em `backend/data/maternar.db`, excluído do versionamento e da imagem Docker. O seed inicial inclui o acervo e os catálogos do projeto. Inicializações posteriores preservam alterações e exclusões realizadas pela gestão.

Contas demonstrativas existem apenas em `backend/tests/fixtures`, fora da imagem
Docker. O seed operacional recusa o modo de demonstração. Não há administrador,
senha padrão, curso, aula, mensagem ou certificado de exemplo na inicialização normal.

A importação recebe uma lista JSON privada por stdin, com `nome`, `email`, `cpf`, `formacao`, `cargo`, `unidade` e `senha`:

```bash
cd backend
node scripts/importar-equipe.mjs --simular < /caminho/privado/cadastros.json
node scripts/importar-equipe.mjs < /caminho/privado/cadastros.json
```

Ela valida todo o lote antes de gravar, usa uma transação e bcrypt. A repetição preserva contas existentes, inclusive senha, perfil e situação. Divergências de CPF são recusadas. Não coloque o arquivo de entrada no repositório ou na pasta pública.

Para provisionar o primeiro administrador, envie um objeto JSON privado com `nome`, `email` e `senha`:

```bash
node scripts/criar-admin.mjs < /caminho/privado/admin.json
```

A conta administrativa solicitada para Luiz Fernando Rodrigues Jr. foi criada com troca obrigatória de senha. A credencial inicial está no arquivo privado `backend/data/acesso-inicial-luiz.txt`.

Kalleby Evangelho Mota também foi cadastrado como Administrador ativo, com a senha escolhida pelo titular. O banco local, o volume privado da UFN e o backup de implantação contêm sete usuários: cinco profissionais e dois administradores.

Os cinco cadastros do PDF **Equipe Dom Antonio Reis.pdf** foram importados no banco local em 29/09/2026. O usuário confirmou a correspondência dos campos pela ordem das respostas. Grafias e locais de atuação foram preservados. As credenciais e os CPFs não estão nos seeds nem neste documento.

## Validação

```bash
cd backend
npm test
npx playwright install chromium webkit
npm run test:e2e -- --output=test-results/browser-chromium
E2E_BROWSER=webkit npm run test:e2e -- --output=test-results/browser-webkit
```

Os testes de API usam bancos em memória. As jornadas Playwright iniciam um banco temporário separado na porta 3101 e o apagam ao terminar. Os testes nunca usam os sete cadastros reais. Relatórios, screenshots e traces ficam em `backend/test-results/`, fora do versionamento. Use as subpastas de saída acima para preservar os demais relatórios dessa pasta. É possível usar Chromium instalado definindo `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Resultado atual: **83 testes de API aprovados e 44 cenários aprovados em cada
motor, Chromium e WebKit**. Em Chromium, 42 passaram na suíte completa; uma
jornada longa atingiu o limite total e passou na repetição após ajustar o tempo.
O teste adicional de formulário/tabela em 320 pixels passou nos dois motores.
Os testes Docker na UFN validaram chat, publicação, certificado e persistência
após reinício. Evidências usam o prefixo `uxqa-` em `backend/test-results/`.

## Conteúdo e operação

Os seis cursos e as 25 aulas de demonstração foram retirados, a pedido do usuário.
A base operacional está sem cursos, aulas ou certificados até o cadastro pela
gestão. Um curso nasce como rascunho; a publicação exige aulas com conteúdo e
carga horária informada. O profissional só acessa cursos publicados. A emissão
de certificado exige conclusão real de todas as aulas, com dados persistidos e
código verificável. Alterar uma aula retorna o curso a rascunho para revisão.

A recuperação de senha registra uma solicitação para atendimento pela coordenação. Não envia e-mail automaticamente: SMTP não está configurado neste projeto. Links de terceiros dependem da disponibilidade e das permissões dos respectivos provedores.

O catálogo mantém os seis destinos anteriores e inclui o ToolNurse da UFN, também
presente nos links úteis. Títulos, tipos e descrições foram corrigidos para indicar
AMAMOS, APOIARE, o manual do Ministério da Saúde, a coleção do COREN, a busca de
vídeos e DATASUS, sem anunciar produtos fictícios. Durações e quantidades fixas de
participantes foram removidas. Em 29/09, 44 dos 45 endereços externos estavam
acessíveis; o site da Dra. Luisa Pinheiro retornava HTTP 500.

Instruções de publicação e backup: [DEPLOY.md](DEPLOY.md). Estado e evidências desta integração: [PROGRESS.md](PROGRESS.md).

O chat possui atualização automática, histórico paginado, rascunhos por canal e
proteção contra duplicação no reenvio. Os rascunhos ficam em memória na aba;
recarregá-la os descarta. As mensagens enviadas permanecem no banco. A referência
indisponível de Luisa Pinheiro foi retirada, conforme solicitado.
