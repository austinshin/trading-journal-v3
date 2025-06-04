"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TradesAPI } from '@/lib/trades';
import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Newspaper, 
  Edit, 
  Trash2,
  Target,
  StopCircle,
  AlertTriangle,
  BookOpen,
  DollarSign,
  ExternalLink
} from 'lucide-react';

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = params.id as string;
  
  const [tradeData, setTradeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTradeAnalysis();
  }, [tradeId]);

  const loadTradeAnalysis = async () => {
    try {
      setLoading(true);
      const analysisData = await TradesAPI.getTradeAnalysis(tradeId);
      setTradeData(analysisData);
    } catch (err: any) {
      setError(err.message || 'Failed to load trade analysis');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !tradeData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/journal/trades"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Trades
          </Link>
        </div>
        
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Trade</h2>
          <p className="text-gray-400">{error || 'The requested trade could not be found.'}</p>
        </div>
      </div>
    );
  }

  const { trade, market_analysis, performance_metrics } = tradeData;
  const isWinningTrade = trade.net_pnl > 0;
  const pnlColor = isWinningTrade ? 'text-green-400' : 'text-red-400';
  const sideColor = trade.side === 'LONG' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/journal/trades"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Trades
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {trade.symbol} Trade Details
            </h1>
            <p className="text-gray-400 mt-1">
              {formatDate(trade.date)} • {formatTime(trade.entry_time)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Trade Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trade Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* P&L and Basic Info */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Net P&L</div>
                <div className={`text-2xl font-bold ${pnlColor}`}>
                  {formatCurrency(trade.net_pnl)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(trade.gross_pnl)} gross
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Side</div>
                <div className={`text-xl font-semibold ${sideColor} flex items-center justify-center gap-2`}>
                  {trade.side === 'LONG' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {trade.side}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Quantity</div>
                <div className="text-xl font-semibold text-white">
                  {formatNumber(trade.quantity, 0)}
                </div>
                <div className="text-xs text-gray-500">shares</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">R/R Ratio</div>
                <div className="text-xl font-semibold text-white">
                  {trade.risk_reward ? `1:${trade.risk_reward.toFixed(2)}` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Price Action */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Price Action
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Entry Price</div>
                <div className="text-lg font-semibold text-white">
                  {formatCurrency(trade.entry_price)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(trade.entry_time)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Exit Price</div>
                <div className="text-lg font-semibold text-white">
                  {formatCurrency(trade.exit_price)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(trade.exit_time)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Stop Loss</div>
                <div className="text-lg font-semibold text-white flex items-center gap-2">
                  <StopCircle className="h-4 w-4 text-red-400" />
                  {trade.stop_loss ? formatCurrency(trade.stop_loss) : 'None'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Target</div>
                <div className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-400" />
                  {trade.target ? formatCurrency(trade.target) : 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis */}
          {(trade.setup || trade.mistakes || trade.lessons) && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Trade Analysis
              </h3>
              
              <div className="space-y-4">
                {trade.setup && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Setup</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{trade.setup}</p>
                  </div>
                )}
                
                {trade.mistakes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Mistakes</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{trade.mistakes}</p>
                  </div>
                )}
                
                {trade.lessons && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Lessons Learned</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{trade.lessons}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Market Context */}
          {(trade.market_conditions || trade.sector_momentum) && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Market Context</h3>
              
              <div className="space-y-4">
                {trade.market_conditions && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Market Conditions</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{trade.market_conditions}</p>
                  </div>
                )}
                
                {trade.sector_momentum && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Sector Momentum</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{trade.sector_momentum}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Market Analysis Sidebar */}
        <div className="space-y-6">
          {/* Current Market Data */}
          {market_analysis && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Current Market Data</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Current Price</div>
                  <div className="text-xl font-bold text-white">
                    {formatCurrency(market_analysis.price)}
                  </div>
                  <div className={`text-sm ${market_analysis.change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {market_analysis.change_pct >= 0 ? '+' : ''}{market_analysis.change_pct}%
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Volume</div>
                    <div className="text-white font-medium">
                      {formatNumber(market_analysis.volume / 1000000, 1)}M
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400">Gap %</div>
                    <div className={`font-medium ${market_analysis.gap_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {market_analysis.gap_pct >= 0 ? '+' : ''}{market_analysis.gap_pct}%
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400">Float</div>
                    <div className="text-white font-medium">
                      {formatNumber(market_analysis.float_shares / 1_000_000, 1)}M
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400">Market Cap</div>
                    <div className="text-white font-medium">
                      {market_analysis.market_cap ? formatNumber(market_analysis.market_cap / 1_000_000, 0) + 'M' : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-2">Risk Assessment</div>
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
                    market_analysis.risk === 'High' ? 'bg-red-600 text-white' :
                    market_analysis.risk === 'Medium' ? 'bg-yellow-500 text-black' :
                    market_analysis.risk === 'Low' ? 'bg-green-600 text-white' :
                    'bg-gray-400 text-black'
                  }`}>
                    {market_analysis.risk}
                  </span>
                </div>
                
                {market_analysis.dilution_pct_float && market_analysis.dilution_pct_float > 0 && (
                  <div>
                    <div className="text-sm text-gray-400">Dilution Risk</div>
                    <div className="text-red-400 font-medium">
                      {market_analysis.dilution_pct_float}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance Since Trade */}
          {performance_metrics && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Performance Since Trade
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Since Entry</div>
                  <div className={`text-lg font-semibold ${
                    performance_metrics.performance_since_entry >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {performance_metrics.performance_since_entry >= 0 ? '+' : ''}{performance_metrics.performance_since_entry}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Since Exit</div>
                  <div className={`text-lg font-semibold ${
                    performance_metrics.performance_since_exit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {performance_metrics.performance_since_exit >= 0 ? '+' : ''}{performance_metrics.performance_since_exit}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Would Be Profitable Now</div>
                  <div className={`font-semibold ${
                    performance_metrics.would_be_profitable_now ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {performance_metrics.would_be_profitable_now ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent News */}
          {market_analysis?.news && market_analysis.news.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Recent News
              </h3>
              
              <div className="space-y-4">
                {market_analysis.news.slice(0, 3).map((newsItem: any, index: number) => (
                  <div key={index} className="border-b border-gray-800 last:border-b-0 pb-3 last:pb-0">
                    <a 
                      href={newsItem.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group hover:bg-gray-800/30 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                            {newsItem.headline}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{newsItem.source}</span>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-500">{newsItem.time}</span>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-gray-300 flex-shrink-0 mt-0.5" />
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest Filing */}
          {market_analysis?.latest_filing && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Latest SEC Filing</h3>
              
              <a 
                href={market_analysis.latest_filing.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block group hover:bg-gray-800/30 rounded-lg p-3 -m-3 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-white font-medium group-hover:text-blue-300 transition-colors">
                      {market_analysis.latest_filing.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                        {market_analysis.latest_filing.type}
                      </span>
                      <span className="text-xs text-gray-500">Filed: {market_analysis.latest_filing.date}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 