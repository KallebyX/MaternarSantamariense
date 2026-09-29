# Maternar no Portainer da UFN

Destino solicitado: **https://maternarsantamariense.app.ufn.edu.br**.
Domínio publicado pelo Nginx Proxy Manager, com HTTPS válido e envio SMTP verificado.
Este roteiro usa a aplicação completa: frontend, API Express, acervo e SQLite.

**Estado atual em 29/09/2026:** stack definitiva **maternar**, ID **254**, ativa e
saudável com a imagem **maternar:20260929-mobile2** no ambiente `dockerapps`, usando o volume real `maternar-dados` com sete
cadastros (cinco profissionais e dois administradores). A aplicação responde em
`10.21.19.45:8035` dentro da rede institucional. Não repita a criação da stack,
o build ou a restauração da mesma tag/volume. Host Nginx 25, certificado 42.
O domínio e a entrega de e-mail foram validados em produção; veja
[publicação e SMTP](../../PUBLICACAO-EMAIL-2026-09-29.md).
A [entrega final do acervo e perfil](../../ENTREGA-ACERVO-PERFIL-2026-09-29.md) documenta
os 704 projetos, filtros, importação e verificações atuais.
A [revisão mobile e logos](../../ENTREGA-MOBILE-2026-09-29.md) documenta a atualização mais recente e a verificação visual no domínio público.
O restante do roteiro inclui o histórico da preparação inicial.

## Ambiente consultado em 29/09/2026

| Configuração | Valor |
|---|---|
| Portainer | `https://app.ufn.edu.br`, versão 2.45.1 |
| Environment | `dockerapps`, ID `5`, Docker Standalone via Agent |
| Docker | Linux x86-64, Engine 28.3.3; Swarm inativo |
| IP interno | `10.21.19.45` |
| Porta desta stack | `8035` → porta `3000` do contêiner |
| Proxy Manager | `https://proxy.app.ufn.edu.br` |
| Domínio escolhido | `maternarsantamariense.app.ufn.edu.br` |
| Nome da stack | `maternar` |
| Imagem ativa | `maternar:20260929-mobile2` |
| Imagem anterior preservada | `maternar:20260929-acervo1` |
| Volume persistente | `maternar-dados` |

A porta 3000 já é usada por outro projeto. A porta 8035 deve permanecer exclusiva
desta stack e acessível ao proxy pela rede interna. Não use `127.0.0.1` no bind do
Docker: o proxy é um serviço separado. Mantenha **uma única instância** da aplicação
com este banco SQLite. Não distribua esse volume entre nós de um Swarm.

O perfil institucional recusa o campo `security_opt`. A stack usa usuário
`10001:10001`, filesystem somente leitura, volume dedicado, `/tmp` temporário,
`cap_drop: ALL`, limite de memória e logs com rotação, sem esse campo bloqueado.

## Arquivos da entrega

**Atualização atual, já aplicada:** `dist/portainer-ufn-20260929-mobile2/`.
Contém `maternar-build.tar.gz`, `stack.yml`, `stack.env.example`, `release.json` e
`SHA256SUMS`. O arquivo de variáveis é somente um modelo, **sem segredos**. A
atualização já aplicada manteve as variáveis vigentes diretamente no Portainer;
elas não foram exportadas para este novo pacote. Não substitua o segredo JWT
vigente pelo campo vazio do modelo. Esse pacote **não restaura o banco**;
reutiliza o volume `maternar-dados`. Diretório privado (0700).

A identificação exata da imagem e do snapshot privado anterior à atualização
está no relatório operacional local, fora do Git. A versão anterior permanece
disponível para reversão.
Os sete usuários, seus hashes e as variáveis da stack foram comparados antes e
depois: permaneceram iguais. Banco íntegro, sem violações de chave estrangeira.
Os cursos e aulas de demonstração foram zerados por determinação do usuário;
o cadastro agora exige publicar explicitamente após cadastrar as aulas. Nenhuma
conta de teste integra a imagem. Detalhes: [guia de cursos e certificados](../../GUIA-CURSOS-CERTIFICADOS.md)
e [histórico da auditoria](../../AUDITORIA-E2E-2026-09-29.md).

**Pacote histórico da primeira implantação:** `dist/portainer-ufn-20260929/`:

- `maternar-build.tar.gz`: contexto de build com código e acervo. Não é uma imagem
  exportada por `docker save`; use a operação **Build**, nunca **Import image**.
