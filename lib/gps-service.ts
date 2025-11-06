"use client"

export interface FarmLocation {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface RegionData {
  region: string
  avgTemp: number
  rainfall: number
  soilType: string
  cropZone: string
  pestRisk: string
}

export const REGION_DATABASE: Record<string, RegionData> = {
  punjab: {
    region: "Punjab",
    avgTemp: 28,
    rainfall: 60,
    soilType: "Loamy",
    cropZone: "Rice-Wheat",
    pestRisk: "Armyworm",
  },
  maharashtra: {
    region: "Telangana",
    avgTemp: 32,
    rainfall: 80,
    soilType: "Black Soil",
    cropZone: "Cotton-Sugarcane",
    pestRisk: "Pink Bollworm",
  },
  karnataka: {
    region: "Karnataka",
    avgTemp: 30,
    rainfall: 70,
    soilType: "Red Soil",
    cropZone: "Coffee-Sugarcane",
    pestRisk: "Scale Insects",
  },
  "tamil-nadu": {
    region: "Tamil Nadu",
    avgTemp: 34,
    rainfall: 50,
    soilType: "Laterite",
    cropZone: "Sugarcane-Rice",
    pestRisk: "Stem Borer",
  },
  "uttar-pradesh": {
    region: "Uttar Pradesh",
    avgTemp: 26,
    rainfall: 85,
    soilType: "Alluvial",
    cropZone: "Wheat-Rice",
    pestRisk: "Fall Armyworm",
  },
  "madhya-pradesh": {
    region: "Madhya Pradesh",
    avgTemp: 29,
    rainfall: 100,
    soilType: "Black Soil",
    cropZone: "Soybean-Chickpea",
    pestRisk: "Pod Borer",
  },
}

export class GPSService {
  private watchId: number | null = null

  async getLocationFromGPS(): Promise<FarmLocation> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser')
    }

    // First try with high accuracy
    try {
      return await new Promise<FarmLocation>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            })
          },
          (error) => {
            // If high accuracy fails, try with lower accuracy
            if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                  })
                },
                (fallbackError) => {
                  reject(new Error(this.getGeolocationError(fallbackError)))
                },
                { enableHighAccuracy: false, maximumAge: 0, timeout: 10000 }
              )
            } else {
              reject(new Error(this.getGeolocationError(error)))
            }
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        )
      })
    } catch (error) {
      console.error('GPS Error:', error)
      throw error
    }
  }

  getGeolocationError(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'User denied the request for Geolocation.'
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable.'
      case error.TIMEOUT:
        return 'The request to get user location timed out.'
      case error.UNKNOWN_ERROR:
        return 'An unknown error occurred.'
      default:
        return 'An unknown error occurred.'
    }
  }

  async getRegionFromCoordinates(lat: number, lon: number): Promise<RegionData> {
    try {
      // First try to get precise location using Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      
      const data = await response.json()
      
      if (data.status === 'OK' && data.results[0]) {
        const address = data.results[0].address_components
        
        // Try to find state-level information
        const state = address.find((comp: any) => 
          comp.types.includes('administrative_area_level_1')
        )
        
        if (state) {
          // Find a matching region in our database
          const region = Object.values(REGION_DATABASE).find(
            r => r.region.toLowerCase() === state.long_name.toLowerCase()
          )
          
          if (region) return region
          
          // If no exact match, find by partial name
          const partialMatch = Object.values(REGION_DATABASE).find(
            r => state.long_name.toLowerCase().includes(r.region.toLowerCase()) ||
                 r.region.toLowerCase().includes(state.long_name.toLowerCase())
          )
          
          if (partialMatch) return partialMatch
        }
      }
    } catch (error) {
      console.error('Geocoding API error:', error)
    }
    
    // Fallback to coordinate-based detection if geocoding fails
    if (lon > 74 && lon < 76 && lat > 30 && lat < 32) return REGION_DATABASE["punjab"]
    if (lon > 72 && lon < 78 && lat > 16 && lat < 20) return REGION_DATABASE["maharashtra"]
    if (lon > 73 && lon < 78 && lat > 12 && lat < 18) return REGION_DATABASE["karnataka"]
    if (lon > 78 && lon < 80 && lat > 11 && lat < 14) return REGION_DATABASE["tamil-nadu"]
    if (lon > 77 && lon < 82 && lat > 24 && lat < 29) return REGION_DATABASE["uttar-pradesh"]
    
    // Default fallback
    return REGION_DATABASE["maharashtra"]
  }

  watchLocation(callback: (location: FarmLocation) => void): void {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          })
        },
        (error) => console.error("GPS error:", error),
        { enableHighAccuracy: true, maximumAge: 5000 },
      )
    }
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
    }
  }
}
