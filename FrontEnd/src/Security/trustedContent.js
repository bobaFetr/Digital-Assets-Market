const SAFE_DATA_IMAGE_PATTERN = /^data:image\/(png|jpe?g|gif|webp);base64,/i;
const SAFE_UPLOAD_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]);

export const isSafeImageSource = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (SAFE_DATA_IMAGE_PATTERN.test(trimmed)) {
    return true;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return true;
  }

  return trimmed.startsWith("/");
};

export const resolveTrustedImageUrl = (value, fallback, buildUrl) => {
  if (!isSafeImageSource(value)) {
    return fallback;
  }

  if (value.startsWith("/")) {
    return buildUrl(value);
  }

  return value;
};

export const isSafeUploadImageType = (value) => SAFE_UPLOAD_IMAGE_TYPES.has(String(value || "").toLowerCase());
