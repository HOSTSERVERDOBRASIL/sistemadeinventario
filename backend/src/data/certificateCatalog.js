const CERTIFICATE_CATALOG = {
  roots: [
    {
      code: "INTERNACIONAL",
      label: "Raiz Internacional",
      families: [
        {
          code: "SSL",
          label: "SSL",
          types: [
            {
              code: "SSL_STANDARD",
              label: "Certificado SSL",
              description: "Certificados SSL/TLS para sites, APIs, servidores e endpoints HTTPS."
            }
          ]
        },
        {
          code: "SMIME",
          label: "S/MIME",
          types: [
            {
              code: "SMIME_STANDARD",
              label: "Certificado S/MIME",
              description: "Certificados para assinatura e criptografia de e-mail."
            }
          ]
        }
      ]
    },
    {
      code: "ICP_BRASIL",
      label: "ICP-Brasil",
      families: [
        {
          code: "APLICACAO",
          label: "Aplicacao",
          types: [
            {
              code: "APLICACAO_WEB",
              label: "Certificado de Aplicacao",
              description: "Certificados Digitais destinados a identificacao de aplicacoes WEB."
            }
          ]
        },
        {
          code: "INFOCONV",
          label: "Infoconv",
          types: [
            {
              code: "INFOCONV_STANDARD",
              label: "Certificado INFOCONV",
              description: "Certificado Digital com validade de 1 ano para o Infoconv."
            }
          ]
        },
        {
          code: "BANCARIO",
          label: "Bancario",
          types: [
            {
              code: "CIP",
              label: "Certificado CIP",
              description: "Certificados no padrao CIP como ECO, CIP-C3, CIP-SCG, CIP-SILOC-SLC, CIP-R2C3, Cadastro Positivo, CIP-SCC, CIP-SLN e CMP."
            },
            {
              code: "COMPE_SPB_BACEN",
              label: "Certificado COMPE-SPB-Bacen",
              description: "Certificado destinado ao uso no padrao Compe-SPB-Bacen."
            }
          ]
        }
      ]
    }
  ]
};

function flattenCatalog() {
  return CERTIFICATE_CATALOG.roots.flatMap((root) =>
    root.families.flatMap((family) =>
      family.types.map((type) => ({
        rootCode: root.code,
        rootLabel: root.label,
        familyCode: family.code,
        familyLabel: family.label,
        typeCode: type.code,
        typeLabel: type.label,
        description: type.description
      }))
    )
  );
}

function findCatalogEntry(rootCode, familyCode, typeCode) {
  return flattenCatalog().find(
    (item) =>
      item.rootCode === rootCode &&
      item.familyCode === familyCode &&
      item.typeCode === typeCode
  ) || null;
}

module.exports = {
  CERTIFICATE_CATALOG,
  flattenCatalog,
  findCatalogEntry
};
