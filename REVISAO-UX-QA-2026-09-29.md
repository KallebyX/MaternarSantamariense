# Revisão de UX, interface e QA — 29/09/2026

Esta revisão atende à remoção da referência de Luisa Pinheiro e à verificação dos
fluxos reais de comunicação, configurações, gestão e aprendizagem. Complementa o
registro histórico da [auditoria anterior](AUDITORIA-E2E-2026-09-29.md).

> Atualização posterior: HTTPS e SMTP foram concluídos, com entrega real e nova
> regressão de 91 testes de API + 47 jornadas em cada navegador. Veja
> [PUBLICACAO-EMAIL-2026-09-29.md](PUBLICACAO-EMAIL-2026-09-29.md). As pendências
> de Nginx/e-mail citadas abaixo descrevem o estado anterior desta revisão.

## Correções entregues

- Removido do seed e do banco existente o recurso que apontava para
  `pediatraluisapinheiro.com.br`. A migração é executada uma única vez, preserva
  outros recursos e recalcula a quantidade de materiais do módulo afetado.
- Chat com atualização automática a cada dois segundos enquanto a aba está
  visível. Mensagens recebidas não apagam o rascunho nem forçam a rolagem de quem
  está lendo o histórico. Um botão leva às novas mensagens.
- Rascunhos separados por canal, mantidos em memória durante navegação e falhas
  de envio. Recarregar ou fechar a aba descarta textos ainda não enviados.
- Reenvio seguro: o servidor reconhece o identificador da solicitação e retorna
  a mesma mensagem quando a resposta anterior se perdeu. Nenhuma duplicação no
  banco. Autoria obtida da sessão; texto não vazio, até 2.000 caracteres; conteúdo
  HTML exibido como texto. Data e hora no fuso de Brasília.
- Histórico em páginas de 50 mensagens; consulta incremental limitada a 200 por
  resposta. Índice por canal/cursor e índice único por autor/identificador.
- Falhas de biblioteca e referências administrativas passam a mostrar erro e
  tentativa novamente. Não são apresentadas como listas vazias.
- Formulários mostram carregamento imediatamente; não salvam durante o upload.
  Respostas atrasadas de um formulário fechado não substituem o formulário atual.
- Perfil de gestão atualiza o nome e a unidade no menu. Troca de senha pede
  confirmação, mostra erros e conserva a nova sessão; tokens antigos são revogados.
- Corrigida a largura da página de acesso e da tela de registros em celulares
  pequenos. Ajustados modais, campos de arquivo, avisos e cartões de estatísticas.
- Menu administrativo compacto com rolagem horizontal no celular. Tabelas têm
  orientação de rolagem e acesso por teclado; as ações não cobrem os dados.
- Melhorado o contraste de textos secundários. O atalho “Pular para o conteúdo”
  move o foco sem alterar a rota. Campos de seleção/upload têm nomes acessíveis.
- A área profissional identifica o catálogo como “Produtos e ferramentas”, de
  acordo com seus destinos. ToolNurse e os demais produtos permanecem cadastrados.

## Evidências

Todas as evidências abaixo ficam em `backend/test-results/`.

| Camada | Resultado | Evidência |
|---|---|---|
| API | 83 testes aprovados, zero falhas | `uxqa-api.tap` |
| Chromium | 44 cenários aprovados entre a suíte completa, a repetição da jornada longa e o teste móvel | `uxqa-chromium.json`, `uxqa-course.json`, `uxqa-mobile-chromium.json` |
| WebKit | 44 cenários aprovados: 43 na suíte completa e 1 adicional móvel | `uxqa-webkit.json`, `uxqa-mobile-webkit.json` |
| Docker UFN em volume separado | Autenticação, 17 recursos com RBAC, uploads, curso, certificado, chat e reinício aprovados | `uxqa-portainer.txt` |
| Arquivos na imagem | 86 caminhos locais acessíveis; arquivos privados bloqueados | `uxqa-portainer.txt` |
| Stack institucional | Imagem ativa e saudável; usuários, hashes e variáveis preservados | `uxqa-production.json` |
| Limpeza e porta privada | Nenhum contêiner/volume temporário; aplicação em `10.21.19.45:8035` | `uxqa-cleanup.json` |
| Banco local | 7 usuários e hashes preservados; integridade válida; zero violações de FK | `uxqa-local.json` |

