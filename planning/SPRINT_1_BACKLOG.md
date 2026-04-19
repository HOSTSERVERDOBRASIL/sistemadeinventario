# Sprint 1 Backlog

## Goal

Entregar o nucleo operacional do modulo com foco em cobertura web.

## Workstreams

### A. Base

- alinhar auth compartilhada com Atlas
- definir strategy de deploy
- definir dominio principal por empresa

### B. Backend

- criar service de cobertura por certificado
- expor APIs de cobertura
- criar recomendacao por endpoint
- criar fila de implantacao
- preparar comando `inventory:daily`

### C. Frontend

- criar pagina de cobertura de certificado
- criar pagina de fila de implantacao
- integrar com detalhe do certificado

### D. Testes

- wildcard
- single
- SAN
- endpoint sem TLS
- endpoint com externo

## Definition of done

- auth alinhada
- APIs funcionando
- pagina de cobertura pronta
- recomendacoes visiveis
- fila operacional pronta
- atualizacao diaria preparada

## Operacao diaria

- configurar secrets usados pela automacao
- validar horario do agendamento
- definir canal de envio do resumo diario
