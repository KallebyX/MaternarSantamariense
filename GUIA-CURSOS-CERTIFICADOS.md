# Cadastro real de cursos e certificados

Atualizado em 29/09/2026. Os cursos e aulas de demonstração foram retirados.
Uma instalação nova começa sem cursos, aulas ou certificados. A equipe cadastrada
e o acervo permanecem preservados. Os dados usados pela suíte de testes ficam em
`backend/tests/fixtures`, fora da imagem de produção.

## Publicar um curso pelo painel

1. Entre com Administrador ou Gestor e abra **Painel de gestão → Cursos**.
2. Clique **Novo curso**. Informe título, área e **carga horária real, obrigatória**.
   Preencha nível, descrição e capa quando disponíveis. Salve com a publicação
   desmarcada. O curso ficará como **Rascunho**.
3. Abra **Aulas dos cursos → Novo aula**. Escolha o curso, informe título e ordem.
   A ordem começa em 0 e não pode repetir dentro do mesmo curso.
4. No campo de arquivo, envie o PDF, vídeo ou outro formato aceito; selecione um
   upload existente; ou informe o endereço externo do conteúdo. O salvamento fica bloqueado durante o envio. Espere a indicação
   de upload concluído e salve. Repita para todas as aulas.
5. Volte a **Cursos → Editar**. Marque **Publicar curso (todas as aulas devem ter
   conteúdo)** e salve. A API recusa publicar sem aulas, sem endereços ou com
   arquivos locais ausentes. Confirme a situação **Publicado** na tabela.
6. O curso passa a aparecer na área profissional e na busca. Abra seus materiais
   para conferir o conteúdo. Para endereço externo, disponibilidade e acesso sem
   bloqueio devem ser verificados no serviço responsável.

Um rascunho não aparece no catálogo público nem na busca e não pode ser aberto
diretamente pelo profissional. A listagem administrativa de rascunhos exige o
papel de Gestor ou Administrador no servidor.

Acrescentar, excluir ou alterar o conteúdo de uma aula retorna o curso a rascunho.
Após revisar todas as aulas, publique novamente. Alterações relevantes na aula
invalidam sua conclusão anterior e retiram o XP correspondente; a nova conclusão
não duplica pontos indevidamente.

Para retirar uma formação de circulação, desmarque **Publicar curso**. Cursos que
já emitiram certificados têm exclusão protegida para preservar o histórico.

## Concluir e emitir certificado

1. O profissional entra na plataforma, abre **Cursos** e acessa um curso publicado.
2. Abre os materiais e usa **Concluir aula** ao finalizar cada aula. Essa ação grava
   o progresso no banco. Recarregar a página ou reiniciar o servidor preserva o
   registro; clicar novamente não duplica a conclusão.
3. Depois de concluir todas as aulas, usa **Emitir certificado**.
4. Em **Certificados → Ver certificado**, confere nome, curso, horas, data e código.
   Usa **Imprimir / salvar em PDF** para abrir a impressão do navegador.
5. A autenticidade pode ser consultada pelo código na página inicial, em
   **Verificar certificado**. Cada código corresponde a um registro persistido.

O servidor recusa emissão para curso vazio, rascunho, com conteúdo local ausente
ou ainda não concluído. A emissão repetida devolve o mesmo certificado. O nome,
título e carga horária registrados na emissão são preservados mesmo após editar
o cadastro do curso ou do profissional.

Os participantes mostrados no painel são calculados pelas pessoas com progresso
registrado; não há campo para digitar um número de inscritos. As métricas de
produtos identificam aberturas e cliques em baixar feitos na plataforma, sem
prometer medir o consumo integral em sites de terceiros.

## Verificação desta entrega

- API: `backend/test-results/operacional-api-final.tap`.
- Navegador: `backend/test-results/operacional-chromium.json` e
  `backend/test-results/operacional-webkit.json`.
- Migração sobre cópia do banco real: `backend/test-results/operacional-migracao.json`.
- Imagem Docker, fluxo e persistência após reinício na UFN:
  `backend/test-results/operacional-portainer.txt`.
- Estado da stack institucional após atualizar:
  `backend/test-results/operacional-production.json`.

Esses testes exercitam a aplicação, a API, uploads e SQLite de verdade em bases
separadas. Não inserem cursos ou certificados de teste na base operacional.

A revisão posterior de UX, chat e formulários está em
[REVISAO-UX-QA-2026-09-29.md](REVISAO-UX-QA-2026-09-29.md), incluindo a validação
de publicação, certificado e persistência na imagem `maternar:20260929-uxqa1`.
