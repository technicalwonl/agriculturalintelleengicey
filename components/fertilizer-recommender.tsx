"use client"

import { Leaf, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

interface FertilizerProps {
  crop: string
  cropHealth: number
  soilMoisture: number
  growthStage: "early" | "mid" | "late"
}

export function FertilizerRecommender({ crop, cropHealth, soilMoisture, growthStage }: FertilizerProps) {
  // Nutrient requirements by crop and growth stage
  const getNutrientRecs = () => {
    const baseRecs: Record<string, Record<string, { N: number; P: number; K: number }>> = {
      wheat: {
        early: { N: 60, P: 40, K: 30 },
        mid: { N: 80, P: 20, K: 40 },
        late: { N: 30, P: 10, K: 50 },
      },
      rice: {
        early: { N: 50, P: 45, K: 40 },
        mid: { N: 90, P: 25, K: 30 },
        late: { N: 40, P: 15, K: 60 },
      },
      corn: {
        early: { N: 70, P: 50, K: 30 },
        mid: { N: 100, P: 20, K: 35 },
        late: { N: 40, P: 10, K: 55 },
      },
      cotton: {
        early: { N: 40, P: 60, K: 40 },
        mid: { N: 70, P: 30, K: 50 },
        late: { N: 30, P: 15, K: 70 },
      },
    }

    const recs = baseRecs[crop.toLowerCase()] || baseRecs.wheat
    let nutrients = recs[growthStage]

    // Adjust based on crop health
    if (cropHealth < 50) {
      nutrients = {
        N: nutrients.N * 1.2,
        P: nutrients.P * 1.1,
        K: nutrients.K * 1.1,
      }
    }

    // Adjust based on soil moisture
    if (soilMoisture > 80) {
      nutrients.N *= 0.9 // Reduce N in waterlogged conditions
    }

    return nutrients
  }

  const nutrients = getNutrientRecs()

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-5 h-5 text-green-400" />
        <h3 className="font-semibold">Fertilizer Recommendation</h3>
      </div>

      <div className="bg-slate-700 rounded p-3 mb-4">
        <p className="text-xs text-muted-foreground mb-2">
          {crop.toUpperCase()} - {growthStage.toUpperCase()} STAGE
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs font-semibold text-blue-400">Nitrogen (N)</p>
            <p className="text-lg font-bold">{nutrients.N.toFixed(0)} kg/ha</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-yellow-400">Phosphorus (P)</p>
            <p className="text-lg font-bold">{nutrients.P.toFixed(0)} kg/ha</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-400">Potassium (K)</p>
            <p className="text-lg font-bold">{nutrients.K.toFixed(0)} kg/ha</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-muted-foreground">
            {cropHealth < 50
              ? "Health is low - increase nutrients to support recovery"
              : "Current health is good - maintain balanced nutrition"}
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          Adjust application timing with irrigation schedules for better absorption.
        </div>
      </div>
    </Card>
  )
}
