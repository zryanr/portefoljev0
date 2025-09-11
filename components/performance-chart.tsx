"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface PerformanceChartProps {
  portfolios: any[]
}

export function PerformanceChart({ portfolios }: PerformanceChartProps) {
  // Mock performance data
  const performanceData = [
    { date: "2024-01", value: 450000 },
    { date: "2024-02", value: 465000 },
    { date: "2024-03", value: 478000 },
    { date: "2024-04", value: 492000 },
    { date: "2024-05", value: 485000 },
    { date: "2024-06", value: 510000 },
    { date: "2024-07", value: 525000 },
    { date: "2024-08", value: 518000 },
    { date: "2024-09", value: 535000 },
    { date: "2024-10", value: 548000 },
    { date: "2024-11", value: 562000 },
    { date: "2024-12", value: 575000 },
  ]

  const allocationData = [
    { name: "Aksjer", value: 45, color: "var(--chart-1)" },
    { name: "Fond", value: 30, color: "var(--chart-2)" },
    { name: "Eiendom", value: 20, color: "var(--chart-3)" },
    { name: "Kontanter", value: 5, color: "var(--chart-4)" },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ytelsesanalyse</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            1M
          </Button>
          <Button variant="outline" size="sm">
            3M
          </Button>
          <Button variant="outline" size="sm">
            6M
          </Button>
          <Button variant="default" size="sm">
            1Å
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Porteføljeutvikling
              <Badge variant="secondary" className="text-primary">
                +25.2% i år
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                <YAxis className="text-muted-foreground" fontSize={12} tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Verdi"]}
                  labelFormatter={(label) => `Måned: ${label}`}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "var(--primary)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivafordeling</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Andel"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {allocationData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
