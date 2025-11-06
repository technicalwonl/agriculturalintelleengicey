from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from backend.services.sms_service import SMSService, WhatsAppService
from backend.services.notification_service import NotificationService
import logging

router = APIRouter(prefix="/api/notifications", tags=["notifications"])
logger = logging.getLogger(__name__)

# Initialize services
sms_service = SMSService()
whatsapp_service = WhatsAppService()
notification_service = NotificationService(sms_service, whatsapp_service)

class SendAlertRequest(BaseModel):
    farmer_phone: str
    alert_type: str
    template_vars: dict
    channels: List[str] = ["sms"]
    image_url: Optional[str] = None

class SendBulkAlertsRequest(BaseModel):
    phone_numbers: List[str]
    alert_type: str
    template_vars: dict
    channels: List[str] = ["sms"]

@router.post("/send-alert")
async def send_alert(request: SendAlertRequest, background_tasks: BackgroundTasks):
    """Send alert to farmer via SMS/WhatsApp"""
    try:
        result = await notification_service.send_alert(
            request.farmer_phone,
            request.alert_type,
            request.template_vars,
            request.channels,
            request.image_url
        )
        return result
    except Exception as e:
        logger.error(f"Alert send failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send-bulk-alerts")
async def send_bulk_alerts(request: SendBulkAlertsRequest, background_tasks: BackgroundTasks):
    """Send alerts to multiple farmers"""
    try:
        results = []
        for phone in request.phone_numbers:
            result = await notification_service.send_alert(
                phone,
                request.alert_type,
                request.template_vars,
                request.channels
            )
            results.append(result)
        
        return {
            "total": len(request.phone_numbers),
            "sent": len(results),
            "results": results
        }
    except Exception as e:
        logger.error(f"Bulk alerts failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alert-templates")
async def get_alert_templates():
    """Get available alert templates"""
    return {
        "templates": list(notification_service.alert_templates.keys()),
        "details": notification_service.alert_templates
    }
