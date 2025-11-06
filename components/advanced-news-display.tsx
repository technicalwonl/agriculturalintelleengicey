"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { apiClient, type NewsItem } from "./api-client"
import { TrendingUp, TrendingDown } from "lucide-react"

export function AdvancedNewsDisplay({ country }: { country: string }) {
  const [riskScore, setRiskScore] = useState(50)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiClient.getNewsRisk(country)
        setRiskScore(result.risk_score)
        setNews(result.recent_news || [])
      } catch (error) {
        console.error("Error fetching news:", error)
        // Mock data
        setNews([
          {
            title: "Good crop forecast for next season",
            summary: "Meteorological department predicts favorable conditions",
            sentiment_score: 0.7,
            date: new Date().toISOString(),
            categories: ["weather", "positive"],
          },
        ])
        setRiskScore(45)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [country])

  if (loading)
    return (
      <div className="h-40 flex items-center justify-center">
        <Spinner />
      </div>
    )

  const getRiskColor = (score: number) => {
    if (score < 33) return { color: "#22c55e", label: "Low", bg: "bg-green-900" }
    if (score < 66) return { color: "#eab308", label: "Medium", bg: "bg-yellow-900" }
    return { color: "#ef4444", label: "High", bg: "bg-red-900" }
  }

  const risk = getRiskColor(riskScore)
  const circumference = 2 * Math.PI * 45

  return (
    <div className="space-y-6">
      {/* Risk Gauge */}
      <div className="flex flex-col items-center justify-center py-6">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="45" fill="none" stroke="#374151" strokeWidth="8" />
          <circle
            cx="100"
            cy="100"
            r="45"
            fill="none"
            stroke={risk.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - riskScore / 100)}
            transform="rotate(-90 100 100)"
            style={{ transition: "stroke-dashoffset 0.35s" }}
          />
          <text x="100" y="95" textAnchor="middle" fontSize="32" fontWeight="bold" fill="white">
            {riskScore}%
          </text>
          <text x="100" y="115" textAnchor="middle" fontSize="14" fill="#9ca3af">
            {risk.label}
          </text>
        </svg>
      </div>

      {/* Recent News */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Recent News & Events</h3>
        {news.slice(0, 5).map((item, idx) => {
          const isPositive = item.sentiment_score > 0
          return (
            <Card key={idx} className="p-4 bg-slate-800 border-slate-700">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 line-clamp-2">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.summary}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {item.categories?.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs text-background">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</p>
                  <p className={`text-sm font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    {(item.sentiment_score * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
