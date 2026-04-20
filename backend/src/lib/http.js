const fs = require("fs");
const path = require("path");
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

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

async function parseMultipartForm(req) {
  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

  if (!boundaryMatch) {
    throw new Error("Multipart boundary not provided");
  }

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const rawBuffer = await readRawBody(req);
  const raw = rawBuffer.toString("latin1");
  const delimiter = `--${boundary}`;
  const parts = raw.split(delimiter).slice(1, -1);
  const fields = {};
  const files = {};

  for (const part of parts) {
    const trimmed = part.replace(/^\r\n/, "");
    const separatorIndex = trimmed.indexOf("\r\n\r\n");

    if (separatorIndex < 0) {
      continue;
    }

    const headerBlock = trimmed.slice(0, separatorIndex);
    let bodyBlock = trimmed.slice(separatorIndex + 4);
    bodyBlock = bodyBlock.replace(/\r\n$/, "");
    const headers = headerBlock.split("\r\n");
    const disposition = headers.find((item) => item.toLowerCase().startsWith("content-disposition:")) || "";
    const nameMatch = disposition.match(/name="([^"]+)"/i);

    if (!nameMatch) {
      continue;
    }

    const fieldName = nameMatch[1];
    const filenameMatch = disposition.match(/filename="([^"]*)"/i);

    if (filenameMatch) {
      const filename = filenameMatch[1];
      const contentTypeHeader = headers.find((item) => item.toLowerCase().startsWith("content-type:")) || "";
      const fileBuffer = Buffer.from(bodyBlock, "latin1");
      files[fieldName] = {
        filename,
        contentType: contentTypeHeader.split(":")[1] ? contentTypeHeader.split(":")[1].trim() : "application/octet-stream",
        buffer: fileBuffer,
        size: fileBuffer.length,
        base64: fileBuffer.toString("base64")
      };
    } else {
      fields[fieldName] = bodyBlock;
    }
  }

  return {
    fields,
    files
  };
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

function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function sendFile(res, filePath) {
  if (!fs.existsSync(filePath)) {
    notFound(res);
    return;
  }

  const body = fs.readFileSync(filePath);
  res.writeHead(200, {
    "Content-Type": getMimeType(filePath),
    "Content-Length": body.length
  });
  res.end(body);
}

module.exports = {
  sendJson,
  notFound,
  parseBody,
  parseMultipartForm,
  parseRequestUrl,
  matchPath,
  sendFile
};
