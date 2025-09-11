import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const portfolioId = Number.parseInt(params.id)

    const assets = await sql`
      SELECT a.*, 
             COALESCE(a.current_price * a.quantity, 0) as market_value,
             COALESCE(a.average_cost * a.quantity, 0) as book_value,
             CASE 
               WHEN a.average_cost > 0 THEN 
                 ((a.current_price - a.average_cost) / a.average_cost) * 100
               ELSE 0 
             END as return_percentage
      FROM assets a
      WHERE a.portfolio_id = ${portfolioId}
      ORDER BY a.created_at DESC
    `

    return NextResponse.json(assets)
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const portfolioId = Number.parseInt(params.id)
    const {
      name,
      symbol,
      asset_type,
      currency = "NOK",
      platform,
      quantity,
      average_cost,
      metadata,
    } = await request.json()

    if (!name || !asset_type || quantity === undefined) {
      return NextResponse.json(
        {
          error: "Name, asset type, and quantity are required",
        },
        { status: 400 },
      )
    }

    const [asset] = await sql`
      INSERT INTO assets (
        portfolio_id, name, symbol, asset_type, currency, 
        platform, quantity, average_cost, metadata
      )
      VALUES (
        ${portfolioId}, ${name}, ${symbol || null}, ${asset_type}, 
        ${currency}, ${platform || null}, ${quantity}, 
        ${average_cost || null}, ${JSON.stringify(metadata || {})}
      )
      RETURNING *
    `

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 })
  }
}
