'use client';

import { useState, useEffect } from 'react';
import { TradesAPI, TradeWithTags } from '@/lib/trades';
import Link from 'next/link';

export default function TradesList() {
  const [trades, setTrades] = useState<TradeWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const [tradesData, statsData] = await Promise.all([
        TradesAPI.getTrades(20), // Get last 20 trades
        TradesAPI.getTradeStats()
      ]);
      setTrades(tradesData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Live Trades from Supabase</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Live Trades from Supabase</h2>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">❌ Error loading trades: {error}</p>
          <button 
            onClick={fetchTrades}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Live Trades from Supabase</h2>
        <button 
          onClick={fetchTrades}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
            <div className="text-sm text-gray-400">Total Trades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats.totalPnl)}
            </div>
            <div className="text-sm text-gray-400">Total P&L</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${stats.todaysPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats.todaysPnl)}
            </div>
            <div className="text-sm text-gray-400">Today's P&L</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${stats.thisWeekPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats.thisWeekPnl)}
            </div>
            <div className="text-sm text-gray-400">This Week</div>
          </div>
        </div>
      )}

      {trades.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No trades found. Use the seeding tool to create sample data!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Entry/Exit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Setup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {trades.map((trade) => (
                <Link key={trade.id} href={`/journal/trades/${trade.id}`}>
                  <tr className="hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div>{formatDate(trade.date)}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(trade.entry_time)} - {formatTime(trade.exit_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {trade.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trade.side === 'LONG' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {trade.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div>${trade.entry_price.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">${trade.exit_price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`font-medium ${
                        trade.net_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(trade.net_pnl)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(trade.gross_pnl)} gross
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs">
                      <div className="truncate" title={trade.setup || ''}>
                        {trade.setup}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="flex flex-wrap gap-1">
                        {trade.tags.map((tag) => (
                          <span 
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 