# Auditoria E2E — Maternar Santa-mariense

Data: 29/09/2026. Projeto: `/Users/kalleby/Downloads/MaternarSantamariense-main`.

**Registro histórico da primeira rodada.** A entrega atual é
`maternar:20260929-uxqa1`; consulte a [revisão de UX e QA](REVISAO-UX-QA-2026-09-29.md).
O site de Luisa Pinheiro citado como pendente abaixo foi removido a pedido do usuário.

**Etapa intermediária:** Em seguida, o usuário determinou zerar
os cursos demonstrativos e cadastrar os cursos reais pelo painel. A versão dessa etapa
foi `maternar:20260929-operacional1`, com 79 testes de API e 32 jornadas por navegador
aprovadas. Cursos, aulas e certificados operacionais estão zerados; os produtos
foram renomeados de acordo com seus destinos reais. Consulte o
[guia atualizado](GUIA-CURSOS-CERTIFICADOS.md) e a última seção de
[PROGRESS.md](PROGRESS.md). As 25 aulas citadas abaixo não são mais uma pendência:
foram retiradas conforme a orientação posterior do usuário.

## Resultado da auditoria

A versão corrigida `maternar:20260929-final3` está ativa e saudável na stack
`maternar` (ID 254) do ambiente `dockerapps` da UFN. A atualização preservou os
sete usuários, seus perfis e hashes de senha, as variáveis da stack e o volume
`maternar-dados`. O ToolNurse foi acrescentado sem remover os seis produtos existentes.

As verificações de aplicação, API, permissões, navegador e persistência descritas
neste relatório passaram. Isso não comprova a publicação pelo domínio HTTPS:
o domínio ainda é encaminhado ao site da UFN e depende da configuração do Nginx
Proxy Manager. Também permanecem pendências editoriais: 25 aulas sem conteúdo,
um site externo com erro 500 e produtos cujos destinos são portais ou coleções,
sem confirmação do material específico descrito no cadastro.

## Escopo e resultados

| Camada | Resultado observado | Evidência em `backend/test-results/` |
|---|---|---|
| API e regressões | 75 testes passaram, 0 falhas, 0 ignorados | `audit-api-final.tap` |
| Chromium | 31 jornadas da suíte completa passaram | `audit-chromium.json` |
| WebKit | As mesmas 31 jornadas passaram | `audit-webkit.json` |
| Catálogo atualizado em Chromium | 3 jornadas passaram; o novo cenário ToolNurse passou após corrigir seu seletor de teste | `audit-catalogo-chromium.txt`, `audit-toolnurse-chromium.json` |
| Catálogo atualizado em WebKit | 4 jornadas passaram, incluindo ToolNurse | `audit-catalogo-webkit.json` |
| Arquivos e navegação local | 84 arquivos distintos e 2 links internos acessíveis | `audit-catalogo-final.json`, `audit-portainer-final-validation.txt` |
| Endereços externos | 45 distintos; 44 acessíveis por HTTP ou navegador; 1 com erro 500 | `audit-links-final.json` |
| Dependências npm | Nenhuma vulnerabilidade conhecida reportada no lockfile final | `audit-dependencies-final.json` |
| Imagem na UFN | Fluxos de API e persistência após reinício passaram em stack sintética | `audit-portainer-final-validation.txt` |
| Atualização do banco real | Usuários e hashes idênticos; integridade válida; 0 violações de FK | `audit-upgrade-real-copy.json`, `audit-production-final.json` |
| Limpeza remota | Nenhum contêiner ou volume temporário da auditoria restante | `audit-cleanup.json` |

São **32 cenários distintos de navegador**: 31 na execução completa de cada motor
e um cenário adicional de ToolNurse/atalhos, executado depois da inclusão solicitada.
Os cenários de navegação profissional, CRUD de produtos e publicação com upload
também foram repetidos após essa inclusão. A primeira execução do cenário novo
usava o nome exato “Baixar”, mas o botão inclui o ícone “↗”; o seletor foi corrigido
e o cenário passou nos dois motores. O registro dessa falha de teste foi preservado.

