from fastapi import APIRouter, HTTPException, File, UploadFile, Form, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from backend.services.drone_service import DroneImageAnalyzer
import logging

router = APIRouter(prefix="/api/drone", tags=["drone"])
logger = logging.getLogger(__name__)

analyzer = DroneImageAnalyzer()

class DroneFlightLog(BaseModel):
    farmer_id: str
    field_id: str
    flight_duration_minutes: int
    altitude_meters: int
    area_covered_hectares: float
    images_captured: int
    drone_model: Optional[str] = None

@router.post("/upload-image")
async def upload_drone_image(
    farmer_id: str = Form(...),
    field_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    altitude: float = Form(...),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """Upload and process drone image"""
    try:
        image_data = await file.read()
        
        result = await analyzer.process_drone_image(
            farmer_id=farmer_id,
            field_id=field_id,
            image_data=image_data,
            image_filename=file.filename,
            coordinates={"lat": latitude, "lon": longitude, "altitude": altitude}
        )
        
        # Send analysis alert
        if background_tasks:
            background_tasks.add_task(send_analysis_alert, result)
        
        return result
    except Exception as e:
        logger.error(f"Image upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/log-flight")
async def log_flight(flight_log: DroneFlightLog):
    """Log drone flight data"""
    try:
        log = await analyzer.log_flight(
            flight_log.farmer_id,
            flight_log.field_id,
            flight_log.flight_duration_minutes,
            flight_log.altitude_meters,
            flight_log.area_covered_hectares,
            flight_log.images_captured,
            flight_log.drone_model
        )
        return log
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/field-health/{field_id}")
async def get_field_health(field_id: str):
    """Get field health map from drone images"""
    try:
        health_map = await analyzer.get_field_health_map(field_id)
        return health_map
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/field-report/{field_id}")
async def get_field_report(field_id: str):
    """Generate comprehensive field report"""
    try:
        report = await analyzer.generate_field_report(field_id)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper function
async def send_analysis_alert(analysis_result: dict):
    logger.info(f"Sending drone analysis alert for image {analysis_result['image_id']}")
