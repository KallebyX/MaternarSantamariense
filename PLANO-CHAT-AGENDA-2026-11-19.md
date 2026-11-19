# Comunicação e agenda: diagnóstico e próximos passos

Análise do código em `main`, commit `7b7aa3e29a0d6b2f48cb4ca353d7076636059463`, em 19/11/2026. Este documento descreve o repositório; não atesta o estado da implantação institucional.

## O que já existe

| Frente | Implementação observada | Fontes |
| --- | --- | --- |
| Plataforma ativa | HTML/CSS/JavaScript servido pela API Express. Os arquivos do protótipo são referências, não a aplicação publicada pelo backend. | [README](README.md), [servidor](backend/src/app.js) |
| Comunicação | Canais compartilhados, histórico paginado, atualização automática, rascunhos na aba e identificador de envio para evitar duplicação. | [chat.js](chat.js), [rotas de aprendizagem](backend/src/routes/aprendizagem.js), [testes de comunicação](backend/tests/comunicacao.test.js), [jornadas do chat](backend/e2e/ux-ui.spec.js) |
| Equipe | Busca administrativa por nome, e-mail, unidade ou cargo, restrita a Gestor/Administrador. Formação e cargo são textos livres. | [rotas de usuários](backend/src/routes/usuarios.js), [perfil e autenticação](backend/src/auth/middleware.js), [schema](backend/src/db/schema.sql) |
| Agenda | Lista de eventos, busca por título/local e exportação individual ICS com horário de São Paulo. O GET ordena corretamente por ano, mês, dia e hora. | [agenda em app.js](app.js), [rotas de conteúdo](backend/src/routes/conteudo.js) |
| Gestão dos eventos | Criação/edição por Gestor/Administrador. Há data, horário, título, local, cor livre e criador; não há campo específico de origem institucional. | [painel](painel.js), [recursos](backend/src/routes/recursos.js), [schema](backend/src/db/schema.sql), [colunas adicionais](backend/src/db/connection.js) |

## Correção independente dos novos requisitos

A criação de eventos aplicava os valores padrão também a mês/ano explicitamente inválidos. Por exemplo, `mes: 0` era gravado como agosto e `ano: 0` virava o ano atual. Valores nulos, booleanos, vazios e arrays também podiam ser aceitos pela combinação de fallback e coerção.

A alteração valida os campos opcionais quando presentes e usa os padrões existentes somente quando o campo foi omitido. Valores inválidos retornam HTTP 400 sem criar evento. Strings numéricas enviadas pelo formulário continuam aceitas. O teste de regressão está em [integracao.test.js](backend/tests/integracao.test.js).

## Backlog de comunicação

### 1. Localizar profissionais por nome e área

**Lacuna confirmada:** o chat não apresenta diretório ou pesquisa de pessoas. A consulta administrativa de usuários não é um diretório profissional: além de ter outra permissão, sua resposta inclui dados cadastrais que não devem ser expostos por simples reutilização.

**Decisões necessárias:** confirmar as áreas e sua manutenção; decidir como classificar os textos livres de cargo/formação existentes; definir quais pessoas e campos ficam visíveis aos colegas. As categorias sugeridas precisam de uma correspondência explícita com os cadastros, sem inferir profissão por nome ou unidade.

**Aceites propostos:** busca por nome combinada com filtro de área; estado vazio legível; navegação por teclado; resultado limitado aos campos aprovados; teste de acesso como profissional, gestor, usuário desativado e visitante. A busca administrativa atual mantém suas permissões.

**Pontos de implementação:** `chat.js`, `app.js`, `app.css`, `backend/src/routes/usuarios.js` e os testes de comunicação. A forma de armazenar a classificação será definida após a decisão sobre áreas.

### 2. Definir o que acontece ao selecionar um profissional

**Lacuna confirmada:** as mensagens atuais pertencem a canais compartilhados; não existe destinatário individual nem controle de participantes por conversa.

**Decisão necessária:** selecionar uma pessoa deve abrir uma conversa individual, indicar um canal de sua área ou apenas mostrar informações de contato aprovadas? Esse comportamento precisa ser definido antes de trocar a navegação por canais.

**Aceites após essa definição:** o destino da ação fica explícito; a interface identifica com quem a mensagem será compartilhada; rascunhos, paginação e reenvio continuam funcionando. Se forem escolhidas conversas privadas, os testes devem impedir leitura e envio por não participantes, inclusive acessando a API diretamente. Uma mudança de modelo deve ter desenho e revisão próprios.

## Backlog da agenda coletiva

### 3. Exibir calendário e identificar a origem dos eventos

**Lacuna confirmada:** a agenda ativa é uma lista de cartões. O campo `cor` existe, mas a listagem profissional não o utiliza. Não há origem NEPeS/Maternar/profissionais; `criado_por` identifica uma conta, não a instituição responsável.

**Decisões necessárias:** confirmar a relação entre origem, responsáveis e cores; definir como classificar eventos existentes. A origem não deve ser deduzida a partir da cor livre, do nome do criador ou do título do evento.

**Aceites propostos:** calendário com base cinza e navegação entre meses/anos; cores distintas acompanhadas de rótulos e legenda; seleção de dia com os eventos correspondentes; busca existente preservada; alternativa de lista legível no celular; exportação ICS preservada. Validar mês vazio, fevereiro bissexto, virada do ano, vários eventos no mesmo dia e navegação por teclado.

**Pontos de implementação:** `app.js`, `app.css`, `painel.js`, `backend/src/routes/conteudo.js`, `backend/src/routes/recursos.js` e testes de agenda/E2E. A classificação de origem e qualquer mudança persistente devem ser revisadas separadamente; esta correção não acrescenta colunas.

### 4. Definir participação dos profissionais na agenda

**Lacuna confirmada:** o profissional consulta eventos, mas não pode criar, editar ou excluir eventos pela API atual.

**Decisões necessárias:** confirmar se profissionais poderão reservar datas; quem aprova, altera e cancela essas reservas; se a agenda é de toda a rede ou segmentada por equipe/unidade. O pedido de agenda coletiva não determina essas regras por si só.

**Aceites após aprovação das regras:** permissões aplicadas no servidor; autoria e alterações rastreáveis; teste de tentativa de alterar evento de outra pessoa; conflito de horário tratado conforme a regra escolhida; dados antigos preservados. Não liberar a escrita apenas exibindo um botão no frontend ou removendo a restrição administrativa existente.

## Limites desta entrega

A correção de validação não cria diretório, mensagens privadas, calendário em grade, categorias de origem ou novas permissões. Não há migração ou alteração de dados existentes. O backlog registra o trabalho restante e seus pontos de decisão, sem presumir aprovação ou data de publicação.
