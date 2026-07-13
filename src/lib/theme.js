const STORAGE_KEYS = {
  theme: "owncart_theme",
  token: "owncart_token",
  customer: "owncart_customer",
  outlet: "owncart_outlet",
  orderType: "owncart_order_type",
};

export function applyTheme(themeConfig) {
  if (!themeConfig) return;
  const t = themeConfig.theme || themeConfig;
  const root = document.documentElement;

  const set = (prop, val) => val && root.style.setProperty(prop, val);

  // "Ink" is a dark surface color (sidebar, headers on gradient-hero) that
  // ALWAYS carries white text on top of it. Org APIs sometimes return a
  // light brand color here (a cream, a pastel) which makes white text
  // disappear — that's exactly the invisible-sidebar bug. Guard against it:
  // only trust the API value if it's actually dark; otherwise derive a rich
  // dark tone from the primary brand color so contrast is always safe.
  const inkCandidate = t.secondaryColor || t.headerBackgroundColor;
  const ink = ensureDarkSurface(inkCandidate);

  // Brand colors from org APIs are sometimes very hot/saturated (e.g. a
  // pure alarm-red). Used everywhere (buttons, glows, active states) that
  // reads as aggressive rather than premium. Tone down intensity slightly
  // for large surfaces while keeping the true brand hue for small accents.
  const primary = softenIntensity(t.primaryColor);
  set("--color-primary", primary);
  set("--color-primary-dark", adjustColor(primary, -20));
  set("--color-primary-light", adjustColor(primary, 210));
  set("--color-primary-true", t.primaryColor);
  set("--color-ink", ink);
  set("--color-ink-light", adjustColor(ink, 24));
  set("--color-bg", t.backgroundColor);
  set("--color-surface", "#ffffff");
  set("--color-text", t.textColor);
  set("--color-border", t.borderColor);
  set("--radius-card", `${t.cardRadius || 12}px`);
  set("--radius-btn", `${t.buttonRadius || 8}px`);
  set("--font-family", t.fontFamily || "Inter, sans-serif");

  localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(t));
}

// Relative luminance (WCAG). 0 = black, 1 = white.
function luminance(hex) {
  if (!hex?.startsWith("#") || hex.length < 7) return 1;
  const num = parseInt(hex.slice(1), 16);
  const chans = [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * chans[0] + 0.7152 * chans[1] + 0.0722 * chans[2];
}

// Returns a color guaranteed dark enough for white text on top (luminance
// <= 0.35). Ink is always a neutral charcoal/navy — deliberately NOT derived
// from the brand's primary color. Deriving it from primary used to mean a
// saturated brand red bled into headers, the sidebar, and every "dark"
// surface as a muddy maroon. Keeping ink neutral keeps those surfaces calm
// no matter how intense the org's brand color is.
function ensureDarkSurface(candidate) {
  const NEUTRAL = "#111827"; // slate-900 — calm, brand-agnostic dark surface
  if (candidate?.startsWith("#") && luminance(candidate) <= 0.35) return candidate;
  return NEUTRAL;
}

export function loadCachedTheme() {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.theme);
    if (cached) applyTheme({ theme: JSON.parse(cached) });
  } catch { /* ignore */ }
}

// Pulls a saturated/hot color toward a soft neutral so it reads as calm and
// premium rather than aggressive when used across large surfaces (buttons,
// glows, active states, gradients). Leaves already-muted colors untouched.
// Lower threshold + stronger blend than before — a deep saturated red/maroon
// brand color was still reading "dark and heavy" across the app at the old
// settings.
function softenIntensity(hex) {
  if (!hex?.startsWith("#") || hex.length < 7) return hex;
  const num = parseInt(hex.slice(1), 16);
  const r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  if (saturation < 0.55) return hex; // not an overly hot color, leave as-is
  const mix = 0.24;
  const blend = (c) => Math.round(c + (245 - c) * mix);
  return `#${((1 << 24) + (blend(r) << 16) + (blend(g) << 8) + blend(b)).toString(16).slice(1)}`;
}

function adjustColor(hex, percent) {
  if (!hex?.startsWith("#")) return hex;
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function saveAuth(token, customer) {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.customer, JSON.stringify(customer));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.customer);
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function getCustomer() {
  try {
    const c = localStorage.getItem(STORAGE_KEYS.customer);
    return c ? JSON.parse(c) : null;
  } catch {
    return null;
  }
}

export function saveOutlet(outlet) {
  localStorage.setItem(STORAGE_KEYS.outlet, JSON.stringify(outlet));
}

export function getSavedOutlet() {
  try {
    const o = localStorage.getItem(STORAGE_KEYS.outlet);
    return o ? JSON.parse(o) : null;
  } catch {
    return null;
  }
}

export function saveOrderType(type) {
  localStorage.setItem(STORAGE_KEYS.orderType, type);
}

export function getOrderType() {
  return localStorage.getItem(STORAGE_KEYS.orderType) || "Door Delivery";
}

export function formatPrice(amount, symbol = "₹") {
  return `${symbol}${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function formatDistance(km) {
  if (!km && km !== 0) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatPhone(phone) {
  const p = String(phone || "").replace(/\D/g, "");
  if (p.length === 12 && p.startsWith("91")) return p.slice(2);
  return p;
}
