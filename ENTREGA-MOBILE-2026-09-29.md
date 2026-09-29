# Revisão de posicionamento, mobile e logos — 29/09/2026

As páginas curtas da área profissional eram centralizadas verticalmente por `main { margin: auto }` dentro do grid. No WebKit, o teste de reprodução mediu o início do conteúdo em **205,8 px** numa tela de 1440 × 1000. O alinhamento agora é ao topo em todas as seções, com margem horizontal automática e posição inicial restaurada ao trocar de aba.

## Interface

- Menu móvel compartilhado entre área profissional e gestão, disponível até 900 px, com diálogo nativo, fechamento por Escape, clique externo e seleção de aba. Foco contido e retorno ao botão ao fechar manualmente.
- Sidebar com cabeçalho e identificação fixos; somente as opções têm rolagem. Logout e sessão expirada fecham também o menu deslocado para o diálogo.
- Tabelas de gestão viram cartões com rótulos e ações visíveis até 600 px. Sem perda de campos ou mudança nas operações da API.
- Formulários longos têm área de rolagem e ações de salvar/cancelar visíveis. Altura e posição acompanham a área útil do navegador.
- Entradas com fonte de 16 px, alvos de toque de pelo menos 44 px nas ações móveis, suporte a áreas seguras e telas em modo paisagem.
- Menu compacto na página pública, mantendo acesso às seções, login, solicitação de acesso e verificação de certificado.
- Os **seis logos** permanecem na página pública e agora também aparecem juntos no rodapé profissional: PPGSMI, UFN, GESTAR horizontal, NINMA Hub, NEPeS e Prefeitura de Santa Maria. Proporções preservadas e disposição adaptada ao celular.

## Validação

- API: 107/107 testes aprovados.
- Chromium: 67 cenários validados. A suíte completa passou 65 inicialmente; duas asserções de rolagem antecipavam o evento de navegação. Após aguardar título e posição final, os nove testes móveis passaram, incluindo os dois casos. Nenhuma asserção funcional foi retirada.
- WebKit: 30/30 E2E aprovados, incluindo todas as seções profissionais e administrativas nas larguras 320, 390, 768 e 1440 px; menu também em 844 × 390.
- Testes de sessão revogam um token real da base isolada e confirmam o retorno à tela de login.
- Revisões independentes geral e JavaScript aprovadas após corrigir o fechamento do menu ao encerrar a sessão.

Os testes usam bases isoladas, sem inserir registros de demonstração na produção. A emulação de viewport/WebKit não substitui uma prova em todos os modelos físicos de celular.

## Publicação

Validação final da imagem, publicação e sincronização GitHub em andamento.
