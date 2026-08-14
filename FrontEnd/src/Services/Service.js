import { buildUrl } from "../config/api";
const TOKEN_STORAGE_KEY = "dam_token";
const AUTH_BLOCKED_EVENT = "auth:blocked";
const AUTH_STATE_CHANGED_EVENT = "auth:changed";
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
  if (options.body != null) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  const url = buildUrl(path);
  const response = await fetch(url, {
    ...options,
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
    body: JSON.stringify(payload)
  });
  if (!data?.token) {
    throw new Error("No token returned by server");
  }
  try {
    if (remember) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    }
  } catch {
    // fallback to sessionStorage if localStorage access fails
    sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  }
  notifyAuthStateChanged("login");
  return data.token;
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
export const logoutUser = () => {
  clearStoredToken("logout");
};
export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) || "";
  }
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
