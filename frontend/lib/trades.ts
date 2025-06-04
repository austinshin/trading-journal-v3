import { supabase } from './supabase';
import { Trade, Tag, TradeTag } from './supabase';

export interface CreateTradeData {
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entry_price: number;
  exit_price: number;
  commission?: number;
  setup?: string;
  mistakes?: string;
  lessons?: string;
  market_conditions?: string;
  sector_momentum?: string;
  stop_loss?: number;
  target?: number;
  screenshots?: string[];
  date?: string;
  entry_time?: string;
  exit_time?: string;
}

export interface TradeWithTags extends Trade {
  tags: Tag[];
}

export class TradesAPI {
  static async createTrade(tradeData: CreateTradeData, tagIds: string[] = []): Promise<Trade> {
    // Get current user for user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found. Please sign in first.');
    }

    // Calculate P&L
    const grossPnl = (tradeData.exit_price - tradeData.entry_price) * tradeData.quantity;
    const netPnl = grossPnl - (tradeData.commission || 0);

    // Calculate risk/reward if we have stop loss and target
    let riskReward = null;
    if (tradeData.stop_loss && tradeData.target) {
      const risk = Math.abs(tradeData.entry_price - tradeData.stop_loss);
      const reward = Math.abs(tradeData.target - tradeData.entry_price);
      riskReward = reward / risk;
    }

    const trade = {
      ...tradeData,
      user_id: user.id,
      gross_pnl: grossPnl,
      net_pnl: netPnl,
      risk_reward: riskReward,
      commission: tradeData.commission || 0,
      screenshots: tradeData.screenshots || [],
      date: tradeData.date || new Date().toISOString().split('T')[0],
      entry_time: tradeData.entry_time || new Date().toISOString(),
      exit_time: tradeData.exit_time || new Date().toISOString(),
    };

    // Insert trade
    const { data: tradeResult, error: tradeError } = await supabase
      .from('trades')
      .insert(trade)
      .select()
      .single();

    if (tradeError) throw tradeError;

    // Add tags if provided
    if (tagIds.length > 0 && tradeResult) {
      const { error: tagError } = await supabase
        .from('trade_tags')
        .insert(
          tagIds.map(tagId => ({
            trade_id: tradeResult.id,
            tag_id: tagId
          }))
        );

      if (tagError) throw tagError;
    }