Não foram usados usuários reais para criar ou excluir conteúdos de teste. As
jornadas locais usam banco e uploads temporários. O teste remoto de escrita usou
stack e volume separados, com dados sintéticos, removidos ao terminar.

## Jornadas verificadas

- Entrada pública, erro de login, solicitação de acesso, aprovação e recuperação
  de senha por solicitação à coordenação.
- Autenticação de Profissional, Gestor e Administrador em ambiente de teste;
  convite, edição, desativação, reativação, redefinição, senha provisória,
  troca obrigatória e encerramento de sessão.
- Navegação pelas 15 seções profissionais, busca, perfil persistido após recarga,
  layout móvel de 390 px e formulário administrativo nessa largura.
- Curso com conteúdo, conclusão idempotente, XP, emissão de certificado,
  verificação pública e preservação do histórico. Curso sem conteúdo não pode
  gerar certificado. Alteração de aula invalida conclusão e pontuação correspondente.
- Qualifica, módulos, recursos e trilhas; publicação de curso, aula, trilha e
  evento pela gestão até consumo pelo profissional e download de calendário.
- Mensagens e leitura de avisos persistidas; separação das tarefas internas da
  coordenação; canais e comunicados.
- Criação, leitura após recarga, pesquisa e exclusão pelos formulários de 17
  recursos: cursos, aulas, módulos, recursos Qualifica, trilhas, políticas,
  materiais, produtos, documentos, protocolos, links, eventos, projetos,
  notificações, conquistas, canais e tarefas. Edição foi exercitada nos recursos
  em que a interface oferece essa ação; notificações não têm botão de edição.
- Upload e publicação de arquivo, abertura pelo profissional, impedimento de
  exclusão de arquivo ainda vinculado, limite de tamanho e campo multipart inválido.
- Exportação administrativa em JSON sem hashes; leitura restrita de auditoria.
- Falha de rede visível com tentativa novamente; resposta atrasada de uma seção
  não substitui a seção atual nem recupera botões de ação desatualizados.
- ToolNurse em Produtos, Links úteis e busca; atalho de portal para o início e
  atalho de suporte para os canais de mensagens; download apresentado para arquivo,
  enquanto um aplicativo externo oferece abertura do produto.

## Correções realizadas

### Permissões e sessões

A rota de aprovação passou a verificar a regra que impede Gestor de administrar
uma conta de Administrador. A alteração de situação pela edição também revoga a
versão do token: reativar uma conta não torna válida uma sessão anterior à
desativação. Tarefas internas passaram a exigir Gestor ou Administrador na leitura,
além das restrições já existentes na escrita.

As escritas dos 17 recursos recusam anônimo e Profissional. O Administrador pode
gerenciar perfis de acesso; o Gestor pode gerenciar conteúdo e equipe dentro dos
limites de seu papel. O profissional mantém suas ações de perfil, progresso,
certificados e mensagens. Não foi criada conta real de Gestor para os testes:
esse papel foi exercitado com dados sintéticos.

### Validação de dados e arquivos

Foram corrigidas entradas que admitiam objetos no lugar de texto, booleanos no
lugar de números, contagens negativas, nomes vazios, etiquetas inválidas e URLs
malformadas ou com esquemas ativos. A validação também cobre rotas alternativas
de escrita de documentos e materiais. A atualização do nome recalcula as iniciais.

Parâmetros inválidos de limite de logs retornam 400 em vez de causar erro interno
ou consulta ilimitada. Vínculos de arquivo são reconhecidos mesmo com barra
inicial, query string ou fragmento, incluindo referências em Links úteis. Falhas
de remoção no disco são propagadas antes de apagar os metadados. Upload acima do
limite retorna 413 e remove o arquivo parcial; campo inesperado retorna 400 sem
derrubar a API.

### Progresso, histórico e vínculos

Alterar ou excluir uma aula desfaz o XP da conclusão invalidada. Concluir a mesma
aula novamente não duplica pontos sem uma invalidação legítima. A exclusão de curso
com certificado é recusada e a transação preserva progresso e prova histórica.
Trilhas recusam módulos inexistentes; a exclusão de módulo limpa os vínculos.

### Interface, dependências e operação

