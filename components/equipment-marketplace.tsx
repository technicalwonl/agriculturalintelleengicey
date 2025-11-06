"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Calendar } from "lucide-react"

interface Equipment {
  id: string
  name: string
  type: string
  hourly_rate: number
  daily_rate: number
  location: string
  rating: number
  reviews_count: number
  images: string[]
}

const mockEquipment: Equipment[] = [
  {
    id: "1",
    name: "John Deere Tractor 5310",
    type: "tractor",
    hourly_rate: 500,
    daily_rate: 3000,
    location: "Madhya Pradesh",
    rating: 4.8,
    reviews_count: 42,
    images: ["/classic-red-tractor.png"],
  },
  {
    id: "2",
    name: "Combine Harvester CAT",
    type: "harvester",
    hourly_rate: 800,
    daily_rate: 5000,
    location: "Punjab",
    rating: 4.6,
    reviews_count: 28,
    images: ["/vintage-wheat-harvester.png"],
  },
  {
    id: "3",
    name: "Power Sprayer 2000L",
    type: "sprayer",
    hourly_rate: 200,
    daily_rate: 1000,
    location: "Maharashtra",
    rating: 4.9,
    reviews_count: 15,
    images: ["/sprayer.jpg"],
  },
]

export function EquipmentMarketplace() {
  const [searchType, setSearchType] = useState("")
  const [filteredEquipment, setFilteredEquipment] = useState(mockEquipment)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  const handleSearch = (type: string) => {
    setSearchType(type)
    if (type === "") {
      setFilteredEquipment(mockEquipment)
    } else {
      setFilteredEquipment(mockEquipment.filter((eq) => eq.type === type))
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="grid grid-cols-4 gap-3">
        {["tractor", "harvester", "sprayer", "All"].map((type) => (
          <Button
            key={type}
            onClick={() => handleSearch(type === "All" ? "" : type)}
            variant={searchType === (type === "All" ? "" : type) ? "default" : "outline"}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((equipment) => (
          <Card key={equipment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted overflow-hidden">
              <img
                src={equipment.images[0] || "/placeholder.svg"}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold line-clamp-2">{equipment.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {equipment.location}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 text-sm">
                <span className="text-yellow-500">★ {equipment.rating}</span>
                <span className="text-muted-foreground">({equipment.reviews_count} reviews)</span>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>₹{equipment.hourly_rate}/hr</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>₹{equipment.daily_rate}/day</span>
                </div>
              </div>

              <Button className="w-full" onClick={() => setSelectedEquipment(equipment)}>
                Rent Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
