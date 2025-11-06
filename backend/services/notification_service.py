from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class AlertTemplate(BaseModel):
    """Template for different alert types"""
    alert_type: str
    crop: str
    region: str
    message: str
    urgency: str
    channels: List[str]  # sms, whatsapp, email, push
    metadata: dict

class NotificationService:
    """Central notification orchestration service"""
    
    def __init__(self, sms_service, whatsapp_service):
        self.sms = sms_service
        self.whatsapp = whatsapp_service
        self.alert_templates = {
            "pest_warning": "Pest Alert: {pest} detected in {region}. Spray recommended: {recommendation}",
            "rain_alert": "Heavy rain expected in {hours} hours in {region}. Protect crops!",
            "price_drop": "Alert: {crop} price dropped to {price}/quintal in {region}",
            "frost_warning": "Frost warning! Temperature may drop to {temp}C. Protect seedlings.",
            "soil_alert": "Soil moisture low. {crop} needs irrigation soon in {region}",
            "harvest_ready": "{crop} is ready to harvest in {region}. Market price: {price}/quintal"
        }
    
    async def send_alert(
        self,
        farmer_phone: str,
        alert_template: str,
        template_vars: dict,
        channels: List[str] = ["sms"],
        image_url: Optional[str] = None
    ) -> dict:
        """
        Send alert to farmer through specified channels
        
        Args:
            farmer_phone: Farmer's phone number
            alert_template: Template name (pest_warning, rain_alert, etc.)
            template_vars: Variables to fill in template
            channels: Communication channels [sms, whatsapp, email, push]
            image_url: Drone image or weather map URL
        """
        # Fill template with variables
        message = self.alert_templates.get(alert_template, "Alert: {message}").format(**template_vars)
        
        results = {}
        
        # Send via SMS
        if "sms" in channels:
            results["sms"] = await self.sms.send_alert(
                farmer_phone,
                template_vars.get("crop", ""),
                alert_template,
                message
            )
        
        # Send via WhatsApp
        if "whatsapp" in channels:
            results["whatsapp"] = await self.whatsapp.send_message(
                farmer_phone,
                message,
                image_url=image_url,
                buttons=[
                    {"type": "reply", "reply": {"id": "1", "title": "View Details"}},
                    {"type": "reply", "reply": {"id": "2", "title": "Get Help"}}
                ]
            )
        
        # Log notification
        logger.info(f"Alert sent to {farmer_phone} via {channels}: {alert_template}")
        
        return {
            "farmer": farmer_phone,
            "alert_type": alert_template,
            "channels": results,
            "timestamp": str(datetime.now())
        }
    
    async def schedule_alert(
        self,
        farmer_phone: str,
        alert_template: str,
        template_vars: dict,
        schedule_time: str,  # ISO format
        channels: List[str] = ["sms"]
    ) -> dict:
        """Schedule alert for specific time"""
        return {
            "status": "scheduled",
            "farmer": farmer_phone,
            "alert_type": alert_template,
            "scheduled_for": schedule_time,
            "channels": channels
        }
