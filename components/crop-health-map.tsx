"use client"

import { useEffect, useState } from "react"
import { apiClient, type CropHealthTile } from "./api-client"
import { Spinner } from "@/components/ui/spinner"

export function CropHealthMap({ country, crop }: { country: string; crop: string }) {
  const [tiles, setTiles] = useState<CropHealthTile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await apiClient.getCropHealth(country, crop)
        setTiles(data.tiles)
      } catch (error) {
        console.error("Error fetching crop health:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [country, crop])

  const getColor = (ndvi: number) => {
    if (ndvi > 0.7) return "#22c55e"
    if (ndvi > 0.6) return "#eab308"
    return "#ef4444"
  }

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tiles.map((tile) => (
          <div
            key={tile.region}
            className="p-3 rounded border-2 text-center transition-all hover:shadow-lg"
            style={{ borderColor: getColor(tile.ndvi_value), backgroundColor: `${getColor(tile.ndvi_value)}15` }}
          >
            <p className="text-sm font-semibold">{tile.region}</p>
            <p className="text-xs text-muted-foreground">NDVI: {tile.ndvi_value.toFixed(2)}</p>
            <p className="text-xs mt-1 font-medium">
              {tile.ndvi_value > 0.7 ? "✓ Healthy" : tile.ndvi_value > 0.6 ? "⚠ Fair" : "⚠ Poor"}
            </p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>Healthy (&gt;0.7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded" />
          <span>Fair (0.6-0.7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span>Poor (&lt;0.6)</span>
        </div>
      </div>
    </div>
  )
}
