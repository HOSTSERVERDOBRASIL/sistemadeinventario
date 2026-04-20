# Security Model

## Objetivo

Trazer informacao de inventario sem expor a rede interna do cliente e sem transformar o Atlas em ponto de acesso operacional ao ambiente dele.

## Principio central

O sistema deve entregar:

- visibilidade
- correlacao
- recomendacao

O sistema nao deve entregar:

- acesso remoto generico
- execucao arbitraria
- tunel administrativo
- coleta excessiva de dados sensiveis

## Modelo recomendado

### Atlas

Responsavel por:

- autenticar usuario
- orquestrar jobs
- receber resultados
- correlacionar dados
- exibir cobertura e recomendacoes

### Worker externo

Responsavel apenas por:

- DNS publico
- TLS publico
- portas expostas
- descoberta externa

Nao deve acessar rede interna do cliente.

### Agente interno

Responsavel por:

- coletar inventario local
- enviar heartbeat outbound
- buscar jobs permitidos
- devolver metadados de inventario

Nao deve:

- abrir porta de entrada
- aceitar shell remoto
- executar comandos livres
- manter tunel de administracao

## Regra de conectividade

O agente deve operar em modelo `outbound only`.

Isso significa:

- a conexao sai da rede do cliente para o Atlas
- o Atlas nao inicia conexao para dentro da rede do cliente
- nao ha necessidade de abrir firewall inbound para o Atlas

## Dados permitidos

O agente pode coletar:

- hostname
- IP
- porta
- ambiente
- zona
- certificado detectado
- validade
- emissor
- fingerprint
- tipo de servidor
- sistema operacional
- bindings HTTPS

## Dados proibidos por padrao

O agente nao deve coletar por padrao:

- chave privada
- segredo de aplicacao
- senha
- token operacional
- dump completo de configuracao
- conteudo de banco de dados
- arquivos de usuario
- shell output arbitrario

## Escopo minimo

Cada agente deve ser vinculado a:

- `companyId`
- `agentId`
- `zone`
- lista de redes, hosts ou fontes permitidas

Exemplos de zona:

- `EXTERNAL`
- `DMZ`
- `INTERNAL`
- `RESTRICTED`
- `BANKING`
- `GOV`

## Politica de jobs

Os jobs devem ser whitelisted.

Jobs permitidos no MVP:

- `DISCOVER_PUBLIC_DOMAIN`
- `DISCOVER_ENDPOINT`
- `DISCOVER_INTERNAL_HOSTS`
- `COLLECT_INSTALLED_CERTIFICATES`
- `COLLECT_WEB_SERVER_BINDINGS`
- `CHECK_CERTIFICATE_COVERAGE`
- `INSTALL_EXTERNAL_ACME_AGENT`
- `INSTALL_INTERNAL_ACME_AGENT`

O agente nao deve aceitar:

- comando shell livre
- script arbitrario enviado pelo painel
- upload de binario nao assinado

## Identidade e autenticacao

Cada agente deve possuir:

- token unico
- vinculacao a uma empresa
- rotacao periodica
- revogacao imediata

Evolucao recomendada:

- token de bootstrap
- credencial rotativa por agente
- mTLS entre agente e backend

## Autorizacao

O backend deve validar:

- agente pertence ao `companyId`
- job pertence ao mesmo `companyId`
- agente pode executar a `zone` do job
- agente pode executar o `type` do job

## Privilegio minimo

O agente deve rodar com a menor permissao possivel.

Separar quando necessario:

- leitura de inventario
- leitura de bindings
- instalacao de agente ACME
- alteracoes de configuracao

Nao misturar tudo no mesmo nivel de permissao sem necessidade.

## Auditoria

Registrar obrigatoriamente:

- agente que executou
- job recebido
- hora de inicio
- hora de fim
- resumo do retorno
- falhas
- mudancas solicitadas

## Separacao entre coleta e acao

O produto deve distinguir:

- `coletar`
- `recomendar`
- `implantar`

No MVP seguro:

- coletar e recomendar primeiro
- implantar somente com fila controlada e aprovacao clara

## ACME e automacao

O agente ACME pode ser reutilizado, desde que:

- continue em modelo outbound
- execute apenas playbooks permitidos
- nao exponha interface administrativa geral
- reporte somente resultado operacional necessario

## Resumo executivo

O Atlas deve saber:

- onde o ativo esta
- qual certificado ele usa
- se esta coberto
- qual a proxima acao

O Atlas nao deve se tornar:

- ponto de entrada na rede interna
- console remoto do cliente
- executor generico de comandos
