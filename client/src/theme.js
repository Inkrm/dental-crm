const THEME_KEY = "themeMode";
const MODES = new Set(["SYSTEM", "LIGHT", "DARK"]);

function normalize(mode) {
  const value = typeof mode === "string" ? mode.toUpperCase() : "SYSTEM";
  return MODES.has(value) ? value : "SYSTEM";
}

function resolveMode(mode) {
  const normalized = normalize(mode);
  if (normalized === "SYSTEM") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return normalized === "DARK" ? "dark" : "light";
}

export function getStoredThemeMode() {
  return normalize(localStorage.getItem(THEME_KEY) || "SYSTEM");
}

export function applyThemeMode(mode) {
  const normalized = normalize(mode);
  const resolved = resolveMode(normalized);
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem(THEME_KEY, normalized);
}

export function clearStoredThemeMode() {
  localStorage.removeItem(THEME_KEY);
}

export function initTheme() {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const syncWithSystem = () => {
    if (getStoredThemeMode() === "SYSTEM") {
      document.documentElement.dataset.theme = media.matches ? "dark" : "light";
    }
  };

  applyThemeMode(getStoredThemeMode());
  media.addEventListener("change", syncWithSystem);
}
