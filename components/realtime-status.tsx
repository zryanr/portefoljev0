"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react"

interface RealtimeStatusProps {
  isConnected: boolean
  lastUpdate: Date | null
  error: string | null
  onReconnect: () => void
}

export function RealtimeStatus({ isConnected, lastUpdate, error, onReconnect }: RealtimeStatusProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">Tilkoblingsfeil: {error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={onReconnect}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Koble til igjen
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-primary" />
            <Badge variant="default" className="bg-primary">
              Live
            </Badge>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">Frakoblet</Badge>
          </>
        )}
        <span className="text-sm text-muted-foreground">
          {lastUpdate ? `Sist oppdatert: ${formatTime(lastUpdate)}` : "Venter på data..."}
        </span>
      </div>

      {!isConnected && (
        <Button variant="outline" size="sm" onClick={onReconnect}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Koble til
        </Button>
      )}
    </div>
  )
}
