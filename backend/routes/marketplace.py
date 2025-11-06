from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from backend.schemas.marketplace import (
    Equipment, EquipmentRental, DirectBuyer, FarmerListing, FarmerBuyerMatch
)
import logging

router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])
logger = logging.getLogger(__name__)

# Mock database
equipment_db = {}
rentals_db = {}
buyers_db = {}
farmer_listings_db = {}
matches_db = {}

# Equipment Rental Routes
@router.post("/equipment/list")
async def list_equipment(equipment: Equipment):
    """Owner lists equipment for rent"""
    try:
        equipment.id = f"eq_{len(equipment_db) + 1}"
        equipment_db[equipment.id] = equipment
        logger.info(f"Equipment listed: {equipment.name}")
        return {"status": "success", "equipment_id": equipment.id, "data": equipment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/equipment/search")
async def search_equipment(
    equipment_type: str = None,
    location: str = None,
    max_price: float = None,
    skip: int = 0,
    limit: int = 20
):
    """Search available equipment for rent"""
    results = []
    for eq in equipment_db.values():
        if equipment_type and eq.type != equipment_type:
            continue
        if location and eq.location != location:
            continue
        if max_price and eq.daily_rate > max_price:
            continue
        if eq.availability:
            results.append(eq)
    
    return {
        "total": len(results),
        "equipment": results[skip:skip+limit]
    }

@router.post("/equipment/rent")
async def rent_equipment(rental: EquipmentRental, background_tasks: BackgroundTasks):
    """Farmer rents equipment from owner"""
    try:
        rental.id = f"rent_{len(rentals_db) + 1}"
        rental.status = "pending"
        rental.payment_status = "unpaid"
        rentals_db[rental.id] = rental
        
        # Send notification to owner
        background_tasks.add_task(send_rental_notification, rental.equipment_id, rental)
        
        logger.info(f"Equipment rental created: {rental.id}")
        return {"status": "success", "rental_id": rental.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rentals/{farmer_id}")
async def get_farmer_rentals(farmer_id: str):
    """Get all rentals for a farmer"""
    rentals = [r for r in rentals_db.values() if r.renter_id == farmer_id]
    return {"rentals": rentals}

# Direct Buyer Routes
@router.post("/buyers/register")
async def register_direct_buyer(buyer: DirectBuyer):
    """Direct buyer registers to buy crops"""
    try:
        buyer.id = f"buyer_{len(buyers_db) + 1}"
        buyers_db[buyer.id] = buyer
        logger.info(f"Buyer registered: {buyer.buyer_name}")
        return {"status": "success", "buyer_id": buyer.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/buyers/search")
async def search_buyers(crop: str, location: str = None):
    """Find buyers looking for specific crop"""
    results = []
    for buyer in buyers_db.values():
        if buyer.crop == crop and buyer.active:
            if location is None or buyer.buyer_location == location:
                results.append(buyer)
    return {"buyers": results}

# Farmer Listings
@router.post("/listings/create")
async def create_farmer_listing(listing: FarmerListing):
    """Farmer lists their crop for sale"""
    try:
        listing.id = f"list_{len(farmer_listings_db) + 1}"
        farmer_listings_db[listing.id] = listing
        logger.info(f"Crop listing created: {listing.crop}")
        return {"status": "success", "listing_id": listing.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/listings/search")
async def search_listings(crop: str, location: str = None, max_price: float = None):
    """Search available crop listings"""
    results = []
    for listing in farmer_listings_db.values():
        if listing.crop == crop and listing.available:
            if location and listing.location != location:
                continue
            if max_price and listing.price_per_unit > max_price:
                continue
            results.append(listing)
    
    return {
        "total": len(results),
        "listings": sorted(results, key=lambda x: x.price_per_unit)
    }

# Farmer-Buyer Matching
@router.post("/match/create")
async def create_match(match: FarmerBuyerMatch, background_tasks: BackgroundTasks):
    """Create match between farmer and buyer"""
    try:
        match.id = f"match_{len(matches_db) + 1}"
        match.negotiation_status = "initial"
        matches_db[match.id] = match
        
        # Send notifications to both parties
        background_tasks.add_task(send_match_notification, match)
        
        logger.info(f"Farmer-buyer match created: {match.id}")
        return {"status": "success", "match_id": match.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match/{match_id}/message")
async def send_match_message(match_id: str, message: dict):
    """Send message in farmer-buyer negotiation"""
    if match_id not in matches_db:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match = matches_db[match_id]
    match.messages.append({
        "timestamp": str(__import__('datetime').datetime.now()),
        **message
    })
    
    return {"status": "success", "message_count": len(match.messages)}

@router.post("/match/{match_id}/agree")
async def agree_on_deal(match_id: str, background_tasks: BackgroundTasks):
    """Farmer and buyer agree on price and terms"""
    if match_id not in matches_db:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match = matches_db[match_id]
    match.negotiation_status = "agreed"
    
    # Trigger contract generation
    background_tasks.add_task(generate_contract, match)
    
    return {"status": "agreed", "match_id": match_id}

# Helper functions
async def send_rental_notification(equipment_id: str, rental: EquipmentRental):
    logger.info(f"Sending rental notification for equipment {equipment_id}")

async def send_match_notification(match: FarmerBuyerMatch):
    logger.info(f"Sending match notification to farmer {match.farmer_id} and buyer {match.buyer_id}")

async def generate_contract(match: FarmerBuyerMatch):
    logger.info(f"Generating contract for match {match.id}")
