"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Upload, Loader } from "lucide-react"
import { ImageAnalyzer, type ImageAnalysisResult } from "@/lib/image-analyzer"
import { useLanguage } from "@/lib/language-context"

export function DroneImageAnalyzer() {
  const { translate } = useLanguage()
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    setPreview(URL.createObjectURL(file))

    const result = await ImageAnalyzer.analyzeImage(file)
    setAnalysis(result)
    setUploading(false)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{translate("drone_analysis")}</h3>

      <Card className="p-6 border-2 border-dashed">
        <label className="cursor-pointer">
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium">Upload Drone Image</p>
            <p className="text-sm text-muted-foreground">AI-powered analysis in seconds</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            className="hidden"
          />
        </label>
      </Card>

      {preview && (
        <div className="space-y-3">
          <img src={preview || "/placeholder.svg"} alt="Farm image" className="w-full h-40 object-cover rounded" />
          {uploading && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <Loader className="w-4 h-4 animate-spin" />
              Analyzing image...
            </div>
          )}
        </div>
      )}

      {analysis && (
        <div className="grid gap-3">
          <Card className="p-4 bg-green-50 border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Analysis Results</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-green-700">NDVI Score</p>
                <p className="font-bold text-lg">{(analysis.ndvi * 100).toFixed(1)}</p>
              </div>
              <div>
                <p className="text-green-700">Health Status</p>
                <p className="font-bold">{analysis.healthStatus}</p>
              </div>
              <div>
                <p className="text-green-700">Weed Coverage</p>
                <p className="font-bold">{analysis.weedCoverage}%</p>
              </div>
              <div>
                <p className="text-green-700">Irrigation</p>
                <p className="font-bold">{analysis.irrigationNeeded ? "Needed" : "OK"}</p>
              </div>
            </div>
          </Card>

          {analysis.diseases.length > 0 && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">Detected Issues</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                {analysis.diseases.map((disease) => (
                  <li key={disease}>• {disease}</li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">{translate("recommend")}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {analysis.recommendations.map((rec, i) => (
                <li key={i}>• {rec}</li>
              ))}
            </ul>
          </Card>

          <p className="text-xs text-muted-foreground text-center">Analysis time: {analysis.processingTime}ms</p>
        </div>
      )}
    </div>
  )
}
