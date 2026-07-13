import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Search, ShoppingBag, User, MapPin, ChevronDown,
  Receipt, LogOut, Menu, X, ChevronRight, Store,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const NAV_LINKS = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/orders", icon: Receipt, label: "My Orders" },
  { to: "/profile", icon: User, label: "Profile" },
];

// ── Outlet Switcher ────────────────────────────────────────────────────────
function OutletSwitcher({ tone = "light", onOutletClick }) {
  const { outlet, orderType, setOrderType, isDeliveryAvailable, isPickupAvailable } = useApp();
  const isDark = tone === "dark";

  return (
    <div>
      {outlet && (
        <button
          onClick={onOutletClick}
          className={`flex items-center gap-1.5 text-xs transition-colors group ${
            isDark ? "text-white/70 hover:text-white" : "text-muted hover:text-primary"
          }`}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate max-w-[160px]">{outlet.outletName}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 group-hover:rotate-180 transition-transform duration-200" />
        </button>
      )}

      {(isDeliveryAvailable || isPickupAvailable) && (
        <div className={`mt-3 flex rounded-btn p-1 ${isDark ? "bg-white/10" : "bg-[var(--color-bg)]"}`}>
          {isDeliveryAvailable && (
            <button
              onClick={() => setOrderType("Door Delivery")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-btn transition-all ${
                orderType === "Door Delivery"
                  ? isDark ? "bg-white text-ink shadow-sm2" : "bg-surface text-primary shadow-xs"
                  : isDark ? "text-white/60" : "text-muted"
              }`}
            >
              Delivery
            </button>
          )}
          {isPickupAvailable && (
            <button
              onClick={() => setOrderType("Self Pickup")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-btn transition-all ${
                orderType === "Self Pickup"
                  ? isDark ? "bg-white text-ink shadow-sm2" : "bg-surface text-primary shadow-xs"
                  : isDark ? "text-white/60" : "text-muted"
              }`}
            >
              Pickup
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Mobile header ─────────────────────────────────────────────────────────
export function AppHeader({ showOutletSwitcher = true, onMenuOpen }) {
  const { orgName, orgLogo, cartCount } = useApp();
  const navigate = useNavigate();

  return (
    <header className="lg:hidden sticky top-0 z-40 glass border-b border-border/60">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Hamburger menu */}
          <button
            onClick={onMenuOpen}
            aria-label="Open navigation menu"
            className="p-1.5 rounded-lg hover:bg-primary/8 transition-colors text-muted hover:text-primary"
          >
            <Menu className="h-5 w-5" />
          </button>

          {orgLogo ? (
            <img src={orgLogo} alt={orgName} className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {orgName?.[0] || "O"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{orgName}</p>
            {showOutletSwitcher && <OutletSwitcher tone="light" onOutletClick={() => navigate("/outlets")} />}
          </div>
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-primary/5 transition-colors">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Mobile bottom nav ────────────────────────────────────────────────────
export function BottomNav() {
  const location = useLocation();
  const { cartCount } = useApp();

  const links = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/cart", icon: ShoppingBag, label: "Cart", badge: cartCount },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/60 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {links.map(({ to, icon: Icon, label, badge }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                active ? "text-primary" : "text-muted hover:text-[var(--color-text)]"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium">{label}</span>
              {badge > 0 && (
                <span className="absolute top-0 right-2 h-4 min-w-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ── Premium Drawer Sidebar ────────────────────────────────────────────────
export function DesktopSidebar({ mobileOpen = false, onClose, desktopCollapsed = false, onToggleDesktop }) {
  const location = useLocation();
  const { orgName, orgLogo, customer, logout, cartCount, outlet } = useApp();
  const navigate = useNavigate();

  // Close mobile drawer on route change
  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarJSX = (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/60">
        {orgLogo ? (
          <img src={orgLogo} alt={orgName} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/15" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
            {orgName?.[0] || "O"}
          </div>
        )}
        <p className="font-semibold text-[15px] truncate flex-1">{orgName}</p>
        
        {/* Mobile close button inside the drawer */}
        <button
          onClick={() => { if (onClose) onClose(); }}
          className="lg:hidden h-8 w-8 rounded-lg bg-[var(--color-bg)] flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Desktop close button inside the sidebar rail */}
        <button
          onClick={onToggleDesktop}
          className="hidden lg:flex h-8 w-8 rounded-lg bg-[var(--color-bg)] items-center justify-center text-muted hover:text-primary hover:bg-primary/10 transition-colors"
          title="Close sidebar"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Outlet switcher */}
      <div className="px-5 py-4 border-b border-border/60">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-faint mb-2">Current store</p>
        <button
          onClick={() => navigate("/outlets")}
          className="w-full flex items-center gap-3 rounded-btn hover:bg-[var(--color-bg)] p-2 -m-2 transition-colors group text-left"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{outlet?.outletName || "Choose store"}</p>
            {outlet?.address && <p className="text-xs text-faint truncate">{outlet.address}</p>}
          </div>
          <ChevronRight className="h-4 w-4 text-faint group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
        <div className="mt-3">
          <OutletSwitcher tone="light" onOutletClick={() => navigate("/outlets")} />
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_LINKS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}

        {/* Cart quick link with badge */}
        <Link
          to="/cart"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-all ${
            location.pathname === "/cart"
              ? "bg-primary/10 text-primary"
              : "text-muted hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
          }`}
        >
          <ShoppingBag className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1">Cart</span>
          {cartCount > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </nav>

      {/* Footer / User info */}
      <div className="p-4 border-t border-border/60 bg-[var(--color-bg)]/40 space-y-3">
        {customer && (
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 px-2 py-1 rounded-btn hover:bg-surface cursor-pointer transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
              {customer.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{customer.name || "My Profile"}</p>
              <p className="text-xs text-faint truncate">{customer.phone}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-faint shrink-0" />
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-btn text-sm font-medium text-muted hover:bg-[var(--color-bg)] hover:text-danger w-full transition-colors"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop: fixed rail ── */}
      <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-[var(--sidebar-w)] flex-col bg-surface border-r border-border z-40 transition-all duration-300 ${
        desktopCollapsed ? "-translate-x-full pointer-events-none opacity-0" : "translate-x-0 opacity-100"
      }`}>
        {sidebarJSX}
      </aside>

      {/* ── Mobile: backdrop + slide-in drawer ── */}
      <>
        {/* Backdrop */}
        <div
          className={`lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <div
          className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-surface border-r border-border shadow-2xl flex flex-col
            transition-transform duration-300 ease-out will-change-transform
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {sidebarJSX}
        </div>
      </>
    </>
  );
}

// ── Desktop top bar ───────────────────────────────────────────────────────
export function DesktopTopBar({ title, desktopCollapsed, onToggleDesktop }) {
  const { cartCount } = useApp();
  return (
    <div className="hidden lg:flex items-center justify-between border-b border-border/60 bg-surface/80 backdrop-blur px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {desktopCollapsed && (
          <button
            onClick={onToggleDesktop}
            className="p-2 rounded-lg border border-border bg-surface hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 text-sm font-semibold shadow-xs"
            title="Open sidebar"
          >
            <Menu className="h-4 w-4" />
            <span>Show sidebar</span>
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <Link
        to="/cart"
        className="relative flex items-center gap-2 rounded-btn border border-border px-4 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
      >
        <ShoppingBag className="h-4 w-4" />
        Cart
        {cartCount > 0 && (
          <span className="h-5 min-w-5 px-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}

// ── PageShell ─────────────────────────────────────────────────────────────
// Mobile: header (with hamburger) + page content + bottom nav
// Desktop: fixed sidebar + top bar + wide content
export function PageShell({ children, showHeader = true, showNav = true, title = "", className = "" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  const toggleDesktop = useCallback(() => {
    setDesktopCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", next ? "true" : "false");
      return next;
    });
  }, []);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className={`min-h-screen bg-[var(--color-bg)] pb-24 lg:pb-0 ${className}`}>
      {showHeader && <AppHeader onMenuOpen={openSidebar} />}
      <DesktopSidebar
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
        desktopCollapsed={desktopCollapsed}
        onToggleDesktop={toggleDesktop}
      />

      <div className={`transition-all duration-300 ${desktopCollapsed ? "lg:pl-0" : "lg:pl-[var(--sidebar-w)]"}`}>
        {showHeader && (
          <DesktopTopBar
            title={title}
            desktopCollapsed={desktopCollapsed}
            onToggleDesktop={toggleDesktop}
          />
        )}
        <main className="max-w-lg lg:max-w-desktop mx-auto animate-fade-in lg:px-8 lg:py-6">
          {children}
        </main>
      </div>

      {showNav && <BottomNav />}
    </div>
  );
}
