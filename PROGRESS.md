# Maternar — integração e validação

Atualizado em 29/09/2026. Pasta de trabalho: `/Users/kalleby/Downloads/MaternarSantamariense-main` (exportação sem repositório Git próprio).

**Estado mais recente:** imagem `maternar:20260929-acervo1` ativa e saudável na
stack 254 da UFN. HTTPS público verificado, sete usuários preservados e perfil
reconciliado nos três campos autorizados. São 704 projetos, 109 materiais,
97 documentos e 32 protocolos. **107 testes de API, 59 E2E Chromium e 13 E2E
WebKit aprovados**, sem falhas ou repetição automática. Cursos operacionais
permanecem zerados. Consulte a [entrega final do acervo e perfil](ENTREGA-ACERVO-PERFIL-2026-09-29.md).
As etapas abaixo registram estados anteriores, inclusive bloqueios já resolvidos.

## Entrega local

- Plataforma profissional substituiu o runtime demonstrativo por HTML/CSS/JavaScript ligado ao backend Express/SQLite.
- Landing, `/app`, `/plataforma` e `/painel` são servidos pelo mesmo processo; frontend e gestão compartilham autenticação e banco.
- Navegação profissional: início, cursos/aulas, Qualifica e trilhas, políticas, protocolos, documentos, produtos, projetos, agenda/calendário, canais/mensagens, avisos/leitura, certificados, links, busca e perfil.
- Painel preserva a gestão de equipe, aprovação, convites, reset de senha, uploads e CRUD dos conteúdos; formação profissional e ano da agenda foram adicionados aos formulários.
- Login do profissional no endereço do painel leva à plataforma; páginas exclusivas de administrador não aparecem para gestor e possuem fallback correspondente.
- Sessões revogadas em logout e troca/reset de senha. Senha provisória exige troca. Senha atual incorreta informa erro sem derrubar a sessão válida.
- Registros da plataforma e contadores passam pelo banco; não há conta demonstrativa na inicialização normal.
- Aulas sem conteúdo não podem ser concluídas; curso vazio não emite certificado. Certificados novos armazenam nome, título e carga horária da emissão. Mudança de conteúdo de aula invalida a conclusão antiga dessa aula.
- Servidor publica apenas arquivos permitidos; banco, credenciais, seeds e código interno retornam 404. Upload de SVG ativo recusado; links com esquemas não navegáveis recusados no CRUD.
- Importação transacional e idempotente: preserva contas existentes, não duplica nem redefine senhas. Dados pessoais e credenciais ficam fora dos seeds, Git e Docker.
- Dockerfile inclui os arquivos e diretórios faltantes. Deploy reinicia o processo ao atualizar; `/uploads` passa pelo proxy para funcionar com volume Docker.
- Backup SQLite consistente por API nativa do banco; JSON do painel identificado como exportação sem hashes.

## Cadastros reais

Importados do PDF **Equipe Dom Antonio Reis.pdf**, com a ordem de correspondência dos campos confirmada pelo usuário:

1. Fernanda Ponte de Araujo
2. Jeferson Luiz Machado de Oliveira
3. Alberto Rafael Lezcano Guerra
4. Andressa Cooper Prdroso
5. Cássia dos Santos Wippel

Todos estão ativos como Profissional. Nome, e-mail, CPF, formação, profissão na SMS e local de atuação foram preservados; senhas foram convertidas em hashes bcrypt. A grafia de Andressa e o local “Santa Maria” de Jeferson foram mantidos conforme o PDF.

A pedido do usuário, **Luiz Fernando Rodrigues Jr.**, professor da Universidade Franciscana — UFN, foi cadastrado como **Administrador**, incluindo as funções de gestão. Conta ativa, senha provisória e troca obrigatória. E-mail informado pelo usuário consta no banco. Credencial inicial: `backend/data/acesso-inicial-luiz.txt`, arquivo privado com modo 0600, não servido por HTTP. Nenhuma mensagem ou e-mail foi enviado.

## Evidências verificadas

