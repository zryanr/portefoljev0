import { type NextRequest, NextResponse } from "next/server"
import { PriceService } from "@/lib/price-providers"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const assetType = (searchParams.get("type") as "stock" | "fund") || "stock"

    const priceService = new PriceService(process.env.ALPHA_VANTAGE_API_KEY)
    const priceData = await priceService.getPrice(params.symbol, assetType)

    if (!priceData) {
      return NextResponse.json({ error: "Price data not found" }, { status: 404 })
    }

    // Store price history in database
    try {
      // First, find the asset ID by symbol
      const [asset] = await sql`
        SELECT id FROM assets WHERE symbol = ${params.symbol} LIMIT 1
      `

      if (asset) {
        // Insert price history record
        await sql`
          INSERT INTO price_history (asset_id, price, currency, source, recorded_at)
          VALUES (${asset.id}, ${priceData.price}, ${priceData.currency}, ${priceData.source}, NOW())
        `

        // Update current price in assets table
        await sql`
          UPDATE assets 
          SET current_price = ${priceData.price}, last_updated = NOW()
          WHERE symbol = ${params.symbol}
        `
      }
    } catch (dbError) {
      console.error("Database error storing price:", dbError)
      // Continue even if database update fails
    }

    return NextResponse.json(priceData)
  } catch (error) {
    console.error("Error fetching price:", error)
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 })
  }
}
