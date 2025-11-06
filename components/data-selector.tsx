"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const countries = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
]

const crops = ["wheat", "rice", "corn", "soybeans"]

export function DataSelector({
  selectedCountry,
  selectedCrop,
  onCountryChange,
  onCropChange,
}: {
  selectedCountry: string
  selectedCrop: string
  onCountryChange: (value: string) => void
  onCropChange: (value: string) => void
}) {
  return (
    <Card className="p-4 bg-muted">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Country</label>
          <Select value={selectedCountry} onValueChange={onCountryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Crop</label>
          <Select value={selectedCrop} onValueChange={onCropChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (
                <SelectItem key={crop} value={crop}>
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
