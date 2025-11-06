// Offline storage service for farmers without internet connectivity
import { openDB, type DBSchema, type IDBPDatabase } from "idb"

interface FarmData extends DBSchema {
  crops: {
    key: string
    value: {
      id: string
      name: string
      region: string
      healthScore: number
      lastSynced: number
    }
  }
  alerts: {
    key: string
    value: {
      id: string
      timestamp: number
      type: string
      message: string
      crop: string
      read: boolean
    }
  }
  weather: {
    key: string
    value: {
      date: string
      temp: number
      humidity: number
      rainfall: number
    }
  }
  prices: {
    key: string
    value: {
      crop: string
      date: string
      price: number
      region: string
    }
  }
  farmImages: {
    key: string
    value: {
      id: string
      cropId: string
      imageData: string
      timestamp: number
      source: string
    }
  }
}

export class OfflineStorage {
  private db: IDBPDatabase<FarmData> | null = null

  async init(): Promise<void> {
    this.db = await openDB<FarmData>("AgriculturalPlatform", 1, {
      upgrade(db) {
        // Create object stores for each data type
        if (!db.objectStoreNames.contains("crops")) {
          const cropsStore = db.createObjectStore("crops", { keyPath: "id" })
          cropsStore.createIndex("region", "region")
        }

        if (!db.objectStoreNames.contains("alerts")) {
          const alertsStore = db.createObjectStore("alerts", { keyPath: "id" })
          alertsStore.createIndex("timestamp", "timestamp")
          alertsStore.createIndex("crop", "crop")
        }

        if (!db.objectStoreNames.contains("weather")) {
          db.createObjectStore("weather", { keyPath: "date" })
        }

        if (!db.objectStoreNames.contains("prices")) {
          db.createObjectStore("prices", { keyPath: "date" })
        }

        if (!db.objectStoreNames.contains("farmImages")) {
          db.createObjectStore("farmImages", { keyPath: "id" })
        }
      },
    })
  }

  // Crop data methods
  async saveCrop(crop: FarmData["crops"]["value"]): Promise<void> {
    if (!this.db) return
    await this.db.put("crops", { ...crop, lastSynced: Date.now() })
  }

  async getCrop(id: string): Promise<FarmData["crops"]["value"] | undefined> {
    if (!this.db) return undefined
    return this.db.get("crops", id)
  }

  async getAllCrops(): Promise<FarmData["crops"]["value"][]> {
    if (!this.db) return []
    return this.db.getAll("crops")
  }

  // Alert methods
  async saveAlert(alert: FarmData["alerts"]["value"]): Promise<void> {
    if (!this.db) return
    await this.db.put("alerts", alert)
  }

  async getAlerts(limit = 50): Promise<FarmData["alerts"]["value"][]> {
    if (!this.db) return []
    const allAlerts = await this.db.getAll("alerts")
    return allAlerts.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  }

  async markAlertAsRead(id: string): Promise<void> {
    if (!this.db) return
    const alert = await this.db.get("alerts", id)
    if (alert) {
      alert.read = true
      await this.db.put("alerts", alert)
    }
  }

  // Weather data methods
  async saveWeather(weather: FarmData["weather"]["value"]): Promise<void> {
    if (!this.db) return
    await this.db.put("weather", weather)
  }

  async getWeather(days = 30): Promise<FarmData["weather"]["value"][]> {
    if (!this.db) return []
    return this.db.getAll("weather")
  }

  // Price data methods
  async savePrices(prices: FarmData["prices"]["value"][]): Promise<void> {
    if (!this.db) return
    for (const price of prices) {
      await this.db.put("prices", price)
    }
  }

  async getPrices(crop: string): Promise<FarmData["prices"]["value"][]> {
    if (!this.db) return []
    const all = await this.db.getAll("prices")
    return all.filter((p) => p.crop === crop)
  }

  // Farm image methods
  async saveFarmImage(image: FarmData["farmImages"]["value"]): Promise<void> {
    if (!this.db) return
    await this.db.put("farmImages", image)
  }

  async getFarmImages(cropId: string): Promise<FarmData["farmImages"]["value"][]> {
    if (!this.db) return []
    const all = await this.db.getAll("farmImages")
    return all.filter((img) => img.cropId === cropId)
  }

  // Sync status
  async getLastSyncTime(): Promise<number> {
    if (!this.db) return 0
    const crops = await this.db.getAll("crops")
    return crops.length > 0 ? Math.max(...crops.map((c) => c.lastSynced)) : 0
  }

  // Clear old data (keep last 90 days)
  async clearOldData(): Promise<void> {
    if (!this.db) return
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000

    const alerts = await this.db.getAll("alerts")
    for (const alert of alerts) {
      if (alert.timestamp < ninetyDaysAgo) {
        await this.db.delete("alerts", alert.id)
      }
    }
  }
}

export const offlineStorage = new OfflineStorage()
