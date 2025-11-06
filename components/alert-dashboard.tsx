"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Archive,
  Bell,
  Wind,
  Droplets,
  Bug,
  TrendingDown,
  MapPin,
  Calendar,
} from "lucide-react"

interface Alert {
  id: string
  type: "pest" | "weather" | "price" | "irrigation" | "frost" | "harvest"
  severity: "critical" | "high" | "medium" | "low"
  title: string
  message: string
  crop: string
  location: string
  timestamp: string
  read: boolean
  action_taken: boolean
  suggested_action: string
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "pest",
    severity: "critical",
    title: "Armyworm Outbreak Detected",
    message: "High density armyworms detected in your wheat field via drone analysis",
    crop: "wheat",
    location: "Madhya Pradesh",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    action_taken: false,
    suggested_action: "Spray chlorantraniliprole 18.5% SC at 150-200 ml/acre",
  },
  {
    id: "2",
    type: "weather",
    severity: "high",
    title: "Heavy Rain Warning",
    message: "Heavy rainfall (80-100mm) expected in next 48 hours",
    crop: "rice",
    location: "Punjab",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: false,
    action_taken: false,
    suggested_action: "Ensure proper drainage in fields; avoid pesticide application",
  },
  {
    id: "3",
    type: "price",
    severity: "medium",
    title: "Wheat Price Surge",
    message: "Wheat prices increased to ₹2,450/quintal - best time to sell",
    crop: "wheat",
    location: "National Average",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    read: true,
    action_taken: false,
    suggested_action: "Contact direct buyers in your network",
  },
  {
    id: "4",
    type: "irrigation",
    severity: "medium",
    title: "Soil Moisture Low",
    message: "Soil moisture at 45% - irrigation needed within 3-4 days",
    crop: "cotton",
    location: "Gujarat",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    action_taken: true,
    suggested_action: "Irrigate with 500-600 mm water",
  },
  {
    id: "5",
    type: "frost",
    severity: "low",
    title: "Frost Risk Alert",
    message: "Temperature may drop to 0°C in early morning hours",
    crop: "sugarcane",
    location: "Uttar Pradesh",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    read: true,
    action_taken: false,
    suggested_action: "Monitor temperature; prepare frost protection measures if needed",
  },
]

const getAlertIcon = (type: string) => {
  switch (type) {
    case "pest":
      return <Bug className="w-5 h-5" />
    case "weather":
      return <Wind className="w-5 h-5" />
    case "irrigation":
      return <Droplets className="w-5 h-5" />
    case "price":
      return <TrendingDown className="w-5 h-5" />
    case "frost":
      return <AlertTriangle className="w-5 h-5" />
    case "harvest":
      return <CheckCircle className="w-5 h-5" />
    default:
      return <AlertCircle className="w-5 h-5" />
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-300"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-300"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "low":
      return "bg-green-100 text-green-800 border-green-300"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function AlertDashboard() {
  const [allAlerts, setAllAlerts] = useState(mockAlerts)
  const [filteredAlerts, setFilteredAlerts] = useState(mockAlerts)
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    const filtered = allAlerts.filter((alert) => {
      if (activeFilter === "unread") return !alert.read
      if (activeFilter === "critical") return alert.severity === "critical"
      if (activeFilter === "archived") return false
      return true
    })
    setFilteredAlerts(filtered)
  }, [activeFilter, allAlerts])

  const unreadCount = allAlerts.filter((a) => !a.read).length
  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length

  const markAsRead = (id: string) => {
    setAllAlerts(allAlerts.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }

  const markActionTaken = (id: string) => {
    setAllAlerts(allAlerts.map((a) => (a.id === id ? { ...a, action_taken: true } : a)))
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-900">{criticalCount}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-400 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Unread Alerts</p>
              <p className="text-3xl font-bold text-blue-900">{unreadCount}</p>
            </div>
            <Bell className="w-12 h-12 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Actions Taken</p>
              <p className="text-3xl font-bold text-green-900">{allAlerts.filter((a) => a.action_taken).length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({criticalCount})</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No alerts found</p>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-4 border-l-4 transition-all ${getSeverityColor(alert.severity)} ${!alert.read ? "bg-opacity-20" : "bg-opacity-10"}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      </div>
                      {!alert.read && <Badge className="bg-blue-500 flex-shrink-0">New</Badge>}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {alert.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {alert.crop}
                      </Badge>
                    </div>

                    {/* Suggested Action */}
                    <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-md border border-current border-opacity-20">
                      <p className="text-sm font-medium mb-1">Recommended Action:</p>
                      <p className="text-sm">{alert.suggested_action}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {!alert.read && (
                        <Button size="sm" variant="outline" onClick={() => markAsRead(alert.id)}>
                          Mark as Read
                        </Button>
                      )}
                      {!alert.action_taken && (
                        <Button size="sm" onClick={() => markActionTaken(alert.id)}>
                          Action Taken
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Archive className="w-4 h-4 mr-1" />
                        Archive
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Alert Settings */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Alert Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">SMS Alerts</label>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">WhatsApp Alerts</label>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Email Alerts</label>
            <input type="checkbox" className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">In-app Notifications</label>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        </div>
      </Card>
    </div>
  )
}
