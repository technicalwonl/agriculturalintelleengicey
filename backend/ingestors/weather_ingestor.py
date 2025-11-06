import logging
import requests
from datetime import datetime, timedelta
from typing import List, Dict
import os

logger = logging.getLogger(__name__)


class WeatherIngestor:
    """
    Ingest weather forecast data from Open-Meteo free weather API
    No API key required, open-source alternative to paid services
    """
    
    def __init__(self, db):
        self.db = db
        self.weather_collection = db["weather"]
        self.open_meteo_url = "https://api.open-meteo.com/v1/forecast"
    
    # Country -> representative city coordinates
    COUNTRY_COORDS = {
        'IN': {'name': 'Delhi', 'lat': 28.7041, 'lon': 77.1025},
        'US': {'name': 'Chicago', 'lat': 41.8781, 'lon': -87.6298},
        'BR': {'name': 'São Paulo', 'lat': -23.5505, 'lon': -46.6333},
        'AR': {'name': 'Buenos Aires', 'lat': -34.6037, 'lon': -58.3816}
    }
    
    def fetch_weather_forecast(self, country: str, days: int = 30) -> List[Dict]:
        """
        Fetch 30-day weather forecast from Open-Meteo API
        
        Returns: rainfall (mm), temperature (°C), humidity (%), wind speed (km/h)
        """
        logger.info(f"Fetching {days}-day weather forecast for {country}")
        
        coords = self.COUNTRY_COORDS.get(country, self.COUNTRY_COORDS['IN'])
        
        try:
            params = {
                'latitude': coords['lat'],
                'longitude': coords['lon'],
                'daily': 'precipitation_sum,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,windspeed_10m_max',
                'forecast_days': days,
                'timezone': 'UTC'
            }
            
            response = requests.get(self.open_meteo_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            forecast_data = []
            daily = data['daily']
            
            for i in range(len(daily['time'])):
                forecast_date = datetime.fromisoformat(daily['time'][i])
                
                forecast = {
                    "country": country,
                    "city": coords['name'],
                    "latitude": coords['lat'],
                    "longitude": coords['lon'],
                    "date": forecast_date,
                    "temperature_min": daily['temperature_2m_min'][i],
                    "temperature_max": daily['temperature_2m_max'][i],
                    "rainfall_mm": daily['precipitation_sum'][i] or 0,
                    "humidity_percent": daily['relative_humidity_2m_max'][i] or 65,
                    "wind_speed_kmh": daily['windspeed_10m_max'][i] or 10,
                    "timestamp": datetime.utcnow(),
                    "source": "open-meteo"
                }
                forecast_data.append(forecast)
            
            # Insert/update in database
            self._bulk_upsert(forecast_data)
            logger.info(f"Ingested {len(forecast_data)} weather forecast records for {country}")
            
            return forecast_data
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching weather data for {country}: {str(e)}")
            return []
    
    def _bulk_upsert(self, forecasts: List[Dict]):
        """Batch insert/update forecasts in MongoDB"""
        for forecast in forecasts:
            self.weather_collection.update_one(
                {
                    "country": forecast["country"],
                    "date": forecast["date"]
                },
                {"$set": forecast},
                upsert=True
            )
    
    def calculate_weather_score(self, forecast_data: List[Dict]) -> float:
        """
        Calculate weather favorability score (0-100)
        
        Optimal conditions for crops:
        - Temperature: 20-25°C
        - Rainfall: 5-15 mm/day
        - Humidity: 60-80%
        - Wind: < 25 km/h
        """
        if not forecast_data:
            return 50
        
        total_score = 0
        
        for day in forecast_data:
            temp_score = self._score_temperature(
                day['temperature_min'],
                day['temperature_max']
            )
            rainfall_score = self._score_rainfall(day['rainfall_mm'])
            humidity_score = self._score_humidity(day['humidity_percent'])
            wind_score = self._score_wind(day['wind_speed_kmh'])
            
            day_score = (temp_score + rainfall_score + humidity_score + wind_score) / 4
            total_score += day_score
        
        avg_score = total_score / len(forecast_data)
        return min(100, max(0, avg_score))
    
    def _score_temperature(self, t_min: float, t_max: float) -> float:
        """Score temperature (optimal: 20-25°C)"""
        avg_temp = (t_min + t_max) / 2
        
        if 20 <= avg_temp <= 25:
            return 100
        elif 15 <= avg_temp <= 30:
            return 75
        elif 10 <= avg_temp <= 35:
            return 50
        else:
            return 20
    
    def _score_rainfall(self, rainfall_mm: float) -> float:
        """Score rainfall (optimal: 5-15 mm/day)"""
        if 5 <= rainfall_mm <= 15:
            return 100
        elif 2 <= rainfall_mm < 5 or 15 < rainfall_mm <= 25:
            return 75
        elif 0 <= rainfall_mm < 2 or 25 < rainfall_mm <= 40:
            return 50
        else:
            return 20
    
    def _score_humidity(self, humidity: float) -> float:
        """Score humidity (optimal: 60-80%)"""
        if 60 <= humidity <= 80:
            return 100
        elif 50 <= humidity < 60 or 80 < humidity <= 90:
            return 75
        elif 40 <= humidity < 50 or 90 < humidity <= 95:
            return 50
        else:
            return 20
    
    def _score_wind(self, wind_speed: float) -> float:
        """Score wind speed (optimal: < 15 km/h)"""
        if wind_speed < 15:
            return 100
        elif wind_speed < 20:
            return 75
        elif wind_speed < 30:
            return 50
        else:
            return 20


def ingest_weather_data(db, country: str) -> float:
    """Entry point for weather data ingestion"""
    ingestor = WeatherIngestor(db)
    forecast = ingestor.fetch_weather_forecast(country, days=30)
    weather_score = ingestor.calculate_weather_score(forecast)
    return weather_score