- `maternar-dados-PRIVADO.tar.gz`: snapshot SQLite consistente, uploads e manifesto
  com hashes. Contém os cinco profissionais e os administradores Luiz e Kalleby, inclusive os
  hashes de senha. Enviar somente para o volume privado da aplicação.
- `stack.yml`: copiar no editor de stack do Portainer.
- `stack.env`: carregar em **Environment variables → Load variables from .env**.
  Contém o segredo JWT de produção gerado para esta implantação.
- `SHA256SUMS`: verificação dos arquivos; `release.json`: identificação da entrega.

O diretório tem acesso privado e está excluído do Git e dos contextos Docker.
As senhas do Portainer/proxy e a senha inicial de Luiz não estão nos pacotes.
Guarde `stack.env`: atualizações devem reutilizar o mesmo segredo.

## Preparar outra versão a partir deste projeto

Requer Python 3.11+; o Mac não precisa de Docker para usar a API do Portainer.
Execute na raiz do projeto, com escrita de conteúdo/uploads pausada durante o
snapshot. O script recusa diretório de saída já existente.

```bash
python3 deploy/portainer/preparar.py \
  --output dist/portainer-NOVA-VERSAO \
  --image maternar:NOVA-VERSAO
```

Para uma **atualização**, use apenas o novo contexto/imagem e mantenha o volume e
o `stack.env` de produção. Não restaure novamente o banco local, que pode estar
desatualizado. A geração de um pacote cria um segredo novo para uma primeira
implantação; não substitua o segredo atual durante atualizações de rotina.

## Construir e testar a imagem

A autenticação é solicitada no terminal; a senha não aparece nem é salva.
Opcionalmente `--credentials-eml /caminho/privado/Docker.eml` lê o e-mail fornecido
pela TI e confere se o endereço do Portainer corresponde ao e-mail.

```bash
python3 deploy/portainer/portainer.py build \
  --archive dist/portainer-NOVA-VERSAO/maternar-build.tar.gz \
  --image maternar:NOVA-VERSAO

python3 deploy/portainer/verificar.py \
  --image maternar:NOVA-VERSAO \
  --port 8036
```

O build envia somente o contexto sem dados pessoais operacionais. O script recusa
sobrescrever uma tag existente: escolha uma versão nova para um novo build.
O verificador usa o próprio YAML em uma stack temporária com contas fictícias; verifica
rotas, arquivos do acervo, login, perfis, upload, escrita e persistência após
reinício, healthcheck e bind da porta. Ao terminar, remove apenas seus recursos
temporários. Não o execute enquanto a produção estiver usando a mesma porta;
use `--port` com outra porta livre para validar atualizações.

Alternativa em uma máquina Linux amd64 com Docker:

```bash
docker build -f backend/Dockerfile -t maternar:NOVA-VERSAO .
```

Essa imagem deve existir no **mesmo ambiente `dockerapps`** que executará a stack.
O arquivo de stack usa `pull_policy: never` para uma imagem construída no destino.
Se migrar para registry privado, publique uma tag versionada, configure o registry
no Portainer e ajuste essa política. Nunca inclua o banco na imagem.

## Preparar o volume com os sete cadastros

Etapa histórica de primeira implantação, **já concluída**. Não executar para a
atualização atual. Em um ambiente novo, antes de implantar a primeira stack:

```bash
python3 deploy/portainer/portainer.py restore \
  --archive dist/portainer-ufn-20260929/maternar-dados-PRIVADO.tar.gz \
  --image maternar:20260929-portainer1 \
  --volume maternar-dados
```

O script cria um volume novo, confirma **acesso restrito no Portainer antes de
enviar o banco**, transfere o backup por HTTPS para um contêiner auxiliar, valida
os hashes, a integridade SQLite e a contagem de usuários, restaura com permissões
privadas e remove a stack auxiliar. O volume permanece. Nenhuma porta é publicada.
Somente o auxiliar de cópia usa camada de filesystem temporária gravável, sem rede
e sem root, porque a API Docker de transferência recusa contêineres read-only. A
aplicação definitiva mantém filesystem somente leitura.
O script recusa um volume já existente: isso protege o banco de produção.
Não repita a restauração se o relatório de entrega já confirmar o volume pronto.

Se uma preparação falhar, consulte a mensagem antes de agir. Um volume parcial
não deve ser usado pela stack; corrija a causa e restaure em um **novo nome**.
O script não apaga volumes automaticamente nem substitui um banco existente.

## Implantar a stack

Etapas de primeira implantação, **já concluídas** para a stack 254. Atualizações
devem editar a stack existente, preservando volume e variáveis.

