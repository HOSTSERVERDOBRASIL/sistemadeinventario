# Handoff Completo: Inventario Atlas

## 1. Resumo Executivo

### 1.1 Veredito

O produto e' viavel, necessario e estrategico.

Ele aproveita uma base tecnica ja existente no Atlas e pode evoluir de "inventario de certificados" para uma camada de governanca operacional de:

- certificados
- endpoints
- subdominios
- equipamentos ICP-Brasil
- aplicacoes criticas
- integracoes bancarias e governamentais

O maior valor nao esta em listar ativos, e sim em responder:

- o que existe
- onde esta
- o que cobre
- quem depende disso
- o que precisa ser feito agora

### 1.2 Tese do produto

O Inventario Atlas deve ser o modulo que conecta:

1. emissao
2. descoberta
3. correlacao
4. recomendacao
5. implantacao
6. renovacao

### 1.3 Posicionamento

O produto nao deve ser vendido internamente como "tela de inventario".

Ele deve ser visto como:

- camada de governanca de identidade digital
- painel de cobertura criptografica
- centro operacional de certificados e ativos protegidos

---

## 2. Problema que o produto resolve

### 2.1 Dor do cliente

Hoje o cliente frequentemente nao sabe:

- quais certificados possui
- quais foram emitidos pela XDB
- quais sao externos
- onde estao instalados
- quais endpoints estao cobertos
- quais hosts estao expostos sem certificado
- qual wildcard cobre o que
- quais ativos vencem em 30 dias
- quais integracoes ICP/Bancarias dependem de um certificado especifico

### 2.2 Dor operacional interna

O time interno tambem sofre porque:

- a informacao fica espalhada em chamados e planilhas
- a renovacao costuma ser reativa
- a implantacao nao fica rastreada
- a cobertura real do cliente nao fica visivel
- e' dificil sugerir proxima acao objetiva

### 2.3 Oportunidade

O Atlas ja emite e gerencia parte do ciclo.

O inventario fecha a lacuna entre "emitimos um certificado" e "sabemos onde ele esta sendo usado e o que ainda falta fazer".

---

## 3. Objetivo do Produto

Entregar um modulo unificado no Atlas que:

- reutiliza a autenticacao do painel
- centraliza ativos certificados por empresa
- descobre subdominios e endpoints
- correlaciona certificados com uso real
- recomenda a proxima acao operacional
- suporta web internacional e ecossistemas nao-web

---

## 4. Escopo de Negocio

### 4.1 Escopo principal

O Inventario Atlas deve suportar:

- SSL internacional
- certificados single, wildcard e SAN
- ICP-Brasil
- certificados de equipamento
- aplicacoes Infoconv
- integracoes bancarias
- ativos internos e DMZ

### 4.2 O que o modulo precisa fazer

- catalogar certificados
- catalogar endpoints e ativos
- descobrir hosts a partir do dominio principal
- detectar TLS quando aplicavel
- identificar cobertura
- apontar riscos
- priorizar acao
- alimentar fila operacional

### 4.3 O que o modulo nao precisa fazer no MVP

- descoberta total de rede interna sem agente
- instalacao remota completa em todos os tipos de servidor
- orquestracao universal de deployment
- autodeteccao perfeita de stack e servidor

---

## 5. Visao de Produto

### 5.1 Conceito central

O produto deve ser modelado como um inventario de ativos certificados.

Cada empresa possui:

- certificados
- ativos de uso
- relacoes de cobertura
- recomendacoes
- fila de acao

### 5.2 Entidades conceituais

#### Certificado

Representa um ativo criptografico.

Exemplos:

- SSL DV
- SSL OV
- SSL EV
- wildcard
- SAN
- A1
- A3
- certificado de equipamento
- certificado bancario
- mTLS

#### Ativo de uso

Representa onde o certificado e' usado ou deveria ser usado.

Exemplos:

- dominio
- subdominio
- host
- servidor
- appliance
- equipamento ICP
- aplicacao
- integracao bancara
- integracao Infoconv

#### Cobertura

Relacionamento entre certificado e ativo.

Exemplos:

- host esta coberto por wildcard
- endpoint esta sem cobertura
- aplicacao esta vinculada ao certificado ICP
- integracao bancaria usa certificado externo

#### Recomendacao

Conclusao operacional que o sistema gera.

Exemplos:

- instalar agente ACME
- monitorar
- migrar certificado externo
- renovar com XDB
- exigir validacao manual

---

## 6. Analise de Viabilidade

