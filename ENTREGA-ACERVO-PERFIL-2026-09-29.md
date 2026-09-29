# Entrega de acervo, projetos, GESTAR e persistência

Verificada em 29/09/2026 em https://maternarsantamariense.app.ufn.edu.br.

## Resultado publicado

- Logo horizontal original do GESTAR nos rodapés da apresentação e da plataforma, com proporção preservada, texto alternativo e adaptação a telas pequenas.
- 13 materiais originais do Drive incorporados ao acervo: oito de Alimentação e Nutrição, quatro de Saúde da Criança e um de PICS. As mesmas fontes geram 13 documentos e sete protocolos adicionais, sem presumir aprovação ou revisão clínica.
- 547 projetos históricos de 2018–2024 incorporados aos 157 registros atuais. Total: **704 projetos, 109 materiais, 97 documentos e 32 protocolos**. Cursos e aulas operacionais continuam zerados.
- Filtros combináveis por busca, ano, instituição, acervo atual/histórico, situação administrativa e situação original da fonte. Plataforma com paginação de 24 itens; gestão com exibição progressiva de 40 itens e busca sobre o conjunto completo.
- Situação e datas editadas pela gestão aparecem separadamente da classificação histórica e do texto literal da fonte. Registros antigos usam o rótulo “Registro NEPeS”.
- Links úteis mantêm os 11 registros e os ícones Lucide locais da sidebar, sem dependência de CDN.

## Perfil e persistência

A investigação confirmou dois comportamentos distintos: os campos de formação, cargo e unidade já estavam gravados no banco local, enquanto o cadastro publicado ainda estava vazio nesses campos; além disso, o resumo visual da formação não era atualizado imediatamente após salvar. A interface agora utiliza a resposta confirmada da API para atualizar os dados exibidos.

Também foi corrigida a limpeza de campos opcionais no formulário genérico do painel: valores vazios são enviados explicitamente, evitando que o valor anterior reapareça. Alterações no próprio cadastro pela gestão atualizam a identidade exibida na sessão.

Na publicação, somente formação, cargo e unidade do cadastro solicitado foram reconciliados com os valores já salvos localmente. A gravação ocorreu pela API e foi lida novamente; uma comparação integral confirmou que todos os demais campos, usuários e hashes de senha permaneceram iguais. Credenciais e dados pessoais não integram este relatório nem o contexto Docker.

## Fonte e preservação

A varredura recursiva cobriu 71 pastas e 104 arquivos. Os 100 binários foram comparados por SHA-256. O [relatório de reconciliação](backend/imports/RECONCILIACAO-DRIVE-2026-09-29.md) documenta cada categoria e os arquivos incorporados.

As 21 linhas de 2018 sem título continuam registradas como lacunas da fonte, sem títulos inventados. Números repetidos receberam identidades distintas; contatos pessoais e CPFs foram retirados dos campos publicáveis. O arquivo bruto com contatos não integra o repositório ou o diretório público. “Histórico” identifica a origem arquivada e não afirma autorização, andamento ou conclusão.

A migração foi testada em esquema legado com coluna adicional, índice, view e trigger. Importações transacionais e marcadores persistidos impedem que reinícios revertam edições ou recriem exclusões administrativas.

## Validação executada

| Camada | Resultado |
|---|---|
| API, migração e persistência | 107/107 testes aprovados |
| E2E completo Chromium | 59/59 aprovados, sem falhas, ignorados ou repetições |
| E2E WebKit desta entrega | 13/13 aprovados: perfil, campos opcionais, históricos, Links úteis, sidebar e celular |
| Imagem em contêiner isolado na UFN | CRUD, 17 recursos com RBAC, upload, curso, certificado, chat, revogação de sessão e persistência após reinício aprovados |
| Arquivos locais na imagem | 99 URLs referenciadas responderam HTTP 200 |
| Domínio HTTPS público | 21 arquivos comparados por SHA-256, incluindo a logo e os 13 materiais novos; APIs confirmaram 704 projetos, 547 históricos e 78 registros de 2018 |
| Banco operacional | Integridade SQLite ok, nenhuma violação de chave estrangeira e sete usuários preservados |

Os testes de escrita e emissão de certificados usam bancos temporários, separados dos cadastros reais. A imagem operacional não inclui as fixtures nem cria cursos, mensagens, certificados ou usuários demonstrativos. As evidências locais ficam em `backend/test-results/acervo-*`, excluídas do Git; `outputDir` do Playwright separa artefatos descartáveis dos relatórios.

## Implantação

- Stack `maternar`, ID 254, ambiente `dockerapps`, volume `maternar-dados`.
- Imagem ativa: `maternar:20260929-acervo1`.
- Digest: `sha256:6b1bca073eae9a23ffe374e29a07fff2ac927ef0ecfc73ee577106f5f05f6691`.
- Backup privado anterior: `/app/backend/data/backups/pre-acervo1-1790709377338.db`.
- Imagem anterior preservada: `maternar:20260929-sidebar2`.
- Contexto público: `dist/portainer-ufn-20260929-acervo1/maternar-build.tar.gz`, 305.026.305 bytes; SHA-256 `0398af8abd6d33cfbb5a560acaf691db83235a59cbd3378df372bcbcc167bd49`.

A atualização preservou as variáveis vigentes em memória, sem exportar segredos; apenas `MATERNAR_IMAGE` mudou. O pacote contém modelo de variáveis sem credenciais e reutiliza o volume existente. Não execute uma restauração de banco sobre a instalação atual.

Para um retorno, considere em conjunto a imagem e o backup anterior à migração: a versão antiga da interface não conhece os novos campos de histórico. O backup fica no volume privado e deve ser usado somente após considerar eventuais gravações feitas depois desta publicação.
