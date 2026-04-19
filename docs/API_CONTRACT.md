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

### GET /api/v2/inventario-certificados

Lista paginada.

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

## Deployment Queue

### GET /api/v2/inventario/implantacao/fila

Lista fila de implantacao.

### PATCH /api/v2/inventario/implantacao/:id/status

Atualiza status da fila.

