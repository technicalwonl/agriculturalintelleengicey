from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Equipment(BaseModel):
    id: str
    owner_id: str
    name: str
    type: str  # tractor, harvester, sprayer, pump, drone, etc.
    description: str
    hourly_rate: float
    daily_rate: float
    availability: bool
    location: str
    contact_phone: str
    images: List[str] = []
    rating: float = 0.0
    reviews_count: int = 0
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Deere Tractor",
                "type": "tractor",
                "hourly_rate": 500,
                "daily_rate": 3000
            }
        }

class EquipmentRental(BaseModel):
    id: str
    equipment_id: str
    renter_id: str
    start_date: datetime
    end_date: datetime
    total_cost: float
    status: str  # pending, confirmed, completed, cancelled
    payment_status: str  # unpaid, paid, partial
    pickup_address: str
    delivery_address: str

class DirectBuyer(BaseModel):
    id: str
    buyer_name: str
    buyer_phone: str
    buyer_email: str
    buyer_location: str
    crop: str
    quantity_needed: float
    unit: str  # kg, quintal, ton
    price_range_min: float
    price_range_max: float
    delivery_required: bool
    created_at: datetime
    active: bool = True

class FarmerListing(BaseModel):
    id: str
    farmer_id: str
    farmer_name: str
    crop: str
    quantity: float
    unit: str
    price_per_unit: float
    quality_grade: str  # A, B, C
    harvest_date: datetime
    location: str
    contact_phone: str
    images: List[str] = []
    description: str
    storage_type: str  # on_farm, warehouse, open_ground
    available: bool = True
    created_at: datetime

class FarmerBuyerMatch(BaseModel):
    id: str
    farmer_id: str
    buyer_id: str
    crop: str
    quantity: float
    price_per_unit: float
    total_amount: float
    negotiation_status: str  # initial, counter_offered, agreed, rejected
    messages: List[dict] = []
    contract_signed: bool = False
    created_at: datetime
