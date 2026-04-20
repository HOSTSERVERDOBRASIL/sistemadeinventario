const path = require("path");
const { X509Certificate } = require("crypto");
const { findCatalogEntry } = require("../data/certificateCatalog");

function normalizeText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function detectFormat(filename, decodedText) {
  const extension = path.extname(filename || "").toLowerCase();

  if (decodedText.includes("BEGIN CERTIFICATE")) {
    return { extension, format: "X509_PEM" };
  }

  if (decodedText.includes("BEGIN PKCS7")) {
    return { extension, format: "PKCS7_PEM" };
  }

  if ([".p7b", ".p7c"].includes(extension)) {
    return { extension, format: "PKCS7_BINARY_OR_CHAIN" };
  }

  if ([".crt", ".cer", ".pem"].includes(extension)) {
    return { extension, format: "X509_BINARY_OR_PEM" };
  }

  return { extension, format: "UNKNOWN" };
}

function extractPemCertificate(decodedText) {
  const match = decodedText.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/);
  return match ? match[0] : null;
}

function parseCertificate(decodedBuffer, decodedText, detectedFormat) {
  try {
    if (detectedFormat.format === "X509_PEM") {
      const pem = extractPemCertificate(decodedText);
      if (!pem) {
        return null;
      }

      return new X509Certificate(pem);
    }

    if (detectedFormat.format === "X509_BINARY_OR_PEM" && !decodedText.includes("BEGIN")) {
      return new X509Certificate(decodedBuffer);
    }
  } catch (_error) {
    return null;
  }

  return null;
}

function suggestTaxonomy(filename, metadata) {
  const searchBase = normalizeText([
    filename,
    metadata.subject,
    metadata.issuer,
    metadata.subjectAltName
  ].filter(Boolean).join(" "));

  if (searchBase.includes("smime") || searchBase.includes("s/mime")) {
    return findCatalogEntry("INTERNACIONAL", "SMIME", "SMIME_STANDARD");
  }

  if (searchBase.includes("infoconv")) {
    return findCatalogEntry("ICP_BRASIL", "INFOCONV", "INFOCONV_STANDARD");
  }

  if (
    searchBase.includes("compe") ||
    searchBase.includes("spb") ||
    searchBase.includes("bacen")
  ) {
    return findCatalogEntry("ICP_BRASIL", "BANCARIO", "COMPE_SPB_BACEN");
  }

  if (
    searchBase.includes("cip") ||
    searchBase.includes("cadastro positivo") ||
    searchBase.includes("cmp")
  ) {
    return findCatalogEntry("ICP_BRASIL", "BANCARIO", "CIP");
  }

  if (searchBase.includes("aplicacao") || searchBase.includes("aplicacao web")) {
    return findCatalogEntry("ICP_BRASIL", "APLICACAO", "APLICACAO_WEB");
  }

  return findCatalogEntry("INTERNACIONAL", "SSL", "SSL_STANDARD");
}

class CertificateImportService {
  constructor(inventoryService) {
    this.inventoryService = inventoryService;
  }

  analyzeUpload(payload) {
    if (!payload.filename) {
      throw new Error("filename is required");
    }

    if (!payload.contentBase64) {
      throw new Error("contentBase64 is required");
    }

    const decodedBuffer = Buffer.from(payload.contentBase64, "base64");
    const decodedText = decodedBuffer.toString("utf8");
    const detectedFormat = detectFormat(payload.filename, decodedText);
    const x509 = parseCertificate(decodedBuffer, decodedText, detectedFormat);

    const metadata = {
      filename: payload.filename,
      fileExtension: detectedFormat.extension || "",
      detectedFormat: detectedFormat.format,
      recognized: detectedFormat.format !== "UNKNOWN",
      subject: x509 ? x509.subject : null,
      issuer: x509 ? x509.issuer : null,
      validFrom: x509 ? new Date(x509.validFrom).toISOString() : null,
      validTo: x509 ? new Date(x509.validTo).toISOString() : null,
      serialNumber: x509 ? x509.serialNumber : null,
      fingerprint256: x509 ? x509.fingerprint256 : null,
      subjectAltName: x509 ? x509.subjectAltName || null : null,
      notes: []
    };

    if (!x509 && ["PKCS7_PEM", "PKCS7_BINARY_OR_CHAIN"].includes(detectedFormat.format)) {
      metadata.notes.push("Arquivo reconhecido como cadeia PKCS#7. O reconhecimento estrutural foi feito pelo formato e pelo nome do arquivo.");
    }

    if (!x509 && detectedFormat.format === "UNKNOWN") {
      metadata.notes.push("Formato nao reconhecido automaticamente. Validar o pacote manualmente.");
    }

    const suggested = suggestTaxonomy(payload.filename, metadata);

    return {
      upload: metadata,
      suggestedTaxonomy: suggested,
      importPreview: {
        name: payload.name || path.basename(payload.filename, path.extname(payload.filename)),
        rootCode: suggested.rootCode,
        familyCode: suggested.familyCode,
        typeCode: suggested.typeCode,
        issuer: metadata.issuer || payload.issuer || "unknown",
        validFrom: metadata.validFrom || payload.validFrom || new Date().toISOString(),
        validTo: metadata.validTo || payload.validTo || new Date().toISOString(),
        coverageType: payload.coverageType || "IDENTIFICACAO"
      }
    };
  }

  importUpload(companyId, payload) {
    const analysis = this.analyzeUpload(payload);
    const preview = analysis.importPreview;

    const created = this.inventoryService.createCertificate(companyId, {
      name: preview.name,
      rootCode: preview.rootCode,
      familyCode: preview.familyCode,
      typeCode: preview.typeCode,
      issuer: preview.issuer,
      validFrom: preview.validFrom,
      validTo: preview.validTo,
      source: payload.source || "EXTERNO",
      coverageType: preview.coverageType,
      domainPrimary: payload.domainPrimary || "",
      coverageDomains: payload.coverageDomains || [],
      sanDomains: payload.sanDomains || [],
      autoRenew: Boolean(payload.autoRenew),
      acmeManaged: Boolean(payload.acmeManaged)
    });

    created.importMetadata = analysis.upload;
    return {
      analysis,
      certificate: created
    };
  }
}

module.exports = {
  CertificateImportService
};
