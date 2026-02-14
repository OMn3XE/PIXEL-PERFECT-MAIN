import { WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfflineModalProps {
  open: boolean;
  onClose: () => void;
}

export function OfflineModal({ open, onClose }: OfflineModalProps) {
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
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <WifiOff className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-display font-bold text-foreground">
              You're Offline
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You seem to be offline. Some features like weather updates and leaf
              analysis may not work until you reconnect.
            </p>
          </div>

          <Button className="w-full mt-2" onClick={onClose}>
            Continue Anyway
          </Button>
        </div>
      </div>
    </div>
  );
}
