"use client"

import { TrendingUp, Target } from "lucide-react"
import { Card } from "@/components/ui/card"

interface YieldForecastProps {
  country: string
  crop: string
  cropHealth: number
  weatherScore: number
  soilMoisture: number
}

export function YieldForecast({ country, crop, cropHealth, weatherScore, soilMoisture }: YieldForecastProps) {
  // Estimate yield based on current conditions
  const calculateYield = () => {
    // Baseline yield per hectare (typical values)
    const baselineYield: Record<string, number> = {
      wheat: 3.5,
      rice: 5.2,
      corn: 8.5,
      cotton: 2.1,
      sugarcane: 70,
    }

    const baseline = baselineYield[crop.toLowerCase()] || 4.0
    const factor = (cropHealth + weatherScore + soilMoisture) / 300
    return baseline * factor
  }

  const yield_estimate = calculateYield()
  const yield_unit = crop.toLowerCase() === "sugarcane" ? "tonnes/hectare" : "tonnes/hectare"

  // Calculate trend
  const trend = weatherScore > 70 && cropHealth > 70 ? "increasing" : weatherScore < 50 ? "decreasing" : "stable"

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold">Yield Forecast</h3>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp
            className={`w-4 h-4 ${
              trend === "increasing" ? "text-green-400" : trend === "decreasing" ? "text-red-400" : "text-yellow-400"
            }`}
          />
          <span className="text-xs font-medium capitalize">{trend}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-green-400 mb-1">
          {yield_estimate.toFixed(1)} {yield_unit === "tonnes/hectare" ? "T/ha" : "T/ha"}
        </p>
        <p className="text-xs text-muted-foreground">
          Estimated yield for {crop} in {country}
        </p>
      </div>

      {/* Contributing factors */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Contributing Factors</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-slate-700 rounded">
            <p className="text-xs text-muted-foreground">Crop Health</p>
            <p className="font-semibold text-green-400">{cropHealth.toFixed(0)}%</p>
          </div>
          <div className="p-2 bg-slate-700 rounded">
            <p className="text-xs text-muted-foreground">Weather</p>
            <p className="font-semibold text-blue-400">{weatherScore.toFixed(0)}%</p>
          </div>
          <div className="p-2 bg-slate-700 rounded">
            <p className="text-xs text-muted-foreground">Soil Moisture</p>
            <p className="font-semibold text-cyan-400">{soilMoisture.toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
