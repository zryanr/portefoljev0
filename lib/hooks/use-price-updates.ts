"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"

interface PriceData {
  symbol: string
  price: number
  currency: string
  change: number
  changePercent: number
  lastUpdated: string
  source: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function usePrice(symbol: string, assetType: "stock" | "fund" = "stock") {
  const { data, error, mutate } = useSWR<PriceData>(
    symbol ? `/api/prices/${symbol}?type=${assetType}` : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    },
  )

  return {
    priceData: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}

export function useBatchPrices(assets: Array<{ symbol: string; assetType: "stock" | "fund" }>) {
  const [isLoading, setIsLoading] = useState(false)
  const [prices, setPrices] = useState<PriceData[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = async () => {
    if (!assets.length) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/prices/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch prices")
      }

      const data = await response.json()
      setPrices(data.prices || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()

    // Set up interval for regular updates
    const interval = setInterval(fetchPrices, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [assets])

  return {
    prices,
    isLoading,
    error,
    refresh: fetchPrices,
  }
}

// Hook for real-time price monitoring with WebSocket-like behavior
export function useRealTimePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!symbols.length) return

    setIsConnected(true)

    // Simulate real-time updates with polling
    const updatePrices = async () => {
      try {
        const assets = symbols.map((symbol) => ({ symbol, assetType: "stock" as const }))
        const response = await fetch("/api/prices/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assets }),
        })

        if (response.ok) {
          const data = await response.json()
          const priceMap = data.prices.reduce((acc: Record<string, PriceData>, price: PriceData) => {
            acc[price.symbol] = price
            return acc
          }, {})
          setPrices(priceMap)
        }
      } catch (error) {
        console.error("Real-time price update error:", error)
      }
    }

    // Initial fetch
    updatePrices()

    // Set up polling interval
    const interval = setInterval(updatePrices, 30000) // Update every 30 seconds

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [symbols])

  return {
    prices,
    isConnected,
    getPrice: (symbol: string) => prices[symbol],
  }
}
