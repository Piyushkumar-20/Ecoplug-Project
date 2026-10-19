const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Access tokens live only in memory. The refresh token is managed by the
// backend through an HttpOnly cookie and is never read by frontend JavaScript.
let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = typeof token === "string" && token ? token : null;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

const readResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text || "Unexpected server response" };
  }
};

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await readResponse(response);

    if (!response.ok || !data?.data?.token) {
      clearAccessToken();
      throw new Error(data?.message || "Your session has expired. Please log in again.");
    }

    setAccessToken(data.data.token);
    return data.data.token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

export const restoreSession = async () => {
  if (accessToken) return true;

  try {
    await refreshAccessToken();
    return true;
  } catch {
    clearAccessToken();
    return false;
  }
};

export const apiRequest = async (endpoint, options = {}, hasRetried = false) => {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: options.credentials || "include",
  });
  const data = await readResponse(response);

  const isAuthEndpoint = [
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/logout",
  ].includes(endpoint);

  if (response.status === 401 && !hasRetried && !isAuthEndpoint) {
    try {
      await refreshAccessToken();
      return apiRequest(endpoint, options, true);
    } catch {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
      throw new Error("Your session has expired. Please log in again.");
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
};
