# Sistema de Inventario

Repositorio-base do modulo de Inventario Atlas.

Este projeto nasce para centralizar cobertura, descoberta, correlacao e operacao de certificados e ativos protegidos dentro do ecossistema Atlas.

## Objetivo

Entregar um modulo unificado para:

- inventariar certificados
- mapear endpoints e ativos
- descobrir subdominios e hosts
- correlacionar cobertura de certificados
- recomendar a proxima acao operacional
- organizar fila de implantacao e renovacao

## Escopos suportados

- SSL Internacional
- single, wildcard e SAN
- ICP-Brasil
- equipamento ICP
- aplicacoes Infoconv
- integracoes bancarias
- ambientes fechados e DMZ

## Principios

- sem autenticacao propria
- reutiliza contexto do Atlas
- multi-tenant por `companyId`
- coverage-first
- recommendation-driven
- operacao antes de automacao total

## Estrutura

- `docs/`
- `frontend/`
- `backend/`
- `shared/`
- `planning/`

## Documentos principais

- `docs/PRODUCT_OVERVIEW.md`
- `docs/ARCHITECTURE.md`
- `docs/API_CONTRACT.md`
- `docs/DOMAIN_MODEL.md`
- `docs/OPERACAO_DIARIA.md`
- `planning/SPRINT_1_BACKLOG.md`

## Automacao diaria

O template ja inclui a base para execucao automatica diaria do inventario:

- `.github/workflows/daily-inventory-update.yml`
- `docs/OPERACAO_DIARIA.md`

Esse fluxo foi pensado para rodar discovery, recalcular cobertura e enviar um resumo diario para o time.

## Proxima etapa

1. definir stack exata do repositorio
2. importar modulo atual de inventario
3. alinhar auth compartilhada
4. construir cobertura por certificado
