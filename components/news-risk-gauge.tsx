"use client"

import { useEffect, useState } from "react"

interface NewsRiskData {
  risk_score: number
  risk_level: string
}

export function NewsRiskGauge({ country }: { country: string }) {
  const [data, setData] = useState<NewsRiskData>({ risk_score: 0, risk_level: "low" })

  useEffect(() => {
    // Mock data
    const mockData = {
      risk_score: 45,
      risk_level: "medium",
    }
    setData(mockData)
  }, [country])

  const getRiskColor = (score: number) => {
    if (score < 33) return { color: "#22c55e", label: "Low" }
    if (score < 66) return { color: "#eab308", label: "Medium" }
    return { color: "#ef4444", label: "High" }
  }

  const risk = getRiskColor(data.risk_score)
  const circumference = 2 * Math.PI * 45

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle cx="100" cy="100" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />

        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r="45"
          fill="none"
          stroke={risk.color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - data.risk_score / 100)}
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 0.35s" }}
        />

        {/* Center text */}
        <text x="100" y="95" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#1f2937">
          {data.risk_score}%
        </text>
        <text x="100" y="115" textAnchor="middle" fontSize="14" fill="#6b7280">
          {risk.label}
        </text>
      </svg>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">Socio-political risk based on recent news sentiment</p>
      </div>
    </div>
  )
}
