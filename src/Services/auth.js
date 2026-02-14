const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5149";
const TOKEN_COOKIE = "dam_token";

const setCookie = (name, value, days = 1) => {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`; 
};

const getCookie = (name) => {
  const prefix = `${name}=`;
  const cookies = document.cookie.split("; ").filter(Boolean);
  const match = cookies.find((cookie) => cookie.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : "";
};

const clearCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

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

export const loginUser = async (payload, remember = false) => {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!data?.token) {
    throw new Error("No token returned by server");
  }

  setCookie(TOKEN_COOKIE, data.token, remember ? 7 : 1);
  return data.token;
};

export const getProfile = () => {
  const token = getCookie(TOKEN_COOKIE);
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
  clearCookie(TOKEN_COOKIE);
};

export const getToken = () => getCookie(TOKEN_COOKIE);

export const getKycStatus = () => {
  const token = getCookie(TOKEN_COOKIE);
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
  const token = getCookie(TOKEN_COOKIE);
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
