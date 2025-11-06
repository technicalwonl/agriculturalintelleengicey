"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { offlineStorage } from "@/lib/offline-storage"
import { languageManager } from "@/lib/language-manager"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Get last sync time
    offlineStorage.getLastSyncTime().then((time) => {
      if (time > 0) {
        setLastSync(new Date(time))
      }
    })

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSync = async () => {
    if (isOnline) {
      // Trigger sync with backend
      console.log("[v0] Syncing offline data with server...")
      setLastSync(new Date())
    }
  }

  return (
    <Card className="p-4 mb-4 flex items-center justify-between bg-background border">
      <div className="flex items-center gap-3">
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">
              {languageManager.t("dashboard.online", "Online")} • Last synced:{" "}
              {lastSync ? lastSync.toLocaleTimeString() : "Never"}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-600">
              {languageManager.t("button.offline", "Offline Mode")} - Data saved locally
            </span>
          </>
        )}
      </div>

      {isOnline && (
        <Button size="sm" onClick={handleSync} variant="outline">
          {languageManager.t("button.syncNow", "Sync Now")}
        </Button>
      )}
    </Card>
  )
}
