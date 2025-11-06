import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class FusionScoreCalculator:
    """Calculate Fusion Score by combining all data sources"""
    
    def __init__(self, db):
        self.db = db
        self.fusion_scores_collection = db["fusion_scores"]
    
    def calculate_fusion_score(self, crop_health: float, weather_score: float,
                              price_trend: float, news_risk: float) -> dict:
        """
        Fusion Score = (CropHealth + WeatherScore + PriceTrend + NewsRisk) / 4
        
        Each component is 0-100 scale
        """
        fusion_score = (crop_health + weather_score + price_trend + news_risk) / 4
        
        # Determine risk level
        if fusion_score >= 75:
            risk_level = "low"
        elif fusion_score >= 50:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        return {
            "fusion_score": fusion_score,
            "risk_level": risk_level,
            "components": {
                "crop_health": crop_health,
                "weather_score": weather_score,
                "price_trend": price_trend,
                "news_risk": news_risk
            }
        }
    
    def save_fusion_score(self, country: str, crop: str, scores: dict):
        """Save calculated fusion score to database"""
        document = {
            "country": country,
            "crop": crop,
            "fusion_score": scores["fusion_score"],
            "risk_level": scores["risk_level"],
            "crop_health_score": scores["components"]["crop_health"],
            "weather_score": scores["components"]["weather_score"],
            "price_trend_score": scores["components"]["price_trend"],
            "news_risk_score": scores["components"]["news_risk"],
            "components": scores["components"],
            "timestamp": datetime.utcnow()
        }
        
        self.fusion_scores_collection.update_one(
            {"country": country, "crop": crop},
            {"$set": document},
            upsert=True
        )
        
        logger.info(f"Saved fusion score for {crop} in {country}: {scores['fusion_score']:.2f}")
        return document


def calculate_and_save_fusion(db, country: str, crop: str,
                             crop_health: float, weather_score: float,
                             price_trend: float, news_risk: float):
    """Entry point to calculate and save fusion score"""
    calculator = FusionScoreCalculator(db)
    scores = calculator.calculate_fusion_score(crop_health, weather_score,
                                              price_trend, news_risk)
    return calculator.save_fusion_score(country, crop, scores)