    return tradeResult;
  }

  static async getTrades(limit = 50, offset = 0): Promise<TradeWithTags[]> {
    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        trade_tags(
          tags(*)
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Transform the data to flatten tags
    return data.map(trade => ({
      ...trade,
      tags: trade.trade_tags?.map((tt: any) => tt.tags).filter(Boolean) || []
    }));
  }

  static async getTradeById(id: string): Promise<TradeWithTags | null> {
    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        trade_tags(
          tags(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      tags: data.trade_tags?.map((tt: any) => tt.tags).filter(Boolean) || []
    };
  }

  static async updateTrade(id: string, updates: Partial<CreateTradeData>): Promise<Trade> {
    // Recalculate P&L if price/quantity changed
    let updateData: any = { ...updates };
    
    if (updates.entry_price || updates.exit_price || updates.quantity || updates.commission !== undefined) {
      const { data: currentTrade } = await supabase
        .from('trades')
        .select('entry_price, exit_price, quantity, commission')
        .eq('id', id)
        .single();

      if (currentTrade) {
        const entryPrice = updates.entry_price ?? currentTrade.entry_price;
        const exitPrice = updates.exit_price ?? currentTrade.exit_price;
        const quantity = updates.quantity ?? currentTrade.quantity;
        const commission = updates.commission ?? currentTrade.commission;

        const grossPnl = (exitPrice - entryPrice) * quantity;
        const netPnl = grossPnl - commission;

        updateData = { ...updateData, gross_pnl: grossPnl, net_pnl: netPnl };
      }
    }

    const { data, error } = await supabase
      .from('trades')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTrade(id: string): Promise<void> {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getTradeStats() {
    const { data: trades, error } = await supabase
      .from('trades')
      .select('net_pnl, side, created_at');

    if (error) throw error;

    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.net_pnl > 0).length;
    const losingTrades = trades.filter(t => t.net_pnl < 0).length;
    const totalPnl = trades.reduce((sum, t) => sum + t.net_pnl, 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    // Calculate today's P&L
    const today = new Date().toISOString().split('T')[0];
    const todaysTrades = trades.filter(t => t.created_at.startsWith(today));
    const todaysPnl = todaysTrades.reduce((sum, t) => sum + t.net_pnl, 0);

    // Calculate this week's P&L
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekTrades = trades.filter(t => new Date(t.created_at) >= weekAgo);
    const thisWeekPnl = thisWeekTrades.reduce((sum, t) => sum + t.net_pnl, 0);

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalPnl,
      todaysPnl,
      todaysTradeCount: todaysTrades.length,
      thisWeekPnl,
      thisWeekTradeCount: thisWeekTrades.length
    };
  }

  static async getTradeAnalysis(id: string) {
    // Get the trade from Supabase instead of backend API
    const trade = await this.getTradeById(id);
    
    if (!trade) {
      throw new Error('Trade not found');
    }

    try {
      // Fetch real market data from backend
      console.log(`Fetching market data for ${trade.symbol} from backend...`);
      const response = await fetch(`http://localhost:8000/enrich/${trade.symbol}`);
      
      console.log(`Response status: ${response.status}, OK: ${response.ok}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      
      const marketData = await response.json();
      console.log('Market data received:', marketData);
      
      // Check if there was an error in the enrichment
      if (marketData.error) {
        throw new Error(marketData.error);
      }

      // Calculate performance metrics
      const currentPrice = marketData.price || trade.exit_price;
      const performanceSinceEntry = ((currentPrice - trade.entry_price) / trade.entry_price * 100);
      const performanceSinceExit = ((currentPrice - trade.exit_price) / trade.exit_price * 100);
      
      // Transform news data to include URLs
      const news = (marketData.news || []).map((headline: string, index: number) => ({
        headline: headline || `${trade.symbol} market update`,
        url: `https://finance.yahoo.com/quote/${trade.symbol}/news/`,
        source: 'Financial News',
        time: `${index + 1} hours ago`
      }));

      return {
        trade: trade,
        market_analysis: {
          price: currentPrice,
          prev_close: marketData.prev_close || trade.exit_price,
          open: marketData.open || trade.exit_price,
          high: marketData.high || trade.exit_price,
          low: marketData.low || trade.exit_price,
          change_pct: marketData.change_pct || 0,
          gap_pct: marketData.gap_pct || 0,
          volume: marketData.volume || 0,
          avg_volume_10d: marketData.avg_volume_10d,
          float_shares: marketData.float_shares || 0,
          market_cap: marketData.market_cap,
          risk: marketData.risk || 'Unknown',
          week_52_high: marketData.week_52_high,
          week_52_low: marketData.week_52_low,
          dilution_pct_float: marketData.dilution_pct_float,
          news: news,
          latest_filing: marketData.latest_filing ? {
            title: `Recent ${marketData.latest_filing} filing for ${trade.symbol}`,
            url: `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${trade.symbol}&action=getcompany`,
            type: marketData.latest_filing,
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString()
          } : null
        },
        performance_metrics: {
          current_price: currentPrice,
          performance_since_entry: Number(performanceSinceEntry.toFixed(2)),
          performance_since_exit: Number(performanceSinceExit.toFixed(2)),
          would_be_profitable_now: trade.side === 'LONG' ? 
            currentPrice > trade.entry_price : 
            currentPrice < trade.entry_price
        }
      };
    } catch (error) {
      // Fallback to basic trade data if market data fetch fails
      console.error('Failed to fetch market data:', error);
      
      return {
        trade: trade,
        market_analysis: {
          price: trade.exit_price,
          change_pct: 0,
          volume: 0,
          gap_pct: 0,
          float_shares: 0,
          market_cap: null,
          risk: 'Unknown',
          news: [{
            headline: `Market data temporarily unavailable for ${trade.symbol}`,
            url: `https://finance.yahoo.com/quote/${trade.symbol}`,
            source: 'Fallback',
            time: 'N/A'
          }],
          latest_filing: null
        },
        performance_metrics: {
          current_price: trade.exit_price,
          performance_since_entry: 0,
          performance_since_exit: 0,
          would_be_profitable_now: false
        }
      };
    }
  }
} 