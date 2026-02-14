import { useState, useEffect, useCallback } from "react";
import { MapPin, Camera } from "lucide-react";
import { PermissionModal } from "./PermissionModal";
import { usePermissions, PermissionStatus } from "@/hooks/usePermissions";

interface PermissionFlowProps {
  onComplete: (permissions: { location: PermissionStatus; camera: PermissionStatus }) => void;
}

type Step = "location" | "camera" | "done";

export function PermissionFlow({ onComplete }: PermissionFlowProps) {
  const { permissions, requestLocation, requestCamera } = usePermissions();
  const [step, setStep] = useState<Step>("location");
  const [loading, setLoading] = useState(false);

  const finish = useCallback(() => {
    setStep("done");
    onComplete(permissions);
  }, [permissions, onComplete]);

  useEffect(() => {
    if (step === "done") {
      onComplete(permissions);
    }
  }, [step, permissions, onComplete]);

  const handleLocationAllow = async () => {
    setLoading(true);
    await requestLocation();
    setLoading(false);
    setStep("camera");
  };

  const handleLocationDeny = () => {
    setStep("camera");
  };

  const handleCameraAllow = async () => {
    setLoading(true);
    await requestCamera();
    setLoading(false);
    finish();
  };

  const handleCameraDeny = () => {
    finish();
  };

  return (
    <>
      <PermissionModal
        open={step === "location"}
        onClose={handleLocationDeny}
        icon={<MapPin className="h-8 w-8" />}
        title="Enable Location"
        description="AgriVision uses your location to provide accurate weather forecasts and region-specific crop suggestions."
        onAllow={handleLocationAllow}
        onDeny={handleLocationDeny}
        loading={loading}
      />
      <PermissionModal
        open={step === "camera"}
        onClose={handleCameraDeny}
        icon={<Camera className="h-8 w-8" />}
        title="Enable Camera"
        description="The camera is used for leaf disease detection. Point your camera at a leaf and get instant analysis."
        onAllow={handleCameraAllow}
        onDeny={handleCameraDeny}
        loading={loading}
      />
    </>
  );
}
