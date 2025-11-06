from datetime import datetime, timedelta
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class SoilTestingLab:
    """Integration with government and private soil testing labs"""
    
    def __init__(self):
        # Mock database of available labs
        self.labs = {
            "lab_1": {
                "name": "Punjab Agricultural University Soil Lab",
                "location": "Ludhiana, Punjab",
                "phone": "+91-9876543210",
                "email": "soil@pau.edu.in",
                "tests_offered": ["NPK", "pH", "organic_matter", "micronutrients"],
                "turnaround_days": 5,
                "cost": {"NPK": 200, "pH": 100, "organic_matter": 150, "micronutrients": 300}
            },
            "lab_2": {
                "name": "ICAR Soil Testing Lab Delhi",
                "location": "New Delhi",
                "phone": "+91-8765432109",
                "email": "soiltest@icar.gov.in",
                "tests_offered": ["NPK", "pH", "organic_matter", "pesticide_residue"],
                "turnaround_days": 7,
                "cost": {"NPK": 250, "pH": 100, "organic_matter": 200, "pesticide_residue": 500}
            },
            "lab_3": {
                "name": "Village Level Soil Testing Kit Center",
                "location": "Indore, Madhya Pradesh",
                "phone": "+91-7654321098",
                "email": "vlstkc@mp.gov.in",
                "tests_offered": ["NPK", "pH"],
                "turnaround_days": 1,
                "cost": {"NPK": 50, "pH": 25}
            }
        }
        
        self.requests_db = {}
        self.reports_db = {}
    
    async def get_nearby_labs(self, location: str, crop: str = None) -> List[dict]:
        """Find nearby soil testing labs"""
        # In production, use geolocation API
        nearby = []
        for lab_id, lab_info in self.labs.items():
            if location.lower() in lab_info["location"].lower():
                nearby.append({
                    "lab_id": lab_id,
                    **lab_info,
                    "distance_km": 5  # Mock distance
                })
        
        return nearby if nearby else list(self.labs.values())
    
    async def request_soil_test(
        self,
        farmer_id: str,
        farm_location: str,
        lab_id: str,
        tests_required: List[str],
        soil_sample_type: str = "surface"  # surface, subsurface, mixed
    ) -> dict:
        """Create soil testing request"""
        request_id = f"soiltest_{len(self.requests_db) + 1}"
        
        lab = self.labs.get(lab_id, {})
        total_cost = sum(lab.get("cost", {}).get(test, 0) for test in tests_required)
        
        request = {
            "request_id": request_id,
            "farmer_id": farmer_id,
            "lab_id": lab_id,
            "lab_name": lab.get("name"),
            "farm_location": farm_location,
            "tests": tests_required,
            "total_cost": total_cost,
            "sample_type": soil_sample_type,
            "status": "pending",  # pending, sample_submitted, testing, report_ready
            "sample_pickup_date": None,
            "expected_report_date": (datetime.now() + timedelta(days=lab.get("turnaround_days", 7))).isoformat(),
            "report_file": None,
            "created_at": datetime.now().isoformat()
        }
        
        self.requests_db[request_id] = request
        logger.info(f"Soil test request created: {request_id}")
        
        return request
    
    async def generate_soil_report(self, request_id: str) -> dict:
        """Generate mock soil test report"""
        if request_id not in self.requests_db:
            return {"error": "Request not found"}
        
        request = self.requests_db[request_id]
        
        # Generate mock results
        report = {
            "report_id": f"report_{request_id}",
            "request_id": request_id,
            "farm_location": request["farm_location"],
            "test_date": datetime.now().isoformat(),
            "results": {}
        }
        
        # Add test results
        if "NPK" in request["tests"]:
            report["results"]["NPK"] = {
                "nitrogen": 25,  # kg/hectare
                "phosphorus": 18,
                "potassium": 250,
                "status": "deficient" if 25 < 40 else "adequate"
            }
        
        if "pH" in request["tests"]:
            report["results"]["pH"] = {
                "value": 6.8,
                "status": "slightly_acidic",
                "suitable_for": ["wheat", "rice", "maize"]
            }
        
        if "organic_matter" in request["tests"]:
            report["results"]["organic_matter"] = {
                "percentage": 2.1,
                "status": "low",
                "recommendation": "Add 5-10 tons compost/hectare"
            }
        
        if "micronutrients" in request["tests"]:
            report["results"]["micronutrients"] = {
                "zinc": 0.8,
                "iron": 8.5,
                "manganese": 15.2,
                "boron": 0.5,
                "deficiencies": ["zinc"]
            }
        
        # Recommendations
        report["recommendations"] = self._generate_recommendations(report["results"])
        
        self.reports_db[report["report_id"]] = report
        self.requests_db[request_id]["status"] = "report_ready"
        self.requests_db[request_id]["report_file"] = report["report_id"]
        
        return report
    
    def _generate_recommendations(self, results: dict) -> List[str]:
        """Generate actionable recommendations from soil test results"""
        recommendations = []
        
        if "NPK" in results:
            npk = results["NPK"]
            if npk["nitrogen"] < 40:
                recommendations.append("Apply 60-80 kg nitrogen per hectare through urea")
            if npk["phosphorus"] < 25:
                recommendations.append("Apply 40-50 kg phosphorus per hectare through DAP")
        
        if "organic_matter" in results:
            if results["organic_matter"]["percentage"] < 2.5:
                recommendations.append("Incorporate 5-10 tons well-decomposed compost/hectare")
        
        if "micronutrients" in results:
            mn = results["micronutrients"]
            if mn.get("zinc", 1) < 1.2:
                recommendations.append("Apply 25 kg zinc sulfate per hectare or use zinc-fortified seeds")
            if mn.get("boron", 0.5) < 0.5:
                recommendations.append("Apply 1.5-2 kg boron per hectare (borax or boric acid)")
        
        return recommendations
    
    async def get_test_status(self, request_id: str) -> dict:
        """Track soil test request status"""
        if request_id not in self.requests_db:
            return {"error": "Request not found"}
        return self.requests_db[request_id]