- `cd backend && npm test`: **56 testes passaram**, zero falhas (incluindo 4 cenários de restauração acrescentados na preparação do Portainer).
- `cd backend && npm run test:e2e`: **10 jornadas passaram**, zero falhas, Chromium real. Banco temporário separado, sem usar as contas reais.
- Jornadas: entrada pública/erro/recuperação; 15 seções profissionais e layout 390 px; perfil e recarga; curso/conclusão/certificado/verificação pública; mensagem e aviso persistentes; todas as seções administrativas; upload e publicação de produto pela UI; solicitação e aprovação pela UI; senha provisória/troca/logout; recuperação de falha de rede; publicação de curso/aula/trilha/evento pela gestão até consumo e download de calendário pelo profissional; criação de módulo com opções padrão.
- **86 arquivos locais distintos** referenciados no acervo, documentos, protocolos, produtos, Qualifica e links responderam HTTP 200.
- Sintaxe validada de 21 arquivos JavaScript de aplicação/scripts.
- Login e `/api/auth/eu` dos cinco profissionais reais verificados antes e depois do reinício.
- Login de Luiz verificado: Administrador, senha provisória ativa, demais ações bloqueadas até a troca; arquivo de credenciais devolve 404 por HTTP.
- Banco local: **6 usuários (5 profissionais + 1 administrador)**; `integrity_check=ok`; `foreign_key_check` sem ocorrências. Backup consistente validado por leitura independente, salvo em `backend/data/backups/maternar-2026-09-29.db`.
- Conteúdo local: 6 cursos, 25 aulas, 17 áreas, 96 materiais, 84 documentos, 157 projetos, 6 produtos e 10 links.

Os relatórios de navegador estão em `backend/test-results/results.json` e as imagens de validação no mesmo diretório, excluído do versionamento. A execução local está em **http://127.0.0.1:3100**.

## Limites e dependências restantes

- **Conteúdo das aulas:** o catálogo original tem 25 aulas sem arquivo/URL. É necessário publicar os materiais efetivos pelo painel. Os testes de curso usam PDFs reais do acervo em um ambiente separado; não simulam conclusão nas contas reais.
- **Publicação remota:** stack definitiva `maternar` ativa e saudável na UFN (ID 254). A configuração do domínio/HTTPS ainda depende do acesso ao Nginx Proxy Manager, conforme o diagnóstico mais recente abaixo.
- **Docker:** não está instalado neste computador. A imagem foi construída e testada no Docker da UFN por uma stack temporária.
- **E-mail:** recuperação de senha é atendida pela coordenação a partir da solicitação registrada; não há SMTP configurado.
- **Recursos externos:** os arquivos locais foram verificados. Disponibilidade, conteúdo e permissões de links de terceiros não foram auditados nesta sessão.

Não tratar estes testes locais como prova de implantação remota ou de publicação dos materiais de aula que ainda não foram fornecidos.

## Preparação do Portainer — 29/09/2026

Base: `Docker.eml` e `MANUAL PORTAINER.pdf`, fornecidos pelo usuário. Domínio escolhido explicitamente: **maternarsantamariense.app.ufn.edu.br**.

- Portainer `https://app.ufn.edu.br`, versão **2.45.1**, autenticação validada. Environment **dockerapps**, ID **5**, IP interno **10.21.19.45**, Docker **28.3.3**, Linux **amd64**, Swarm inativo.
- A porta 3000 já é usada por outro projeto. Bind de **10.21.19.45:8035** verificado na stack temporária; a porta foi liberada ao final e deve ser usada na implantação definitiva.
- Imagem **maternar:20260929-portainer1** construída no próprio destino. ID: `sha256:2360960a1a818c8e191530ce893a5102d2de3a01a49eddc95c35ca0183434c4d`. Tamanho informado pelo Docker: 494.555.487 bytes.
- Contexto de build com 160 arquivos, 223.258.368 bytes compactados. Comparação byte a byte com as fontes atuais e conferência de exclusão de banco, `.env`, credenciais, dependências locais e relatórios de teste.
- Stack entregue com imagem local (`pull_policy: never`), volume externo, usuário **10001:10001**, filesystem somente leitura, `/tmp` temporário, capabilities removidas, limites de CPU/memória, rotação de logs e healthcheck. O perfil da UFN bloqueia `security_opt`; esse campo foi retirado e a configuração final foi testada.
- O próprio YAML foi implantado e removido como **stack temporária com dados sintéticos**: rotas públicas e internas protegidas, **86 arquivos do acervo**, login de dois perfis, bloqueio de gestão para profissional, alteração de perfil, upload e criação de curso passaram. Reinício preservou perfil, curso e upload. Healthcheck Docker: **healthy**.
- Restauração remota validada primeiro com banco sintético; a cópia real foi executada somente após autorização explícita do usuário para os seis cadastros, CPFs e hashes de senha.
- Volume persistente real **maternar-dados** restaurado: **6 usuários**, **5 Profissional + 1 Administrador**, `integrity_check=ok`, proprietário **UID 10001**, banco com modo **0600**. Controle de acesso **restrito no Portainer**, confirmado antes de enviar o backup. Nenhum dado real foi incluído na imagem.
- Auxiliares de restauração, stack de teste e volumes sintéticos removidos. A stack definitiva Maternar ainda não está implantada; o volume real e a imagem ficam prontos no servidor.
- Pacote privado final: `dist/portainer-ufn-20260929/` (contexto Docker, backup, manifesto, `stack.yml`, `stack.env` com JWT aleatório e SHA-256). Roteiro: `deploy/portainer/README.md`.
- **Pendência externa:** Nginx Proxy Manager responde em `https://proxy.app.ufn.edu.br`, mas a autenticação com a credencial fornecida retornou **401**. O domínio/proxy/certificado não foram criados. Depois de corrigir esse acesso, implantar a stack definitiva, configurar HTTPS e executar a jornada pelo domínio público.

