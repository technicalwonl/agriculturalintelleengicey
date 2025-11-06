from datetime import datetime, timedelta
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class InsuranceType(str, Enum):
    YIELD = "yield"
    WEATHER = "weather"
    COMBINED = "combined"

class CropInsuranceService:
    """Crop insurance recommendations and policy management"""
    
    def __init__(self):
        self.policies_db = {}
        self.claims_db = {}
        
        # Insurance schemes
        self.schemes = {
            "PMFBY": {
                "name": "Pradhan Mantri Fasal Bima Yojana",
                "coverage": "Yield loss + Weather",
                "premium_percentage": 2.0,  # Farmer pays 2%, government pays rest
                "claim_payout": "Up to crop insurance value"
            },
            "WEATHER": {
                "name": "Weather Based Crop Insurance",
                "coverage": "Weather-related losses",
                "premium_percentage": 3.5,
                "claim_payout": "Based on weather index"
            },
            "PRIVATE": {
                "name": "Private Crop Insurance",
                "coverage": "Comprehensive coverage",
                "premium_percentage": 5.0,
                "claim_payout": "Customized based on policy"
            }
        }
    
    async def recommend_insurance(
        self,
        crop: str,
        location: str,
        farm_size_hectares: float,
        historical_yield: float = None
    ) -> dict:
        """Recommend insurance plans based on crop and location risk"""
        
        # Determine risk level based on crop and location
        high_risk_crops = ["cotton", "groundnut", "sugarcane"]
        high_risk_locations = ["Rajasthan", "Gujarat", "Maharashtra"]
        
        risk_level = "medium"
        if crop.lower() in high_risk_crops and location in high_risk_locations:
            risk_level = "high"
        elif crop.lower() in ["wheat", "rice"]:
            risk_level = "low"
        
        # Estimate insurable amount
        crop_values = {
            "wheat": 50000,  # per hectare
            "rice": 60000,
            "cotton": 150000,
            "groundnut": 80000,
            "sugarcane": 200000
        }
        
        base_value = crop_values.get(crop.lower(), 70000)
        insurable_amount = base_value * farm_size_hectares
        
        recommendations = []
        
        # PMFBY - most popular
        pmfby_premium = (insurable_amount * self.schemes["PMFBY"]["premium_percentage"]) / 100
        recommendations.append({
            "scheme": "PMFBY",
            "name": self.schemes["PMFBY"]["name"],
            "risk_level": risk_level,
            "insurable_amount": insurable_amount,
            "farmer_premium": pmfby_premium * 0.02,  # 2% farmer pays
            "government_subsidy": pmfby_premium * 0.98,
            "total_premium": pmfby_premium,
            "coverage": self.schemes["PMFBY"]["coverage"],
            "recommended": True if risk_level in ["high", "medium"] else False
        })
        
        # Weather-based insurance
        weather_premium = (insurable_amount * self.schemes["WEATHER"]["premium_percentage"]) / 100
        recommendations.append({
            "scheme": "WEATHER",
            "name": self.schemes["WEATHER"]["name"],
            "risk_level": "all",
            "insurable_amount": insurable_amount,
            "farmer_premium": weather_premium * 0.5,  # Farmer pays ~50%
            "government_subsidy": weather_premium * 0.5,
            "total_premium": weather_premium,
            "coverage": self.schemes["WEATHER"]["coverage"],
            "recommended": True if risk_level == "high" else False
        })
        
        return {
            "crop": crop,
            "location": location,
            "farm_size": farm_size_hectares,
            "risk_level": risk_level,
            "insurable_amount": insurable_amount,
            "recommendations": recommendations,
            "enrollment_deadline": (datetime.now() + timedelta(days=30)).isoformat()
        }
    
    async def enroll_in_policy(
        self,
        farmer_id: str,
        scheme: str,
        crop: str,
        farm_size: float,
        total_premium: float
    ) -> dict:
        """Enroll farmer in selected insurance policy"""
        
        policy_id = f"policy_{len(self.policies_db) + 1}"
        
        policy = {
            "policy_id": policy_id,
            "farmer_id": farmer_id,
            "scheme": scheme,
            "scheme_name": self.schemes.get(scheme, {}).get("name"),
            "crop": crop,
            "farm_size": farm_size,
            "total_premium": total_premium,
            "status": "active",
            "enrollment_date": datetime.now().isoformat(),
            "season": self._get_current_season(),
            "expiry_date": (datetime.now() + timedelta(days=365)).isoformat(),
            "claims": []
        }
        
        self.policies_db[policy_id] = policy
        logger.info(f"Insurance policy enrolled: {policy_id}")
        
        return policy
    
    async def file_claim(
        self,
        policy_id: str,
        loss_percentage: float,
        description: str,
        supporting_docs: list = None
    ) -> dict:
        """File insurance claim for crop loss"""
        
        if policy_id not in self.policies_db:
            return {"error": "Policy not found"}
        
        policy = self.policies_db[policy_id]
        claim_id = f"claim_{len(self.claims_db) + 1}"
        
        # Calculate claim amount
        claim_amount = (policy["total_premium"] * loss_percentage) / 100
        
        claim = {
            "claim_id": claim_id,
            "policy_id": policy_id,
            "farmer_id": policy["farmer_id"],
            "crop": policy["crop"],
            "loss_percentage": loss_percentage,
            "claim_amount": claim_amount,
            "description": description,
            "supporting_docs": supporting_docs or [],
            "status": "submitted",  # submitted, verified, approved, rejected, disbursed
            "filed_date": datetime.now().isoformat(),
            "verification_date": None,
            "disbursal_date": None
        }
        
        self.claims_db[claim_id] = claim
        policy["claims"].append(claim_id)
        
        logger.info(f"Claim filed: {claim_id}")
        
        return claim
    
    async def get_claim_status(self, claim_id: str) -> dict:
        """Track claim status"""
        if claim_id not in self.claims_db:
            return {"error": "Claim not found"}
        return self.claims_db[claim_id]
    
    def _get_current_season(self) -> str:
        month = datetime.now().month
        if month in [11, 12, 1, 2]:
            return "winter"
        elif month in [3, 4, 5]:
            return "summer"
        else:
            return "monsoon"
