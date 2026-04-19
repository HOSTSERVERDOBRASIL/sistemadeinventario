# Backend

Area reservada para a API do modulo de inventario.

## Responsabilidades

- certificados
- endpoints
- ativos
- discovery
- cobertura
- recomendacao
- fila de implantacao

## Estrutura sugerida

- `src/app`
- `src/routes`
- `src/controllers`
- `src/services`
- `src/models`
- `src/middleware`
- `src/lib`
- `src/jobs`

## Scheduler diario

O backend deve expor o comando:

```bash
npm run inventory:daily
```

Esse comando e o ponto de entrada da automacao diaria definida no workflow:

- `.github/workflows/daily-inventory-update.yml`

## Implementacao atual

Esta base ja foi iniciada com:

- servidor HTTP em Node.js sem dependencias externas
- armazenamento local em JSON para acelerar bootstrap
- rotas de dashboard, certificados, endpoints, cobertura e implantacao
- orquestrador de jobs para zonas internas e externas
- API de agente interno
- preparacao de agente ACME
- job `inventory:daily`

## Como executar

```bash
npm start
```

```bash
npm run inventory:daily
```
