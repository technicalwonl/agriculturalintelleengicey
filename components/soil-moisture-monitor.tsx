"use client"

import { Droplets, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SoilMoistureProps {
  rainfall: number
  temperature: number
  crop: string
}

export function SoilMoistureMonitor({ rainfall, temperature, crop }: SoilMoistureProps) {
  // Estimate soil moisture based on rainfall and temperature
  const calculateMoisture = () => {
    let moisture = 50 // Base level
    moisture += rainfall * 0.5 // Rainfall increases moisture
    moisture -= Math.max(0, temperature - 25) * 1.5 // Heat evaporates moisture
    return Math.min(100, Math.max(0, moisture))
  }

  const moisture = calculateMoisture()
  const optimalRanges: Record<string, { min: number; max: number }> = {
    wheat: { min: 60, max: 80 },
    rice: { min: 70, max: 90 },
    corn: { min: 65, max: 85 },
    cotton: { min: 55, max: 75 },
    sugarcane: { min: 65, max: 85 },
  }

  const optimal = optimalRanges[crop.toLowerCase()] || { min: 60, max: 80 }
  const status =
    moisture >= optimal.min && moisture <= optimal.max ? "optimal" : moisture < optimal.min ? "dry" : "waterlogged"

  const actions = {
    dry: ["Increase irrigation", "Mulch soil to retain moisture", "Consider deficit irrigation techniques"],
    optimal: ["Monitor regularly", "Maintain current irrigation", "Prepare for seasonal changes"],
    waterlogged: ["Reduce irrigation", "Improve drainage", "Monitor for fungal diseases"],
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold">Soil Moisture Level</h3>
        </div>
        <Badge
          variant="outline"
          className={
            status === "optimal"
              ? "bg-green-900 text-green-200 border-green-700"
              : status === "dry"
                ? "bg-orange-900 text-orange-200 border-orange-700"
                : "bg-blue-900 text-blue-200 border-blue-700"
          }
        >
          {status.toUpperCase()}
        </Badge>
      </div>

      {/* Moisture gauge */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>0%</span>
          <span>Moisture Level</span>
          <span>100%</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              status === "optimal" ? "bg-green-500" : status === "dry" ? "bg-orange-500" : "bg-blue-500"
            }`}
            style={{ width: `${moisture}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-orange-400">Dry ({optimal.min}%)</span>
          <span className="text-green-400">Optimal ({optimal.max}%)</span>
        </div>
      </div>

      {/* Recommended actions */}
      <div className="space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Recommended Actions
        </p>
        <ul className="space-y-1">
          {actions[status].map((action, idx) => (
            <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="text-blue-400">•</span> {action}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
