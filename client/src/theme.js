const THEME_KEY = "themeMode";
const MODES = new Set(["SYSTEM", "LIGHT", "DARK"]);

// accepta doar modurile suportate si revine la SYSTEM pentru valori invalide
function normalize(mode) {
  const value = typeof mode === "string" ? mode.toUpperCase() : "SYSTEM";
  return MODES.has(value) ? value : "SYSTEM";
}

// traduce modul logic (SYSTEM/LIGHT/DARK) in tema efectiva (light/dark)
function resolveMode(mode) {
  const normalized = normalize(mode);
  if (normalized === "SYSTEM") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return normalized === "DARK" ? "dark" : "light";
}

// citeste preferinta din localStorage, cu fallback sigur
export function getStoredThemeMode() {
  return normalize(localStorage.getItem(THEME_KEY) || "SYSTEM");
}

// aplica tema la nivel de document si persista modul ales
export function applyThemeMode(mode) {
  const normalized = normalize(mode);
  const resolved = resolveMode(normalized);
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem(THEME_KEY, normalized);
}

// sterge preferinta salvata; urmatoarea initializare va folosi fallback
export function clearStoredThemeMode() {
  localStorage.removeItem(THEME_KEY);
}

// initializeaza tema la pornire si asculta schimbarile de tema ale sistemului
export function initTheme() {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  // reaplica doar daca utilizatorul este pe modul SYSTEM
  const syncWithSystem = () => {
    if (getStoredThemeMode() === "SYSTEM") {
      document.documentElement.dataset.theme = media.matches ? "dark" : "light";
    }
  };

  // aplicare initiala + sincronizare in timp real cu setarea OS
  applyThemeMode(getStoredThemeMode());
  media.addEventListener("change", syncWithSystem);
}
