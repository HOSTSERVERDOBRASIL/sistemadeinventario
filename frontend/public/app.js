const state = {
  catalog: null,
  selectedFile: null,
  selectedFileBase64: null,
  analysis: null,
  certificates: []
};

const elements = {
  catalog: document.getElementById("catalog"),
  catalogRoots: document.getElementById("catalogRoots"),
  catalogTypes: document.getElementById("catalogTypes"),
  importedCount: document.getElementById("importedCount"),
  uploadForm: document.getElementById("uploadForm"),
  importButton: document.getElementById("importButton"),
  fileInput: document.getElementById("fileInput"),
  nameInput: document.getElementById("nameInput"),
  sourceInput: document.getElementById("sourceInput"),
  coverageTypeInput: document.getElementById("coverageTypeInput"),
  domainPrimaryInput: document.getElementById("domainPrimaryInput"),
  dropzone: document.getElementById("dropzone"),
  dropzoneTitle: document.getElementById("dropzoneTitle"),
  analysisCard: document.getElementById("analysisCard"),
  analysisSummary: document.getElementById("analysisSummary"),
  analysisBadge: document.getElementById("analysisBadge"),
  rootSelect: document.getElementById("rootSelect"),
  familySelect: document.getElementById("familySelect"),
  typeSelect: document.getElementById("typeSelect"),
  analysisMeta: document.getElementById("analysisMeta"),
  analysisNotes: document.getElementById("analysisNotes"),
  certificateList: document.getElementById("certificateList")
};

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Falha na operacao");
  }

  return data;
}

function rootByCode(rootCode) {
  return state.catalog.roots.find((item) => item.code === rootCode) || null;
}

function familyByCode(rootCode, familyCode) {
  const root = rootByCode(rootCode);
  return root ? root.families.find((item) => item.code === familyCode) || null : null;
}

function renderMetrics() {
  if (!state.catalog) {
    return;
  }

  const rootCount = state.catalog.roots.length;
  const typeCount = state.catalog.roots.reduce(
    (total, root) => total + root.families.reduce((sum, family) => sum + family.types.length, 0),
    0
  );

  elements.catalogRoots.textContent = String(rootCount);
  elements.catalogTypes.textContent = String(typeCount);
  elements.importedCount.textContent = String(state.certificates.length);
}

function renderCatalog() {
  elements.catalog.innerHTML = state.catalog.roots
    .map(
      (root) => `
        <details class="catalog-root" open>
          <summary>${root.label}</summary>
          <div class="catalog-body">
            ${root.families
              .map(
                (family) => `
                  <details class="catalog-family" open>
                    <summary>${family.label}</summary>
                    <div class="catalog-cards">
                      ${family.types
                        .map(
                          (type) => `
                            <article class="type-card">
                              <div class="type-flag">A1</div>
                              <div>
                                <h4>${type.label}</h4>
                                <p>${type.description}</p>
                              </div>
                            </article>
                          `
                        )
                        .join("")}
                    </div>
                  </details>
                `
              )
              .join("")}
          </div>
        </details>
      `
    )
    .join("");
}

function populateRootSelect(selectedRootCode) {
  elements.rootSelect.innerHTML = state.catalog.roots
    .map((root) => `<option value="${root.code}" ${root.code === selectedRootCode ? "selected" : ""}>${root.label}</option>`)
    .join("");
}

function populateFamilySelect(selectedRootCode, selectedFamilyCode) {
  const root = rootByCode(selectedRootCode);
  elements.familySelect.innerHTML = (root ? root.families : [])
    .map(
      (family) =>
        `<option value="${family.code}" ${family.code === selectedFamilyCode ? "selected" : ""}>${family.label}</option>`
    )
    .join("");
}

function populateTypeSelect(selectedRootCode, selectedFamilyCode, selectedTypeCode) {
  const family = familyByCode(selectedRootCode, selectedFamilyCode);
  elements.typeSelect.innerHTML = (family ? family.types : [])
    .map((type) => `<option value="${type.code}" ${type.code === selectedTypeCode ? "selected" : ""}>${type.label}</option>`)
    .join("");
}

function syncTaxonomySelects(rootCode, familyCode, typeCode) {
  populateRootSelect(rootCode);
  populateFamilySelect(rootCode, familyCode);
  populateTypeSelect(rootCode, familyCode, typeCode);
}

function renderAnalysis() {
  if (!state.analysis) {
    elements.analysisCard.classList.add("hidden");
    elements.importButton.disabled = true;
    return;
  }

  const { upload, suggestedTaxonomy } = state.analysis;
  elements.analysisCard.classList.remove("hidden");
  elements.importButton.disabled = false;
  elements.analysisSummary.textContent = `${upload.filename} reconhecido como ${upload.detectedFormat}`;
  elements.analysisBadge.textContent = upload.recognized ? "reconhecido" : "revisar";
  elements.analysisBadge.className = `badge ${upload.recognized ? "badge-ok" : "badge-warn"}`;

  syncTaxonomySelects(suggestedTaxonomy.rootCode, suggestedTaxonomy.familyCode, suggestedTaxonomy.typeCode);

  const metaItems = [
    ["Assunto", upload.subject || "-"],
    ["Emissor", upload.issuer || "-"],
    ["Valido de", upload.validFrom || "-"],
    ["Valido ate", upload.validTo || "-"],
    ["Formato", upload.detectedFormat || "-"],
    ["Fingerprint", upload.fingerprint256 || "-"]
  ];

  elements.analysisMeta.innerHTML = metaItems
    .map(
      ([label, value]) => `
        <article class="meta-item">
          <small>${label}</small>
          <strong>${value}</strong>
        </article>
      `
    )
    .join("");

  elements.analysisNotes.innerHTML = (upload.notes || []).length
    ? upload.notes.map((note) => `<p>${note}</p>`).join("")
    : "<p>Nenhuma observacao adicional.</p>";
}

