import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Button } from "@/components/ui";
import { MapPin, Navigation, Clock, ChevronRight, ShieldCheck, PencilLine } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getSavedOutlet } from "@/lib/theme";

// ===========================================================================
// LocationPage — dedicated step between Login and Outlet selection (was a
// modal before; now its own route so the 3-step "Phone → Verify → Location"
// indicator lands on a real page, matching the login card's visual language
// 1:1 — same split brand panel, same card, same step dots).
// ===========================================================================

function StepIndicator({ step = 2 }) {
  const steps = ["Phone", "Verify", "Location"];
  return (
    <div className="flex items-center gap-1.5 mb-5" aria-label={`Step ${step + 1} of ${steps.length}`}>
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5 flex-1">
          <div className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
        </div>
      ))}
    </div>
  );
}

export default function LocationPage() {
  const navigate = useNavigate();
  const { orgName, orgLogo, refreshOutletsForLocation } = useApp();
  const [status, setStatus] = useState("idle"); // idle | locating | error
  const savedOutlet = getSavedOutlet();

  const goNext = (loc) => {
    if (loc?.lat != null && loc?.lng != null) {
      refreshOutletsForLocation(loc);
    } else if (loc?.source === "saved" && loc.outlet) {
      refreshOutletsForLocation({ lat: loc.outlet.lat, lng: loc.outlet.lng, source: "saved" });
    }
    navigate("/outlets");
  };

  const handleAllow = () => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => goNext({ source: "live", lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setStatus("error"),
      { timeout: 8000 }
    );
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--color-bg)]">
      {/* Brand panel — mirrors LoginPage so the flow feels like one screen */}
      <div className="relative hidden lg:flex flex-col justify-between w-1/2 min-h-screen gradient-hero text-white p-12 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          {orgLogo ? (
            <img src={orgLogo} alt={orgName} className="h-11 w-11 rounded-full object-cover ring-2 ring-white/25" />
          ) : (
            <div className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center font-bold text-lg">
              {orgName?.[0] || "O"}
            </div>
          )}
          <span className="font-semibold text-lg tracking-tight">{orgName}</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Find food<br />near you.
          </h1>
          <p className="mt-4 text-white/75 text-[15px] leading-relaxed">
            We use your location to show the right menu, delivery times and
            offers for your area — nothing is shared beyond finding your
            nearest outlet.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} {orgName}. All rights reserved.</p>
      </div>

      <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-10 sm:py-16">
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          {orgLogo ? (
            <img src={orgLogo} alt={orgName} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {orgName?.[0] || "O"}
            </div>
          )}
          <span className="font-semibold text-lg tracking-tight">{orgName}</span>
        </div>

        <div className="w-full max-w-sm animate-fade-in">
          <Card className="border-border shadow-premium-lg rounded-lg2">
            <CardContent className="p-6 sm:p-8 space-y-5">
              <StepIndicator step={2} />

              <div className="space-y-1.5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Find food near you</h2>
                <p className="text-sm text-muted">
                  Allow location access so we can show accurate delivery times and nearby outlets.
                </p>
              </div>

              <Button
                onClick={handleAllow}
                size="lg"
                disabled={status === "locating"}
                className="w-full justify-between font-semibold shadow-glow group"
              >
                <span className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  {status === "locating" ? "Getting your location…" : "Allow location access"}
                </span>
                <ChevronRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </Button>

              {savedOutlet ? (
                <button
                  onClick={() => goNext({ source: "saved", outlet: savedOutlet })}
                  className="w-full flex items-center justify-between rounded-btn border border-border bg-surface px-4 py-3 text-left hover:border-border-strong hover:bg-[var(--color-bg)] transition-all"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Clock className="h-4 w-4 text-muted shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium truncate">Use saved location</span>
                      <span className="block text-xs text-muted truncate">{savedOutlet.outletName}</span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-faint shrink-0" />
                </button>
              ) : (
                <button
                  onClick={() => goNext({ source: "manual" })}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted hover:text-[var(--color-text)] transition-colors py-1"
                >
                  <PencilLine className="h-3.5 w-3.5" /> Enter location manually
                </button>
              )}

              {status === "error" && (
                <p className="text-xs text-danger text-center">
                  Couldn't access your location. You can pick a store manually instead.
                </p>
              )}

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-faint pt-1">
                <ShieldCheck className="h-3 w-3" /> Only used to find nearby stores
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
