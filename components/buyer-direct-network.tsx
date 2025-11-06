"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Phone, MessageCircle } from "lucide-react"

interface Buyer {
  id: string
  name: string
  type: "Wholesaler" | "Exporter" | "Business"
  crops: string[]
  location: string
  minPrice: number
  maxPrice: number
  rating: number
  reviews: number
  contactPhone: string
}

const buyersDatabase: Buyer[] = [
  {
    id: "1",
    name: "Agro Export Ltd",
    type: "Exporter",
    crops: ["wheat", "rice", "sugarcane"],
    location: "Punjab",
    minPrice: 2200,
    maxPrice: 2400,
    rating: 4.8,
    reviews: 342,
    contactPhone: "+91-9876543210",
  },
  {
    id: "2",
    name: "Fresh Produce Wholesale",
    type: "Wholesaler",
    crops: ["cotton", "sugarcane", "rice"],
    location: "Maharashtra",
    minPrice: 1800,
    maxPrice: 2000,
    rating: 4.5,
    reviews: 215,
    contactPhone: "+91-9765432109",
  },
  {
    id: "3",
    name: "Bio Foods International",
    type: "Business",
    crops: ["rice", "wheat", "maize"],
    location: "Uttar Pradesh",
    minPrice: 2100,
    maxPrice: 2350,
    rating: 4.7,
    reviews: 189,
    contactPhone: "+91-9654321098",
  },
]

interface BuyerDirectNetworkProps {
  selectedCrop?: string
  selectedRegion?: string
}

export function BuyerDirectNetwork({ selectedCrop, selectedRegion }: BuyerDirectNetworkProps) {
  const filteredBuyers = selectedCrop ? buyersDatabase.filter((b) => b.crops.includes(selectedCrop)) : buyersDatabase

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Direct Buyer Connections</h3>
      <p className="text-sm text-muted-foreground">Eliminate middlemen. Connect directly with verified buyers.</p>

      <div className="grid gap-3">
        {filteredBuyers.map((buyer) => (
          <Card key={buyer.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-base">{buyer.name}</h4>
                  <p className="text-xs text-muted-foreground">{buyer.type}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{buyer.rating}</span>
                  <span className="text-xs text-muted-foreground">({buyer.reviews})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {buyer.location}
                </div>
                <div>
                  <p className="text-muted-foreground">Price Range</p>
                  <p className="font-semibold">
                    ₹{buyer.minPrice}-₹{buyer.maxPrice}/qt
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 text-xs">
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
