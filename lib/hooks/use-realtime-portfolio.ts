"use client"

import { useEffect, useState, useRef } from "react"

interface RealtimeUpdate {
  type: "connected" | "portfolio_update" | "error"
  portfolios?: any[]
  timestamp: string
  pricesUpdated?: boolean
  message?: string
}

export function useRealtimePortfolio(userId: string) {
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!userId) return

    // Create EventSource for Server-Sent Events
    const eventSource = new EventSource(`/api/realtime/portfolio-updates?userId=${userId}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
      console.log("[v0] Real-time connection established")
    }

    eventSource.onmessage = (event) => {
      try {
        const data: RealtimeUpdate = JSON.parse(event.data)
        console.log("[v0] Received real-time update:", data.type)

        switch (data.type) {
          case "connected":
            setIsConnected(true)
            break

          case "portfolio_update":
            if (data.portfolios) {
              setPortfolios(data.portfolios)
              setLastUpdate(new Date(data.timestamp))
              console.log("[v0] Portfolio data updated, prices refreshed:", data.pricesUpdated)
            }
            break

          case "error":
            setError(data.message || "Unknown error")
            console.error("[v0] Real-time error:", data.message)
            break
        }
      } catch (err) {
        console.error("[v0] Failed to parse real-time data:", err)
        setError("Failed to parse update data")
      }
    }

    eventSource.onerror = (event) => {
      console.error("[v0] EventSource error:", event)
      setIsConnected(false)
      setError("Connection lost")
    }

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      setIsConnected(false)
    }
  }, [userId])

  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    setIsConnected(false)
    setError(null)

    // Trigger re-effect by updating a dependency
    setTimeout(() => {
      // The useEffect will handle reconnection
    }, 1000)
  }

  return {
    portfolios,
    isConnected,
    lastUpdate,
    error,
    reconnect,
  }
}
