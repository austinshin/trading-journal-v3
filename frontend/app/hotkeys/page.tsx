"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface HotkeyItem {
  title: string;
  description: string;
  code: string;
}

const dasTraderHotkeys: HotkeyItem[] = [
  {
    title: "1R Short Trade (Double Click Entry)",
    description: "Executes a 1R short trade when you double-click on a price point on the chart. The R value is pre-configured in DAS Trader settings.",
    code: `DefShare=BP*0.925;Share=DefShare*0.25;Price=Price-0.01;SShare=40/Price;Share=DefShare-SShare;DefShare=DefShare+SShare;SShare=Share;Sshare=DefShare-SShare;Share=0.5*SShare;TogSShare;ROUTE=SMRTL;Price= Price-0.05;TIF=DAY+;SELL=Send;DefShare=100`
  },
  {
    title: "Create $1 Stop Loss from Current Price",
    description: "Creates a stop loss order $1 away from the current market price. Useful for quick risk management setup.",
    code: `Price=Price+1.00;StopType=Market;TriggerType=Last;ROUTE=STOP;Price=Round2;Share=Pos;TIF=DAY+;SELL=Send`
  },
  {
    title: "Limit Order at Double-Click Price",
    description: "Creates a limit order for X shares at the price point where you double-click on the chart. Modify the Share value as needed.",
    code: `Share=100;Price=Price;ROUTE=LIMIT;TIF=DAY+;BUY=Send`
  },
  {
    title: "2R Parabolic Short Entry",
    description: "Aggressive 2R short entry for high-conviction parabolic breakdown plays. Uses larger position size for bigger moves.",
    code: `DefShare=BP*0.925;Share=DefShare*0.5;Price=Price-0.01;SShare=80/Price;Share=DefShare-SShare;DefShare=DefShare+SShare;SShare=Share;Sshare=DefShare-SShare;Share=0.5*SShare;TogSShare;ROUTE=SMRTL;Price=Price-0.05;TIF=DAY+;SELL=Send;DefShare=200`
  },
  {
    title: "0.5R Conservative Short Entry",
    description: "Conservative small size short entry for testing the waters on parabolic stocks before they fully break down.",
    code: `DefShare=BP*0.925;Share=DefShare*0.125;Price=Price-0.01;SShare=20/Price;Share=DefShare-SShare;DefShare=DefShare+SShare;SShare=Share;Sshare=DefShare-SShare;Share=0.5*SShare;TogSShare;ROUTE=SMRTL;Price=Price-0.05;TIF=DAY+;SELL=Send;DefShare=50`
  },
  {
    title: "Stop Above Recent High",
    description: "Places stop loss $0.20 above the recent high (adjust as needed). Essential for parabolic shorts to avoid getting squeezed.",
    code: `Price=Ask+0.20;StopType=Market;TriggerType=Last;ROUTE=STOP;Price=Round2;Share=Pos;TIF=DAY+;BUY=Send`
  },
  {
    title: "Take 50% Profit",
    description: "Covers half your short position at current bid. Perfect for locking in gains on fast parabolic moves down.",
    code: `Share=Pos*0.5;Price=Bid;ROUTE=MARKET;TIF=IOC;BUY=Send`
  },
  {
    title: "Take 25% Profit",
    description: "Covers 25% of your short position. Useful for scaling out gradually as the stock drops.",
    code: `Share=Pos*0.25;Price=Bid;ROUTE=MARKET;TIF=IOC;BUY=Send`
  },
  {
    title: "Add to Short Position (Scale In)",
    description: "Adds 50% more to your current short position at current price. Use when parabolic bounce fails and ready to break lower.",
    code: `Share=Pos*0.5;Price=Price-0.01;ROUTE=SMRTL;TIF=DAY+;SELL=Send`
  },
  {
    title: "Panic Close All Positions",
    description: "Emergency hotkey to flatten all positions immediately. Use when trade goes against you fast or on halt resume.",
    code: `ROUTE=MARKET;Share=Pos;Price=Ask+0.05;TIF=IOC;BUY=Send`
  },
  {
    title: "Short on Halt Resume (Market Order)",
    description: "Market short order for when a halted parabolic stock resumes trading. Gets you in fast on the breakdown.",
    code: `Share=100;ROUTE=MARKET;Price=Ask;TIF=IOC;SELL=Send`
  },
  {
    title: "Trailing Stop (50 cents)",
    description: "Sets a trailing stop 50 cents below current price. Automatically adjusts as stock moves in your favor.",
    code: `Price=Price-0.50;StopType=Trailing;TrailAmount=0.50;TriggerType=Last;ROUTE=STOP;Share=Pos;TIF=DAY+;BUY=Send`
  },
  {
    title: "Stock Locate Request",
    description: "Requests locate for shares to borrow. Essential before shorting, especially for hard-to-borrow parabolic stocks. Adjust share quantity as needed.",
    code: `Share=1000;ROUTE=BORROW;LOCATE=Send`
  },
  {
    title: "Check Locate Availability",
    description: "Checks current availability of shares to borrow for the selected symbol without placing an order.",
    code: `ROUTE=LOCATE;CHECK=Send`
  },
  {
    title: "Locate Request - Cheapest Available",
    description: "Requests the cheapest available locate rate. Good for testing waters before committing to expensive borrows.",
    code: `Share=1000;ROUTE=BORROW;PRICE=BEST;LOCATE=Send`
  },
  {
    title: "Locate Request - Up to 10% Rate",
    description: "Requests locate willing to pay up to 10% annualized borrow rate. Adjust rate based on your profit expectations.",
    code: `Share=1000;ROUTE=BORROW;MAXRATE=10;LOCATE=Send`
  },
  {
    title: "Locate Request - Up to 25% Rate",
    description: "Requests locate willing to pay up to 25% borrow rate for the best parabolic breakdown setups.",
    code: `Share=1000;ROUTE=BORROW;MAXRATE=25;LOCATE=Send`
  },
  {
    title: "Show All Locate Rates",
    description: "Displays all available locate rates and quantities for the symbol. Helps you choose the best price/quantity combination.",
    code: `ROUTE=LOCATE;SHOWRATES=Send`
  },
  {
    title: "Complete Short Setup (Auto R-Based)",
    description: "Ultimate parabolic short hotkey: 1) Double-click sets stop loss 2) Calculates R-based position size 3) Locates best shares 4) Creates stop + take profit orders. Set your R amount in DefShare variable.",
    code: `DefShare=100;StopPrice=Price;Price=Ask;Risk=StopPrice-Price;Share=DefShare/Risk;Share=RoundLot;ROUTE=BORROW;PRICE=BEST;LOCATE=Send;ROUTE=SMRTL;TIF=DAY+;SELL=Send;ROUTE=STOP;Price=StopPrice;StopType=Market;TriggerType=Last;TIF=DAY+;BUY=Send;ProfitTarget=Ask-(StopPrice-Ask);ROUTE=LIMIT;Price=ProfitTarget;TIF=DAY+;BUY=Send`
  },
  {
    title: "Short Setup with Custom R ($50 Risk)",
    description: "Pre-configured for $50 risk per trade. Double-click sets stop, automatically calculates shares, locates, and places all orders.",
    code: `DefShare=50;StopPrice=Price;Price=Ask;Risk=StopPrice-Price;Share=DefShare/Risk;Share=RoundLot;ROUTE=BORROW;PRICE=BEST;LOCATE=Send;ROUTE=SMRTL;TIF=DAY+;SELL=Send;ROUTE=STOP;Price=StopPrice;StopType=Market;TriggerType=Last;TIF=DAY+;BUY=Send;ProfitTarget=Ask-(StopPrice-Ask);ROUTE=LIMIT;Price=ProfitTarget;TIF=DAY+;BUY=Send`
  },
  {
    title: "Short Setup with Custom R ($100 Risk)",
    description: "Pre-configured for $100 risk per trade. Double-click sets stop, automatically calculates shares, locates, and places all orders.",
    code: `DefShare=100;StopPrice=Price;Price=Ask;Risk=StopPrice-Price;Share=DefShare/Risk;Share=RoundLot;ROUTE=BORROW;PRICE=BEST;LOCATE=Send;ROUTE=SMRTL;TIF=DAY+;SELL=Send;ROUTE=STOP;Price=StopPrice;StopType=Market;TriggerType=Last;TIF=DAY+;BUY=Send;ProfitTarget=Ask-(StopPrice-Ask);ROUTE=LIMIT;Price=ProfitTarget;TIF=DAY+;BUY=Send`
  },
  {
    title: "Short Setup with Custom R ($200 Risk)",
    description: "Pre-configured for $200 risk per trade. For high-conviction parabolic breakdown plays with larger risk tolerance.",
    code: `DefShare=200;StopPrice=Price;Price=Ask;Risk=StopPrice-Price;Share=DefShare/Risk;Share=RoundLot;ROUTE=BORROW;PRICE=BEST;LOCATE=Send;ROUTE=SMRTL;TIF=DAY+;SELL=Send;ROUTE=STOP;Price=StopPrice;StopType=Market;TriggerType=Last;TIF=DAY+;BUY=Send;ProfitTarget=Ask-(StopPrice-Ask);ROUTE=LIMIT;Price=ProfitTarget;TIF=DAY+;BUY=Send`
  }
];

