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

const REGION_DATABASE: Record<string, RegionData> = {
  punjab: {
    region: "Punjab",
    avgTemp: 28,
    rainfall: 60,
    soilType: "Loamy",
    cropZone: "Rice-Wheat",
    pestRisk: "Armyworm",
  },
  maharashtra: {
    region: "Maharashtra",
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

  getLocationFromGPS(): Promise<FarmLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("GPS not supported"))
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          })
        },
        (error) => reject(error),
      )
    })
  }

  getRegionFromCoordinates(lat: number, lon: number): RegionData {
    // Simplified mapping based on latitude/longitude ranges for Indian states
    if (lon > 74 && lon < 76 && lat > 30 && lat < 32) return REGION_DATABASE["punjab"]
    if (lon > 72 && lon < 78 && lat > 16 && lat < 20) return REGION_DATABASE["maharashtra"]
    if (lon > 73 && lon < 78 && lat > 12 && lat < 18) return REGION_DATABASE["karnataka"]
    if (lon > 78 && lon < 80 && lat > 11 && lat < 14) return REGION_DATABASE["tamil-nadu"]
    if (lon > 77 && lon < 82 && lat > 24 && lat < 29) return REGION_DATABASE["uttar-pradesh"]
    return REGION_DATABASE["maharashtra"] // Default fallback
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
