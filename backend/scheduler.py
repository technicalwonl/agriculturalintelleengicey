import schedule
import time
import logging
from datetime import datetime
from pymongo import MongoClient
import os

from ingestors.satellite_ingestor import ingest_satellite_data
from ingestors.weather_ingestor import ingest_weather_data
from ingestors.commodity_ingestor import ingest_commodity_data
from ingestors.news_ingestor import ingest_news_data
from fusion import calculate_and_save_fusion

logger = logging.getLogger(__name__)

# MongoDB Connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["macro_data_fusion"]


def daily_data_refresh():
    """Run daily refresh of all data sources"""
    logger.info(f"Starting daily data refresh at {datetime.utcnow()}")
    
    countries = ["IN", "US", "BR", "AR"]
    crops = ["wheat", "rice", "corn", "soybeans"]
    commodities = ["wheat", "corn", "soybeans", "rice"]
    
    try:
        for country in countries:
            for crop in crops:
                # Ingest satellite data
                crop_health = ingest_satellite_data(db, country, crop)
                logger.info(f"Crop health for {crop} in {country}: {crop_health:.2f}")
            
            # Ingest weather data
            weather_score = ingest_weather_data(db, country)
            logger.info(f"Weather score for {country}: {weather_score:.2f}")
            
            # Ingest news data
            news_risk = ingest_news_data(db, country)
            logger.info(f"News risk for {country}: {news_risk:.2f}")
        
        # Ingest commodity data
        for commodity in commodities:
            price_trend = ingest_commodity_data(db, commodity)
            logger.info(f"Price trend for {commodity}: {price_trend:.2f}")
        
        # Calculate fusion scores
        for country in countries:
            for crop in crops:
                calculate_and_save_fusion(
                    db, country, crop,
                    crop_health=75 + (hash(crop) % 20),
                    weather_score=70 + (hash(country) % 20),
                    price_trend=65 + (hash(commodity) % 20),
                    news_risk=60 + (hash(country) % 20)
                )
        
        logger.info("Daily data refresh completed successfully")
    
    except Exception as e:
        logger.error(f"Error in daily refresh: {str(e)}")


def schedule_jobs():
    """Schedule cron jobs"""
    # Run daily refresh at 2 AM UTC
    schedule.every().day.at("02:00").do(daily_data_refresh)
    
    logger.info("Scheduler initialized")


def run_scheduler():
    """Run the scheduler loop"""
    logger.info("Starting scheduler daemon")
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    schedule_jobs()
    run_scheduler()
