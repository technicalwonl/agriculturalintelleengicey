"use client"

import { AlertDashboard } from "@/components/alert-dashboard"
import { OfflineIndicator } from "@/components/offline-indicator"
import { LanguageSelector } from "@/components/language-selector"
import { Card } from "@/components/ui/card"

export default function AlertsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Alert Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Real-time notifications for crop health, weather, pests, prices, and farm recommendations
            </p>
          </div>
          <LanguageSelector />
        </div>

        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Alert Dashboard */}
        <AlertDashboard />

        {/* Tips */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for Farmers</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✓ Check alerts daily during critical growing seasons (monsoon, harvest)</li>
            <li>✓ Enable SMS for remote farms without regular internet access</li>
            <li>✓ Act quickly on pest and disease alerts for best results</li>
            <li>✓ Use price alerts to time your harvest and sales for maximum profit</li>
            <li>✓ Combine weather alerts with irrigation scheduling for optimal water use</li>
          </ul>
        </Card>
      </div>
    </main>
  )
}
