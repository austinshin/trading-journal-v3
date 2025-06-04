import os
import datetime as dt
from typing import List, Dict, Any, Tuple

import httpx
from urllib.parse import quote_plus

FINN_API = os.getenv("FINNHUB_KEY", "")
SEC_API = os.getenv("SEC_API_KEY", "")

BASE_FINNHUB = "https://finnhub.io/api/v1"
BASE_SECAPI = "https://api.sec-api.io"


async def _http_get_json(url: str, timeout: int = 10) -> Any:
    """Helper that performs an async GET and returns parsed JSON. Returns empty dict
    if request fails so upstream logic can continue gracefully."""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=timeout)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as exc:
            # Log and return empty structure
            print(f"Failed HTTP call to {url}: {exc}")
            return {}


# ------------------------------------------------------------
# Finnhub helpers
# ------------------------------------------------------------
async def finnhub_quote(ticker: str) -> tuple[float, float, float, float, float, float, float]:
    """Return (current_price, previous_close) for the given ticker."""
    url = f"{BASE_FINNHUB}/quote?symbol={ticker}&token={FINN_API}"
    data = await _http_get_json(url)
    return (
        data.get("c", 0.0),  # current
        data.get("pc", 0.0),  # prev close
        data.get("o", 0.0),  # open
        data.get("h", 0.0),  # high
        data.get("l", 0.0),  # low
        data.get("dp", 0.0),  # change pct
        data.get("v", 0.0),  # volume
    )


async def finnhub_float_shares(ticker: str) -> float:
    """Return float shares for ticker via Finnhub company profile endpoint."""
    url = f"{BASE_FINNHUB}/stock/profile2?symbol={ticker}&token={FINN_API}"
    data = await _http_get_json(url)
    return float(data.get("shareOutstanding", 0.0))


# ------------------------------------------------------------
# SEC API helpers
# ------------------------------------------------------------
async def sec_filings(ticker: str) -> List[Dict[str, Any]]:
    """Return latest dilution related filings for ticker (S-1, S-3, 424B5)."""
    query = (
        f"entityTicker:{ticker} AND formType:(S-1 OR S-3 OR 424B5) "
        f"sort:filingDate:desc"
    )
    url = f"{BASE_SECAPI}?token={SEC_API}&query={quote_plus(query)}"
    data = await _http_get_json(url)
    # The SEC API returns a top-level "filings" list according to docs.
    filings: List[Dict[str, Any]] = data.get("filings", [])
    return filings[:5]


# ------------------------------------------------------------
# Profile & metrics
# ------------------------------------------------------------

async def finnhub_profile(ticker: str) -> Dict[str, Any]:
    """Company profile information including float and market cap."""
    url = f"{BASE_FINNHUB}/stock/profile2?symbol={ticker}&token={FINN_API}"
    return await _http_get_json(url)


async def finnhub_metrics(ticker: str) -> Dict[str, Any]:
    """Key stock metrics such as 52w high/low, avg volume, etc."""
    url = f"{BASE_FINNHUB}/stock/metric?symbol={ticker}&metric=all&token={FINN_API}"
    data = await _http_get_json(url)
    return data.get("metric", {})


# ------------------------------------------------------------
# Business logic
# ------------------------------------------------------------
def calc_dilution_metrics(
    filings: List[Dict[str, Any]], float_shares: float
) -> Tuple[str, float, float]:
    """Return (risk_level, remaining_registered, remaining_pct_of_float)."""
    if float_shares <= 0:
        return "Unknown", 0.0, 0.0

    remaining = 0.0
    for f in filings:
        registered = float(f.get("maximumSharesToBeOffered", 0) or 0)
        sold = float(f.get("totalSharesPreviouslySold", 0) or 0)
        remaining += max(registered - sold, 0)

    pct = remaining / float_shares if float_shares else 0.0

    if pct > 0.5:
        risk = "High"
    elif pct > 0.2:
        risk = "Medium"
    else:
        risk = "Low"

    return risk, remaining, pct


async def enrich_ticker(ticker: str) -> Dict[str, Any]:
    """Return dict with gap %, dilution risk, filings and headlines."""

    ticker = ticker.upper()

    # Run independent calls concurrently
    from asyncio import gather
    (
        quote_data,
        profile_data,
        metrics_data,
        filings,
    ) = await gather(
        finnhub_quote(ticker),
        finnhub_profile(ticker),
        finnhub_metrics(ticker),
        sec_filings(ticker),
    )

    (
        current_px,
        prev_close,
        open_px,
        high_px,
        low_px,
        change_pct_api,
        volume,
    ) = quote_data

    float_shares = float(profile_data.get("shareOutstanding", 0.0))
    market_cap = profile_data.get("marketCapitalization", None)

    risk, remaining_shares, dilution_pct = calc_dilution_metrics(filings, float_shares)

    gap_pct = ((current_px - prev_close) / prev_close * 100) if prev_close else 0.0

    # Fetch latest company-specific news from the last 7 days (ticker-focused)
    from datetime import date, timedelta

    to_date = date.today()
    from_date = to_date - timedelta(days=7)
    news_url = (
        f"{BASE_FINNHUB}/company-news?symbol={ticker}&from={from_date}&to={to_date}&token={FINN_API}"
    )
    try:
        news_json = await _http_get_json(news_url)
        # Sort by datetime desc and take top 3 unique headlines
        news_json = sorted(news_json, key=lambda n: n.get("datetime", 0), reverse=True)
    except Exception:
        news_json = []
    headlines = [n.get("headline", "") for n in news_json[:3]]

    return {
        "ticker": ticker,
        "price": current_px,
        "prev_close": prev_close,
        "open": open_px,
        "high": high_px,
        "low": low_px,
        "gap_pct": round(gap_pct, 2),
        "change_pct": round(change_pct_api, 2) if change_pct_api else round(gap_pct, 2),
        "volume": volume,  # Keep as 0 when not available
        "avg_volume_10d": metrics_data.get("10DayAverageTradingVolume", None),
        "market_cap": market_cap,
        "float_shares": float_shares,
        "dilution_remaining": remaining_shares,
        "dilution_pct_float": round(dilution_pct * 100, 2) if dilution_pct else None,
        "risk": risk,
        "week_52_high": metrics_data.get("52WeekHigh", None),
        "week_52_low": metrics_data.get("52WeekLow", None),
        "latest_filing": filings[0].get("formType") if filings else None,
        "news": headlines,
    } 