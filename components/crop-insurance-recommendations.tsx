"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, TrendingDown } from "lucide-react"

interface InsuranceScheme {
  id: string
  name: string
  type: "Weather-Based" | "Yield-Based" | "PMFBY"
  coverage: string
  premiumCost: number
  governmentSubsidy: number
  farmerCost: number
  coverageAmount: number
}

const insuranceSchemes: InsuranceScheme[] = [
  {
    id: "1",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    type: "PMFBY",
    coverage: "Crop failure due to pests, diseases, weather",
    premiumCost: 1500,
    governmentSubsidy: 1050,
    farmerCost: 450,
    coverageAmount: 50000,
  },
  {
    id: "2",
    name: "Weather-Based Crop Insurance (WBCIS)",
    type: "Weather-Based",
    coverage: "Excessive rain, drought, temperature extremes",
    premiumCost: 800,
    governmentSubsidy: 560,
    farmerCost: 240,
    coverageAmount: 30000,
  },
  {
    id: "3",
    name: "Modified PMFBY - Premium Benefit",
    type: "Yield-Based",
    coverage: "Guaranteed yield protection with higher limits",
    premiumCost: 2000,
    governmentSubsidy: 1200,
    farmerCost: 800,
    coverageAmount: 75000,
  },
]

interface CropInsuranceRecommendationsProps {
  selectedCrop?: string
  selectedRegion?: string
  riskLevel?: "low" | "medium" | "high" | "critical"
}

export function CropInsuranceRecommendations({
  selectedCrop,
  selectedRegion,
  riskLevel = "medium",
}: CropInsuranceRecommendationsProps) {
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-lg">Crop Insurance Recommendations</h3>
      </div>

      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <TrendingDown className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Risk Assessment for {selectedCrop || "Current Crop"}</p>
            <p className="text-blue-800 mt-1">
              Current risk level: <Badge variant={getRiskBadgeColor(riskLevel)}>{riskLevel.toUpperCase()}</Badge>
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-3">
        {insuranceSchemes.map((scheme) => (
          <Card key={scheme.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">{scheme.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{scheme.coverage}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-muted-foreground">Coverage Amount</p>
                  <p className="font-bold text-base">₹{scheme.coverageAmount.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <p className="text-xs text-green-700">Your Cost (After Subsidy)</p>
                  <p className="font-bold text-green-700">₹{scheme.farmerCost}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Total Premium</p>
                  <p className="font-semibold">₹{scheme.premiumCost}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Government Pays</p>
                  <p className="font-semibold text-blue-600">₹{scheme.governmentSubsidy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">You Pay</p>
                  <p className="font-semibold text-green-600">₹{scheme.farmerCost}</p>
                </div>
              </div>

              <Button className="w-full text-sm">Enroll Now</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
