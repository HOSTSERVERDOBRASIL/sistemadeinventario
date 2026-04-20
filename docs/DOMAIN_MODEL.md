# Domain Model

## Entidades principais

### CompanyContext

- companyId
- nomeEmpresa
- dominioPrincipal
- dominiosAdicionais
- discoveryEnabled

### Certificate

- id
- companyId
- rootCode
- rootLabel
- ecossistema
- familyCode
- familyLabel
- origemInventario
- origemDetalhe
- typeCode
- typeLabel
- typeDescription
- categoria
- numeroSerie
- fingerprint
- coberturaTipo
- coberturaDominios
- dominioPrincipal
- statusCertificado
- statusRenovacao
- renovavelComXdb

### Asset

- id
- companyId
- tipoAtivo
- identificadorPrincipal
- ambiente
- ecossistema
- responsavel
- criticidade

### Endpoint

- id
- companyId
- host
- ip
- porta
- protocolo
- ambiente
- zonaRede
- exposicao
- statusCobertura
- certificadoInventarioId
- recomendacaoAcao
- scoreAutomacao

### CoverageEvaluation

- certificateId
- assetId
- coverageMatch
- coverageMode
- statusAtual
- recommendedAction
- reason
- score

### DeploymentQueueItem

- id
- assetId
- endpointId
- certificateId
- recommendedAction
- deploymentStatus
- owner
- notes

## Tipos de cobertura

- SINGLE
- WILDCARD
- SAN
- IDENTIFICACAO
- INTERNO

## Taxonomia de certificados

### Raiz Internacional

- SSL
- S/MIME

### ICP-Brasil

- Aplicacao
- Infoconv
- Bancario
  - CIP
  - COMPE-SPB-Bacen

## Tipos de ativo

- DOMINIO
- SUBDOMINIO
- HOST
- SERVIDOR
- APPLIANCE
- EQUIPAMENTO_ICP
- APLICACAO
- INTEGRACAO_BANCARIA
- INTEGRACAO_INFOCONV

