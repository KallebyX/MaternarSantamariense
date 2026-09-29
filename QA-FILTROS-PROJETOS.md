# Consulta dos projetos atuais e históricos

Revisão de 29/09/2026 para o acervo de 704 projetos: 157 registros atuais e 547 históricos de 2018 a 2024. A importação e as migrações são descritas separadamente nos relatórios do acervo.

A plataforma profissional e o painel de gestão permitem combinar busca textual, ano da fonte, instituição, situação do projeto, acervo atual/histórico e situação literal na fonte (AUT. CEP). A busca ignora diferenças de acentuação e capitalização e procura todas as palavras informadas no título, responsável, instituição e local.

Na plataforma, a API entrega 24 registros por página e informa quantidade encontrada, quantidade total e página atual. Alterar os filtros reinicia a paginação. Os filtros ficam no endereço e sobrevivem à recarga. No painel, a busca e os filtros consultam todo o conjunto carregado, exibindo 40 registros por vez; “Mostrar mais” amplia a tabela e a contagem informa quantos registros estão visíveis, quantos correspondem aos filtros e o total do acervo.

O endpoint `/api/projetos` aceita `q`, `ano`, `status`, `instituicao`, `escopo=atuais|historicos`, `situacao_origem`, `pagina` e `limite`. Sem paginação explícita, mantém a listagem completa para os consumidores existentes. As opções de filtros vêm dos registros do banco; anos e autorizações não são deduzidos pela interface.

## Preservação da informação

- “Acervo histórico” identifica a origem do registro. A situação administrativa atual aparece separadamente, inclusive depois de ser editada no painel.
- O período cadastrado e o período literal da fonte aparecem separadamente, evitando esconder datas editadas pela gestão.
- A coluna AUT. CEP é apresentada como situação na fonte, sem tratá-la como andamento atual ou prova automática de autorização NEPeS.
- Dados ausentes permanecem ausentes. A edição de um histórico sem responsável informado não exige inventar uma pessoa; o cadastro e a edição de projetos atuais continuam exigindo responsável.
- Campos de origem permanecem preservados quando a gestão edita os campos administrativos.

## Validação

`backend/tests/projetos-filtros.test.js`: quatro cenários de API verificam filtros combinados, normalização, paginação sem duplicar registros, totais, parâmetros inválidos, ausência de ano, resultados vazios e preservação dos campos históricos após edição.

`backend/e2e/projetos-filtros.spec.js`: três cenários de navegador verificam a consulta profissional com filtros/paginação/recarga, a tabela de gestão com filtros/contagem/limpeza e a edição de situação/datas com confirmação visual e preservação da fonte. Os dois fluxos de consulta também verificam ausência de transbordamento horizontal em 390 pixels.

Resultado final: 4/4 testes de API, 3/3 no Chromium e 3/3 no WebKit, sem repetição automática.

Os testes usam bancos isolados. As consultas utilizam o acervo importado real nesses bancos e a edição feita pelo teste é restaurada ao final. Não alteram o banco local de uso, o servidor UFN ou seus usuários.

Evidências locais em `backend/test-results/projetos-filtros-api.txt`, `projetos-chromium.txt`, `projetos-webkit.txt`, seus relatórios JSON e capturas `projetos-historicos-mobile.png` e `projetos-gestao-mobile.png`.
