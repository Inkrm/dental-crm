const API = "http://localhost:4000/api";

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
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

if (!res.ok) {
  if (typeof data.error === "string") {
    throw new Error(data.error);
  }

  // dacă vine eroare Zod
  if (data.error?.fieldErrors) {
    const messages = Object.values(data.error.fieldErrors)
      .flat()
      .join(", ");
    throw new Error(messages || "Validation error");
  }

  throw new Error("Request failed");
}


  return data;
}
