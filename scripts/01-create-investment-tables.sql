-- Create investment tracking tables for Norwegian PWA

-- Portfolio table to group investments
CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users_sync(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset types: stocks, funds, real_estate, cash
CREATE TYPE asset_type AS ENUM ('stock', 'fund', 'real_estate', 'cash');
CREATE TYPE currency AS ENUM ('NOK', 'USD', 'EUR', 'SEK', 'DKK');

-- Assets table for individual investments
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbol TEXT, -- For stocks/funds (e.g., 'EQNR.OL' for Equinor on Oslo Stock Exchange)
  asset_type asset_type NOT NULL,
  currency currency DEFAULT 'NOK',
  platform TEXT, -- Norwegian platforms like Nordnet, DNB, Storebrand, etc.
  current_price DECIMAL(12,4),
  quantity DECIMAL(12,6) NOT NULL DEFAULT 0,
  average_cost DECIMAL(12,4),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- For additional data like property address, ISIN codes, etc.
);

-- Transactions table for buy/sell history
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'dividend', 'fee')),
  quantity DECIMAL(12,6) NOT NULL,
  price DECIMAL(12,4) NOT NULL,
  total_amount DECIMAL(12,4) NOT NULL,
  fee DECIMAL(12,4) DEFAULT 0,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price history for tracking asset performance
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  price DECIMAL(12,4) NOT NULL,
  currency currency DEFAULT 'NOK',
  source TEXT, -- 'yahoo_finance', 'manual', 'api', etc.
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Norwegian market data for stocks/funds
CREATE TABLE IF NOT EXISTS market_data (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  exchange TEXT, -- 'OSE' (Oslo Stock Exchange), 'NASDAQ_OMX', etc.
  isin TEXT,
  currency currency DEFAULT 'NOK',
  sector TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_portfolio_id ON assets(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON assets(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_price_history_asset_id ON price_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);

-- Insert some sample Norwegian market data
INSERT INTO market_data (symbol, name, exchange, currency, sector) VALUES
('EQNR.OL', 'Equinor ASA', 'OSE', 'NOK', 'Energy'),
('DNB.OL', 'DNB Bank ASA', 'OSE', 'NOK', 'Financial Services'),
('MOWI.OL', 'Mowi ASA', 'OSE', 'NOK', 'Consumer Defensive'),
('TEL.OL', 'Telenor ASA', 'OSE', 'NOK', 'Communication Services'),
('YAR.OL', 'Yara International ASA', 'OSE', 'NOK', 'Basic Materials')
ON CONFLICT (symbol) DO NOTHING;
