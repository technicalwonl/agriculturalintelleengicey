"use client"

import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import { useEffect, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { apiClient, type WeatherData } from "./api-client"

interface ProcessedWeather {
  day: number
  temperature_min: number
  temperature_max: number
  temperature_avg: number
  rainfall_mm: number
  humidity_percent: number
}

export function EnhancedWeatherChart({ country }: { country: string }) {
  const [data, setData] = useState<ProcessedWeather[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiClient.getWeatherForecast(country, 30)
        const processed = result.data.map((item: WeatherData, index: number) => ({
          day: index + 1,
          temperature_min: item.temperature_min,
          temperature_max: item.temperature_max,
          temperature_avg: (item.temperature_min + item.temperature_max) / 2,
          rainfall_mm: item.rainfall_mm,
          humidity_percent: item.humidity_percent,
        }))
        setData(processed)
      } catch (error) {
        console.error("Error fetching weather:", error)
        // Mock data
        setData(
          Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            temperature_min: 15 + Math.sin(i * 0.2) * 5,
            temperature_max: 28 + Math.sin(i * 0.2) * 5,
            temperature_avg: 21.5 + Math.sin(i * 0.2) * 5,
            rainfall_mm: 10 + Math.random() * 15,
            humidity_percent: 65 + Math.random() * 20,
          })),
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [country])

  if (loading)
    return (
      <div className="h-80 flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )

  return (
    <div className="space-y-6">
      {/* Temperature & Rainfall */}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="rainfall_mm" fill="#3b82f6" name="Rainfall (mm)" opacity={0.6} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="temperature_avg"
            stroke="#ef4444"
            name="Temp (°C)"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Humidity Trend */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="humidity_percent" stroke="#8b5cf6" name="Humidity (%)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        {[
          {
            label: "Avg Temp",
            value: (data.reduce((a, b) => a + b.temperature_avg, 0) / data.length).toFixed(1) + "°C",
          },
          { label: "Total Rain", value: data.reduce((a, b) => a + b.rainfall_mm, 0).toFixed(0) + " mm" },
          {
            label: "Avg Humidity",
            value: (data.reduce((a, b) => a + b.humidity_percent, 0) / data.length).toFixed(0) + "%",
          },
          { label: "Days Ahead", value: data.length },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 p-3 rounded">
            <p className="text-slate-400 text-xs uppercase">{stat.label}</p>
            <p className="text-white text-lg font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
