from __future__ import annotations

import asyncio
from typing import List

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from enrich import enrich_ticker
from scheduler import start_scheduler
from trades import router as trades_router

app = FastAPI(
    title="Trading Journal API",
    description="API for managing trades and market analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(trades_router)

scheduler = start_scheduler()

@app.get("/")
async def root():
    return {"message": "Trading Journal API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running successfully"}

@app.get("/enrich/{ticker}")
async def enrich_ticker_endpoint(ticker: str):
    """Get enriched market data for any ticker symbol"""
    try:
        enriched_data = await enrich_ticker(ticker.upper())
        return enriched_data
    except Exception as e:
        return {"error": f"Failed to enrich ticker {ticker}: {str(e)}"}

@app.get("/analyze")
async def analyze_tickers(
    tickers: str = Query(..., description="Comma-separated list of ticker symbols")
) -> dict[str, List[dict]]:
    """
    Analyze multiple tickers for dilution and momentum.
    
    Returns enriched data including:
    - Basic price/volume data
    - Dilution metrics (if available)
    - Risk assessment
    - Recent news headlines
    """
    ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    
    if not ticker_list:
        raise HTTPException(status_code=400, detail="No valid tickers provided")

    if len(ticker_list) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 tickers allowed")
    
    try:
        results = await asyncio.gather(
            *[enrich_ticker(ticker) for ticker in ticker_list],
            return_exceptions=True
        )
        
        # Filter out any exceptions and return successful results
        successful_results = []
        for result in results:
            if isinstance(result, Exception):
                print(f"Error processing ticker: {result}")
                continue
            successful_results.append(result)
        
        return {"results": successful_results}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# ---------------------------------------------------------------------------
# Local dev convenience
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 