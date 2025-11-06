"use client"

import { useState } from "react"
import { AdvancedFusionCard } from "./advanced-fusion-card"
import { EnhancedWeatherChart } from "./enhanced-weather-chart"
import { EnhancedPriceChart } from "./enhanced-price-chart"
import { AdvancedNewsDisplay } from "./advanced-news-display"
import { CropHealthMap } from "./crop-health-map"
import { DataSelector } from "./data-selector"
import { PestRiskAlert } from "./pest-risk-alert"
import { SoilMoistureMonitor } from "./soil-moisture-monitor"
import { YieldForecast } from "./yield-forecast"
import { FertilizerRecommender } from "./fertilizer-recommender"
import { Card } from "@/components/ui/card"
import { Info } from "lucide-react"

export function UpdatedDashboard() {
  const [selectedCountry, setSelectedCountry] = useState("IN")
  const [selectedCrop, setSelectedCrop] = useState("wheat")

  // Sample data for the new features (in production, these would come from API)
  const weatherData = {
    temperature: 24 + Math.sin(selectedCrop.charCodeAt(0)) * 5,
    humidity: 65 + Math.random() * 20,
    rainfall: 15 + Math.random() * 20,
  }

  const soilMoisture = 60 + Math.sin(selectedCrop.charCodeAt(0)) * 15

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Agricultural Intelligence Platform</h1>
        <p className="text-muted-foreground">
          Real-time farm optimization with crop health monitoring, pest alerts, yield forecasts, and fertilizer
          recommendations
        </p>
      </div>

      {/* Alert Banner */}
      <Card className="p-4 bg-blue-950 border-blue-700">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-100">
            Select your crop and region to get personalized recommendations for pest management, irrigation, fertilizer
            application, and yield optimization.
          </p>
        </div>
      </Card>

      {/* Data Selector */}
      <DataSelector
        selectedCountry={selectedCountry}
        selectedCrop={selectedCrop}
        onCountryChange={setSelectedCountry}
        onCropChange={setSelectedCrop}
      />

      {/* Main Fusion Score */}
      <AdvancedFusionCard country={selectedCountry} crop={selectedCrop} />

      {/* Farmer-Focused Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PestRiskAlert
          country={selectedCountry}
          crop={selectedCrop}
          temperature={weatherData.temperature}
          humidity={weatherData.humidity}
          rainfall={weatherData.rainfall}
        />
        <SoilMoistureMonitor
          rainfall={weatherData.rainfall}
          temperature={weatherData.temperature}
          crop={selectedCrop}
        />
      </div>

      {/* Yield & Fertilizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YieldForecast
          country={selectedCountry}
          crop={selectedCrop}
          cropHealth={78}
          weatherScore={68}
          soilMoisture={soilMoisture}
        />
        <FertilizerRecommender crop={selectedCrop} cropHealth={78} soilMoisture={soilMoisture} growthStage="mid" />
      </div>

      {/* Existing Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Crop Health Map (NDVI)</h2>
          <CropHealthMap country={selectedCountry} crop={selectedCrop} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">30-Day Weather Forecast</h2>
          <EnhancedWeatherChart country={selectedCountry} />
        </Card>
      </div>

      {/* Price and News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Commodity Price Forecast</h2>
          <EnhancedPriceChart commodity={selectedCrop} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">News Risk Assessment</h2>
          <AdvancedNewsDisplay country={selectedCountry} />
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-8 border-t">
        <p>Agricultural Intelligence Platform • Data-driven farm optimization</p>
        <p className="mt-1">Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}
