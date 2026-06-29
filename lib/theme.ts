// Tiny theme store: dark (default) ⇄ light. Persisted to localStorage and
// broadcast via a window event so the WebGL smoke can resync its palette.
export type Theme = "dark" | "light";

export const THEME_EVENT = "themechange";
const STORAGE_KEY = "theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const t = window.localStorage.getItem(STORAGE_KEY);
  return t === "light" || t === "dark" ? t : "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore private-mode storage errors */
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
}

// Background + smoke palette per theme, consumed by the WebGL layer.
// Raw display RGB (0..1) fed straight to the shader — NOT three.js Colors, so
// they bypass sRGB→linear management and render exactly as authored.
type RGB = [number, number, number];
export const THEME_PALETTE: Record<Theme, { bg: RGB; lo: RGB; hi: RGB }> = {
  // dark: cool grey smoke lifting to white over an ink page
  dark: {
    bg: [0.039, 0.039, 0.047],
    lo: [0.32, 0.34, 0.39],
    hi: [0.95, 0.965, 1.0],
  },
  // light: soft grey smoke darkening over a bone page
  light: {
    bg: [0.941, 0.925, 0.89],
    lo: [0.62, 0.62, 0.66],
    hi: [0.3, 0.31, 0.37],
  },
};