Evidências sem credenciais: `backend/test-results/portainer-api-tests.tap`, `portainer-image-smoke.txt`, `portainer-restore-sintetico.txt`, `portainer-volume-restore.txt` e `portainer-final-state.json`.

## Cadastro adicional solicitado — 29/09/2026

- **Kalleby Evangelho Mota** cadastrado como **Administrador ativo** no banco local e no volume privado `maternar-dados` da UFN. Senha escolhida pelo titular, armazenada somente como hash bcrypt, sem troca obrigatória no primeiro acesso.
- Login local com a senha informada e acesso a `/api/auth/eu`, `/api/usuarios` e `/api/admin/estatisticas` confirmados com HTTP 200.
- Inclusão remota aditiva, com backup anterior à alteração; contas existentes preservadas. Banco remoto com `integrity_check=ok` e nenhuma violação de chave estrangeira. Auxiliar temporário removido.
- **Estado atual: 7 usuários — 5 profissionais e 2 administradores.** Backup privado, manifesto, metadados da entrega e hashes SHA-256 atualizados. A imagem e o segredo JWT de implantação foram preservados.
- Evidência do cadastro remoto sem senha/hash: `backend/test-results/cadastro-kalleby-ufn.json`. A publicação definitiva/HTTPS permanece pendente conforme a seção anterior.

## Diagnóstico do redirecionamento e ativação — 29/09/2026

Após relato de que o domínio abria o site da UFN:

- DNS de `maternarsantamariense.app.ufn.edu.br` resolve para **200.132.59.218**, o mesmo IP dos painéis institucionais.
- Requisição HTTP ao domínio recebe **301**, `Location: https://site.ufn.edu.br/`, servidor **openresty**. HTTPS falha com alerta TLS **unrecognized name**. O encaminhamento/certificado do domínio ainda não está funcional.
- A consulta inicial confirmou que existiam apenas as stacks `aproxima` e `vitapel`; a stack Maternar definitiva ainda não havia sido criada.
- Stack definitiva **maternar**, ID **254**, criada no ambiente **dockerapps (5)** usando a imagem e o volume privados preparados. Porta interna **10.21.19.45:8035**, reinício automático, controle de acesso restrito, usuário 10001 e limites do YAML validado.
- Healthcheck **healthy**. `/`, `/app`, `/painel`, `/api/saude` e arquivos JS/CSS responderam **200 sem redirecionamento**, verificados dentro do contêiner. Banco com **7 usuários, 2 administradores e 5 profissionais**, integridade válida e nenhuma violação de chave estrangeira. Arquivos internos continuam retornando 404.
- O Proxy Manager continua recusando a credencial do `Docker.eml` com **401**. Tela de login disponibilizada ao usuário e acesso atualizado solicitado. Sem esse acesso, não foi possível concluir a regra de domínio/certificado; o redirecionamento público ainda está pendente de correção.
- Evidência da stack definitiva: `backend/test-results/portainer-production.json`. A aplicação interna saudável não comprova o domínio público: validar navegador, login e arquivos pelo HTTPS depois da configuração do proxy.

