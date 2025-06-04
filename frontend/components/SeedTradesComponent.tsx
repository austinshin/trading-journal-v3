'use client';

import { useState } from 'react';
import { TradesAPI } from '../lib/trades';
import { supabase } from '../lib/supabase';

// Sample data generation
const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX', 'AMD', 'CRM', 'PLTR', 'SOFI', 'UPST', 'RBLX', 'COIN'];
const setups = [
  'Breakout above resistance',
  'Support bounce',
  'Flag continuation',
  'Cup and handle',
  'Earnings play',
  'Gap up follow-through',
  'Moving average bounce',
  'Trend continuation',
  'Reversal at key level',
  'Volume breakout',
  'News catalyst',
  'Sector rotation',
  'Oversold bounce',
  'Momentum continuation'
];

const marketConditions = [
  'Bullish market trend',
  'Bearish market trend',
  'Sideways choppy market',
  'High volatility',
  'Low volatility',
  'Pre-market strength',
  'After-hours weakness',
  'Strong sector momentum',
  'Weak sector momentum',
  'Overall market indecision'
];

const mistakes = [
  'Took profit too early',
  'Held too long',
  'Position size too large',
  'Ignored stop loss',
  'FOMO entry',
  'Revenge trading',
  'Poor entry timing',
  'Didn\'t wait for confirmation',
  'Traded against trend',
  'Emotional decision making'
];

const lessons = [
  'Stick to the plan',
  'Patience pays off',
  'Risk management is key',
  'Cut losses quickly',
  'Let winners run',
  'Wait for proper setup',
  'Size positions appropriately',
  'Follow the trend',
  'Don\'t fight the market',
  'Discipline over emotions'
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDate(daysBack: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * daysBack * 24 * 60 * 60 * 1000));
  return pastDate;
}