function renderCertificates() {
  if (!state.certificates.length) {
    elements.certificateList.innerHTML = `<div class="empty-state">Nenhum certificado importado ainda.</div>`;
    renderMetrics();
    return;
  }

  elements.certificateList.innerHTML = state.certificates
    .map(
      (certificate) => `
        <article class="certificate-item">
          <div>
            <h3>${certificate.name}</h3>
            <p>${certificate.rootLabel} / ${certificate.familyLabel} / ${certificate.typeLabel}</p>
          </div>
          <div class="certificate-meta">
            <span>${certificate.source}</span>
            <span>${certificate.issuer}</span>
          </div>
        </article>
      `
    )
    .join("");

  renderMetrics();
}

async function loadCertificates() {
  state.certificates = await fetchJson("/api/v2/inventario-certificados");
  renderCertificates();
}

async function loadCatalog() {
  state.catalog = await fetchJson("/api/v2/inventario/catalogo/certificados");
  renderCatalog();
  renderMetrics();
}

function setSelectedFile(file) {
  state.selectedFile = file;
  elements.dropzoneTitle.textContent = file ? file.name : "Arraste o arquivo aqui";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function analyzeFile() {
  const formData = new FormData();
  formData.append("mode", "analyze");
  formData.append("file", state.selectedFile);
  formData.append("name", elements.nameInput.value);
  formData.append("source", elements.sourceInput.value);
  formData.append("coverageType", elements.coverageTypeInput.value);
  formData.append("domainPrimary", elements.domainPrimaryInput.value);

  state.analysis = await fetchJson("/api/v2/inventario-certificados/upload-multipart", {
    method: "POST",
    body: formData
  });

  state.selectedFileBase64 = await fileToBase64(state.selectedFile);
  renderAnalysis();
}

async function importCertificate() {
  if (!state.analysis || !state.selectedFileBase64 || !state.selectedFile) {
    return;
  }

  const payload = {
    filename: state.selectedFile.name,
    contentBase64: state.selectedFileBase64,
    name: elements.nameInput.value || state.analysis.importPreview.name,
    source: elements.sourceInput.value,
    coverageType: elements.coverageTypeInput.value,
    domainPrimary: elements.domainPrimaryInput.value,
    rootCode: elements.rootSelect.value,
    familyCode: elements.familySelect.value,
    typeCode: elements.typeSelect.value
  };

  await fetchJson("/api/v2/inventario-certificados/importar-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  await loadCertificates();
}

function wireDropzone() {
  const preventDefaults = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    elements.dropzone.addEventListener(eventName, preventDefaults);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.dropzone.addEventListener(eventName, () => elements.dropzone.classList.add("dropzone-active"));
  });

  ["dragleave", "drop"].forEach((eventName) => {
    elements.dropzone.addEventListener(eventName, () => elements.dropzone.classList.remove("dropzone-active"));
  });

  elements.dropzone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer.files;
    if (!file) {
      return;
    }
    elements.fileInput.files = event.dataTransfer.files;
    setSelectedFile(file);
  });

  elements.fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    setSelectedFile(file || null);
  });
}

function wireTaxonomy() {
  elements.rootSelect.addEventListener("change", () => {
    const root = rootByCode(elements.rootSelect.value);
    const family = root && root.families.length ? root.families[0] : null;
    const type = family && family.types.length ? family.types[0] : null;
    syncTaxonomySelects(elements.rootSelect.value, family ? family.code : "", type ? type.code : "");
  });

  elements.familySelect.addEventListener("change", () => {
    const family = familyByCode(elements.rootSelect.value, elements.familySelect.value);
    const type = family && family.types.length ? family.types[0] : null;
    populateTypeSelect(elements.rootSelect.value, elements.familySelect.value, type ? type.code : "");
  });
}

async function handleAnalyze(event) {
  event.preventDefault();

  if (!elements.fileInput.files.length) {
    return;
  }

  setSelectedFile(elements.fileInput.files[0]);
  await analyzeFile();
}

async function boot() {
  wireDropzone();
  wireTaxonomy();
  elements.uploadForm.addEventListener("submit", handleAnalyze);
  elements.importButton.addEventListener("click", importCertificate);
  await loadCatalog();
  await loadCertificates();
}

boot().catch((error) => {
  elements.certificateList.innerHTML = `<div class="empty-state">Erro ao carregar interface: ${error.message}</div>`;
});
