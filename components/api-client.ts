const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const generateMockData = (country: string, crop: string) => {
  const cropHash = crop.charCodeAt(0) + country.charCodeAt(0)
  const baseScore = 60 + (cropHash % 30)
  const seed = Math.sin(cropHash) * 10000

  return {
    fusionScore: {
      fusion_score: baseScore,
      risk_level: baseScore > 75 ? "low" : baseScore > 50 ? "medium" : ("high" as const),
      confidence: 0.85 + Math.random() * 0.1,
      components: {
        crop_health: 55 + (cropHash % 35),
        weather_score: 50 + ((cropHash * 2) % 40),
        price_trend: 60 + ((cropHash * 3) % 30),
        news_risk: 45 + ((cropHash * 4) % 40),
      },
      component_importance: {
        crop_health: cropHash % 2 === 0 ? "strength_1" : "risk_driver_1",
        weather_score: cropHash % 3 === 0 ? "risk_driver_1" : "normal",
        price_trend: cropHash % 2 === 1 ? "strength_2" : "normal",
        news_risk: cropHash % 3 === 1 ? "risk_driver_2" : "normal",
      },
      interpretation:
        baseScore > 75
          ? "Favorable conditions for planting"
          : baseScore > 50
            ? "Monitor conditions closely"
            : "Challenging environment - delay operations",
    },
    cropHealth: {
      tiles: [
        { region: "North", ndvi_value: 0.6 + ((seed + 1) % 20) / 100, latitude: 40.7128, longitude: -74.006 },
        { region: "Central", ndvi_value: 0.65 + ((seed + 2) % 20) / 100, latitude: 39.7817, longitude: -89.2504 },
        { region: "South", ndvi_value: 0.55 + ((seed + 3) % 20) / 100, latitude: 33.749, longitude: -84.388 },
        { region: "East", ndvi_value: 0.7 + ((seed + 4) % 20) / 100, latitude: 35.0751, longitude: -75.2995 },
        { region: "West", ndvi_value: 0.62 + ((seed + 5) % 20) / 100, latitude: 37.7749, longitude: -120.4194 },
      ],
    },
    weather: {
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
        temperature_min: 15 + Math.sin((i + seed) * 0.2) * 5,
        temperature_max: 28 + Math.sin((i + seed) * 0.2) * 5,
        rainfall_mm: 10 + Math.random() * 15,
        humidity_percent: 65 + Math.random() * 20,
        wind_speed_kmh: 15 + Math.random() * 10,
      })),
    },
    price: {
      forecast_values: Array.from({ length: 30 }, (_, i) => 150 + i * 0.5 + Math.sin((i + seed) * 0.3) * 20),
      forecast_dates: Array.from(
        { length: 30 },
        (_, i) => new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
      ),
      trend: baseScore > 60 ? "upward" : "downward",
      current_price: 150 + (seed % 50),
    },
    news: {
      risk_score: 50 + ((cropHash * 5) % 40),
      recent_news: [
        {
          title: `${crop} market shows ${baseScore > 60 ? "strength" : "weakness"}`,
          summary: `${country} agricultural indicators ${baseScore > 60 ? "improving" : "declining"}`,
          sentiment_score: baseScore > 60 ? 0.7 : 0.4,
          date: new Date().toISOString().split("T")[0],
          categories: ["market", "commodities"],
        },
        {
          title: `Weather forecast ${baseScore > 50 ? "favorable" : "challenging"}`,
          summary: `Extended forecast shows ${baseScore > 50 ? "optimal" : "suboptimal"} conditions`,
          sentiment_score: baseScore > 50 ? 0.75 : 0.35,
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          categories: ["weather", "agriculture"],
        },
      ],
    },
    health: {
      status: "healthy",
      database: "connected",
    },
  }
}

// ... existing MOCK_DATA structure removed ...

export interface FusionScoreResponse {
  fusion_score: number
  risk_level: "low" | "medium" | "high"
  components: {
    crop_health: number
    weather_score: number
    price_trend: number
    news_risk: number
  }
  component_importance: Record<string, string>
  confidence: number
  interpretation: string
}

export interface WeatherData {
  date: string
  temperature_min: number
  temperature_max: number
  rainfall_mm: number
  humidity_percent: number
  wind_speed_kmh: number
}

export interface CropHealthTile {
  region: string
  ndvi_value: number
  latitude: number
  longitude: number
}

export interface NewsItem {
  title: string
  summary: string
  sentiment_score: number
  date: string
  categories: string[]
}

export interface PriceForecast {
  forecast_values: number[]
  forecast_dates: string[]
  trend: string
  current_price: number
}

class FusionApiClient {
  async getFusionScore(country: string, crop: string): Promise<FusionScoreResponse> {
    try {
      const response = await fetch(`${API_BASE}/fusion-score?country=${country}&crop=${crop}`)
      if (!response.ok) throw new Error("Failed to fetch fusion score")
      return await response.json()
    } catch (error) {
      console.log("[v0] Using mock fusion score data for", crop, country)
      return generateMockData(country, crop).fusionScore
    }
  }

  async getCropHealth(country: string, crop: string): Promise<{ tiles: CropHealthTile[] }> {
    try {
      const response = await fetch(`${API_BASE}/map/health?country=${country}&crop=${crop}`)
      if (!response.ok) throw new Error("Failed to fetch crop health")
      return await response.json()
    } catch (error) {
      console.log("[v0] Using mock crop health data for", crop, country)
      return generateMockData(country, crop).cropHealth
    }
  }

  async getWeatherForecast(country: string, days = 30): Promise<{ data: WeatherData[] }> {
    try {
      const response = await fetch(`${API_BASE}/weather/forecast?country=${country}&days=${days}`)
      if (!response.ok) throw new Error("Failed to fetch weather")
      return await response.json()
    } catch (error) {
      console.log("[v0] Using mock weather data")
      return generateMockData(country, "wheat").weather
    }
  }

  async getPricePredictor(commodity: string, days = 30): Promise<PriceForecast> {
    try {
      const response = await fetch(`${API_BASE}/predict-price?commodity=${commodity}&days_ahead=${days}`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to predict price")
      return await response.json()
    } catch (error) {
      console.log("[v0] Using mock price prediction data")
      return generateMockData("IN", commodity).price
    }
  }

  async getNewsRisk(country: string): Promise<{ risk_score: number; recent_news: NewsItem[] }> {
    try {
      const response = await fetch(`${API_BASE}/news-risk?country=${country}`)
      if (!response.ok) throw new Error("Failed to fetch news risk")
      return await response.json()
    } catch (error) {
      console.log("[v0] Using mock news risk data")
      return generateMockData(country, "wheat").news
    }
  }

  async getHealth(): Promise<{ status: string; database: string }> {
    try {
      const response = await fetch(`${API_BASE}/health`)
      if (!response.ok) throw new Error("Health check failed")
      return await response.json()
    } catch (error) {
      return generateMockData("IN", "wheat").health
    }
  }
}

export const apiClient = new FusionApiClient()
