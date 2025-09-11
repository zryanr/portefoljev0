// Price data providers for Norwegian and international markets

export interface PriceData {
  symbol: string
  price: number
  currency: string
  change: number
  changePercent: number
  lastUpdated: string
  source: string
}

export interface MarketQuote {
  symbol: string
  name?: string
  price: number
  previousClose?: number
  change?: number
  changePercent?: number
  volume?: number
  marketCap?: number
  currency: string
  exchange?: string
}

// Yahoo Finance API (free tier)
export class YahooFinanceProvider {
  private baseUrl = "https://query1.finance.yahoo.com/v8/finance/chart"

  async getQuote(symbol: string): Promise<PriceData | null> {
    try {
      // Add .OL suffix for Oslo Stock Exchange if not present
      const formattedSymbol = this.formatNorwegianSymbol(symbol)

      const response = await fetch(`${this.baseUrl}/${formattedSymbol}`)
      const data = await response.json()

      if (!data.chart?.result?.[0]) {
        throw new Error("No data found")
      }

      const result = data.chart.result[0]
      const meta = result.meta
      const quote = result.indicators.quote[0]

      const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1]
      const previousClose = meta.previousClose || quote.close[quote.close.length - 2]
      const change = currentPrice - previousClose
      const changePercent = (change / previousClose) * 100

      return {
        symbol: formattedSymbol,
        price: currentPrice,
        currency: meta.currency || "NOK",
        change,
        changePercent,
        lastUpdated: new Date().toISOString(),
        source: "yahoo_finance",
      }
    } catch (error) {
      console.error(`Yahoo Finance error for ${symbol}:`, error)
      return null
    }
  }

  async getBatchQuotes(symbols: string[]): Promise<PriceData[]> {
    const promises = symbols.map((symbol) => this.getQuote(symbol))
    const results = await Promise.allSettled(promises)

    return results
      .filter(
        (result): result is PromiseFulfilledResult<PriceData> => result.status === "fulfilled" && result.value !== null,
      )
      .map((result) => result.value)
  }

  private formatNorwegianSymbol(symbol: string): string {
    // Add .OL suffix for Oslo Stock Exchange stocks if not present
    if (symbol.match(/^[A-Z]{3,5}$/) && !symbol.includes(".")) {
      return `${symbol}.OL`
    }
    return symbol
  }
}

// Alpha Vantage API (requires API key)
export class AlphaVantageProvider {
  private baseUrl = "https://www.alphavantage.co/query"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getQuote(symbol: string): Promise<PriceData | null> {
    try {
      const response = await fetch(`${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`)
      const data = await response.json()

      const quote = data["Global Quote"]
      if (!quote) {
        throw new Error("No quote data found")
      }

      const price = Number.parseFloat(quote["05. price"])
      const previousClose = Number.parseFloat(quote["08. previous close"])
      const change = Number.parseFloat(quote["09. change"])
      const changePercent = Number.parseFloat(quote["10. change percent"].replace("%", ""))

      return {
        symbol,
        price,
        currency: "USD", // Alpha Vantage primarily provides USD prices
        change,
        changePercent,
        lastUpdated: quote["07. latest trading day"],
        source: "alpha_vantage",
      }
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error)
      return null
    }
  }
}

// Norwegian fund data provider (using public APIs)
export class NorwegianFundProvider {
  async getFundPrice(isin: string): Promise<PriceData | null> {
    try {
      // This would integrate with Norwegian fund providers like:
      // - Morningstar Norway
      // - Fondsfinans.no
      // - Individual fund company APIs (DNB, Storebrand, etc.)

      // Mock implementation - in real app, integrate with actual APIs
      const mockFundData = {
        NO0010841588: { name: "DNB Norge (I)", price: 1850.5, change: 12.3 },
        NO0010582521: { name: "Storebrand Norge I", price: 245.8, change: -2.1 },
        NO0010337682: { name: "KLP AksjeNorge Indeks", price: 189.2, change: 5.7 },
      }

      const fundData = mockFundData[isin as keyof typeof mockFundData]
      if (!fundData) return null

      return {
        symbol: isin,
        price: fundData.price,
        currency: "NOK",
        change: fundData.change,
        changePercent: (fundData.change / (fundData.price - fundData.change)) * 100,
        lastUpdated: new Date().toISOString(),
        source: "norwegian_funds",
      }
    } catch (error) {
      console.error(`Norwegian fund error for ${isin}:`, error)
      return null
    }
  }
}

// Main price service that aggregates multiple providers
export class PriceService {
  private yahooProvider: YahooFinanceProvider
  private alphaVantageProvider?: AlphaVantageProvider
  private fundProvider: NorwegianFundProvider

  constructor(alphaVantageApiKey?: string) {
    this.yahooProvider = new YahooFinanceProvider()
    this.fundProvider = new NorwegianFundProvider()

    if (alphaVantageApiKey) {
      this.alphaVantageProvider = new AlphaVantageProvider(alphaVantageApiKey)
    }
  }

  async getPrice(symbol: string, assetType: "stock" | "fund" = "stock"): Promise<PriceData | null> {
    try {
      if (assetType === "fund" && symbol.startsWith("NO")) {
        // Norwegian fund (ISIN format)
        return await this.fundProvider.getFundPrice(symbol)
      }

      // Try Yahoo Finance first (free and reliable for Norwegian stocks)
      let priceData = await this.yahooProvider.getQuote(symbol)

      // Fallback to Alpha Vantage if available and Yahoo fails
      if (!priceData && this.alphaVantageProvider) {
        priceData = await this.alphaVantageProvider.getQuote(symbol)
      }

      return priceData
    } catch (error) {
      console.error(`Price service error for ${symbol}:`, error)
      return null
    }
  }

  async getBatchPrices(assets: Array<{ symbol: string; assetType: "stock" | "fund" }>): Promise<PriceData[]> {
    const promises = assets.map((asset) => this.getPrice(asset.symbol, asset.assetType))
    const results = await Promise.allSettled(promises)

    return results
      .filter(
        (result): result is PromiseFulfilledResult<PriceData> => result.status === "fulfilled" && result.value !== null,
      )
      .map((result) => result.value)
  }
}