### 6.1 Viabilidade tecnica

Alta.

Motivos:

- front ja possui rotas e paginas de inventario
- backend ja possui models de certificado e endpoint
- existe discovery passivo
- existe correlacao por host/certificado
- existe proxy para desacoplamento
- existem syncs legados de SSL e ICP-Brasil

### 6.2 Viabilidade operacional

Boa, desde que o discovery seja apresentado com limites claros.

Facil no MVP:

- DNS publico
- scan TLS
- correlacao CN/SAN/wildcard
- dashboards de cobertura
- recomendacao operacional

Mais avancado:

- redes internas profundas
- autodeteccao de stack
- deploy remoto universal

### 6.3 Viabilidade comercial

Boa.

O produto tem narrativa clara de valor:

- reduzir risco
- melhorar visibilidade
- acelerar renovacao
- aumentar uso da base emitida pela XDB
- gerar oportunidades de implantacao e monitoramento

---

## 7. Analise SWOT

### 7.1 Forcas

- base tecnica ja existente
- encaixe natural no Atlas
- alto valor operacional
- forte sinergia com ACME e certificados emitidos
- possibilidade de upsell
- multi-ecossistema

### 7.2 Fraquezas

- risco de escopo excessivo
- discovery pode ser percebido como mais amplo do que realmente e'
- casos web e nao-web tem regras diferentes
- parte do fluxo ainda depende do legado

### 7.3 Oportunidades

- upsell de implantacao
- upsell de monitoramento
- governanca enterprise
- auditoria e compliance
- camada de inteligencia para renovacao

### 7.4 Ameacas

- produto virar apenas dashboard
- arquitetura ficar duplicada com auth propria
- tentar suportar tudo ao mesmo tempo
- friccao entre monolito legado e modulo isolado

---

## 8. Arquitetura Recomendada

### 8.1 Decisao principal

O inventario nao deve ter autenticacao propria.

O Atlas autentica.
O inventario apenas autoriza e filtra por empresa.

### 8.2 Fluxo ideal

1. Usuario autentica no Atlas
2. Front chama APIs do inventario com o mesmo token
3. Backend principal do Atlas repassa ou atende o modulo
4. Inventario usa `companyId` e permissoes do contexto atual
5. Todas as consultas sao multi-tenant por empresa

### 8.3 Recomendacao de implantacao

Curto prazo:

- manter o front dentro do Atlas
- manter o backend principal como porta de entrada
- colocar o `inventory-only` atras do proxy quando fizer sentido

Medio prazo:

- consolidar o modulo isolado
- remover dependencias remanescentes do legado

### 8.4 Observacao importante

Algumas rotas de sync/rebuild ainda existem no legado e o front ainda as usa.

Isso nao deve bloquear o produto, mas precisa ser tratado explicitamente:

- ou essas rotas continuam no backend principal
- ou sao reimplementadas no modulo isolado

---

## 9. Fontes Ja Existentes no Projeto

### 9.1 Front

- Rotas do inventario: `XDB-PAINELFRONT-V2-main/src/routes/index.tsx`
- Paths: `XDB-PAINELFRONT-V2-main/src/routes/paths.ts`
- Menu: `XDB-PAINELFRONT-V2-main/src/layouts/dashboard/nav/config-navigation.tsx`
- Servico frontend: `XDB-PAINELFRONT-V2-main/src/services/inventario.service.ts`
- Paginas:
  - `InventarioDashboardPage.tsx`
  - `InventarioCertificadosPage.tsx`
  - `InventarioEndpointsPage.tsx`
  - `InventarioDiscoveryPage.tsx`

### 9.2 Backend inventario isolado

- App: `XDB-PAINELBACK-V2-main/inventory-only/src/app.ts`
- Rotas: `XDB-PAINELBACK-V2-main/inventory-only/src/routes`
- Auth atual: `XDB-PAINELBACK-V2-main/inventory-only/src/middleware/authMiddleware.ts`
- Model certificado: `XDB-PAINELBACK-V2-main/inventory-only/src/models/Inventario/inventarioCertificados.model.ts`
- Model endpoint: `XDB-PAINELBACK-V2-main/inventory-only/src/models/Inventario/inventarioEndpoints.model.ts`
- Service certificados: `XDB-PAINELBACK-V2-main/inventory-only/src/services/inventarioCertificados.service.ts`
- Service endpoints: `XDB-PAINELBACK-V2-main/inventory-only/src/services/inventarioEndpoints.service.ts`
- Discovery:
  - `inventarioDiscoveryOrchestrator.service.ts`
  - `inventarioCorrelation.service.ts`
  - `inventarioDiscoveryAgent.service.ts`

