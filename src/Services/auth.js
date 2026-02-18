const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5149";
const TOKEN_STORAGE_KEY = "dam_token";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    const details = message ? `: ${message}` : "";
    throw new Error(`Request failed (${response.status})${details}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const registerUser = (payload) =>
  request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = async (payload, _remember = false) => {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!data?.token) {
    throw new Error("No token returned by server");
  }

  sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);

  return data.token;
};

export const getProfile = () => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }

  return request("/api/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const logoutUser = () => {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const getToken = () => {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY) || "";
};

export const getKycStatus = () => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }

  return request("/api/kyc-documents/status", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const submitKycVerification = (payload) => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }

  return request("/api/kyc-documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const forgotPassword = (email) =>
  request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (token, newPassword) =>
  request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
