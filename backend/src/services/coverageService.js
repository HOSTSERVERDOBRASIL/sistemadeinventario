function normalizeHost(value) {
  return String(value || "").trim().toLowerCase();
}

function wildcardMatches(pattern, host) {
  const normalizedPattern = normalizeHost(pattern);
  const normalizedHost = normalizeHost(host);

  if (!normalizedPattern.startsWith("*.")) {
    return false;
  }

  const suffix = normalizedPattern.slice(1);
  return normalizedHost.endsWith(suffix) && normalizedHost !== suffix.slice(1);
}

class CoverageService {
  constructor(repository, inventoryService) {
    this.repository = repository;
    this.inventoryService = inventoryService;
  }

  evaluateCertificateAgainstEndpoint(certificate, endpoint) {
    const host = normalizeHost(endpoint.host);
    const coverageDomains = [certificate.domainPrimary]
      .concat(certificate.coverageDomains || [])
      .concat(certificate.sanDomains || [])
      .filter(Boolean);

    const exact = coverageDomains.some((item) => normalizeHost(item) === host);
    const wildcard = coverageDomains.some((item) => wildcardMatches(item, host));

    if (certificate.coverageType === "WILDCARD" && wildcard) {
      return {
        coverageMatch: true,
        coverageMode: "WILDCARD",
        reason: "Host compativel com a cobertura wildcard"
      };
    }

    if (certificate.coverageType === "SAN" && (exact || wildcard)) {
      return {
        coverageMatch: true,
        coverageMode: "SAN",
        reason: "Host listado na cobertura SAN"
      };
    }

    if (certificate.coverageType === "SINGLE" && exact) {
      return {
        coverageMatch: true,
        coverageMode: "SINGLE",
        reason: "Host coincide com o certificado de dominio unico"
      };
    }

    return {
      coverageMatch: false,
      coverageMode: "NONE",
      reason: "Host fora da cobertura declarada"
    };
  }

  recommendAction(certificate, endpoint, coverage) {
    if (coverage.coverageMatch && endpoint.currentCertificateId === certificate.id) {
      return {
        score: 1,
        statusCoverage: "COBERTO",
        recommendedAction: "MONITORAR",
        acmeEligible: false,
        reason: "Endpoint ja utiliza este certificado"
      };
    }

    if (coverage.coverageMatch && !endpoint.currentCertificateId && endpoint.zone !== "INTERNAL") {
      return {
        score: 8,
        statusCoverage: "SEM_CERTIFICADO",
        recommendedAction: "INSTALAR_AGENTE_ACME",
        acmeEligible: Boolean(certificate.acmeManaged),
        reason: "Host publico compativel com o certificado e sem TLS implantado"
      };
    }

    if (coverage.coverageMatch && !endpoint.currentCertificateId && endpoint.zone === "INTERNAL") {
      return {
        score: 6,
        statusCoverage: "SEM_CERTIFICADO",
        recommendedAction: "IMPLANTAR_AGENTE_INTERNO",
        acmeEligible: Boolean(certificate.acmeManaged),
        reason: "Host interno compativel, requer agente interno para implantacao"
      };
    }

    if (coverage.coverageMatch && endpoint.currentCertificateId && endpoint.currentCertificateId !== certificate.id) {
      return {
        score: 5,
        statusCoverage: "COBERTO_POR_OUTRO_CERTIFICADO",
        recommendedAction: "AVALIAR_MIGRACAO_PARA_CERTIFICADO_XDB",
        acmeEligible: Boolean(certificate.acmeManaged),
        reason: "Endpoint compativel, mas usa outro certificado"
      };
    }

    return {
      score: 0,
      statusCoverage: "NAO_COBERTO",
      recommendedAction: "EMITIR_CERTIFICADO_ESPECIFICO",
      acmeEligible: false,
      reason: "Endpoint nao e compativel com a cobertura atual"
    };
  }

  getCertificateCoverage(companyId, certificateId) {
    const certificate = this.inventoryService.getCertificate(companyId, certificateId);

    if (!certificate) {
      return null;
    }

    const endpoints = this.inventoryService.listEndpoints(companyId);
    const evaluations = endpoints.map((endpoint) => {
      const coverage = this.evaluateCertificateAgainstEndpoint(certificate, endpoint);
      const recommendation = this.recommendAction(certificate, endpoint, coverage);

      return {
        endpointId: endpoint.id,
        host: endpoint.host,
        zone: endpoint.zone,
        port: endpoint.port,
        currentCertificateId: endpoint.currentCertificateId,
        coverageMatch: coverage.coverageMatch,
        coverageMode: coverage.coverageMode,
        coverageReason: coverage.reason,
        scoreAutomacao: recommendation.score,
        statusCoverage: recommendation.statusCoverage,
        recommendedAction: recommendation.recommendedAction,
        acmeEligible: recommendation.acmeEligible,
        reason: recommendation.reason
      };
    });

    return {
      certificate,
      summary: {
        compatibleEndpoints: evaluations.filter((item) => item.coverageMatch).length,
        coveredNow: evaluations.filter((item) => item.statusCoverage === "COBERTO").length,
        deployable: evaluations.filter((item) => item.recommendedAction === "INSTALAR_AGENTE_ACME" || item.recommendedAction === "IMPLANTAR_AGENTE_INTERNO").length,
        notCompatible: evaluations.filter((item) => !item.coverageMatch).length
      },
      endpoints: evaluations
    };
  }

  getDomainCoverage(companyId, domain) {
    const certificates = this.inventoryService.listCertificates(companyId);
    const certificate = certificates.find((item) => {
      const allDomains = [item.domainPrimary].concat(item.coverageDomains || []).concat(item.sanDomains || []);
      return allDomains.some((entry) => normalizeHost(entry).includes(normalizeHost(domain)));
    });

    if (!certificate) {
      return {
        domain,
        summary: {
          compatibleEndpoints: 0,
          coveredNow: 0,
          deployable: 0,
          notCompatible: this.inventoryService.listEndpoints(companyId).length
        },
        endpoints: [],
        certificate: null
      };
    }

    return this.getCertificateCoverage(companyId, certificate.id);
  }
}

module.exports = {
  CoverageService
};
