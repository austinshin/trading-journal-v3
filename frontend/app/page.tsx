"use client";

import { BarChart2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { TradesAPI } from "@/lib/trades";
import { supabase } from "@/lib/supabase";

// Placeholder data for when user is not authenticated
const placeholderStats = [
  {
    name: "Total Trades",
    value: "127",
    change: "+12%",
    changeType: "positive",
    icon: BarChart2,
  },
  {
    name: "Win Rate",
    value: "67.3%",
    change: "+2.3%",
    changeType: "positive",
    icon: TrendingUp,
  },
  {
    name: "Loss Rate",
    value: "32.7%",
    change: "-2.3%",
    changeType: "negative",
    icon: TrendingDown,
  },
  {
    name: "Net P&L",
    value: "$12,430",
    change: "+$2,345",
    changeType: "positive",
    icon: DollarSign,
  },
];

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchStats = async () => {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        const authenticated = !!session?.user;
        setIsAuthenticated(authenticated);

        if (authenticated) {
          // Fetch real stats if authenticated
          const realStats = await TradesAPI.getTradeStats();
          setStats(realStats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchStats();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const authenticated = !!session?.user;
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          // Refetch stats when user signs in
          TradesAPI.getTradeStats().then(setStats).catch(console.error);
        } else {
          // Clear stats when user signs out
          setStats(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Generate real stats array when authenticated
  const displayStats = isAuthenticated && stats ? [
    {
      name: "Total Trades",
      value: stats.totalTrades.toString(),
      change: "+0%", // You could calculate change from previous period
      changeType: "neutral",
      icon: BarChart2,
    },
    {
      name: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      change: "+0%",
      changeType: stats.winRate >= 50 ? "positive" : "negative",
      icon: TrendingUp,
    },
    {
      name: "Loss Rate",
      value: `${(100 - stats.winRate).toFixed(1)}%`,
      change: "+0%",
      changeType: stats.winRate >= 50 ? "negative" : "positive",
      icon: TrendingDown,
    },
    {
      name: "Net P&L",
      value: formatCurrency(stats.totalPnl),
      change: formatCurrency(stats.todaysPnl),
      changeType: stats.totalPnl >= 0 ? "positive" : "negative",
      icon: DollarSign,
    },
  ] : placeholderStats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Trading Dashboard</h1>
        <p className="text-gray-400 mt-2">
          {isAuthenticated 
            ? "Your real trading performance at a glance" 
            : "Your trading performance at a glance (Sign in to see real data)"
          }
        </p>
      </div>

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="mb-6 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <p className="text-blue-400">
            💡 Sign in to see your real trading statistics and add new trades
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {loading && isAuthenticated ? "..." : stat.value}
                </p>
              </div>
              <stat.icon className="h-8 w-8 text-gray-600" />
            </div>
            <div className="mt-4">
              <div
                className={`inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "bg-green-500/10 text-green-400"
                    : stat.changeType === "negative"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-gray-500/10 text-gray-400"
                }`}
              >
                {stat.change}
              </div>
              <span className="ml-2 text-sm text-gray-500">
                {isAuthenticated ? "today" : "vs last week"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Trades Preview */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Trades</h2>
          <a
            href="/journal/trades"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View all trades →
          </a>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="min-w-full divide-y divide-gray-800">
            <div className="bg-gray-900/50">
              <div className="grid grid-cols-7 px-6 py-3 text-sm font-medium text-gray-400">
                <div>Date</div>
                <div>Symbol</div>
                <div>Side</div>
                <div>Quantity</div>
                <div>Entry</div>
                <div>Exit</div>
                <div>P&L</div>
              </div>
            </div>
            <div className="divide-y divide-gray-800 bg-gray-900">
              {isAuthenticated ? (
                <div className="px-6 py-8 text-center text-gray-400">
                  {loading ? "Loading trades..." : "Your recent trades will appear here"}
                </div>
              ) : (
                // Placeholder trades when not authenticated
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-7 px-6 py-4 text-sm text-gray-300 hover:bg-gray-800/50"
                  >
                    <div>2024-03-{i}</div>
                    <div>AAPL</div>
                    <div>
                      <span className="text-green-400">Long</span>
                    </div>
                    <div>100</div>
                    <div>$175.23</div>
                    <div>$176.45</div>
                    <div className="text-green-400">+$122.00</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
