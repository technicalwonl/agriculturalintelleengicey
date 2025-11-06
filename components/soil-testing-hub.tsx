"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, DollarSign } from "lucide-react"

interface Lab {
  lab_id: string
  name: string
  location: string
  tests_offered: string[]
  turnaround_days: number
  cost: { [key: string]: number }
}

const mockLabs: Lab[] = [
  {
    lab_id: "lab_1",
    name: "Punjab Agricultural University Soil Lab",
    location: "Ludhiana, Punjab",
    tests_offered: ["NPK", "pH", "organic_matter", "micronutrients"],
    turnaround_days: 5,
    cost: { NPK: 200, pH: 100, organic_matter: 150, micronutrients: 300 },
  },
  {
    lab_id: "lab_2",
    name: "ICAR Soil Testing Lab Delhi",
    location: "New Delhi",
    tests_offered: ["NPK", "pH", "organic_matter", "pesticide_residue"],
    turnaround_days: 7,
    cost: { NPK: 250, pH: 100, organic_matter: 200, pesticide_residue: 500 },
  },
  {
    lab_id: "lab_3",
    name: "Village Level Soil Testing Kit Center",
    location: "Indore, Madhya Pradesh",
    tests_offered: ["NPK", "pH"],
    turnaround_days: 1,
    cost: { NPK: 50, pH: 25 },
  },
]

export function SoilTestingHub() {
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [selectedLab, setSelectedLab] = useState<string | null>(null)

  const allTests = ["NPK", "pH", "organic_matter", "micronutrients", "pesticide_residue"]

  const handleTestToggle = (test: string) => {
    setSelectedTests((prev) => (prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]))
  }

  const calculateCost = (lab: Lab) => {
    return selectedTests.reduce((total, test) => total + (lab.cost[test] || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Test Selection */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Select Tests</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {allTests.map((test) => (
            <Button
              key={test}
              onClick={() => handleTestToggle(test)}
              variant={selectedTests.includes(test) ? "default" : "outline"}
              size="sm"
              className="capitalize"
            >
              {test.replace("_", " ")}
            </Button>
          ))}
        </div>
      </Card>

      {/* Available Labs */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Available Testing Labs</h3>
        {mockLabs.map((lab) => (
          <Card
            key={lab.lab_id}
            className={`p-4 cursor-pointer transition-all ${selectedLab === lab.lab_id ? "border-blue-500 border-2" : "hover:shadow-md"}`}
            onClick={() => setSelectedLab(lab.lab_id)}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Lab Info */}
              <div className="space-y-2">
                <h4 className="font-semibold">{lab.name}</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {lab.location}
                </div>
              </div>

              {/* Tests Offered */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Tests Available</p>
                <div className="flex flex-wrap gap-1">
                  {lab.tests_offered.map((test) => (
                    <Badge
                      key={test}
                      variant={selectedTests.includes(test) ? "default" : "outline"}
                      className="capitalize"
                    >
                      {test.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Turnaround */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{lab.turnaround_days} day result</span>
              </div>

              {/* Cost & Action */}
              <div className="flex flex-col items-end justify-between">
                {selectedTests.length > 0 && (
                  <div className="flex items-center gap-1 font-semibold">
                    <DollarSign className="w-4 h-4" />₹{calculateCost(lab)}
                  </div>
                )}
                <Button size="sm" disabled={selectedTests.length === 0}>
                  Book Test
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
