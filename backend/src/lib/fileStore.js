const fs = require("fs");
const path = require("path");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(filePath, fallback) {
  ensureDir(filePath);

  if (!fs.existsSync(filePath)) {
    writeJson(filePath, fallback);
    return structuredClone(fallback);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  return raw.trim() ? JSON.parse(raw) : structuredClone(fallback);
}

function writeJson(filePath, data) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  readJson,
  writeJson
};
