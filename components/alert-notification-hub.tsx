"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SMSWhatsAppService } from "@/lib/sms-whatsapp-service"
import { MessageCircle, PhoneForwarded, AlertCircle } from "lucide-react"

interface Alert {
  id: string
  type: "pest" | "weather" | "irrigation" | "price" | "harvest"
  title: string
  message: string
  severity: "critical" | "high" | "medium" | "low"
  timestamp: number
}

export function AlertNotificationHub() {
  const smsService = new SMSWhatsAppService()

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "pest",
      title: "Armyworm Risk High",
      message: "Pest pressure is high in your region. Scout fields immediately.",
      severity: "critical",
      timestamp: Date.now(),
    },
    {
      id: "2",
      type: "weather",
      title: "Heavy Rain Predicted",
      message: "Heavy rainfall (80mm) expected in next 48 hours. Plan harvest carefully.",
      severity: "high",
      timestamp: Date.now() - 3600000,
    },
    {
      id: "3",
      type: "irrigation",
      title: "Irrigation Needed",
      message: "Soil moisture below 40%. Schedule irrigation within 24 hours.",
      severity: "medium",
      timestamp: Date.now() - 7200000,
    },
  ])

  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)
  const [sendingTo, setSendingTo] = useState<string | null>(null)

  const handleSendSMS = async (alertId: string) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid phone number")
      return
    }
    setSendingTo(`sms-${alertId}`)
    const foundAlert = alerts.find((a) => a.id === alertId)
    if (foundAlert) {
      await smsService.sendSMS(phoneNumber, `[FARM ALERT] ${foundAlert.title}: ${foundAlert.message}`)
      setTimeout(() => setSendingTo(null), 2000)
    }
  }

  const handleSendWhatsApp = async (alertId: string) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid phone number")
      return
    }
    setSendingTo(`whatsapp-${alertId}`)
    const foundAlert = alerts.find((a) => a.id === alertId)
    if (foundAlert) {
      await smsService.sendWhatsApp(phoneNumber, `🚨 *FARM ALERT* 🚨\n*${foundAlert.title}*\n\n${foundAlert.message}`)
      setTimeout(() => setSendingTo(null), 2000)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-900 border-red-700 text-red-100"
      case "high":
        return "bg-orange-900 border-orange-700 text-orange-100"
      case "medium":
        return "bg-yellow-900 border-yellow-700 text-yellow-100"
      case "low":
        return "bg-blue-900 border-blue-700 text-blue-100"
      default:
        return "bg-gray-900 border-gray-700"
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Send Alerts via SMS/WhatsApp</h3>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter phone number (10 digits)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            maxLength={15}
            className="flex-1"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`p-3 border ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <h4 className="font-semibold">{alert.title}</h4>
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendSMS(alert.id)}
                    disabled={sendingTo === `sms-${alert.id}`}
                    className="text-xs"
                  >
                    <PhoneForwarded className="w-3 h-3 mr-1" />
                    SMS
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendWhatsApp(alert.id)}
                    disabled={sendingTo === `whatsapp-${alert.id}`}
                    className="text-xs"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}
