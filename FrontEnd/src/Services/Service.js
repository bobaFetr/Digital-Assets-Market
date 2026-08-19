import { buildUrl } from "../config/api";
const TOKEN_STORAGE_KEY = "dam_token";
const AUTH_BLOCKED_EVENT = "auth:blocked";
const AUTH_STATE_CHANGED_EVENT = "auth:changed";
let cookieSessionActive = false;
const notifyAuthStateChanged = reason => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED_EVENT, {
    detail: {
      reason
    }
  }));
};
const clearStoredToken = (reason = "logout") => {
  cookieSessionActive = false;
  if (typeof document !== "undefined") {
    document.cookie = "dam_auth=; Max-Age=0; Path=/; SameSite=Lax";
    document.cookie = "dam_role=; Max-Age=0; Path=/; SameSite=Lax";
  }
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
  notifyAuthStateChanged(reason);
};
const notifyBlockedAuth = reason => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(AUTH_BLOCKED_EVENT, {
    detail: {
      reason
    }
  }));
};
const request = async (path, options = {}) => {
  const headers = {
    ...(options.headers || {})
  };
  // Legacy screens may still supply a Bearer header; cookie authentication never sends it.
  delete headers.Authorization;
  delete headers.authorization;
  if (options.body != null) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  const url = buildUrl(path);
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers
  });
  if (!response.ok) {
    let errDetail;
    const contentType = response.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/json")) {
        const json = await response.json();
        if (typeof json === "string") {
          errDetail = json;
        } else if (json?.message) {
          errDetail = json.message;
        } else if (json?.title) {
          errDetail = json.title;
        } else if (json?.detail) {
          errDetail = json.detail;
        } else if (json?.errors) {
          errDetail = Object.values(json.errors).flat().join(" ");
        } else {
          errDetail = JSON.stringify(json);
        }
      } else {
        errDetail = await response.text();
      }
    } catch {
      errDetail = "";
    }
    const isBlockedUser = response.status === 403 && typeof errDetail === "string" && /user is banned/i.test(errDetail);
    const isUnauthorized = response.status === 401;
    if (isBlockedUser) {
      clearStoredToken("banned");
      notifyBlockedAuth("banned");
    } else if (isUnauthorized) {
      clearStoredToken("unauthorized");
    }
    const details = errDetail ? `: ${errDetail}` : "";
    const error = new Error(`(${response.status})${details}`);
    error.status = response.status;
    error.authBlocked = isBlockedUser;
    error.authInvalid = isUnauthorized;
    throw error;
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};
export const registerUser = payload => request("/api/auth/register", {
  method: "POST",
  body: JSON.stringify(payload)
});
export const loginUser = async (payload, remember = false) => {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ ...payload, rememberMe: remember })
  });
  if (!data?.authenticated) {
    throw new Error("The server did not create an authenticated session");
  }
  cookieSessionActive = true;
  notifyAuthStateChanged("login");
  return data;
};
export const createDefaultWallets = payload => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('Not authenticated'));
  return request('/api/wallets/ensure-default', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};
export const getBankAccounts = () => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('Not authenticated'));
  return request('/api/bank-accounts', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
export const createBankAccount = payload => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('Not authenticated'));
  return request('/api/bank-accounts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};
export const updateBankAccount = (id, payload) => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('Not authenticated'));
  return request(`/api/bank-accounts/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};
export const deleteBankAccount = id => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('Not authenticated'));
  return request(`/api/bank-accounts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
export const getProfile = () => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }
  return request("/api/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
export const updateProfilePicture = async profilePictureUrl => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }
  const data = await request("/api/users/me/profile-picture", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      profilePictureUrl
    })
  });
  notifyAuthStateChanged("profile-updated");
  return data;
};
export const updateUserName = userName => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }
  return request("/api/users/me/username", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      userName
    })
  });
};
export const logoutUser = async () => {
  try {
    await request("/api/auth/logout", { method: "POST" });
  } finally {
    clearStoredToken("logout");
  }
};
export const getToken = () => {
  if (cookieSessionActive) return "cookie-session";
  if (typeof document === "undefined") return "";
  return document.cookie.split(";").some(part => part.trim() === "dam_auth=1") ? "cookie-session" : "";
};
export const getUserRoleHint = () => {
  if (typeof document === "undefined") return "";
  const roleCookie = document.cookie.split(";").map(part => part.trim()).find(part => part.startsWith("dam_role="));
  return roleCookie ? decodeURIComponent(roleCookie.slice("dam_role=".length)) : "";
};
export const getKycStatus = () => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }
  return request("/api/kyc-documents/status", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
export const submitKycVerification = payload => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }
  return request("/api/kyc-documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};
export const forgotPassword = email => request("/api/auth/forgot-password", {
  method: "POST",
  body: JSON.stringify({
    email
  })
});
export const resetPassword = (token, newPassword) => request("/api/auth/reset-password", {
  method: "POST",
  body: JSON.stringify({
    token,
    newPassword
  })
});
export const changePassword = (currentPassword, newPassword) => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }
  return request("/api/auth/change-password", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      currentPassword,
      newPassword
    })
  });
};
export const deleteAccount = (payloadOrCurrentPassword, additionalDetails = {}) => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }
  const payload = typeof payloadOrCurrentPassword === "string" ? {
    currentPassword: payloadOrCurrentPassword,
    ...additionalDetails
  } : payloadOrCurrentPassword;
  return request("/api/auth/delete-account", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};
export const addMoneyFromCard = payload => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }
  return request("/api/wallets/deposit-card", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};
export const getSavedCardDetails = () => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }
  return request("/api/wallets/card-details", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
export { request };
export { AUTH_BLOCKED_EVENT };
export { AUTH_STATE_CHANGED_EVENT };
