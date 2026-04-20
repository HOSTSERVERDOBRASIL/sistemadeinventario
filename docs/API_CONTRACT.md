# API Contract

## Health

### GET /health

Retorna status do modulo.

## Dashboard

### GET /api/v2/inventario/dashboard

Retorna:

- totalCertificados
- totalExternos
- totalXdb
- vencendoEm30Dias
- endpointsPendentes
- endpointsCobertos

## Certificates

### GET /api/v2/inventario/catalogo/certificados

Retorna a arvore oficial de selecao de certificados:

- Raiz Internacional
  - SSL
  - S/MIME
- ICP-Brasil
  - Aplicacao
  - Infoconv
  - Bancario
    - CIP
    - COMPE-SPB-Bacen

### GET /api/v2/inventario-certificados

Lista paginada.

### POST /api/v2/inventario-certificados/analisar-upload

Recebe:

- `filename`
- `contentBase64`

Reconhece formatos como:

- `.crt`
- `.cer`
- `.pem`
- `.p7b`
- `.p7c`

Retorna:

- formato detectado
- metadados do certificado quando possivel
- taxonomia sugerida

### POST /api/v2/inventario-certificados/importar-upload

Analisa o upload e ja cria o certificado no inventario com a taxonomia sugerida ou informada.

### GET /api/v2/inventario-certificados/:id

Detalhe do certificado.

### POST /api/v2/inventario-certificados

Cria certificado.

### PUT /api/v2/inventario-certificados/:id

Atualiza certificado.

## Endpoints

### GET /api/v2/inventario-endpoints

Lista endpoints.

### GET /api/v2/inventario-endpoints/:id

Detalhe do endpoint.

### POST /api/v2/inventario-endpoints

Cria endpoint.

### PUT /api/v2/inventario-endpoints/:id

Atualiza endpoint.

## Discovery

### POST /api/v2/inventario/discovery/domain

Executa discovery por dominio.

### POST /api/v2/inventario/discovery/endpoint

Executa discovery por host.

## Coverage

### GET /api/v2/inventario/certificados/:id/cobertura

Retorna resumo e itens avaliados.

### GET /api/v2/inventario/dominio/cobertura?dominio=cliente.com.br

Retorna cobertura baseada em dominio principal.

## Recommendation

### POST /api/v2/inventario/endpoints/:id/recomendar-acao

Retorna ou recalcula recomendacao operacional.

### POST /api/v2/inventario/endpoints/:id/preparar-agente

Prepara a fila de implantacao de agente ACME ou agente interno.

## Deployment Queue

### GET /api/v2/inventario/implantacao/fila

Lista fila de implantacao.

### PATCH /api/v2/inventario/implantacao/:id/status

Atualiza status da fila.

## Jobs

### GET /api/v2/inventario/jobs

Lista jobs do orquestrador.

## Agents

### POST /api/v2/agents/register

Registra um agente interno ou agente ACME.

### POST /api/v2/agents/heartbeat

Recebe heartbeat outbound do agente.

### POST /api/v2/agents/poll

Entrega tarefas pendentes para o agente.

### POST /api/v2/agents/jobs/:id/report

Recebe resultado de job executado pelo agente.