Login administrativo na aplicação remota também confirmado (HTTP 200 em autenticação, perfil, equipe e estatísticas). Evidência: `backend/test-results/portainer-production-login.json`. O acesso direto ao IP privado a partir deste computador expirou; a validação da aplicação foi executada no contêiner da UFN. A tela web do Proxy Manager também apresentou “Invalid email or password”.

## Auditoria detalhada e atualização final — 29/09/2026

- **75/75 testes de API passaram.** Foram ampliadas as regressões de permissões,
  sessões, tipos e URLs, perfil, progresso/XP, certificados, trilhas, uploads,
  logs, catálogo e proteção dos recursos de gestão.
- **31/31 jornadas completas passaram em Chromium e em WebKit.** Depois da inclusão
  do ToolNurse, repetidos os cenários afetados nos dois motores. O cenário novo
  passou após ajustar um seletor do teste ao ícone do botão de download. Total:
  **32 cenários distintos** de navegador; ver relatório para as execuções separadas.
- Corrigidos aprovação indevida de Administrador por Gestor, sessão antiga válida
  após reativação, leitura de tarefas por Profissional, entradas inválidas, XP de
  progresso invalidado, vínculos de trilhas/arquivos e problemas de carregamento e
  navegação concorrente no painel. Regressões correspondentes verificadas.
- Dependências compatíveis atualizadas; `npm audit` final com **0 vulnerabilidades
  conhecidas reportadas**.
- A pedido do usuário, preservados os seis produtos anteriores e acrescentado
  **ToolNurse — UFN** em Produtos, Links úteis e busca. Catálogo atual: **7 produtos,
  11 links**. Atualizados COREN, TelessaúdeRS e atalhos internos. Migração única
  preserva edições/exclusões posteriores.
- Conferência do acervo: **84 arquivos distintos + 2 links internos**, e não 86
  arquivos distintos como registrado nas etapas iniciais. Dos **45 endereços
  externos**, 44 acessíveis; `pediatraluisapinheiro.com.br` retorna 500. Disponibilidade
  não comprova que portais/coleções/buscas correspondam aos materiais específicos
  anunciados nos seis produtos. Pendências editoriais detalhadas na auditoria.
- Imagem **maternar:20260929-final3**, ID
  `sha256:38cecb38076e0fdcd7e54e7743b14778e88daf0ad83340430a2f5c3cefce8548`,
  construída no Docker da UFN e validada com dados sintéticos na porta 8036.
  Login de três papéis, APIs, arquivos, upload, certificado, mensagens e persistência
  após reinício passaram. Stack e volume temporários removidos.
- **Stack real `maternar` (254) atualizada com sucesso**, saudável em
  `10.21.19.45:8035`. Volume e variáveis vigentes preservados. Os campos dos sete
  usuários e hashes de senha foram comparados antes/depois e permaneceram idênticos.
  Banco íntegro, sem violações de chave estrangeira. APIs administrativas, rotas
  públicas e proteção de arquivos internos verificadas dentro do ambiente Docker.
- Backup remoto antes da atualização:
  `/app/backend/data/backups/pre-final3-1790701228491.db` (privado).
  Imagem anterior `maternar:20260929-portainer1` preservada para retorno.
  Pacote atual: `dist/portainer-ufn-20260929-final3/`; `stack.env` sincronizado com
  produção e privado (0600), diretório 0700. Checksums conferidos. Não restaurar
  novamente o banco para aplicar essa atualização.
- Migração também validada sobre cópia do banco real local, posteriormente removida.
  Prévia local reiniciada em **http://127.0.0.1:3100**, com os sete usuários e o catálogo
  atual. Backup local: `backend/data/backups/pre-auditoria-final-20260929.db`.
- **Pendências:** Nginx/HTTPS (HTTP ainda redireciona ao site da UFN), materiais das
  25 aulas, site pediátrico externo e confirmação editorial dos destinos específicos
  dos produtos. Recuperação de senha continua manual pela coordenação, sem SMTP.

Relatório completo: [AUDITORIA-E2E-2026-09-29.md](AUDITORIA-E2E-2026-09-29.md).
Evidências finais: `backend/test-results/audit-api-final.tap`,
`audit-chromium.json`, `audit-webkit.json`, `audit-catalogo-webkit.json`,
`audit-toolnurse-chromium.json`, `audit-links-final.json`,
`audit-dependencies-final.json`, `audit-portainer-final-validation.txt`,
`audit-upgrade-real-copy.json`, `audit-production-final.json`, `audit-cleanup.json`.

