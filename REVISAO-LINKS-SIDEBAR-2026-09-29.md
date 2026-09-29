# Links úteis e sidebar — 29/09/2026

## Diagnóstico e mudanças

A abertura direta de `/painel#links` no servidor local retornou os 11 registros
reais, incluindo ToolNurse, antes da alteração. A navegação partindo da visão
geral e de uma listagem longa também carregou os dados, sem erro no console.
Não foi possível reproduzir a tela completamente branca nesse estado inicial;
a evidência não permite atribuir o relato a perda de dados ou falha permanente
na API.

A navegação foi reforçada: seleção atual acessível por `aria-current`, item
selecionado mantido visível no menu, retorno ao início do conteúdo e fallback
para visão geral em fragmentos desconhecidos ou vazios. A listagem passa a
rejeitar respostas que não sejam uma lista, exibindo erro legível e tentativa
novamente. A busca de cada seção ganhou nome acessível explícito.

Os 22 símbolos Unicode foram substituídos por ícones Lucide Static 1.48.0.
Todos têm caixa de 20 px, traço de 1,8, cor consistente e significado associado
à seção. Um sprite local de 5.566 bytes contém somente os ícones utilizados;
não há dependência de CDN. Os desenhos são decorativos para leitores de tela,
que recebem os nomes dos botões sem caracteres extras. A licença acompanha a
imagem, e `npm run icons` regenera os arquivos a partir do pacote fixado.

A sidebar tem largura de 264 px, cabeçalho e rodapé estáveis, rolagem própria
no menu, áreas clicáveis de pelo menos 44 px e destaque de foco por teclado.
Em telas até 900 px, mantém navegação horizontal, sem alargar a página.
A tabela usa rolagem horizontal no celular, com orientação visível.

## Verificações

- Sete novos cenários de regressão passaram no Chromium: acesso direto, busca,
  recarga, histórico, teclado, falha de rede, resposta inválida e layouts em
  320, 390, 768, 1024 e 1440 px. Ícones verificados como SVGs realmente
  desenhados, incluindo item ativo dentro da área visível.
- API: 91 testes aprovados, sem falhas ou ignorados.
- Nova imagem construída e verificada em volume/contêiner isolados da UFN:
  CRUD, permissões, upload, cursos, certificados, mensagens e persistência
  após reinício. Recursos temporários removidos.
- Os cadastros temporários de QA são isolados da base operacional. A aplicação
  continua consultando e gravando a API e o SQLite reais.

Evidências em `backend/test-results/`: `links-focused-chromium.json`,
`sidebar-api.tap`, `sidebar-container.txt`, `links-sidebar-390.png` e
`links-sidebar-1440.png`.

## Regressão da plataforma

A execução ampla no Chromium aprovou 53 de 54 cenários. O cenário de curso,
trilha e agenda começou a navegar antes da conclusão da emissão de certificado:
a expectativa procurava o nome do curso, já presente na página anterior. O trace
mostra a tentativa de abrir Qualifica enquanto a resposta de emissão ainda
direcionava o usuário a Certificados.

O teste passou a aguardar o título “Meus certificados” e o certificado publicado
antes de navegar. Sua repetição isolada passou em 12,5 segundos, sem ampliar
timeout ou mudar a implementação de cursos. Evidências preservadas:
`sidebar-chromium-initial.json` (53 aprovados, 1 falha de sincronização) e
`sidebar-course.json` (cenário corrigido aprovado). O CRUD completo de Links
úteis, incluindo persistência, cadastro, edição e remoção, passou na execução
ampla. A mudança no teste não integra a imagem de produção.

No WebKit, motor do Safari, os 12 cenários selecionados passaram sem falhas:
os sete novos testes, o fluxo de curso e os quatro percursos por todas as seções
profissionais e administrativas em 320, 390, 768 e 1440 px. Evidência:
`sidebar-webkit.json`. As capturas de `links-sidebar-*.png` foram atualizadas
nessa execução para documentar o desenho real dos SVGs no WebKit.

## Ajuste final e publicação

Na inspeção pública com uma busca de apenas um resultado, o grid móvel distribuía
a altura disponível entre a sidebar e o conteúdo, produzindo uma faixa azul
vazia abaixo do rodapé. A definição `grid-template-rows: auto 1fr` limita a
primeira linha à altura da navegação e entrega o espaço restante ao conteúdo.
O novo teste cobre também listas vazias e verifica esse espaço explicitamente.
Os sete cenários de Links úteis passaram novamente no Chromium e no WebKit
depois dessa alteração (`sidebar-final-chromium.json` e
`sidebar-final-webkit.json`).

A versão final **maternar:20260929-sidebar2** está saudável na stack **254**,
environment **dockerapps (5)**. Imagem:
`sha256:bdb3524f19670ce563a936a05b68b46db089f4d7c4daef522ecc19a0af7799a8`.
Sete usuários (dois administradores e cinco profissionais), seus campos e hashes
foram preservados. Variáveis privadas e volume `maternar-dados` permanecem
iguais; integridade SQLite `ok` e zero violações de chave estrangeira.

Backup privado anterior à revisão final:
`/app/backend/data/backups/pre-sidebar2-1790707744334.db`.
As imagens `maternar:20260929-sidebar1` e `maternar:20260929-email1` continuam
disponíveis para retorno.

Pelo HTTPS público, painel, JavaScript, sprite e licença responderam 200 e
coincidiram por SHA-256 com os arquivos locais testados. A API retornou os 11
links reais. A sessão administrativa existente abriu `/painel#links`, filtrou
ToolNurse e voltou à lista completa. A inspeção visual confirmou os SVGs e a
altura móvel corrigida. Não foram criados registros de teste em produção nem
enviados novos e-mails.

Evidências: `sidebar-final-production.json` e `sidebar-public-assets.json`.
Pacote sem banco/credenciais: `dist/portainer-ufn-20260929-sidebar2/`.
SHA-256 do contexto Docker:
`435c35bee1bd2fbc0f404608680e966f1e7bbf104429b79c13228db249c250bd`.

O servidor local permanece disponível em `http://127.0.0.1:3100/painel#links`.
