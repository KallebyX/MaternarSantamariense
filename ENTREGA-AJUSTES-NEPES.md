# Entrega dos ajustes solicitados pelo NEPeS — novembro de 2026

Base: e-mail de Leandro de Medeiros de 11/11/2026, encaminhado em 23/11, e anexo “Alterações Maternar.docx”. Implementação sobre o commit `7b7aa3e` da main. Publicada em 23/11/2026 no domínio institucional após integração do PR #15, testes e conferência em cópia isolada do volume.

## Funcionalidades

- Chat com diretório por nome e área, fotos de perfil e conversas individuais restritas aos dois participantes. Canais coletivos continuam disponíveis. Histórico paginado, atualização automática e proteção contra duplicação de reenvio foram preservados.
- Área profissional e foto editáveis no perfil; imagem JPG/PNG/WebP de até 2 MB, com validação de formato e dimensões. Diretório não publica CPF, e-mail, telefone ou permissões.
- Agenda mensal cinza com legenda e cores para NEPeS, Maternar e Profissionais, filtros, criação/edição/exclusão, término opcional e exportação ICS.
- Atividades para rede ou equipe. O vínculo de equipe é atribuído pela gestão; a unidade autoeditável do perfil não concede acesso. Profissionais gerenciam suas atividades; a gestão pode publicar em nome das origens institucionais.
- Avisos com publicação delegada por órgão: NEPeS, Políticas de Saúde e Superintendência da APS. O responsável administra seus próprios avisos, sem receber gestão geral. Administrador concede/revoga no painel. Avisos individuais continuam restritos e alterações voltam a aparecer como novas.
- Instituição e curso/programa separados no cadastro, nos cartões e nos filtros dependentes da plataforma e do painel. O filtro visual de situação na fonte foi retirado; os dados históricos foram preservados.
- Qualifica concentra oportunidades de formação. Ferramentas, publicações e referências foram reorganizadas em Produtos e ferramentas: 24 produtos no catálogo inicial atualizado, incluindo recursos UFN já existentes. Conteúdos cadastrados/editados pela gestão são preservados.
- Oito PDFs publicados, com 30 páginas, mantendo os DOCX originais. Ficha de compartilhamento entregue como PDF comum, alternativa aceita no documento.
- Reanimação neonatal aponta ao portal oficial específico da SBP, que reúne orientações e materiais do programa, em vez da busca genérica do YouTube.
- Guia para responsáveis: [GUIA-NEPES.md](GUIA-NEPES.md). Detalhes do conteúdo, PDFs e geração: [AJUSTES-CATALOGO-2026-11-23.md](AJUSTES-CATALOGO-2026-11-23.md).

## Dados e migrações

As migrações são aditivas e transacionais. O catálogo reorganizado guarda cópia das linhas alteradas em app_meta e utiliza uma chave de execução única. O importador Drive reconhece os PDFs derivados sem duplicar o original identificado pelo inventário/ID de origem. Repetir a inicialização não recria exclusões nem desfaz edições posteriores da gestão.

No seed real do repositório, os 704 projetos foram preservados. Foram reconhecidas 13 instituições; 19 vínculos ambíguos/desconhecidos ficaram sinalizados para revisão. O texto original fica em instituicao_origem. Não houve atribuição por suposição nos casos ambíguos.

As novas contas ou contas atualizadas começam sem acesso delegado a avisos e sem equipe privada atribuída. O administrador/gestão deve configurar esses vínculos para os responsáveis reais. Não foram criadas contas operacionais nem alteradas senhas institucionais.

## Publicação institucional

1. Fazer backup do banco e dos uploads em volume privado. Para preservar também as fotos e conversas, o backup SQLite completo é a cópia de restauração; a exportação JSON administrativa é auxiliar.
2. Construir a imagem com `docker build -f backend/Dockerfile -t maternar:ajustes-nepes .`. Os novos módulos, estilos, migrações e PDFs estão incluídos.
3. Validar primeiro em cópia do volume. Conferir usuários, contagem dos projetos, materiais e o estado de revisão dos vínculos ambíguos.
4. Atualizar a stack institucional mantendo o volume existente, JWT_SECRET e configuração SMTP. A inicialização executa seed e migrações; a aplicação não deve ser iniciada com fixtures de testes.
5. Conferir no domínio institucional login, colega/chat, agenda, aviso, abertura dos PDFs e filtros instituição/curso. Atribuir equipe e delegação aos responsáveis no painel.
6. Em rollback, parar a versão nova e restaurar uma cópia do backup em volume separado, mantendo o volume atualizado preservado para conferência. Não sobrescrever o único volume disponível.

