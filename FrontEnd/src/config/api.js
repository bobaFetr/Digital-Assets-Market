const rawBase = import.meta.env?.VITE_API_BASE ?? "";
let API_BASE = String(rawBase).trim().replace(/\/+$/, "");

export const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
};

export { API_BASE };
