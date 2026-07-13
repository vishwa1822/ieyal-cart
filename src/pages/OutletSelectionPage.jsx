import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Badge, Button, Skeleton } from "@/components/ui";
import { PageShell } from "@/components/layout/AppShell";
import { MapPin, Check, Bike, ShoppingBag, Store } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatDistance } from "@/lib/theme";

// ===========================================================================
// OutletSelectionPage — wrapped in PageShell (proper header/sidebar/nav).
// Desktop: 2-column card grid. Mobile: single column list.
// Maps to: organization/outlets/get-all (loaded in AppContext)
// ===========================================================================

export default function OutletSelectionPage() {
  const navigate = useNavigate();
  const { outlets, outlet, setOutlet, orgName, userLocation } = useApp();
  const [selected, setSelected] = useState(
    outlet?._id || outlets.find((o) => o.storeStatus && o.isActive)?._id || outlets[0]?._id
  );

  const handleContinue = () => {
    const chosen = outlets.find((o) => o._id === selected);
    if (chosen) {
      setOutlet(chosen);
      navigate("/home");
    }
  };

  return (
    <PageShell title="Choose Store">
      <div className="px-4 lg:px-0 pt-4 lg:pt-0 pb-24 lg:pb-8 space-y-5 max-w-2xl lg:max-w-4xl mx-auto lg:mx-0">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Choose your store</h2>
          <p className="text-sm text-muted">
            {userLocation
              ? "Sorted by distance from your current location."
              : `Showing outlets for ${orgName}.`}
          </p>
        </div>

        {/* Empty state */}
        {outlets.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center rounded-card border border-dashed border-border bg-surface">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">No outlets available</p>
              <p className="text-sm text-muted mt-1">No stores found near you right now.</p>
            </div>
          </div>
        )}

        {/* Outlet grid — 1 col mobile, 2 col desktop */}
        {outlets.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {outlets.map((o) => {
              const isOpen = o.storeStatus && o.isActive;
              const isSelected = selected === o._id;
              const distance = o.distance ? formatDistance(o.distance / 1000) : null;

              return (
                <button
                  key={o._id}
                  type="button"
                  disabled={!isOpen}
                  onClick={() => isOpen && setSelected(o._id)}
                  className="w-full text-left disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Card
                    className={[
                      "border transition-all rounded-lg2 h-full",
                      !isOpen
                        ? "shadow-none"
                        : isSelected
                        ? "border-primary ring-2 ring-primary/15 shadow-premium"
                        : "border-border hover:border-border-strong shadow-xs hover:shadow-premium card-hover",
                    ].join(" ")}
                  >
                    <CardContent className="pt-4 pb-4 flex gap-3">
                      {/* Icon */}
                      <div className={`h-11 w-11 rounded-xl shrink-0 flex items-center justify-center ${isSelected ? "bg-primary" : "bg-primary/10"}`}>
                        <MapPin className={`h-5 w-5 ${isSelected ? "text-white" : "text-primary"}`} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold truncate">{o.outletName}</p>
                          <Badge className={isOpen ? "bg-success/10 text-success shrink-0" : "bg-border text-faint shrink-0"}>
                            {isOpen ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted mt-1 line-clamp-2">{o.address}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-faint flex-wrap">
                          {distance && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {distance}
                            </span>
                          )}
                          {o.isDoorDeliveryAvailable && (
                            <span className="flex items-center gap-1">
                              <Bike className="h-3 w-3" /> Delivery
                            </span>
                          )}
                          {o.isSelfPickupAvailable && (
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3" /> Pickup
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Radio indicator */}
                      <div className="self-center shrink-0">
                        <div
                          className={[
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected ? "bg-primary border-primary" : "border-border",
                          ].join(" ")}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        )}

        {/* Continue CTA — sticky on mobile, inline on desktop */}
        {outlets.length > 0 && (
          <div className="lg:max-w-xs">
            <Button
              onClick={handleContinue}
              disabled={!outlets.find((o) => o._id === selected && o.storeStatus)}
              size="lg"
              className="w-full font-semibold shadow-glow"
            >
              Continue to menu
            </Button>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      {outlets.length > 0 && (
        <div className="lg:hidden fixed bottom-[64px] left-0 right-0 z-30 glass border-t border-border/60 px-4 py-3 safe-area-pb">
          <Button
            onClick={handleContinue}
            disabled={!outlets.find((o) => o._id === selected && o.storeStatus)}
            size="lg"
            className="w-full font-semibold shadow-glow"
          >
            Continue to menu
          </Button>
        </div>
      )}
    </PageShell>
  );
}
