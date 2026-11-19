# Agenda mensal — consulta dos eventos

Implementação em 19/11/2026 sobre `main` (`7b7aa3e29a0d6b2f48cb4ca353d7076636059463`).

## Comportamento

- A agenda abre em **Lista completa**, preservando os links e a busca existentes em todos os meses.
- **Calendário** apresenta o mês atual de São Paulo em uma grade cinza, com semanas iniciadas na segunda-feira. Os indicadores contam as atividades que correspondem à busca.
- É possível avançar/voltar entre meses e anos, escolher o período, ir para hoje e selecionar um dia. Os detalhes mantêm a ordem recebida da API e os horários cadastrados.
- Busca, período e visualização ficam no hash da página e sobrevivem à recarga. Alterar a busca ou o mês limpa a seleção anterior de dia.
- O botão **Adicionar ao calendário** usa a exportação ICS já existente. A lista completa permite consultar resultados fora do mês selecionado.
- O novo módulo `agenda.js` está na lista explícita de arquivos públicos do Express e no `COPY` do Docker.

## Validação realizada

```sh
NODE_ENV=test node --test backend/tests/agenda-visualizacao.test.js
NODE_ENV=test node --test --test-name-pattern='agenda|arquivos internos' backend/tests/integracao.test.js
node --check agenda.js
node --check app.js
node --check backend/src/app.js
git diff --check
```

**13 testes novos e 2 testes existentes passaram.** Os testes cobrem virada do ano em São Paulo, fevereiro bissexto, mês começando no domingo, limites de ano, entrada inválida no endereço, mês vazio, eventos em meses/anos diferentes, seleção do dia, busca por título/local, preservação de horários e ordem, escape de conteúdo e publicação do módulo sem expor diretórios internos.

Não há etapa de bundle neste frontend. O Docker não está disponível no executor utilizado; a imagem não foi construída. A suíte completa e a validação visual em navegador não foram executadas nesta etapa.

## Roteiro de homologação visual

1. Como profissional, abrir **Agenda** e conferir a lista completa e o botão de exportação ICS.
2. Abrir **Calendário**, navegar de dezembro para janeiro e usar o seletor de mês/ano.
3. Conferir fevereiro de 2028, um mês vazio e um dia com várias atividades em horários diferentes.
4. Selecionar um dia, aplicar uma busca e verificar que a seleção do dia é limpa. O mês e a busca devem permanecer ao navegar entre os meses e após recarregar.
5. Voltar à lista completa e verificar que ela inclui também os eventos de outros meses que correspondem à busca.
6. Navegar pelos controles com teclado e conferir o layout em 320 px, 390 px e desktop. Os links dos dias possuem nomes completos com data e contagem; as colunas têm cabeçalhos de dia da semana.
7. Exportar um evento em cada visualização e conferir data, horário de São Paulo, título e local no arquivo ICS.

## Limites e publicação

Esta entrega não cria ou altera eventos, não muda permissões, não acrescenta tabelas e não presume a origem institucional de um evento. As cores livres existentes não identificam NEPeS, Maternar ou profissionais; essa classificação continua dependendo de definição explícita.

O diretório de profissionais e o comportamento de contato do chat continuam em trabalho separado. Esta mudança é independente do PR #13, que trata da validação de mês/ano na criação de eventos.

Nenhum merge, deploy ou alteração de dados de produção foi realizado. O runbook institucional permanece em `deploy/portainer/README.md`; a publicação depende da homologação da interface e da imagem correspondente.
