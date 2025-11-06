"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"

interface PriceData {
  day: number
  price: number
  forecast: number | null
}

export function PriceTrendChart({ commodity }: { commodity: string }) {
  const [data, setData] = useState<PriceData[]>([])

  useEffect(() => {
    // Generate mock price data with historical + forecast
    const mockData = Array.from({ length: 40 }, (_, i) => {
      const isHistorical = i < 10
      return {
        day: i - 9,
        price: 300 + Math.sin(i * 0.3) * 30 + i * 0.5,
        forecast: !isHistorical ? 300 + Math.sin(i * 0.3) * 30 + i * 0.5 : null,
      }
    })
    setData(mockData)
  }, [commodity])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" label={{ value: "Days", position: "insideBottomRight", offset: -5 }} />
        <YAxis label={{ value: "Price (USD/ton)", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="price" stroke="#8b5cf6" name="Historical Price" />
        <Line type="monotone" dataKey="forecast" stroke="#ec4899" strokeDasharray="5 5" name="Forecast" />
      </LineChart>
    </ResponsiveContainer>
  )
}
