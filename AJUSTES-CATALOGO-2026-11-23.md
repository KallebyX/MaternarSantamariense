# Catálogo e PDFs — ajustes de 23/11/2026

Qualifica Profissional passa a reunir oportunidades de formação. O Curso
Introdutório Online da Secretaria Municipal de Saúde de Santa Maria foi mantido.
Ferramentas, publicações e materiais de referência que estavam nos módulos
anteriores foram transferidos para Produtos e ferramentas. As trilhas iniciais
que ficaram sem módulos foram retiradas; capacitações cadastradas pela gestão
continuam preservadas.

O catálogo ampliado reaproveita recursos já existentes, incluindo Tecnologias
em Saúde — Puerpério, Portfólio de Cuidados no Puerpério, publicações UFN,
Fortalece e SOS Kids. Não foi inventada atribuição de autoria ao PPG nem uma
lista de novos eventos ou cursos. A coordenação pode cadastrar novas ofertas
e novos produtos pelo painel.

A busca genérica do YouTube foi substituída pela página oficial do
[Programa Brasileiro de Reanimação Neonatal da SBP](https://www.sbp.com.br/especiais/reanimacao-/),
verificada em 23/11/2026. A página contém diretrizes, cursos e vídeos específicos;
o cartão agora identifica esse destino como portal, sem prometer um vídeo único.

## PDFs publicados

Os oito DOCX originais foram preservados ao lado dos PDFs:

| Material | Páginas |
| --- | ---: |
| Ficha de compartilhamento de informação — violência contra crianças e adolescentes | 2 |
| Guia para encontrar laudos EVOYA | 7 |
| Protocolo CEO de Cirurgia Oral | 3 |
| Protocolo CEO de Endodontia | 3 |
| Protocolo CEO de Odontopediatria | 2 |
| Protocolo CEO de Periodontia | 3 |
| Protocolo CEO de Pacientes com Necessidades Especiais | 4 |
| PICS — material do curso introdutório | 6 |

A ficha foi disponibilizada como PDF comum, alternativa aceita no documento de
solicitações. Ela não é anunciada como formulário preenchível. A ficha já
existente em Saúde da Criança é outro arquivo e não foi substituída.

A conversão usa o mecanismo de impressão do LibreOffice, preservando o conteúdo
dos originais. Foram conferidos texto extraído e visualização das primeiras
páginas. O script reproduzível é `backend/scripts/gerar-pdfs-catalogo.py`:

```sh
SOFFICE=/caminho/para/soffice python backend/scripts/gerar-pdfs-catalogo.py
```

Requer LibreOffice e o pacote Python pypdf. Não é necessário instalar esses
programas no servidor: os PDFs finais já fazem parte do acervo versionado.

## Migração e preservação

`ajustarCatalogo(db)` deve executar ao final dos dois caminhos de `seed()`,
depois das importações e migrações anteriores. A chave
`ajustes-catalogo-20261123` em `app_meta` impede repetição. Antes de modificar
ou remover linhas existentes, a migração guarda seus valores nessa mesma
entrada de metadados. A migração é transacional.

Somente recursos originais reconhecidos por módulo, título, tipo, fonte e URL
são transferidos. Recursos editados e cadastrados pela gestão permanecem. Os
produtos são deduplicados por URL normalizada. URLs dos oito DOCX são
atualizadas em materiais, documentos, protocolos e recursos que ainda apontam
para os originais; o tamanho dos documentos é atualizado. Edições e exclusões
posteriores não são desfeitas em reinícios.

Validação: `NODE_ENV=test node --test tests/ajustes-catalogo.test.js
tests/catalogo.test.js tests/integracao.test.js`, na pasta backend. A verificação
de PDF confere também que os originais DOCX continuam presentes.
