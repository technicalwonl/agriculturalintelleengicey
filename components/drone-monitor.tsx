"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Upload } from "lucide-react"

interface DroneAnalysis {
  health_status: string
  diseases_detected: any[]
  weed_analysis: any
  irrigation_analysis: any
  ndvi: any
}

const mockAnalysis: DroneAnalysis = {
  health_status: "healthy",
  ndvi: {
    value: 0.62,
    health_status: "healthy",
    color_zones: { red_zone: 15, yellow_zone: 25, green_zone: 60 },
  },
  diseases_detected: [{ disease: "Leaf Rust", confidence: 0.78, affected_area_percent: 5, severity: "low" }],
  weed_analysis: {
    total_weeds_detected: 1200,
    weeds_per_sqm: 4.8,
    treatment_needed: true,
  },
  irrigation_analysis: {
    soil_moisture_estimate: 65,
    irrigation_needed_days: 7,
  },
}

export function DroneMonitor() {
  const [uploading, setUploading] = useState(false)
  const [analysisData, setAnalysisData] = useState<DroneAnalysis | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    // Simulate upload
    setTimeout(() => {
      setAnalysisData(mockAnalysis)
      setUploading(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6 border-dashed">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Upload className="w-12 h-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="font-semibold mb-1">Upload Drone Images</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Captured from your field - AI will analyze crop health automatically
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
              id="drone-upload"
            />
            <Button onClick={() => document.getElementById("drone-upload")?.click()} disabled={uploading}>
              {uploading ? "Analyzing..." : "Upload Image"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-4">
          {/* Health Overview */}
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Overall Crop Health: {analysisData.ndvi.health_status.toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  NDVI Score: {analysisData.ndvi.value} - {analysisData.ndvi.color_zones.green_zone}% healthy area
                </p>
              </div>
              <Badge className="bg-green-600">Good</Badge>
            </div>
          </Card>

          {/* Disease Detection */}
          {analysisData.diseases_detected.length > 0 && (
            <Card className="p-4 border-orange-200">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Diseases Detected
              </h4>
              <div className="space-y-2">
                {analysisData.diseases_detected.map((disease, i) => (
                  <div key={i} className="bg-orange-50 p-3 rounded-md">
                    <p className="font-medium">{disease.disease}</p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {(disease.confidence * 100).toFixed(1)}% • Affected: {disease.affected_area_percent}%
                    </p>
                    <p className="text-sm text-orange-700 mt-1">✓ {disease.treatment}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Weed Analysis */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Weed Detection Analysis</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Total Weeds</p>
                <p className="text-2xl font-bold">{analysisData.weed_analysis.total_weeds_detected}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Density</p>
                <p className="text-2xl font-bold">{analysisData.weed_analysis.weeds_per_sqm.toFixed(1)}/m²</p>
              </div>
            </div>
            {analysisData.weed_analysis.treatment_needed && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Action:</strong> Spray herbicide recommended
                </p>
              </div>
            )}
          </Card>

          {/* Irrigation Advice */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold mb-2">Irrigation Recommendation</h4>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Soil Moisture</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${analysisData.irrigation_analysis.soil_moisture_estimate}%` }}
                  />
                </div>
                <p className="text-sm mt-1">{analysisData.irrigation_analysis.soil_moisture_estimate}%</p>
              </div>
              <p className="text-sm font-medium text-blue-900">
                Water in {analysisData.irrigation_analysis.irrigation_needed_days} days
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