### 9.3 Backend legado

- Proxy: `XDB-PAINELBACK-V2-main/src/middleware/inventoryProxyMiddleware.ts`
- Rotas inventario: `XDB-PAINELBACK-V2-main/src/routes/inventario.routes.ts`
- Sync SSL/ICP e rebuild: `XDB-PAINELBACK-V2-main/src/services/inventarioCertificados.service.ts`

---

## 10. Escopo Funcional do MVP

### 10.1 Entregas obrigatorias do MVP

- auth compartilhada com Atlas
- inventario por empresa
- dominio principal por empresa
- discovery por dominio
- visao de certificados
- visao de endpoints
- visao de cobertura de certificado
- recomendacao de agente ACME para ativos web

### 10.2 O que o MVP deve responder

- quais certificados a empresa possui
- quais sao XDB e quais sao externos
- quais endpoints foram descobertos
- quais endpoints estao cobertos por certificado
- quais endpoints pertencem a wildcard/SAN/single
- quais endpoints estao sem cobertura
- onde faz sentido instalar agente ACME

### 10.3 O que pode ficar para fase 2

- automacao profunda para ICP/Infoconv/Bancario
- agentes internos de descoberta em massa
- rediscovery inteligente por criticidade
- score de risco composto
- alertas configuraveis por SLA

---

## 11. Ecossistemas Suportados

### 11.1 Lista recomendada

- `INTERNACIONAL`
- `ICP_BRASIL`
- `BANCARIO`
- `INFOCONV`
- `FECHADO`
- `DMZ_INTERNA`

### 11.2 Logica por ecossistema

#### INTERNACIONAL

Cobertura por dominio/host/TLS.

Acao esperada:

- aplicar wildcard
- aplicar SAN
- emitir single
- instalar agente ACME

#### ICP_BRASIL

Vinculo entre certificado e pessoa/equipamento/aplicacao.

Acao esperada:

- renovar
- substituir no equipamento
- revisar alocacao
- acompanhar vencimento

#### BANCARIO

Vinculo entre integracao, ambiente e certificado critico.

Acao esperada:

- renovar com antecedencia
- validar mTLS
- planejar janela de troca
- conferir contingencia

#### INFOCONV

Vinculo entre aplicacao, ambiente e autenticacao certificada.

Acao esperada:

- rastrear certificado por aplicacao
- validar ambiente
- revisar endpoint integrado

#### FECHADO e DMZ_INTERNA

Ativos internos ou parcialmente expostos.

Acao esperada:

- descoberta por agente
- mapeamento assistido
- validacao manual quando necessario

---

## 12. Tipos de Certificado Suportados

### 12.1 Tipos

- `SINGLE`
- `WILDCARD`
- `SAN`
- `A1`
- `A3`
- `MTLS`
- `EQUIPAMENTO`
- `BANCARIO`
- `OUTRO`

### 12.2 Regras de cobertura

#### SINGLE

Cobre apenas o host exato.

#### WILDCARD

Cobre subdominios compativeis do dominio base.

#### SAN

Cobre apenas a lista explicita de hosts/dominios.

#### ICP/equipamento/bancario

Nao entram na mesma regra de matching web.
Entram em vinculo de uso por ativo.

---

## 13. Tipos de Ativo Inventariado

### 13.1 Tipos recomendados

- `DOMINIO`
- `SUBDOMINIO`
- `HOST`
- `SERVIDOR`
- `APPLIANCE`
- `EQUIPAMENTO_ICP`
- `APLICACAO`
- `INTEGRACAO_BANCARIA`
- `INTEGRACAO_INFOCONV`

### 13.2 Justificativa

Isso evita que o produto fique restrito a endpoint web.

---

## 14. Funcionalidades por Area

### 14.1 Dashboard

Deve mostrar:

- total de certificados
- total de externos
- total XDB
- vencendo em 30 dias
- vencidos
- ativos sem responsavel
- endpoints pendentes
- endpoints cobertos
- ativos elegiveis para automacao

### 14.2 Certificados

Deve permitir:

- listar
- criar
- editar
- arquivar
- importar arquivo
- visualizar detalhe
- ver cobertura associada

### 14.3 Endpoints

Deve permitir:

- listar
- criar
- editar
- arquivar
- vincular certificado
- definir rediscovery
- ver recomendacao

### 14.4 Discovery

Deve permitir:

