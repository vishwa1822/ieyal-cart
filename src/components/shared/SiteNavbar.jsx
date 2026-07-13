import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/home#top" },
  { label: "Order Now", href: "/home#menu" },
  { label: "Explore", href: "/home#dishes" },
  { label: "Contact", href: "/home#footer" },
];

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/* ────────────────────────────────────────────────────────────────────────
   SiteNavbar — the single navbar used across every ieyal-themed page
   (marketing Home, Book My Table, and eventually Login). Keeping this in
   one file is what makes "consistent with the homepage" actually true
   instead of three slightly-different hand copies drifting apart.

   `onLoginClick` — if passed, the Login button opens a modal (e.g. the
   shadcn login sheet) instead of navigating to /login.
   `forceSolid` — pages with a hero image directly under the navbar (like
   Book My Table) want the glass bar solid-on-load, not only after scroll.
   ──────────────────────────────────────────────────────────────────── */
export default function SiteNavbar({ onLoginClick, forceSolid = false }) {
  const scrolledPastThreshold = useScrolled();
  const scrolled = forceSolid || scrolledPastThreshold;
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
        <div
          className={`mx-auto max-w-6xl px-6 flex items-center justify-between rounded-full transition-all duration-500 ${
            scrolled
              ? "bg-white/75 backdrop-blur-xl border border-[var(--iy-border)] shadow-[var(--iy-shadow-xs)] py-2.5"
              : "py-3 border border-transparent"
          }`}
        >
          <Link to="/home" className="iy-serif text-2xl tracking-tight font-medium text-[var(--iy-ink)] rounded-md">IEYAL</Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className="relative text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 text-[var(--iy-ink-soft)] hover:text-[var(--iy-ink)] hover:bg-[var(--iy-ink)]/[0.04]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="text-sm font-medium text-[var(--iy-ink)] px-4 py-2 rounded-full hover:text-[var(--iy-accent)] hover:bg-[var(--iy-ink)]/[0.04] transition-all duration-300"
            >
              Login
            </button>
            <Link
              to="/home#menu"
              className="text-sm font-semibold text-white bg-[var(--iy-accent)] rounded-full px-5 py-2.5 shadow-[var(--iy-shadow-sm)] hover:shadow-[var(--iy-shadow-glow)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-[var(--iy-shadow-xs)]"
            >
              Order Now
            </Link>
          </div>

          <button className="md:hidden text-[var(--iy-ink)] p-1.5 rounded-full" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden mx-4 mt-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-[var(--iy-border)] shadow-[var(--iy-shadow-md)] p-5 flex flex-col gap-1 animate-[iyFadeUp_.3s_ease-out]">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.href} onClick={() => setOpen(false)} className="text-sm font-medium px-3 py-2.5 rounded-xl transition-colors text-[var(--iy-ink)]">
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => { setOpen(false); onLoginClick?.(); }}
              className="mt-1 text-sm font-semibold text-[var(--iy-ink)] border border-[var(--iy-border)] rounded-full px-5 py-3 text-center"
            >
              Login
            </button>
            <Link to="/home#menu" onClick={() => setOpen(false)} className="mt-2 text-sm font-semibold text-white bg-[var(--iy-accent)] rounded-full px-5 py-3 text-center">
              Order Now
            </Link>
          </div>
        )}
      </header>

      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-[var(--iy-ink)]/20 backdrop-blur-[2px] animate-[iyFadeUp_.2s_ease-out]"
        />
      )}
    </>
  );
}
