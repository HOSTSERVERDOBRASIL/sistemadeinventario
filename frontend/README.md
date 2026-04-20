# Frontend

Area reservada para a aplicacao frontend do modulo ou para o pacote de telas do Atlas.

## Responsabilidades

- dashboard
- certificados
- endpoints
- discovery
- cobertura de certificado
- fila de implantacao

## Estrutura sugerida

- `src/pages`
- `src/services`
- `src/components`
- `src/types`

## Interface inicial ja disponivel

Foi adicionada uma interface estatica em:

- `public/index.html`
- `public/app.js`
- `public/styles.css`

Ela permite:

- consultar o catalogo oficial
- subir arquivo `.crt`, `.cer`, `.pem`, `.p7b` ou `.p7c`
- analisar classificacao sugerida
- importar direto para o inventario

