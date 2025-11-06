"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { apiClient, type FusionScoreResponse } from "./api-client"
import { AlertTriangle, CheckCircle } from "lucide-react"

export function AdvancedFusionCard({ country, crop }: { country: string; crop: string }) {
  const [data, setData] = useState<FusionScoreResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiClient.getFusionScore(country, crop)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        // Mock data for demo
        setData({
          fusion_score: 72,
          risk_level: "medium",
          confidence: 0.85,
          components: {
            crop_health: 78,
            weather_score: 68,
            price_trend: 75,
            news_risk: 67,
          },
          component_importance: {
            crop_health: "strength_1",
            weather_score: "risk_driver_1",
            price_trend: "strength_2",
            news_risk: "risk_driver_2",
          },
          interpretation: "Mixed conditions - Require active management",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [country, crop])

  if (loading) {
    return (
      <div className="h-40 bg-muted animate-pulse rounded flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!data) return <div>No data available</div>

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return { bg: "bg-green-900", border: "border-green-700", text: "text-green-400" }
      case "medium":
        return { bg: "bg-yellow-900", border: "border-yellow-700", text: "text-yellow-400" }
      case "high":
        return { bg: "bg-red-900", border: "border-red-700", text: "text-red-400" }
      default:
        return { bg: "bg-gray-900", border: "border-gray-700", text: "text-gray-400" }
    }
  }

  const colors = getRiskColor(data.risk_level)
  const RiskIcon = data.risk_level === "low" ? CheckCircle : AlertTriangle

  return (
    <Card className={`p-8 ${colors.bg} border-2 ${colors.border}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className={`${colors.text} text-lg font-semibold`}>
            {crop.toUpperCase()} in {country}
          </h3>
          <p className="text-slate-400 text-sm">Real-time Risk Assessment</p>
        </div>
        <div className="flex items-center gap-2">
          <RiskIcon className={`w-5 h-5 ${colors.text}`} />
          <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
            {data.risk_level.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Main Score */}
      <div className="mb-8">
        <div className="text-6xl font-bold text-white mb-2">
          {data.fusion_score.toFixed(1)}
          <span className="text-2xl text-slate-400 ml-2">/100</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 bg-slate-700 rounded-full flex-1">
            <div
              className={`h-2 rounded-full ${
                data.fusion_score >= 75 ? "bg-green-500" : data.fusion_score >= 50 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${data.fusion_score}%` }}
            />
          </div>
          <span className="text-sm text-slate-400">Confidence: {(data.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Interpretation */}
      <p className="text-sm text-slate-300 mb-6 italic">{data.interpretation}</p>

      {/* Component Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(data.components).map(([key, value]) => {
          const importance = data.component_importance[key] || "normal"
          const isRiskDriver = importance.includes("risk_driver")

          return (
            <div
              key={key}
              className={`p-4 rounded border ${
                isRiskDriver ? "bg-red-900 border-red-700" : "bg-slate-700 border-slate-600"
              }`}
            >
              <p className="text-slate-300 text-xs uppercase font-semibold">{key.replace(/_/g, " ")}</p>
              <p className="text-white text-2xl font-bold mt-2">{value.toFixed(0)}</p>
              {isRiskDriver && <p className="text-red-300 text-xs mt-1">⚠️ Risk Factor</p>}
            </div>
          )
        })}
      </div>

      {/* Key Insights */}
      <div className="bg-slate-800 rounded p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-3">Key Factors</h4>
        <ul className="space-y-2 text-sm text-slate-300">
          {Object.entries(data.component_importance).map(([component, status]) => (
            <li key={component} className="flex items-center gap-2">
              <span className={status.includes("risk") ? "text-red-400" : "text-green-400"}>
                {status.includes("risk") ? "↓" : "↑"}
              </span>
              <span>
                {component.replace(/_/g, " ")}: {status.replace(/_/g, " ")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
