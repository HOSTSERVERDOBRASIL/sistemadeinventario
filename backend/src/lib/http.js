const { URL } = require("url");

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

function parseRequestUrl(req) {
  return new URL(req.url, "http://localhost");
}

function matchPath(pathname, template) {
  const actual = pathname.split("/").filter(Boolean);
  const expected = template.split("/").filter(Boolean);

  if (actual.length !== expected.length) {
    return null;
  }

  const params = {};

  for (let index = 0; index < expected.length; index += 1) {
    const routePart = expected[index];
    const pathPart = actual[index];

    if (routePart.startsWith(":")) {
      params[routePart.slice(1)] = decodeURIComponent(pathPart);
      continue;
    }

    if (routePart !== pathPart) {
      return null;
    }
  }

  return params;
}

module.exports = {
  sendJson,
  notFound,
  parseBody,
  parseRequestUrl,
  matchPath
};
