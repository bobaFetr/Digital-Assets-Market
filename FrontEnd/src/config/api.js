// Centralized API base helper
const rawBase = import.meta.env?.VITE_API_BASE ?? "";
let API_BASE = String(rawBase || "").trim();
// remove trailing slashes
API_BASE = API_BASE.replace(/\/+$/g, "");
// In development, fall back to localhost backend for easier local work
if (!API_BASE && import.meta.env?.MODE === "development") {
  API_BASE = "http://localhost:5149";
}

export function getApiBase() {
  return API_BASE;
}

export function buildUrl(path) {
  const p = path ? String(path) : "";
  // ensure single leading slash
  const safePath = p.startsWith("/") ? p : `/${p}`;
  if (API_BASE) {
    return `${API_BASE}${safePath}`.replace(/([^:])\/\/+/, "$1/");
  }
  // if no API_BASE (production misconfig), return the path so caller can see the error
  return safePath;
}

export default {
  getApiBase,
  buildUrl,
};
