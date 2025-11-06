import pytest
import numpy as np
from datetime import datetime, timedelta
from unittest.mock import MagicMock
from models.price_predictor import PricePredictor
from models.fusion_calculator import FusionScoreCalculator


class TestPricePredictor:
    """Test price prediction models"""
    
    @pytest.fixture
    def db(self):
        db = MagicMock()
        db["commodities"] = MagicMock()
        return db
    
    def test_simple_lstm_predict_uptrend(self, db):
        predictor = PricePredictor(db, look_back=30)
        
        # Create uptrend prices
        prices = [300 + i*1.0 for i in range(100)]
        
        forecast = predictor.simple_lstm_predict(prices, days_ahead=30)
        
        assert forecast["trend"] == "up"
        assert len(forecast["forecast_values"]) == 30
        assert forecast["forecast_values"][-1] > forecast["forecast_values"][0]
    
    def test_simple_lstm_predict_downtrend(self, db):
        predictor = PricePredictor(db, look_back=30)
        
        # Create downtrend prices
        prices = [300 - i*1.0 for i in range(100)]
        
        forecast = predictor.simple_lstm_predict(prices, days_ahead=30)
        
        assert forecast["trend"] == "down"
        assert forecast["forecast_values"][-1] < forecast["forecast_values"][0]
    
    def test_confidence_interval(self, db):
        predictor = PricePredictor(db)
        prices = [300 + np.random.normal(0, 5) for _ in range(100)]
        
        forecast = predictor.simple_lstm_predict(prices, days_ahead=30)
        
        assert "confidence_interval" in forecast
        assert len(forecast["confidence_interval"]["lower"]) == 30
        assert len(forecast["confidence_interval"]["upper"]) == 30
        
        # Upper should be >= lower
        for i in range(30):
            assert forecast["confidence_interval"]["upper"][i] >= forecast["confidence_interval"]["lower"][i]


class TestFusionCalculator:
    """Test fusion score calculation"""
    
    @pytest.fixture
    def db(self):
        db = MagicMock()
        db["fusion_scores"] = MagicMock()
        return db
    
    def test_calculate_fusion_score_low_risk(self, db):
        calculator = FusionScoreCalculator(db)
        
        score = calculator.calculate_fusion_score(
            crop_health=85,
            weather_score=80,
            price_trend=75,
            news_risk=20  # Good news = low risk number
        )
        
        assert score["risk_level"] == "low"
        assert score["fusion_score"] > 70
    
    def test_calculate_fusion_score_high_risk(self, db):
        calculator = FusionScoreCalculator(db)
        
        score = calculator.calculate_fusion_score(
            crop_health=30,
            weather_score=25,
            price_trend=70,  # High prices = risk
            news_risk=85  # Bad news = high risk number
        )
        
        assert score["risk_level"] == "high"
        assert score["fusion_score"] < 55
    
    def test_custom_weights(self, db):
        # More weight on crop health
        custom_weights = {
            'crop_health': 0.5,
            'weather_score': 0.2,
            'price_trend': 0.2,
            'news_risk': 0.1
        }
        
        calculator = FusionScoreCalculator(db, weights=custom_weights)
        
        score = calculator.calculate_fusion_score(100, 0, 0, 0)
        
        # Should be closer to 50 (100 * 0.5) due to 50% weight on crop_health
        assert 45 < score["fusion_score"] < 55
    
    def test_confidence_calculation(self, db):
        calculator = FusionScoreCalculator(db)
        
        # All components same = high confidence
        score1 = calculator.calculate_fusion_score(70, 70, 70, 70)
        
        # Components vary = low confidence
        score2 = calculator.calculate_fusion_score(90, 10, 90, 10)
        
        assert score1["confidence"] > score2["confidence"]
    
    def test_calculate_trend(self, db):
        calculator = FusionScoreCalculator(db)
        
        # Create historical scores with upward trend
        historical_scores = [
            {"fusion_score": 50 + i*2} for i in range(15)
        ]
        
        trend = calculator.calculate_trend(historical_scores)
        
        assert trend["trend_direction"] == "improving"
        assert trend["trend_magnitude"] > 0
