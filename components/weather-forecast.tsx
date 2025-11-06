"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"

interface WeatherData {
  day: number
  temperature_max: number
  rainfall_mm: number
  humidity_percent: number
}

export function WeatherForecast({ country }: { country: string }) {
  const [data, setData] = useState<WeatherData[]>([])

  useEffect(() => {
    // Generate mock 30-day forecast
    const mockData = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      temperature_max: 25 + Math.sin(i * 0.2) * 5,
      rainfall_mm: 10 + Math.random() * 15,
      humidity_percent: 65 + Math.random() * 20,
    }))
    setData(mockData)
  }, [country])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" label={{ value: "Days Ahead", position: "insideBottomRight", offset: -5 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="temperature_max" stroke="#ef4444" name="Temp (°C)" />
        <Line type="monotone" dataKey="rainfall_mm" stroke="#3b82f6" name="Rainfall (mm)" />
      </LineChart>
    </ResponsiveContainer>
  )
}
