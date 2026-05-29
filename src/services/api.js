const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

async function upload(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return data;
}

export const api = {

  uploadVideo: (formData) => upload("/upload-video", formData),
  uploadProductsCsv: (formData) => upload("/upload-products-csv", formData),
  uploadCompetitorCsv: (formData) => upload("/competitor-prices/upload", formData),

  listJobs: () => request("/jobs"),
  getJob: (id) => request(`/jobs/${id}`),

  listProducts: (query = "") => request(`/products${query}`),
  getProduct: (skuId) => request(`/products/${skuId}`),
  updateProduct: (skuId, body) => request(`/products/${skuId}`, { method: "PUT", body: JSON.stringify(body) }),
  getProductIssues: (skuId) => request(`/products/${skuId}/issues`),
  enhanceTitle: (skuId) => request(`/products/${skuId}/enhance-title`, { method: "POST" }),
  getCompetitorPrices: (skuId) => request(`/products/${skuId}/competitor-prices`),

  getSummary: () => request("/dashboard/summary"),

  refreshPrices: (skuId) => request(`/competitor-prices/refresh${skuId ? `?skuId=${skuId}` : ""}`, { method: "POST" }),

  listAlerts: (severity = "") => request(`/alerts${severity ? `?severity=${severity}` : ""}`),
};
