const path = require("path");

const rootDir = path.resolve(__dirname, "..");

module.exports = {
  port: Number(process.env.PORT || 4010),
  dataFile: process.env.INVENTARIO_DATA_FILE || path.join(rootDir, "data", "inventory-db.json"),
  apiToken: process.env.INVENTARIO_API_TOKEN || "local-inventory-token",
  jobSigningSecret: process.env.INVENTARIO_JOB_SIGNING_SECRET || "local-job-signing-secret",
  notificationWebhook: process.env.INVENTARIO_NOTIFICATION_WEBHOOK || "",
  companyId: process.env.INVENTARIO_COMPANY_ID || "atlas-demo-company"
};
