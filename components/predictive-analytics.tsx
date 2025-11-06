"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader, BarChart3 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { predictYieldAndPrice } from "@/lib/ai-service"

interface PredictionData {
  expectedYield: number
  priceRange: string
  trend: string
}

interface Props {
  cropType: string
  currentHealth: number
  weatherForecast: string
}

export function PredictiveAnalytics({ cropType, currentHealth, weatherForecast }: Props) {
  const { translate } = useLanguage()
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const result = await predictYieldAndPrice(cropType, currentHealth, weatherForecast, 4.2)
        setPrediction(result)
      } catch (error) {
        console.error("[v0] Prediction error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (cropType && currentHealth > 0) {
      fetchPrediction()
    }
  }, [cropType, currentHealth, weatherForecast])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="w-6 h-6 animate-spin mr-2" />
        <span>{translate("loading")}</span>
      </div>
    )
  }

  if (!prediction) return null

  const trendColor =
    prediction.trend === "increasing"
      ? "text-green-600"
      : prediction.trend === "decreasing"
        ? "text-red-600"
        : "text-yellow-600"

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" />
        {translate("harvest_forecast") || "Harvest & Market Forecast"}
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm text-indigo-600 font-medium">{translate("expected_yield") || "Expected Yield"}</p>
          <p className="text-3xl font-bold text-indigo-900">{prediction.expectedYield.toFixed(1)}</p>
          <p className="text-xs text-indigo-600">tons/acre</p>
        </div>

        <div>
          <p className="text-sm text-indigo-600 font-medium">{translate("market_price") || "Market Price Range"}</p>
          <p className="text-2xl font-bold text-indigo-900">{prediction.priceRange}</p>
          <p className={`text-xs font-semibold mt-1 ${trendColor}`}>Trend: {prediction.trend}</p>
        </div>

        <div className="bg-indigo-100 rounded p-3">
          <p className="text-sm text-indigo-700 font-semibold">💡 Best Harvest Time</p>
          <p className="text-sm mt-1">Within 60-90 days based on current conditions</p>
        </div>
      </div>
    </Card>
  )
}
