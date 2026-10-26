import { useState, useEffect, useCallback } from "react";

// Reads the user's location once on mount, and exposes retry() so a
// failed or dismissed attempt can be re-run without reloading the page.
//
// status is one of:
//   idle | locating | granted
//   denied       - the browser has Location blocked for this site
//   unavailable  - permission is fine but the device couldn't work out a
//                  position (e.g. Windows Location Services switched off)
//   timeout      - the lookup took too long
//   unsupported  - the browser has no Geolocation API
//
// These used to all be reported as "denied", which sent people hunting
// for a permission problem that didn't exist.
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("idle");

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("locating");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("granted");
      },
      (error) => {
        if (error.code === 1) setStatus("denied");
        else if (error.code === 3) setStatus("timeout");
        else setStatus("unavailable");
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return { location, status, retry: locate };
}