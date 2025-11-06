from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from backend.services.soil_testing_service import SoilTestingLab
from backend.services.crop_insurance_service import CropInsuranceService
import logging

router = APIRouter(prefix="/api/farm-services", tags=["farm-services"])
logger = logging.getLogger(__name__)

soil_service = SoilTestingLab()
insurance_service = CropInsuranceService()

# Soil Testing Routes
@router.get("/soil-labs")
async def get_nearby_labs(location: str, crop: str = None):
    """Get nearby soil testing labs"""
    try:
        labs = await soil_service.get_nearby_labs(location, crop)
        return {"labs": labs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/soil-test/request")
async def request_soil_test(
    farmer_id: str,
    farm_location: str,
    lab_id: str,
    tests_required: List[str],
    background_tasks: BackgroundTasks
):
    """Create soil testing request"""
    try:
        request = await soil_service.request_soil_test(
            farmer_id, farm_location, lab_id, tests_required
        )
        # Send notification to lab
        background_tasks.add_task(notify_lab, lab_id, request)
        return request
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/soil-test/status/{request_id}")
async def get_test_status(request_id: str):
    """Get soil test status"""
    status = await soil_service.get_test_status(request_id)
    return status

@router.get("/soil-test/report/{request_id}")
async def get_soil_report(request_id: str):
    """Get soil test report"""
    try:
        report = await soil_service.generate_soil_report(request_id)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Crop Insurance Routes
@router.post("/insurance/recommendations")
async def get_insurance_recommendations(
    crop: str,
    location: str,
    farm_size_hectares: float,
    historical_yield: float = None
):
    """Get crop insurance recommendations"""
    try:
        recommendations = await insurance_service.recommend_insurance(
            crop, location, farm_size_hectares, historical_yield
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/insurance/enroll")
async def enroll_in_insurance(
    farmer_id: str,
    scheme: str,
    crop: str,
    farm_size: float,
    total_premium: float,
    background_tasks: BackgroundTasks
):
    """Enroll farmer in insurance policy"""
    try:
        policy = await insurance_service.enroll_in_policy(
            farmer_id, scheme, crop, farm_size, total_premium
        )
        # Send confirmation
        background_tasks.add_task(send_policy_confirmation, policy)
        return policy
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/insurance/claim")
async def file_insurance_claim(
    policy_id: str,
    loss_percentage: float,
    description: str,
    supporting_docs: List[str] = None,
    background_tasks: BackgroundTasks = None
):
    """File insurance claim"""
    try:
        claim = await insurance_service.file_claim(
            policy_id, loss_percentage, description, supporting_docs
        )
        # Send notifications
        if background_tasks:
            background_tasks.add_task(notify_claim_filed, claim)
        return claim
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insurance/claim/{claim_id}")
async def get_claim_status(claim_id: str):
    """Track insurance claim"""
    status = await insurance_service.get_claim_status(claim_id)
    return status

# Helper functions
async def notify_lab(lab_id: str, request: dict):
    logger.info(f"Notifying lab {lab_id} of soil test request")

async def send_policy_confirmation(policy: dict):
    logger.info(f"Sending policy confirmation for {policy['policy_id']}")

async def notify_claim_filed(claim: dict):
    logger.info(f"Notifying claim filed: {claim['claim_id']}")