- executar por dominio
- executar por host
- usar fila assincrona
- ver runs
- ver fila
- gerenciar agentes internos

### 14.5 Cobertura de Certificado

Nova visao obrigatoria.

Deve mostrar:

- tipo do certificado
- cobertura potencial
- cobertura atual
- ativos compativeis
- ativos fora de cobertura
- recomendacoes

### 14.6 Fila de Implantacao

Nova visao operacional.

Deve mostrar:

- host/ativo
- recomendacao
- score
- agente sugerido
- responsavel
- status de implantacao

---

## 15. Jornada do Usuario

### 15.1 Caso 1: wildcard ACME

1. XDB emite `*.cliente.com.br`
2. certificado entra no inventario
3. cliente informa `dominioPrincipal`
4. discovery encontra hosts
5. sistema correlaciona com wildcard
6. Atlas mostra:
   - cobertos
   - sem certificado
   - externos
   - elegiveis para agente
7. time operacional prepara implantacao

### 15.2 Caso 2: certificado unico

1. certificado `app.cliente.com.br`
2. endpoint `app.cliente.com.br` aparece como coberto
3. `api.cliente.com.br` aparece como nao compativel
4. sistema recomenda novo certificado ou SAN

### 15.3 Caso 3: SAN

1. certificado cobre `app`, `api` e `portal`
2. discovery encontra `admin`
3. `admin` aparece fora da lista SAN
4. sistema recomenda reemissao com SAN expandido ou single

### 15.4 Caso 4: ICP equipamento

1. certificado ICP e' inventariado
2. ativo de uso e' equipamento ou aplicacao
3. sistema mostra vencimento, responsavel e local de uso
4. recomendacao foca em renovacao/substituicao

### 15.5 Caso 5: bancario ou Infoconv

1. certificado e aplicacao/integracao sao vinculados
2. sistema mostra dependencia
3. sistema alerta risco de vencimento
4. acao e' operacional e nao ACME

---

## 16. Regras de Negocio

### 16.1 Regras gerais

- todos os registros sao filtrados por `companyId`
- nao existe login proprio do inventario
- certificados arquivados nao entram como cobertura ativa
- endpoints arquivados nao entram em recomendacoes ativas

### 16.2 Regras de matching

#### SINGLE

- match exato por host

#### WILDCARD

- match por subdominio compativel

#### SAN

- match por lista explicita

#### ICP/equipamento/aplicacao

- match por vinculo de ativo, nao por DNS

### 16.3 Regras de recomendacao web

#### INSTALAR_AGENTE_ACME

Quando:

- ativo web publico
- pertence a dominio coberto por wildcard ou politica compativel
- sem certificado ou certificado inadequado

#### MONITORAR

Quando:

- ativo ja esta coberto pelo certificado alvo

#### MIGRAR_PARA_XDB_ACME

Quando:

- ativo compativel usa certificado externo

#### EMITIR_CERTIFICADO_ESPECIFICO

Quando:

- ativo nao e' compativel com o certificado atual

#### VALIDACAO_MANUAL

Quando:

- ativo interno
- sem rota automatica
- dependencia sensivel

### 16.4 Regras de recomendacao nao-web

#### RENOVAR_COM_XDB

Quando:

- certificado ICP/Bancario/Aplicacao esta vencendo

#### REVISAR_VINCULO_DO_ATIVO

Quando:

- nao esta claro onde o certificado esta usado

#### PREPARAR_JANELA_DE_TROCA

Quando:

- ativo bancario ou critico depende de substituicao controlada

---

## 17. Modelo de Score

### 17.1 Score de automacao web

Regra sugerida:

- +3 dominio compativel
- +2 publico
- +2 sem certificado
- +1 porta 443/8443/9443
- +1 certificado alvo emitido pela XDB
- -2 ativo interno
- -3 host fora da cobertura

### 17.2 Faixas

- `6 ou mais`: elegivel para agente
- `3 a 5`: revisar
- `0 a 2`: nao automatizar

### 17.3 Score de criticidade

Opcional fase 2:

- +3 bancario
- +3 Infoconv
- +2 ICP producao
- +2 vencendo em 30 dias
- +1 sem contingencia

---

## 18. UX e Telas

### 18.1 Dashboard do inventario

Cards:

- total de certificados
- total XDB
- total externos
- vencendo em 30 dias
- vencidos
- endpoints pendentes
- endpoints cobertos
- elegiveis para automacao

Blocos:

- visao por ecossistema
- cobertura operacional
- fila de acao

