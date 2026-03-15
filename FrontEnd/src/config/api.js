const rawBase = import.meta.env?.VITE_API_BASE ?? "";
let API_BASE = String(rawBase).trim().replace(/\/+$/, "");

if (!API_BASE && import.meta.env.DEV) {
  API_BASE = "http://localhost:5149";
}

export const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
};

console.log("VITE_API_BASE =", import.meta.env.VITE_API_BASE);
console.log("API_BASE =", API_BASE);
console.log("Register URL =", buildUrl("/api/auth/register"));
export { API_BASE };