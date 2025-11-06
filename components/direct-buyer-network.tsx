"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Phone, MapPin } from "lucide-react"

interface Buyer {
  id: string
  name: string
  location: string
  crop: string
  quantity_needed: number
  unit: string
  price_range_min: number
  price_range_max: number
  phone: string
}

const mockBuyers: Buyer[] = [
  {
    id: "1",
    name: "Fresh Foods Pvt Ltd",
    location: "Delhi",
    crop: "wheat",
    quantity_needed: 500,
    unit: "quintal",
    price_range_min: 2000,
    price_range_max: 2200,
    phone: "+91-9876543210",
  },
  {
    id: "2",
    name: "Agro Exports India",
    location: "Gujarat",
    crop: "rice",
    quantity_needed: 1000,
    unit: "quintal",
    price_range_min: 2500,
    price_range_max: 2800,
    phone: "+91-9123456789",
  },
  {
    id: "3",
    name: "Organic Wholesale Co",
    location: "Karnataka",
    crop: "cotton",
    quantity_needed: 200,
    unit: "ton",
    price_range_min: 5000,
    price_range_max: 5500,
    phone: "+91-8765432109",
  },
]

export function DirectBuyerNetwork() {
  const [selectedCrop, setSelectedCrop] = useState("")
  const [filteredBuyers, setFilteredBuyers] = useState(mockBuyers)

  const handleCropFilter = (crop: string) => {
    setSelectedCrop(crop)
    if (crop === "") {
      setFilteredBuyers(mockBuyers)
    } else {
      setFilteredBuyers(mockBuyers.filter((b) => b.crop === crop))
    }
  }

  return (
    <div className="space-y-6">
      {/* Crop Filter */}
      <div className="flex gap-2 flex-wrap">
        {["wheat", "rice", "cotton", "All"].map((crop) => (
          <Button
            key={crop}
            onClick={() => handleCropFilter(crop === "All" ? "" : crop)}
            variant={selectedCrop === (crop === "All" ? "" : crop) ? "default" : "outline"}
            size="sm"
          >
            {crop}
          </Button>
        ))}
      </div>

      {/* Buyers List */}
      <div className="space-y-4">
        {filteredBuyers.map((buyer) => (
          <Card key={buyer.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Buyer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{buyer.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {buyer.location}
                </div>
                <Badge variant="outline">{buyer.crop.toUpperCase()}</Badge>
              </div>

              {/* Requirements */}
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Quantity:</span> {buyer.quantity_needed} {buyer.unit}
                </p>
                <p>
                  <span className="font-semibold">Price Range:</span> ₹{buyer.price_range_min} - ₹
                  {buyer.price_range_max}
                </p>
                <p className="text-green-600 font-medium">Current Market: ₹2150</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button className="gap-2" variant="default" size="sm">
                  <MessageCircle className="w-4 h-4" />
                  Connect
                </Button>
                <Button className="gap-2 bg-transparent" variant="outline" size="sm">
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBuyers.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No buyers found for {selectedCrop}. Check back soon!</p>
        </Card>
      )}
    </div>
  )
}
