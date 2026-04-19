function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

module.exports = {
  companies: [
    {
      id: "atlas-demo-company",
      name: "Cliente Demo Atlas",
      domainPrimary: "cliente.com.br",
      domainsAdditional: ["cliente.net.br"],
      discoveryEnabled: true,
      zones: ["EXTERNAL", "DMZ", "INTERNAL"]
    }
  ],
  certificates: [
    {
      id: "cert-wildcard-demo",
      companyId: "atlas-demo-company",
      name: "*.cliente.com.br",
      domainPrimary: "*.cliente.com.br",
      coverageType: "WILDCARD",
      coverageDomains: ["*.cliente.com.br"],
      sanDomains: [],
      source: "XDB",
      ecosystem: "INTERNACIONAL",
      category: "SSL",
      issuer: "Lets Encrypt",
      validFrom: daysFromNow(-20),
      validTo: daysFromNow(70),
      autoRenew: true,
      acmeManaged: true
    }
  ],
  endpoints: [
    {
      id: "endpoint-api-demo",
      companyId: "atlas-demo-company",
      host: "api.cliente.com.br",
      ip: "203.0.113.10",
      port: 443,
      environment: "PRODUCAO",
      zone: "EXTERNAL",
      tlsEnabled: true,
      status: "ACTIVE",
      currentCertificateId: "cert-wildcard-demo",
      metadata: {
        serverType: "nginx",
        operatingSystem: "linux"
      }
    },
    {
      id: "endpoint-erp-demo",
      companyId: "atlas-demo-company",
      host: "erp.interno.local",
      ip: "10.0.0.15",
      port: 443,
      environment: "PRODUCAO",
      zone: "INTERNAL",
      tlsEnabled: false,
      status: "ACTIVE",
      currentCertificateId: null,
      metadata: {
        serverType: "iis",
        operatingSystem: "windows"
      }
    }
  ],
  agents: [
    {
      id: "agent-demo-internal",
      companyId: "atlas-demo-company",
      name: "Agente Interno Demo",
      token: "agent-demo-token",
      zone: "INTERNAL",
      type: "ACME_INTERNAL_AGENT",
      status: "online",
      supportsAcme: true,
      lastHeartbeatAt: new Date().toISOString()
    }
  ],
  jobs: [],
  deploymentQueue: [],
  discoveries: [],
  notifications: []
};
