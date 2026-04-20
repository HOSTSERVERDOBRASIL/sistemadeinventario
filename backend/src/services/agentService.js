const { signJob, safeEqual } = require("../lib/security");
const { getAllowedJobTypes, getAllowedZones, isJobAllowed } = require("../policies/jobPolicy");

class AgentService {
  constructor(repository, orchestratorService, config) {
    this.repository = repository;
    this.orchestratorService = orchestratorService;
    this.config = config;
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
      allowedJobTypes: payload.allowedJobTypes || getAllowedJobTypes(payload.type || "ACME_INTERNAL_AGENT"),
      allowedZones: payload.allowedZones || getAllowedZones(payload.type || "ACME_INTERNAL_AGENT"),
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
      jobs: this.orchestratorService.getPendingJobsForAgent(agent.companyId, agent)
    };
  }

  reportJob(agentId, jobId, payload) {
    const state = this.repository.getState();
    const agent = state.agents.find((item) => item.id === agentId);

    if (!agent) {
      return null;
    }

    const job = this.orchestratorService.getJob(jobId);

    if (!job || job.companyId !== agent.companyId) {
      return null;
    }

    if (!isJobAllowed(agent, job)) {
      throw new Error("Agent is not authorized to execute this job");
    }

    if (job.assignedAgentId && job.assignedAgentId !== agent.id) {
      throw new Error("Job assigned to another agent");
    }

    const expectedSignature = signJob(job, this.config.jobSigningSecret);
    const suppliedSignature = payload.jobSignature || "";

    if (!safeEqual(expectedSignature, suppliedSignature)) {
      throw new Error("Invalid job signature");
    }

    this.orchestratorService.startJob(jobId);

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
