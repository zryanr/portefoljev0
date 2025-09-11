"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InvestmentDashboard() {
  const [portfolios] = useState([
    {
      id: 1,
      name: "Norske Aksjer",
      description: "Hovedportefølje for norske aksjer",
      total_value: 450000,
      asset_count: 8,
      created_at: "2024-01-15",
    },
    {
      id: 2,
      name: "Fond og ETF",
      description: "Diversifiserte fond og ETF-er",
      total_value: 320000,
      asset_count: 5,
      created_at: "2024-02-01",
    },
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount)
  }

  const totalValue = portfolios.reduce((sum, portfolio) => sum + portfolio.total_value, 0)
  const totalAssets = portfolios.reduce((sum, portfolio) => sum + portfolio.asset_count, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mine Investeringer</h1>
              <p className="text-muted-foreground">Oversikt over dine investeringer</p>
            </div>
            <Button>Legg til Portefølje</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Porteføljeverdi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">+2.3% siden i går</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Porteføljer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolios.length}</div>
              <p className="text-xs text-muted-foreground">{totalAssets} totale investeringer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beste Investering</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+15.2%</div>
              <p className="text-xs text-muted-foreground">Equinor (EQNR.OL)</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="portfolios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolios">Porteføljer</TabsTrigger>
            <TabsTrigger value="assets">Investeringer</TabsTrigger>
            <TabsTrigger value="performance">Ytelse</TabsTrigger>
            <TabsTrigger value="analysis">Analyse</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolios" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Dine Porteføljer</h2>
              <Badge variant="secondary">{portfolios.length} porteføljer</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <Card key={portfolio.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{portfolio.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{formatCurrency(portfolio.total_value)}</span>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {portfolio.asset_count} assets
                        </Badge>
                      </div>
                      {portfolio.description && (
                        <p className="text-sm text-muted-foreground">{portfolio.description}</p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Opprettet {new Date(portfolio.created_at).toLocaleDateString("no-NO")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alle Investeringer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Equinor ASA</h3>
                      <p className="text-sm text-muted-foreground">Aksjer • EQNR.OL • Nordnet</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{formatCurrency(285500)}</div>
                      <div className="text-sm text-primary">+14.2%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">DNB Norge (I)</h3>
                      <p className="text-sm text-muted-foreground">Fond • NO0010841588 • DNB</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{formatCurrency(93425)}</div>
                      <div className="text-sm text-primary">+7.6%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ytelsesanalyse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detaljerte ytelsesgrafer kommer snart...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portefølje Analyse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detaljert analyse av dine investeringer kommer snart...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
