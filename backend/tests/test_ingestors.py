import pytest
from datetime import datetime
from unittest.mock import MagicMock, patch
from ingestors.satellite_ingestor import Sentinel2Ingestor
from ingestors.weather_ingestor import WeatherIngestor
from ingestors.commodity_ingestor import CommodityIngestor
from ingestors.news_ingestor import NewsIngestor


class TestSentinel2Ingestor:
    """Test NDVI data ingestion"""
    
    @pytest.fixture
    def db(self):
        db = MagicMock()
        db["satellites"] = MagicMock()
        return db
    
    def test_calculate_crop_health_score(self, db):
        ingestor = Sentinel2Ingestor(db)
        
        # Test with typical healthy crop NDVI values
        ndvi_values = [0.65, 0.70, 0.68, 0.72, 0.67]
        score = ingestor.calculate_crop_health_score(ndvi_values)
        
        assert 70 < score < 85, f"Expected score 70-85, got {score}"
    
    def test_calculate_crop_health_score_poor(self, db):
        ingestor = Sentinel2Ingestor(db)
        
        # Test with poor vegetation NDVI values
        ndvi_values = [0.30, 0.35, 0.32]
        score = ingestor.calculate_crop_health_score(ndvi_values)
        
        assert 40 < score < 55, f"Expected score 40-55, got {score}"
    
    def test_grid_tile_creation(self, db):
        ingestor = Sentinel2Ingestor(db)
        coords = {'min_lat': 0, 'max_lat': 10, 'min_lon': 0, 'max_lon': 10}
        
        tiles = ingestor._create_grid_tiles(coords, grid_size=2)
        
        assert len(tiles) == 4, f"Expected 4 tiles, got {len(tiles)}"
        assert all('center_lat' in t for t in tiles)
        assert all('center_lon' in t for t in tiles)


class TestWeatherIngestor:
    """Test weather data ingestion"""
    
    @pytest.fixture
    def db(self):
        db = MagicMock()
        db["weather"] = MagicMock()
        return db
    
    def test_score_temperature_optimal(self, db):
        ingestor = WeatherIngestor(db)
        score = ingestor._score_temperature(19, 26)  # avg 22.5
        assert score == 100
    
    def test_score_temperature_cool(self, db):
        ingestor = WeatherIngestor(db)
        score = ingestor._score_temperature(12, 18)  # avg 15
        assert score == 75
    
    def test_score_rainfall_optimal(self, db):
        ingestor = WeatherIngestor(db)
        score = ingestor._score_rainfall(10)
        assert score == 100
    
    def test_score_rainfall_dry(self, db):
        ingestor = WeatherIngestor(db)
        score = ingestor._score_rainfall(1)
        assert score == 50


class TestCommodityIngestor:
    """Test commodity price ingestion"""
    
    @pytest.fixture
    def db(self):
        db = MagicMock()
        db["commodities"] = MagicMock()
        return db
    
    def test_calculate_price_trend_up(self, db):
        ingestor = CommodityIngestor(db)
        
        # Create mock prices with upward trend
        prices = [
            {"date": datetime(2024, 1, i), "price_usd_per_ton": 300 + i}
            for i in range(1, 91)
        ]
        
        trend = ingestor.calculate_price_trend(prices, period=30)
        
        assert trend['trend'] in ['up', 'down', 'stable']
        assert 0 <= trend['trend_score'] <= 100
        assert trend['current_price'] > 0


class TestNewsIngestor:
    """Test news sentiment ingestion"""
    
    @pytest.fixture
    def db(self):
        db = MagicMock()
        db["news"] = MagicMock()
        return db
    
    def test_analyze_sentiment_positive(self, db):
        ingestor = NewsIngestor(db)
        title = "Agriculture productivity increases with new technology"
        summary = "Good harvest reported with strong growth in yields"
        
        sentiment = ingestor._analyze_sentiment(title, summary)
        assert 0.3 < sentiment <= 1.0
    
    def test_analyze_sentiment_negative(self, db):
        ingestor = NewsIngestor(db)
        title = "Drought threatens crop failure"
        summary = "Severe weather risk and poor conditions ahead"
        
        sentiment = ingestor._analyze_sentiment(title, summary)
        assert -1.0 <= sentiment < -0.3
    
    def test_extract_categories(self, db):
        ingestor = NewsIngestor(db)
        title = "Rainfall increases but disease concerns rise"
        
        categories = ingestor._extract_categories(title)
        assert 'weather' in categories or 'disease' in categories
