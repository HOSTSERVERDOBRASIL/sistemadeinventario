class AcmeService {
  constructor(repository, orchestratorService, inventoryService) {
    this.repository = repository;
    this.orchestratorService = orchestratorService;
    this.inventoryService = inventoryService;
  }

  recommendForEndpoint(companyId, endpointId) {
    const endpoint = this.inventoryService.getEndpoint(companyId, endpointId);

    if (!endpoint) {
      return null;
    }

    const certificates = this.inventoryService.listCertificates(companyId);
    const compatible = certificates.find((certificate) => {
      if (!certificate.acmeManaged) {
        return false;
      }

      return endpoint.host.endsWith(certificate.domainPrimary.replace("*.", ""));
    });

    if (!compatible) {
      return {
        endpointId,
        eligible: false,
        recommendedAction: "EMITIR_CERTIFICADO_ESPECIFICO",
        reason: "Nenhum certificado ACME compativel encontrado"
      };
    }

    const action = endpoint.zone === "INTERNAL" ? "IMPLANTAR_AGENTE_INTERNO" : "INSTALAR_AGENTE_ACME";

    return {
      endpointId,
      certificateId: compatible.id,
      eligible: true,
      recommendedAction: action,
      acmeMethod: endpoint.zone === "INTERNAL" ? "DNS-01" : "HTTP-01",
      reason: "Endpoint elegivel para implantacao automatizada com certificado XDB"
    };
  }

  prepareAgent(companyId, endpointId) {
    const recommendation = this.recommendForEndpoint(companyId, endpointId);

    if (!recommendation || !recommendation.eligible) {
      return recommendation;
    }

    const endpoint = this.inventoryService.getEndpoint(companyId, endpointId);
    const queueItem = {
      id: this.repository.nextId("deploy"),
      companyId,
      endpointId,
      host: endpoint.host,
      certificateId: recommendation.certificateId,
      status: "PREPARADO",
      action: recommendation.recommendedAction,
      acmeMethod: recommendation.acmeMethod,
      createdAt: new Date().toISOString()
    };

    this.repository.getState().deploymentQueue.push(queueItem);

    if (endpoint.zone === "INTERNAL") {
      this.orchestratorService.createJob(companyId, {
        type: "INSTALL_INTERNAL_ACME_AGENT",
        zone: "INTERNAL",
        target: endpoint.host
      });
    } else {
      this.orchestratorService.createJob(companyId, {
        type: "INSTALL_EXTERNAL_ACME_AGENT",
        zone: "EXTERNAL",
        target: endpoint.host
      });
    }

    this.repository.save();
    return queueItem;
  }
}

module.exports = {
  AcmeService
};
