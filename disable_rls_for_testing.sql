-- Temporarily disable RLS for testing/development
-- Run this if you want to test seeding without authentication

ALTER TABLE trades DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE trade_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist DISABLE ROW LEVEL SECURITY;

-- To re-enable later, run:
-- ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY; 