import type { NextRequest } from "next/server"
import { sql } from "@/lib/database"
import { PriceService } from "@/lib/price-providers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return new Response("User ID required", { status: 400 })
  }

  // Set up Server-Sent Events
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`
      controller.enqueue(encoder.encode(data))

      // Set up periodic updates
      const updateInterval = setInterval(async () => {
        try {
          // Get user's portfolios and assets
          const portfolios = await sql`
            SELECT p.*, 
                   COUNT(a.id) as asset_count,
                   COALESCE(SUM(a.current_price * a.quantity), 0) as total_value
            FROM portfolios p
            LEFT JOIN assets a ON p.id = a.portfolio_id
            WHERE p.user_id = ${userId}
            GROUP BY p.id
            ORDER BY p.created_at DESC
          `

          // Get assets that need price updates
          const assets = await sql`
            SELECT DISTINCT a.symbol, a.asset_type
            FROM assets a
            JOIN portfolios p ON a.portfolio_id = p.id
            WHERE p.user_id = ${userId} 
            AND a.symbol IS NOT NULL
            AND a.last_updated < NOW() - INTERVAL '1 minute'
          `

          // Update prices if needed
          if (assets.length > 0) {
            const priceService = new PriceService(process.env.ALPHA_VANTAGE_API_KEY)
            const priceUpdates = await priceService.getBatchPrices(
              assets.map((a) => ({ symbol: a.symbol, assetType: a.asset_type })),
            )

            // Update database with new prices
            for (const price of priceUpdates) {
              await sql`
                UPDATE assets 
                SET current_price = ${price.price}, last_updated = NOW()
                WHERE symbol = ${price.symbol}
              `
            }
          }

          // Send updated portfolio data
          const updateData = {
            type: "portfolio_update",
            portfolios,
            timestamp: new Date().toISOString(),
            pricesUpdated: assets.length > 0,
          }

          const message = `data: ${JSON.stringify(updateData)}\n\n`
          controller.enqueue(encoder.encode(message))
        } catch (error) {
          console.error("Real-time update error:", error)
          const errorData = {
            type: "error",
            message: "Failed to update portfolio data",
            timestamp: new Date().toISOString(),
          }
          const message = `data: ${JSON.stringify(errorData)}\n\n`
          controller.enqueue(encoder.encode(message))
        }
      }, 30000) // Update every 30 seconds

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(updateInterval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
