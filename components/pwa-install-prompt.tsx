"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA] Install prompt available")
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after a delay if not installed
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true)
        }
      }, 10000) // Show after 10 seconds
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("[PWA] App installed successfully")
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      console.log("[PWA] Showing install prompt")
      await deferredPrompt.prompt()

      const choiceResult = await deferredPrompt.userChoice
      console.log("[PWA] User choice:", choiceResult.outcome)

      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted install prompt")
      } else {
        console.log("[PWA] User dismissed install prompt")
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error("[PWA] Install prompt failed:", error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem("pwa-prompt-dismissed", "true")
  }

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  // Check if already dismissed this session
  if (sessionStorage.getItem("pwa-prompt-dismissed")) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm mb-1">Installer appen</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Få raskere tilgang til dine investeringer ved å installere appen på hjemskjermen.
              </p>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleInstallClick} className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Installer
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDismiss}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