## Operação sem demonstrações e cursos cadastrados pelo painel — 29/09/2026

Orientação posterior do usuário: nenhum conteúdo simulado na aplicação; zerar
os cursos demonstrativos e permitir o cadastro real pelo painel, com certificados.

- Removidos **6 cursos e 25 aulas demonstrativas** das bases local e institucional,
  com backup anterior. Estado operacional: **0 cursos, 0 aulas e 0 certificados**.
  Nenhum curso vazio foi preenchido com material aleatório para aparentar completude.
- O seed de produção não cria contas, cursos, aulas, eventos, mensagens, tarefas
  ou conquistas demonstrativas. Fixtures de teste foram movidas para
  `backend/tests/fixtures` e não integram o contexto/imagem Docker. Tentativa de
  ativar demonstração no seed operacional é recusada.
- Cadastro pelo painel: título, área e carga horária obrigatórios; curso nasce
  rascunho; aulas recebem upload, arquivo da biblioteca ou URL. A publicação é
  explícita e exige todas as aulas com conteúdo. Arquivo local inexistente bloqueia
  publicação. Rascunhos não aparecem na área profissional, acesso direto ou busca.
- Alterações de aulas retornam o curso a rascunho. Conclusão e emissão de certificado
  exigem publicação e conteúdo; progresso e participantes são calculados no banco.
  O certificado preserva nome, título e carga horária da emissão, tem código
  verificável e não é duplicado por nova solicitação.
- Removidas contagens fixas de participantes, pessoa fictícia marcada como online,
  durações não comprovadas do Qualifica, alegações de aprovação/atualização sem
  registro e descrições inventadas dos produtos. Os seis destinos anteriores e o
  ToolNurse foram mantidos, com títulos e tipos correspondentes aos recursos reais.
  Anos de publicação desconhecidos não aparecem como se fossem confirmados.
- **79 testes de API passaram; 32 jornadas passaram em Chromium e 32 em WebKit.**
  A jornada pela interface inclui cadastro, upload, publicação, conclusão e
  certificado. Uma checagem adicional gerou o PDF real de certificado pelo navegador:
  uma página; nome e código confirmados por leitura independente do PDF.
- A migração foi testada duas vezes sobre uma cópia do banco real: idempotente,
  sete usuários e hashes preservados, zero violações de chave estrangeira. Cópia
  temporária removida. Backup local: `backend/data/backups/pre-operacional-20260929.db`.
- Imagem **maternar:20260929-operacional1**, ID
  `sha256:ebb326928b121e9c3f7f611775707bea88cc7c2b9dd753419d3ca826fc9b73b0`,
  validada no Docker da UFN em stack separada. Cadastro, publicação, certificado e
  persistência após reinício passaram. Recursos temporários removidos.
- Stack real **maternar (254)** atualizada e saudável. Sete usuários e todos os
  seus campos/hashes preservados; variáveis de produção preservadas. Acervo,
  157 pesquisas, 7 produtos e 11 links mantidos. API confirma catálogo de cursos
  vazio. Backup remoto: `/app/backend/data/backups/pre-operacional1-1790702873773.db`.
  Imagem anterior: `maternar:20260929-final3`.
- Pacote: `dist/portainer-ufn-20260929-operacional1/`, com contexto, stack, metadados,
  checksums e **modelo de variáveis sem segredos**. A revisão automática bloqueou
  exportar variáveis sigilosas do Portainer para novo arquivo local; foi adotada a
  alternativa sem exportação. A configuração permanece na stack, já preservada
  durante a atualização. Esse bloqueio não impediu a publicação da imagem.
- Permanecem externas à aplicação: encaminhamento Nginx/HTTPS e erro 500 no site
  pediátrico. Os antigos cursos não são mais uma pendência de conteúdo, pois foram
  retirados conforme solicitado. Recuperação de senha mantém atendimento manual
  pela coordenação; não promete envio automático de e-mail.

Guia: [GUIA-CURSOS-CERTIFICADOS.md](GUIA-CURSOS-CERTIFICADOS.md).
Evidências atuais em `backend/test-results/`: `operacional-api-final.tap`,
`operacional-chromium.json`, `operacional-webkit.json`, `operacional-pdf.txt`,
`operacional-migracao.json`, `operacional-portainer.txt`,
`operacional-production.json` e `operacional-cleanup.json`.


