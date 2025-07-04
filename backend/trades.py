from __future__ import annotations

from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from enum import Enum
from enrich import enrich_ticker

router = APIRouter(prefix="/trades", tags=["trades"])

class TradeSide(str, Enum):
    LONG = "LONG"
    SHORT = "SHORT"

class TradeCreate(BaseModel):
    symbol: str
    side: TradeSide
    quantity: float
    entry_price: float
    exit_price: float
    commission: float = 0.0
    setup: Optional[str] = None
    mistakes: Optional[str] = None
    lessons: Optional[str] = None
    market_conditions: Optional[str] = None
    sector_momentum: Optional[str] = None
    stop_loss: Optional[float] = None
    target: Optional[float] = None
    date: Optional[date] = None
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None

class Trade(TradeCreate):
    id: str
    user_id: str
    gross_pnl: float
    net_pnl: float
    risk_reward: Optional[float] = None
    created_at: datetime
    updated_at: datetime

class TradeStats(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    total_pnl: float
    today_pnl: float
    today_trades: int
    week_pnl: float
    week_trades: int
    avg_win: float
    avg_loss: float
    profit_factor: float

# In-memory storage for demo purposes
# In production, this would connect to your database
trades_db: List[Trade] = []

@router.post("/", response_model=Trade)
async def create_trade(trade_data: TradeCreate):
    """Create a new trade"""
    
    # Calculate P&L
    gross_pnl = (trade_data.exit_price - trade_data.entry_price) * trade_data.quantity
    net_pnl = gross_pnl - trade_data.commission
    
    # Calculate risk/reward if we have stop loss and target
    risk_reward = None
    if trade_data.stop_loss and trade_data.target:
        risk = abs(trade_data.entry_price - trade_data.stop_loss)
        reward = abs(trade_data.target - trade_data.entry_price)
        if risk > 0:
            risk_reward = reward / risk
    
    # Create trade object
    trade = Trade(
        id=f"trade_{len(trades_db) + 1}",
        user_id="demo_user",  # In production, get from auth
        **trade_data.model_dump(),
        gross_pnl=gross_pnl,
        net_pnl=net_pnl,
        risk_reward=risk_reward,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    trades_db.append(trade)
    return trade

@router.get("/", response_model=List[Trade])
async def get_trades(limit: int = 50, offset: int = 0):
    """Get trades with pagination"""
    return trades_db[offset:offset + limit]

@router.get("/{trade_id}", response_model=Trade)
async def get_trade(trade_id: str):
    """Get a specific trade by ID"""
    for trade in trades_db:
        if trade.id == trade_id:
            return trade
    raise HTTPException(status_code=404, detail="Trade not found")

@router.put("/{trade_id}", response_model=Trade)
async def update_trade(trade_id: str, trade_data: TradeCreate):
    """Update a trade"""
    for i, trade in enumerate(trades_db):
        if trade.id == trade_id:
            # Recalculate P&L
            gross_pnl = (trade_data.exit_price - trade_data.entry_price) * trade_data.quantity
            net_pnl = gross_pnl - trade_data.commission
            
            # Update trade
            updated_trade = Trade(
                **trade.model_dump(exclude={"created_at"}),
                **trade_data.model_dump(),
                gross_pnl=gross_pnl,
                net_pnl=net_pnl,
                updated_at=datetime.now()
            )
            trades_db[i] = updated_trade
            return updated_trade
    
    raise HTTPException(status_code=404, detail="Trade not found")

@router.delete("/{trade_id}")
async def delete_trade(trade_id: str):
    """Delete a trade"""
    for i, trade in enumerate(trades_db):
        if trade.id == trade_id:
            trades_db.pop(i)
            return {"message": "Trade deleted successfully"}
    raise HTTPException(status_code=404, detail="Trade not found")

@router.get("/stats/summary", response_model=TradeStats)
async def get_trade_stats():
    """Get trading statistics"""
    if not trades_db:
        return TradeStats(
            total_trades=0,
            winning_trades=0,
            losing_trades=0,
            win_rate=0.0,
            total_pnl=0.0,
            today_pnl=0.0,
            today_trades=0,
            week_pnl=0.0,
            week_trades=0,
            avg_win=0.0,
            avg_loss=0.0,
            profit_factor=0.0
        )
    
    total_trades = len(trades_db)
    winning_trades = [t for t in trades_db if t.net_pnl > 0]
    losing_trades = [t for t in trades_db if t.net_pnl < 0]
    
    win_count = len(winning_trades)
    loss_count = len(losing_trades)
    
    win_rate = (win_count / total_trades * 100) if total_trades > 0 else 0.0
    total_pnl = sum(t.net_pnl for t in trades_db)
    
    # Today's stats
    today = datetime.now().date()
    today_trades = [t for t in trades_db if t.created_at.date() == today]
    today_pnl = sum(t.net_pnl for t in today_trades)
    
    # This week's stats
    from datetime import timedelta
    week_ago = datetime.now() - timedelta(days=7)
    week_trades = [t for t in trades_db if t.created_at >= week_ago]
    week_pnl = sum(t.net_pnl for t in week_trades)
    
    # Average win/loss
    avg_win = sum(t.net_pnl for t in winning_trades) / len(winning_trades) if winning_trades else 0.0
    avg_loss = sum(t.net_pnl for t in losing_trades) / len(losing_trades) if losing_trades else 0.0
    
    # Profit factor
    gross_profit = sum(t.net_pnl for t in winning_trades)
    gross_loss = abs(sum(t.net_pnl for t in losing_trades))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else 0.0
    
    return TradeStats(
        total_trades=total_trades,
        winning_trades=win_count,
        losing_trades=loss_count,
        win_rate=win_rate,
        total_pnl=total_pnl,
        today_pnl=today_pnl,
        today_trades=len(today_trades),
        week_pnl=week_pnl,
        week_trades=len(week_trades),
        avg_win=avg_win,
        avg_loss=avg_loss,
        profit_factor=profit_factor
    )

@router.get("/{trade_id}/analysis")
async def get_trade_analysis(trade_id: str):
    """Get detailed analysis for a specific trade including current market data"""
    
    # Get the trade
    trade = None
    for t in trades_db:
        if t.id == trade_id:
            trade = t
            break
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    # Get current market analysis using existing enrich service
    try:
        market_data = await enrich_ticker(trade.symbol)
        
        # Calculate performance since trade
        current_price = market_data.get("price", 0)
        entry_price = trade.entry_price
        exit_price = trade.exit_price
        
        # Performance metrics
        performance_since_entry = ((current_price - entry_price) / entry_price * 100) if entry_price > 0 else 0
        performance_since_exit = ((current_price - exit_price) / exit_price * 100) if exit_price > 0 else 0
        
        return {
            "trade": trade,
            "market_analysis": market_data,
            "performance_metrics": {
                "current_price": current_price,
                "performance_since_entry": round(performance_since_entry, 2),
                "performance_since_exit": round(performance_since_exit, 2),
                "would_be_profitable_now": (
                    (current_price < entry_price) if trade.side == "SHORT" 
                    else (current_price > entry_price)
                )
            }
        }
    except Exception as e:
        return {
            "trade": trade,
            "market_analysis": None,
            "performance_metrics": None,
            "error": f"Market analysis unavailable: {str(e)}"
        } 