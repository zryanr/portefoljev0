"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePortfolios } from "@/lib/hooks/use-portfolios"
import { TrendingUp, TrendingDown, Coins, Home, Banknote } from "lucide-react"

interface AssetOverviewProps {
  userId: string
}

export function AssetOverview({ userId }: AssetOverviewProps) {
  const { portfolios, isLoading } = usePortfolios(userId)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount)
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "stock":
        return <TrendingUp className="h-4 w-4" />
      case "fund":
        return <Coins className="h-4 w-4" />
      case "real_estate":
        return <Home className="h-4 w-4" />
      case "cash":
        return <Banknote className="h-4 w-4" />
      default:
        return <Coins className="h-4 w-4" />
    }
  }

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case "stock":
        return "Aksjer"
      case "fund":
        return "Fond"
      case "real_estate":
        return "Eiendom"
      case "cash":
        return "Kontanter"
      default:
        return type
    }
  }

  // Mock asset data - in real app, this would come from API
  const mockAssets = [
    {
      id: 1,
      name: "Equinor ASA",
      symbol: "EQNR.OL",
      asset_type: "stock",
      platform: "Nordnet",
      quantity: 100,
      current_price: 285.5,
      average_cost: 250.0,
      market_value: 28550,
      return_percentage: 14.2,
    },
    {
      id: 2,
      name: "DNB Norge (I)",
      symbol: "NO0010841588",
      asset_type: "fund",
      platform: "DNB",
      quantity: 50.5,
      current_price: 1850.0,
      average_cost: 1720.0,
      market_value: 93425,
      return_percentage: 7.6,
    },
    {
      id: 3,
      name: "Leilighet Oslo",
      asset_type: "real_estate",
      platform: "Eiendom",
      quantity: 1,
      current_price: 4500000,
      average_cost: 4200000,
      market_value: 4500000,
      return_percentage: 7.1,
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Alle Investeringer</h2>
        <Badge variant="secondary">{mockAssets.length} investeringer</Badge>
      </div>

      <div className="grid gap-4">
        {mockAssets.map((asset) => (
          <Card key={asset.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-muted rounded-lg">{getAssetIcon(asset.asset_type)}</div>
                  <div>
                    <h3 className="font-medium">{asset.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{getAssetTypeLabel(asset.asset_type)}</span>
                      {asset.symbol && (
                        <>
                          <span>•</span>
                          <span>{asset.symbol}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{asset.platform}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold">{formatCurrency(asset.market_value)}</div>
                  <div
                    className={`flex items-center text-sm ${
                      asset.return_percentage >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {asset.return_percentage >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {asset.return_percentage >= 0 ? "+" : ""}
                    {asset.return_percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Antall:</span>
                  <div className="font-medium">{asset.quantity}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Gjennomsnittspris:</span>
                  <div className="font-medium">{formatCurrency(asset.average_cost)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Nåværende pris:</span>
                  <div className="font-medium">{formatCurrency(asset.current_price)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
