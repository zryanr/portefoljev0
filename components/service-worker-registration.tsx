"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          console.log("[PWA] Registering service worker")

          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          })

          console.log("[PWA] Service worker registered successfully:", registration.scope)

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              console.log("[PWA] New service worker installing")

              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[PWA] New service worker installed, prompting for update")

                  // Show update notification
                  if (window.confirm("En ny versjon av appen er tilgjengelig. Vil du oppdatere nå?")) {
                    window.location.reload()
                  }
                }
              })
            }
          })

          // Handle controller change
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            console.log("[PWA] Service worker controller changed")
            window.location.reload()
          })
        } catch (error) {
          console.error("[PWA] Service worker registration failed:", error)
        }
      }

      registerSW()
    }
  }, [])

  return null
}
