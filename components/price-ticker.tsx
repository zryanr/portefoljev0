"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useRealTimePrices } from "@/lib/hooks/use-price-updates"
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react"

interface PriceTickerProps {
  symbols: string[]
}

export function PriceTicker({ symbols }: PriceTickerProps) {
  const { prices, isConnected, getPrice } = useRealTimePrices(symbols)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      setLastUpdate(new Date())
    }
  }, [prices])

  const formatCurrency = (amount: number, currency = "NOK") => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (!symbols.length) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Markedspriser</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isConnected ? <Wifi className="h-3 w-3 text-primary" /> : <WifiOff className="h-3 w-3 text-destructive" />}
            <span>Sist oppdatert: {formatTime(lastUpdate)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {symbols.map((symbol) => {
            const price = getPrice(symbol)

            if (!price) {
              return (
                <div key={symbol} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{symbol}</div>
                    <div className="text-xs text-muted-foreground">Laster...</div>
                  </div>
                  <div className="animate-pulse bg-muted-foreground/20 h-4 w-16 rounded"></div>
                </div>
              )
            }

            const isPositive = price.change >= 0

            return (
              <div key={symbol} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium text-sm">{symbol}</div>
                  <div className="text-xs text-muted-foreground">{price.source}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{formatCurrency(price.price, price.currency)}</div>
                  <Badge
                    variant={isPositive ? "default" : "destructive"}
                    className={`text-xs ${isPositive ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {isPositive ? "+" : ""}
                    {price.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
