# Operacao Diaria do Inventario

## Objetivo

Deixar o inventario atualizado todos os dias sem depender de acao manual da equipe.

## Fluxo diario recomendado

1. Executar rediscovery por empresa ou por dominio principal.
2. Recalcular cobertura de certificados `SINGLE`, `WILDCARD` e `SAN`.
3. Atualizar endpoints descobertos, pendentes e fora de cobertura.
4. Recalcular recomendacoes de implantacao de agente ACME.
5. Gerar resumo operacional do dia.
6. Enviar notificacao para o canal definido pelo time.

## Agendamento ja preparado

O template do repositorio ja possui um workflow de execucao diaria em:

- `.github/workflows/daily-inventory-update.yml`

O horario configurado no workflow e:

- `0 10 * * *`

Isso significa:

- execucao diaria as `10:00 UTC`
- equivalente a `07:00` no horario de Brasilia quando UTC-3

## Comando esperado no backend

O workflow chama o script:

```bash
npm run inventory:daily
```

O backend final deve implementar esse comando para:

- buscar empresas habilitadas para discovery
- rodar atualizacao incremental
- gerar consolidado
- enviar notificacao

## Variaveis esperadas

- `INVENTARIO_API_URL`
- `INVENTARIO_API_TOKEN`
- `INVENTARIO_COMPANY_ID`
- `INVENTARIO_NOTIFICATION_WEBHOOK`

## Canais de notificacao recomendados

- Microsoft Teams
- Slack
- e-mail operacional
- webhook interno do Atlas

## Conteudo minimo da atualizacao diaria

- empresas processadas
- dominios varridos
- endpoints novos encontrados
- endpoints sem cobertura
- certificados vencendo em 30 dias
- hosts elegiveis para agente ACME
- falhas na execucao

## Exemplo de resumo

```text
Atualizacao diaria do inventario
Empresa: Cliente X
Dominios analisados: 3
Novos endpoints: 6
Sem cobertura: 2
Elegiveis para ACME: 4
Certificados vencendo em 30 dias: 1
Status: concluido com alertas
```

## Recomendacao de implementacao

No MVP:

- executar 1 vez por dia
- gerar consolidado simples
- enviar notificacao unica por empresa ou por lote

Na fase seguinte:

- suporte multiempresa por fila
- retries
- logs estruturados
- historico de execucoes
- dashboard de saude do scheduler
