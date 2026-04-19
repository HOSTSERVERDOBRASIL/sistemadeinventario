class AgentService {
  constructor(repository, orchestratorService) {
    this.repository = repository;
    this.orchestratorService = orchestratorService;
  }

  listAgents(companyId) {
    return this.repository.getState().agents.filter((item) => item.companyId === companyId);
  }

  registerAgent(companyId, payload) {
    const state = this.repository.getState();
    const agent = {
      id: this.repository.nextId("agent"),
      companyId,
      name: payload.name,
      token: payload.token || this.repository.nextId("token"),
      zone: payload.zone || "INTERNAL",
      type: payload.type || "ACME_INTERNAL_AGENT",
      status: "online",
      supportsAcme: payload.supportsAcme !== false,
      lastHeartbeatAt: new Date().toISOString()
    };

    state.agents.push(agent);
    this.repository.save();
    return agent;
  }

  authenticateAgent(token) {
    return this.repository.getState().agents.find((item) => item.token === token) || null;
  }

  heartbeat(agentId, payload) {
    const state = this.repository.getState();
    const agent = state.agents.find((item) => item.id === agentId);

    if (!agent) {
      return null;
    }

    agent.status = payload.status || "online";
    agent.lastHeartbeatAt = new Date().toISOString();
    agent.metadata = Object.assign({}, agent.metadata || {}, payload.metadata || {});
    this.repository.save();
    return agent;
  }

  poll(agentId) {
    const state = this.repository.getState();
    const agent = state.agents.find((item) => item.id === agentId);

    if (!agent) {
      return null;
    }

    return {
      agent,
      jobs: this.orchestratorService.getPendingJobsForAgent(agent.companyId, agent.id, agent.zone)
    };
  }

  reportJob(agentId, jobId, payload) {
    const state = this.repository.getState();
    const agent = state.agents.find((item) => item.id === agentId);

    if (!agent) {
      return null;
    }

    if (Array.isArray(payload.discoveredItems) && payload.discoveredItems.length > 0) {
      this.orchestratorService.registerDiscoveryResult(agent.companyId, {
        source: agent.name,
        scope: payload.scope || jobId,
        zone: agent.zone,
        items: payload.discoveredItems
      });
    }

    return this.orchestratorService.completeJob(jobId, {
      agentId,
      status: payload.status || "completed",
      discoveredItems: payload.discoveredItems || [],
      notes: payload.notes || ""
    });
  }
}

module.exports = {
  AgentService
};
