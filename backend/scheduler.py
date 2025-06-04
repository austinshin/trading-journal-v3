from __future__ import annotations

import os
import asyncio
from datetime import datetime
from typing import List

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from enrich import enrich_ticker

WATCHLIST = os.getenv("WATCHLIST", "").split(",")  # e.g. "AMC,GME,SNAP"
CACHE: dict[str, dict] = {}


async def refresh_watchlist() -> None:
    if not WATCHLIST:
        return

    print(f"[{datetime.utcnow().isoformat()}] Refreshing {len(WATCHLIST)} tickers")
    results = await asyncio.gather(*(enrich_ticker(t) for t in WATCHLIST))
    for res in results:
        CACHE[res["ticker"]] = res
    print("Cache updated")


def start_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="US/Eastern")
    # Run daily at 08:00 ET
    scheduler.add_job(refresh_watchlist, CronTrigger(hour=8, minute=0))
    scheduler.start()
    return scheduler 