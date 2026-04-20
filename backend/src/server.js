const http = require("http");
const path = require("path");
const { createContainer } = require("./bootstrap");
const { sendJson, notFound, parseBody, parseMultipartForm, parseRequestUrl, matchPath, sendFile } = require("./lib/http");

const container = createContainer();
const companyId = container.config.companyId;

function withErrorHandling(handler) {
  return async (req, res, params) => {
    try {
      await handler(req, res, params);
    } catch (error) {
      sendJson(res, 400, {
        error: error.message || "Unexpected error"
      });
    }
  };
}

const routes = [
  {
    method: "GET",
    path: "/app",
    handler: withErrorHandling(async (_req, res) => {
      sendFile(res, path.join(container.config.frontendPublicDir, "index.html"));
    })
  },
  {
    method: "GET",
    path: "/app/:asset",
    handler: withErrorHandling(async (_req, res, params) => {
      sendFile(res, path.join(container.config.frontendPublicDir, params.asset));
    })
  },
  {
    method: "GET",
    path: "/health",
    handler: withErrorHandling(async (_req, res) => {
      sendJson(res, 200, {
        status: "ok",
        service: "sistemadeinventario-backend",
        companyId
      });
    })
  },
  {
    method: "GET",
    path: "/api/v2/inventario/dashboard",
    handler: withErrorHandling(async (_req, res) => {
      sendJson(res, 200, container.inventoryService.dashboard(companyId));
    })
  },
  {
    method: "GET",
    path: "/api/v2/inventario/catalogo/certificados",
    handler: withErrorHandling(async (_req, res) => {
      sendJson(res, 200, container.inventoryService.getCertificateCatalog());
    })
  },
  {
    method: "GET",
    path: "/api/v2/inventario-certificados",
    handler: withErrorHandling(async (_req, res) => {
      sendJson(res, 200, container.inventoryService.listCertificates(companyId));
    })
  },
  {
    method: "POST",
    path: "/api/v2/inventario-certificados/analisar-upload",
    handler: withErrorHandling(async (req, res) => {
      const body = await parseBody(req);
      sendJson(res, 200, container.certificateImportService.analyzeUpload(body));
    })
  },
  {
    method: "POST",
    path: "/api/v2/inventario-certificados/importar-upload",
    handler: withErrorHandling(async (req, res) => {
      const body = await parseBody(req);
      sendJson(res, 201, container.certificateImportService.importUpload(companyId, body));
    })
  },
  {
    method: "POST",
    path: "/api/v2/inventario-certificados/upload-multipart",
    handler: withErrorHandling(async (req, res) => {
      const form = await parseMultipartForm(req);
      const file = form.files.file;

      if (!file) {
        sendJson(res, 400, { error: "Field 'file' is required" });
        return;
      }

      const payload = {
        filename: file.filename,
        contentBase64: file.base64,
        name: form.fields.name || "",
        source: form.fields.source || "EXTERNO",
        rootCode: form.fields.rootCode || "",
        familyCode: form.fields.familyCode || "",
        typeCode: form.fields.typeCode || "",
        coverageType: form.fields.coverageType || "IDENTIFICACAO",
        domainPrimary: form.fields.domainPrimary || ""
      };

      const mode = (form.fields.mode || "analyze").toLowerCase();

      if (mode === "import") {
        sendJson(res, 201, container.certificateImportService.importUpload(companyId, payload));
        return;
      }

      sendJson(res, 200, container.certificateImportService.analyzeUpload(payload));
    })
  },
  {
    method: "POST",
    path: "/api/v2/inventario-certificados",
    handler: withErrorHandling(async (req, res) => {
      const body = await parseBody(req);
      sendJson(res, 201, container.inventoryService.createCertificate(companyId, body));
    })
  },
  {
    method: "GET",
    path: "/api/v2/inventario-certificados/:id",
    handler: withErrorHandling(async (_req, res, params) => {
      const item = container.inventoryService.getCertificate(companyId, params.id);
      if (!item) {
        notFound(res);
        return;
      }
      sendJson(res, 200, item);
    })
  },
  {
    method: "PUT",
    path: "/api/v2/inventario-certificados/:id",
    handler: withErrorHandling(async (req, res, params) => {
      const body = await parseBody(req);
      const item = container.inventoryService.updateCertificate(companyId, params.id, body);
      if (!item) {
        notFound(res);
        return;
      }
      sendJson(res, 200, item);
    })
  },
  {
    method: "GET",
    path: "/api/v2/inventario-endpoints",
    handler: withErrorHandling(async (_req, res) => {
      sendJson(res, 200, container.inventoryService.listEndpoints(companyId));
    })
  },
  {
    method: "POST",
    path: "/api/v2/inventario-endpoints",
    handler: withErrorHandling(async (req, res) => {
      const body = await parseBody(req);
      sendJson(res, 201, container.inventoryService.createEndpoint(companyId, body));
    })
  },
  {
    method: "GET",
    path: "/api/v2/inventario-endpoints/:id",
    handler: withErrorHandling(async (_req, res, params) => {
      const item = container.inventoryService.getEndpoint(companyId, params.id);
      if (!item) {
        notFound(res);
        return;
      }
      sendJson(res, 200, item);
    })
  },
  {
    method: "PUT",
    path: "/api/v2/inventario-endpoints/:id",
    handler: withErrorHandling(async (req, res, params) => {
      const body = await parseBody(req);
      const item = container.inventoryService.updateEndpoint(companyId, params.id, body);
      if (!item) {
        notFound(res);
        return;
      }
      sendJson(res, 200, item);
    })
  },
  {
    method: "POST",
    path: "/api/v2/inventario/discovery/domain",
    handler: withErrorHandling(async (req, res) => {
      const body = await parseBody(req);
      const job = container.orchestratorService.createJob(companyId, {
        type: "DISCOVER_PUBLIC_DOMAIN",
        zone: "EXTERNAL",
        target: body.domain
      });
      const discovery = container.orchestratorService.registerDiscoveryResult(companyId, {
        source: "api-manual-discovery",
        scope: body.domain,
        zone: "EXTERNAL",
        items: body.items || []
      });

      sendJson(res, 200, { job, discovery });
    })
  },
  {
    method: "POST",
    path: "/api/v2/inventario/discovery/endpoint",
    handler: withErrorHandling(async (req, res) => {
      const body = await parseBody(req);
      const job = container.orchestratorService.createJob(companyId, {
        type: "DISCOVER_ENDPOINT",
        zone: body.zone || "EXTERNAL",
        target: body.host
      });
      sendJson(res, 200, { job });
    })
  },
  {
    method: "GET",
    path: "/api/v2/inventario/certificados/:id/cobertura",
    handler: withErrorHandling(async (_req, res, params) => {
      const response = container.coverageService.getCertificateCoverage(companyId, params.id);
      if (!response) {
        notFound(res);
        return;
      }
      sendJson(res, 200, response);
    })
  },
  {
    method: "GET",
    path: "/api/v2/inventario/dominio/cobertura",
    handler: withErrorHandling(async (req, res) => {
      const url = parseRequestUrl(req);
      const domain = url.searchParams.get("dominio") || url.searchParams.get("domain") || "";
      sendJson(res, 200, container.coverageService.getDomainCoverage(companyId, domain));
    })
  },
  {
    method: "POST",
    path: "/api/v2/inventario/endpoints/:id/recomendar-acao",
    handler: withErrorHandling(async (_req, res, params) => {
      const response = container.acmeService.recommendForEndpoint(companyId, params.id);
      if (!response) {
        notFound(res);
        return;
      }
      sendJson(res, 200, response);
    })
  },
  {
    method: "POST",
    path: "/api/v2/inventario/endpoints/:id/preparar-agente",
    handler: withErrorHandling(async (_req, res, params) => {
      const response = container.acmeService.prepareAgent(companyId, params.id);
      if (!response) {
        notFound(res);
        return;
      }
      sendJson(res, 200, response);
    })
  },
  {
    method: "GET",
    path: "/api/v2/inventario/implantacao/fila",
    handler: withErrorHandling(async (_req, res) => {
      sendJson(res, 200, container.orchestratorService.listDeploymentQueue(companyId));
    })
  },
  {
    method: "PATCH",
    path: "/api/v2/inventario/implantacao/:id/status",
    handler: withErrorHandling(async (req, res, params) => {
      const body = await parseBody(req);
      const item = container.orchestratorService.updateDeploymentStatus(companyId, params.id, body.status);
      if (!item) {
        notFound(res);
        return;
      }
      sendJson(res, 200, item);
    })
  },
  {
    method: "GET",
    path: "/api/v2/inventario/jobs",
    handler: withErrorHandling(async (_req, res) => {
      sendJson(res, 200, container.orchestratorService.listJobs(companyId));
    })
  },
  {
    method: "POST",
    path: "/api/v2/agents/register",
    handler: withErrorHandling(async (req, res) => {
      const body = await parseBody(req);
      const agent = container.agentService.registerAgent(companyId, body);
      sendJson(res, 201, {
        id: agent.id,
        companyId: agent.companyId,
        name: agent.name,
        zone: agent.zone,
        type: agent.type,
        supportsAcme: agent.supportsAcme,
        allowedJobTypes: agent.allowedJobTypes,
        allowedZones: agent.allowedZones,
        token: agent.token
      });
    })
  },
  {
    method: "POST",
    path: "/api/v2/agents/heartbeat",
    handler: withErrorHandling(async (req, res) => {
      const body = await parseBody(req);
      const agent = container.agentService.authenticateAgent(body.token);
      if (!agent) {
        sendJson(res, 401, { error: "Agent token invalid" });
        return;
      }
      sendJson(res, 200, {
        agent: container.agentService.heartbeat(agent.id, body),
        policy: {
          allowedJobTypes: agent.allowedJobTypes,
          allowedZones: agent.allowedZones
        }
      });
    })
  },
  {
    method: "POST",
    path: "/api/v2/agents/poll",
    handler: withErrorHandling(async (req, res) => {
      const body = await parseBody(req);
      const agent = container.agentService.authenticateAgent(body.token);
      if (!agent) {
        sendJson(res, 401, { error: "Agent token invalid" });
        return;
      }
      sendJson(res, 200, container.agentService.poll(agent.id));
    })
  },
  {
    method: "POST",
    path: "/api/v2/agents/jobs/:id/report",
    handler: withErrorHandling(async (req, res, params) => {
      const body = await parseBody(req);
      const agent = container.agentService.authenticateAgent(body.token);
      if (!agent) {
        sendJson(res, 401, { error: "Agent token invalid" });
        return;
      }
      const item = container.agentService.reportJob(agent.id, params.id, body);
      if (!item) {
        notFound(res);
        return;
      }
      sendJson(res, 200, item);
    })
  }
];

async function requestHandler(req, res) {
  const url = parseRequestUrl(req);
  if (req.method === "GET" && url.pathname === "/") {
    sendFile(res, path.join(container.config.frontendPublicDir, "index.html"));
    return;
  }
  const route = routes.find((item) => item.method === req.method && matchPath(url.pathname, item.path));

  if (!route) {
    notFound(res);
    return;
  }

  const params = matchPath(url.pathname, route.path);
  await route.handler(req, res, params);
}

function startServer() {
  const server = http.createServer((req, res) => {
    requestHandler(req, res);
  });

  server.listen(container.config.port, () => {
    console.log(`Inventory backend listening on port ${container.config.port}`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
  container
};
