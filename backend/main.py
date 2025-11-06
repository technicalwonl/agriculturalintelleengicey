from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Macro-Data Fusion API",
    description="Agriculture risk prediction platform fusing satellite, weather, commodity, and news data",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["macro_data_fusion"]

# Collections
crops_collection = db["crops"]
weather_collection = db["weather"]
commodities_collection = db["commodities"]
news_collection = db["news"]
fusion_scores_collection = db["fusion_scores"]
satellites_collection = db["satellites"]


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "active",
        "message": "Macro-Data Fusion Platform API",
        "endpoints": {
            "fusion_score": "/fusion-score?country=IN&crop=wheat",
            "crop_health": "/map/health?country=IN&crop=wheat",
            "weather_forecast": "/weather/forecast?country=IN",
            "price_prediction": "/predict-price",
            "news_risk": "/news-risk?country=IN"
        }
    }


@app.get("/fusion-score")
async def get_fusion_score(country: str = Query(...), crop: str = Query(...)):
    """
    Calculate and return Fusion Score
    Fusion Score = (CropHealth + WeatherScore + PriceTrend + NewsRisk) / 4
    """
    try:
        # Fetch latest data for each component
        latest_data = fusion_scores_collection.find_one(
            {"country": country, "crop": crop},
            sort=[("timestamp", -1)]
        )
        
        if not latest_data:
            return {
                "error": "No data found",
                "country": country,
                "crop": crop,
                "fusion_score": 0,
                "components": {
                    "crop_health": 0,
                    "weather_score": 0,
                    "price_trend": 0,
                    "news_risk": 0
                }
            }
        
        # Remove MongoDB _id from response
        latest_data.pop("_id", None)
        return latest_data
    
    except Exception as e:
        logger.error(f"Error in fusion-score: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/map/health")
async def get_crop_health_map(country: str = Query(...), crop: str = Query(...)):
    """
    Get crop health map data (NDVI from Sentinel-2)
    Returns colored tiles representing crop health by region
    """
    try:
        health_data = satellites_collection.find(
            {"country": country, "crop": crop, "type": "NDVI"},
            sort=[("timestamp", -1)],
            limit=100
        )
        
        result = []
        for item in health_data:
            item.pop("_id", None)
            result.append(item)
        
        return {
            "country": country,
            "crop": crop,
            "tiles": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error in crop health map: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/weather/forecast")
async def get_weather_forecast(country: str = Query(...), days: int = Query(30)):
    """
    Get 30-day weather forecast (rainfall, temperature)
    """
    try:
        forecast_data = weather_collection.find(
            {"country": country},
            sort=[("date", -1)],
            limit=days
        )
        
        result = []
        for item in forecast_data:
            item.pop("_id", None)
            result.append(item)
        
        return {
            "country": country,
            "forecast_days": days,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error in weather forecast: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-price")
async def predict_commodity_price(commodity: str = Query(...), days_ahead: int = Query(30)):
    """
    Predict commodity price trends using Prophet/LSTM
    """
    try:
        # Fetch historical price data
        historical = commodities_collection.find(
            {"commodity": commodity},
            sort=[("date", -1)],
            limit=365
        )
        
        history = []
        for item in historical:
            item.pop("_id", None)
            history.append(item)
        
        if not history:
            return {
                "error": "No historical data",
                "commodity": commodity
            }
        
        # Placeholder for ML prediction logic
        # In production, would use Prophet or LSTM model
        forecast = {
            "commodity": commodity,
            "days_ahead": days_ahead,
            "historical_data": history[:10],  # Last 10 records
            "forecast_trend": "stable",  # would be calculated by ML model
            "confidence": 0.85,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return forecast
    
    except Exception as e:
        logger.error(f"Error in price prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/news-risk")
async def get_news_risk(country: str = Query(...)):
    """
    Get news sentiment risk score for socio-political factors
    """
    try:
        latest_news = news_collection.find(
            {"country": country},
            sort=[("date", -1)],
            limit=20
        )
        
        news_items = []
        for item in latest_news:
            item.pop("_id", None)
            news_items.append(item)
        
        # Calculate aggregate sentiment risk
        total_sentiment = sum(item.get("sentiment_score", 0) for item in news_items)
        avg_risk = total_sentiment / len(news_items) if news_items else 0
        
        return {
            "country": country,
            "risk_score": avg_risk,
            "risk_level": "high" if avg_risk > 0.7 else "medium" if avg_risk > 0.3 else "low",
            "recent_news": news_items,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error in news risk: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Check API and database health"""
    try:
        # Test MongoDB connection
        db.command("ismaster")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
