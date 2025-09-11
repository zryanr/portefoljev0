import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

// Database types
export interface Portfolio {
  id: number
  user_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Asset {
  id: number
  portfolio_id: number
  name: string
  symbol?: string
  asset_type: "stock" | "fund" | "real_estate" | "cash"
  currency: "NOK" | "USD" | "EUR" | "SEK" | "DKK"
  platform?: string
  current_price?: number
  quantity: number
  average_cost?: number
  last_updated: string
  created_at: string
  metadata?: Record<string, any>
}

export interface Transaction {
  id: number
  asset_id: number
  transaction_type: "buy" | "sell" | "dividend" | "fee"
  quantity: number
  price: number
  total_amount: number
  fee: number
  transaction_date: string
  notes?: string
  created_at: string
}

export interface PriceHistory {
  id: number
  asset_id: number
  price: number
  currency: "NOK" | "USD" | "EUR" | "SEK" | "DKK"
  source?: string
  recorded_at: string
}

export interface MarketData {
  id: number
  symbol: string
  name: string
  exchange?: string
  isin?: string
  currency: "NOK" | "USD" | "EUR" | "SEK" | "DKK"
  sector?: string
  last_updated: string
  metadata?: Record<string, any>
}
