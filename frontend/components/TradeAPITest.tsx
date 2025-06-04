"use client";

import { useState } from 'react';
import { TradesAPI, CreateTradeData, TradeWithTags } from '@/lib/trades';

export default function TradeAPITest() {
  const [trades, setTrades] = useState<TradeWithTags[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const createSampleTrade = async () => {
    setLoading(true);
    try {
      const sampleTrade: CreateTradeData = {
        symbol: 'AAPL',
        side: 'LONG',
        quantity: 100,
        entry_price: 175.50,
        exit_price: 178.25,
        commission: 1.00,
        setup: 'Breakout above resistance',
        mistakes: 'Should have taken more size',
        lessons: 'Good entry timing',
        market_conditions: 'Bullish market',
        sector_momentum: 'Tech sector strong',
        stop_loss: 173.00,
        target: 180.00,
      };

      const newTrade = await TradesAPI.createTrade(sampleTrade);
      console.log('Created trade:', newTrade);
      
      // Refresh trades list
      await fetchTrades();
    } catch (error) {
      console.error('Error creating trade:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const tradesData = await TradesAPI.getTrades(10);
      setTrades(tradesData);
      console.log('Fetched trades:', tradesData);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const statsData = await TradesAPI.getTradeStats();
      setStats(statsData);
      console.log('Trade stats:', statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-900/50 rounded-xl border border-gray-800/60">
      <h2 className="text-xl font-semibold">Trade API Test</h2>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={createSampleTrade}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Sample Trade'}
        </button>
        
        <button
          onClick={fetchTrades}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Trades'}
        </button>
        
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Stats'}
        </button>
      </div>

      {/* Stats Display */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400">Total Trades</div>
            <div className="text-xl font-semibold">{stats.totalTrades}</div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className="text-xl font-semibold text-green-400">{stats.winRate.toFixed(1)}%</div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400">Total P&L</div>
            <div className={`text-xl font-semibold ${stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats.totalPnl)}
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400">Today's P&L</div>
            <div className={`text-xl font-semibold ${stats.todaysPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats.todaysPnl)}
            </div>
          </div>
        </div>
      )}

      {/* Trades List */}
      {trades.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Recent Trades ({trades.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {trades.map((trade) => (
              <div key={trade.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">{trade.symbol}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      trade.side === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {trade.side}
                    </span>
                    <span className="text-gray-400">Qty: {trade.quantity}</span>
                  </div>
                  <div className={`text-lg font-semibold ${
                    trade.net_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(trade.net_pnl)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Entry:</span> {formatCurrency(trade.entry_price)}
                  </div>
                  <div>
                    <span className="text-gray-400">Exit:</span> {formatCurrency(trade.exit_price)}
                  </div>
                  <div>
                    <span className="text-gray-400">Commission:</span> {formatCurrency(trade.commission)}
                  </div>
                  <div>
                    <span className="text-gray-400">Date:</span> {trade.date}
                  </div>
                </div>
                
                {trade.setup && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-400">Setup:</span> {trade.setup}
                  </div>
                )}
                
                {trade.tags.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {trade.tags.map((tag) => (
                      <span key={tag.id} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {trades.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          No trades found. Click "Create Sample Trade" to add one!
        </div>
      )}
    </div>
  );
} 