-- Migration for Saved Watchlists Feature
-- This adds the ability to save, name, and manage multiple watchlists

-- Create saved_watchlists table
CREATE TABLE IF NOT EXISTS saved_watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create saved_watchlist_items table (junction table)
CREATE TABLE IF NOT EXISTS saved_watchlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watchlist_id UUID REFERENCES saved_watchlists(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(watchlist_id, symbol)
);

-- Enable RLS
ALTER TABLE saved_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_watchlist_items ENABLE ROW LEVEL SECURITY;

-- Saved watchlists policies
DROP POLICY IF EXISTS "Users can view their own saved watchlists" ON saved_watchlists;
CREATE POLICY "Users can view their own saved watchlists"
    ON saved_watchlists FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved watchlists" ON saved_watchlists;
CREATE POLICY "Users can insert their own saved watchlists"
    ON saved_watchlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved watchlists" ON saved_watchlists;
CREATE POLICY "Users can update their own saved watchlists"
    ON saved_watchlists FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved watchlists" ON saved_watchlists;
CREATE POLICY "Users can delete their own saved watchlists"
    ON saved_watchlists FOR DELETE
    USING (auth.uid() = user_id);

-- Saved watchlist items policies
DROP POLICY IF EXISTS "Users can view their own saved watchlist items" ON saved_watchlist_items;
CREATE POLICY "Users can view their own saved watchlist items"
    ON saved_watchlist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM saved_watchlists
            WHERE saved_watchlists.id = saved_watchlist_items.watchlist_id
            AND saved_watchlists.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage their own saved watchlist items" ON saved_watchlist_items;
CREATE POLICY "Users can manage their own saved watchlist items"
    ON saved_watchlist_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM saved_watchlists
            WHERE saved_watchlists.id = saved_watchlist_items.watchlist_id
            AND saved_watchlists.user_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS saved_watchlists_user_id_idx ON saved_watchlists(user_id);
CREATE INDEX IF NOT EXISTS saved_watchlists_created_at_idx ON saved_watchlists(created_at DESC);
CREATE INDEX IF NOT EXISTS saved_watchlist_items_watchlist_id_idx ON saved_watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS saved_watchlist_items_symbol_idx ON saved_watchlist_items(symbol);

-- Create updated_at trigger for saved_watchlists
DROP TRIGGER IF EXISTS update_saved_watchlists_updated_at ON saved_watchlists;
CREATE TRIGGER update_saved_watchlists_updated_at
    BEFORE UPDATE ON saved_watchlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 