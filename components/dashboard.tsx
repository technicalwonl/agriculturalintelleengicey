"use client"

import { useState } from "react"
import { FusionScoreCard } from "./fusion-score-card"
import { CropHealthMap } from "./crop-health-map"
import { WeatherForecast } from "./weather-forecast"
import { PriceTrendChart } from "./price-trend-chart"
import { NewsRiskGauge } from "./news-risk-gauge"
import { DataSelector } from "./data-selector"
import { Card } from "@/components/ui/card"

export function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState("IN")
  const [selectedCrop, setSelectedCrop] = useState("wheat")

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Macro-Data Fusion Platform</h1>
        <p className="text-muted-foreground">Real-time agriculture risk prediction and commodity trend analysis</p>
      </div>

      {/* Data Selector */}
      <DataSelector
        selectedCountry={selectedCountry}
        selectedCrop={selectedCrop}
        onCountryChange={setSelectedCountry}
        onCropChange={setSelectedCrop}
      />

      {/* Fusion Score - Main Widget */}
      <FusionScoreCard country={selectedCountry} crop={selectedCrop} />

      {/* Grid Layout for Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Crop Health Map (NDVI)</h2>
          <CropHealthMap country={selectedCountry} crop={selectedCrop} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Weather Forecast (30 Days)</h2>
          <WeatherForecast country={selectedCountry} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Price Trend Forecast</h2>
          <PriceTrendChart commodity={selectedCrop} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">News Risk Assessment</h2>
          <NewsRiskGauge country={selectedCountry} />
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-6">
        <p>Data updates daily at 2:00 AM UTC</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}
