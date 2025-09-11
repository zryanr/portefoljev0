"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface PortfolioValueAnimationProps {
  currentValue: number
  previousValue?: number
  currency?: string
}

export function PortfolioValueAnimation({
  currentValue,
  previousValue,
  currency = "NOK",
}: PortfolioValueAnimationProps) {
  const [displayValue, setDisplayValue] = useState(previousValue || currentValue)
  const [isAnimating, setIsAnimating] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency,
    }).format(amount)
  }

  useEffect(() => {
    if (previousValue !== undefined && currentValue !== previousValue) {
      setIsAnimating(true)

      // Animate the value change
      const difference = currentValue - previousValue
      const steps = 30
      const stepValue = difference / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const newValue = previousValue + stepValue * currentStep
        setDisplayValue(newValue)

        if (currentStep >= steps) {
          clearInterval(interval)
          setDisplayValue(currentValue)
          setIsAnimating(false)
        }
      }, 50) // 1.5 second animation

      return () => clearInterval(interval)
    } else {
      setDisplayValue(currentValue)
    }
  }, [currentValue, previousValue])

  const change = previousValue ? currentValue - previousValue : 0
  const changePercent = previousValue ? (change / previousValue) * 100 : 0
  const isPositive = change >= 0

  return (
    <Card className={`transition-all duration-300 ${isAnimating ? "ring-2 ring-primary/20" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Porteføljeverdi</CardTitle>
        {isAnimating && (
          <div className="animate-pulse">
            <div className="h-2 w-2 bg-primary rounded-full"></div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold transition-colors duration-300 ${isAnimating ? "text-primary" : ""}`}>
          {formatCurrency(displayValue)}
        </div>

        {previousValue && change !== 0 && (
          <div className={`flex items-center text-sm mt-1 ${isPositive ? "text-primary" : "text-destructive"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            <span>
              {isPositive ? "+" : ""}
              {formatCurrency(change)} ({isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
