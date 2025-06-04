import { createClient } from '@supabase/supabase-js';
import { TradesAPI } from '../lib/trades';

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

async function createSampleTags() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const sampleTags = [
    { name: 'Breakout', description: 'Trades based on price breakouts' },
    { name: 'Earnings', description: 'Trades around earnings announcements' },
    { name: 'Momentum', description: 'High momentum trades' },
    { name: 'Reversal', description: 'Trend reversal plays' },
    { name: 'Gap-up', description: 'Gap up morning plays' },
    { name: 'Scalp', description: 'Quick scalp trades' },
    { name: 'Swing', description: 'Multi-day swing trades' },
    { name: 'High-Vol', description: 'High volatility trades' },
    { name: 'News', description: 'News-driven trades' },
    { name: 'Tech', description: 'Technology sector trades' }
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
      console.error('Error creating tags:', error);
      return [];
    }
    
    console.log(`Created ${newTags.length} new tags`);
    return data;
  }
  
  const { data: allTags } = await supabase.from('tags').select();
  return allTags || [];
}

async function generateSampleTrade(tags: any[]) {
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
}

async function seedTrades() {
  try {
    console.log('🌱 Starting to seed trades data...');
    
    // Create sample tags first
    console.log('Creating sample tags...');
    const tags = await createSampleTags();
    
    if (tags.length === 0) {
      console.error('No tags available. Cannot proceed with trade creation.');
      return;
    }
    
    console.log(`Found ${tags.length} tags to work with`);
    
    // Generate and insert sample trades
    const numTrades = 25;
    console.log(`Generating ${numTrades} sample trades...`);
    
    for (let i = 0; i < numTrades; i++) {
      try {
        const { trade, tagIds } = await generateSampleTrade(tags);
        await TradesAPI.createTrade(trade, tagIds);
        
        const pnl = (trade.exit_price - trade.entry_price) * trade.quantity - trade.commission;
        const status = pnl > 0 ? '🟢' : '🔴';
        console.log(`  ${i + 1}. ${trade.symbol} ${trade.side} ${status} $${pnl.toFixed(2)}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error creating trade ${i + 1}:`, error);
      }
    }
    
    // Display final stats
    console.log('\n📊 Getting final statistics...');
    const stats = await TradesAPI.getTradeStats();
    console.log(`
✅ Seeding completed!

📈 Final Statistics:
- Total Trades: ${stats.totalTrades}
- Winning Trades: ${stats.winningTrades}
- Losing Trades: ${stats.losingTrades}
- Win Rate: ${stats.winRate.toFixed(1)}%
- Total P&L: $${stats.totalPnl.toFixed(2)}
- Today's P&L: $${stats.todaysPnl.toFixed(2)}
- This Week's P&L: $${stats.thisWeekPnl.toFixed(2)}
    `);
    
  } catch (error) {
    console.error('❌ Error seeding trades:', error);
  }
}

export { seedTrades }; 