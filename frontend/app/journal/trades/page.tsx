"use client";

import TradesList from "@/components/TradesList";

export default function TradesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Trades</h1>
        <p className="text-gray-400 mt-2">
          View and manage all your trades with real-time statistics
        </p>
      </div>

      {/* Live Trades from Supabase */}
      <TradesList />
    </div>
  );
} 