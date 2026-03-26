const readRuntimeConfig = () => {
  if (typeof window === "undefined") {
    return {};
  }

  return window.__APP_CONFIG__ ?? {};
};

const parseBooleanFlag = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
};

export const isMaintenanceModeEnabled = () => {
  const runtimeConfig = readRuntimeConfig();

  return (
    parseBooleanFlag(runtimeConfig.MAINTENANCE_MODE) ||
    parseBooleanFlag(runtimeConfig.MAINTENANCE_ENABLED) ||
    parseBooleanFlag(runtimeConfig.ENABLE_MAINTENANCE_PAGE) ||
    parseBooleanFlag(import.meta.env?.VITE_MAINTENANCE_MODE)
  );
};

export const getRuntimeConfig = () => readRuntimeConfig();
