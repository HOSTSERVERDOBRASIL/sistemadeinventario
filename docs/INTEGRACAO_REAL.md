# Integracao Real

## Objetivo

Transformar a base atual do modulo em uma integracao real com Atlas, agentes internos e worker externo, com seguranca suficiente para operacao em clientes.

## Estado atual

Ja existe:

- backend funcional
- upload e classificacao de certificados
- catalogo `Raiz Internacional` e `ICP-Brasil`
- modelo inicial de jobs
- modelo inicial de agente outbound
- interface inicial de operacao

Ainda nao existe:

- banco de dados real
- autenticacao compartilhada com Atlas
- worker externo de discovery real
- agente interno instalavel
- fila de execucao real com retries
- auditoria e observabilidade de producao

## Alvo de integracao

### 1. Atlas Core

Responsavel por:

- autenticar usuario
- emitir contexto de sessao
- repassar `companyId`
- controlar permissao por papel

Integracao necessaria:

- aceitar JWT ou sessao do Atlas
- middleware de autorizacao por tenant
- auditoria por usuario

### 2. Inventory API

Responsavel por:

- CRUD de certificados
- CRUD de endpoints
- cadastro manual
- upload e classificacao
- correlacao
- fila operacional

Integracao necessaria:

- persistencia em banco
- validacao de payload
- logs estruturados
- contratos estaveis de API

### 3. Worker Externo

Responsavel por:

- DNS publico
- TLS publico
- descoberta de endpoints expostos
- leitura de validade e emissor

Integracao necessaria:

- fila de jobs real
- scheduler
- retries
- timeout
- storage de resultados

### 4. Agente Interno

Responsavel por:

- inventario em rede interna
- bindings web
- certificados instalados
- heartbeat outbound
- poll de jobs autorizados
- report de resultado

Integracao necessaria:

- pacote instalavel
- bootstrap seguro
- rotacao de credencial
- escopo por zona
- politica de coleta

### 5. Motor de Correlacao

Responsavel por:

- cruzar certificado, endpoint, zona e origem
- identificar cobertura e lacunas
- gerar recomendacao operacional

Integracao necessaria:

- regras persistidas
- jobs de recalculo
- explicacao de cobertura

## Arquitetura alvo

### Camadas

- `Atlas Auth Context`
- `Inventory API`
- `Postgres`
- `Job Queue`
- `External Discovery Worker`
- `Internal Agent Manager`
- `Internal Agents`
- `Correlation Engine`
- `Audit/Observability`

### Fluxo principal

1. usuario entra pelo Atlas
2. Atlas entrega identidade e `companyId`
3. Inventory API autoriza a operacao
4. API cria job
5. worker externo ou agente interno executa
6. resultado volta para a API
7. correlacao recalcula cobertura
8. dashboard e fila operacional sao atualizados

## Integracoes reais necessarias

### Persistencia

Implementar Postgres com tabelas minimas:

- `companies`
- `users`
- `certificates`
- `certificate_imports`
- `endpoints`
- `assets`
- `agents`
- `agent_credentials`
- `jobs`
- `job_executions`
- `discoveries`
- `deployment_queue`
- `audit_logs`

### Autenticacao

Implementar:

- middleware de autenticacao compartilhada com Atlas
- autorizacao por `companyId`
- papeis `admin`, `operador`, `viewer`
- auditoria de usuario em toda mutacao

### Agente

Implementar:

- binario ou servico Windows/Linux
- bootstrap por token temporario
- credencial rotativa por agente
- polling outbound
- whitelisting real de jobs
- pacote de instalacao

### Worker externo

Implementar:

- executor de DNS
- executor de leitura TLS
- coleta de portas e metadados basicos
- fila de jobs real

### Observabilidade

Implementar:

- logs JSON
- correlation id
- metricas
- tracing basico
- auditoria de importacao e execucao

## Criterio para considerar a integracao pronta

### Beta interno

- banco real
- auth real
- fila real
- worker externo real
- agente interno em piloto
- testes de integracao minimos

### Producao inicial

- multi-tenant validado
- auditoria completa
- rotacao de credenciais
- observabilidade
- runbook operacional
- rollback e retry definidos

## Dependencias criticas

- definicao do modelo de auth do Atlas
- escolha do banco
- escolha da fila
- definicao do formato do agente interno
- politica de instalacao no ambiente do cliente

## Riscos principais

- manter JSON local por muito tempo
- integrar agente sem escopo por zona
- misturar coleta com automacao destrutiva
- subir para cliente sem auditoria e observabilidade

## Recomendacao executiva

Nao pular etapas.

A ordem correta e:

1. banco
2. auth
3. fila
4. worker externo
5. agente interno
6. correlacao final
7. observabilidade e hardening
