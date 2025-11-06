"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, RefreshCw, Globe, Compass } from "lucide-react"
import { GPSService, REGION_DATABASE } from "@/lib/gps-service"
import { FarmLocation, RegionData } from "@/lib/types"
import { useLanguage } from "@/lib/language-context"
import { Progress } from "@/components/ui/progress"

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
  
  // Generate Google Maps URL for direct link
  const getMapUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const gpsService = new GPSService()
      const location = await gpsService.getLocationFromGPS()
      const regionData = await gpsService.getRegionFromCoordinates(location.latitude, location.longitude)
      
      // Update location and region
      setLocation(location)
      setRegion(regionData)
      onLocationUpdate?.(location, regionData)
      
      // Store the last successful location
      lastLocationRef.current = `${location.latitude},${location.longitude}`
      
    } catch (err) {
      console.error('Error getting location:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location'
      setError(errorMessage)
      
      // If we have a previous location, keep showing it
      if (!lastLocationRef.current) {
        setShowFallback(true)
      }
    } finally {
      setLoading(false)
    }
  }, [onLocationUpdate])

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
    
    const handleLocationChange = async (loc: FarmLocation) => {
      const locKey = `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`
      if (lastLocationRef.current !== locKey) {
        lastLocationRef.current = locKey
        try {
          const regionData = await gpsService.getRegionFromCoordinates(loc.latitude, loc.longitude)
          setLocation(loc)
          setRegion(regionData)
          onLocationUpdate?.(loc, regionData)
        } catch (err) {
          console.error('Error getting region data:', err)
        }
      }
    }

    const init = async () => {
      try {
        const loc = await gpsService.getLocationFromGPS()
        await handleLocationChange(loc)
        setLoading(false)
      } catch (err) {
        console.error('Error getting initial location:', err)
        setError(err instanceof Error ? err.message : 'Failed to get location')
        setShowFallback(true)
        setLoading(false)
      }
    }

    init()

    // Start watching for location changes
    gpsService.watchLocation(handleLocationChange)

    // Cleanup function
    return () => {
      gpsService.stopWatching()
    }
  }, [onLocationUpdate])

  const handleSelectRegion = (regionId: string) => {
    const regionData = REGION_DATABASE[regionId as keyof typeof REGION_DATABASE]
    if (!regionData) return
    
    // Use default coordinates for India center
    const newLoc: FarmLocation = {
      latitude: 20.5937, // Default latitude for India center
      longitude: 78.9629, // Default longitude for India center
      accuracy: 5000,
      timestamp: Date.now(),
    }
    lastLocationRef.current = `${newLoc.latitude.toFixed(2)},${newLoc.longitude.toFixed(2)}`
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
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-start space-x-2 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="break-words">
              <p className="font-medium">
                {translate('locationError') || 'Location Error'}
              </p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 h-8 px-3 text-xs"
                onClick={handleRefresh}
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                {translate('tryAgain') || 'Try Again'}
              </Button>
            </div>
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
    <Card className="p-4 sm:p-6 space-y-4 w-full shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {translate('gpsTitle') || 'Farm Location'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {region?.region || 'Location not detected'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {translate('refreshing') || 'Refreshing...'}
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {translate('refresh') || 'Refresh'}
              </>
            )}
          </Button>
          {location && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a 
                href={getMapUrl(location.latitude, location.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <MapPin className="mr-2 h-4 w-4" />
                {translate('directions') || 'Directions'}
              </a>
            </Button>
          )}
        </div>
      </div>
      {location && region ? (
        <div className="space-y-4">
          {/* Location Display */}
          <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                {translate('currentLocation') || 'Current Location'}
              </h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  {translate('detectingLocation') || 'Detecting your location...'}
                </span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
                {showFallback && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {translate('selectRegionManually') || 'Please select your region manually:'}
                    </p>
                    <select 
                      aria-label="Select your region"
                      className="w-full p-2 border rounded-md text-sm"
                      onChange={(e) => {
                        const selectedRegion = fallbackRegions.find(r => r.id === e.target.value)
                        if (selectedRegion) {
                          const regionData = REGION_DATABASE[selectedRegion.id as keyof typeof REGION_DATABASE]
                          if (regionData) {
                            setRegion(regionData)
                            if (location) {
                              onLocationUpdate?.(location, regionData)
                            }
                          }
                        }
                      }}
                    >
                      <option value="">{translate('selectRegion') || 'Select region'}</option>
                      {fallbackRegions.map(region => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      {translate('coordinates') || 'Coordinates'}:
                    </span>
                    <span className="text-sm font-mono">
                      {location?.latitude?.toFixed(6)}, {location?.longitude?.toFixed(6)}
                    </span>
                  </div>
                  
                  {location?.accuracy && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        {translate('accuracy') || 'Accuracy'}:
                      </span>
                      <span className="text-sm">
                        ±{Math.round(location.accuracy)}m
                      </span>
                    </div>
                  )}
                  
                  {region && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        {translate('region') || 'Region'}:
                      </span>
                      <span className="text-sm font-medium">
                        {region.region}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <a
                    href={location ? getMapUrl(location.latitude, location.longitude) : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    {translate('viewOnMap') || 'View on Google Maps'}
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">{translate('latitude') || 'Latitude'}</p>
              <p className="font-mono text-sm break-all font-medium">
                {location.latitude?.toFixed(6) || '-'}
              </p>
            </div>
            <div className="space-y-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">{translate('longitude') || 'Longitude'}</p>
              <p className="font-mono text-sm break-all font-medium">
                {location.longitude?.toFixed(6) || '-'}
              </p>
            </div>
          </div>

          {/* Accuracy Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {translate('accuracy') || 'Accuracy'}
              </span>
              <span className="text-sm font-mono">
                {location.accuracy ? `${location.accuracy.toFixed(1)}m` : 'N/A'}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div 
                className="h-full bg-green-500 transition-all duration-300 ease-in-out"
                style={{
                  width: `${Math.max(0, 100 - Math.min(100, location.accuracy || 0))}%`
                }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {location.accuracy && location.accuracy < 10 
                ? 'High accuracy' 
                : location.accuracy < 50 
                  ? 'Moderate accuracy' 
                  : 'Low accuracy'}
            </p>
          </div>

          {/* Region Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">Region</p>
              <p className="font-medium text-blue-900 dark:text-blue-200">{region.region}</p>
            </div>
            <div className="space-y-1 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-xs text-amber-600 dark:text-amber-400">Crop Zone</p>
              <p className="font-medium text-amber-900 dark:text-amber-200">{region.cropZone}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <Compass className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {translate('locationNotAvailable') || 'Location not available'}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {translate('enableLocationAccess') || 'Please enable location access to view your farm details.'}
          </p>
          <Button 
            onClick={handleRefresh}
            disabled={loading}
            className="mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {translate('locating') || 'Locating...'}
              </>
            ) : (
              <>
                <Compass className="mr-2 h-4 w-4" />
                {translate('enableLocation') || 'Enable Location'}
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  )
}
