import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionModalProps {
  open: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  onAllow: () => void;
  onDeny: () => void;
  loading?: boolean;
}

export function PermissionModal({
  open,
  onClose,
  icon,
  title,
  description,
  onAllow,
  onDeny,
  loading = false,
}: PermissionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-blur animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-4 mt-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary">
            {icon}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-display font-bold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex w-full gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onDeny}
              disabled={loading}
            >
              Not Now
            </Button>
            <Button
              className="flex-1"
              onClick={onAllow}
              disabled={loading}
            >
              {loading ? "Requesting…" : "Allow"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
