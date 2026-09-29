# Perfil e persistência — 29/09/2026

O diagnóstico separou os dados do servidor UFN dos dados da instância local. A edição informada pelo usuário estava gravada no SQLite local, com registro de auditoria de atualização do perfil. Na instância UFN, os três campos correspondentes ainda estavam vazios e não havia registro dessa edição. São bancos independentes: atualizar o perfil em `127.0.0.1` não atualiza automaticamente o servidor publicado.

Nenhum perfil real foi alterado durante os testes desta revisão. A preservação dos três campos editados ao publicar deve ser feita de forma direcionada, somente se o destino ainda estiver vazio, sem substituir o banco do servidor.

## Falhas reproduzidas e corrigidas

- Na plataforma profissional, salvar a formação atualizava a API e o campo de edição, mas o resumo abaixo do formulário continuava exibindo a formação anterior. O resumo e os campos agora usam a resposta confirmada pelo servidor.
- No painel, a atualização do perfil agora usa diretamente a resposta da gravação; uma segunda leitura desnecessária não pode confundir uma gravação concluída com falha de rede. Editar a própria conta em Equipe também atualiza a identidade na sidebar.
- O formulário genérico ignorava seletores e números opcionais esvaziados. Ao reabrir, o valor antigo reaparecia. Agora uma remoção explícita é enviada como texto vazio, zero ou referência nula, conforme o campo. Situação, prioridade e outros valores enumerados oferecem somente opções aceitas pela API. Mês, ano e nível numérico que exigem valor válido são obrigatórios.

## Evidências

As duas falhas de interface foram reproduzidas antes das correções no navegador: resumo de formação desatualizado e nível que reaparecia após ser removido.

O teste de API inicia dois processos independentes usando um SQLite temporário em disco. No primeiro, grava todos os campos do perfil e edita um conteúdo pela API. No segundo, reabre o banco, executa a inicialização real e confirma os valores com novo login e leitura pela API. Também verifica a remoção dos campos opcionais do perfil. Esse teste passou.

As regressões de navegador verificam gravação, confirmação visual imediata, recarga, leitura cruzada entre painel e plataforma e novo login. O caso de formulário verifica a remoção de nível e quantidade após recarregar e consulta o valor persistido na API.

Resultado após as correções: 2/2 cenários passaram no Chromium e 2/2 no WebKit, sem repetição automática. O teste de API e reinício passou em 1/1 cenário.

- Teste de processo/API: `backend/tests/persistencia.test.js`.
- Testes de navegador: `backend/e2e/persistencia.spec.js`.
- Logs locais: `backend/test-results/persistencia-api.txt`, `persistencia-before.txt`, `persistencia-limpeza-before.txt`, `persistencia-after.txt` e `persistencia-webkit.txt`.

Os testes usam exclusivamente contas e conteúdo temporários em bancos isolados. Não há alteração de contas reais, envio de e-mail ou gravação no servidor UFN nesses cenários.
