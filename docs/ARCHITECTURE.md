# Architecture

## Principio de arquitetura

O modulo e nativo do Atlas e nao deve manter autenticacao propria.

## Camadas

### Frontend

Responsavel por:

- dashboards
- listas
- detalhes
- filtros
- fila operacional

### Backend API

Responsavel por:

- inventario de certificados
- inventario de endpoints e ativos
- discovery
- cobertura
- recomendacao
- integracao com Atlas
- orquestracao segura de jobs

### Shared

Responsavel por:

- contratos de tipos
- enums
- payloads
- regras compartilhadas simples

## Contexto de autenticacao

- Atlas autentica
- modulo reutiliza JWT/sessao
- autorizacao por `companyId`, permissoes e papel

## Estrategia de deploy

- inicialmente atras do backend principal
- opcionalmente desacoplado com proxy

## Estrategia de seguranca

- Atlas nao acessa diretamente a rede interna do cliente
- coleta interna via agente `outbound only`
- worker externo somente para superficie publica
- jobs limitados por whitelist e por zona
- sem shell remoto generico

Documento de referencia:

- `docs/SECURITY_MODEL.md`

## Fases

### Fase 1

- cobertura web
- wildcard/single/SAN
- discovery por dominio

### Fase 2

- ICP/aplicacoes/integracoes

### Fase 3

- agentes internos
- automacao ampliada

