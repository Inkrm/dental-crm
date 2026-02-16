const API = import.meta.env.VITE_API_URL || "/api";

export function setToken(token) {
  localStorage.setItem("accessToken", token);
}

export function getToken() {
  return localStorage.getItem("accessToken");
}

export function clearToken() {
  localStorage.removeItem("accessToken");
}

export async function api(path, options = {}) {
  const token = getToken();

  let res;
  let data = {};
  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      "Nu se poate contacta API-ul. Verifica VITE_API_URL, CORS si porturile expuse."
    );
  }

  data = await res.json().catch(() => ({}));

  // daca token expirat / invalid
  const isAuthRoute = path.startsWith("/auth/login") || path.startsWith("/auth/refresh");
  if (res.status === 401 && !isAuthRoute) {
    clearToken();
    alert("Sesiunea a expirat. Te rugăm să te autentifici din nou.");
    window.location.href = "/login";
  }

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Request failed"
    );
  }

  return data;
}