## Conteúdo que depende da coordenação

Não foi inventada uma lista de novos cursos, eventos ou produtos do PPGSMI que não conste das fontes. O painel já permite cadastrá-los com links oficiais. Um vídeo específico de reanimação pode substituir o portal da SBP depois da escolha/validação clínica pela coordenação. A transformação da ficha em PDF com campos preenchíveis permanece uma melhoria possível; a versão PDF comum já foi entregue.

## Validação

- API: **135/135 testes passaram** (`cd backend && npm test`). Inclui migração a partir do esquema anterior em processo separado, reinício, permissões e preservação dos dados.
- Navegador Chromium: **72 cenários exercitados** na suíte completa; 71 passaram na primeira execução. O cenário de projetos que falhou por diferença de caixa no valor do seletor foi corrigido para selecionar a opção normalizada e os três cenários do arquivo passaram na repetição. Não houve falha de API nesse caso.
- Chat: os dois cenários novos e os três cenários legados foram repetidos após o ajuste visual final; **5/5 passaram**, incluindo foto vista por outra sessão, reconexão/reenvio, histórico e celular.
- Layouts: todas as seções conferidas pela suíte em 320, 390 e 1440 pixels, com imagens de chat e agenda inspecionadas.
- Docker: imagem construída e executada como UID 10001; assets, PDF, API, 704 projetos e 24 produtos conferidos; evento e contas permaneceram após reinício. A imagem recebeu ajuste de permissões de leitura, necessário para arquivos copiados com modo restrito neste ambiente.
- A construção neste ambiente usa o proxy e certificado local como segredo temporário do build; não foram incluídos certificado, proxy ou credenciais no repositório/imagem final.
- WebKit não foi executado: faltam bibliotecas de sistema no ambiente, sem permissão de instalação. A validação móvel reportada acima usa Chromium.
- `git diff --check` sem erros.

Os testes automatizados usam bancos isolados. A validação de atualização usou uma cópia privada do volume real, sem portas publicadas nem envio de e-mail. A conferência final em produção foi somente leitura.

## Publicação aplicada em 23/11/2026

- PR #15 integrado à main (merge `7fac8f1`); imagem institucional `maternar:20261123-nepes-be1ec97`, incluindo as correções da revisão para fotos por referência autenticada e descarte de respostas antigas da agenda.
- Teste adicional garante que o pacote Portainer inclui todos os módulos e estilos novos. O verificador remoto foi atualizado para permitir atividades próprias de profissionais.
- Fotos não são repetidas em base64 no histórico; páginas de 50 e 200 mensagens com fotos de 2 MB ficaram abaixo de 100 KB nos testes. Carregamento autenticado, cache por autor e liberação dos blobs foram conferidos no navegador.
- Os nove cenários finais de navegador passaram após as correções. A regressão da agenda inverte a ordem das respostas e verifica exportação e remoção do evento exibido.
- Stack 254 atualizada mantendo o volume `maternar-dados` e todas as variáveis, incluindo JWT e SMTP; somente a imagem foi substituída.
- Snapshot consistente com escritas pausadas e cópia de uploads guardados privadamente; volume de retorno com o estado anterior preservado. A stack de validação e seu volume temporário foram removidos.
- As 25 contas existentes no snapshot final conservaram os mesmos identificadores, e-mails, hashes de senha, perfis e situações. Permaneceram 704 projetos, 3 mensagens de canais, 1 arquivo enviado e 25 produtos, incluindo conteúdo próprio da gestão. Integridade SQLite `ok`, sem violações de chaves estrangeiras.
- HTTPS e healthcheck saudáveis. Os hashes dos sete módulos/estilos novos servidos pelo domínio correspondem ao código publicado; oito PDFs abrem corretamente. Endpoints privados exigem autenticação e arquivos internos continuam bloqueados.
- Oito seções autenticadas conferidas no navegador no domínio público; agenda e chat em 390 pixels sem overflow ou erros JavaScript. Não foram enviadas mensagens nem criados eventos de teste em produção.
