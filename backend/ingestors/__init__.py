"""Data ingestors package for Macro-Data Fusion platform"""

from .sentinel2_ingestor import Sentinel2Ingestor, ingest_satellite_data
from .weather_ingestor import WeatherIngestor, ingest_weather_data
from .commodity_ingestor import CommodityIngestor, ingest_commodity_data
from .news_ingestor import NewsIngestor, ingest_news_data

__all__ = [
    'Sentinel2Ingestor',
    'WeatherIngestor',
    'CommodityIngestor',
    'NewsIngestor',
    'ingest_satellite_data',
    'ingest_weather_data',
    'ingest_commodity_data',
    'ingest_news_data'
]
