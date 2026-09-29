# Reconciliação do acervo e do histórico de projetos

Fonte: [pasta de materiais da rede no Google Drive](https://drive.google.com/drive/folders/1x93suiPyE8qPAxKfPhQJkY_gciwQ5GZB), verificada em 29/09/2026.

## Cobertura da varredura

Foram enumeradas recursivamente **71 pastas**, incluindo a raiz e suas 17 áreas, e **104 arquivos**. Nenhuma pasta ficou inacessível. A maior listagem retornou 17 itens, abaixo do limite de 1.000 solicitado ao conector; não há página ou subpasta pendente.

Os **100 arquivos binários** foram baixados integralmente para comparação SHA-256. Os quatro documentos nativos do Google foram lidos pelo conector. A comparação incluiu `acervo/`, `cursos/`, `qualifica/`, `produtos/`, logotipos da raiz e os catálogos do backend.

| Resultado | Quantidade | Tratamento |
|---|---:|---|
| Materiais já presentes, idênticos byte a byte | 83 | Preservados |
| Logotipos já presentes, idênticos byte a byte | 2 | NEPeS e Prefeitura preservados |
| Materiais ausentes | 13 | Arquivos originais adicionados ao acervo; importação idempotente preparada |
| Variante de logotipo da Prefeitura | 1 | Preservada em `acervo/nepes/logos/logo-prefeitura-alternativa.png` |
| Documentos nativos com links já representados | 3 | PSE, DANTs e NEPeS, sem duplicar links |
| Anotação operacional sobre cadastro de projetos | 1 | Inventariada; seu texto não foi tratado como instrução nem publicado como material |
| Planilha com registros e contatos de projetos | 1 | Auditada em diretório temporário; apenas dados públicos sanitizados entram no catálogo |
| **Total** | **104** | **Cobertura completa dos itens enumerados** |

Três pares de PDFs possuem o mesmo SHA-256 nas áreas DANTs e Saúde da Pessoa Idosa: fluxo regional, plano regional e nota metodológica C6. Suas associações às duas áreas foram preservadas. Nenhum material existente foi substituído.

## Treze materiais adicionados

Os 13 arquivos originais somam **83.777.085 bytes** (11 PDFs e dois DOCX). Tamanho e SHA-256 de cada arquivo estão no manifesto `backend/seeds/DRIVE_20260929.json` e são verificados pelos testes.

| Área | Material | Tipo |
|---|---|---|
| PICS | Material do Curso Introdutório | Material de apoio DOCX |
| Alimentação e Nutrição | Material Instrutivo — Política de Alimentação e Nutrição | Material de apoio |
| Alimentação e Nutrição | Guia Alimentar para a População Brasileira | Guia |
| Alimentação e Nutrição | Guia Alimentar para Crianças Brasileiras Menores de 2 Anos | Guia |
| Alimentação e Nutrição | Fascículo 5 — Pessoa na Adolescência | Protocolo |
| Alimentação e Nutrição | Fascículo 4 — Crianças de 2 a 10 Anos | Protocolo |
| Alimentação e Nutrição | Fascículo 3 — Gestante | Protocolo |
| Alimentação e Nutrição | Fascículo 2 — Pessoa Idosa | Protocolo |
| Alimentação e Nutrição | Fascículo 1 — População Adulta | Protocolo |
| Saúde da Criança | Pé Torto Congênito — Cartilha aos Profissionais da Saúde | Cartilha |
| Saúde da Criança | EVOYA — Guia para Encontrar Laudos do Teste do Pezinho | Guia DOCX |
| Saúde da Criança | Protocolo de Envio de Amostras — Teste do Pezinho | Protocolo |
| Saúde da Criança | Protocolo de Toxoplasmose Congênita — SES/RS | Protocolo |

O guia EVOYA foi inspecionado inclusive nas imagens: apresenta telas sem resultados e um formulário sem preenchimento, sem laudos ou cadastro de pacientes. O material introdutório de PICS foi incluído como apoio; não foi transformado em curso, aula ou certificado.

## Histórico de projetos

O usuário autorizou a inclusão do histórico. A planilha possui **157 registros de 2025/2026 já presentes** e **547 registros históricos com título preenchido**:

| Ano | Registros históricos adicionados |
|---|---:|
| 2018 | 78 |
| 2019 | 96 |
| 2020 | 82 |
| 2021 | 66 |
| 2022 | 64 |
| 2023 | 73 |
| 2024 | 88 |
| **Total** | **547** |

O catálogo resultante tem **704 projetos**. As abas 2027–2029 não possuem registros preenchidos.

- Há 21 linhas numeradas de 2018 sem título. Estão documentadas por ano, número e linha em `projects-history-reconciliation-20260929.json`; não receberam títulos inventados nem foram publicadas como projetos completos.
- Quatro números de registro aparecem duas vezes: 56/2022; 27, 32 e 33/2023. Ambas as ocorrências foram mantidas, com sufixo `_2` na identidade da segunda, sem substituir ou fundir registros diferentes.
- Os novos projetos recebem a classificação **Histórico**. Ela descreve sua inclusão no arquivo e não afirma que estejam autorizados, ativos ou concluídos.
- `situacao_origem` conserva o texto da coluna “AUT. CEP”, incluindo “ok”, autorizações, rejeições, cancelamentos, ajustes e ressalvas. Esses valores não foram convertidos em aprovações uniformes.
- `periodo_origem` conserva o período informado. Somente 43 registros têm duas datas completas válidas e em ordem, permitindo preencher início e fim. Os demais 504 mantêm datas estruturadas vazias. Um deles, `pq2018_27`, possui data final anterior à inicial na fonte; o período literal foi conservado para conferência.
- A fonte apresenta 10 responsáveis ausentes ou compostos apenas por contato, cinco locais ausentes e seis períodos ausentes. Esses campos continuam vazios; não foram completados por inferência.

Foram mantidos título, nome profissional do responsável, instituição/curso, local, referência do registro, ano, situação e período. Colunas de autores/contatos, avaliador e devolutivas não foram publicadas. Telefones, e-mails, URLs e CPFs embutidos em células públicas também foram removidos. A planilha bruta não foi copiada ao repositório nem ao diretório estático do site.

## Persistência e validação

`importarAcervoDrive()` acrescenta os 13 materiais, 13 documentos e sete protocolos; identifica fontes por caminho local ou ID Drive e respeita sua área. Não marca documentos como aprovados nem protocolos como revisados.

`importarProjetosHistoricos()` acrescenta os 547 históricos, preserva IDs já existentes e preenche somente anos nulos dos 157 registros atuais. As duas importações possuem marcador transacional em `app_meta`, para que reinícios não revertam edições ou recriem exclusões feitas pelo painel.

A ampliação do esquema de projetos foi testada com uma base legada, conservando linhas, colunas adicionais, índice, view e trigger. Uma dependência externa inesperada provoca rollback completo. Antes da alteração, a base local possuía somente a chave primária da tabela, sem triggers, views ou referências externas para projetos.

Os **11 testes de importação e migração** passaram também após a integração com o seed. O teste com banco isolado confirmou **109 materiais, 97 documentos, 32 protocolos, 704 projetos, zero cursos e zero usuários criados pelo seed**, com `PRAGMA integrity_check = ok`. Evidência: `backend/test-results/drive-import-tests.tap`.

Este relatório descreve inventário, arquivos preparados e testes em banco isolado. A aplicação ao banco real e a publicação são verificadas separadamente no procedimento de entrega.

## Artefatos

- `drive-inventory-20260929.json`: árvore completa, IDs e metadados dos 104 itens.
- `drive-reconciliation-20260929.json`: comparação por hash e destinação de cada item.
- `projects-history-reconciliation-20260929.json`: situação por ano, lacunas, registros repetidos e linhas incompletas, sem contatos.
- `backend/seeds/DRIVE_20260929.json`: manifesto dos 13 materiais originais.
- `backend/seeds/PROJETOS_HISTORICOS_20260929.json`: 547 projetos sanitizados e mapeamento de ano dos 157 atuais.
