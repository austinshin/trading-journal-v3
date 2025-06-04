#!/usr/bin/env python3
"""
Test script for the Trades API
Run with: python test_trades.py
"""
import requests
import json

# Backend URL
BASE_URL = "http://localhost:8000"

def test_trades_api():
    print("🧪 Testing Trades API...")
    
    # Test 1: Create a trade
    print("\n1. Creating a sample trade...")
    trade_data = {
        "symbol": "AAPL",
        "side": "LONG",
        "quantity": 100,
        "entry_price": 175.50,
        "exit_price": 178.25,
        "commission": 1.00,
        "setup": "Breakout above resistance",
        "mistakes": "Should have taken more size",
        "lessons": "Good entry timing",
        "market_conditions": "Bullish market",
        "sector_momentum": "Tech sector strong",
        "stop_loss": 173.00,
        "target": 180.00
    }
    
    response = requests.post(f"{BASE_URL}/trades/", json=trade_data)
    if response.status_code == 200:
        trade = response.json()
        print(f"✅ Trade created successfully!")
        print(f"   Trade ID: {trade['id']}")
        print(f"   Symbol: {trade['symbol']}")
        print(f"   Net P&L: ${trade['net_pnl']:.2f}")
        print(f"   Risk/Reward: {trade['risk_reward']:.2f}" if trade['risk_reward'] else "   Risk/Reward: N/A")
        trade_id = trade['id']
    else:
        print(f"❌ Failed to create trade: {response.status_code}")
        print(response.text)
        return
    
    # Test 2: Get all trades
    print("\n2. Fetching all trades...")
    response = requests.get(f"{BASE_URL}/trades/")
    if response.status_code == 200:
        trades = response.json()
        print(f"✅ Found {len(trades)} trades")
        for i, trade in enumerate(trades, 1):
            pnl_color = "🟢" if trade['net_pnl'] >= 0 else "🔴"
            print(f"   {i}. {trade['symbol']} {trade['side']} {pnl_color} ${trade['net_pnl']:.2f}")
    else:
        print(f"❌ Failed to get trades: {response.status_code}")
    
    # Test 3: Get specific trade
    print(f"\n3. Fetching trade {trade_id}...")
    response = requests.get(f"{BASE_URL}/trades/{trade_id}")
    if response.status_code == 200:
        trade = response.json()
        print(f"✅ Trade details:")
        print(f"   Symbol: {trade['symbol']}")
        print(f"   Entry: ${trade['entry_price']:.2f}")
        print(f"   Exit: ${trade['exit_price']:.2f}")
        print(f"   Setup: {trade['setup']}")
    else:
        print(f"❌ Failed to get trade: {response.status_code}")
    
    # Test 4: Get trade statistics
    print("\n4. Fetching trade statistics...")
    response = requests.get(f"{BASE_URL}/trades/stats/summary")
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ Trade Statistics:")
        print(f"   Total Trades: {stats['total_trades']}")
        print(f"   Win Rate: {stats['win_rate']:.1f}%")
        print(f"   Total P&L: ${stats['total_pnl']:.2f}")
        print(f"   Today's P&L: ${stats['today_pnl']:.2f}")
        print(f"   Profit Factor: {stats['profit_factor']:.2f}")
    else:
        print(f"❌ Failed to get stats: {response.status_code}")
    
    # Test 5: Create another trade (losing trade)
    print("\n5. Creating a losing trade for better stats...")
    losing_trade = {
        "symbol": "TSLA",
        "side": "SHORT",
        "quantity": 50,
        "entry_price": 250.00,
        "exit_price": 255.00,
        "commission": 1.00,
        "setup": "Failed breakdown",
        "mistakes": "Didn't respect stop loss",
        "lessons": "Cut losses quicker"
    }
    
    response = requests.post(f"{BASE_URL}/trades/", json=losing_trade)
    if response.status_code == 200:
        trade = response.json()
        print(f"✅ Losing trade created!")
        print(f"   Symbol: {trade['symbol']}")
        print(f"   Net P&L: ${trade['net_pnl']:.2f}")
    else:
        print(f"❌ Failed to create losing trade: {response.status_code}")
    
    # Test 6: Updated statistics
    print("\n6. Updated statistics after adding losing trade...")
    response = requests.get(f"{BASE_URL}/trades/stats/summary")
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ Updated Statistics:")
        print(f"   Total Trades: {stats['total_trades']}")
        print(f"   Winning Trades: {stats['winning_trades']}")
        print(f"   Losing Trades: {stats['losing_trades']}")
        print(f"   Win Rate: {stats['win_rate']:.1f}%")
        print(f"   Total P&L: ${stats['total_pnl']:.2f}")
        print(f"   Average Win: ${stats['avg_win']:.2f}")
        print(f"   Average Loss: ${stats['avg_loss']:.2f}")
        print(f"   Profit Factor: {stats['profit_factor']:.2f}")
    else:
        print(f"❌ Failed to get updated stats: {response.status_code}")

def test_health_check():
    print("🏥 Testing health check...")
    response = requests.get(f"{BASE_URL}/ping")
    if response.status_code == 200:
        print("✅ Backend is healthy!")
    else:
        print(f"❌ Backend health check failed: {response.status_code}")

if __name__ == "__main__":
    try:
        test_health_check()
        test_trades_api()
        print("\n🎉 All tests completed!")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}") 