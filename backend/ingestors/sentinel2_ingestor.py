import logging
import requests
from datetime import datetime, timedelta
from typing import List, Dict
import numpy as np

logger = logging.getLogger(__name__)


class Sentinel2Ingestor:
    """
    Ingest NDVI (Normalized Difference Vegetation Index) data from Sentinel-2 satellite imagery
    
    NDVI Formula: (NIR - RED) / (NIR + RED)
    - Sentinel-2 has 13 bands, we use Band 8 (NIR) and Band 4 (RED)
    - Higher NDVI = healthier vegetation
    """
    
    def __init__(self, db):
        self.db = db
        self.satellites_collection = db["satellites"]
        # In production, use actual Sentinel Hub API key
        self.sentinel_hub_url = "https://services.sentinel-hub.com/api/v1/process"
    
    def fetch_ndvi_data(self, country: str, crop: str, region_coords: Dict) -> List[Dict]:
        """
        Fetch NDVI data for specific country/crop using Sentinel-2
        
        Args:
            country: Country code (IN, US, BR, AR)
            crop: Crop type (wheat, rice, corn, soybeans)
            region_coords: Bounding box coordinates {min_lat, max_lat, min_lon, max_lon}
        
        Returns:
            List of NDVI tiles with coordinates and values
        """
        logger.info(f"Fetching Sentinel-2 NDVI data for {crop} in {country}")
        
        # Default region coordinates by country
        regions = {
            'IN': {'min_lat': 8, 'max_lat': 35, 'min_lon': 68, 'max_lon': 97},
            'US': {'min_lat': 25, 'max_lat': 49, 'min_lon': -125, 'max_lon': -66},
            'BR': {'min_lat': -33, 'max_lat': 5, 'min_lon': -74, 'max_lon': -34},
            'AR': {'min_lat': -55, 'max_lat': -22, 'min_lon': -73, 'max_lon': -54}
        }
        
        coords = region_coords or regions.get(country, regions['IN'])
        
        # Grid the region into 5x5 tiles for data collection
        tiles = self._create_grid_tiles(coords, grid_size=5)
        ndvi_tiles = []
        
        for tile in tiles:
            try:
                # In production, call Sentinel Hub API here
                # response = requests.post(self.sentinel_hub_url, json=tile_request)
                # ndvi_value = response.json()['data'][0]['NDVI']
                
                # Mock NDVI value with realistic variation
                ndvi_value = self._generate_realistic_ndvi(crop)
                
                tile_data = {
                    "country": country,
                    "crop": crop,
                    "region": tile["name"],
                    "type": "NDVI",
                    "ndvi_value": ndvi_value,
                    "latitude": tile["center_lat"],
                    "longitude": tile["center_lon"],
                    "area_km2": 10000.0,
                    "confidence": 0.92,
                    "timestamp": datetime.utcnow(),
                    "source": "sentinel-2"
                }
                ndvi_tiles.append(tile_data)
            
            except Exception as e:
                logger.error(f"Error fetching NDVI for tile {tile['name']}: {str(e)}")
                continue
        
        # Insert/update in database
        self._bulk_upsert(ndvi_tiles)
        logger.info(f"Ingested {len(ndvi_tiles)} NDVI tiles for {crop} in {country}")
        
        return ndvi_tiles
    
    def _create_grid_tiles(self, coords: Dict, grid_size: int = 5) -> List[Dict]:
        """Create grid tiles across a region"""
        tiles = []
        lat_step = (coords['max_lat'] - coords['min_lat']) / grid_size
        lon_step = (coords['max_lon'] - coords['min_lon']) / grid_size
        
        for i in range(grid_size):
            for j in range(grid_size):
                tile = {
                    "name": f"Tile_{i}_{j}",
                    "center_lat": coords['min_lat'] + (i + 0.5) * lat_step,
                    "center_lon": coords['min_lon'] + (j + 0.5) * lon_step,
                    "min_lat": coords['min_lat'] + i * lat_step,
                    "max_lat": coords['min_lat'] + (i + 1) * lat_step,
                    "min_lon": coords['min_lon'] + j * lon_step,
                    "max_lon": coords['min_lon'] + (j + 1) * lon_step
                }
                tiles.append(tile)
        
        return tiles
    
    def _generate_realistic_ndvi(self, crop: str) -> float:
        """Generate realistic NDVI values based on crop type"""
        # Typical NDVI ranges by crop (just for simulation)
        ranges = {
            'wheat': (0.55, 0.75),
            'rice': (0.60, 0.80),
            'corn': (0.58, 0.78),
            'soybeans': (0.50, 0.72)
        }
        
        min_val, max_val = ranges.get(crop, (0.50, 0.75))
        # Add seasonal variation (would be real in production)
        return min_val + np.random.random() * (max_val - min_val)
    
    def _bulk_upsert(self, tiles: List[Dict]):
        """Batch insert/update tiles in MongoDB"""
        for tile in tiles:
            self.satellites_collection.update_one(
                {
                    "country": tile["country"],
                    "region": tile["region"],
                    "type": "NDVI"
                },
                {"$set": tile},
                upsert=True
            )
    
    def calculate_crop_health_score(self, ndvi_values: List[float]) -> float:
        """
        Convert NDVI values to 0-100 crop health score
        
        NDVI interpretation:
        - < 0.3: Water/built-up areas
        - 0.3-0.5: Sparse vegetation
        - 0.5-0.7: Moderate vegetation
        - > 0.7: Dense, healthy vegetation
        """
        if not ndvi_values:
            return 50
        
        avg_ndvi = np.mean(ndvi_values)
        
        # Convert -1 to 1 range to 0 to 100
        health_score = ((avg_ndvi + 1) / 2) * 100
        return min(100, max(0, health_score))


def ingest_satellite_data(db, country: str, crop: str) -> float:
    """Entry point for satellite data ingestion"""
    ingestor = Sentinel2Ingestor(db)
    tiles = ingestor.fetch_ndvi_data(country, crop, None)
    
    if tiles:
        ndvi_values = [tile["ndvi_value"] for tile in tiles]
        health_score = ingestor.calculate_crop_health_score(ndvi_values)
    else:
        health_score = 50
    
    return health_score
