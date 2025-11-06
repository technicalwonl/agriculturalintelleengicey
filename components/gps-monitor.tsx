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
    { id: "telangana", name: "Telangana" },
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
      <div className="space-y-4">
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 text-red-700 rounded-md flex items-start space-x-2 text-sm sm:text-base">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="break-words">{error}</div>
          </div>
        )}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFallback(!showFallback)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            {showFallback ? translate('useGPS') || 'Use GPS Location' : translate('selectRegion') || 'Select Region Manually'}
          </Button>
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
    <Card className="p-4 sm:p-6 space-y-4 w-full">
      <div className="flex items-center space-x-2">
        <MapPin className="h-5 w-5 text-green-600 flex-shrink-0" />
        <h3 className="text-lg font-semibold truncate">{translate('gpsTitle') || 'Farm Location'}</h3>
      </div>
      {location && region && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1 p-3 bg-gray-50 rounded-md">
            <p className="text-xs sm:text-sm text-gray-500">{translate('latitude') || 'Latitude'}</p>
            <p className="font-mono text-sm sm:text-base break-all">
              {location?.latitude?.toFixed(6) || '-'}
            </p>
          </div>
          <div className="space-y-1 p-3 bg-gray-50 rounded-md">
            <p className="text-xs sm:text-sm text-gray-500">{translate('longitude') || 'Longitude'}</p>
            <p className="font-mono text-sm sm:text-base break-all">
              {location?.longitude?.toFixed(6) || '-'}
            </p>
          </div>
          <div className="space-y-1 p-3 bg-gray-50 rounded-md">
            <p className="text-xs sm:text-sm text-gray-500">{translate('accuracy') || 'Accuracy'}</p>
            <p className="font-mono text-sm sm:text-base">
              {location?.accuracy ? `${location.accuracy.toFixed(2)}m` : '-'}
            </p>
          </div>
          <div className="space-y-1 p-3 bg-gray-50 rounded-md">
            <p className="text-xs sm:text-sm text-gray-500">{translate('region') || 'Region'}</p>
            <p className="text-sm sm:text-base">{region?.name || '-'}</p>
          </div>
        </div>
      )}
    </Card>
  )
}
