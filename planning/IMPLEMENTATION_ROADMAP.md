# Implementation Roadmap

## Meta

Sair do prototipo funcional e chegar em uma versao beta interna com integracao real.

## Sprint 1

Foco:

- persistencia real
- base de dominio confiavel

Entregas:

- escolher Postgres
- criar schema inicial
- migrar `certificates`, `endpoints`, `jobs`, `agents` e `audit_logs`
- criar camada de repositorio real
- remover dependencia operacional do JSON local

Definition of done:

- CRUD principal persistido em banco
- dados sobrevivem a reinicio
- migracoes reproduziveis

## Sprint 2

Foco:

- autenticacao e multi-tenant reais

Entregas:

- middleware de autenticacao compartilhada com Atlas
- autorizacao por `companyId`
- papeis `admin`, `operador`, `viewer`
- trilha de auditoria por usuario
- hardening dos endpoints de mutacao

Definition of done:

- nenhuma mutacao sem usuario autenticado
- isolamento de tenant validado
- auditoria de usuario persistida

## Sprint 3

Foco:

- fila operacional real e worker externo

Entregas:

- adotar fila real para jobs
- scheduler para atualizacao diaria
- worker externo para DNS e TLS
- retries, timeout e dead-letter basicos
- persistencia de resultados de discovery

Definition of done:

- jobs externos executam fora da API web
- falhas nao derrubam a API
- discovery publico real funcionando

## Sprint 4

Foco:

- agente interno real

Entregas:

- pacote inicial do agente Windows/Linux
- bootstrap com token temporario
- credencial rotativa por agente
- heartbeat, poll e report reais
- whitelist por tipo de job e zona

Definition of done:

- agente conecta em outbound only
- Atlas nao precisa de acesso inbound
- escopo do agente e auditavel

## Sprint 5

Foco:

- motor de correlacao e fila operacional

Entregas:

- correlacao entre discovery, endpoint e certificado
- explicacao de cobertura
- recomendacao operacional por endpoint
- fila de implantacao com status reais
- dashboard consolidado

Definition of done:

- sistema mostra onde esta, o que cobre e o que falta
- recomendacao operacional deixa de ser apenas conceitual

## Sprint 6

Foco:

- importacao robusta e UX operacional

Entregas:

- parser mais forte para cadeia PKCS#7
- limites e validacoes de upload
- revisao manual antes de salvar
- historico de importacoes
- tela operacional completa de certificados e endpoints

Definition of done:

- upload confiavel para operacao diaria
- time consegue revisar e corrigir classificacao

## Sprint 7

Foco:

- observabilidade e readiness de beta

Entregas:

- logs estruturados
- correlation id
- metricas e alertas
- testes unitarios e integracao principais
- runbook operacional

Definition of done:

- diagnostico de falha viavel
- cobertura minima de testes dos fluxos criticos
- ambiente apto para piloto interno

## Prioridade absoluta

Se o time estiver pequeno, executar nesta ordem:

1. Sprint 1
2. Sprint 2
3. Sprint 3
4. Sprint 4

Sem isso, a integracao ainda nao e real.

## Resultado esperado ao final

Ao fim da trilha:

- Atlas autentica
- modulo persiste em banco
- worker externo descobre superficie publica
- agente interno inventaria sem expor a rede
- cobertura e recomendacao ficam confiaveis
- operacao diaria passa a ser sustentavel
