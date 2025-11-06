from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Crop Health Schema (NDVI data from Sentinel-2)
class CropHealthTile(BaseModel):
    region: str
    ndvi_value: float  # 0-1 scale, higher is healthier
    latitude: float
    longitude: float
    area_km2: float
    timestamp: datetime


# Weather Forecast Schema
class WeatherDataPoint(BaseModel):
    date: datetime
    temperature_min: float
    temperature_max: float
    rainfall_mm: float
    humidity_percent: float
    wind_speed_kmh: float


# Commodity Price Schema
class CommodityPrice(BaseModel):
    commodity: str
    date: datetime
    price_usd_per_ton: float
    volume_traded: int
    source: str


# News Sentiment Schema
class NewsItem(BaseModel):
    title: str
    summary: str
    source: str
    date: datetime
    sentiment_score: float  # -1 to 1, where -1 is very negative
    country: str
    categories: List[str]


# Fusion Score Schema (Main Output)
class FusionScore(BaseModel):
    country: str
    crop: str
    crop_health_score: float  # 0-100
    weather_score: float  # 0-100
    price_trend_score: float  # 0-100
    news_risk_score: float  # 0-100
    fusion_score: float  # Average of all four
    risk_level: str  # low, medium, high
    timestamp: datetime
    components: dict
