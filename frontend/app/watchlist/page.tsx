"use client";

import { useState } from "react";
import useSWR from "swr";
import { Search, RefreshCw, ExternalLink } from "lucide-react";
import SavedWatchlistsSidebar from "@/components/SavedWatchlistsSidebar";

interface StockData {
  ticker: string;
  price: number;
  prev_close: number;
  open: number;
  high: number;
  low: number;
  gap_pct: number;
  change_pct: number;
  volume: number;
  avg_volume_10d: number | null;
  market_cap: number | null;
  float_shares: number;
  dilution_remaining: number;
  dilution_pct_float: number | null;
  risk: "High" | "Medium" | "Low" | "Unknown";
  week_52_high: number | null;
  week_52_low: number | null;
  latest_filing: string | null;
  news: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
console.log('API_BASE:', API_BASE);
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WatchlistPage() {
  const [input, setInput] = useState("AMC,GME,MULN,SBET");
  const tickers = input
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .join(",");

  const requestUrl = tickers ? `${API_BASE}/analyze?tickers=${tickers}` : null;
  console.log('Request URL:', requestUrl);

  const { data, error, isLoading, mutate } = useSWR<{ results: StockData[] }>(
    requestUrl,
    fetcher,
    { refreshInterval: 30000 }
  );

  const handleLoadWatchlist = (tickerString: string) => {
    setInput(tickerString);
  };

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Watchlist</h1>
            <p className="mt-2 text-lg text-gray-400">
              Monitor small-cap stocks for dilution and momentum
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 pl-10 pr-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
                placeholder="Enter tickers (e.g. AMC,GME,MULN)"
              />
            </div>
            <button
              onClick={() => mutate()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800/50 focus:outline-none focus:ring-1 focus:ring-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-900/10 bg-red-500/10 p-4 text-sm text-red-400">
              Failed to load stock data. Please try again.
            </div>
          )}

          {isLoading && (
            <div className="text-gray-400">Loading stock data...</div>
          )}

          {/* Stock Grid */}
          {data && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {data.results.map((stock) => (
                <div
                  key={stock.ticker}
                  className="card-hover bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{stock.ticker}</h3>
                      <p className="text-2xl font-semibold mt-1">
                        ${stock.price.toFixed(2)}{" "}
                        <span
                          className={`text-base ${
                            stock.change_pct >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {stock.change_pct >= 0 ? "+" : ""}
                          {stock.change_pct.toFixed(2)}%
                        </span>
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        stock.risk === "High"
                          ? "bg-red-500/10 text-red-400"
                          : stock.risk === "Medium"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {stock.risk} Risk
                    </div>
                  </div>

                  {/* Price Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-400">Open</span>
                      <p className="font-medium">${stock.open.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Previous Close</span>
                      <p className="font-medium">${stock.prev_close.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">High</span>
                      <p className="font-medium">${stock.high.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Low</span>
                      <p className="font-medium">${stock.low.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Premarket & Gap Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-400">Gap %</span>
                      <p className={`font-medium ${
                        stock.gap_pct >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {stock.gap_pct >= 0 ? "+" : ""}{stock.gap_pct.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Premarket Change</span>
                      <p className={`font-medium ${
                        (stock.open - stock.prev_close) >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        ${(stock.open - stock.prev_close) >= 0 ? "+" : ""}
                        {(stock.open - stock.prev_close).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Market Data Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-400">Volume</span>
                      <p className="font-medium text-gray-500 text-xs">
                        Not available*
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Volume (10d)</span>
                      <p className="font-medium">
                        {stock.avg_volume_10d 
                          ? `${stock.avg_volume_10d.toFixed(1)}M`
                          : "N/A"
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Market Cap</span>
                      <p className="font-medium">
                        {stock.market_cap 
                          ? stock.market_cap >= 1000000
                            ? `$${(stock.market_cap / 1000000).toFixed(1)}T`
                            : stock.market_cap >= 1000
                            ? `$${(stock.market_cap / 1000).toFixed(1)}B`
                            : `$${stock.market_cap.toFixed(0)}M`
                          : "N/A"
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Float</span>
                      <p className="font-medium">
                        {stock.float_shares > 0
                          ? stock.float_shares >= 1000
                            ? `${(stock.float_shares / 1000).toFixed(1)}B`
                            : `${stock.float_shares.toFixed(1)}M`
                          : "N/A"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Data Source Note */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">
                      *Current volume requires paid API tier
                    </p>
                  </div>

                  {/* 52 Week Range */}
                  {stock.week_52_high && stock.week_52_low && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>52W Range</span>
                        <span>
                          {(
                            ((stock.price - stock.week_52_low) /
                              (stock.week_52_high - stock.week_52_low)) *
                            100
                          ).toFixed(1)}
                          % of range
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                ((stock.price - stock.week_52_low) /
                                  (stock.week_52_high - stock.week_52_low)) *
                                100,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>${stock.week_52_low.toFixed(2)}</span>
                        <span>${stock.week_52_high.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Dilution Info */}
                  {stock.dilution_pct_float !== null && stock.dilution_pct_float > 0 && (
                    <div className="bg-yellow-500/10 rounded-lg p-3 mb-4">
                      <p className="text-yellow-400 text-sm font-medium">
                        {stock.dilution_pct_float.toFixed(1)}% of float registered
                      </p>
                      <p className="text-yellow-400/80 text-xs mt-1">
                        {stock.dilution_remaining.toLocaleString()} shares remaining
                      </p>
                    </div>
                  )}

                  {/* Action Links */}
                  <div className="flex gap-2 mb-4">
                    <a
                      href={`https://dilutiontracker.com/app/search/${stock.ticker}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
                    >
                      DilutionTracker
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <a
                      href={`https://chat.openai.com/?q=${encodeURIComponent(`I am trading small caps parabolic shorts. I want the dilution stock info, news, summary, price movements of ${stock.ticker}. Give me a detailed analysis of what you think is happening with this stock.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      Ask ChatGPT
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* News */}
                  {stock.news.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        Recent News
                      </h4>
                      <ul className="space-y-2">
                        {stock.news.map((headline, idx) => (
                          <li key={idx}>
                            <a
                              href={`https://finance.yahoo.com/quote/${stock.ticker}/news/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block hover:bg-gray-800/30 rounded-lg p-2 -m-2 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors line-clamp-2">
                                    • {headline}
                                  </div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-gray-300 flex-shrink-0 mt-0.5" />
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - moved to right */}
      <SavedWatchlistsSidebar 
        onLoadWatchlist={handleLoadWatchlist}
        currentTickers={input}
      />
    </div>
  );
} 