export default function HotkeysPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Cobra DAS Trader Hotkeys</h1>
        <p className="text-gray-400">
          Pre-configured hotkeys for DAS Trader. Copy the code snippets and paste them into your DAS Trader hotkey configuration.
        </p>
      </div>

      <div className="space-y-6">
        {dasTraderHotkeys.map((hotkey, index) => (
          <div
            key={index}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {hotkey.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {hotkey.description}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Hotkey Code:
                </label>
                <button
                  onClick={() => copyToClipboard(hotkey.code, index)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-gray-950 border border-gray-700 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                  {hotkey.code}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">
          📝 Setup Instructions
        </h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>1. Open DAS Trader and go to <strong>Setup → Hot Keys</strong></p>
          <p>2. Create a new hotkey or edit an existing one</p>
          <p>3. Copy the code snippet from above and paste it into the hotkey configuration</p>
          <p>4. Assign a keyboard shortcut or mouse button combination</p>
          <p>5. Test the hotkey with small position sizes first</p>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">
          ⚠️ Important Notes
        </h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• Always test hotkeys with small position sizes before using in live trading</p>
          <p>• Ensure your DAS Trader risk settings are properly configured</p>
          <p>• The 1R calculation depends on your risk settings in DAS Trader</p>
          <p>• Modify share quantities and price offsets based on your trading strategy</p>
          <p>• Double-check route settings match your broker requirements</p>
        </div>
      </div>
    </div>
  );
} 