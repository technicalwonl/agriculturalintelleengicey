"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, DollarSign } from "lucide-react"

interface InsuranceScheme {
  scheme: string
  name: string
  risk_level: string
  insurable_amount: number
  farmer_premium: number
  government_subsidy: number
  total_premium: number
  coverage: string
  recommended: boolean
}

export function CropInsuranceHub() {
  const [farmSize, setFarmSize] = useState(1)
  const [selectedCrop, setSelectedCrop] = useState("wheat")
  const [recommendations, setRecommendations] = useState<InsuranceScheme[]>([])
  const [loading, setLoading] = useState(false)

  const crops = ["wheat", "rice", "cotton", "groundnut", "sugarcane"]

  const fetchRecommendations = async () => {
    setLoading(true)
    // Mock API call
    const mockRecommendations = [
      {
        scheme: "PMFBY",
        name: "Pradhan Mantri Fasal Bima Yojana",
        risk_level: "medium",
        insurable_amount: farmSize * 50000,
        farmer_premium: 1000,
        government_subsidy: 49000,
        total_premium: 50000,
        coverage: "Yield loss + Weather",
        recommended: true,
      },
      {
        scheme: "WEATHER",
        name: "Weather Based Crop Insurance",
        risk_level: "high",
        insurable_amount: farmSize * 50000,
        farmer_premium: 875,
        government_subsidy: 875,
        total_premium: 1750,
        coverage: "Weather-related losses",
        recommended: false,
      },
    ]
    setRecommendations(mockRecommendations)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">Get Insurance Recommendations</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full p-2 border rounded-md mt-1"
            >
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Farm Size (hectares)</label>
            <input
              type="number"
              min="0.1"
              max="100"
              step="0.5"
              value={farmSize}
              onChange={(e) => setFarmSize(Number.parseFloat(e.target.value))}
              className="w-full p-2 border rounded-md mt-1"
            />
          </div>
        </div>

        <Button onClick={fetchRecommendations} disabled={loading} className="w-full">
          {loading ? "Getting Recommendations..." : "Get Recommendations"}
        </Button>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Recommended Schemes</h3>
          {recommendations.map((scheme) => (
            <Card key={scheme.scheme} className={`p-4 ${scheme.recommended ? "border-green-300 bg-green-50" : ""}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Scheme Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold">{scheme.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{scheme.coverage}</p>
                  {scheme.recommended && <Badge className="bg-green-500 w-fit">Recommended</Badge>}
                </div>

                {/* Coverage Amount */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Insurable Amount</p>
                  <p className="font-semibold text-lg">₹{(scheme.insurable_amount / 100000).toFixed(1)}L</p>
                </div>

                {/* Premium Breakdown */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">You Pay (Farmer)</p>
                  <p className="font-semibold text-green-600">₹{scheme.farmer_premium}</p>
                  <p className="text-xs text-muted-foreground">Govt pays: ₹{scheme.government_subsidy}</p>
                </div>

                {/* Action */}
                <div className="flex flex-col justify-end">
                  <Button className="gap-2">
                    <DollarSign className="w-4 h-4" />
                    Enroll Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
