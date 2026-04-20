const crypto = require("crypto");

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }

  return JSON.stringify(value);
}

function signJob(job, secret) {
  const payload = {
    id: job.id,
    companyId: job.companyId,
    type: job.type,
    zone: job.zone,
    target: job.target,
    assignedAgentId: job.assignedAgentId || null,
    nonce: job.nonce
  };

  return crypto
    .createHmac("sha256", secret)
    .update(stableStringify(payload))
    .digest("hex");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

module.exports = {
  signJob,
  safeEqual
};
