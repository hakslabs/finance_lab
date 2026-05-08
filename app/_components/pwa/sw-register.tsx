"use client";

/**
 * Registers the static-asset service worker on mount. Failure is silent —
 * the app must work without a service worker (older browsers, private
 * mode, etc.).
 */

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "test") return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Silent failure — app remains fully functional without SW.
      }
    };

    register();
  }, []);

  return null;
}
