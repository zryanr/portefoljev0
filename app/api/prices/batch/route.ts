import { type NextRequest, NextResponse } from "next/server"
import { PriceService } from "@/lib/price-providers"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { assets } = await request.json()

    if (!Array.isArray(assets)) {
      return NextResponse.json({ error: "Assets must be an array" }, { status: 400 })
    }

    const priceService = new PriceService(process.env.ALPHA_VANTAGE_API_KEY)
    const priceData = await priceService.getBatchPrices(assets)

    // Store price history for all assets
    for (const price of priceData) {
      try {
        const [asset] = await sql`
          SELECT id FROM assets WHERE symbol = ${price.symbol} LIMIT 1
        `

        if (asset) {
          // Insert price history
          await sql`
            INSERT INTO price_history (asset_id, price, currency, source, recorded_at)
            VALUES (${asset.id}, ${price.price}, ${price.currency}, ${price.source}, NOW())
          `

          // Update current price
          await sql`
            UPDATE assets 
            SET current_price = ${price.price}, last_updated = NOW()
            WHERE symbol = ${price.symbol}
          `
        }
      } catch (dbError) {
        console.error(`Database error for ${price.symbol}:`, dbError)
      }
    }

    return NextResponse.json({ prices: priceData, updated: priceData.length })
  } catch (error) {
    console.error("Error fetching batch prices:", error)
    return NextResponse.json({ error: "Failed to fetch batch prices" }, { status: 500 })
  }
}
