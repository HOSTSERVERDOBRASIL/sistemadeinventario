class InventoryService {
  constructor(repository) {
    this.repository = repository;
  }

  dashboard(companyId) {
    const state = this.repository.getState();
    const certificates = state.certificates.filter((item) => item.companyId === companyId);
    const endpoints = state.endpoints.filter((item) => item.companyId === companyId);
    const now = Date.now();
    const days30 = 1000 * 60 * 60 * 24 * 30;

    return {
      totalCertificates: certificates.length,
      totalExternal: certificates.filter((item) => item.source === "EXTERNO").length,
      totalXdb: certificates.filter((item) => item.source === "XDB").length,
      expiringIn30Days: certificates.filter((item) => new Date(item.validTo).getTime() - now <= days30).length,
      endpointsPending: endpoints.filter((item) => !item.currentCertificateId).length,
      endpointsCovered: endpoints.filter((item) => item.currentCertificateId).length,
      totalEndpoints: endpoints.length
    };
  }

  listCertificates(companyId) {
    return this.repository.getState().certificates.filter((item) => item.companyId === companyId);
  }

  getCertificate(companyId, certificateId) {
    return this.listCertificates(companyId).find((item) => item.id === certificateId) || null;
  }

  createCertificate(companyId, payload) {
    const state = this.repository.getState();
    const created = {
      id: this.repository.nextId("cert"),
      companyId,
      name: payload.name,
      domainPrimary: payload.domainPrimary,
      coverageType: payload.coverageType || "SINGLE",
      coverageDomains: payload.coverageDomains || [],
      sanDomains: payload.sanDomains || [],
      source: payload.source || "XDB",
      ecosystem: payload.ecosystem || "INTERNACIONAL",
      category: payload.category || "SSL",
      issuer: payload.issuer || "unknown",
      validFrom: payload.validFrom || new Date().toISOString(),
      validTo: payload.validTo || new Date().toISOString(),
      autoRenew: Boolean(payload.autoRenew),
      acmeManaged: Boolean(payload.acmeManaged)
    };

    state.certificates.push(created);
    this.repository.save();
    return created;
  }

  updateCertificate(companyId, certificateId, payload) {
    const certificate = this.getCertificate(companyId, certificateId);

    if (!certificate) {
      return null;
    }

    Object.assign(certificate, payload);
    this.repository.save();
    return certificate;
  }

  listEndpoints(companyId) {
    return this.repository.getState().endpoints.filter((item) => item.companyId === companyId);
  }

  getEndpoint(companyId, endpointId) {
    return this.listEndpoints(companyId).find((item) => item.id === endpointId) || null;
  }

  createEndpoint(companyId, payload) {
    const state = this.repository.getState();
    const created = {
      id: this.repository.nextId("endpoint"),
      companyId,
      host: payload.host,
      ip: payload.ip || "",
      port: Number(payload.port || 443),
      environment: payload.environment || "PRODUCAO",
      zone: payload.zone || "EXTERNAL",
      tlsEnabled: Boolean(payload.tlsEnabled),
      status: payload.status || "ACTIVE",
      currentCertificateId: payload.currentCertificateId || null,
      metadata: payload.metadata || {}
    };

    state.endpoints.push(created);
    this.repository.save();
    return created;
  }

  updateEndpoint(companyId, endpointId, payload) {
    const endpoint = this.getEndpoint(companyId, endpointId);

    if (!endpoint) {
      return null;
    }

    Object.assign(endpoint, payload);
    this.repository.save();
    return endpoint;
  }
}

module.exports = {
  InventoryService
};
