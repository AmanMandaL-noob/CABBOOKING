const _global = globalThis as any;

export async function detectHighPrecisionLocation(): Promise<{ lat: number; lng: number }> {
  // Use globalThis cache to prevent resets during Hot Module Reloading (HMR)
  if (_global.__cachedLocation) {
    return _global.__cachedLocation;
  }

  return new Promise((resolve) => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          _global.__cachedLocation = loc;
          resolve(loc);
        },
        async () => {
          const ipLoc = await fetchIpLocation();
          _global.__cachedLocation = ipLoc;
          resolve(ipLoc);
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    } else {
      fetchIpLocation().then((ipLoc) => {
        _global.__cachedLocation = ipLoc;
        resolve(ipLoc);
      });
    }
  });
}

async function fetchIpLocation(): Promise<{ lat: number; lng: number }> {
  // If we are on a local network IP, return default New Delhi coordinates to prevent CORS console logs
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && (hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172."))) {
      return { lat: 28.6139, lng: 77.2090 };
    }
  }

  // 1. Try FreeIPAPI (generous CORS rules)
  try {
    const res = await fetch("https://freeipapi.com/api/json");
    const data = await res.json();
    if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
      return { lat: data.latitude, lng: data.longitude };
    }
  } catch (err) {
    // Fail silently to avoid polluting console log cycles
  }

  // 2. Try ipapi.co (generous but rate-limited)
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    if (data && data.latitude && data.longitude) {
      return { lat: Number(data.latitude), lng: Number(data.longitude) };
    }
  } catch (err) {
    // Fail silently
  }

  // Default Delhi seed fallback coordinates if all geolocator channels block
  return { lat: 28.6139, lng: 77.2090 };
}
