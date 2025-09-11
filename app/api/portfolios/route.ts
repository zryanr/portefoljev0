import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

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

    return NextResponse.json(portfolios)
  } catch (error) {
    console.error("Error fetching portfolios:", error)
    return NextResponse.json({ error: "Failed to fetch portfolios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, userId } = await request.json()

    if (!name || !userId) {
      return NextResponse.json({ error: "Name and user ID are required" }, { status: 400 })
    }

    const [portfolio] = await sql`
      INSERT INTO portfolios (name, description, user_id)
      VALUES (${name}, ${description || null}, ${userId})
      RETURNING *
    `

    return NextResponse.json(portfolio, { status: 201 })
  } catch (error) {
    console.error("Error creating portfolio:", error)
    return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 })
  }
}
