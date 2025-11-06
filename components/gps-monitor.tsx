"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, AlertCircle } from "lucide-react"
import { GPSService, type FarmLocation, type RegionData } from "@/lib/gps-service"
import { useLanguage } from "@/lib/language-context"

interface GPSMonitorProps {
  onLocationUpdate?: (location: FarmLocation, region: RegionData) => void
}

export function GPSMonitor({ onLocationUpdate }: GPSMonitorProps) {
  const { translate } = useLanguage()
  const [location, setLocation] = useState<FarmLocation | null>(null)
  const [region, setRegion] = useState<RegionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)
  const lastLocationRef = useRef<string>("")

  const fallbackRegions = [
    { id: "punjab", name: "Punjab" },
    { id: "maharashtra", name: "Maharashtra" },
    { id: "karnataka", name: "Karnataka" },
    { id: "tamil-nadu", name: "Tamil Nadu" },
    { id: "uttar-pradesh", name: "Uttar Pradesh" },
    { id: "madhya-pradesh", name: "Madhya Pradesh" },
  ]

  useEffect(() => {
    const gpsService = new GPSService()
    let unwatch: (() => void) | null = null

    const handleLocationChange = (loc: FarmLocation) => {
      const locKey = `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`
      if (lastLocationRef.current !== locKey) {
        lastLocationRef.current = locKey
        const regionData = gpsService.getRegionFromCoordinates(loc.latitude, loc.longitude)
        setLocation(loc)
        setRegion(regionData)
        onLocationUpdate?.(loc, regionData)
      }
    }

    gpsService
      .getLocationFromGPS()
      .then((loc) => {
        handleLocationChange(loc)
        setLoading(false)
      })
      .catch(() => {
        setError("GPS access denied or unavailable")
        setShowFallback(true)
        setLoading(false)
      })

    unwatch = gpsService.watchLocation(handleLocationChange)

    return () => {
      if (unwatch) unwatch()
      gpsService.stopWatching()
    }
  }, [onLocationUpdate])

  const handleSelectRegion = (regionId: string) => {
    const gpsService = new GPSService()
    const regionData = gpsService.selectRegionByName(regionId)
    const coords = gpsService.getDefaultCoordinates(regionId)
    const newLoc: FarmLocation = {
      latitude: coords.lat,
      longitude: coords.lon,
      accuracy: 5000,
      timestamp: Date.now(),
    }
    lastLocationRef.current = `${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}`
    setLocation(newLoc)
    setRegion(regionData)
    setError(null)
    setShowFallback(false)
    onLocationUpdate?.(newLoc, regionData)
  }

  if (loading) return <div className="text-sm text-muted-foreground">{translate("gps_location")}...</div>

  if (error && showFallback)
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {fallbackRegions.map((r) => (
            <Button
              key={r.id}
              variant="outline"
              size="sm"
              onClick={() => handleSelectRegion(r.id)}
              className="justify-center"
            >
              {r.name}
            </Button>
          ))}
        </div>
      </div>
    )

  return (
    <Card className="p-4 bg-green-950 border-green-700">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-400" />
          <span className="font-semibold text-green-100">{translate("gps_location")}</span>
        </div>
        {location && region && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-green-300">{translate("region") || "Region"}</p>
              <p className="text-green-100 font-medium">{region.region}</p>
            </div>
            <div>
              <p className="text-green-300">Coordinates</p>
              <p className="text-green-100 font-medium">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-green-300">{translate("soil_moisture") || "Soil Type"}</p>
              <p className="text-green-100 font-medium">{region.soilType}</p>
            </div>
            <div>
              <p className="text-green-300">Avg Temp</p>
              <p className="text-green-100 font-medium">{region.avgTemp}°C</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
