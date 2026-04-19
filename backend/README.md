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
