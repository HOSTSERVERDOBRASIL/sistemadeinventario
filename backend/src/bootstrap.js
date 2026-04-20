const { StateRepository } = require("./repositories/stateRepository");
const { InventoryService } = require("./services/inventoryService");
const { CoverageService } = require("./services/coverageService");
const { OrchestratorService } = require("./services/orchestratorService");
const { AgentService } = require("./services/agentService");
const { AcmeService } = require("./services/acmeService");
const config = require("./config");

function createContainer() {
  const repository = new StateRepository(config.dataFile);
  const inventoryService = new InventoryService(repository);
  const coverageService = new CoverageService(repository, inventoryService);
  const orchestratorService = new OrchestratorService(repository, inventoryService, coverageService, config);
  const agentService = new AgentService(repository, orchestratorService, config);
  const acmeService = new AcmeService(repository, orchestratorService, inventoryService);

  return {
    config,
    repository,
    inventoryService,
    coverageService,
    orchestratorService,
    agentService,
    acmeService
  };
}

module.exports = {
  createContainer
};
