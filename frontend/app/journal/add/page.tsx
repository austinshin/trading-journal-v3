"use client";

import TradeEntryForm from "@/components/TradeEntryForm";

export default function AddTradePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Trade</h1>
        <p className="mt-2 text-lg text-gray-400">
          Record a new trade with details and analysis
        </p>
      </div>

      <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-6">
        <TradeEntryForm />
      </div>
    </div>
  );
} 