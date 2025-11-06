import logging
from datetime import datetime
from typing import Dict, List
import numpy as np

logger = logging.getLogger(__name__)


class FusionScoreCalculator:
    """
    Advanced Fusion Score calculation with weighted components and confidence intervals
    """
    
    def __init__(self, db, weights: Dict = None):
        """
        Initialize calculator with optional custom weights
        
        Default weights are equal, but can be customized based on:
        - Regional importance
        - Seasonal factors
        - Commodity type
        """
        self.db = db
        self.fusion_scores_collection = db["fusion_scores"]
        
        # Default equal weights
        self.weights = weights or {
            'crop_health': 0.25,
            'weather_score': 0.25,
            'price_trend': 0.25,
            'news_risk': 0.25
        }
        
        # Validate weights sum to 1
        assert abs(sum(self.weights.values()) - 1.0) < 0.01, "Weights must sum to 1"
    
    def calculate_fusion_score(self, crop_health: float, weather_score: float,
                              price_trend: float, news_risk: float,
                              components_data: Dict = None) -> Dict:
        """
        Calculate Fusion Score with detailed breakdown
        
        Formula: FS = (CH * w1) + (WS * w2) + (PT * w3) + (NR * w4)
        
        Each component 0-100 scale:
        - crop_health: NDVI-based vegetation index
        - weather_score: Favorability of forecast conditions
        - price_trend: Commodity price momentum and volatility
        - news_risk: Sentiment-based socio-political risk
        """
        
        # Validate inputs
        components = {
            'crop_health': max(0, min(100, crop_health)),
            'weather_score': max(0, min(100, weather_score)),
            'price_trend': max(0, min(100, price_trend)),
            'news_risk': max(0, min(100, news_risk))
        }
        
        # Calculate weighted fusion score
        fusion_score = (
            components['crop_health'] * self.weights['crop_health'] +
            components['weather_score'] * self.weights['weather_score'] +
            components['price_trend'] * self.weights['price_trend'] +
            components['news_risk'] * self.weights['news_risk']
        )
        
        # Determine risk level and confidence
        risk_level, confidence = self._calculate_risk_level(fusion_score, components)
        
        # Calculate component importance (which factors matter most)
        component_importance = self._calculate_importance(components)
        
        result = {
            "fusion_score": float(fusion_score),
            "risk_level": risk_level,
            "confidence": float(confidence),
            "components": components,
            "weights": self.weights,
            "component_importance": component_importance,
            "interpretation": self._get_interpretation(fusion_score, risk_level),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return result
    
    def _calculate_risk_level(self, score: float, components: Dict) -> tuple:
        """
        Determine risk level with confidence based on component agreement
        """
        if score >= 75:
            risk_level = "low"
        elif score >= 50:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        # Confidence is higher when components agree
        component_values = list(components.values())
        std_dev = np.std(component_values)
        
        # Lower std = higher confidence (components agree)
        # std=0 → confidence=1.0, std=50 → confidence=0.0
        confidence = max(0, 1 - (std_dev / 50))
        
        return risk_level, confidence
    
    def _calculate_importance(self, components: Dict) -> Dict:
        """
        Identify which components are driving the score
        
        Returns ranking of which factors are most concerning
        """
        values = [(k, v) for k, v in components.items()]
        sorted_by_value = sorted(values, key=lambda x: x[1])
        
        importance = {}
        for i, (component, value) in enumerate(sorted_by_value):
            # Invert importance - lower score = higher importance/concern
            importance[component] = f"risk_driver_{i+1}" if value < 50 else f"strength_{4-i}"
        
        return importance
    
    def _get_interpretation(self, score: float, risk_level: str) -> str:
        """Generate human-readable interpretation of score"""
        interpretations = {
            'low': {
                (75, 100): "Excellent conditions - Low risk for farming operations",
                (50, 75): "Good conditions - Monitor for minor challenges"
            },
            'medium': {
                (50, 75): "Mixed conditions - Require active management",
                (25, 50): "Caution advised - Multiple risk factors present"
            },
            'high': {
                (25, 50): "Poor conditions - Significant risks to crops",
                (0, 25): "Critical risk - Recommend risk mitigation strategies"
            }
        }
        
        for threshold_range, text in interpretations[risk_level].items():
            if threshold_range[0] <= score <= threshold_range[1]:
                return text
        
        return f"Score: {score:.1f} - {risk_level.upper()} RISK"
    
    def save_fusion_score(self, country: str, crop: str, scores: Dict) -> Dict:
        """
        Save calculated fusion score with full metadata to database
        """
        document = {
            "country": country,
            "crop": crop,
            "fusion_score": scores["fusion_score"],
            "risk_level": scores["risk_level"],
            "confidence": scores["confidence"],
            "crop_health_score": scores["components"]["crop_health"],
            "weather_score": scores["components"]["weather_score"],
            "price_trend_score": scores["components"]["price_trend"],
            "news_risk_score": scores["components"]["news_risk"],
            "components": scores["components"],
            "component_importance": scores.get("component_importance", {}),
            "interpretation": scores.get("interpretation", ""),
            "weights": self.weights,
            "timestamp": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=1)  # TTL index
        }
        
        self.fusion_scores_collection.update_one(
            {"country": country, "crop": crop},
            {"$set": document},
            upsert=True
        )
        
        logger.info(f"Saved fusion score for {crop} in {country}: {scores['fusion_score']:.2f} ({scores['risk_level'].upper()})")
        
        return document
    
    def get_historical_scores(self, country: str, crop: str, days: int = 30) -> List[Dict]:
        """
        Retrieve historical fusion scores to track trends
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        scores = list(self.fusion_scores_collection.find(
            {
                "country": country,
                "crop": crop,
                "timestamp": {"$gte": cutoff_date}
            },
            sort=[("timestamp", 1)]
        ))
        
        for score in scores:
            score.pop("_id", None)
        
        return scores
    
    def calculate_trend(self, historical_scores: List[Dict]) -> Dict:
        """
        Analyze score trend over time to predict future risk
        """
        if len(historical_scores) < 2:
            return {"trend": "insufficient_data"}
        
        scores = [s["fusion_score"] for s in historical_scores]
        recent_avg = np.mean(scores[-7:]) if len(scores) >= 7 else np.mean(scores)
        older_avg = np.mean(scores[:7]) if len(scores) >= 7 else scores[0]
        
        trend = (recent_avg - older_avg) / older_avg * 100 if older_avg != 0 else 0
        
        return {
            "trend_direction": "improving" if trend > 5 else ("declining" if trend < -5 else "stable"),
            "trend_magnitude": float(trend),
            "recent_average": float(recent_avg),
            "older_average": float(older_avg),
            "days_analyzed": len(historical_scores)
        }


from datetime import timedelta
