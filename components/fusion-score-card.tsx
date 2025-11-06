"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FusionData {
  fusion_score: number
  risk_level: string
  components: {
    crop_health: number
    weather_score: number
    price_trend: number
    news_risk: number
  }
}

export function FusionScoreCard({ country, crop }: { country: string; crop: string }) {
  const [data, setData] = useState<FusionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Mock API call
        const mockData: FusionData = {
          fusion_score: 72,
          risk_level: "medium",
          components: {
            crop_health: 78,
            weather_score: 68,
            price_trend: 75,
            news_risk: 67,
          },
        }
        setData(mockData)
      } catch (error) {
        console.error("Error fetching fusion score:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [country, crop])

  if (loading) return <div className="h-40 bg-muted animate-pulse rounded" />

  if (!data) return <div>No data available</div>

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-white text-lg font-semibold">
            {crop.toUpperCase()} in {country}
          </h3>
          <p className="text-slate-400 text-sm">Fusion Score Assessment</p>
        </div>
        <Badge className={`${getRiskColor(data.risk_level)} text-white`}>{data.risk_level.toUpperCase()}</Badge>
      </div>

      <div className="text-6xl font-bold text-white mb-6">
        {data.fusion_score.toFixed(1)}
        <span className="text-2xl text-slate-400 ml-2">/100</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(data.components).map(([key, value]) => (
          <div key={key} className="bg-slate-700 p-4 rounded">
            <p className="text-slate-400 text-xs uppercase">{key.replace("_", " ")}</p>
            <p className="text-white text-2xl font-bold mt-2">{value.toFixed(0)}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
