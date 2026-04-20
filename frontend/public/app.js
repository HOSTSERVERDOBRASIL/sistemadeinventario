async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Falha na operação");
  }

  return data;
}

function renderCatalog(rootData) {
  const container = document.getElementById("catalog");
  const rootCount = rootData.roots.length;
  const typeCount = rootData.roots.reduce((total, root) => total + root.families.reduce((sum, family) => sum + family.types.length, 0), 0);

  document.getElementById("catalogRoots").textContent = String(rootCount);
  document.getElementById("catalogTypes").textContent = String(typeCount);

  container.innerHTML = rootData.roots
    .map((root) => `
      <section class="catalog-root">
        <h3>${root.label}</h3>
        ${root.families.map((family) => `
          <details class="catalog-family" open>
            <summary>${family.label}</summary>
            <ul>
              ${family.types.map((type) => `
                <li>
                  <strong>${type.label}</strong>
                  <span>${type.description}</span>
                </li>
              `).join("")}
            </ul>
          </details>
        `).join("")}
      </section>
    `)
    .join("");
}

async function loadCatalog() {
  const data = await fetchJson("/api/v2/inventario/catalogo/certificados");
  renderCatalog(data);
}

function printResult(payload) {
  document.getElementById("result").textContent = JSON.stringify(payload, null, 2);
}

async function handleUpload(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);

  try {
    printResult({ status: "processing" });
    const data = await fetchJson("/api/v2/inventario-certificados/upload-multipart", {
      method: "POST",
      body: formData
    });
    printResult(data);
  } catch (error) {
    printResult({ error: error.message });
  }
}

document.getElementById("uploadForm").addEventListener("submit", handleUpload);
loadCatalog().catch((error) => {
  printResult({ error: error.message });
});
