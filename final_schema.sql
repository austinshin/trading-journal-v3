-- Final schema - creates everything in the right order

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types (safe)
DO $$ BEGIN
    CREATE TYPE trade_side AS ENUM ('LONG', 'SHORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('High', 'Medium', 'Low', 'Unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables first
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL,
    
    -- Trade Details
    date DATE NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    side trade_side NOT NULL,
    quantity NUMERIC(20, 8) NOT NULL,
    entry_price NUMERIC(20, 8) NOT NULL,
    exit_price NUMERIC(20, 8) NOT NULL,
    
    -- P&L
    gross_pnl NUMERIC(20, 8) NOT NULL,
    commission NUMERIC(20, 8) NOT NULL DEFAULT 0,
    net_pnl NUMERIC(20, 8) NOT NULL,
    
    -- Analysis
    setup TEXT,
    mistakes TEXT,
    lessons TEXT,
    
    -- Media
    screenshots TEXT[],
    
    -- Market Context
    market_conditions TEXT,
    sector_momentum TEXT,
    
    -- Trade Management
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE NOT NULL,
    stop_loss NUMERIC(20, 8),
    target NUMERIC(20, 8),
    risk_reward NUMERIC(5, 2),
    
    -- Metadata
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table with description column included
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, user_id)
);

-- Create trade_tags junction table
CREATE TABLE IF NOT EXISTS trade_tags (
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (trade_id, tag_id)
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    notes TEXT,
    risk_level risk_level DEFAULT 'Unknown',
    price_alert_high NUMERIC(20, 8),
    price_alert_low NUMERIC(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Now safely add description column if it doesn't exist (for existing installs)
DO $$ BEGIN
    ALTER TABLE tags ADD COLUMN description TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Enable RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view their own trades" ON trades;
DROP POLICY IF EXISTS "Users can insert their own trades" ON trades;
DROP POLICY IF EXISTS "Users can update their own trades" ON trades;
DROP POLICY IF EXISTS "Users can delete their own trades" ON trades;

CREATE POLICY "Users can view their own trades"
    ON trades FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
    ON trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
    ON trades FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
    ON trades FOR DELETE
    USING (auth.uid() = user_id);

-- Tags policies
DROP POLICY IF EXISTS "Users can view their own tags" ON tags;
DROP POLICY IF EXISTS "Users can insert their own tags" ON tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON tags;

CREATE POLICY "Users can view their own tags"
    ON tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
    ON tags FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
    ON tags FOR DELETE
    USING (auth.uid() = user_id);

-- Trade tags policies
DROP POLICY IF EXISTS "Users can view their own trade tags" ON trade_tags;
DROP POLICY IF EXISTS "Users can manage their own trade tags" ON trade_tags;

CREATE POLICY "Users can view their own trade tags"
    ON trade_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trades
            WHERE trades.id = trade_tags.trade_id
            AND trades.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own trade tags"
    ON trade_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trades
            WHERE trades.id = trade_tags.trade_id
            AND trades.user_id = auth.uid()
        )
    );

-- Watchlist policies
DROP POLICY IF EXISTS "Users can view their own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can insert into their own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can update their own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can delete from their own watchlist" ON watchlist;

CREATE POLICY "Users can view their own watchlist"
    ON watchlist FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own watchlist"
    ON watchlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist"
    ON watchlist FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist"
    ON watchlist FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS trades_user_id_idx ON trades(user_id);
CREATE INDEX IF NOT EXISTS trades_symbol_idx ON trades(symbol);
CREATE INDEX IF NOT EXISTS trades_date_idx ON trades(date);
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON tags(user_id);
CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS watchlist_symbol_idx ON watchlist(symbol);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_trades_updated_at ON trades;
CREATE TRIGGER update_trades_updated_at
    BEFORE UPDATE ON trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_watchlist_updated_at ON watchlist;
CREATE TRIGGER update_watchlist_updated_at
    BEFORE UPDATE ON watchlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 