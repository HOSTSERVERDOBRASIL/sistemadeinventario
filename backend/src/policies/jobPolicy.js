const ZONE_ACCESS = {
  EXTERNAL_DISCOVERY_AGENT: ["EXTERNAL", "DMZ"],
  ACME_INTERNAL_AGENT: ["INTERNAL", "RESTRICTED", "DMZ"],
  INVENTORY_SENSOR: ["EXTERNAL", "DMZ", "INTERNAL", "RESTRICTED", "BANKING", "GOV"]
};

const JOB_WHITELIST = {
  EXTERNAL_DISCOVERY_AGENT: [
    "DISCOVER_PUBLIC_DOMAIN",
    "DISCOVER_ENDPOINT",
    "CHECK_CERTIFICATE_COVERAGE",
    "INSTALL_EXTERNAL_ACME_AGENT"
  ],
  ACME_INTERNAL_AGENT: [
    "DISCOVER_INTERNAL_HOSTS",
    "COLLECT_INSTALLED_CERTIFICATES",
    "COLLECT_WEB_SERVER_BINDINGS",
    "CHECK_CERTIFICATE_COVERAGE",
    "INSTALL_INTERNAL_ACME_AGENT"
  ],
  INVENTORY_SENSOR: [
    "DISCOVER_PUBLIC_DOMAIN",
    "DISCOVER_ENDPOINT",
    "DISCOVER_INTERNAL_HOSTS",
    "COLLECT_INSTALLED_CERTIFICATES",
    "COLLECT_WEB_SERVER_BINDINGS",
    "CHECK_CERTIFICATE_COVERAGE"
  ]
};

function getAllowedZones(agentType) {
  return ZONE_ACCESS[agentType] || [];
}

function getAllowedJobTypes(agentType) {
  return JOB_WHITELIST[agentType] || [];
}

function isZoneAllowed(agent, zone) {
  const allowedZones = getAllowedZones(agent.type);

  if (!allowedZones.length) {
    return false;
  }

  return allowedZones.includes(zone);
}

function isJobAllowed(agent, job) {
  const allowedJobs = getAllowedJobTypes(agent.type);

  if (!allowedJobs.includes(job.type)) {
    return false;
  }

  if (!(job.zone === "ANY" || isZoneAllowed(agent, job.zone))) {
    return false;
  }

  return true;
}

module.exports = {
  getAllowedZones,
  getAllowedJobTypes,
  isZoneAllowed,
  isJobAllowed
};
