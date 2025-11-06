import logging
import requests
import csv
from datetime import datetime, timedelta
from typing import List, Dict
import numpy as np
from io import StringIO

logger = logging.getLogger(__name__)


class CommodityIngestor:
    """
    Ingest commodity price data from public sources
    Uses mock data + historical trend simulation
    """
    
    def __init__(self, db):
        self.db = db
        self.commodities_collection = db["commodities"]
    
    # Mock historical prices (USD per ton)
    COMMODITY_BASE_PRICES = {
        'wheat': 300,
        'rice': 500,
        'corn': 250,
        'soybeans': 450
    }
    
    def fetch_commodity_prices(self, commodity: str, days: int = 365) -> List[Dict]:
        """
        Fetch historical and simulated commodity prices
        
        In production, would:
        1. Download CSV from Kaggle
        2. Parse Bloomberg terminal data
        3. Call commodity exchange APIs
        """
        logger.info(f"Fetching commodity price data for {commodity}")
        
        base_price = self.COMMODITY_BASE_PRICES.get(commodity, 350)
        prices = []
        
        # Generate 1-year historical data with realistic trends
        for days_ago in range(days, 0, -1):
            price_date = datetime.utcnow() - timedelta(days=days_ago)
            
            # Add seasonal and random variation
            seasonal_factor = np.sin(days_ago / 90) * 20  # Seasonal variation
            random_noise = np.random.normal(0, 10)  # Daily volatility
            price = base_price + seasonal_factor + random_noise
            price = max(100, min(800, price))  # Keep in reasonable range
            
            price_data = {
                "commodity": commodity,
                "date": price_date,
                "price_usd_per_ton": float(price),
                "volume_traded": int(100000 + np.random.normal(0, 20000)),
                "source": "market_data",
                "timestamp": datetime.utcnow()
            }
            prices.append(price_data)
        
        # Insert/update in database
        self._bulk_upsert(prices)
        logger.info(f"Ingested {len(prices)} price records for {commodity}")
        
        return prices
    
    def _bulk_upsert(self, prices: List[Dict]):
        """Batch insert/update prices in MongoDB"""
        for price in prices:
            self.commodities_collection.update_one(
                {
                    "commodity": price["commodity"],
                    "date": price["date"]
                },
                {"$set": price},
                upsert=True
            )
    
    def calculate_price_trend(self, prices: List[Dict], period: int = 30) -> Dict:
        """
        Calculate price trend and volatility
        
        Returns:
            {
                'trend': 'up' | 'down' | 'stable',
                'trend_score': 0-100 (higher = more upside risk),
                'volatility': 0-100 (price swings),
                'current_price': latest price,
                'ma_30': 30-day moving average,
                'ma_90': 90-day moving average
            }
        """
        if len(prices) < period:
            return {
                'trend': 'stable',
                'trend_score': 50,
                'volatility': 30,
                'current_price': 0
            }
        
        prices_sorted = sorted(prices, key=lambda x: x['date'])
        recent_prices = [p['price_usd_per_ton'] for p in prices_sorted[-period:]]
        older_prices = [p['price_usd_per_ton'] for p in prices_sorted[-90:-60]]
        
        current_price = recent_prices[-1]
        ma_30 = np.mean(recent_prices)
        ma_90 = np.mean([p['price_usd_per_ton'] for p in prices_sorted[-90:]])
        
        # Calculate trend
        recent_avg = np.mean(recent_prices[-7:])  # Last week
        older_avg = np.mean(older_prices)
        
        pct_change = ((recent_avg - older_avg) / older_avg) * 100
        
        if pct_change > 5:
            trend = 'up'
            trend_score = 50 + min(50, pct_change / 2)
        elif pct_change < -5:
            trend = 'down'
            trend_score = 50 - min(50, abs(pct_change) / 2)
        else:
            trend = 'stable'
            trend_score = 50
        
        # Calculate volatility (standard deviation)
        volatility_pct = (np.std(recent_prices) / ma_30 * 100)
        volatility_score = min(100, volatility_pct * 3)
        
        return {
            'trend': trend,
            'trend_score': float(trend_score),
            'volatility': float(volatility_score),
            'current_price': float(current_price),
            'ma_30': float(ma_30),
            'ma_90': float(ma_90),
            'pct_change_30d': float(pct_change)
        }


def ingest_commodity_data(db, commodity: str) -> Dict:
    """Entry point for commodity data ingestion"""
    ingestor = CommodityIngestor(db)
    prices = ingestor.fetch_commodity_prices(commodity)
    trend_data = ingestor.calculate_price_trend(prices)
    return trend_data
