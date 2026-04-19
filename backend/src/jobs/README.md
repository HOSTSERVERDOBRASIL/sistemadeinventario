# Jobs do Backend

Este diretorio deve conter os jobs agendados do inventario.

## Job obrigatorio inicial

- `inventoryDailyUpdate`

## Responsabilidades

- executar discovery incremental
- recalcular cobertura de certificado
- gerar recomendacoes de implantacao
- consolidar resumo do dia
- enviar notificacao operacional

## Contrato minimo

O comando abaixo deve existir no `package.json` do backend:

```json
{
  "scripts": {
    "inventory:daily": "node ./src/jobs/inventoryDailyUpdate.js"
  }
}
```

## Saida esperada

- status final
- quantidade de empresas processadas
- quantidade de endpoints analisados
- quantidade de alertas
- resumo pronto para webhook