### 18.2 Pagina de certificados

Tabela:

- cliente
- tipo
- ecossistema
- origem
- cobertura
- validade
- status
- renovacao
- acoes

### 18.3 Pagina de endpoints

Tabela:

- host
- ambiente
- ecossistema
- status cobertura
- origem cobertura
- certificado atual
- recomendacao
- score
- acoes

### 18.4 Pagina de discovery

Blocos:

- executar por dominio
- executar por endpoint
- fila
- resultados
- agentes internos

### 18.5 Nova pagina: Cobertura de Certificado

Objetivo:

mostrar tudo o que um certificado cobre e o que poderia cobrir.

Cards:

- ativos compativeis
- cobertos agora
- sem certificado
- usando externo
- elegiveis para agente
- nao compativeis

Tabela:

- ativo
- tipo ativo
- match de cobertura
- status atual
- recomendacao
- motivo

### 18.6 Nova pagina: Fila de Implantacao

Tabela:

- ativo
- host ou identificador
- certificado recomendado
- recomendacao
- score
- agente sugerido
- responsavel
- status
- ultima tentativa

---

## 19. APIs Recomendadas

### 19.1 Ja existentes

- `GET /api/v2/inventario/dashboard`
- `GET /api/v2/inventario-certificados`
- `GET /api/v2/inventario-certificados/:id`
- `POST /api/v2/inventario-certificados`
- `PUT /api/v2/inventario-certificados/:id`
- `GET /api/v2/inventario-endpoints`
- `GET /api/v2/inventario-endpoints/:id`
- `POST /api/v2/inventario-endpoints`
- `PUT /api/v2/inventario-endpoints/:id`
- `POST /api/v2/inventario/discovery/domain`
- `POST /api/v2/inventario/discovery/endpoint`

### 19.2 Novas APIs recomendadas

- `GET /api/v2/inventario/certificados/:id/cobertura`
- `GET /api/v2/inventario/dominio/cobertura?dominio=cliente.com.br`
- `POST /api/v2/inventario/endpoints/:id/recomendar-acao`
- `POST /api/v2/inventario/endpoints/:id/preparar-agente`
- `GET /api/v2/inventario/implantacao/fila`
- `PATCH /api/v2/inventario/implantacao/:id/status`

### 19.3 API de cobertura de certificado

Resposta sugerida:

```json
{
  "certificate": {
    "id": "cert_123",
    "type": "WILDCARD",
    "primaryName": "*.cliente.com.br",
    "ecosystem": "INTERNACIONAL",
    "validUntil": "2027-02-01",
    "status": "ATIVO"
  },
  "summary": {
    "compatibleAssets": 18,
    "coveredNow": 11,
    "usingExternal": 3,
    "withoutCertificate": 4,
    "eligibleForAutomation": 5,
    "notCompatible": 9
  },
  "items": [
    {
      "assetId": "ep_1",
      "assetType": "SUBDOMINIO",
      "identifier": "api.cliente.com.br",
      "coverageMatch": true,
      "coverageMode": "WILDCARD",
      "currentStatus": "SEM_CERTIFICADO",
      "recommendedAction": "INSTALAR_AGENTE_ACME",
      "score": 8,
      "reason": "Ativo publico dentro da cobertura do wildcard e sem TLS ativo"
    }
  ]
}
```

---

## 20. Entidades e Campos Recomendados

### 20.1 Certificado

Manter e complementar:

- `companyId`
- `ecossistema`
- `origemInventario`
- `origemDetalhe`
- `tipoCertificado`
- `categoria`
- `numeroSerie`
- `fingerprint`
- `coberturaTipo`
- `coberturaDominios`
- `dominioPrincipal`
- `statusCertificado`
- `statusRenovacao`
- `renovavelComXdb`

Campos novos sugeridos:

- `tipoUso`
- `criticidade`
- `ativoPrincipalRelaciondoId`
- `politicaAutomacao`

### 20.2 Endpoint / Ativo web

Manter e complementar:

- `identificadorPrincipal`
- `tipoIdentificador`
- `host`
- `ip`
- `porta`
- `ambiente`
- `zonaRede`
- `ecossistema`
- `statusCobertura`
- `certificadoInventarioId`

Campos novos sugeridos:

- `recomendacaoAcao`
- `scoreAutomacao`
- `motivoRecomendacao`
- `implantacaoStatus`
- `agenteSugerido`

### 20.3 Ativo nao-web

Nova colecao recomendada em fase 2:

