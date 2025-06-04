import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type TradeSide = 'LONG' | 'SHORT';
export type RiskLevel = 'High' | 'Medium' | 'Low' | 'Unknown';

export type Trade = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  
  // Trade Details
  date: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  entry_price: number;
  exit_price: number;
  
  // P&L
  gross_pnl: number;
  commission: number;
  net_pnl: number;
  
  // Analysis
  setup: string | null;
  mistakes: string | null;
  lessons: string | null;
  
  // Media
  screenshots: string[];
  
  // Market Context
  market_conditions: string | null;
  sector_momentum: string | null;
  
  // Trade Management
  entry_time: string;
  exit_time: string;
  stop_loss: number | null;
  target: number | null;
  risk_reward: number | null;
};

export type Tag = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export type TradeTag = {
  trade_id: string;
  tag_id: string;
  created_at: string;
};

export type WatchlistItem = {
  id: string;
  user_id: string;
  symbol: string;
  notes: string | null;
  risk_level: RiskLevel;
  price_alert_high: number | null;
  price_alert_low: number | null;
  created_at: string;
  updated_at: string;
}; 