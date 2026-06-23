/** Best-effort client location for sign-in tracking (browser permission). */
export async function collectLoginLocation() {
  if (typeof window === 'undefined') return { timezone: null };

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  const base = { timezone };

  if (!navigator?.geolocation) return base;

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000,
        maximumAge: 300000,
        enableHighAccuracy: false,
      });
    });
    return {
      ...base,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return base;
  }
}