- `tipoAtivo`
- `nome`
- `identificadorExterno`
- `ambiente`
- `ecossistema`
- `aplicacaoNome`
- `equipamentoModelo`
- `fabricante`
- `responsavel`
- `criticidade`
- `certificadoInventarioId`
- `statusOperacional`

---

## 21. Recomendacao de Modelagem de Produto

### 21.1 Nao limitar a "wildcard"

O conceito correto da tela e da API deve ser:

- `Cobertura de Certificado`

e nao apenas:

- `Cobertura Wildcard`

Porque deve servir para:

- single
- wildcard
- SAN
- ICP/equipamento/aplicacao

### 21.2 Nao limitar a "dominio"

O conceito correto do inventario deve ser:

- `Ativos certificados`

e nao apenas:

- `Subdominios`

---

## 22. O que deve ser cortado do escopo inicial

Para nao estourar prazo:

- automacao profunda de ICP/Bancario/Infoconv
- discovery de rede interna completa sem agente
- autodeteccao de servidor/stack no MVP
- gerenciamento remoto universal de servidor

O foco inicial deve ser:

- cobertura
- visibilidade
- recomendacao
- fila operacional

---

## 23. Backlog de 7 Dias

### Dia 1

- alinhar arquitetura
- decidir estrategia:
  - modulo atras do backend principal
  - sem auth propria
- definir onde guardar `dominioPrincipal`

### Dia 2

- criar servico `inventarioCertificateCoverage.service.ts`
- criar regras de matching:
  - single
  - wildcard
  - SAN
- criar regras de recomendacao

### Dia 3

- criar API:
  - cobertura por certificado
  - cobertura por dominio
  - recomendacao por endpoint

### Dia 4

- criar pagina `Cobertura de Certificado`
- ligar com detalhe do certificado
- filtros e cards

### Dia 5

- criar `Fila de Implantacao`
- adicionar acao `Preparar agente`
- adicionar status operacional

### Dia 6

- testes com cenarios:
  - wildcard cobrindo varios hosts
  - single
  - SAN
  - endpoint externo
  - endpoint sem TLS

### Dia 7

- ajustes finais
- polimento UX
- documentacao rapida
- checklist de deploy

---

## 24. Critrios de Aceite

### 24.1 Produto

- usuario autenticado no Atlas acessa o inventario sem novo login
- empresa possui dominio principal configurado
- discovery por dominio gera endpoints
- certificado emitido aparece no inventario
- sistema mostra cobertura por certificado
- sistema recomenda proxima acao

### 24.2 Tecnico

- todas as consultas sao filtradas por `companyId`
- modulo nao exige auth propria separada
- paginas respondem aos endpoints novos
- recomendacoes sao retornadas de forma estruturada
- tela de cobertura suporta single, wildcard e SAN

### 24.3 Operacional

- equipe consegue identificar endpoints cobertos
- equipe consegue identificar endpoints pendentes
- equipe consegue ver elegiveis para agente
- equipe consegue organizar fila de implantacao

---

## 25. Nota do Produto

### Nota geral

`8.7/10`

### Justificativa

- problema real: alto
- base tecnica existente: alta
- risco de arquitetura: medio
- risco de escopo: medio/alto
- potencial de valor: alto
- potencial comercial: bom

---

## 26. Recomendacao Final

### Recomendacao

Prosseguir.

### Condicoes para prosseguir bem

- remover a ideia de auth propria
- focar em cobertura e recomendacao antes de automacao total
- tratar web e nao-web com regras separadas
- lancar em fases

### Ordem ideal de maturidade

1. cobertura web e wildcard/single/SAN
2. fila de implantacao e recomendacao ACME
3. ativos ICP/aplicacao/bancario
4. agentes internos e governanca mais avancada

---

## 27. Resumo para o time de dev

### O que construir primeiro

- camada de cobertura por certificado
- recomendacao por endpoint
- tela de cobertura
- fila de implantacao

### O que reaproveitar

- modelos existentes
- paginas existentes
- discovery existente
- proxy existente

### O que corrigir de base

- auth do modulo
- dependencia de rotas de rebuild do legado
- nomenclatura de produto

---

## 28. Proxima Acao Recomendada

Criar imediatamente os seguintes artefatos de implementacao:

- ADR curta sobre auth compartilhada
- issue tecnica do MVP
- contrato da API de cobertura
- checklist de tela de cobertura
- checklist da fila de implantacao

Se o time quiser, este handoff ja pode ser transformado em:

- spec tecnica
- board de tarefas
- backlog sprint 1

