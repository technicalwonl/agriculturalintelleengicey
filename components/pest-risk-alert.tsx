"use client"

import { AlertTriangle, Bug, Droplets, Thermometer } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PestRiskProps {
  country: string
  crop: string
  temperature: number
  humidity: number
  rainfall: number
}

export function PestRiskAlert({ country, crop, temperature, humidity, rainfall }: PestRiskProps) {
  // Calculate pest risk based on environmental conditions
  const calculatePestRisk = () => {
    let risk = 0

    // Most pests thrive in warm, humid conditions
    if (temperature > 20 && temperature < 30) risk += 30
    if (humidity > 60) risk += 25
    if (rainfall > 50) risk += 20

    // Crop-specific pest patterns
    const cropRisks: Record<string, number> = {
      wheat: temperature > 25 ? 15 : 5,
      rice: humidity > 70 ? 20 : 10,
      corn: temperature > 22 ? 15 : 8,
      cotton: temperature > 25 && humidity > 60 ? 25 : 10,
      sugarcane: humidity > 75 ? 20 : 8,
    }

    risk += cropRisks[crop.toLowerCase()] || 10
    return Math.min(100, risk)
  }

  const pestRisk = calculatePestRisk()
  const riskLevel = pestRisk > 70 ? "high" : pestRisk > 40 ? "medium" : "low"

  const recommendations: Record<string, string[]> = {
    wheat: ["Monitor for Armyworms", "Check for Hessian fly damage", "Scout for aphids"],
    rice: ["Watch for stem borers", "Monitor for leaf folder", "Check rice blast disease"],
    corn: ["Look for corn borers", "Monitor for fall armyworms", "Check cutworms"],
    cotton: ["Scout for bollworms", "Monitor for spider mites", "Check pink bollworm"],
    sugarcane: ["Monitor for borers", "Watch for red rot", "Check for scale insects"],
  }

  const alerts = recommendations[crop.toLowerCase()] || ["Monitor general pest pressure"]

  return (
    <Card
      className={`p-4 border-l-4 ${
        riskLevel === "high"
          ? "border-l-red-500 bg-red-950/20"
          : riskLevel === "medium"
            ? "border-l-yellow-500 bg-yellow-950/20"
            : "border-l-green-500 bg-green-950/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
            riskLevel === "high" ? "text-red-400" : riskLevel === "medium" ? "text-yellow-400" : "text-green-400"
          }`}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">Pest & Disease Risk</h3>
            <Badge
              variant="outline"
              className={
                riskLevel === "high"
                  ? "bg-red-900 text-red-200 border-red-700"
                  : riskLevel === "medium"
                    ? "bg-yellow-900 text-yellow-200 border-yellow-700"
                    : "bg-green-900 text-green-200 border-green-700"
              }
            >
              {riskLevel.toUpperCase()} - {pestRisk.toFixed(0)}%
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Thermometer className="w-4 h-4" />
              {temperature.toFixed(1)}°C
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Droplets className="w-4 h-4" />
              {humidity.toFixed(0)}%
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Bug className="w-4 h-4" />
              {rainfall.toFixed(0)}mm
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Watch for:</p>
            <ul className="text-xs space-y-0.5 text-muted-foreground">
              {alerts.map((alert, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-green-400">→</span> {alert}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
