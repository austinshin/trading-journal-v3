"use client";

import SupabaseTest from "@/components/SupabaseTest";
import TradeAPITest from "@/components/TradeAPITest";
import SeedTradesComponent from "@/components/SeedTradesComponent";

export default function SupabaseTestingPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Supabase Testing</h1>
        <p className="text-gray-400 mt-2">
          Test your Supabase connection, API endpoints, and seed sample data
        </p>
      </div>

      {/* Supabase Connection Test */}
      <div className="mb-8">
        <SupabaseTest />
      </div>

      {/* Trade API Test */}
      <div className="mb-8">
        <TradeAPITest />
      </div>

      {/* Data Seeding Component */}
      <div className="mb-8">
        <SeedTradesComponent />
      </div>
    </div>
  );
} 