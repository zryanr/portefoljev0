import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assetId = Number.parseInt(params.id)
    const { name, symbol, quantity, average_cost, current_price, platform, metadata } = await request.json()

    const [asset] = await sql`
      UPDATE assets 
      SET 
        name = COALESCE(${name}, name),
        symbol = COALESCE(${symbol}, symbol),
        quantity = COALESCE(${quantity}, quantity),
        average_cost = COALESCE(${average_cost}, average_cost),
        current_price = COALESCE(${current_price}, current_price),
        platform = COALESCE(${platform}, platform),
        metadata = COALESCE(${JSON.stringify(metadata)}, metadata),
        last_updated = NOW()
      WHERE id = ${assetId}
      RETURNING *
    `

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Error updating asset:", error)
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assetId = Number.parseInt(params.id)

    const [asset] = await sql`
      DELETE FROM assets 
      WHERE id = ${assetId}
      RETURNING id
    `

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Asset deleted successfully" })
  } catch (error) {
    console.error("Error deleting asset:", error)
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
  }
}