1. Em Portainer, selecione **dockerapps → Stacks → Add stack**.
2. Nome: **maternar**. Método: **Web editor**. Cole `stack.yml`.
3. Carregue o arquivo privado `stack.env` em **Environment variables**.
4. Confira a imagem, o volume previamente restaurado, `10.21.19.45` e porta `8035`.
5. Em **Access control**, use **Restricted** para a conta/equipe responsável.
6. Clique **Deploy the stack** e aguarde o healthcheck ficar **healthy**.

O volume é `external: true`: a stack não cria acidentalmente um banco vazio nem
associa a persistência ao nome gerado de um serviço. Ao atualizar, mantenha o mesmo
volume. Não marque opções de remoção de volumes para atualizar/recriar a stack.

## Proxy e HTTPS

Em **Nginx Proxy Manager → Hosts → Proxy Hosts → Add Proxy Host**:

| Campo | Valor |
|---|---|
| Domain Names | `maternarsantamariense.app.ufn.edu.br` |
| Scheme | `http` |
| Forward Hostname / IP | `10.21.19.45` |
| Forward Port | `8035` |
| Cache Assets | Desligado; evita frontend antigo após atualização |
| Block Common Exploits | Ligado |
| Websockets Support | Desligado; a aplicação atual usa HTTP |

Em **Advanced**, cole `nginx-advanced.conf`. Ele permite o multipart de uploads de
até 64 MiB com margem para o formulário. Todo o tráfego, incluindo `/api`,
`/uploads` e `/acervo`, deve chegar ao mesmo contêiner; não crie aliases de pastas
locais no host do proxy.

Em **SSL**, solicite certificado Let's Encrypt para o domínio, informe o e-mail
institucional responsável, aceite os termos conforme a política da instituição e
ative **Force SSL** e **HTTP/2**. Ative HSTS somente após validar o HTTPS. Confirme
com a TI que o DNS desse domínio resolve para o proxy; o manual informa suporte a
`*.app.ufn.edu.br`, mas isso não comprova que o novo proxy/certificado já existe.

A primeira credencial de Proxy Manager retornava 401. Com o acesso atualizado,
o host e certificado foram criados e a publicação foi concluída em 29/09/2026.

## Verificação depois da publicação

- Abrir `/`, `/app`, `/painel` e `/api/saude` pelo domínio HTTPS.
- Confirmar os sete cadastros no painel; Luiz e Kalleby têm Administrador. Luiz tem troca de senha
  obrigatória. A credencial inicial está no arquivo privado já entregue.
- Fazer login como profissional e gestor, editar/recarregar um registro, publicar
  um material e abrir seu arquivo com a conta profissional.
- Fazer upload, reiniciar somente o contêiner Maternar e confirmar a persistência.
- Confirmar 404 em `/backend/data/maternar.db`, `/backend/.env` e
  `/backend/seeds/PERFIS.json`.
- Executar a jornada no navegador depois de DNS/SSL. Testes da imagem sem o proxy
  não comprovam a publicação HTTPS.

## Backup, atualização e retorno

Antes de atualizar, suspenda escritas, faça snapshot SQLite com
`node scripts/backup.mjs /app/backend/data/backup-AAAA-MM-DD.db` no console do
contêiner e baixe esse arquivo **e a pasta uploads** pelo navegador de volume do
Portainer (Agent), para armazenamento privado fora do servidor. O snapshot usa a
API de backup SQLite; copiar somente o `.db` de uma aplicação ativa pode ignorar
transações no WAL. A exportação JSON do painel não substitui esse backup.

Guarde o identificador da imagem anterior e as variáveis de produção. Para
atualizar, construa/teste outra tag e altere apenas `MATERNAR_IMAGE` na stack. Se
precisar retornar sem mudança incompatível de schema, restaure a tag anterior com
o mesmo volume. Se houver mudança incompatível, pare a stack, restaure o backup
compatível **em outro volume**, preserve o volume atual para recuperação e aponte
a stack para o volume restaurado. Nunca aplique um backup antigo sobre produção
em execução. Verifique novamente login, dados e uploads depois de qualquer retorno.

## Referências

- Manual institucional: `MANUAL PORTAINER.pdf`, fornecido nesta tarefa.
- [Build de imagens no Portainer](https://docs.portainer.io/user/docker/images/build)
- [Stacks e variáveis no Portainer](https://docs.portainer.io/user/docker/stacks/add)
- [Volumes e persistência Docker](https://docs.docker.com/engine/storage/volumes/)
