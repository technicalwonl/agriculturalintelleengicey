from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import logging

router = APIRouter(prefix="/api/alerts", tags=["alerts"])
logger = logging.getLogger(__name__)

alerts_db = {}

class AlertPreferences(BaseModel):
    farmer_id: str
    sms_enabled: bool = True
    whatsapp_enabled: bool = True
    email_enabled: bool = False
    push_enabled: bool = True
    alert_types: List[str] = ["pest", "weather", "price", "irrigation"]

preferences_db = {}

@router.get("/summary/{farmer_id}")
async def get_alert_summary(farmer_id: str):
    """Get summary of alerts for farmer"""
    # Mock data
    return {
        "farmer_id": farmer_id,
        "total_alerts": 5,
        "critical_alerts": 1,
        "unread_alerts": 2,
        "alerts_today": 1,
        "action_pending": 2
    }

@router.get("/list/{farmer_id}")
async def get_farmer_alerts(
    farmer_id: str,
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    read: Optional[bool] = None,
    days: int = 30
):
    """Get list of alerts for farmer with filtering"""
    
    # Mock alerts
    alerts = [
        {
            "id": "1",
            "type": "pest",
            "severity": "critical",
            "title": "Armyworm Detected",
            "message": "High density armyworms detected",
            "crop": "wheat",
            "location": "Madhya Pradesh",
            "timestamp": datetime.now().isoformat(),
            "read": False
        }
    ]
    
    # Apply filters
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    if alert_type:
        alerts = [a for a in alerts if a["type"] == alert_type]
    if read is not None:
        alerts = [a for a in alerts if a["read"] == read]
    
    return {"alerts": alerts}

@router.post("/preferences")
async def set_alert_preferences(preferences: AlertPreferences):
    """Set farmer's alert preferences"""
    try:
        preferences_db[preferences.farmer_id] = preferences
        logger.info(f"Alert preferences set for {preferences.farmer_id}")
        return {"status": "success", "preferences": preferences}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preferences/{farmer_id}")
async def get_alert_preferences(farmer_id: str):
    """Get farmer's alert preferences"""
    if farmer_id not in preferences_db:
        return AlertPreferences(farmer_id=farmer_id)
    return preferences_db[farmer_id]

@router.put("/mark-read/{alert_id}")
async def mark_alert_read(alert_id: str):
    """Mark alert as read"""
    logger.info(f"Alert marked as read: {alert_id}")
    return {"status": "success"}

@router.put("/mark-action/{alert_id}")
async def mark_action_taken(alert_id: str):
    """Mark action taken on alert"""
    logger.info(f"Action marked taken for alert: {alert_id}")
    return {"status": "success"}
