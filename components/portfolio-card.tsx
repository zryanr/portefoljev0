"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Coins } from "lucide-react"

interface Portfolio {
  id: number
  name: string
  description?: string
  asset_count: number
  total_value: number
  created_at: string
}

interface PortfolioCardProps {
  portfolio: Portfolio
  onClick: () => void
}

export function PortfolioCard({ portfolio, onClick }: PortfolioCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount)
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{portfolio.name}</CardTitle>
        <Building2 className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{formatCurrency(portfolio.total_value)}</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              {portfolio.asset_count} assets
            </Badge>
          </div>
          {portfolio.description && <p className="text-sm text-muted-foreground">{portfolio.description}</p>}
          <div className="text-xs text-muted-foreground">
            Created {new Date(portfolio.created_at).toLocaleDateString("no-NO")}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