A primeira rodada focada reproduziu um estouro de largura em “Registros e
backup”, em 320 e 390 pixels. Foi corrigido e as quatro larguras passaram na
rodada completa. Em Chromium, uma jornada com dois usuários, upload, curso,
certificado, trilha e agenda atingiu o limite total de 45 segundos depois de
emitir o certificado. A análise do trace não identificou uma falha funcional;
o tempo total dessa jornada passou a 120 segundos, conservando os limites de
cada expectativa. A repetição integral passou em 14,9 segundos. Os registros
das primeiras falhas foram preservados.

### Cobertura de navegador

- Página pública, login correto/incorreto, solicitação de acesso, recuperação
  manual, aprovação, convite com senha provisória, troca obrigatória e logout.
- Todas as 15 seções profissionais e as 22 seções administrativas em larguras
  de 320, 390, 768 e 1440 pixels: 148 combinações de seção/largura por motor,
  além da página pública e dos formulários. Teste adicional em 320 pixels
  cadastra, edita e remove curso pela interface, alcançando o rodapé do modal
  e as ações da tabela por rolagem. Sem estouro horizontal da página.
  Tabelas e menus usam rolagem interna intencional.
- Cadastro, leitura após recarregar, edição e exclusão dos 17 recursos do painel.
- Upload, publicação de curso, acesso profissional ao arquivo, conclusão,
  certificado, consulta pública e geração de PDF no Chromium.
- Perfil e senha, divergência na confirmação, persistência e invalidação do
  token/senha antigos. Gestão de situação e permissões de usuários.
- Chat entre duas sessões, atualização sem recarregar, resposta nos dois sentidos,
  isolamento entre canais, histórico anterior, texto longo e HTML literal.
- Perda de resposta depois de a API gravar a mensagem: a nova tentativa mantém
  exatamente um registro. Falha de atualização mostra erro; reconexão mantém o
  rascunho. Texto pendente não é enviado ao mudar de canal.
- Erros de biblioteca, referências e páginas; nova tentativa; navegação rápida
  com respostas atrasadas; bloqueio de salvamento durante upload.
- Inspeção visual de capturas de desktop e celular: início, Qualifica, chat,
  perfil, equipe, visão geral e formulário de curso. Capturas `ux-*.png`.

Os testes de escrita usam bancos/volumes temporários separados. A aplicação,
as requisições HTTP e a persistência SQLite são reais; falhas de transporte são
provocadas apenas para testar a recuperação. Os dados de teste não entram na
imagem nem na base operacional. O painel e o chat locais também foram conferidos
com a sessão real, sem publicar mensagens de teste para a equipe.

## Implantação e limites da verificação

Imagem preparada e validada na UFN: `maternar:20260929-uxqa1`, ID
`sha256:9b72ea8263c287688d99c46e3cc0b5efaf5f3800e1e86589b00bddfc9e618a47`.
Pacote: `dist/portainer-ufn-20260929-uxqa1/`, com checksums e modelo de variáveis
sem segredos. O código dentro do pacote foi comparado aos arquivos testados.

Stack **maternar (254)** atualizada e saudável, com API autenticada e catálogo
verificados após a atualização. Os sete usuários (dois administradores e cinco
profissionais), todos os campos/hashes e as variáveis da stack foram preservados.
Integridade SQLite válida e zero violações de chaves estrangeiras. Permanecem
zero cursos, aulas e certificados operacionais; 7 produtos, 11 links e 25 recursos
Qualifica. Não há fixtures na imagem.

Backup remoto anterior: `/app/backend/data/backups/pre-uxqa1-1790704614445.db`.
Imagem disponível para retorno: `maternar:20260929-operacional1`.
Backup local: `backend/data/backups/pre-uxqa1-20260929.db`.
O servidor local atualizado permanece em `http://127.0.0.1:3100`.

A última conferência do domínio registrou HTTP 301 para `https://site.ufn.edu.br/`
e erro TLS `unrecognized_name` em HTTPS (`uxqa-domain.json`).

A publicação no domínio `maternarsantamariense.app.ufn.edu.br` continua dependendo
do Nginx/HTTPS da UFN. Os testes de aplicação não substituem a verificação pelo
domínio depois da configuração da TI. A recuperação de senha é atendida pela
coordenação, sem promessa de e-mail automático; não há SMTP configurado.
Disponibilidade de sites de terceiros também depende dos respectivos provedores.

Uma bateria de testes comprova os cenários executados, não ausência absoluta de
defeitos em todo dispositivo, situação de rede ou serviço externo. As evidências
registram resultados e limites para a decisão de publicação.
