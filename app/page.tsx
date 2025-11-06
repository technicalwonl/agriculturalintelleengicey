"use client"

import { useEffect, useState, useCallback } from "react"
import { UpdatedDashboard } from "@/components/updated-dashboard"
import { Spinner } from "@/components/ui/spinner"
import { GPSMonitor } from "@/components/gps-monitor"
import { LanguageSwitcher } from "@/components/language-switcher"
import { AlertNotificationHub } from "@/components/alert-notification-hub"
import { BuyerDirectNetwork } from "@/components/buyer-direct-network"
import { CropInsuranceRecommendations } from "@/components/crop-insurance-recommendations"
import { DroneImageAnalyzer } from "@/components/drone-image-analyzer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/language-context"
import { AIChatbot } from "@/components/ai-chatbot"
import { SmartRecommendations } from "@/components/smart-recommendations"
import { PredictiveAnalytics } from "@/components/predictive-analytics"
import type { FarmLocation, RegionData } from "@/lib/gps-service"

export default function Home() {
  const { translate } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [selectedCrop, setSelectedCrop] = useState("wheat")
  const [currentLocation, setCurrentLocation] = useState<FarmLocation | null>(null)
  const [currentRegion, setCurrentRegion] = useState<RegionData | null>(null)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500)
  }, [])

  const handleLocationUpdate = useCallback((location: FarmLocation, region: RegionData) => {
    setCurrentLocation(location)
    setCurrentRegion(region)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-12" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="p-4 max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">{translate("header")}</h1>
          <LanguageSwitcher />
        </div>
      </div>

      {/* GPS Location Monitor - Real-time location tracking */}
      <div className="max-w-7xl mx-auto p-6">
        <GPSMonitor onLocationUpdate={handleLocationUpdate} />
      </div>

      {/* Main Dashboard with Tabs */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="alerts">{translate("alerts")}</TabsTrigger>
            <TabsTrigger value="ai">{translate("ai_assistant") || "AI Assistant"}</TabsTrigger>
            <TabsTrigger value="buyers">{translate("direct_buyers")}</TabsTrigger>
            <TabsTrigger value="insurance">{translate("crop_insurance")}</TabsTrigger>
            <TabsTrigger value="drone">{translate("drone_analysis")}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <UpdatedDashboard />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertNotificationHub />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="grid gap-6">
              <AIChatbot />
              <SmartRecommendations
                location={currentRegion?.state || "Maharashtra"}
                weather="Sunny, 32°C"
                soilType="Black soil"
              />
              <PredictiveAnalytics
                cropType={selectedCrop}
                currentHealth={72}
                weatherForecast="Clear skies, moderate rainfall expected"
              />
            </div>
          </TabsContent>

          <TabsContent value="buyers">
            <BuyerDirectNetwork selectedCrop={selectedCrop} selectedRegion={currentRegion?.region || "IN"} />
          </TabsContent>

          <TabsContent value="insurance">
            <CropInsuranceRecommendations selectedCrop={selectedCrop} selectedRegion={currentRegion?.region || "IN"} />
          </TabsContent>

          <TabsContent value="drone">
            <DroneImageAnalyzer />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
