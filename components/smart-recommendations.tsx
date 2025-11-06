"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { AIRecommendation } from "@/lib/ai-service"

interface Props {
  location: string
  weather: string
  soilType: string
}

export function SmartRecommendations({ location, weather, soilType }: Props) {
  const { translate } = useLanguage()
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/ai-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location,
            weather,
            soilType,
            seasonality: new Date().toLocaleString("en-US", { month: "long" }),
          }),
        })

        const data = await response.json()
        setRecommendations(data.recommendations || [])
      } catch (error) {
        console.error("[v0] Recommendations error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (location && weather) {
      fetchRecommendations()
    }
  }, [location, weather, soilType])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="w-6 h-6 animate-spin mr-2" />
        <span>{translate("loading") || "Loading AI recommendations..."}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        {translate("ai_recommendations") || "AI-Powered Crop Recommendations"}
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {recommendations.length > 0 ? (
          recommendations.map((rec, idx) => (
            <Card key={idx} className="p-4 border-2 border-green-200 bg-green-50">
              <h4 className="text-lg font-bold text-green-900 mb-3">{rec.crop}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Expected Yield:</span>
                  <span className="font-bold">{rec.yield} tons/acre</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Water Needed:</span>
                  <span className="font-bold">{rec.water}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Est. Profit:</span>
                  <span className="font-bold text-green-600">₹{rec.profit.toLocaleString()}</span>
                </div>
                <p className="text-green-800 italic border-t pt-2 mt-2">{rec.reason}</p>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">{translate("no_data") || "No recommendations available"}</p>
        )}
      </div>
    </div>
  )
}
