"use client";

import React from "react";
import RiskBadge from "./RiskBadge";
import { ExternalLink } from "lucide-react";

export interface TickerData {
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
  latest_filing?: string | null;
  news: string[];
}

export default function TickerCard({ data }: { data: TickerData }) {
  const formatNumber = (num: number | null, decimals = 2) => {
    if (num === null || num === undefined) return "N/A";
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(decimals);
  };

  const formatCurrency = (num: number | null) => {
    if (num === null || num === undefined) return "N/A";
    return `$${num.toFixed(2)}`;
  };

  const gapColor = data.gap_pct >= 0 ? "text-green-600" : "text-red-600";
  const changeColor = data.change_pct >= 0 ? "text-green-600" : "text-red-600";
  
  // Calculate 52-week position if we have the data
  const week52Position = 
    data.week_52_high && data.week_52_low && data.price
      ? ((data.price - data.week_52_low) / (data.week_52_high - data.week_52_low)) * 100
      : null;

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{data.ticker}</h3>
        <RiskBadge level={data.risk} />
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Price:</span>
          <span className="font-semibold ml-1">{formatCurrency(data.price)}</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Change:</span>
          <span className={`font-semibold ml-1 ${changeColor}`}>
            {data.change_pct > 0 ? "+" : ""}{data.change_pct}%
          </span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Gap:</span>
          <span className={`font-semibold ml-1 ${gapColor}`}>
            {data.gap_pct > 0 ? "+" : ""}{data.gap_pct}%
          </span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Premarket:</span>
          <span className={`font-semibold ml-1 ${
            (data.open - data.prev_close) >= 0 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          }`}>
            ${(data.open - data.prev_close) >= 0 ? "+" : ""}
            {(data.open - data.prev_close).toFixed(2)}
          </span>
        </div>
      </div>

      {/* OHLC */}
      <div className="text-xs">
        <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-1">
          <span>O: {formatCurrency(data.open)}</span>
          <span>H: {formatCurrency(data.high)}</span>
          <span>L: {formatCurrency(data.low)}</span>
          <span>PC: {formatCurrency(data.prev_close)}</span>
        </div>
      </div>

      {/* 52-Week Range */}
      {data.week_52_high && data.week_52_low && (
        <div className="text-xs">
          <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-1">
            <span>52W Range</span>
            <span>{week52Position?.toFixed(1)}% of range</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative overflow-hidden">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(
                  Math.max(week52Position || 0, 0), 
                  100
                )}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between text-gray-500 text-xs mt-1">
            <span>{formatCurrency(data.week_52_low)}</span>
            <span>{formatCurrency(data.week_52_high)}</span>
          </div>
        </div>
      )}

      {/* Market Data */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Volume:</span>
          <span className="font-semibold ml-1 text-gray-500 dark:text-gray-500">
            Not available*
          </span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Market Cap:</span>
          <span className="font-semibold ml-1">
            {data.market_cap 
              ? data.market_cap >= 1000000
                ? `$${(data.market_cap / 1000000).toFixed(1)}T`
                : data.market_cap >= 1000
                ? `$${(data.market_cap / 1000).toFixed(1)}B`
                : `$${data.market_cap.toFixed(0)}M`
              : "N/A"
            }
          </span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Float:</span>
          <span className="font-semibold ml-1">
            {data.float_shares > 0
              ? data.float_shares >= 1000
                ? `${(data.float_shares / 1000).toFixed(1)}B`
                : `${data.float_shares.toFixed(1)}M`
              : "N/A"
            }
          </span>
        </div>
        {data.avg_volume_10d && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Avg Vol (10d):</span>
            <span className="font-semibold ml-1">{data.avg_volume_10d.toFixed(1)}M</span>
          </div>
        )}
      </div>

      {/* Data Source Note */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        *Current volume requires paid API tier
      </div>

      {/* Dilution Info */}
      {data.dilution_pct_float !== null && data.dilution_pct_float > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-xs">
          <div className="font-semibold text-yellow-800 dark:text-yellow-200">
            Dilution Risk: {data.dilution_pct_float}% of float
          </div>
          <div className="text-yellow-700 dark:text-yellow-300">
            {formatNumber(data.dilution_remaining)} shares registered but unsold
          </div>
        </div>
      )}

      {/* Filing */}
      {data.latest_filing && (
        <div className="text-xs">
          <span className="text-gray-600 dark:text-gray-400">Latest Filing:</span>
          <span className="font-semibold ml-1">{data.latest_filing}</span>
        </div>
      )}

      {/* Action Links */}
      <div className="flex gap-2 mb-2">
        <a
          href={`https://dilutiontracker.com/app/search/${data.ticker}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
        >
          DilutionTracker
          <ExternalLink className="h-3 w-3" />
        </a>

        <a
          href={`https://chat.openai.com/?q=${encodeURIComponent(`I am trading small caps parabolic shorts. I want the dilution stock info, news, summary, price movements of ${data.ticker}. Give me a detailed analysis of what you think is happening with this stock.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
        >
          Ask ChatGPT
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* News */}
      {data.news.length > 0 && (
        <div className="text-xs">
          <div className="text-gray-600 dark:text-gray-400 font-semibold mb-2">Recent News:</div>
          <ul className="space-y-2">
            {data.news.map((headline, idx) => (
              <li key={idx}>
                <a
                  href={`https://finance.yahoo.com/quote/${data.ticker}/news/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-tight">
                        • {headline}
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 flex-shrink-0 mt-0.5" />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 