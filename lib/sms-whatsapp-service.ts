"use client"

export interface AlertMessage {
  type: "sms" | "whatsapp"
  phoneNumber: string
  message: string
  timestamp: number
  status: "pending" | "sent" | "failed"
}

export class SMSWhatsAppService {
  private alerts: AlertMessage[] = []

  sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate SMS sending in browser
      const alert: AlertMessage = {
        type: "sms",
        phoneNumber,
        message,
        timestamp: Date.now(),
        status: "sent",
      }
      this.alerts.push(alert)
      console.log("[v0] SMS sent to", phoneNumber, ":", message)

      // Store in localStorage
      const stored = JSON.parse(localStorage.getItem("sms_alerts") || "[]")
      stored.push(alert)
      localStorage.setItem("sms_alerts", JSON.stringify(stored))

      resolve(true)
    })
  }

  sendWhatsApp(phoneNumber: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const alert: AlertMessage = {
        type: "whatsapp",
        phoneNumber,
        message,
        timestamp: Date.now(),
        status: "sent",
      }
      this.alerts.push(alert)
      console.log("[v0] WhatsApp sent to", phoneNumber, ":", message)

      // Store in localStorage
      const stored = JSON.parse(localStorage.getItem("whatsapp_alerts") || "[]")
      stored.push(alert)
      localStorage.setItem("whatsapp_alerts", JSON.stringify(stored))

      resolve(true)
    })
  }

  getAlerts(): AlertMessage[] {
    return this.alerts
  }
}