O painel passou a mostrar falha real de carregamento, com tentativa novamente,
em vez de contagens artificiais iguais a zero. Requisições têm timeout e mensagens
de erro; a troca rápida de seção não aplica respostas antigas à seção atual.

O lockfile foi atualizado para versões compatíveis de Express 4.22.3,
body-parser 1.20.8, qs 6.16.0 e Multer 2.4.0. O levantamento inicial indicava
quatro pacotes vulneráveis; o levantamento final reportou zero vulnerabilidades
conhecidas. Essa consulta não é uma garantia de ausência de vulnerabilidades futuras.

O cliente do Portainer aguarda de forma limitada a criação do contêiner após criar
a stack, evitando a falha observada quando a API retorna antes de o contêiner
ficar visível. Mais de um contêiner correspondente continua sendo tratado como erro.

## Catálogo e links

Os seis produtos anteriores foram mantidos por orientação expressa do usuário.
Foi incluído o [ToolNurse — UFN](https://toolnurse.ufn.edu.br/) em Produtos e Links
úteis. A página respondeu 200 no navegador e exibiu o formulário de avaliação
infantil por faixa etária. A verificação foi de acesso e apresentação, sem inserir
dados de pacientes ou validar regras clínicas do serviço externo.

O catálogo atual tem **7 produtos e 11 links úteis**. A migração ocorre uma única
vez e foi testada quanto à repetição: não duplica o ToolNurse nem desfaz edições
ou exclusões futuras feitas pela gestão.

| Registro ou destino | Ação e resultado |
|---|---|
| COREN-RS | O diretório antigo retornava 403. O destino foi atualizado para a [página oficial de protocolos municipais](https://www.portalcoren-rs.gov.br/index.php?categoria=publicacoes&pagina=protocolos-enfermagem-municipais), acessível no navegador. |
| TelessaúdeRS | Substituído o endereço antigo pelo [destino oficial direto](https://telessauders.ufrgs.br/), verificado com HTTP 200 no navegador. |
| Portal interno Maternar | `#portal` passou a `/app#inicio`; navegação verificada. |
| Suporte técnico | `#suporte` passou a `/app#mensagens`, com descrição correspondente aos canais disponíveis. |
| IDF Diabetes Atlas | O verificador HTTP inicial falhou, mas o navegador confirmou 200 e a página correta; o endereço foi preservado. |
| Conteúdo Pediátrico | `https://pediatraluisapinheiro.com.br/` retorna 500; tentativas com e sem `www` e com HTTP/HTTPS não resolveram. Aguardando outro endereço oficial do usuário. |

**Disponibilidade e correspondência editorial são verificações diferentes.**
“Amamentar” abre o portal AMAMOS; o podcast abre APOIARE; a série de vídeos abre
uma busca no YouTube; o panorama municipal abre DATASUS. O “Manual de simulação
em emergências obstétricas” agora abre uma coleção de protocolos do COREN, não
um arquivo desse manual confirmado. A troca elimina o 403, mas não comprova a
correspondência com o título. Esses registros permanecem visíveis conforme a
orientação do usuário; a confirmação ou substituição dos materiais específicos
continua sendo uma pendência de conteúdo. Uma resposta 200, isoladamente, não
comprova essa correspondência.

Foram encontradas 45 URLs externas distintas no catálogo final. Dessas, 44 tiveram
acesso HTTP/navegador bem-sucedido nesta auditoria; o site pediátrico continua
indisponível. PDFs externos foram verificados também com respostas 206 a requisições
parciais. Essa contagem não significa inspeção integral de cada documento ou vídeo.

## Dados reais e implantação

| Item | Estado verificado |
|---|---|
| Stack / ambiente | `maternar`, ID 254 / `dockerapps`, ID 5 |
| Imagem ativa | `maternar:20260929-final3` |
| ID da imagem | `sha256:38cecb38076e0fdcd7e54e7743b14778e88daf0ad83340430a2f5c3cefce8548` |
| Bind privado | `10.21.19.45:8035` → `3000` |
| Volume | `maternar-dados` |
| Banco | 7 usuários: 2 Administradores e 5 Profissionais |
| Integridade | `integrity_check=ok`; nenhuma violação de chave estrangeira |
| Preservação | Todos os campos dos usuários e hashes comparados antes/depois e preservados |
| Variáveis | Mantidas, inclusive segredo JWT |
| Backup anterior | `/app/backend/data/backups/pre-final3-1790701228491.db`, privado no volume |
| Imagem anterior | `maternar:20260929-portainer1`, preservada para retorno |
| Pacote da atualização | `dist/portainer-ufn-20260929-final3/` |

A atualização foi validada primeiro em uma cópia do banco real local, removida
ao terminar, e depois na stack institucional. Os dados reais não fazem parte da
imagem Docker. O pacote atual contém contexto de build, stack, metadados, hashes
e as variáveis vigentes em arquivo privado. Não contém uma restauração para aplicar
sobre o banco de produção. O diretório tem modo 0700 e o `stack.env`, modo 0600.

O teste remoto na porta temporária 8036 verificou login com três papéis, 17 recursos
com restrições de escrita, perfil, upload, curso, certificado, XP, proteção de arquivo
vinculado, sessões, avisos, mensagens, exportação e validação de entradas. Após
reinício, perfil, curso, upload, certificado e mensagem permaneceram. Healthcheck
`healthy`; contêiner e volume sintéticos removidos.

Na stack real atualizada, `/`, `/app`, `/painel` e `/api/saude` responderam 200.
Arquivos internos de banco e configuração continuaram bloqueados por 404. As APIs
administrativas foram verificadas com token emitido internamente pelo servidor;
a senha pessoal dos usuários não foi redefinida nem usada para esta checagem.
O código de `app.js` dentro do contêiner teve hash idêntico ao código local.

O acesso direto ao IP privado não está disponível a partir deste computador; as
verificações de origem foram executadas no ambiente Docker da UFN. Elas não cobrem
DNS, certificado, encaminhamento público, cabeçalhos ou limite de upload do proxy.

## Condições restantes para a abertura pública

1. **Domínio e HTTPS:** na checagem de 29/09 às 17:00 UTC, HTTP respondeu 301 para
   `https://site.ufn.edu.br/`. A TI deve liberar o acesso válido ao Nginx Proxy
   Manager para encaminhar o domínio a `http://10.21.19.45:8035`, incluindo API,
   uploads e acervo, e configurar o certificado. O roteiro está em
   [deploy/portainer/README.md](deploy/portainer/README.md). Após isso, executar
   navegador, login, navegação e upload pelo domínio HTTPS real.
2. **Aulas:** os seis cursos têm 25 aulas sem arquivo/URL. A coordenação precisa
   fornecer ou publicar os materiais correspondentes. A plataforma impede
   conclusão/certificação de conteúdo ausente. A jornada completa funciona nos
   testes com materiais separados, sem certificar usuários reais artificialmente.
3. **Site pediátrico:** depende de recuperação do servidor externo ou de outro
   endereço oficial. A pergunta sobre alternativa foi enviada ao usuário.
4. **Correspondência dos produtos:** confirmar os materiais específicos quando o
   cadastro anuncia cartilha, podcast, manual, série ou relatório e o destino é
   portal, coleção ou busca. Os registros foram preservados conforme solicitado.

A recuperação de senha disponível registra uma solicitação para atendimento manual
pela coordenação. Não há envio automático por SMTP configurado. Esse comportamento
foi verificado; a auditoria não deve ser interpretada como teste de envio de e-mail.

## Reproduzir as verificações locais

```bash
cd backend
npm ci
npm test
npx playwright install chromium webkit
npm run test:e2e -- --output=test-results/browser-chromium
E2E_BROWSER=webkit npm run test:e2e -- --output=test-results/browser-webkit
npm audit
```

Os comandos de navegador atuais abrangem os 32 cenários existentes. As subpastas
de saída evitam que uma nova execução apague os outros relatórios de auditoria.
Os testes não devem ser apontados para a base real.

A aplicação local permanece disponível em `http://127.0.0.1:3100`. O backup local
anterior à atualização é `backend/data/backups/pre-auditoria-final-20260929.db`,
com acesso privado. O histórico de implantação está em [PROGRESS.md](PROGRESS.md).