## Revisão de UX/UI, chat e QA — 29/09/2026

- Referência de Luisa Pinheiro removida do seed, banco local e banco da UFN.
  Qualifica permanece com 9 módulos e 25 recursos; ToolNurse preservado.
- Chat passou a consultar novas mensagens automaticamente, preservar rascunhos
  por canal, recuperar conexão, paginar histórico e impedir duplicação em reenvios.
  Autoria vem da sessão e horário usa America/Sao_Paulo.
- Corrigidas falhas silenciosas na biblioteca/opções dos formulários. Salvamento
  bloqueado durante upload, perfil com identidade atualizada e senha confirmada.
- Layouts de todas as 15 seções profissionais e 22 administrativas verificados
  em 320, 390, 768 e 1440 pixels. Corrigidos estouros, tabelas, menu móvel, modais,
  campos de arquivo, contraste e navegação por teclado.
- 83 testes de API aprovados; 44 cenários de navegador aprovados em cada motor.
  Chromium: 42 na rodada completa, 1 jornada longa reexecutada com sucesso após
  ajustar seu limite total e 1 teste móvel adicional. WebKit: 43 na rodada
  completa e 1 teste móvel adicional. Nenhum cenário ignorado.
- Imagem `maternar:20260929-uxqa1`, ID `sha256:9b72ea8263c287688d99c46e3cc0b5efaf5f3800e1e86589b00bddfc9e618a47`,
  validada no Docker da UFN com volume separado e reinício. Recursos temporários
  de teste removidos. Pacote sem segredos em `dist/portainer-ufn-20260929-uxqa1/`.
- Stack `maternar` (254) atualizada e healthy. Sete usuários, hashes, perfis e
  variáveis preservados. Integridade SQLite ok; zero violações de FK. Sem cursos,
  aulas, mensagens ou certificados fictícios na base operacional.
- Backup anterior: `/app/backend/data/backups/pre-uxqa1-1790704614445.db`.
  Retorno disponível para `maternar:20260929-operacional1`. Servidor local atualizado
  na porta 3100. API e arquivos JS implantados conferidos após a atualização.
- Domínio ainda redireciona HTTP para o site da UFN e falha no TLS por nome não
  reconhecido. Nginx/HTTPS continua pendente da TI. Recuperação de senha permanece
  manual pela coordenação; SMTP não configurado.

Detalhes e evidências: [REVISAO-UX-QA-2026-09-29.md](REVISAO-UX-QA-2026-09-29.md).

## HTTPS e e-mail institucional — 29/09/2026

Nginx host 25 e certificado 42 configurados para o domínio do Maternar. HTTP aponta
para o próprio HTTPS; login real e PDF íntegro verificados. Stack atualizada para
`maternar:20260929-email1`, com backup privado e sete cadastros preservados. SMTP
autenticado no contêiner da UFN. Uma mensagem de acesso foi enviada pelo painel
para o destinatário explicitamente autorizado e confirmada na caixa de entrada
do Gmail, com SPF/DKIM/DMARC aprovados. Demais membros não receberam disparo.

91 testes de API e 47 jornadas completas em cada navegador passaram. Teste inicial
de reabertura de link na mesma aba detectou um problema, corrigido antes do pacote
final. Detalhes em [PUBLICACAO-EMAIL-2026-09-29.md](PUBLICACAO-EMAIL-2026-09-29.md).

## Links úteis e sidebar — 29/09/2026

Acesso direto, busca e navegação de Links úteis verificados com os 11 registros
reais. Sidebar padronizada com 22 ícones Lucide locais, foco/seleção acessíveis,
rolagem própria e correção da altura no celular quando a busca retorna poucas
linhas. Nova imagem `maternar:20260929-sidebar2` saudável na UFN; banco, sete
usuários e variáveis preservados. Arquivos publicados conferidos por SHA-256
e validação visual no domínio HTTPS.

API: 91 aprovados. Chromium: 53/54 na execução ampla; o cenário restante teve
uma espera incorreta no teste de certificado, corrigida e aprovada na repetição.
WebKit: 12/12 nos cenários selecionados, incluindo todos os percursos de layout.
Após o último ajuste de altura, os sete cenários focalizados passaram novamente
nos dois motores. Detalhes e evidências em
[REVISAO-LINKS-SIDEBAR-2026-09-29.md](REVISAO-LINKS-SIDEBAR-2026-09-29.md).
