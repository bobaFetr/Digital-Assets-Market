import { getRuntimeConfig } from "./runtimeConfig";

const runtimeConfig = getRuntimeConfig();
const runtimeBase = runtimeConfig.API_BASE_URL ?? runtimeConfig.VITE_API_BASE;
const envBase = import.meta.env?.VITE_API_BASE;
const rawBase = runtimeBase || envBase || "";
let API_BASE = String(rawBase).trim().replace(/\/+$/, "");

export const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
};

export { API_BASE };