export default function SeedTradesComponent() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const createSampleTags = async () => {
    // Get current user for RLS
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      addLog('❌ No authenticated user found. Please sign in first.');
      return [];
    }

    const sampleTags = [
      { name: 'Breakout', description: 'Trades based on price breakouts', user_id: user.id },
      { name: 'Earnings', description: 'Trades around earnings announcements', user_id: user.id },
      { name: 'Momentum', description: 'High momentum trades', user_id: user.id },
      { name: 'Reversal', description: 'Trend reversal plays', user_id: user.id },
      { name: 'Gap-up', description: 'Gap up morning plays', user_id: user.id },
      { name: 'Scalp', description: 'Quick scalp trades', user_id: user.id },
      { name: 'Swing', description: 'Multi-day swing trades', user_id: user.id },
      { name: 'High-Vol', description: 'High volatility trades', user_id: user.id },
      { name: 'News', description: 'News-driven trades', user_id: user.id },
      { name: 'Tech', description: 'Technology sector trades', user_id: user.id }
    ];

    const { data: existingTags } = await supabase.from('tags').select('name');
    const existingTagNames = existingTags?.map(t => t.name) || [];
    
    const newTags = sampleTags.filter(tag => !existingTagNames.includes(tag.name));
    
    if (newTags.length > 0) {
      const { data, error } = await supabase
        .from('tags')
        .insert(newTags)
        .select();
      
      if (error) {
        addLog(`❌ Error creating tags: ${error.message}`);
        return [];
      }
      
      addLog(`✅ Created ${newTags.length} new tags`);
      return data;
    }
    
    const { data: allTags } = await supabase.from('tags').select();
    addLog(`📌 Using ${allTags?.length || 0} existing tags`);
    return allTags || [];
  };

  const generateSampleTrade = (tags: any[]) => {
    const symbol = randomElement(symbols);
    const side = randomElement(['LONG', 'SHORT']);
    const quantity = randomInt(10, 1000);
    
    // Generate realistic price data
    const basePrice = randomFloat(10, 500);
    const priceChange = randomFloat(0.01, 0.15) * basePrice;
    const isWinner = Math.random() > 0.4; // 60% win rate
    
    let entryPrice, exitPrice;
    if (side === 'LONG') {
      entryPrice = basePrice;
      exitPrice = isWinner ? basePrice + priceChange : basePrice - priceChange;
    } else {
      entryPrice = basePrice;
      exitPrice = isWinner ? basePrice - priceChange : basePrice + priceChange;
    }
    
    const commission = randomFloat(0.5, 5.0);
    const stopLoss = side === 'LONG' ? 
      entryPrice - (randomFloat(0.02, 0.08) * entryPrice) :
      entryPrice + (randomFloat(0.02, 0.08) * entryPrice);
    
    const target = side === 'LONG' ?
      entryPrice + (randomFloat(0.05, 0.20) * entryPrice) :
      entryPrice - (randomFloat(0.05, 0.20) * entryPrice);

    const tradeDate = generateRandomDate(30);
    const entryTime = new Date(tradeDate.getTime() + randomInt(9.5 * 60, 16 * 60) * 60000); // Market hours
    const exitTime = new Date(entryTime.getTime() + randomInt(1, 240) * 60000); // 1-240 minutes later

    const trade = {
      symbol,
      side: side as 'LONG' | 'SHORT',
      quantity,
      entry_price: entryPrice,
      exit_price: exitPrice,
      commission,
      setup: randomElement(setups),
      market_conditions: randomElement(marketConditions),
      sector_momentum: randomElement(['Strong', 'Weak', 'Neutral']),
      stop_loss: stopLoss,
      target: target,
      date: tradeDate.toISOString().split('T')[0],
      entry_time: entryTime.toISOString(),
      exit_time: exitTime.toISOString(),
      mistakes: !isWinner ? randomElement(mistakes) : undefined,
      lessons: randomElement(lessons)
    };

    // Randomly assign 1-3 tags
    const tradeTagIds = [];
    const numTags = randomInt(1, 3);
    const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
    for (let i = 0; i < Math.min(numTags, shuffledTags.length); i++) {
      tradeTagIds.push(shuffledTags[i].id);
    }

    return { trade, tagIds: tradeTagIds };
  };

  const seedTrades = async () => {
    setIsSeeding(true);
    setLogs([]);
    setStats(null);

    try {
      addLog('🌱 Starting to seed trades data...');
      
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        addLog('❌ No authenticated user found. You need to be signed in to seed data.');
        addLog('💡 Please sign in to Supabase first, then try again.');
        return;
      }
      
      addLog(`👤 Authenticated as: ${user.email}`);
      
      // Create sample tags first
      addLog('Creating sample tags...');
      const tags = await createSampleTags();
      
      if (tags.length === 0) {
        addLog('❌ No tags available. Cannot proceed with trade creation.');
        return;
      }
      
      // Generate and insert sample trades
      const numTrades = 25;
      addLog(`Generating ${numTrades} sample trades...`);
      
      for (let i = 0; i < numTrades; i++) {
        try {
          const { trade, tagIds } = generateSampleTrade(tags);
          await TradesAPI.createTrade(trade, tagIds);
          
          const pnl = (trade.exit_price - trade.entry_price) * trade.quantity - trade.commission;
          const status = pnl > 0 ? '🟢' : '🔴';
          addLog(`  ${i + 1}. ${trade.symbol} ${trade.side} ${status} $${pnl.toFixed(2)}`);
          
          // Small delay to avoid overwhelming the UI
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error: any) {
          addLog(`❌ Error creating trade ${i + 1}: ${error.message}`);
        }
      }
      
      // Get final stats
      addLog('📊 Getting final statistics...');
      const finalStats = await TradesAPI.getTradeStats();
      setStats(finalStats);
      addLog('✅ Seeding completed!');
      
    } catch (error: any) {
      addLog(`❌ Error seeding trades: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const signInAnonymously = async () => {
    try {
      addLog('🔐 Signing in anonymously for testing...');
      const { error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        addLog(`❌ Error signing in: ${error.message}`);
        return;
      }
      
      addLog('✅ Signed in successfully!');
    } catch (error: any) {
      addLog(`❌ Error during sign in: ${error.message}`);
    }
  };

  const clearAllTrades = async () => {
    if (!confirm('Are you sure you want to delete ALL trades? This cannot be undone.')) {
      return;
    }

    try {
      addLog('🗑️  Clearing all trades...');
      
      // Get all trades first
      const trades = await TradesAPI.getTrades(1000);
      
      // Delete all trades
      for (const trade of trades) {
        await TradesAPI.deleteTrade(trade.id);
      }
      
      // Clear all tags and trade_tags (cascade should handle this)
      await supabase.from('trade_tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      addLog(`✅ Deleted ${trades.length} trades and all associated tags`);
      setStats(null);
    } catch (error: any) {
      addLog(`❌ Error clearing trades: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Trading Data Seeder</h2>
        <p className="text-gray-400 mb-6">
          This tool will create realistic sample trading data in your Supabase database.
        </p>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={signInAnonymously}
            disabled={isSeeding}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🔐 Sign In for Testing
          </button>
          
          <button
            onClick={seedTrades}
            disabled={isSeeding}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSeeding ? '🌱 Seeding...' : '🌱 Seed Sample Trades (25)'}
          </button>
          
          <button
            onClick={clearAllTrades}
            disabled={isSeeding}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🗑️ Clear All Trades
          </button>
        </div>

        {stats && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-400 mb-2">📈 Final Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-400">Total Trades</div>
                <div className="text-lg text-white">{stats.totalTrades}</div>
              </div>
              <div>
                <div className="font-medium text-gray-400">Win Rate</div>
                <div className="text-lg text-white">{stats.winRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="font-medium text-gray-400">Total P&L</div>
                <div className={`text-lg ${stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${stats.totalPnl.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-400">This Week P&L</div>
                <div className={`text-lg ${stats.thisWeekPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${stats.thisWeekPnl.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {logs.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-white">📝 Seeding Log</h3>
            <div className="max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1 text-gray-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 