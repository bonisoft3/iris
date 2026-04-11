export function registerServiceWorker() {
  if (typeof window === "undefined") return
  if (!("serviceWorker" in navigator)) return

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("[SW] Registered:", registration.scope)
    } catch {
      // SW not available (dev mode, or build without generate-sw)
    }
  })
}
