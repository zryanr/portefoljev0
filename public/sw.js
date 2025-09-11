const CACHE_NAME = "mine-investeringer-v1"
const STATIC_CACHE = "static-v1"
const DYNAMIC_CACHE = "dynamic-v1"

// Assets to cache immediately
const STATIC_ASSETS = ["/", "/manifest.json", "/icons/icon-192x192.jpg", "/icons/icon-512x512.jpg"]

// API endpoints that should be cached
const API_CACHE_PATTERNS = [/^\/api\/portfolios/, /^\/api\/prices/]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Static assets cached successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Handle static assets with cache-first strategy
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(networkFirstStrategy(request, "/offline.html"))
    return
  }

  // Default: try network first, fallback to cache
  event.respondWith(networkFirstStrategy(request))
})

// Network-first caching strategy
async function networkFirstStrategy(request, fallbackUrl = null) {
  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url)

    // Try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fallback for navigation requests
    if (fallbackUrl && request.mode === "navigate") {
      const fallbackResponse = await caches.match(fallbackUrl)
      if (fallbackResponse) {
        return fallbackResponse
      }
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "No network connection and no cached data available",
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Cache-first caching strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error("[SW] Failed to fetch:", request.url, error)
    throw error
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "portfolio-sync") {
    event.waitUntil(syncPortfolioData())
  }

  if (event.tag === "price-sync") {
    event.waitUntil(syncPriceData())
  }
})

// Sync portfolio data when back online
async function syncPortfolioData() {
  try {
    console.log("[SW] Syncing portfolio data")

    // Get pending portfolio updates from IndexedDB
    const pendingUpdates = await getPendingUpdates("portfolios")

    for (const update of pendingUpdates) {
      try {
        const response = await fetch(update.url, {
          method: update.method,
          headers: update.headers,
          body: update.body,
        })

        if (response.ok) {
          await removePendingUpdate("portfolios", update.id)
          console.log("[SW] Portfolio update synced:", update.id)
        }
      } catch (error) {
        console.error("[SW] Failed to sync portfolio update:", error)
      }
    }
  } catch (error) {
    console.error("[SW] Portfolio sync failed:", error)
  }
}

// Sync price data when back online
async function syncPriceData() {
  try {
    console.log("[SW] Syncing price data")

    // Fetch latest prices for all assets
    const response = await fetch("/api/prices/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assets: [] }), // Will be populated with actual assets
    })

    if (response.ok) {
      console.log("[SW] Price data synced successfully")
    }
  } catch (error) {
    console.error("[SW] Price sync failed:", error)
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: "Dine investeringer har blitt oppdatert",
    icon: "/icons/icon-192x192.jpg",
    badge: "/icons/badge-72x72.png",
    tag: "investment-update",
    data: {
      url: "/",
    },
    actions: [
      {
        action: "view",
        title: "Se portefølje",
        icon: "/icons/action-view.png",
      },
      {
        action: "dismiss",
        title: "Lukk",
        icon: "/icons/action-dismiss.png",
      },
    ],
  }

  if (event.data) {
    try {
      const data = event.data.json()
      options.body = data.message || options.body
      options.data = { ...options.data, ...data }
    } catch (error) {
      console.error("[SW] Failed to parse push data:", error)
    }
  }

  event.waitUntil(self.registration.showNotification("Mine Investeringer", options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)

  event.notification.close()

  if (event.action === "view" || !event.action) {
    const url = event.notification.data?.url || "/"

    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus()
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      }),
    )
  }
})

// Utility functions for IndexedDB operations
async function getPendingUpdates(store) {
  // Implementation would use IndexedDB to store offline actions
  return []
}

async function removePendingUpdate(store, id) {
  // Implementation would remove from IndexedDB
  console.log(`[SW] Removing pending update ${id} from ${store}`)
}
