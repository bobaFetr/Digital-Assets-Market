const API_BASE = import.meta.env?.VITE_API_BASE ?? "";
const TOKEN_STORAGE_KEY = "dam_token";

const request = async (path, options = {}) => {
  const headers = {
    ...(options.headers || {}),
  };
  if (options.body != null) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    const details = message ? `: ${message}` : "";
    throw new Error(`(${response.status})${details}`);
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

  try {
    if (remember) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    }
  } catch (e) {
    // fallback to sessionStorage if localStorage access fails
    sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  }

  return data.token;
};

export const createDefaultWallets = (payload) => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('Not authenticated'));

  return request('/api/wallets/ensure-default', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const getBankAccounts = () => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('Not authenticated'));

  return request('/api/bank-accounts', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createBankAccount = (payload) => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('Not authenticated'));

  return request('/api/bank-accounts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const updateBankAccount = (id, payload) => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('Not authenticated'));

  return request(`/api/bank-accounts/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const deleteBankAccount = (id) => {
  const token = getToken();
  if (!token) return Promise.reject(new Error('Not authenticated'));

  return request(`/api/bank-accounts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProfilePicture = (profilePictureUrl) => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }

  return request("/api/users/me/profile-picture", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ profilePictureUrl }),
  });
};

export const updateUserName = (userName) => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }

  return request("/api/users/me/username", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userName }),
  });
};

export const logoutUser = () => {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    // ignore
  }
};

export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch (e) {
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

export const changePassword = (currentPassword, newPassword) => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }

  return request("/api/auth/change-password", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

export const deleteAccount = (payloadOrCurrentPassword, additionalDetails = {}) => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }

  const payload =
    typeof payloadOrCurrentPassword === "string"
      ? { currentPassword: payloadOrCurrentPassword, ...additionalDetails }
      : payloadOrCurrentPassword;

  return request("/api/auth/delete-account", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const addMoneyFromCard = (payload) => {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }

  return request("/api/wallets/deposit-card", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
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
      Authorization: `Bearer ${token}`,
    },
  });
};

export { request };
