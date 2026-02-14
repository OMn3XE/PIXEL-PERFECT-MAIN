import { useState, useCallback } from "react";
import {
  Leaf,
  MapPin,
  Camera,
  CloudSun,
  Sprout,
  ScanLine,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { OfflineModal } from "@/components/OfflineModal";
import { PermissionFlow } from "@/components/PermissionFlow";
import { ChatBot } from "@/components/ChatBot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import type { PermissionStatus } from "@/hooks/usePermissions";
import heroImage from "@/assets/hero-farm.jpg";

const Index = () => {
  const isOnline = useOnlineStatus();
  const [offlineDismissed, setOfflineDismissed] = useState(false);
  const [permissionsReady, setPermissionsReady] = useState(false);
  const [grantedPermissions, setGrantedPermissions] = useState<{
    location: PermissionStatus;
    camera: PermissionStatus;
  }>({ location: "idle", camera: "idle" });

  const handlePermissionsComplete = useCallback(
    (perms: { location: PermissionStatus; camera: PermissionStatus }) => {
      setGrantedPermissions(perms);
      setPermissionsReady(true);
    },
    []
  );

  const showOffline = !isOnline && !offlineDismissed;
  const showPermissions = (isOnline || offlineDismissed) && !permissionsReady;

  const features = [
    {
      icon: <CloudSun className="h-6 w-6" />,
      title: "Weather Insights",
      desc: "Hyper-local forecasts for your fields",
      enabled: grantedPermissions.location === "granted",
      requiresPermission: "location" as const,
    },
    {
      icon: <ScanLine className="h-6 w-6" />,
      title: "Leaf Analysis",
      desc: "AI-powered disease detection",
      enabled: grantedPermissions.camera === "granted",
      requiresPermission: "camera" as const,
    },
    {
      icon: <Sprout className="h-6 w-6" />,
      title: "Crop Suggestions",
      desc: "Region-optimized recommendations",
      enabled: grantedPermissions.location === "granted",
      requiresPermission: "location" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Modal */}
      <OfflineModal
        open={showOffline}
        onClose={() => setOfflineDismissed(true)}
      />

      {/* Permission Flow */}
      {showPermissions && (
        <PermissionFlow onComplete={handlePermissionsComplete} />
      )}

      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={heroImage}
          alt="Lush green farmland at sunrise"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 to-background" />
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-8 w-8 text-primary-foreground" />
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-primary-foreground">
              AgriVision
            </h1>
          </div>
          <p className="text-sm sm:text-base text-primary-foreground/80 max-w-md">
            Smart farming powered by AI & real-time data
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-center gap-4 py-3 border-b border-border bg-card">
        <StatusChip label="Online" active={isOnline} />
        <StatusChip label="Location" active={grantedPermissions.location === "granted"} />
        <StatusChip label="Camera" active={grantedPermissions.camera === "granted"} />
      </div>

      {/* Features Grid */}
      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <h2 className="text-lg font-display font-bold text-foreground">
          Features
        </h2>
        <div className="grid gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                f.enabled
                  ? "bg-card border-border shadow-sm"
                  : "bg-muted/50 border-border/50 opacity-60"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  f.enabled
                    ? "bg-accent text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {f.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-foreground">
                  {f.title}
                </p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
              {f.enabled ? (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Denied permissions fallback */}
        {permissionsReady &&
          (grantedPermissions.location === "denied" ||
            grantedPermissions.camera === "denied") && (
            <div className="rounded-xl border border-agri-warning/30 bg-agri-warning/5 p-4 text-sm text-muted-foreground">
              <p className="font-display font-semibold text-foreground mb-1">
                Some permissions were denied
              </p>
              {grantedPermissions.location === "denied" && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-agri-warning" />
                  Location denied — weather &amp; crop suggestions unavailable.
                </p>
              )}
              {grantedPermissions.camera === "denied" && (
                <p className="flex items-center gap-2 mt-1">
                  <Camera className="h-4 w-4 text-agri-warning" />
                  Camera denied — leaf analysis unavailable.
                </p>
              )}
              <p className="mt-2 text-xs">
                You can enable these in your browser settings anytime.
              </p>
            </div>
          )}
      </main>

      {/* Chatbot */}
      <ChatBot />
    </div>
  );
};

function StatusChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors ${
        active
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-primary" : "bg-muted-foreground/50"
        }`}
      />
      {label}
    </span>
  );
}

export default Index;
