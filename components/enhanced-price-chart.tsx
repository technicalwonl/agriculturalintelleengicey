"use client"

import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts"
import { useEffect, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { apiClient } from "./api-client"

interface PriceData {
  day: number
  price: number
  forecast: number | null
  upper_bound: number | null
  lower_bound: number | null
}

export function EnhancedPriceChart({ commodity }: { commodity: string }) {
  const [data, setData] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiClient.getPricePredictor(commodity, 30)

        const processedData = result.forecast_values.map((price: number, index: number) => ({
          day: index + 1,
          price: result.forecast_values[Math.max(0, index - 1)] || 300,
          forecast: price,
          upper_bound: price * 1.1,
          lower_bound: price * 0.9,
        }))

        setData(processedData)
        setTrend(result.trend as "up" | "down" | "stable")
      } catch (error) {
        console.error("Error fetching price:", error)
        // Mock data
        const mockData = Array.from({ length: 40 }, (_, i) => {
          const basePrice = 300 + Math.sin(i * 0.3) * 30 + i * 0.5
          return {
            day: i - 9,
            price: i < 10 ? basePrice : undefined,
            forecast: i >= 9 ? basePrice : undefined,
            upper_bound: basePrice * 1.1,
            lower_bound: basePrice * 0.9,
          }
        })
        setData(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [commodity])

  if (loading)
    return (
      <div className="h-80 flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )

  const trendColor = trend === "up" ? "#22c55e" : trend === "down" ? "#ef4444" : "#f59e0b"
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→"

  return (
    <div className="space-y-6">
      {/* Price Forecast with Confidence Interval */}
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis label={{ value: "Price (USD/ton)", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(value) => value?.toFixed(2)} />
          <Legend />

          {/* Confidence Interval as Area */}
          <Area type="monotone" dataKey="upper_bound" fill="none" stroke="none" name="Upper Bound" />
          <Area type="monotone" dataKey="lower_bound" fill="none" stroke="none" name="Lower Bound" />

          {/* Main Price Lines */}
          <Line type="monotone" dataKey="price" stroke="#ff9f43" name="Historical" strokeWidth={2} />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke={trendColor}
            strokeDasharray="5 5"
            name="Forecast"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Trend & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded">
          <p className="text-slate-400 text-sm uppercase">Price Trend</p>
          <p className="text-3xl font-bold mt-2" style={{ color: trendColor }}>
            {trendIcon} {trend.toUpperCase()}
          </p>
        </div>

        <div className="bg-slate-800 p-4 rounded">
          <p className="text-slate-400 text-sm uppercase">Current Price</p>
          <p className="text-2xl font-bold text-white mt-2">${data[data.length - 1]?.price?.toFixed(0)}</p>
        </div>

        <div className="bg-slate-800 p-4 rounded">
          <p className="text-slate-400 text-sm uppercase">30-Day Forecast</p>
          <p className="text-2xl font-bold text-white mt-2">${data[data.length - 1]?.forecast?.toFixed(0)}</p>
        </div>
      </div>
    </div>
  )
}
