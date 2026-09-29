# Encaminhamento do domínio Maternar na UFN

**Resolvido em 29/09/2026:** host 25 e certificado 42 ativos; HTTP redireciona
para o próprio domínio em HTTPS. O diagnóstico abaixo é o histórico anterior.
Evidências: [publicação concluída](../../PUBLICACAO-EMAIL-2026-09-29.md).

Aplicação já ativa: stack **maternar (ID 254)** no environment **dockerapps (ID 5)**.
Healthcheck saudável, sete usuários preservados. As rotas da aplicação retornam
200 sem redirecionamento quando consultadas dentro do contêiner.

Diagnóstico em 29/09/2026: `maternarsantamariense.app.ufn.edu.br` resolve para
`200.132.59.218`, porém HTTP recebe `301 → https://site.ufn.edu.br/` do servidor
openresty. HTTPS responde com alerta TLS `unrecognized name`.

No Nginx Proxy Manager (`https://proxy.app.ufn.edu.br`), criar ou corrigir
**somente** o host específico do Maternar, preservando o comportamento dos outros
domínios da instituição:

| Campo | Valor |
|---|---|
| Tipo de host | Proxy Host |
| Domain Names | `maternarsantamariense.app.ufn.edu.br` |
| Scheme | `http` |
| Forward Hostname / IP | `10.21.19.45` |
| Forward Port | `8035` |
| Cache Assets | Desligado |
| Block Common Exploits | Ligado |
| Websockets Support | Desligado |

Antes de salvar, verificar se esse domínio está listado em **Redirection Hosts**
ou em outro Proxy Host. Se houver uma regra específica conflitante, corrigir essa
regra; não alterar a regra padrão global da UFN.

Em **Advanced**, usar o conteúdo de `nginx-advanced.conf` para uploads de até
64 MiB. Em SSL, emitir/selecionar certificado válido para o domínio e habilitar
Force SSL e HTTP/2. Encaminhar todos os caminhos ao mesmo destino, inclusive
`/api`, `/app`, `/painel`, `/uploads` e `/acervo`.

Critérios de conclusão:

1. HTTP redireciona para **o mesmo domínio em HTTPS**, sem levar a `site.ufn.edu.br`.
2. HTTPS abre a página Maternar e `/api/saude` responde JSON com status `ok`.
3. Login de administrador/profissional, carregamento de conteúdo e download de
   arquivo funcionam pelo domínio público.
4. `/backend/data/maternar.db` e `/backend/.env` permanecem inacessíveis (404).

Pendência de acesso: a credencial de Proxy Manager fornecida no `Docker.eml`
retornou 401. É necessário acesso válido ao painel para aplicar a configuração.
Este roteiro foi preparado localmente; nenhuma mensagem foi enviada à TI.
