class OrchestratorService {
  constructor(repository, inventoryService, coverageService) {
    this.repository = repository;
    this.inventoryService = inventoryService;
    this.coverageService = coverageService;
  }

  createJob(companyId, payload) {
    const state = this.repository.getState();
    const job = {
      id: this.repository.nextId("job"),
      companyId,
      type: payload.type,
      zone: payload.zone || "EXTERNAL",
      target: payload.target || null,
      status: "queued",
      priority: payload.priority || "normal",
      assignedAgentId: payload.assignedAgentId || null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
      result: null
    };

    state.jobs.push(job);
    this.repository.save();
    return job;
  }

  listJobs(companyId) {
    return this.repository.getState().jobs.filter((item) => item.companyId === companyId);
  }

  getPendingJobsForAgent(companyId, agentId, zone) {
    const state = this.repository.getState();

    return state.jobs.filter((job) => {
      if (job.companyId !== companyId || job.status !== "queued") {
        return false;
      }

      if (job.assignedAgentId && job.assignedAgentId !== agentId) {
        return false;
      }

      return job.zone === zone || job.zone === "ANY";
    });
  }

  completeJob(jobId, result) {
    const state = this.repository.getState();
    const job = state.jobs.find((item) => item.id === jobId);

    if (!job) {
      return null;
    }

    job.status = "completed";
    job.startedAt = job.startedAt || new Date().toISOString();
    job.finishedAt = new Date().toISOString();
    job.result = result;
    this.repository.save();
    return job;
  }

  registerDiscoveryResult(companyId, payload) {
    const state = this.repository.getState();
    const discovery = {
      id: this.repository.nextId("discovery"),
      companyId,
      source: payload.source,
      scope: payload.scope,
      createdAt: new Date().toISOString(),
      items: payload.items || []
    };

    state.discoveries.push(discovery);

    for (const item of discovery.items) {
      const existing = this.inventoryService.listEndpoints(companyId).find((endpoint) => endpoint.host === item.host);

      if (!existing) {
        this.inventoryService.createEndpoint(companyId, {
          host: item.host,
          ip: item.ip,
          port: item.port || 443,
          zone: item.zone || payload.zone || "EXTERNAL",
          environment: item.environment || "PRODUCAO",
          tlsEnabled: Boolean(item.tlsEnabled),
          metadata: item.metadata || {}
        });
      }
    }

    this.repository.save();
    return discovery;
  }

  buildDeploymentQueue(companyId, certificateId) {
    const coverage = this.coverageService.getCertificateCoverage(companyId, certificateId);

    if (!coverage) {
      return null;
    }

    const state = this.repository.getState();
    const created = [];

    for (const item of coverage.endpoints) {
      if (item.recommendedAction !== "INSTALAR_AGENTE_ACME" && item.recommendedAction !== "IMPLANTAR_AGENTE_INTERNO") {
        continue;
      }

      const queueItem = {
        id: this.repository.nextId("deploy"),
        companyId,
        certificateId,
        endpointId: item.endpointId,
        host: item.host,
        status: "PENDENTE",
        action: item.recommendedAction,
        score: item.scoreAutomacao,
        createdAt: new Date().toISOString()
      };

      state.deploymentQueue.push(queueItem);
      created.push(queueItem);
    }

    this.repository.save();
    return created;
  }

  listDeploymentQueue(companyId) {
    return this.repository.getState().deploymentQueue.filter((item) => item.companyId === companyId);
  }

  updateDeploymentStatus(companyId, queueId, status) {
    const state = this.repository.getState();
    const item = state.deploymentQueue.find((entry) => entry.companyId === companyId && entry.id === queueId);

    if (!item) {
      return null;
    }

    item.status = status;
    item.updatedAt = new Date().toISOString();
    this.repository.save();
    return item;
  }

  runDailyUpdate(companyId) {
    const certificates = this.inventoryService.listCertificates(companyId);
    const endpoints = this.inventoryService.listEndpoints(companyId);
    const companies = this.repository.getState().companies;
    const company = companies.find((item) => item.id === companyId);
    const discoveries = [];
    const jobs = [];
    const queued = [];

    if (company && company.discoveryEnabled) {
      jobs.push(this.createJob(companyId, {
        type: "DISCOVER_PUBLIC_DOMAIN",
        zone: "EXTERNAL",
        target: company.domainPrimary
      }));

      discoveries.push(this.registerDiscoveryResult(companyId, {
        source: "daily-orchestrator",
        scope: company.domainPrimary,
        zone: "EXTERNAL",
        items: [
          {
            host: `portal.${company.domainPrimary}`,
            ip: "203.0.113.22",
            port: 443,
            tlsEnabled: true,
            zone: "EXTERNAL",
            metadata: {
              serverType: "nginx",
              discoveredBy: "daily-job"
            }
          }
        ]
      }));
    }

    for (const certificate of certificates) {
      const queueItems = this.buildDeploymentQueue(companyId, certificate.id) || [];
      queued.push(...queueItems);
    }

    const summary = {
      companyId,
      companyName: company ? company.name : companyId,
      processedCertificates: certificates.length,
      analyzedEndpoints: endpoints.length,
      discoveriesCreated: discoveries.length,
      jobsCreated: jobs.length,
      deploymentQueued: queued.length,
      generatedAt: new Date().toISOString()
    };

    this.repository.getState().notifications.push({
      id: this.repository.nextId("notification"),
      companyId,
      type: "DAILY_UPDATE",
      payload: summary,
      createdAt: new Date().toISOString()
    });

    this.repository.save();
    return summary;
  }
}

module.exports = {
  OrchestratorService
};
