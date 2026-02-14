import { useState, useCallback } from "react";

export type PermissionStatus = "idle" | "granted" | "denied" | "pending";

interface PermissionsState {
  location: PermissionStatus;
  camera: PermissionStatus;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionsState>({
    location: "idle",
    camera: "idle",
  });

  const requestLocation = useCallback(async (): Promise<PermissionStatus> => {
    setPermissions((prev) => ({ ...prev, location: "pending" }));
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setPermissions((prev) => ({ ...prev, location: "denied" }));
        resolve("denied");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissions((prev) => ({ ...prev, location: "granted" }));
          resolve("granted");
        },
        () => {
          setPermissions((prev) => ({ ...prev, location: "denied" }));
          resolve("denied");
        },
        { timeout: 10000 }
      );
    });
  }, []);

  const requestCamera = useCallback(async (): Promise<PermissionStatus> => {
    setPermissions((prev) => ({ ...prev, camera: "pending" }));
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissions((prev) => ({ ...prev, camera: "denied" }));
        return "denied";
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissions((prev) => ({ ...prev, camera: "granted" }));
      return "granted";
    } catch {
      setPermissions((prev) => ({ ...prev, camera: "denied" }));
      return "denied";
    }
  }, []);

  return { permissions, requestLocation, requestCamera };
}
