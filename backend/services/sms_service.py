from twilio.rest import Client
from typing import Optional
import os
import logging

logger = logging.getLogger(__name__)

class SMSService:
    """Service for sending SMS alerts to farmers without internet"""
    
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID", "test_sid")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN", "test_token")
        self.from_number = os.getenv("TWILIO_PHONE_NUMBER", "+1234567890")
        
        # Initialize Twilio only if credentials are real
        if self.account_sid != "test_sid":
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
    
    async def send_alert(
        self,
        phone_number: str,
        crop: str,
        alert_type: str,
        message: str,
        urgency: str = "medium"
    ) -> dict:
        """
        Send SMS alert to farmer
        
        Args:
            phone_number: Farmer's phone number with country code (+91...)
            crop: Crop name (e.g., "wheat", "rice")
            alert_type: Type of alert (pest_warning, rain_alert, price_drop, etc.)
            message: Alert message in local language
            urgency: high/medium/low
        
        Returns:
            dict with message_id, status, and timestamp
        """
        try:
            if not self.client:
                # Mock send for testing
                logger.info(f"[MOCK SMS] To: {phone_number}, Message: {message}")
                return {
                    "status": "sent",
                    "message_id": "mock_id",
                    "provider": "mock",
                    "timestamp": str(__import__('datetime').datetime.now())
                }
            
            # Real Twilio send
            msg = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=phone_number
            )
            
            logger.info(f"SMS sent to {phone_number}: {msg.sid}")
            return {
                "status": "sent",
                "message_id": msg.sid,
                "provider": "twilio",
                "timestamp": str(__import__('datetime').datetime.now())
            }
        except Exception as e:
            logger.error(f"SMS send failed: {str(e)}")
            return {
                "status": "failed",
                "error": str(e),
                "timestamp": str(__import__('datetime').datetime.now())
            }
    
    async def send_bulk_alerts(self, phone_numbers: list, alert_type: str, message: str) -> dict:
        """Send alerts to multiple farmers"""
        results = []
        for phone in phone_numbers:
            result = await self.send_alert(phone, "", alert_type, message)
            results.append(result)
        
        return {
            "total": len(phone_numbers),
            "sent": sum(1 for r in results if r["status"] == "sent"),
            "failed": sum(1 for r in results if r["status"] == "failed"),
            "results": results
        }


class WhatsAppService:
    """Service for WhatsApp alerts with media support"""
    
    def __init__(self):
        self.api_key = os.getenv("WHATSAPP_API_KEY", "test_key")
        self.phone_id = os.getenv("WHATSAPP_PHONE_ID", "test_phone_id")
        self.api_url = "https://graph.instagram.com/v18.0"
    
    async def send_message(
        self,
        phone_number: str,
        message: str,
        image_url: Optional[str] = None,
        buttons: Optional[list] = None
    ) -> dict:
        """
        Send WhatsApp message with optional media and buttons
        
        Args:
            phone_number: Recipient's WhatsApp number (+91...)
            message: Message text
            image_url: URL of image to attach (drone farm images, weather maps, etc.)
            buttons: Quick reply buttons
        """
        try:
            if self.api_key == "test_key":
                # Mock send
                logger.info(f"[MOCK WHATSAPP] To: {phone_number}, Message: {message}")
                return {
                    "status": "sent",
                    "message_id": "mock_wa_id",
                    "timestamp": str(__import__('datetime').datetime.now())
                }
            
            # Real WhatsApp API call
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messaging_product": "whatsapp",
                "to": phone_number,
                "type": "text",
                "text": {"body": message}
            }
            
            # Add image if provided
            if image_url:
                payload["type"] = "image"
                payload["image"] = {"link": image_url}
            
            # Add buttons if provided
            if buttons:
                payload["type"] = "interactive"
                payload["interactive"] = {
                    "type": "button",
                    "body": {"text": message},
                    "action": {"buttons": buttons}
                }
            
            response = __import__('requests').post(
                f"{self.api_url}/{self.phone_id}/messages",
                json=payload,
                headers=headers
            )
            
            logger.info(f"WhatsApp sent to {phone_number}: {response.status_code}")
            return {
                "status": "sent" if response.status_code == 200 else "failed",
                "message_id": response.json().get("messages", [{}])[0].get("id", "unknown"),
                "timestamp": str(__import__('datetime').datetime.now())
            }
        except Exception as e:
            logger.error(f"WhatsApp send failed: {str(e)}")
            return {
                "status": "failed",
                "error": str(e),
                "timestamp": str(__import__('datetime').datetime.now())
            }
