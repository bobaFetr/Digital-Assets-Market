import { getRuntimeConfig } from "./runtimeConfig";

const runtimeConfig = getRuntimeConfig();
const hasRuntimeApiBase =
  Object.prototype.hasOwnProperty.call(runtimeConfig, "API_BASE_URL") &&
  String(runtimeConfig.API_BASE_URL ?? "").trim().length > 0;
const runtimeBase = hasRuntimeApiBase
  ? runtimeConfig.API_BASE_URL
  : (runtimeConfig.VITE_API_BASE ?? undefined);
const envBase = import.meta.env?.VITE_API_BASE;
const rawBase = hasRuntimeApiBase ? runtimeBase : (envBase || "");
let API_BASE = String(rawBase).trim().replace(/\/+$/, "");

export const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
};

export { API_BASE };
